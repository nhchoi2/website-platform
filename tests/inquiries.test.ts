import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { PGlite } from '@electric-sql/pglite';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { inquirySchema, selectionFromInput, INQUIRY_CONSENT_VERSION } from '../lib/inquiries';
let db: PGlite, dir: string, admin: string, customer: string;
before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'koofy-inquiries-'));
  db = await createLocalDatabase(dir);
  const users = await db.query<{ id: string }>(
    "insert into auth.users(email,password_hash) values ('admin@inquiry.invalid','x'),('customer@inquiry.invalid','x') returning id",
  );
  admin = users.rows[0].id;
  customer = users.rows[1].id;
  await db.query('insert into admin_users(user_id) values($1)', [admin]);
});
after(async () => {
  await db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});
const payload = {
  key: randomUUID(),
  name: '테스트',
  business: '테스트 매장',
  method: 'email',
  contact: 'test@example.invalid',
  message: '제작 상담을 요청합니다.',
  template: 'hyehwa',
  query: 'pages=3&features=gallery,priceTable,invalid&nav=center',
  consent: true,
  consentVersion: INQUIRY_CONSENT_VERSION,
  website: '',
};
async function submit(key = payload.key, message = payload.message, hash = 'a'.repeat(64)) {
  const input = inquirySchema.parse({ ...payload, key, message });
  const args = [
    key,
    input.name,
    input.business,
    input.method,
    input.contact,
    message,
    JSON.stringify(selectionFromInput(input)),
    hash,
    input.consentVersion,
  ];
  return db.transaction(async (tx) => {
    await tx.exec('set local role service_role');
    const r = await tx.query<{ id: string }>(
      'select submit_inquiry($1,$2,$3,$4,$5,$6,$7,$8,$9) as id',
      args,
    );
    return r.rows[0].id;
  });
}
test('contact intake validates consent and contact, normalizes selection without invented prices', () => {
  assert.equal(inquirySchema.safeParse({ ...payload, consent: false }).success, false);
  assert.equal(inquirySchema.safeParse({ ...payload, contact: 'invalid' }).success, false);
  assert.equal(inquirySchema.safeParse({ ...payload, template: 'invalid' }).success, false);
  const selection = selectionFromInput(inquirySchema.parse(payload));
  assert.equal(selection.pages, 3);
  assert.equal(selection.setup, 390000);
  assert.equal(selection.needsQuote, true);
  assert.equal(selection.paid.length, 1);
  assert.equal(selection.included.length, 1);
  assert.ok(!selection.query.includes('invalid'));
});
test('submission is idempotent; changed payload cannot reuse a key; hourly cap persists in DB', async () => {
  const [id, concurrent] = await Promise.all([submit(), submit()]);
  assert.equal(concurrent, id);
  assert.equal(await submit(), id);
  await assert.rejects(
    submit(payload.key, '다른 내용으로 변경하였습니다.'),
    /IDEMPOTENCY_CONFLICT/,
  );
  await submit(randomUUID());
  await submit(randomUUID());
  await assert.rejects(submit(randomUUID()), /RATE_LIMIT/);
  assert.equal(
    (await db.query<{ count: number }>('select count(*)::int as count from inquiries')).rows[0]
      .count,
    3,
  );
});
test('anonymous and customer cannot submit directly, read private contacts or manage inquiries', async () => {
  await assert.rejects(localRpc(db, null, 'list_inquiries'), /permission denied/);
  await assert.rejects(localRpc(db, customer, 'list_inquiries'), /FORBIDDEN/);
  await db.transaction(async (tx) => {
    await tx.exec('set local role anon');
    await assert.rejects(tx.query('select * from inquiries'), /permission denied/);
  });
  await db.transaction(async (tx) => {
    await tx.exec('set local role authenticated');
    const r = await tx.query('select * from inquiries');
    assert.equal(r.rows.length, 0);
  });
  await db.transaction(async (tx) => {
    await tx.exec('set local role anon');
    await assert.rejects(
      tx.query('select submit_inquiry($1,$2,$3,$4,$5,$6,$7,$8,$9)', [
        randomUUID(),
        'x',
        'x',
        'email',
        'x',
        '1234567890',
        '{}',
        'a'.repeat(64),
        INQUIRY_CONSENT_VERSION,
      ]),
      /permission denied/,
    );
  });
});
test('admin can list and save status/notes; customer cannot update; records survive reopening', async () => {
  const rows = await localRpc<{ id: string; contact_hash?: string }[]>(db, admin, 'list_inquiries');
  assert.equal(rows.length, 3);
  assert.equal(rows[0].contact_hash, undefined);
  await assert.rejects(
    localRpc(db, customer, 'update_inquiry', {
      p_id: rows[0].id,
      p_status: 'closed',
      p_notes: 'x',
    }),
    /FORBIDDEN/,
  );
  await localRpc(db, admin, 'update_inquiry', {
    p_id: rows[0].id,
    p_status: 'contacted',
    p_notes: '테스트 메모',
  });
  await db.close();
  db = await createLocalDatabase(dir);
  const restored = await localRpc<{ id: string; status: string; notes: string }[]>(
    db,
    admin,
    'list_inquiries',
  );
  const row = restored.find((r) => r.id === rows[0].id)!;
  assert.equal(row.status, 'contacted');
  assert.equal(row.notes, '테스트 메모');
});

test('only admin can delete completed/withdrawn inquiries', async () => {
  const rows = await localRpc<{ id: string }[]>(db, admin, 'list_inquiries');
  await assert.rejects(localRpc(db, customer, 'delete_inquiry', { p_id: rows[0].id }), /FORBIDDEN/);
  await localRpc(db, admin, 'delete_inquiry', { p_id: rows[0].id });
  const remaining = await localRpc<{ id: string }[]>(db, admin, 'list_inquiries');
  assert.equal(remaining.length, 2);
  assert.ok(!remaining.some((r) => r.id === rows[0].id));
});
