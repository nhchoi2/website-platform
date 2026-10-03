-- Private contact details are separate from public restaurant content.
create table public.account_details (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contact_name text not null default '' check(length(contact_name)<=80),
  contact_phone text not null default '' check(contact_phone='' or contact_phone ~ '^0[0-9]{8,10}$'),
  contact_consent_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.account_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null, privacy_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null check(source in ('email_signup','account')),
  unique(user_id,terms_version,privacy_version)
);
alter table public.account_details enable row level security;
alter table public.account_consents enable row level security;
create policy account_details_read on public.account_details for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy account_consents_read on public.account_consents for select to authenticated using(user_id=auth.uid() or public.is_admin());
revoke all on public.account_details,public.account_consents from anon,authenticated;
grant select on public.account_details,public.account_consents to authenticated;

create function public.has_account_consent() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from account_consents where user_id=auth.uid() and terms_version='2026-10-03' and privacy_version='2026-10-03')
$$;
create function public.get_account_details(p_user uuid default null) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare target uuid:=coalesce(p_user,auth.uid());
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
  if target<>auth.uid() and not is_admin() then raise exception 'FORBIDDEN'; end if;
  return jsonb_build_object('contact', (select to_jsonb(d) from account_details d where user_id=target),
    'consents',coalesce((select jsonb_agg(c order by accepted_at desc) from account_consents c where user_id=target),'[]'::jsonb));
end $$;
create function public.accept_account_terms(p_terms text,p_privacy text) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
  if p_terms is distinct from '2026-10-03' or p_privacy is distinct from '2026-10-03' then raise exception 'CONSENT_VERSION'; end if;
  insert into account_consents(user_id,terms_version,privacy_version,source) values(auth.uid(),p_terms,p_privacy,'account') on conflict do nothing;
end $$;
create function public.save_account_contact(p_name text,p_phone text,p_consent boolean) returns jsonb language plpgsql security definer set search_path=public as $$
declare d account_details;
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
  if not has_account_consent() then raise exception 'CONSENT_REQUIRED'; end if;
  if p_name is null or length(p_name)>80 or p_phone is null or (p_phone<>'' and p_phone !~ '^0[0-9]{8,10}$') then raise exception 'INVALID_CONTACT'; end if;
  if (p_name<>'' or p_phone<>'') and p_consent is distinct from true then raise exception 'CONTACT_CONSENT_REQUIRED'; end if;
  insert into account_details(user_id,contact_name,contact_phone,contact_consent_at)
    values(auth.uid(),trim(p_name),p_phone,case when p_name<>'' or p_phone<>'' then now() end)
  on conflict(user_id) do update set contact_name=excluded.contact_name,contact_phone=excluded.contact_phone,contact_consent_at=excluded.contact_consent_at,updated_at=now()
  returning * into d;
  return to_jsonb(d);
end $$;
-- Record the explicit checkbox on email signup. Later metadata changes cannot forge history.
create function public.record_signup_consent() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.raw_user_meta_data->>'terms_version'='2026-10-03'
    and new.raw_user_meta_data->>'privacy_version'='2026-10-03'
    and new.raw_user_meta_data->>'accepted_terms'='true' then
    insert into account_consents(user_id,terms_version,privacy_version,source)
      values(new.id,'2026-10-03','2026-10-03','email_signup') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_signup_consent after insert on auth.users for each row execute function public.record_signup_consent();
create trigger immutable_account_consent before update on public.account_consents for each row execute function public.reject_immutable_change();
revoke execute on function public.record_signup_consent(),public.has_account_consent(),public.get_account_details(uuid),public.accept_account_terms(text,text),public.save_account_contact(text,text,boolean) from public,anon,authenticated;
grant execute on function public.has_account_consent(),public.get_account_details(uuid),public.accept_account_terms(text,text),public.save_account_contact(text,text,boolean) to authenticated;
