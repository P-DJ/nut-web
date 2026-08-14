-- Run this once in the Supabase SQL Editor. Direct browser access is denied;
-- the backend service role signs short-lived URLs for the private bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('timeline-media', 'timeline-media', false, 47185920, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
