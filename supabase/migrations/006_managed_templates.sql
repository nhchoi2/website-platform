-- Existing sites and immutable published revisions are preserved.
alter table public.assets add column mime text not null default 'image/webp' check(mime in ('image/webp','application/pdf'));
create or replace function public.content_asset_ids(p_content jsonb) returns setof uuid language sql immutable set search_path=public as $$
 select (p->>'assetId')::uuid from jsonb_array_elements(p_content->'photos') p
 union select (m->>'imageId')::uuid from jsonb_array_elements(p_content->'menus') m where m->>'imageId' is not null
 union select (p_content->>'logoId')::uuid where p_content->>'logoId' is not null
 union select (p_content->>'iconId')::uuid where p_content->>'iconId' is not null
 union select (t->>'imageId')::uuid from jsonb_array_elements(coalesce(p_content->'team','[]')) t where t->>'imageId' is not null
 union select a::text::uuid from jsonb_array_elements(coalesce(p_content->'posts','[]')) p, jsonb_array_elements_text(p->'attachments') a
$$;
create or replace function public.validate_content(p_content jsonb,p_site uuid) returns void language plpgsql security definer set search_path=public as $$
declare k text; v jsonb;
begin
  if jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text)>150000
    or coalesce(p_content->>'template','') not in ('hyehwa','cafe','salon','fitness','market','professional','care') or coalesce(p_content->>'theme','') not in ('olive','charcoal','warm') then raise exception 'INVALID_CONTENT'; end if;
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

  if p_content ? 'customTheme' and jsonb_typeof(p_content->'customTheme') is distinct from 'boolean' then raise exception 'INVALID_CONTENT'; end if;
  if p_content ? 'layout' and coalesce(p_content->>'layout','') not in ('classic','catalog') then raise exception 'INVALID_CONTENT'; end if;
  if p_content ? 'options' then
    v := p_content->'options';
    if jsonb_typeof(v) is distinct from 'object' or coalesce(v->>'pages','') not in ('1','3','4') or coalesce(v->>'nav','') not in ('left','center','right') or coalesce(v->>'mobileNav','') not in ('expanded','hamburger')
      or jsonb_typeof(v->'features') is distinct from 'array' or jsonb_array_length(v->'features')>13 or jsonb_typeof(v->'links') is distinct from 'object'
      or exists(select 1 from jsonb_array_elements_text(v->'features') f where f not in ('gallery','priceTable','team','schedule','news','process','consult','reserve','place','kakao','notice','faq','top'))
      or exists(select 1 from jsonb_each_text(v->'links') l where l.key not in ('consult','reserve','place','kakao') or l.value !~ '^https://' or length(l.value)>500) then raise exception 'INVALID_CONTENT'; end if;
  end if;
  foreach k in array array['team','schedule','faq','process','posts'] loop
    if p_content ? k and (jsonb_typeof(p_content->k) is distinct from 'array' or jsonb_array_length(p_content->k)>case k when 'team' then 20 when 'schedule' then 7 when 'faq' then 30 when 'process' then 10 else 50 end) then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(coalesce(p_content->'team','[]')) loop
    if v->>'id' is null then raise exception 'INVALID_CONTENT'; end if;
    perform (v->>'id')::uuid;
    if jsonb_typeof(v->'name') is distinct from 'string' or length(v->>'name')>80 or jsonb_typeof(v->'role') is distinct from 'string' or length(v->>'role')>200 or not (v ? 'imageId') then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(coalesce(p_content->'schedule','[]')) loop
    if jsonb_typeof(v->'day') is distinct from 'string' or length(v->>'day')>20 or jsonb_typeof(v->'hours') is distinct from 'string' or length(v->>'hours')>200 then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(coalesce(p_content->'faq','[]')) loop
    if v->>'id' is null then raise exception 'INVALID_CONTENT'; end if;
    perform (v->>'id')::uuid;
    if jsonb_typeof(v->'question') is distinct from 'string' or length(v->>'question')>200 or jsonb_typeof(v->'answer') is distinct from 'string' or length(v->>'answer')>2000 then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  for v in select * from jsonb_array_elements(coalesce(p_content->'process','[]')) loop
    if v->>'id' is null then raise exception 'INVALID_CONTENT'; end if;
    perform (v->>'id')::uuid;
    if jsonb_typeof(v->'title') is distinct from 'string' or length(v->>'title')>80 or jsonb_typeof(v->'description') is distinct from 'string' or length(v->>'description')>500 then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  foreach k in array array['serviceLabel','parking','notice'] loop
    if p_content ? k and (jsonb_typeof(p_content->k) is distinct from 'string' or length(p_content->>k)>1000) then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  if p_content ? 'map' and (jsonb_typeof(p_content->'map') is distinct from 'object' or jsonb_typeof(p_content->'map'->'enabled') is distinct from 'boolean' or jsonb_typeof(p_content->'map'->'query') is distinct from 'string' or length(p_content->'map'->>'query')>500) then raise exception 'INVALID_CONTENT'; end if;
  for v in select * from jsonb_array_elements(coalesce(p_content->'posts','[]')) loop
    perform (v->>'id')::uuid;
    if jsonb_typeof(v->'title') is distinct from 'string' or length(v->>'title')>120 or jsonb_typeof(v->'body') is distinct from 'string' or length(v->>'body')>6000 or coalesce(v->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or jsonb_typeof(v->'attachments') is distinct from 'array' or jsonb_array_length(v->'attachments')>5 then raise exception 'INVALID_CONTENT'; end if;
  end loop;
  if exists(select 1 from content_asset_ids(p_content) a join assets f on f.id=a where f.mime='application/pdf' and (a=(p_content->>'logoId')::uuid or a=(p_content->>'iconId')::uuid or a in (select (x->>'assetId')::uuid from jsonb_array_elements(p_content->'photos') x) or a in (select (x->>'imageId')::uuid from jsonb_array_elements(p_content->'menus') x) or a in (select (x->>'imageId')::uuid from jsonb_array_elements(coalesce(p_content->'team','[]')) x))) then raise exception 'INVALID_CONTENT'; end if;
end $$;

create or replace function public.save_draft(p_site uuid,p_expected integer,p_content jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites;
begin
  select * into s from sites where id=p_site and (owner_id=auth.uid() or is_admin()) for update;
  if not found then raise exception 'FORBIDDEN'; end if;
  if s.draft_version<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
  perform validate_content(p_content,p_site);
  update sites set draft=p_content,draft_version=draft_version+1,updated_at=now() where id=p_site returning * into s;
  return to_jsonb(s);
end $$;

create or replace function public.submit_site(p_site uuid,p_expected integer,p_key uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites; sub submissions; rev uuid;
begin
  select * into s from sites where id=p_site and (owner_id=auth.uid() or is_admin()) for update;
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

create or replace function public.register_asset(p_site uuid,p_id uuid,p_name text,p_bytes integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare a assets;
begin
  if not exists(select 1 from sites where id=p_site and (owner_id=auth.uid() or is_admin())) then raise exception 'FORBIDDEN'; end if;
  if (select count(*) from assets where site_id=p_site and deleted_at is null)>=250 then raise exception 'ASSET_LIMIT'; end if;
  insert into assets(id,site_id,owner_id,path,original_name,bytes) values(p_id,p_site,(select owner_id from sites where id=p_site),(select owner_id from sites where id=p_site)::text||'/'||p_site::text||'/'||p_id::text||'.webp',left(p_name,200),p_bytes) returning * into a;
  return to_jsonb(a);
end $$;

create or replace function public.remove_asset(p_site uuid,p_asset uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare a assets; s sites;
begin
  select * into s from sites where id=p_site and (owner_id=auth.uid() or is_admin()) for update;
  if not found then raise exception 'FORBIDDEN'; end if;
  if p_asset in (select content_asset_ids(s.draft)) or exists(select 1 from revisions where site_id=p_site and p_asset in (select content_asset_ids(content))) then raise exception 'ASSET_IN_USE'; end if;
  update assets set deleted_at=now() where id=p_asset and site_id=p_site returning * into a;
  if not found then raise exception 'NOT_FOUND'; end if;
  return to_jsonb(a);
end $$;

create function public.create_customer_site(p_owner uuid,p_slug text,p_content jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare s sites;
begin
 if not is_admin() then raise exception 'FORBIDDEN'; end if;
 perform 1 from profiles where id=p_owner for update;
 if not found or exists(select 1 from admin_users where user_id=p_owner) then raise exception 'INVALID_CUSTOMER'; end if;
 select * into s from sites where owner_id=p_owner;
 if found then return to_jsonb(s); end if;
 perform validate_content(p_content,null);
 insert into sites(owner_id,slug,draft) values(p_owner,p_slug,p_content) returning * into s;
 return to_jsonb(s);
end $$;
create function public.register_document(p_site uuid,p_id uuid,p_name text,p_bytes integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare a assets; owner uuid;
begin
 if not can_access_site(p_site) then raise exception 'FORBIDDEN'; end if;
 if (select count(*) from assets where site_id=p_site and deleted_at is null)>=250 then raise exception 'ASSET_LIMIT'; end if;
 select owner_id into owner from sites where id=p_site;
 insert into assets(id,site_id,owner_id,path,original_name,bytes,mime) values(p_id,p_site,owner,owner::text||'/'||p_site::text||'/'||p_id::text||'.pdf',left(p_name,200),p_bytes,'application/pdf') returning * into a;
 return to_jsonb(a);
end $$;
create or replace function public.get_public_asset(p_id uuid,p_host text default null) returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('id',a.id,'site_id',a.site_id,'path',a.path,'mime',a.mime)
 from assets a join sites s on s.id=a.site_id join revisions r on r.id=s.published_revision
 where a.id=p_id and a.deleted_at is null and p_id in (select content_asset_ids(r.content))
 and (p_host is null or exists(select 1 from domains d where d.site_id=s.id and d.hostname=p_host and d.status='connected'))
$$;
revoke all on function public.create_customer_site(uuid,text,jsonb),public.register_document(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.create_customer_site(uuid,text,jsonb),public.register_document(uuid,uuid,text,integer) to authenticated;
