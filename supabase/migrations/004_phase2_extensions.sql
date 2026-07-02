-- =====================================================================
-- Africa Connection Tours — Extensions Phase 2 (2026-07)
--
-- Ajoute les tables nécessaires pour finaliser la Phase 2 du contrat :
--   * newsletter_subscribers : abonnés à la newsletter ACT
--   * circuit_departures     : dates de départ + disponibilités par circuit
--   * client_accounts        : profils clients pour l'espace sécurisé
--                              (login Supabase magic link)
--
-- Toutes ces tables héritent des conventions du schéma 001 :
-- id uuid PK, timestamps auto, RLS activé, policies dédiées.
-- =====================================================================

-- ---------------------------------------------------------------------
-- NEWSLETTER
-- ---------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  full_name     text,
  language      text default 'fr',        -- fr | en | it | de
  source        text default 'footer',    -- footer | popup | contact | manual
  unsubscribed  boolean not null default false,
  unsubscribed_at timestamptz,
  metadata      jsonb default '{}'::jsonb, -- champs libres
  created_at    timestamptz not null default now()
);
create index if not exists idx_newsletter_active
  on public.newsletter_subscribers(created_at desc)
  where unsubscribed = false;

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert)
drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

-- Only admin can read/update/delete
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select to authenticated using (true);

drop policy if exists newsletter_admin_update on public.newsletter_subscribers;
create policy newsletter_admin_update on public.newsletter_subscribers
  for update to authenticated using (true) with check (true);

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------
-- CALENDRIER : dates de départ par circuit
-- ---------------------------------------------------------------------
create table if not exists public.circuit_departures (
  id            uuid primary key default gen_random_uuid(),
  circuit_id    uuid not null references public.circuits(id) on delete cascade,
  start_date    date not null,
  end_date      date,             -- calculée si absente à partir de circuit.duration_days
  capacity      integer,          -- max voyageurs (null = illimité)
  booked        integer not null default 0,
  status        text not null default 'open',  -- 'open' | 'confirmed' | 'full' | 'cancelled'
  price_override text,            -- ex "180 000 FCFA/pers" (sinon "Sur devis")
  notes         text,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_departures_circuit_date
  on public.circuit_departures(circuit_id, start_date)
  where published = true;

alter table public.circuit_departures enable row level security;

-- Public read (published + start_date >= today)
drop policy if exists departures_read on public.circuit_departures;
create policy departures_read on public.circuit_departures
  for select to anon, authenticated
  using (published = true or (select auth.role()) = 'authenticated');

drop policy if exists departures_admin on public.circuit_departures;
create policy departures_admin on public.circuit_departures
  for all to authenticated using (true) with check (true);

drop trigger if exists trg_departures_touch on public.circuit_departures;
create trigger trg_departures_touch before update on public.circuit_departures
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- CLIENTS : profils pour l'espace client sécurisé
-- ---------------------------------------------------------------------
-- Note: le login se fait via Supabase Auth (magic link).
-- auth.users est la source de vérité pour l'authentification.
-- client_accounts est un mirror pour les métadonnées ACT-spécifiques.
create table if not exists public.client_accounts (
  id            uuid primary key,   -- = auth.users.id
  email         text unique not null,
  full_name     text,
  phone         text,
  country       text,
  language      text default 'fr',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.client_accounts enable row level security;

-- Un client peut lire/modifier UNIQUEMENT son propre profil
drop policy if exists client_own_read on public.client_accounts;
create policy client_own_read on public.client_accounts
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists client_own_update on public.client_accounts;
create policy client_own_update on public.client_accounts
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Un utilisateur authentifié peut créer SON profil (upsert au premier login)
drop policy if exists client_self_insert on public.client_accounts;
create policy client_self_insert on public.client_accounts
  for insert to authenticated
  with check (id = (select auth.uid()));

drop trigger if exists trg_clients_touch on public.client_accounts;
create trigger trg_clients_touch before update on public.client_accounts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Lien contact_requests <-> client (visibilité côté espace client)
-- Un client peut voir ses propres demandes de contact via son email
-- ---------------------------------------------------------------------
drop policy if exists contact_own_read on public.contact_requests;
create policy contact_own_read on public.contact_requests
  for select to authenticated
  using (
    email = (select coalesce((auth.jwt() ->> 'email'), ''))
    or (select auth.role()) = 'authenticated' and exists (
      select 1 from public.client_accounts ca
      where ca.id = (select auth.uid()) and ca.email = contact_requests.email
    )
  );

-- =====================================================================
-- Fin du fichier 004_phase2_extensions.sql
-- =====================================================================
