-- Proposal photos have their own private namespace. No anonymous storage listing/read/write.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('proposal-images','proposal-images',false,3000000,array['image/webp'])
on conflict(id) do update set public=false,file_size_limit=3000000,allowed_mime_types=array['image/webp'];
-- No object policies: server checks a valid published share link before signing images.
