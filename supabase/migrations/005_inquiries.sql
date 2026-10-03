-- Anonymous intake is server-only; contact data has no public read/write path.
create table public.inquiries (
 id uuid primary key default gen_random_uuid(), key uuid unique not null,
 name text not null check(length(name) between 1 and 80),
 business text not null check(length(business) between 1 and 120),
 method text not null check(method in ('email','phone')),
 contact text not null check(length(contact) between 1 and 160),
 message text not null check(length(message) between 10 and 3000),
 selection jsonb not null check(jsonb_typeof(selection)='object' and octet_length(selection::text)<8000),
 contact_hash text not null check(length(contact_hash)=64),
 consent_version text not null check(consent_version='consultation-2026-10-03'),
 consent_at timestamptz not null default now(),
 status text not null default 'new' check(status in ('new','contacted','closed')),
 notes text not null default '' check(length(notes)<=3000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index inquiries_created on public.inquiries(created_at desc);
create index inquiries_contact_rate on public.inquiries(contact_hash,created_at);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon,authenticated;
create policy inquiries_admin_read on public.inquiries for select to authenticated using(public.is_admin());
grant select on public.inquiries to authenticated;
create function public.submit_inquiry(p_key uuid,p_name text,p_business text,p_method text,p_contact text,p_message text,p_selection jsonb,p_contact_hash text,p_consent text) returns uuid language plpgsql security definer set search_path=public as $$
declare existing inquiries; result uuid;
begin
 -- Serialize duplicate and rate checks, including concurrent HTTP requests.
 perform pg_advisory_xact_lock(805005);
 select * into existing from inquiries where key=p_key;
 if found then
   if existing.name<>p_name or existing.business<>p_business or existing.method<>p_method or existing.contact<>p_contact or existing.message<>p_message or existing.selection<>p_selection or existing.consent_version<>p_consent then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
   return existing.id;
 end if;
 if (select count(*) from inquiries where contact_hash=p_contact_hash and created_at>now()-interval '1 hour')>=3
 or (select count(*) from inquiries where created_at>now()-interval '1 day')>=100 then raise exception 'RATE_LIMIT'; end if;
 insert into inquiries(key,name,business,method,contact,message,selection,contact_hash,consent_version) values(p_key,p_name,p_business,p_method,p_contact,p_message,p_selection,p_contact_hash,p_consent) returning id into result;
 return result;
end $$;
create function public.list_inquiries() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 return coalesce((select jsonb_agg(to_jsonb(i)-'contact_hash' order by created_at desc) from (select * from inquiries order by created_at desc limit 200) i),'[]'::jsonb);
end $$;
create function public.update_inquiry(p_id uuid,p_status text,p_notes text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 update inquiries set status=p_status, notes=p_notes, updated_at=now() where id=p_id;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
revoke execute on function public.submit_inquiry(uuid,text,text,text,text,text,jsonb,text,text),public.list_inquiries(),public.update_inquiry(uuid,text,text) from public,anon,authenticated;
grant execute on function public.submit_inquiry(uuid,text,text,text,text,text,jsonb,text,text) to service_role;
grant execute on function public.list_inquiries(),public.update_inquiry(uuid,text,text) to authenticated;
-- Explicit operator deletion handles completion/withdrawal; no anonymous deletion token.
create function public.delete_inquiry(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 delete from inquiries where id=p_id;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
revoke execute on function public.delete_inquiry(uuid) from public,anon,authenticated;
grant execute on function public.delete_inquiry(uuid) to authenticated;
