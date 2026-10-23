-- Public bucket for images attached to outreach posts (Buffer needs a public URL).

insert into storage.buckets (id, name, public)
values ('social-images', 'social-images', true)
on conflict (id) do nothing;

create policy social_images_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'social-images');

create policy social_images_authenticated_write on storage.objects
  for insert to authenticated with check (bucket_id = 'social-images');

create policy social_images_authenticated_delete on storage.objects
  for delete to authenticated using (bucket_id = 'social-images');
