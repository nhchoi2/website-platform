-- Durable notification outbox; sending failures cannot undo a saved consultation.
create table public.notification_jobs (
 id uuid primary key default gen_random_uuid(), inquiry_id uuid references inquiries(id) on delete cascade, project_id uuid references projects(id) on delete cascade,
 kind text not null check(kind in ('inquiry_admin','inquiry_receipt','project_update')),
 version integer not null default 1, recipient text not null, status text not null default 'queued' check(status in ('queued','sending','sent','failed','unknown','local')),
 attempts integer not null default 0, lease_until timestamptz, first_attempt_at timestamptz, provider_id text, error text not null default '', created_at timestamptz not null default now(),
 check((inquiry_id is null) <> (project_id is null))
);
create unique index notification_inquiry_unique on notification_jobs(inquiry_id,kind) where inquiry_id is not null;
create unique index notification_project_unique on notification_jobs(project_id,version,kind) where project_id is not null;
alter table notification_jobs enable row level security;
revoke all on notification_jobs from anon,authenticated;
create function public.enqueue_inquiry_notifications(p_inquiry uuid,p_admin_email text) returns void language plpgsql security definer set search_path=public as $$
declare i inquiries;
begin
 select * into i from inquiries where id=p_inquiry;
 if not found then raise exception 'NOT_FOUND'; end if;
 insert into notification_jobs(inquiry_id,kind,recipient) values(i.id,'inquiry_admin',p_admin_email) on conflict do nothing;
 if i.method='email' then insert into notification_jobs(inquiry_id,kind,recipient) values(i.id,'inquiry_receipt',i.contact) on conflict do nothing; end if;
end $$;
create function public.enqueue_project_notification() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.version<>old.version then
  insert into notification_jobs(project_id,kind,version,recipient) values(new.id,'project_update',new.version,(select email from profiles where id=new.customer_id)) on conflict do nothing;
 end if;
 return new;
end $$;
create trigger project_notification after update on projects for each row execute function enqueue_project_notification();
create function public.claim_notifications(p_limit integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
 with picked as (select id from notification_jobs where attempts<5 and (status in ('queued','failed','unknown') or (status='sending' and lease_until<now()))
   and (first_attempt_at is null or first_attempt_at>now()-interval '23 hours') order by created_at limit greatest(1,least(p_limit,10)) for update skip locked),
 updated as (update notification_jobs j set status='sending',attempts=attempts+1,lease_until=now()+interval '2 minutes',first_attempt_at=coalesce(first_attempt_at,now()) from picked where j.id=picked.id returning j.*)
 select coalesce(jsonb_agg(updated),'[]') into result from updated;
 return result;
end $$;
create function public.finish_notification(p_id uuid,p_status text,p_provider text,p_error text) returns void language plpgsql security definer set search_path=public as $$
begin
 if p_status not in ('sent','failed','unknown','local') then raise exception 'INVALID_ACTION'; end if;
 update notification_jobs set status=p_status,provider_id=p_provider,error=left(p_error,100),lease_until=null where id=p_id and status='sending';
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
create function public.list_notifications() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'FORBIDDEN'; end if;
 return coalesce((select jsonb_agg(j order by created_at desc) from (select * from notification_jobs order by created_at desc limit 200) j),'[]');
end $$;
revoke all on function public.enqueue_inquiry_notifications(uuid,text),public.claim_notifications(integer),public.finish_notification(uuid,text,text,text),public.list_notifications(),public.enqueue_project_notification() from public,anon,authenticated;
grant execute on function public.enqueue_inquiry_notifications(uuid,text),public.claim_notifications(integer),public.finish_notification(uuid,text,text,text) to service_role;
grant execute on function public.list_notifications() to authenticated;
create function public.submit_notified_inquiry(p_key uuid,p_name text,p_business text,p_method text,p_contact text,p_message text,p_selection jsonb,p_contact_hash text,p_consent text,p_customer uuid,p_admin_email text) returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid;
begin
 result := submit_customer_inquiry(p_key,p_name,p_business,p_method,p_contact,p_message,p_selection,p_contact_hash,p_consent,p_customer);
 perform enqueue_inquiry_notifications(result,p_admin_email);
 return result;
end $$;
revoke all on function public.submit_notified_inquiry(uuid,text,text,text,text,text,jsonb,text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.submit_notified_inquiry(uuid,text,text,text,text,text,jsonb,text,text,uuid,text) to service_role;
-- Publication and restore move connected production projects to the real public state.
create function public.sync_project_publication() returns trigger language plpgsql security definer set search_path=public as $$
declare p projects;
begin
 for p in update projects set stage='published',message='승인한 홈페이지가 공개되었습니다.',version=version+1,updated_at=now() where site_id=new.site_id returning * loop
   insert into project_events(project_id,stage,message,quote,version) values(p.id,p.stage,p.message,p.quote,p.version);
 end loop;
 return new;
end $$;
create trigger published_project after insert on publications for each row execute function sync_project_publication();
revoke all on function public.sync_project_publication() from public,anon,authenticated;
