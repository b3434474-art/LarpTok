-- LarpTok media storage
-- Public files can be served directly, while uploads/deletes remain authenticated.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can upload their own media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "Users can view their uploaded media metadata"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and owner_id = (select auth.uid()::text)
);

create policy "Users can delete their own media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media'
  and owner_id = (select auth.uid()::text)
);