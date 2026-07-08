-- =====================================================================
-- Africa Connection Tours — CORRECTIF SÉCURITÉ CRITIQUE
-- Escalade de privilèges via l'espace client (magic link)
--
-- CONTEXTE DE LA FAILLE
--   L'espace client (#/monespace) crée des comptes Supabase en
--   self-service via magic link (signInWithOtp shouldCreateUser:true).
--   Les policies de 002/003/004 accordent « for all to authenticated
--   using (true) » sur TOUTES les tables de contenu + Storage.
--   → Tout visiteur qui saisit son email devient `authenticated` et
--     obtient les droits d'écriture de l'administrateur, plus la
--     lecture de TOUTES les demandes de devis (données personnelles).
--
-- PRINCIPE DU CORRECTIF
--   On distingue deux niveaux d'authentifiés :
--     * un CLIENT authentifié (magic link) : peut lire/éditer SON profil
--       et voir SES propres demandes — rien d'autre ;
--     * un ADMIN : membre de la table admin_users — a le CRUD complet.
--   La distinction se fait via la fonction is_admin() basée sur
--   l'appartenance à admin_users (et non sur le simple rôle authenticated).
--
-- À EXÉCUTER dans le SQL editor Supabase APRÈS 001→004.
-- Idempotent : ré-exécutable sans erreur.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table des administrateurs autorisés
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'owner',   -- owner | editor | viewer
  created_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Un admin peut lire la liste des admins (utile pour l'écran équipe).
-- Personne ne peut s'auto-ajouter : l'insertion se fait manuellement
-- via le SQL editor (service_role) — jamais depuis le client.
drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 2. Fonction is_admin() — SECURITY DEFINER pour éviter la récursion RLS
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Réécriture des policies « admin » des tables de contenu
--    (remplace using(true) par using(is_admin()))
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'circuits','excursions','ateliers','blog_posts',
    'testimonials','team_members','partners','faq_items'
  ];
begin
  foreach t in array tables loop
    execute format($f$
      drop policy if exists %I on public.%I;
      create policy %I on public.%I
        for all
        to authenticated
        using (public.is_admin())
        with check (public.is_admin());
    $f$, t || '_admin', t, t || '_admin', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. site_settings & media_library
-- ---------------------------------------------------------------------
drop policy if exists site_settings_admin on public.site_settings;
create policy site_settings_admin on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists media_admin on public.media_library;
create policy media_admin on public.media_library
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. contact_requests
--    - lecture : admin voit tout ; un client voit UNIQUEMENT ses
--      propres demandes (match sur l'email du JWT)
--    - update/delete : admin uniquement
--    - insert : inchangé (anon peut soumettre) — durci plus tard par
--      captcha/Edge Function (voir audit §2.2 / §2.7)
-- ---------------------------------------------------------------------
drop policy if exists contact_admin_read on public.contact_requests;
drop policy if exists contact_own_read   on public.contact_requests;
create policy contact_read on public.contact_requests
  for select to authenticated
  using (
    public.is_admin()
    or email = (select auth.jwt() ->> 'email')
  );

drop policy if exists contact_admin_update on public.contact_requests;
create policy contact_admin_update on public.contact_requests
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists contact_admin_delete on public.contact_requests;
create policy contact_admin_delete on public.contact_requests
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. circuit_departures (créée en 004) — écriture admin seulement
-- ---------------------------------------------------------------------
drop policy if exists departures_admin on public.circuit_departures;
create policy departures_admin on public.circuit_departures
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. newsletter_subscribers (créée en 004) — gestion admin seulement
--    (l'insert anon reste ouvert pour l'abonnement public)
-- ---------------------------------------------------------------------
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

drop policy if exists newsletter_admin_update on public.newsletter_subscribers;
create policy newsletter_admin_update on public.newsletter_subscribers
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 8. Storage bucket "media" — upload/update/delete admin seulement
--    (lecture publique conservée)
-- ---------------------------------------------------------------------
drop policy if exists "media_auth_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_insert_dup" on storage.objects;

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
-- APRÈS EXÉCUTION — enrôler le(s) admin(s)
--
--   Récupérer l'UID du compte admin déjà créé dans Auth → Users,
--   puis :
--
--     insert into public.admin_users (user_id, email, role)
--     values ('<uuid-du-compte>', 'contact@act-senegal.com', 'owner');
--
--   Tant qu'aucune ligne n'existe dans admin_users, PERSONNE n'a de
--   droits d'écriture (y compris vous) — c'est volontaire : on ferme
--   d'abord, on ouvre ensuite au compte légitime.
-- =====================================================================

-- =====================================================================
-- Fin du fichier 005_admin_authorization.sql
-- =====================================================================
