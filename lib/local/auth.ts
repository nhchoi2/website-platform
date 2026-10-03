import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { PGlite } from '@electric-sql/pglite';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function matches(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64));
}
export async function localRegister(
  db: PGlite,
  email: string,
  password: string,
  metadata: Record<string, unknown> = {},
) {
  const result = await db.query<{ id: string }>(
    'insert into auth.users(email,password_hash,raw_user_meta_data) values($1,$2,$3) returning id',
    [email, hashPassword(password), JSON.stringify(metadata)],
  );
  return result.rows[0].id;
}
export async function localLogin(db: PGlite, email: string, password: string) {
  const result = await db.query<{ id: string; password_hash: string }>(
    'select id,password_hash from auth.users where email=$1',
    [email],
  );
  const user = result.rows[0];
  const valid = matches(password, user?.password_hash || hashPassword('invalid-placeholder'));
  if (!user || !valid) throw new Error('INVALID_LOGIN');
  const token = randomBytes(32).toString('hex');
  await db.query(
    "insert into auth.sessions(token_hash,user_id,expires_at) values($1,$2,now()+interval '7 days')",
    [digest(token), user.id],
  );
  return token;
}
export async function localSession(db: PGlite, token: string) {
  const result = await db.query<{ id: string; email: string; admin: boolean }>(
    `select u.id,u.email,exists(select 1 from public.admin_users where user_id=u.id) as admin from auth.sessions s join auth.users u on u.id=s.user_id where token_hash=$1 and expires_at>now()`,
    [digest(token)],
  );
  return result.rows[0] || null;
}
export async function localLogout(db: PGlite, token: string) {
  await db.query('delete from auth.sessions where token_hash=$1', [digest(token)]);
}
export async function localRecovery(db: PGlite, email: string) {
  const token = randomBytes(32).toString('hex');
  await db.query(
    "insert into auth.recovery(token_hash,user_id,expires_at) select $1,id,now()+interval '30 minutes' from auth.users where email=$2",
    [digest(token), email],
  );
  // Local only: replaces outbound email. Never enabled in Supabase mode.
  return token;
}
export async function localReset(db: PGlite, token: string, password: string) {
  await db.transaction(async (tx) => {
    const { rows } = await tx.query<{ user_id: string }>(
      'delete from auth.recovery where token_hash=$1 and expires_at>now() returning user_id',
      [digest(token)],
    );
    if (!rows[0]) throw new Error('INVALID_RECOVERY');
    await tx.query('update auth.users set password_hash=$1 where id=$2', [
      hashPassword(password),
      rows[0].user_id,
    ]);
    await tx.query('delete from auth.sessions where user_id=$1', [rows[0].user_id]);
    await tx.query('delete from auth.recovery where user_id=$1', [rows[0].user_id]);
  });
}
export async function localRateLimit(db: PGlite, key: string) {
  const { rows } = await db.query<{ count: number }>(
    `insert into auth.attempts(key,count,started_at) values($1,1,now()) on conflict(key) do update set count=case when auth.attempts.started_at<now()-interval '10 minutes' then 1 else auth.attempts.count+1 end,started_at=case when auth.attempts.started_at<now()-interval '10 minutes' then now() else auth.attempts.started_at end returning count`,
    [key],
  );
  if (rows[0].count > 20) throw new Error('RATE_LIMIT');
}
