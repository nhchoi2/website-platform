// Full HTTP workflow against an isolated local DB. No real customer data or email.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalDatabase } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { legalAcceptance } from '../lib/legal';
import { emptyContent, type Content } from '../lib/content';
import type { Site, Asset, Submission } from '../lib/types';
import type { Project, ProjectFile } from '../lib/projects';
import { templateCatalog } from '../templates/catalog/catalog';
const port = 3017,
  host = `127.0.0.1:${port}`,
  base = `http://${host}`;
const dir = await mkdtemp(join(tmpdir(), 'koofy-managed-http-'));
const db = await createLocalDatabase(dir),
  password = randomUUID() + 'Aa1!';
const customer = await localRegister(db, 'managed-http@test.invalid', password, legalAcceptance);
await localRegister(db, 'other-http@test.invalid', password, legalAcceptance);
const admin = await localRegister(db, 'admin-http@test.invalid', password, legalAcceptance);
await db.query('insert into admin_users values($1)', [admin]);
await db.close();
const env: NodeJS.ProcessEnv = {
  ...process.env,
  APP_MODE: 'local',
  APP_URL: base,
  PLATFORM_HOSTS: host,
  LOCAL_DATA_DIR: dir,
};
delete env.VERCEL;
delete env.VERCEL_ENV;
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
  { env, stdio: ['ignore', 'pipe', 'pipe'] },
);
let logs = '';
server.stdout.on('data', (d) => (logs += d));
server.stderr.on('data', (d) => (logs += d));
function http(
  path: string,
  {
    cookie = '',
    body,
    method,
    tenant,
  }: { cookie?: string; body?: unknown; method?: string; tenant?: string } = {},
) {
  return new Promise<{ status: number; body: string; headers: Record<string, unknown> }>(
    (resolve, reject) => {
      const encoded = body === undefined ? undefined : JSON.stringify(body);
      const req = request(
        base + path,
        {
          method: method || (body ? 'POST' : 'GET'),
          headers: {
            host: tenant || host,
            cookie,
            ...(encoded
              ? {
                  origin: base,
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(encoded),
                }
              : {}),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (x) => chunks.push(x));
          res.on('end', () =>
            resolve({
              status: res.statusCode || 0,
              body: Buffer.concat(chunks).toString(),
              headers: res.headers,
            }),
          );
        },
      );
      req.on('error', reject);
      if (encoded) req.write(encoded);
      req.end();
    },
  );
}
async function json<T>(path: string, cookie: string, body?: unknown) {
  const r = await http(path, { cookie, body });
  assert.equal(r.status, 200, `${path}: ${r.body.slice(0, 500)}`);
  return JSON.parse(r.body) as T;
}
async function login(email: string) {
  const r = await http('/api/auth/login', { body: { email, password } });
  assert.equal(r.status, 200);
  return (r.headers['set-cookie'] as string[]).map((x) => x.split(';')[0]).join('; ');
}
async function upload<T>(
  url: string,
  cookie: string,
  name: string,
  bytes: Buffer,
  type: string,
  consent = false,
) {
  const form = new FormData();
  form.set('file', new File([new Uint8Array(bytes)], name, { type }));
  if (consent) form.set('consent', 'true');
  const res = await fetch(base + url, {
    method: 'POST',
    headers: { cookie, origin: base },
    body: form,
  });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  return data as T;
}
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await http('/')).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, logs);
  const ac = await login('admin-http@test.invalid'),
    cc = await login('managed-http@test.invalid'),
    bc = await login('other-http@test.invalid');
  assert.equal((await http('/admin/projects', { cookie: bc })).status, 404);
  assert.equal((await http('/dashboard/projects')).status, 307);
  const receipt = await json<{ id: string }>('/api/inquiries', cc, {
    key: randomUUID(),
    name: 'HTTP 테스트 고객',
    business: '실제 테스트 카페',
    method: 'email',
    contact: 'managed-http@test.invalid',
    message: '카페 홈페이지 제작 상담 테스트입니다.',
    template: 'cafe',
    query: 'pages=4&features=gallery,news,kakao&nav=center&mobileNav=hamburger',
    consent: true,
    consentVersion: 'consultation-2026-10-03',
    website: '',
  });
  const content: Content = {
    ...emptyContent(),
    template: 'cafe',
    layout: 'catalog',
    name: 'HTTP 고객 카페',
    address: '서울 테스트 주소',
    phone: '02-111-2222',
    tagline: 'CUSTOMER-PUBLISHED',
    introduction: '실제 고객 소개입니다.',
    serviceLabel: '카페 메뉴',
    options: {
      pages: 4,
      nav: 'center',
      mobileNav: 'hamburger',
      features: ['gallery', 'news', 'kakao', 'faq', 'team', 'schedule', 'process', 'notice'],
      links: { kakao: 'https://pf.kakao.com/test' },
    },
    notice: '승인된 상단 안내',
    faq: [{ id: randomUUID(), question: '주차가 되나요?', answer: '주차 안내 테스트' }],
    team: [],
    schedule: [{ day: '월', hours: '10시부터 19시' }],
    process: [{ id: randomUUID(), title: '문의', description: '전화로 문의하세요.' }],
    posts: [
      {
        id: randomUUID(),
        title: 'PUBLIC-POST',
        body: '고객이 직접 작성한 공지입니다.',
        date: '2026-10-03',
        attachments: [],
      },
    ],
  };
  let site = await json<Site>('/api/sites', ac, {
    owner: customer,
    slug: 'http-customer',
    template: 'cafe',
    content,
  });
  assert.equal(
    (
      await http('/api/sites', {
        cookie: bc,
        body: { owner: customer, slug: 'forbidden-owner', template: 'cafe' },
      })
    ).status,
    403,
  );
  const project = await json<Project>('/api/projects', ac, {
    inquiry: receipt.id,
    customer,
    site: site.id,
  });
  await json(`/api/projects/${project.id}/update`, ac, {
    version: project.version,
    stage: 'materials',
    message: '사진과 메뉴를 전달해 주세요.',
    quote: { setup: 390000, extras: 110000, monthly: 44000, scope: '4페이지 및 공지, 부가세 포함' },
  });
  assert.match(
    (await http(`/dashboard/projects/${project.id}`, { cookie: cc })).body,
    /사진과 메뉴/,
  );
  assert.equal((await http(`/dashboard/projects/${project.id}`, { cookie: bc })).status, 404);
  const photo = await upload<Asset>(
    `/api/sites/${site.id}/upload`,
    ac,
    'photo.webp',
    await readFile('public/template-images/cafe-small.webp'),
    'image/webp',
  );
  const document = await upload<Asset>(
    `/api/sites/${site.id}/upload`,
    cc,
    'notice.pdf',
    Buffer.from('%PDF-1.4\nfixture document\n%%EOF'),
    'application/pdf',
  );
  const file = await upload<ProjectFile>(
    `/api/projects/${project.id}/upload`,
    cc,
    '자료.pdf',
    Buffer.from('%PDF-1.4\nprivate fixture\n%%EOF'),
    'application/pdf',
    true,
  );
  assert.equal(
    (await http(`/api/project-files/${file.id}?project=${project.id}`, { cookie: cc })).status,
    200,
  );
  assert.equal(
    (await http(`/api/project-files/${file.id}?project=${project.id}`, { cookie: bc })).status,
    404,
  );
  assert.equal((await http(`/api/project-files/${file.id}?project=${project.id}`)).status, 404);
  content.photos = [{ id: randomUUID(), assetId: photo.id, alt: '고객 제공 테스트 사진' }];
  content.logoId = photo.id;
  content.iconId = photo.id;
  content.posts![0].attachments = [document.id];
  site = await json<Site>(`/api/sites/${site.id}/save`, ac, {
    version: site.draft_version,
    content,
  });
  assert.equal((await http(`/api/media/${photo.id}`)).status, 404);
  const preview = await http(`/preview/${site.id}/services?embed=1`, { cookie: cc });
  assert.equal(preview.status, 200);
  assert.match(preview.body, /PUBLIC-POST/);
  assert.doesNotMatch(preview.body, /AI 생성 예시/);
  const sub = await json<Submission>(`/api/sites/${site.id}/submit`, ac, {
    version: site.draft_version,
    key: randomUUID(),
  });
  site = await json<Site>(`/api/sites/${site.id}/save`, cc, {
    version: site.draft_version,
    content: {
      ...content,
      tagline: 'DRAFT-MUST-NOT-BE-PUBLIC',
      posts: [{ ...content.posts![0], title: 'PRIVATE-DRAFT-POST' }],
    },
  });
  await json(`/api/admin/sites/${site.id}/review`, ac, {
    submission: sub.id,
    revision: sub.revision_id,
    action: 'approve',
    feedback: '',
    key: randomUUID(),
  });
  for (const page of ['', '/about', '/services', '/visit']) {
    const r = await http('/s/http-customer' + page);
    assert.equal(r.status, 200);
    assert.match(r.body, /CUSTOMER-PUBLISHED/);
    assert.doesNotMatch(
      r.body,
      /DRAFT-MUST-NOT-BE-PUBLIC|PRIVATE-DRAFT-POST|AI 생성 예시|실제 매장 주소가 들어갑니다/,
    );
  }
  assert.equal(
    (await http(`/api/media/${document.id}`)).headers['content-type'],
    'application/pdf',
  );
  await json(`/api/admin/sites/${site.id}/domain`, ac, {
    hostname: 'managed.local.test',
    status: 'connected',
    expires: null,
    notes: '테스트 전용 도메인',
  });
  for (const page of ['/', '/about', '/services', '/visit'])
    assert.equal((await http(page, { tenant: 'managed.local.test' })).status, 200);
  assert.equal((await http('/services', { tenant: 'unknown.local.test' })).status, 404);
  assert.equal((await http('/admin', { tenant: 'managed.local.test', cookie: ac })).status, 404);
  assert.equal(
    (await http(`/api/media/${photo.id}`, { tenant: 'unknown.local.test' })).status,
    404,
  );
  const evidence = await json<{ id: string }>('/api/evidence', cc, {
    project: project.id,
    key: randomUUID(),
    kind: 'cash_personal',
    identifierType: 'phone',
    identifier: '01012345678',
    name: '테스트',
    email: 'managed-http@test.invalid',
    consent: true,
  });
  assert.ok(evidence.id);
  assert.equal((await http('/dashboard/evidence', { cookie: cc })).status, 200);
  assert.doesNotMatch((await http('/dashboard/evidence', { cookie: bc })).body, /01012345678/);
  // All designs use saved customer content and real multi-page routes, not catalog examples.
  for (const t of templateCatalog) {
    site = await json<Site>(`/api/sites/${site.id}/save`, cc, {
      version: site.draft_version,
      content: { ...content, template: t.slug as Content['template'] },
    });
    const s = await json<Submission>(`/api/sites/${site.id}/submit`, cc, {
      version: site.draft_version,
      key: randomUUID(),
    });
    await json(`/api/admin/sites/${site.id}/review`, ac, {
      submission: s.id,
      revision: s.revision_id,
      action: 'approve',
      feedback: '',
      key: randomUUID(),
    });
    for (const page of ['', '/about', '/services', '/visit']) {
      const r = await http('/s/http-customer' + page);
      assert.equal(r.status, 200, `${t.slug}${page}`);
      assert.match(r.body, /HTTP 고객 카페/);
      assert.doesNotMatch(r.body, /AI 생성 예시/);
    }
  }
  console.log(
    'PASS: HTTP login → consultation → operator creation → progress/quote → private files → logo/PDF notices → frozen review → 7 designs × 4 pages → exact tenant routing → evidence request',
  );
} catch (e) {
  console.error('Managed HTTP acceptance failed:', e);
  throw e;
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit');
    server.kill('SIGTERM');
    await stopped.catch(() => {});
  }
  await rm(dir, { recursive: true, force: true });
}
