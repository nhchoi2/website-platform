import { PGlite } from '@electric-sql/pglite';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export function localDirectory() {
  return path.resolve(/* turbopackIgnore: true */ process.env.LOCAL_DATA_DIR || '.local-data');
}
export async function createLocalDatabase(directory: string) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const db = new PGlite(path.join(directory, 'postgres'));
  await db.waitReady;
  await db.exec(`create table if not exists local_migrations(name text primary key);
    create schema if not exists auth;
    create table if not exists auth.users(id uuid primary key default gen_random_uuid(),email text unique not null,password_hash text not null);
    create table if not exists auth.sessions(token_hash text primary key,user_id uuid references auth.users(id),expires_at timestamptz not null);
    create table if not exists auth.recovery(token_hash text primary key,user_id uuid references auth.users(id),expires_at timestamptz not null);
    create table if not exists auth.attempts(key text primary key,count integer not null,started_at timestamptz not null);
    do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
      if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if; end $$;
    create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated;`);
  await db.exec(
    "alter table auth.users add column if not exists raw_user_meta_data jsonb not null default '{}'::jsonb",
  );
  for (const migration of [
    '001_platform.sql',
    '003_customer_directory.sql',
    '004_accounts_and_consent.sql',
    '005_inquiries.sql',
    '006_managed_templates.sql',
    '007_customer_workflow.sql',
    '009_notifications.sql',
  ]) {
    const applied = await db.query('select name from local_migrations where name=$1', [migration]);
    if (!applied.rows.length) {
      const sql = await readFile(
        path.join(process.cwd(), 'supabase/migrations', migration),
        'utf8',
      );
      await db.transaction(async (tx) => {
        await tx.exec(sql);
        await tx.query('insert into local_migrations(name) values($1)', [migration]);
      });
    }
  }
  return db;
}
const globalDb = globalThis as typeof globalThis & { restaurantDb?: Promise<PGlite> };
export function localDatabase() {
  if (process.env.VERCEL || process.env.APP_MODE !== 'local')
    throw new Error('로컬 모드는 APP_MODE=local인 로컬 서버에서만 사용할 수 있습니다.');
  return (globalDb.restaurantDb ??= createLocalDatabase(localDirectory()));
}

// Exactly the same stored functions and RLS as production; only Auth/Storage are local.
export const rpcParameters: Record<string, string[]> = {
  create_customer_site: ['p_owner', 'p_slug', 'p_content'],
  register_document: ['p_site', 'p_id', 'p_name', 'p_bytes'],
  get_my_inquiries: [],
  start_project: ['p_inquiry', 'p_customer', 'p_site'],
  list_projects: [],
  get_project: ['p_project'],
  update_project: ['p_project', 'p_expected', 'p_stage', 'p_message', 'p_quote'],
  see_project_quote: ['p_project', 'p_expected'],
  register_project_file: ['p_project', 'p_id', 'p_name', 'p_bytes', 'p_mime', 'p_consent'],
  remove_project_file: ['p_project', 'p_file'],
  request_evidence: [
    'p_project',
    'p_key',
    'p_kind',
    'p_identifier',
    'p_name',
    'p_email',
    'p_type',
    'p_consent',
  ],
  list_evidence: [],
  update_evidence: ['p_id', 'p_status', 'p_reference', 'p_message'],
  list_notifications: [],
  delete_inquiry: ['p_id'],
  list_inquiries: [],
  update_inquiry: ['p_id', 'p_status', 'p_notes'],
  has_account_consent: [],
  get_account_details: ['p_user'],
  accept_account_terms: ['p_terms', 'p_privacy'],
  save_account_contact: ['p_name', 'p_phone', 'p_consent'],
  list_customers: [],
  get_own_site: [],
  is_admin: [],
  list_sites: [],
  get_site_detail: ['p_site'],
  create_site: ['p_slug', 'p_content'],
  save_draft: ['p_site', 'p_expected', 'p_content'],
  submit_site: ['p_site', 'p_expected', 'p_key'],
  review_submission: ['p_site', 'p_submission', 'p_revision', 'p_action', 'p_feedback', 'p_key'],
  restore_publication: ['p_site', 'p_revision', 'p_expected', 'p_key'],
  register_asset: ['p_site', 'p_id', 'p_name', 'p_bytes'],
  remove_asset: ['p_site', 'p_asset'],
  save_domain: ['p_site', 'p_hostname', 'p_status', 'p_expires', 'p_notes'],
  get_public_site: ['p_slug', 'p_host'],
  get_public_asset: ['p_id', 'p_host'],
};
export async function localRpc<T>(
  db: PGlite,
  userId: string | null,
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const params = rpcParameters[name];
  if (!params) throw new Error('Unknown database operation');
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [userId || '']);
    await tx.exec(`set local role ${userId ? 'authenticated' : 'anon'}`);
    const result = await tx.query<{ result: T }>(
      `select public.${name}(${params.map((_, i) => `$${i + 1}`).join(',')}) as result`,
      params.map((k) =>
        typeof args[k] === 'object' && args[k] !== null
          ? JSON.stringify(args[k])
          : (args[k] ?? null),
      ),
    );
    return result.rows[0].result;
  });
}
