-- Private consultation history, production progress, files and evidence requests.
alter table public.inquiries add column customer_id uuid references public.profiles(id);
create table public.projects (
 id uuid primary key default gen_random_uuid(), inquiry_id uuid unique references inquiries(id) on delete set null,
 customer_id uuid not null references profiles(id), site_id uuid unique references sites(id),
 stage text not null default 'consultation' check(stage in ('consultation','quote','materials','production','review','published','closed')),
 message text not null default '' check(length(message)<=3000),
 quote jsonb not null default '{}' check(jsonb_typeof(quote)='object' and octet_length(quote::text)<8000),
 quote_seen_at timestamptz, version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_events (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id),
 stage text not null, message text not null, quote jsonb not null, version integer not null,
 created_at timestamptz not null default now(), unique(project_id,version)
);
create table public.project_files (
 id uuid primary key, project_id uuid not null references projects(id), uploader_id uuid not null references profiles(id),
 path text unique not null, name text not null check(length(name)<=200), bytes integer not null check(bytes between 1 and 3000000),
 mime text not null check(mime in ('image/webp','application/pdf')), consent_at timestamptz not null default now(), consent_version text not null default 'materials-2026-10-03', created_at timestamptz not null default now(), deleted_at timestamptz
);
create function public.can_access_project(p_project uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from projects where id=p_project and (customer_id=auth.uid() or is_admin()))
$$;
alter table projects enable row level security;
alter table project_events enable row level security;
alter table project_files enable row level security;
create policy project_read on projects for select to authenticated using(customer_id=auth.uid() or is_admin());
create policy event_read on project_events for select to authenticated using(can_access_project(project_id));
create policy project_file_read on project_files for select to authenticated using(can_access_project(project_id) and deleted_at is null);
create policy inquiry_customer_read on inquiries for select to authenticated using(customer_id=auth.uid());
revoke all on projects,project_events,project_files from anon,authenticated;
grant select on projects,project_events,project_files to authenticated;

create function public.submit_customer_inquiry(p_key uuid,p_name text,p_business text,p_method text,p_contact text,p_message text,p_selection jsonb,p_contact_hash text,p_consent text,p_customer uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid; owner uuid;
begin
 result := submit_inquiry(p_key,p_name,p_business,p_method,p_contact,p_message,p_selection,p_contact_hash,p_consent);
 select customer_id into owner from inquiries where id=result;
 if owner is not null and owner is distinct from p_customer then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
 if p_customer is not null then update inquiries set customer_id=p_customer where id=result; end if;
 return result;
end $$;
create function public.get_my_inquiries() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 return coalesce((select jsonb_agg(to_jsonb(i)-'notes'-'contact_hash'-'key' order by created_at desc) from inquiries i where customer_id=auth.uid()),'[]');
end $$;
create function public.start_project(p_inquiry uuid,p_customer uuid,p_site uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare p projects;
begin
 if not is_admin() then raise exception 'FORBIDDEN'; end if;
 perform 1 from profiles where id=p_customer for update;
 if not found or exists(select 1 from admin_users where user_id=p_customer) then raise exception 'INVALID_CUSTOMER'; end if;
 if p_site is not null and not exists(select 1 from sites where id=p_site and owner_id=p_customer) then raise exception 'FORBIDDEN'; end if;
 if p_inquiry is not null then
   perform 1 from inquiries where id=p_inquiry for update;
   if not found then raise exception 'NOT_FOUND'; end if;
   if exists(select 1 from inquiries where id=p_inquiry and customer_id is not null and customer_id<>p_customer) then raise exception 'FORBIDDEN'; end if;
   select * into p from projects where inquiry_id=p_inquiry;
   if found then
     if p.customer_id<>p_customer then raise exception 'FORBIDDEN'; end if;
     if p.site_id is null and p_site is not null then update projects set site_id=p_site where id=p.id returning * into p; end if;
     return to_jsonb(p);
   end if;
   update inquiries set customer_id=p_customer where id=p_inquiry;
 end if;
 if p_site is not null then
   select * into p from projects where site_id=p_site;
   if found then return to_jsonb(p); end if;
 end if;
 insert into projects(inquiry_id,customer_id,site_id) values(p_inquiry,p_customer,p_site) returning * into p;
 insert into project_events(project_id,stage,message,quote,version) values(p.id,p.stage,p.message,p.quote,p.version);
 return to_jsonb(p);
end $$;
create function public.list_projects() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('email',u.email) order by p.updated_at desc),'[]') from projects p join profiles u on u.id=p.customer_id where p.customer_id=auth.uid() or is_admin()
$$;
create function public.get_project(p_project uuid) returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not can_access_project(p_project) then raise exception 'FORBIDDEN'; end if;
 return jsonb_build_object('project',(select to_jsonb(p) from projects p where id=p_project),
 'events',coalesce((select jsonb_agg(e order by version desc) from project_events e where project_id=p_project),'[]'),
 'files',coalesce((select jsonb_agg(f order by created_at desc) from project_files f where project_id=p_project and deleted_at is null),'[]'));
end $$;
create function public.update_project(p_project uuid,p_expected integer,p_stage text,p_message text,p_quote jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare p projects; field text;
begin
 if not is_admin() then raise exception 'FORBIDDEN'; end if;
 select * into p from projects where id=p_project for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if p.version<>p_expected then raise exception 'VERSION_CONFLICT'; end if;
 if jsonb_typeof(p_quote) is distinct from 'object' or coalesce(p_quote->>'scope','')='' or length(p_quote->>'scope')>3000 then raise exception 'INVALID_QUOTE'; end if;
 foreach field in array array['setup','monthly','extras'] loop
   if jsonb_typeof(p_quote->field) is distinct from 'number' or (p_quote->>field)::numeric<0 or (p_quote->>field)::numeric>100000000 or (p_quote->>field)::numeric<>trunc((p_quote->>field)::numeric) then raise exception 'INVALID_QUOTE'; end if;
 end loop;
 if p_stage='published' and not exists(select 1 from sites where id=p.site_id and published_revision is not null) then raise exception 'NOT_PUBLISHED'; end if;
 update projects set stage=p_stage,message=p_message,quote=p_quote,quote_seen_at=case when quote=p_quote then quote_seen_at else null end,version=version+1,updated_at=now() where id=p.id returning * into p;
 insert into project_events(project_id,stage,message,quote,version) values(p.id,p.stage,p.message,p.quote,p.version);
 return to_jsonb(p);
end $$;
create function public.see_project_quote(p_project uuid,p_expected integer) returns void language plpgsql security definer set search_path=public as $$
begin
 update projects set quote_seen_at=coalesce(quote_seen_at,now()) where id=p_project and customer_id=auth.uid() and version=p_expected;
 if not found then raise exception 'VERSION_CONFLICT'; end if;
end $$;
create function public.register_project_file(p_project uuid,p_id uuid,p_name text,p_bytes integer,p_mime text,p_consent boolean) returns jsonb language plpgsql security definer set search_path=public as $$
declare f project_files;
begin
 if not can_access_project(p_project) then raise exception 'FORBIDDEN'; end if;
 if p_consent is distinct from true then raise exception 'CONSENT_REQUIRED'; end if;
 perform 1 from projects where id=p_project for update;
 if (select count(*) from project_files where project_id=p_project and deleted_at is null)>=50 then raise exception 'ASSET_LIMIT'; end if;
 insert into project_files(id,project_id,uploader_id,path,name,bytes,mime) values(p_id,p_project,auth.uid(),p_project::text||'/'||p_id::text||case when p_mime='application/pdf' then '.pdf' else '.webp' end,left(p_name,200),p_bytes,p_mime) returning * into f;
 return to_jsonb(f);
end $$;
create function public.remove_project_file(p_project uuid,p_file uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare f project_files;
begin
 if not can_access_project(p_project) then raise exception 'FORBIDDEN'; end if;
 update project_files set deleted_at=now() where id=p_file and project_id=p_project returning * into f;
 if not found then raise exception 'NOT_FOUND'; end if;
 return to_jsonb(f);
end $$;

-- Receipts are requests for manual issuing, never automatic tax document issuance.
create table public.evidence_requests (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references profiles(id), project_id uuid not null references projects(id),
 request_key uuid not null unique, consent_at timestamptz not null default now(), consent_version text not null default 'evidence-2026-10-03', kind text not null check(kind in ('cash_personal','cash_business','tax_invoice')),
 identifier_type text not null check(identifier_type in ('phone','card','business')), identifier text not null check(identifier ~ '^[0-9]{10,19}$'), name text not null check(length(name) between 1 and 120), email text not null check(length(email)<=254),
 status text not null default 'requested' check(status in ('requested','issued','rejected','withdrawn')), reference text not null default '' check(length(reference)<=200),
 message text not null default '' check(length(message)<=2000), created_at timestamptz not null default now(), issued_at timestamptz
);
alter table evidence_requests enable row level security;
create policy evidence_read on evidence_requests for select to authenticated using(customer_id=auth.uid() or is_admin());
revoke all on evidence_requests from anon,authenticated;
grant select on evidence_requests to authenticated;
create function public.request_evidence(p_project uuid,p_key uuid,p_kind text,p_identifier text,p_name text,p_email text,p_type text,p_consent boolean) returns uuid language plpgsql security definer set search_path=public as $$
declare r evidence_requests;
begin
 if p_consent is distinct from true then raise exception 'CONSENT_REQUIRED'; end if;
 if (p_kind='cash_personal' and ((p_type='phone' and p_identifier !~ '^01[0-9]{8,9}$') or (p_type='card' and p_identifier !~ '^[0-9]{16,19}$') or p_type not in ('phone','card'))) or (p_kind<>'cash_personal' and (p_type<>'business' or p_identifier !~ '^[0-9]{10}$')) then raise exception 'INVALID_IDENTIFIER'; end if;
 perform 1 from projects where id=p_project and customer_id=auth.uid() for update;
 if not found then raise exception 'FORBIDDEN'; end if;
 select * into r from evidence_requests where request_key=p_key;
 if found then
  if r.customer_id<>auth.uid() or r.project_id<>p_project or r.kind<>p_kind or r.identifier<>p_identifier or r.name<>p_name or r.email<>p_email or r.identifier_type<>p_type then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
  return r.id;
 end if;
 if exists(select 1 from evidence_requests where project_id=p_project and status='requested') then raise exception 'ALREADY_PENDING'; end if;
 if p_kind in ('cash_business','tax_invoice') and length(p_identifier)<>10 then raise exception 'INVALID_IDENTIFIER'; end if;
 insert into evidence_requests(customer_id,project_id,request_key,kind,identifier,name,email,identifier_type) values(auth.uid(),p_project,p_key,p_kind,p_identifier,p_name,p_email,p_type) returning * into r;
 return r.id;
end $$;
create function public.list_evidence() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(to_jsonb(r) order by created_at desc),'[]') from evidence_requests r where customer_id=auth.uid() or is_admin()
$$;
create function public.update_evidence(p_id uuid,p_status text,p_reference text,p_message text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then
  if p_status<>'withdrawn' then raise exception 'FORBIDDEN'; end if;
  update evidence_requests set status='withdrawn',identifier=repeat('0',10),name='삭제된 요청',email='' where id=p_id and customer_id=auth.uid() and status='requested';
 else
  if p_status not in ('issued','rejected') or (p_status='issued' and length(trim(p_reference))=0) then raise exception 'INVALID_ACTION'; end if;
  update evidence_requests set status=p_status,reference=p_reference,message=p_message,issued_at=case when p_status='issued' then now() else null end where id=p_id and status='requested';
 end if;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
-- Customer table reads must never expose operator-only inquiry notes or idempotency keys.
revoke select on inquiries from authenticated;
grant select(id,name,business,method,contact,message,selection,consent_version,consent_at,status,created_at,updated_at,customer_id) on inquiries to authenticated;
revoke all on function public.submit_customer_inquiry(uuid,text,text,text,text,text,jsonb,text,text,uuid) from public,anon,authenticated;
grant execute on function public.submit_customer_inquiry(uuid,text,text,text,text,text,jsonb,text,text,uuid) to service_role;
revoke all on function public.can_access_project(uuid),public.get_my_inquiries(),public.start_project(uuid,uuid,uuid),public.list_projects(),public.get_project(uuid),public.update_project(uuid,integer,text,text,jsonb),public.see_project_quote(uuid,integer),public.register_project_file(uuid,uuid,text,integer,text,boolean),public.remove_project_file(uuid,uuid),public.request_evidence(uuid,uuid,text,text,text,text,text,boolean),public.list_evidence(),public.update_evidence(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.can_access_project(uuid),public.get_my_inquiries(),public.start_project(uuid,uuid,uuid),public.list_projects(),public.get_project(uuid),public.update_project(uuid,integer,text,text,jsonb),public.see_project_quote(uuid,integer),public.register_project_file(uuid,uuid,text,integer,text,boolean),public.remove_project_file(uuid,uuid),public.request_evidence(uuid,uuid,text,text,text,text,text,boolean),public.list_evidence(),public.update_evidence(uuid,text,text,text) to authenticated;

create trigger immutable_project_event before update or delete on project_events for each row execute function reject_immutable_change();
