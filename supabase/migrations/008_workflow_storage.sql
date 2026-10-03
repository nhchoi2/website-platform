-- Apply only on Supabase (Storage schema is not part of the local emulator).
update storage.buckets set allowed_mime_types=array['image/webp','application/pdf'] where id='restaurant-images';
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('project-files','project-files',false,3000000,array['image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=3000000,allowed_mime_types=array['image/webp','application/pdf'];
create policy project_storage_read on storage.objects for select to authenticated using (
 bucket_id='project-files' and exists(select 1 from public.project_files f where f.path=name and f.deleted_at is null and public.can_access_project(f.project_id))
);
