import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import {
  localRegister,
  localLogin,
  localSession,
  localLogout,
  localRecovery,
  localReset,
} from '../lib/local/auth';
import { emptyContent, contentDiff } from '../lib/content';
import type { Site, Submission, SiteDetail, Asset, Publication } from '../lib/types';

let db: PGlite, dir: string, alice: string, bob: string, admin: string, site: Site, bobSite: Site;
const call = <T>(user: string | null, name: string, args: Record<string, unknown> = {}) =>
  localRpc<T>(db, user, name, args);
const detail = () => call<SiteDetail>(alice, 'get_site_detail', { p_site: site.id });
before(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'restaurant-test-'));
  db = await createLocalDatabase(dir);
  alice = await localRegister(db, 'alice@test.invalid', 'alice-password-123');
  bob = await localRegister(db, 'bob@test.invalid', 'bob-password-123');
  admin = await localRegister(db, 'admin@test.invalid', 'admin-password-123');
  await db.query('insert into admin_users(user_id) values($1)', [admin]);
  site = await call(alice, 'create_site', {
    p_slug: 'alice-restaurant',
    p_content: { ...emptyContent(), name: 'A 식당', address: '서울', phone: '02-123-4567' },
  });
  bobSite = await call(bob, 'create_site', {
    p_slug: 'bob-restaurant',
    p_content: { ...emptyContent(), name: 'B 식당', address: '부산', phone: '051-123-4567' },
  });
});
after(async () => {
  await db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});
test('persistent accounts, login, logout and one-time recovery revoke old sessions', async () => {
  const token = await localLogin(db, 'alice@test.invalid', 'alice-password-123');
  assert.equal((await localSession(db, token))?.id, alice);
  await localLogout(db, token);
  assert.equal(await localSession(db, token), null);
  await assert.rejects(localLogin(db, 'alice@test.invalid', 'wrong-password'), /INVALID_LOGIN/);
  const previous = await localLogin(db, 'bob@test.invalid', 'bob-password-123');
  const recovery = await localRecovery(db, 'bob@test.invalid');
  await localReset(db, recovery, 'new-password-123');
  assert.equal(await localSession(db, previous), null);
  await assert.rejects(localReset(db, recovery, 'again-password'), /INVALID_RECOVERY/);
  assert.ok(await localLogin(db, 'bob@test.invalid', 'new-password-123'));
});
test('one site per customer and ordinary customer cannot gain admin role', async () => {
  const same = await call<Site>(alice, 'create_site', {
    p_slug: 'another-shop',
    p_content: emptyContent(),
  });
  assert.equal(same.id, site.id);
  assert.equal(await call(alice, 'is_admin'), false);
  assert.equal(await call(admin, 'is_admin'), true);
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec('set local role authenticated');
      await tx.query('insert into admin_users(user_id) values($1)', [alice]);
    }),
    /permission denied/,
  );
});
test('RLS denies cross-customer reads and raw writes even bypassing the app', async () => {
  await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [alice]);
    await tx.exec('set local role authenticated');
    const rows = await tx.query('select * from sites where id=$1', [bobSite.id]);
    assert.equal(rows.rows.length, 0);
  });
  await assert.rejects(call(alice, 'get_site_detail', { p_site: bobSite.id }), /FORBIDDEN/);
  await assert.rejects(
    call(bob, 'save_draft', { p_site: site.id, p_expected: 1, p_content: emptyContent() }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec('set local role authenticated');
      await tx.query('update sites set published_revision=null where id=$1', [site.id]);
    }),
    /permission denied/,
  );
  await assert.rejects(call(null, 'get_site_detail', { p_site: site.id }), /permission denied/);
});
test('save persists; optimistic conflict prevents overwriting another tab; draft stays private', async () => {
  site = await call(alice, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, tagline: '저장한 소개' },
  });
  assert.equal((await detail()).site.draft.tagline, '저장한 소개');
  await assert.rejects(
    call(alice, 'save_draft', { p_site: site.id, p_expected: 1, p_content: emptyContent() }),
    /VERSION_CONFLICT/,
  );
  assert.equal(await call(null, 'get_public_site', { p_slug: site.slug, p_host: null }), null);
});
test('asset ownership is validated and drafts never expose images publicly', async () => {
  const foreign = await call<Asset>(bob, 'register_asset', {
    p_site: bobSite.id,
    p_id: randomUUID(),
    p_name: 'bob.jpg',
    p_bytes: 100,
  });
  await assert.rejects(
    call(alice, 'save_draft', {
      p_site: site.id,
      p_expected: site.draft_version,
      p_content: { ...site.draft, photos: [{ id: randomUUID(), assetId: foreign.id, alt: '' }] },
    }),
    /ASSET_FORBIDDEN/,
  );
  assert.equal(await call(null, 'get_public_asset', { p_id: foreign.id, p_host: null }), null);
  await assert.rejects(
    call(alice, 'remove_asset', { p_site: bobSite.id, p_asset: foreign.id }),
    /FORBIDDEN/,
  );
});
let submitted: Submission;
test('submission freezes content; editing continues; concurrent duplicate clicks make one request', async () => {
  const key = randomUUID();
  const args = { p_site: site.id, p_expected: site.draft_version, p_key: key };
  const results = await Promise.all([
    call<Submission>(alice, 'submit_site', args),
    call<Submission>(alice, 'submit_site', args),
  ]);
  submitted = results[0];
  assert.equal(results[0].id, results[1].id);
  site = await call(alice, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, tagline: '제출 이후 비공개 수정' },
  });
  assert.equal(
    (await detail()).revisions.find((r) => r.id === submitted.revision_id)?.content.tagline,
    '저장한 소개',
  );
  assert.equal((await detail()).site.draft.tagline, '제출 이후 비공개 수정');
  assert.equal(await call(null, 'get_public_site', { p_slug: site.slug, p_host: null }), null);
  await assert.rejects(
    call(alice, 'submit_site', { ...args, p_expected: site.draft_version, p_key: randomUUID() }),
    /ALREADY_PENDING/,
  );
});
test('only admin can publish; reviewed snapshot exactly equals public version; duplicate publish is idempotent', async () => {
  const args = {
    p_site: site.id,
    p_submission: submitted.id,
    p_revision: submitted.revision_id,
    p_action: 'approve',
    p_feedback: '',
    p_key: randomUUID(),
  };
  await assert.rejects(call(alice, 'review_submission', args), /FORBIDDEN/);
  const published = await call<Publication>(admin, 'review_submission', args);
  const duplicate = await call<Publication>(admin, 'review_submission', args);
  assert.equal(published.id, duplicate.id);
  const publicSite = await call<{ content: unknown }>(null, 'get_public_site', {
    p_slug: site.slug,
    p_host: null,
  });
  assert.deepEqual(
    publicSite.content,
    (await detail()).revisions.find((r) => r.id === submitted.revision_id)?.content,
  );
});
let second: Submission;
test('database publish failure rolls back history and public pointer atomically', async () => {
  second = await call(alice, 'submit_site', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_key: randomUUID(),
  });
  await db.exec(`create function test_reject_publish() returns trigger language plpgsql as $$ begin raise exception 'TEST_PUBLISH_FAILURE'; end $$;
    create trigger test_fail before update of published_revision on sites for each row execute function test_reject_publish();`);
  await assert.rejects(
    call(admin, 'review_submission', {
      p_site: site.id,
      p_submission: second.id,
      p_revision: second.revision_id,
      p_action: 'approve',
      p_feedback: '',
      p_key: randomUUID(),
    }),
    /TEST_PUBLISH_FAILURE/,
  );
  await db.exec('drop trigger test_fail on sites; drop function test_reject_publish();');
  const data = await detail();
  assert.equal(data.site.published_revision, submitted.revision_id);
  assert.equal(data.publications.length, 1);
  assert.equal(data.submissions.find((s) => s.id === second.id)?.status, 'pending');
});
test('request changes records feedback; stale approval cannot publish a rejected version', async () => {
  const args = {
    p_site: site.id,
    p_submission: second.id,
    p_revision: second.revision_id,
    p_action: 'changes',
    p_feedback: '가격을 확인해 주세요.',
    p_key: randomUUID(),
  };
  await call(admin, 'review_submission', args);
  assert.equal(
    (await detail()).submissions.find((s) => s.id === second.id)?.feedback,
    '가격을 확인해 주세요.',
  );
  await assert.rejects(
    call(admin, 'review_submission', { ...args, p_action: 'approve', p_key: randomUUID() }),
    /ALREADY_REVIEWED/,
  );
});
test('photo order and replacement are persisted; immutable historical photos remain recoverable', async () => {
  const a = await call<Asset>(alice, 'register_asset', {
    p_site: site.id,
    p_id: randomUUID(),
    p_name: 'one.jpg',
    p_bytes: 100,
  });
  const b = await call<Asset>(alice, 'register_asset', {
    p_site: site.id,
    p_id: randomUUID(),
    p_name: 'two.jpg',
    p_bytes: 100,
  });
  const photos = [
    { id: randomUUID(), assetId: b.id, alt: '둘째가 먼저' },
    { id: randomUUID(), assetId: a.id, alt: '첫째가 나중' },
  ];
  site = await call(alice, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, photos },
  });
  assert.deepEqual((await detail()).site.draft.photos, photos);
  const sub = await call<Submission>(alice, 'submit_site', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_key: randomUUID(),
  });
  await call(admin, 'review_submission', {
    p_site: site.id,
    p_submission: sub.id,
    p_revision: sub.revision_id,
    p_action: 'approve',
    p_feedback: '',
    p_key: randomUUID(),
  });
  assert.equal(
    (await call<Asset>(null, 'get_public_asset', { p_id: a.id, p_host: null })).id,
    a.id,
  );
  site = await call(alice, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, photos: [] },
  });
  await assert.rejects(
    call(alice, 'remove_asset', { p_site: site.id, p_asset: a.id }),
    /ASSET_IN_USE/,
  );
});
test('restore accepts only previously published own versions and detects stale public state', async () => {
  const current = (await detail()).site.published_revision;
  await assert.rejects(
    call(admin, 'restore_publication', {
      p_site: site.id,
      p_revision: second.revision_id,
      p_expected: current,
      p_key: randomUUID(),
    }),
    /NOT_PUBLISHED/,
  );
  const args = {
    p_site: site.id,
    p_revision: submitted.revision_id,
    p_expected: current,
    p_key: randomUUID(),
  };
  const first = await call<Publication>(admin, 'restore_publication', args);
  const secondTry = await call<Publication>(admin, 'restore_publication', args);
  assert.equal(first.id, secondTry.id);
  assert.equal((await detail()).site.published_revision, submitted.revision_id);
  await assert.rejects(
    call(admin, 'restore_publication', { ...args, p_key: randomUUID() }),
    /VERSION_CONFLICT/,
  );
});
test('domain routing is exact, unique and fails closed for pending or unknown hosts', async () => {
  const domain = {
    p_site: site.id,
    p_hostname: 'a.example.com',
    p_status: 'pending',
    p_expires: '2027-10-02',
    p_notes: 'test',
  };
  await assert.rejects(call(alice, 'save_domain', domain), /FORBIDDEN/);
  await call(admin, 'save_domain', domain);
  assert.equal(
    await call(null, 'get_public_site', { p_slug: null, p_host: 'a.example.com' }),
    null,
  );
  await call(admin, 'save_domain', { ...domain, p_status: 'connected' });
  assert.equal(
    (await call<{ id: string }>(null, 'get_public_site', { p_slug: null, p_host: 'a.example.com' }))
      .id,
    site.id,
  );
  assert.equal(
    await call(null, 'get_public_site', { p_slug: null, p_host: 'unknown.example.com' }),
    null,
  );
  await assert.rejects(
    call(admin, 'save_domain', { ...domain, p_site: bobSite.id }),
    /DOMAIN_TAKEN/,
  );
});
test('no direct immutable history mutations; diff detects reordering', async () => {
  await assert.rejects(
    db.query('update revisions set content=$1 where id=$2', [
      JSON.stringify(emptyContent()),
      submitted.revision_id,
    ]),
    /IMMUTABLE_VERSION/,
  );
  const c = emptyContent();
  const p = [
    { id: randomUUID(), assetId: randomUUID(), alt: '' },
    { id: randomUUID(), assetId: randomUUID(), alt: '' },
  ];
  assert.equal(
    contentDiff({ ...c, photos: p }, { ...c, photos: [...p].reverse() })[0].key,
    'photos',
  );
});
test('database remains after close and re-open (process restart)', async () => {
  await db.close();
  db = await createLocalDatabase(dir);
  assert.equal((await detail()).site.draft.name, 'A 식당');
  assert.equal((await detail()).site.published_revision, submitted.revision_id);
});
