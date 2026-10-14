import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash, randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { proposalContentSchema, proposalRoute } from '../lib/proposals';
let db: PGlite, dir: string, customer: string, admin: string;
const id = randomUUID();
const hash = createHash('sha256').update(randomBytes(24)).digest('hex');
const image = randomUUID();
const content = proposalContentSchema.parse({
  name: '테스트 고객 매장',
  shortName: '테스트 매장',
  tagline: '테스트',
  introduction: '자료 확인',
  address: '공개 주소',
  phone: '02-000-0000',
  hours: '테스트 운영시간',
  parking: '테스트',
  links: {
    place: 'https://example.com/place',
    instagram: 'https://example.com/instagram',
    kakao: null,
  },
  heroIds: [image],
  storyIds: [image, image, image],
  interiorIds: [image],
  exteriorIds: [],
  menus: [
    {
      id: 'test-menu',
      name: '테스트 메뉴',
      category: '고기 메뉴',
      price: 18000,
      description: '테스트 내용',
      featured: true,
      imageId: image,
    },
  ],
  images: [{ id: image, label: '테스트 음식 사진', width: 100, height: 100 }],
  sourceDate: '2026-10-14',
  notes: [],
});
async function service(name: string, args: unknown[]) {
  return db.transaction(async (tx) => {
    await tx.exec('set local role service_role');
    const result = await tx.query<{ value: unknown }>(
      `select public.${name}(${args.map((_, i) => `$${i + 1}`).join(',')}) as value`,
      args.map((x) => (typeof x === 'object' && x !== null ? JSON.stringify(x) : x)),
    );
    return result.rows[0].value;
  });
}
before(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'proposal-tests-'));
  db = await createLocalDatabase(dir);
  customer = await localRegister(db, 'proposal-customer@test.invalid', 'Test-password-123!');
  admin = await localRegister(db, 'proposal-admin@test.invalid', 'Test-password-456!');
  await db.query('insert into admin_users values($1)', [admin]);
});
after(async () => {
  await db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});
test('proposal images must all belong to their snapshot; arbitrary routes fail closed', () => {
  assert.equal(
    proposalContentSchema.safeParse({ ...content, heroIds: [randomUUID()] }).success,
    false,
  );
  assert.equal(
    proposalContentSchema.safeParse({ ...content, images: [...content.images, content.images[0]] })
      .success,
    false,
  );
  assert.equal(proposalRoute(['yongs', 'visit', 'other']), null);
  assert.equal(proposalRoute(['unknown']), null);
  assert.equal(proposalRoute(['yongs', 'dashboard']), null);
  assert.deepEqual(proposalRoute(['bamboo', 'menu']), { style: 'bamboo', page: 'menu' });
});
test('draft proposal is invisible and creation is service-only, immutable and idempotent', async () => {
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec('set local role anon');
      await tx.query('select create_design_proposal($1,$2,$3)', [
        id,
        hash,
        JSON.stringify(content),
      ]);
    }),
    /permission denied/,
  );
  assert.equal(await service('create_design_proposal', [id, hash, content]), id);
  assert.equal(await service('create_design_proposal', [id, hash, content]), id);
  await assert.rejects(
    service('create_design_proposal', [id, hash, { ...content, name: '다른 내용' }]),
    /IDEMPOTENCY_CONFLICT/,
  );
  assert.equal(await localRpc(db, null, 'get_design_proposal', { p_hash: hash }), null);
  await assert.rejects(
    localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: 'yongs' }),
    /NOT_FOUND/,
  );
  await assert.rejects(
    service('create_design_proposal', [randomUUID(), hash, { name: '이미지 없는 자료' }]),
    /INVALID_PROPOSAL/,
  );
});
test('only a published exact token resolves; no customer/anonymous listing or publish access', async () => {
  await service('publish_design_proposal', [id]);
  const snapshot = await localRpc<{ id: string; content: unknown }>(
    db,
    null,
    'get_design_proposal',
    { p_hash: hash },
  );
  assert.equal(snapshot.id, id);
  assert.deepEqual(snapshot.content, content);
  assert.equal(await localRpc(db, null, 'get_design_proposal', { p_hash: '0'.repeat(64) }), null);
  await assert.rejects(localRpc(db, null, 'list_design_proposals'), /permission denied/);
  await assert.rejects(localRpc(db, customer, 'list_design_proposals'), /FORBIDDEN/);
  await db.transaction(async (tx) => {
    await tx.exec('set local role anon');
    await assert.rejects(tx.query('select * from design_proposals'), /permission denied/);
  });
  const rows = await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [customer]);
    await tx.exec('set local role authenticated');
    return tx.query('select * from design_proposals');
  });
  assert.equal(rows.rows.length, 0);
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec('set local role authenticated');
      await tx.query('select publish_design_proposal($1)', [id]);
    }),
    /permission denied/,
  );
});
test('preferred style survives repeat requests and is visible only to operator; revoke stops new reads and selections', async () => {
  await localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: 'bamboo' });
  await localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: 'bamboo' });
  await assert.rejects(
    localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: null }),
    /INVALID_STYLE/,
  );
  await assert.rejects(
    localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: 'arbitrary' }),
    /INVALID_STYLE/,
  );
  const list = await localRpc<{ id: string; selection: string }[]>(
    db,
    admin,
    'list_design_proposals',
  );
  assert.equal(list[0].selection, 'bamboo');
  assert.equal(list.length, 1);
  await assert.rejects(localRpc(db, customer, 'revoke_design_proposal', { p_id: id }), /FORBIDDEN/);
  await localRpc(db, admin, 'revoke_design_proposal', { p_id: id });
  assert.equal(await localRpc(db, null, 'get_design_proposal', { p_hash: hash }), null);
  await assert.rejects(
    localRpc(db, null, 'select_design_proposal', { p_hash: hash, p_style: 'grill' }),
    /NOT_FOUND/,
  );
  await assert.rejects(
    service('create_design_proposal', [id, hash, content]),
    /IDEMPOTENCY_CONFLICT/,
  );
});
test('only admin resumes the same published snapshot; repeats are safe and unpublished proposals stay private', async () => {
  await assert.rejects(
    localRpc(db, null, 'resume_design_proposal', { p_id: id }),
    /permission denied/,
  );
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
  const draftId = randomUUID();
  await service('create_design_proposal', [draftId, '1'.repeat(64), content]);
  await assert.rejects(
    localRpc(db, admin, 'resume_design_proposal', { p_id: draftId }),
    /NOT_FOUND/,
  );
  assert.equal(await localRpc(db, null, 'get_design_proposal', { p_hash: '1'.repeat(64) }), null);
});
