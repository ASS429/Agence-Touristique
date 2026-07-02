-- =====================================================================
-- Africa Connection Tours — Bucket Storage pour la médiathèque
--
-- À exécuter dans le SQL editor Supabase APRÈS avoir créé le bucket
-- `media` via l'interface (Storage → New bucket → Public: yes).
--
-- Ce fichier configure les policies d'accès :
--   * Lecture publique : n'importe qui peut voir les fichiers
--   * Upload / suppression : uniquement les utilisateurs authentifiés
-- =====================================================================

-- Lecture publique
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Upload authentifié
drop policy if exists "media_auth_insert" on storage.objects;
create policy "media_auth_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media');

-- Mise à jour authentifiée
drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media');

-- Suppression authentifiée
drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media');

-- =====================================================================
-- Fin du fichier 003_storage_bucket.sql
-- =====================================================================
