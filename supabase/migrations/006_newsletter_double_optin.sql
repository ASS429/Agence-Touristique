-- =====================================================================
-- Migration 006 — Double opt-in newsletter (conformité RGPD)
--
-- Ajoute un flux de confirmation par email : un abonné n'est « confirmé »
-- qu'après avoir cliqué le lien reçu par email. Exigé notamment en
-- Allemagne (marché cible ACT).
--
-- Flux :
--   1. Le visiteur soumet le formulaire → l'Edge Function (service role)
--      insère la ligne avec confirmed=false + un confirm_token, et envoie
--      l'email de confirmation.
--   2. Le visiteur clique le lien (…?confirm_newsletter=<token>) →
--      l'Edge Function passe confirmed=true.
--
-- À exécuter dans le SQL editor Supabase APRÈS 005.
-- =====================================================================

-- 1) Colonnes de confirmation
alter table public.newsletter_subscribers
  add column if not exists confirmed     boolean     not null default false,
  add column if not exists confirm_token uuid        not null default gen_random_uuid(),
  add column if not exists confirmed_at   timestamptz;

-- 2) Grandfathering : les abonnés existants (avant double opt-in) étaient
--    déjà « abonnés » en single opt-in → on les considère confirmés pour
--    ne pas les réémettre / les perdre.
update public.newsletter_subscribers
   set confirmed = true,
       confirmed_at = coalesce(confirmed_at, created_at)
 where confirmed = false
   and created_at < now();

-- 3) Index pour la vérification par token (lookup rapide et unicité douce)
create unique index if not exists idx_newsletter_confirm_token
  on public.newsletter_subscribers(confirm_token);

-- Index sur les abonnés confirmés & actifs (audience réelle)
create index if not exists idx_newsletter_confirmed_active
  on public.newsletter_subscribers(created_at desc)
  where confirmed = true and unsubscribed = false;

-- 4) Resserrage de la policy d'insertion anonyme :
--    un client anonyme ne peut créer qu'une ligne NON confirmée
--    (la confirmation passe obligatoirement par l'Edge Function service role).
--    Empêche de forger un abonné « confirmed=true » sans passer par l'email.
drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (confirmed is not true);

-- =====================================================================
-- Vérification :
--   select confirmed, count(*) from newsletter_subscribers group by confirmed;
--   \d+ newsletter_subscribers   -- doit montrer confirmed / confirm_token / confirmed_at
-- =====================================================================
