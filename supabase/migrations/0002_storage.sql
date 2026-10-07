-- Cartario — almacenamiento de imágenes de usuario (Fase 2)
-- Ejecuta este archivo completo en Supabase → SQL Editor → New query.
-- (Es idempotente: se puede volver a ejecutar sin romper nada.)

-- Bucket público para las imágenes que suben los usuarios a sus cartas.
-- Público = cualquiera con la URL puede verla (necesario para compartir la
-- carta en la Fase 4). La escritura sí está restringida por las políticas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-images',
  'card-images',
  true,
  5242880, -- 5 MB por archivo
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Convención de rutas: card-images/<user_id>/<archivo>
-- Así cada usuario solo toca su carpeta.

drop policy if exists "card-images: lectura pública" on storage.objects;
create policy "card-images: lectura pública"
  on storage.objects for select
  using (bucket_id = 'card-images');

drop policy if exists "card-images: subir a tu carpeta" on storage.objects;
create policy "card-images: subir a tu carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "card-images: actualizar lo tuyo" on storage.objects;
create policy "card-images: actualizar lo tuyo"
  on storage.objects for update
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "card-images: borrar lo tuyo" on storage.objects;
create policy "card-images: borrar lo tuyo"
  on storage.objects for delete
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
