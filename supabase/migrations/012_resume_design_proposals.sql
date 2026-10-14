-- Restore the same customer share link without changing its snapshot or images.
create function public.resume_design_proposal(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
 update design_proposals set revoked_at=null where id=p_id and published_at is not null;
 if not found then raise exception 'NOT_FOUND'; end if;
end $$;
revoke execute on function public.resume_design_proposal(uuid) from public,anon,authenticated;
grant execute on function public.resume_design_proposal(uuid) to authenticated;
