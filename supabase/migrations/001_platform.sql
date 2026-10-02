-- Immutable review snapshots; all writes go through transactional functions.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null
);
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
create function public.sync_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id,email) values(new.id,new.email) on conflict(id) do update set email=excluded.email; return new; end $$;
create trigger on_auth_user after insert or update of email on auth.users for each row execute function public.sync_profile();
insert into public.profiles(id,email) select id,email from auth.users on conflict do nothing;

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  draft jsonb not null,
  draft_version integer not null default 1,
  published_revision uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.revisions (
  id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id),
  content jsonb not null, draft_version integer not null,
  created_at timestamptz not null default now(), unique(site_id,id), unique(site_id,draft_version)
);
alter table public.sites add constraint own_published_revision foreign key(id,published_revision) references revisions(site_id,id);
create table public.submissions (
  id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id),
  revision_id uuid not null, request_key uuid not null,
  status text not null default 'pending' check(status in ('pending','changes_requested','published')),
  feedback text not null default '', reviewer_id uuid references auth.users(id),
  created_at timestamptz not null default now(), reviewed_at timestamptz,
  foreign key(site_id,revision_id) references revisions(site_id,id), unique(site_id,request_key), unique(site_id,revision_id)
);
create unique index one_pending_per_site on submissions(site_id) where status='pending';
create table public.publications (
  id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id), revision_id uuid not null,
  operation_key uuid not null, kind text not null check(kind in ('approval','restore')),
  actor_id uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key(site_id,revision_id) references revisions(site_id,id), unique(site_id,operation_key)
);
create table public.assets (
  id uuid primary key, site_id uuid not null references sites(id), owner_id uuid not null references auth.users(id),
  path text not null unique, original_name text not null, bytes integer not null check(bytes between 1 and 5000000),
  created_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.domains (
  hostname text primary key check(hostname = lower(hostname) and hostname ~ '^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*$'),
  site_id uuid not null references sites(id), status text not null check(status in ('pending','connected','error')),
  expires_on date, notes text not null default '', updated_at timestamptz not null default now()
);
create index assets_site on assets(site_id);
create index submissions_site on submissions(site_id,created_at);
create index publications_site on publications(site_id,created_at);

create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from admin_users where user_id=auth.uid())
$$;
create function public.can_access_site(p_site uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from sites where id=p_site and (owner_id=auth.uid() or is_admin()))
$$;
create function public.content_asset_ids(p_content jsonb) returns setof uuid language sql immutable set search_path=public as $$
  select (p->>'assetId')::uuid from jsonb_array_elements(p_content->'photos') p
  union select (m->>'imageId')::uuid from jsonb_array_elements(p_content->'menus') m where m->>'imageId' is not null
$$;
create function public.validate_content(p_content jsonb,p_site uuid) returns void language plpgsql security definer set search_path=public as $$
declare k text; v jsonb;
begin
  if jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text)>150000
    or p_content->>'template' is distinct from 'hyehwa' or coalesce(p_content->>'theme','') not in ('olive','charcoal','warm') then raise exception 'INVALID_CONTENT'; end if;
  foreach k in array array['name','tagline','introduction','address','phone','hours'] loop
    if jsonb_typeof(p_content->k) is distinct from 'string' or length(p_content->>k)>4000 then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  foreach k in array array['photos','menus','links'] loop
    if jsonb_typeof(p_content->k) is distinct from 'array' then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  if jsonb_array_length(p_content->'photos')>30 or jsonb_array_length(p_content->'menus')>100 or jsonb_array_length(p_content->'links')>10 then raise exception 'INVALID_CONTENT'; end if;
  for v in select * from jsonb_array_elements(p_content->'photos') loop
    perform (v->>'id')::uuid;
    if v->>'assetId' is null or jsonb_typeof(v->'alt') is distinct from 'string' then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(p_content->'menus') loop
    perform (v->>'id')::uuid;
    foreach k in array array['name','price','description','category'] loop
      if jsonb_typeof(v->k) is distinct from 'string' then raise exception 'INVALID_CONTENT'; end if;
    end loop;
    if jsonb_typeof(v->'featured') is distinct from 'boolean' then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(p_content->'links') loop
    if jsonb_typeof(v->'label') is distinct from 'string' or coalesce(v->>'url','') !~* '^https?://' then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  if exists(select 1 from content_asset_ids(p_content) a where not exists(select 1 from assets where id=a and site_id=p_site and deleted_at is null)) then raise exception 'ASSET_FORBIDDEN'; end if;
end $$;

-- These policies remain effective when clients call Supabase directly.
alter table profiles enable row level security;
alter table admin_users enable row level security;
alter table sites enable row level security;
alter table revisions enable row level security;
alter table submissions enable row level security;
alter table publications enable row level security;
alter table assets enable row level security;
alter table domains enable row level security;
create policy profile_read on profiles for select to authenticated using(id=auth.uid() or is_admin());
create policy admin_self_read on admin_users for select to authenticated using(user_id=auth.uid());
create policy site_read on sites for select to authenticated using(owner_id=auth.uid() or is_admin());
create policy revision_read on revisions for select to authenticated using(can_access_site(site_id));
create policy submission_read on submissions for select to authenticated using(can_access_site(site_id));
create policy publication_read on publications for select to authenticated using(can_access_site(site_id));
create policy asset_read on assets for select to authenticated using(can_access_site(site_id));
create policy domain_read on domains for select to authenticated using(can_access_site(site_id));
revoke all on profiles,admin_users,sites,revisions,submissions,publications,assets,domains from anon,authenticated;
grant select on profiles,admin_users,sites,revisions,submissions,publications,assets,domains to authenticated;

create function public.create_site(p_slug text,p_content jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites;
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
  select * into s from sites where owner_id=auth.uid();
  if found then return to_jsonb(s); end if;
  perform validate_content(p_content,null);
  insert into sites(owner_id,slug,draft) values(auth.uid(),p_slug,p_content) returning * into s;
  return to_jsonb(s);
end $$;
create function public.save_draft(p_site uuid,p_expected integer,p_content jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites;
begin
  select * into s from sites where id=p_site and owner_id=auth.uid() for update;
  if not found then raise exception 'FORBIDDEN'; end if;
  if s.draft_version<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
  perform validate_content(p_content,p_site);
  update sites set draft=p_content,draft_version=draft_version+1,updated_at=now() where id=p_site returning * into s;
  return to_jsonb(s);
end $$;
create function public.submit_site(p_site uuid,p_expected integer,p_key uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites; sub submissions; rev uuid;
begin
  select * into s from sites where id=p_site and owner_id=auth.uid() for update;
  if not found then raise exception 'FORBIDDEN'; end if;
  select * into sub from submissions where site_id=p_site and request_key=p_key;
  if found then return to_jsonb(sub); end if;
  if s.draft_version<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
  select q.* into sub from submissions q join revisions r on r.id=q.revision_id where q.site_id=p_site and r.draft_version=p_expected;
  if found then return to_jsonb(sub); end if;
  if exists(select 1 from submissions where site_id=p_site and status='pending') then raise exception 'ALREADY_PENDING'; end if;
  if length(trim(s.draft->>'name'))=0 or length(trim(s.draft->>'address'))=0 or length(trim(s.draft->>'phone'))=0 then raise exception 'REQUIRED_FIELDS'; end if;
  perform validate_content(s.draft,p_site);
  insert into revisions(site_id,content,draft_version) values(p_site,s.draft,p_expected) returning id into rev;
  insert into submissions(site_id,revision_id,request_key) values(p_site,rev,p_key) returning * into sub;
  return to_jsonb(sub);
end $$;
create function public.review_submission(p_site uuid,p_submission uuid,p_revision uuid,p_action text,p_feedback text,p_key uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare sub submissions; pub publications;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  perform 1 from sites where id=p_site for update;
  select * into pub from publications where site_id=p_site and operation_key=p_key;
  if found then
    if pub.revision_id<>p_revision then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return to_jsonb(pub);
  end if;
  select * into sub from submissions where id=p_submission and site_id=p_site and revision_id=p_revision for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if sub.status='published' and p_action='approve' then return to_jsonb(sub); end if;
  if sub.status='changes_requested' and p_action='changes' then return to_jsonb(sub); end if;
  if sub.status<>'pending' then raise exception 'ALREADY_REVIEWED'; end if;
  if p_action='changes' then
    if length(trim(p_feedback))=0 or length(p_feedback)>4000 then raise exception 'FEEDBACK_REQUIRED'; end if;
    update submissions set status='changes_requested',feedback=p_feedback,reviewer_id=auth.uid(),reviewed_at=now() where id=p_submission returning * into sub;
    return to_jsonb(sub);
  elsif p_action='approve' then
    -- Atomic: any failure below rolls back both history and the public pointer.
    insert into publications(site_id,revision_id,operation_key,kind,actor_id) values(p_site,p_revision,p_key,'approval',auth.uid()) returning * into pub;
    update sites set published_revision=p_revision where id=p_site;
    update submissions set status='published',reviewer_id=auth.uid(),reviewed_at=now() where id=p_submission;
    return to_jsonb(pub);
  else raise exception 'INVALID_ACTION'; end if;
end $$;
create function public.restore_publication(p_site uuid,p_revision uuid,p_expected uuid,p_key uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites; pub publications;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into s from sites where id=p_site for update;
  select * into pub from publications where site_id=p_site and operation_key=p_key;
  if found then
    if pub.revision_id<>p_revision then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return to_jsonb(pub);
  end if;
  if s.published_revision is distinct from p_expected then raise exception 'VERSION_CONFLICT'; end if;
  if not exists(select 1 from publications where site_id=p_site and revision_id=p_revision) then raise exception 'NOT_PUBLISHED'; end if;
  insert into publications(site_id,revision_id,operation_key,kind,actor_id) values(p_site,p_revision,p_key,'restore',auth.uid()) returning * into pub;
  update sites set published_revision=p_revision where id=p_site;
  return to_jsonb(pub);
end $$;
create function public.register_asset(p_site uuid,p_id uuid,p_name text,p_bytes integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare a assets;
begin
  if not exists(select 1 from sites where id=p_site and owner_id=auth.uid()) then raise exception 'FORBIDDEN'; end if;
  if (select count(*) from assets where site_id=p_site and deleted_at is null)>=250 then raise exception 'ASSET_LIMIT'; end if;
  insert into assets(id,site_id,owner_id,path,original_name,bytes) values(p_id,p_site,auth.uid(),auth.uid()::text||'/'||p_site::text||'/'||p_id::text||'.webp',left(p_name,200),p_bytes) returning * into a;
  return to_jsonb(a);
end $$;
create function public.remove_asset(p_site uuid,p_asset uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare a assets; s sites;
begin
  select * into s from sites where id=p_site and owner_id=auth.uid() for update;
  if not found then raise exception 'FORBIDDEN'; end if;
  if p_asset in (select content_asset_ids(s.draft)) or exists(select 1 from revisions where site_id=p_site and p_asset in (select content_asset_ids(content))) then raise exception 'ASSET_IN_USE'; end if;
  update assets set deleted_at=now() where id=p_asset and site_id=p_site returning * into a;
  if not found then raise exception 'NOT_FOUND'; end if;
  return to_jsonb(a);
end $$;
create function public.save_domain(p_site uuid,p_hostname text,p_status text,p_expires date,p_notes text) returns jsonb language plpgsql security definer set search_path=public as $$
declare d domains;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  if exists(select 1 from domains where hostname=p_hostname and site_id<>p_site) then raise exception 'DOMAIN_TAKEN'; end if;
  insert into domains(hostname,site_id,status,expires_on,notes) values(p_hostname,p_site,p_status,p_expires,left(p_notes,2000))
    on conflict(hostname) do update set status=excluded.status,expires_on=excluded.expires_on,notes=excluded.notes,updated_at=now() where domains.site_id=excluded.site_id returning * into d;
  if d.hostname is null then raise exception 'DOMAIN_TAKEN'; end if;
  return to_jsonb(d);
end $$;
create function public.get_site_detail(p_site uuid) returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not can_access_site(p_site) then raise exception 'FORBIDDEN'; end if;
  return jsonb_build_object(
    'site',(select to_jsonb(s) from sites s where id=p_site),
    'owner_email',(select p.email from profiles p join sites s on s.owner_id=p.id where s.id=p_site),
    'revisions',coalesce((select jsonb_agg(r order by created_at desc) from revisions r where site_id=p_site),'[]'::jsonb),
    'submissions',coalesce((select jsonb_agg(q order by created_at desc) from submissions q where site_id=p_site),'[]'::jsonb),
    'publications',coalesce((select jsonb_agg(p order by created_at desc) from publications p where site_id=p_site),'[]'::jsonb),
    'assets',coalesce((select jsonb_agg(a order by created_at desc) from assets a where site_id=p_site and deleted_at is null),'[]'::jsonb),
    'domains',coalesce((select jsonb_agg(d order by hostname) from domains d where site_id=p_site),'[]'::jsonb));
end $$;
create function public.list_sites() returns jsonb language sql stable security definer set search_path=public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'slug',s.slug,'name',s.draft->>'name','email',p.email,'updated_at',s.updated_at,'published_revision',s.published_revision,'pending',exists(select 1 from submissions q where q.site_id=s.id and q.status='pending')) order by s.updated_at desc),'[]'::jsonb)
  from sites s join profiles p on p.id=s.owner_id where s.owner_id=auth.uid() or is_admin()
$$;
create function public.get_public_site(p_slug text default null,p_host text default null) returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('id',s.id,'slug',s.slug,'revision_id',r.id,'content',r.content)
  from sites s join revisions r on r.id=s.published_revision and r.site_id=s.id
  where (p_host is null and s.slug=p_slug) or (p_slug is null and exists(select 1 from domains d where d.site_id=s.id and d.hostname=p_host and d.status='connected'))
$$;
create function public.get_public_asset(p_id uuid,p_host text default null) returns jsonb language sql stable security definer set search_path=public as $$
  select to_jsonb(a) from assets a join sites s on s.id=a.site_id join revisions r on r.id=s.published_revision
  where a.id=p_id and a.deleted_at is null and p_id in (select content_asset_ids(r.content))
    and (p_host is null or exists(select 1 from domains d where d.site_id=s.id and d.hostname=p_host and d.status='connected'))
$$;
-- Content and history cannot be rewritten, including by accidental application updates.
create function public.reject_immutable_change() returns trigger language plpgsql as $$ begin raise exception 'IMMUTABLE_VERSION'; end $$;
create trigger immutable_revision before update or delete on revisions for each row execute function reject_immutable_change();
create trigger immutable_publication before update or delete on publications for each row execute function reject_immutable_change();

revoke execute on all functions in schema public from public,anon,authenticated;
grant execute on function public.is_admin(),public.can_access_site(uuid) to authenticated;
grant execute on function public.create_site(text,jsonb),public.save_draft(uuid,integer,jsonb),public.submit_site(uuid,integer,uuid),public.review_submission(uuid,uuid,uuid,text,text,uuid),public.restore_publication(uuid,uuid,uuid,uuid),public.register_asset(uuid,uuid,text,integer),public.remove_asset(uuid,uuid),public.save_domain(uuid,text,text,date,text),public.get_site_detail(uuid),public.list_sites() to authenticated;
grant execute on function public.get_public_site(text,text),public.get_public_asset(uuid,text) to anon,authenticated;
