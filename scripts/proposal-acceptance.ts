// Isolated HTTP regression: fake customer snapshots, no production accounts or preferences.
import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { proposalContentSchema } from '../lib/proposals';
const dir = await mkdtemp(path.join(os.tmpdir(), 'proposal-http-'));
const port = 3021,
  host = `127.0.0.1:${port}`,
  base = `http://${host}`;
const token = randomBytes(24).toString('hex'),
  hash = createHash('sha256').update(token).digest('hex'),
  id = randomUUID(),
  image = randomUUID(),
  otherImage = randomUUID();
const content = proposalContentSchema.parse({
  name: '가상 고객 A 매장',
  shortName: '가상 A',
  tagline: '검증용 자료',
  introduction: '실제 매장 자료가 아닌 검증용 내용',
  address: '가상 주소',
  phone: '02-000-0000',
  hours: '가상 운영시간',
  parking: '가상 주차',
  links: {
    place: 'https://example.com/place',
    instagram: 'https://example.com/instagram',
    kakao: null,
  },
  heroIds: [image],
  storyIds: [image, image, image],
  interiorIds: [image],
  exteriorIds: [image],
  menus: [
    {
      id: 'a-menu',
      name: '가상 메뉴 A',
      category: '고기 메뉴',
      price: 18000,
      description: '가상 내용',
      featured: true,
      imageId: image,
    },
  ],
  images: [{ id: image, label: '가상 음식 사진', width: 100, height: 100 }],
  sourceDate: '2026-10-14',
  notes: [],
});
let db = await createLocalDatabase(dir);
const admin = await localRegister(db, 'proposal-http-admin@test.invalid', 'Local-admin-test-123!');
const customer = await localRegister(
  db,
  'proposal-http-customer@test.invalid',
  'Local-customer-test-123!',
);
await db.query('insert into admin_users values($1)', [admin]);
await db.transaction(async (tx) => {
  await tx.exec('set local role service_role');
  await tx.query('select create_design_proposal($1,$2,$3)', [id, hash, JSON.stringify(content)]);
  await tx.query('select publish_design_proposal($1)', [id]);
});
const photo = await sharp({
  create: { width: 100, height: 100, channels: 3, background: '#35533c' },
})
  .webp()
  .toBuffer();
for (const size of ['small', 'full']) {
  const file = path.join(dir, 'proposal-images', id, image, size + '.webp');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, photo);
}
await db.close();
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
  {
    env: {
      ...process.env,
      APP_MODE: 'local',
      APP_URL: base,
      PLATFORM_HOSTS: host,
      LOCAL_DATA_DIR: dir,
      VERCEL: undefined,
      VERCEL_ENV: undefined,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let logs = '';
server.stdout.on('data', (d) => (logs += d));
server.stderr.on('data', (d) => (logs += d));
function get(
  url: string,
  {
    method = 'GET',
    body,
    tenant,
    cookie,
  }: { method?: string; body?: unknown; tenant?: string; cookie?: string } = {},
) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }>(
    (resolve, reject) => {
      const data = body === undefined ? undefined : JSON.stringify(body);
      const req = http.request(
        base + url,
        {
          method,
          headers: {
            host: tenant || host,
            ...(cookie ? { cookie } : {}),
            ...(data
              ? {
                  origin: base,
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(data),
                }
              : {}),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (x) => chunks.push(x));
          res.on('end', () =>
            resolve({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks) }),
          );
        },
      );
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    },
  );
}
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await get('/robots.txt');
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (attempt === 59) throw new Error(logs);
    }
  }
  for (const style of ['yongs', 'bamboo', 'grill'])
    for (const section of ['', '/menu', '/visit']) {
      const response = await get(`/proposals/${token}/${style}${section}`);
      assert.equal(response.status, 200);
      const html = response.body.toString();
      assert.match(html, /가상 A/);
      assert.match(html, /noindex/);
      assert.match(html, /no-referrer/);
      assert.doesNotMatch(html, /이 스타일이 좋아요|이 시안을 선택했어요|선택 저장 중/);
      if (section === '/menu') assert.match(html, /18,000/);
      if (section === '/visit') assert.match(html, /가상 주소/);
    }
  const comparison = await get(`/proposals/${token}`);
  assert.equal(comparison.status, 200);
  assert.doesNotMatch(comparison.body.toString(), /마음에 드는 시안을 알려주세요|현재 선택:/);
  assert.match(comparison.body.toString(), /시안 번호를 문자로 알려주세요/);
  for (const tail of ['unknown', 'yongs/unknown', 'yongs/menu/extra'])
    assert.equal((await get(`/proposals/${token}/${tail}`)).status, 404);
  assert.equal((await get(`/proposals/${'0'.repeat(48)}`)).status, 404);
  assert.equal(
    (await get(`/proposals/${token}/yongs`, { tenant: 'other-customer.invalid' })).status,
    404,
  );
  assert.equal((await get(`/api/proposal-images/${token}/${otherImage}?size=full`)).status, 404);
  assert.equal(
    (await get(`/api/proposal-images/${'0'.repeat(48)}/${image}?size=full`)).status,
    404,
  );
  const valid = await get(`/api/proposal-images/${token}/${image}?size=small`);
  assert.equal(valid.status, 200);
  assert.equal(valid.headers['content-type'], 'image/webp');
  assert.deepEqual(valid.body, photo);
  for (const style of ['unknown', 'bamboo'])
    assert.equal(
      (await get(`/api/proposals/${token}/selection`, { method: 'POST', body: { style } })).status,
      410,
    );
  const login = await get('/api/auth/login', {
    method: 'POST',
    body: { email: 'proposal-http-customer@test.invalid', password: 'Local-customer-test-123!' },
  });
  const cookie = (login.headers['set-cookie'] || []).map((x) => x.split(';')[0]).join('; ');
  assert.equal(
    (await get(`/api/admin/proposals/${id}/revoke`, { method: 'POST', body: {}, cookie })).status,
    403,
  );
  assert.equal((await get('/admin/proposals', { cookie })).status, 404);
  assert.equal(
    (await get(`/api/admin/proposals/${id}/resume`, { method: 'POST', body: {}, cookie })).status,
    403,
  );
  assert.equal((await get('/admin/proposals')).status, 307);
} finally {
  const stopped = once(server, 'exit');
  server.kill('SIGTERM');
  await stopped;
}
try {
  db = await createLocalDatabase(dir);
  const list = await localRpc<{ selection: string }[]>(db, admin, 'list_design_proposals');
  assert.equal(list[0].selection, null);
  await assert.rejects(localRpc(db, customer, 'revoke_design_proposal', { p_id: id }), /FORBIDDEN/);
  await localRpc(db, admin, 'revoke_design_proposal', { p_id: id });
  assert.equal(await localRpc(db, null, 'get_design_proposal', { p_hash: hash }), null);
  await assert.rejects(localRpc(db, customer, 'resume_design_proposal', { p_id: id }), /FORBIDDEN/);
  await localRpc(db, admin, 'resume_design_proposal', { p_id: id });
  await localRpc(db, admin, 'resume_design_proposal', { p_id: id });
  const restored = await localRpc<{ id: string; content: unknown }>(
    db,
    null,
    'get_design_proposal',
    { p_hash: hash },
  );
  assert.equal(restored.id, id);
  assert.deepEqual(restored.content, content);
  console.log(
    'PASS: three designs × three pages, image isolation, unknown routes/hosts denied, selection disabled without DB writes, customer/admin authorization, link revocation.',
  );
} finally {
  await db?.close();
  await rm(dir, { recursive: true, force: true });
}
