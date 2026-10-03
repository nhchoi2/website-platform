// Explicit opt-in. Reuses existing, isolated QA accounts; never prints credentials.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { websocketTransport } from '../lib/websocket';
import { TERMS_VERSION, PRIVACY_VERSION } from '../lib/legal';
const accounts = JSON.parse(await readFile('.test-data/remote-accounts.json', 'utf8')) as {
  id: string;
  email: string;
  password: string;
}[];
const make = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: websocketTransport },
  });
const [a, b] = [make(), make()];
for (const [index, client] of [a, b].entries()) {
  assert.match(
    accounts[index].email,
    /^qa-customer-/,
    'Only established disposable QA accounts are allowed',
  );
  const login = await client.auth.signInWithPassword({
    email: accounts[index].email,
    password: accounts[index].password,
  });
  assert.equal(login.error, null);
}
try {
  const accepted = await a.rpc('accept_account_terms', {
    p_terms: TERMS_VERSION,
    p_privacy: PRIVACY_VERSION,
  });
  assert.equal(accepted.error, null);
  const saved = await a.rpc('save_account_contact', {
    p_name: 'QA 담당자',
    p_phone: '01000000000',
    p_consent: true,
  });
  assert.equal(saved.error, null);
  assert.equal(saved.data.contact_phone, '01000000000');
  const own = await a.rpc('get_account_details');
  assert.equal(own.error, null);
  assert.equal(own.data.contact.contact_name, 'QA 담당자');
  const foreign = await b.rpc('get_account_details', { p_user: accounts[0].id });
  assert.ok(foreign.error?.message.includes('FORBIDDEN'));
  const raw = await b.from('account_details').select('*').eq('user_id', accounts[0].id);
  assert.equal(raw.error, null);
  assert.deepEqual(raw.data, []);
  const history = await b.from('account_consents').select('*').eq('user_id', accounts[0].id);
  assert.equal(history.error, null);
  assert.deepEqual(history.data, []);
  const mutation = await b
    .from('account_details')
    .update({ contact_phone: '01099999999' })
    .eq('user_id', accounts[0].id);
  assert.ok(mutation.error);
  const anon = await make().rpc('get_account_details');
  assert.ok(anon.error);
  console.log(
    'PASS: real Supabase contact persistence, consent record, cross-customer RPC/RLS isolation, denied raw writes and anonymous access.',
  );
} finally {
  const cleared = await a.rpc('save_account_contact', {
    p_name: '',
    p_phone: '',
    p_consent: false,
  });
  assert.equal(cleared.error, null);
  await Promise.all([a.auth.signOut(), b.auth.signOut()]);
}
