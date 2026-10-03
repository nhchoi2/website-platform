import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { legalAcceptance, TERMS_VERSION, PRIVACY_VERSION } from '../lib/legal';
import type { AccountDetails } from '../lib/types';
let db: PGlite, dir: string, alice: string, bob: string, admin: string;
const call = <T>(id: string | null, name: string, args: Record<string, unknown> = {}) =>
  localRpc<T>(db, id, name, args);
before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'koofy-accounts-'));
  db = await createLocalDatabase(dir);
  alice = await localRegister(db, 'alice@account.invalid', 'account-password-123', legalAcceptance);
  bob = await localRegister(db, 'bob@account.invalid', 'account-password-123');
  admin = await localRegister(db, 'admin@account.invalid', 'account-password-123');
  await db.query('insert into admin_users(user_id) values($1)', [admin]);
});
after(async () => {
  await db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});
test('email checkbox records fixed versions; OAuth/existing accounts require explicit acceptance', async () => {
  assert.equal(await call(alice, 'has_account_consent'), true);
  assert.equal(await call(bob, 'has_account_consent'), false);
  const original = await call<AccountDetails>(alice, 'get_account_details');
  assert.equal(original.consents[0].source, 'email_signup');
  await assert.rejects(
    call(bob, 'accept_account_terms', { p_terms: 'old', p_privacy: PRIVACY_VERSION }),
    /CONSENT_VERSION/,
  );
  await call(bob, 'accept_account_terms', { p_terms: TERMS_VERSION, p_privacy: PRIVACY_VERSION });
  await call(alice, 'accept_account_terms', { p_terms: TERMS_VERSION, p_privacy: PRIVACY_VERSION });
  assert.deepEqual(
    (await call<AccountDetails>(alice, 'get_account_details')).consents,
    original.consents,
  );
  await db.query('update auth.users set raw_user_meta_data=$1 where id=$2', [
    JSON.stringify(legalAcceptance),
    admin,
  ]);
  assert.equal(await call(admin, 'has_account_consent'), false);
});
test('private contact validates consent and format; it never claims phone verification', async () => {
  await assert.rejects(
    call(admin, 'save_account_contact', {
      p_name: '관리자',
      p_phone: '01012345678',
      p_consent: true,
    }),
    /CONSENT_REQUIRED/,
  );
  await assert.rejects(
    call(alice, 'save_account_contact', {
      p_name: '담당자',
      p_phone: '01012345678',
      p_consent: false,
    }),
    /CONTACT_CONSENT_REQUIRED/,
  );
  await assert.rejects(
    call(alice, 'save_account_contact', { p_name: '담당자', p_phone: 'wrong', p_consent: true }),
    /INVALID_CONTACT/,
  );
  await call(alice, 'save_account_contact', {
    p_name: 'A 담당자',
    p_phone: '01012345678',
    p_consent: true,
  });
  const details = await call<AccountDetails>(alice, 'get_account_details');
  assert.equal(details.contact?.contact_phone, '01012345678');
  assert.ok(details.contact?.contact_consent_at);
  assert.equal('phone_verified_at' in details.contact!, false);
});
test('server RPC and direct RLS deny other customers and anonymous users', async () => {
  await assert.rejects(call(bob, 'get_account_details', { p_user: alice }), /FORBIDDEN/);
  await assert.rejects(call(null, 'get_account_details', { p_user: alice }), /permission denied/);
  await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [bob]);
    await tx.exec('set local role authenticated');
    assert.equal(
      (await tx.query('select * from account_details where user_id=$1', [alice])).rows.length,
      0,
    );
    assert.equal(
      (await tx.query('select * from account_consents where user_id=$1', [alice])).rows.length,
      0,
    );
  });
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec('set local role authenticated');
      await tx.query('update account_details set contact_phone=$1 where user_id=$2', [
        '01099999999',
        alice,
      ]);
    }),
    /permission denied/,
  );
  assert.equal(
    (await call<AccountDetails>(admin, 'get_account_details', { p_user: alice })).contact
      ?.contact_name,
    'A 담당자',
  );
  await assert.rejects(
    db.query('update account_consents set accepted_at=now() where user_id=$1', [alice]),
    /IMMUTABLE_VERSION/,
  );
});
test('contact and acceptance survive restart; clearing optional contact withdraws consent', async () => {
  await db.close();
  db = await createLocalDatabase(dir);
  assert.equal(
    (await call<AccountDetails>(alice, 'get_account_details')).contact?.contact_phone,
    '01012345678',
  );
  assert.equal(await call(alice, 'has_account_consent'), true);
  await call(alice, 'save_account_contact', { p_name: '', p_phone: '', p_consent: false });
  const cleared = await call<AccountDetails>(alice, 'get_account_details');
  assert.equal(cleared.contact?.contact_phone, '');
  assert.equal(cleared.contact?.contact_consent_at, null);
});
