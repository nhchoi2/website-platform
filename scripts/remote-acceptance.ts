// Explicit opt-in only. Uses real Supabase Auth/Storage and the running application.
// Credentials are written to an ignored, mode-0600 local file and never printed.
import { createClient } from '@supabase/supabase-js';
import { websocketTransport } from '../lib/websocket';
import http from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { emptyContent } from '../lib/content';
import type { Site, Asset, SiteDetail, Submission } from '../lib/types';
const opts = {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: websocketTransport },
};
const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, opts);
const file = '.test-data/remote-accounts.json';
type Account = { id: string; email: string; password: string };
if (process.argv[2] === 'prepare') {
  await mkdir('.test-data', { recursive: true });
  let existing = false;
  try {
    await readFile(file);
    existing = true;
  } catch {}
  if (existing)
    throw new Error('Existing acceptance accounts found; reuse them, do not create duplicates.');
  const accounts: Account[] = [];
  for (const role of ['customer-a', 'customer-b', 'operator']) {
    const email = `qa-${role}-${Date.now()}@example.com`;
    const password = randomBytes(24).toString('base64url');
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { purpose: 'website-platform acceptance test' },
    });
    if (error || !data.user) throw error || new Error('Create user failed');
    accounts.push({ id: data.user.id, email, password });
  }
  await writeFile(file, JSON.stringify(accounts), { mode: 0o600 });
  console.log(`Created three isolated QA accounts. Grant operator role to UUID: ${accounts[2].id}`);
} else if (process.argv[2] === 'run') {
  const accounts = JSON.parse(await readFile(file, 'utf8')) as Account[];
  const base = process.env.TEST_APP_URL || 'http://127.0.0.1:3000';
  const host = new URL(base).host;
  async function login(account: Account) {
    const response = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });
    assert.equal(response.status, 200, `Login failed: ${await response.clone().text()}`);
    const cookie = response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    assert.ok(cookie);
    return cookie;
  }
  const cookies = await Promise.all(accounts.map(login));
  const clients = accounts.map(() => createClient(url, key, opts));
  for (let i = 0; i < clients.length; i++) {
    const { error } = await clients[i].auth.signInWithPassword(accounts[i]);
    assert.equal(error, null);
  }
  async function post<T>(path: string, body: unknown, index = 0, expected = 200): Promise<T> {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        Origin: base,
        Cookie: cookies[index],
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    const data = await response.json();
    assert.equal(response.status, expected, `${path}: ${JSON.stringify(data)}`);
    return data as T;
  }
  const slug = `qa-a-${Date.now()}`;
  let a = await post<Site>('/api/sites', { slug, template: 'hyehwa' });
  const b = await post<Site>('/api/sites', { slug: `qa-b-${Date.now()}`, template: 'hyehwa' }, 1);
  const getDetail = async () => {
    const result = await clients[0].rpc('get_site_detail', { p_site: a.id });
    assert.equal(result.error, null);
    return result.data as SiteDetail;
  };
  a = (await getDetail()).site;
  const initialPublished = a.published_revision;
  const privateText = `제출 후 비공개 ${Date.now()}`;
  const name = '검증용 A 식당';
  a = await post(`/api/sites/${a.id}/save`, {
    version: a.draft_version,
    content: {
      ...emptyContent(),
      name,
      address: '서울시 검증용 주소',
      phone: '02-000-0000',
      tagline: '승인할 고정 문구',
    },
  });
  await post(`/api/sites/${a.id}/save`, { version: a.draft_version, content: a.draft }, 1, 403);
  assert.equal((await clients[1].from('sites').select('id').eq('id', a.id)).data?.length, 0);
  assert.equal((await clients[0].from('sites').select('id').eq('id', b.id)).data?.length, 0);
  const image = await sharp({
    create: { width: 120, height: 80, channels: 3, background: '#8b9c74' },
  })
    .png()
    .toBuffer();
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(image)], { type: 'image/png' }), 'acceptance.png');
  const asset = await post<Asset>(`/api/sites/${a.id}/upload`, form);
  const image2 = new FormData();
  image2.set('file', new Blob([new Uint8Array(image)], { type: 'image/png' }), 'replacement.png');
  const replacement = await post<Asset>(`/api/sites/${a.id}/upload`, image2);
  a = await post(`/api/sites/${a.id}/save`, {
    version: a.draft_version,
    content: {
      ...a.draft,
      photos: [
        { id: randomUUID(), assetId: replacement.id, alt: '교체한 메인 사진' },
        { id: randomUUID(), assetId: asset.id, alt: '순서를 바꾼 사진' },
      ],
      menus: [
        {
          id: randomUUID(),
          name: '대표 검증 메뉴',
          price: '18,000원',
          category: '구이',
          description: '설명',
          imageId: asset.id,
          featured: true,
        },
      ],
    },
  });
  assert.equal(
    (await clients[1].storage.from('restaurant-images').download(asset.path)).data,
    null,
  );
  assert.ok((await clients[0].storage.from('restaurant-images').download(asset.path)).data);
  assert.equal((await fetch(`${base}/api/media/${asset.id}`)).status, 404);
  assert.equal(
    (
      await fetch(`${base}/api/media/${asset.id}?private=1&site=${a.id}`, {
        headers: { Cookie: cookies[1] },
      })
    ).status,
    404,
  );
  assert.equal(
    (await fetch(`${base}/preview/${a.id}`, { headers: { Cookie: cookies[1] } })).status,
    404,
  );
  const requestKey = randomUUID();
  const sub = await post<Submission>(`/api/sites/${a.id}/submit`, {
    version: a.draft_version,
    key: requestKey,
  });
  const again = await post<Submission>(`/api/sites/${a.id}/submit`, {
    version: a.draft_version,
    key: requestKey,
  });
  assert.equal(sub.id, again.id);
  a = await post(`/api/sites/${a.id}/save`, {
    version: a.draft_version,
    content: { ...a.draft, tagline: privateText },
  });
  if (!initialPublished) assert.equal((await fetch(`${base}/s/${a.slug}`)).status, 404);
  else assert.equal((await getDetail()).site.published_revision, initialPublished);
  const publishKey = randomUUID();
  const review = {
    submission: sub.id,
    revision: sub.revision_id,
    action: 'approve',
    feedback: '',
    key: publishKey,
  };
  await post(`/api/admin/sites/${a.id}/review`, review, 0, 403);
  await post(`/api/admin/sites/${a.id}/review`, review, 2);
  await post(`/api/admin/sites/${a.id}/review`, review, 2);
  const publicHtml = await (await fetch(`${base}/s/${a.slug}`)).text();
  assert.ok(publicHtml.includes('승인할 고정 문구'));
  assert.ok(!publicHtml.includes(privateText));
  assert.equal((await fetch(`${base}/api/media/${asset.id}`)).status, 200);
  cookies[0] = await login(accounts[0]);
  assert.ok(
    (await (await fetch(`${base}/dashboard`, { headers: { Cookie: cookies[0] } })).text()).includes(
      privateText,
    ),
  );
  const next = await post<Submission>(`/api/sites/${a.id}/submit`, {
    version: a.draft_version,
    key: randomUUID(),
  });
  await post(
    `/api/admin/sites/${a.id}/review`,
    {
      submission: next.id,
      revision: next.revision_id,
      action: 'approve',
      feedback: '',
      key: randomUUID(),
    },
    2,
  );
  await post(
    `/api/admin/sites/${a.id}/restore`,
    { revision: sub.revision_id, expected: next.revision_id, key: randomUUID() },
    2,
  );
  assert.equal((await getDetail()).site.published_revision, sub.revision_id);
  const domainName = `qa-${a.id}.example.com`;
  await post(
    `/api/admin/sites/${a.id}/domain`,
    {
      hostname: domainName,
      status: 'connected',
      expires: '2027-10-02',
      notes: '검증용 도메인; 실제 DNS 연결 아님',
    },
    2,
  );
  // Node 20 fetch ignores the Host override; use raw HTTP for virtual-host checks.
  const hostGet = (route: string, targetHost: string) =>
    new Promise<{ status: number; text: string }>((resolve, reject) => {
      http
        .get(`${base}${route}`, { headers: { Host: targetHost } }, (response) => {
          let text = '';
          response.on('data', (chunk) => {
            text += chunk;
          });
          response.on('end', () => resolve({ status: response.statusCode || 0, text }));
        })
        .on('error', reject);
    });
  const hostPage = await hostGet('/', domainName);
  assert.equal(hostPage.status, 200);
  assert.ok(hostPage.text.includes(name));
  assert.equal((await hostGet(`/s/${b.slug}`, domainName)).status, 404);
  assert.equal((await hostGet('/', 'unregistered.example.com')).status, 404);
  assert.equal(
    (
      await fetch(`${base}/api/sites`, {
        method: 'POST',
        headers: {
          Origin: 'https://evil.example',
          Cookie: cookies[0],
          'Content-Type': 'application/json',
        },
        body: '{}',
      })
    ).status,
    403,
  );
  const archive = await fetch(`${base}/api/admin/sites/${a.id}/export`, {
    headers: { Cookie: cookies[2] },
  });
  assert.equal(archive.status, 200);
  const bytes = new Uint8Array(await archive.arrayBuffer());
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  await post('/api/auth/logout', {}, 0);
  assert.equal(
    (
      await fetch(`${base}/api/sites/${a.id}/save`, {
        method: 'POST',
        headers: { Origin: base, 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).status,
    401,
  );
  await writeFile(
    '.test-data/remote-result.json',
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        app: host,
        site: a.id,
        slug: a.slug,
        status: 'passed',
        scope:
          'real Supabase Auth/DB/Storage plus application HTTP routes; outbound email excluded',
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: real Auth login/logout, durable drafts, two-tenant DB/storage isolation, image upload/replacement/order, frozen submission, idempotent publish, exact public snapshot, restore, domain isolation, CSRF, ZIP export. Email delivery not tested.',
  );
} else throw new Error('Use prepare or run. Only run against the explicitly selected project.');
