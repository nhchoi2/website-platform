-- Show signed-up customers even before they create a site.
create function public.list_customers() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'email',p.email,'site_id',s.id,'slug',s.slug) order by p.email)
    from profiles p left join sites s on s.owner_id=p.id),'[]'::jsonb);
end $$;
create function public.get_own_site() returns uuid language sql stable security definer set search_path=public as $$
  select id from sites where owner_id=auth.uid()
$$;
revoke all on function public.list_customers(),public.get_own_site() from public,anon,authenticated;
grant execute on function public.list_customers(),public.get_own_site() to authenticated;

-- Do not return original upload filenames on anonymous public metadata requests.
create or replace function public.get_public_asset(p_id uuid,p_host text default null) returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('id',a.id,'site_id',a.site_id,'path',a.path)
  from assets a join sites s on s.id=a.site_id join revisions r on r.id=s.published_revision
  where a.id=p_id and a.deleted_at is null and p_id in (select content_asset_ids(r.content))
    and (p_host is null or exists(select 1 from domains d where d.site_id=s.id and d.hostname=p_host and d.status='connected'))
$$;
alter function public.reject_immutable_change() set search_path=public;
