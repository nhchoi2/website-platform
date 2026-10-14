-- Customer-facing design proposals are separate immutable snapshots, never site drafts.
-- A random 192-bit share token is hashed by the server. No public table listing.
create table public.design_proposals (
 id uuid primary key,
 token_hash text unique not null check(token_hash ~ '^[a-f0-9]{64}$'),
 content jsonb not null check(jsonb_typeof(content)='object' and octet_length(content::text)<200000),
 selection text check(selection in ('yongs','bamboo','grill')),
 selected_at timestamptz,
 published_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.design_proposals enable row level security;
revoke all on public.design_proposals from public,anon,authenticated;
grant select on public.design_proposals to authenticated;
create policy proposals_admin_read on public.design_proposals for select to authenticated using(public.is_admin());

-- Provisioning is a narrow server-only operation; a published snapshot cannot be replaced.
create function public.create_design_proposal(p_id uuid,p_hash text,p_content jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
begin
 if p_id is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or coalesce(jsonb_typeof(p_content),'null')<>'object'
 or coalesce(jsonb_typeof(p_content->'images'),'null')<>'array' then raise exception 'INVALID_PROPOSAL'; end if;
 if jsonb_array_length(p_content->'images') not between 1 and 200
 or coalesce(length(p_content->>'name'),0) not between 1 and 120 then raise exception 'INVALID_PROPOSAL'; end if;
 if exists(select 1 from design_proposals where id=p_id) then
   if exists(select 1 from design_proposals where id=p_id and token_hash=p_hash and content=p_content and revoked_at is null) then return p_id; end if;
   raise exception 'IDEMPOTENCY_CONFLICT';
 end if;
 insert into design_proposals(id,token_hash,content) values(p_id,p_hash,p_content);
 return p_id;
end $$;

create function public.publish_design_proposal(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 update design_proposals set published_at=coalesce(published_at,now()) where id=p_id and revoked_at is null;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;

create function public.get_design_proposal(p_hash text) returns jsonb
language sql stable security definer set search_path=public as $$
 select jsonb_build_object('id',id,'content',content,'selection',selection)
 from design_proposals where token_hash=p_hash and published_at is not null and revoked_at is null;
$$;

create function public.select_design_proposal(p_hash text,p_style text) returns text
language plpgsql security definer set search_path=public as $$
begin
 if p_style is null or p_style not in ('yongs','bamboo','grill') then raise exception 'INVALID_STYLE'; end if;
 update design_proposals set selection=p_style,selected_at=now()
 where token_hash=p_hash and published_at is not null and revoked_at is null and selection is distinct from p_style;
 if not found and not exists(select 1 from design_proposals where token_hash=p_hash and published_at is not null and revoked_at is null) then raise exception 'NOT_FOUND'; end if;
 return p_style;
end $$;

create function public.revoke_design_proposal(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 update design_proposals set revoked_at=coalesce(revoked_at,now()) where id=p_id;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;

revoke execute on function public.create_design_proposal(uuid,text,jsonb), public.publish_design_proposal(uuid),public.get_design_proposal(text),public.select_design_proposal(text,text),public.revoke_design_proposal(uuid) from public,anon,authenticated;
grant execute on function public.create_design_proposal(uuid,text,jsonb),public.publish_design_proposal(uuid) to service_role;
grant execute on function public.get_design_proposal(text),public.select_design_proposal(text,text) to anon,authenticated;
grant execute on function public.revoke_design_proposal(uuid) to authenticated;

create function public.list_design_proposals() returns jsonb
language plpgsql stable security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',content->>'name','selection',selection,'selected_at',selected_at,'published_at',published_at,'revoked_at',revoked_at,'created_at',created_at) order by created_at desc) from design_proposals),'[]'::jsonb);
end $$;
revoke execute on function public.list_design_proposals() from public,anon,authenticated;
grant execute on function public.list_design_proposals() to authenticated;
