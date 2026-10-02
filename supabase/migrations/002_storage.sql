-- Private bucket: anonymous users cannot list or fetch draft images.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('restaurant-images','restaurant-images',false,5000000,array['image/webp'])
on conflict(id) do update set public=false,file_size_limit=5000000,allowed_mime_types=array['image/webp'];

create policy restaurant_image_read on storage.objects for select to authenticated using (
  bucket_id='restaurant-images' and exists(select 1 from public.assets a where a.path=name and a.deleted_at is null and public.can_access_site(a.site_id))
);
-- Uploads and deletions are server-only, after authenticated RPC authorization.
-- No client INSERT/UPDATE/DELETE policy: published files are immutable and cannot be overwritten.
