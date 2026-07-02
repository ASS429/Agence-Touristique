-- =====================================================================
-- Africa Connection Tours — Schéma de base de données
-- Cible : Supabase (PostgreSQL 15+)
--
-- Conventions :
--   * Chaque table de contenu a 4 colonnes texte par champ traductible
--     (_fr, _en, _it, _de). Le FR reste la source de vérité éditoriale ;
--     les autres langues sont peuplées via DeepL depuis l'admin.
--   * `published` (boolean) contrôle la visibilité côté site public.
--   * `sort_order` (integer) permet l'ordonnancement manuel (drag & drop).
--   * Les timestamps sont automatiques via triggers.
--   * Les IDs sont des uuid v4 (générés côté DB).
-- =====================================================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Fonction générique de mise à jour de updated_at
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- CIRCUITS (voyages organisés multi-jours)
-- ---------------------------------------------------------------------
create table if not exists public.circuits (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,

  -- Contenu multilingue
  title_fr      text not null,
  title_en      text,
  title_it      text,
  title_de      text,
  subtitle_fr   text,
  subtitle_en   text,
  subtitle_it   text,
  subtitle_de   text,
  description_fr text,
  description_en text,
  description_it text,
  description_de text,

  -- Métadonnées voyage
  duration_days integer,
  region        text,            -- ex: 'Sénégal', 'Gambie', 'Sine Saloum'
  category      text,            -- ex: 'nature', 'culture', 'mixte'
  hero_photo    text,            -- URL absolue ou chemin storage

  -- Structures JSON pour éviter des tables filles
  -- badges: [{ emoji, text_fr, text_en, text_it, text_de }]
  badges        jsonb default '[]'::jsonb,
  -- highlights: [{ text_fr, text_en, text_it, text_de }]
  highlights    jsonb default '[]'::jsonb,
  -- itinerary:  [{ day, title_fr, ..., description_fr, ... }]
  itinerary     jsonb default '[]'::jsonb,
  -- gallery:    [{ url, alt_fr, alt_en, alt_it, alt_de }]
  gallery       jsonb default '[]'::jsonb,

  -- Publication
  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_circuits_published on public.circuits(published) where published;
create index if not exists idx_circuits_sort on public.circuits(sort_order);
drop trigger if exists trg_circuits_touch on public.circuits;
create trigger trg_circuits_touch before update on public.circuits
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- EXCURSIONS (à la journée / demi-journée)
-- ---------------------------------------------------------------------
create table if not exists public.excursions (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,

  title_fr      text not null,
  title_en      text,
  title_it      text,
  title_de      text,
  short_fr      text,
  short_en      text,
  short_it      text,
  short_de      text,
  description_fr text,
  description_en text,
  description_it text,
  description_de text,

  format        text not null default 'fullday',   -- 'halfday' | 'fullday'
  start_point   text not null default 'dakar',     -- 'dakar' | 'saly' | 'saint-louis'
  region        text,
  hero_photo    text,

  highlights    jsonb default '[]'::jsonb,
  includes      jsonb default '[]'::jsonb,
  gallery       jsonb default '[]'::jsonb,

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_excursions_published on public.excursions(published) where published;
create index if not exists idx_excursions_format on public.excursions(format);
create index if not exists idx_excursions_start on public.excursions(start_point);
drop trigger if exists trg_excursions_touch on public.excursions;
create trigger trg_excursions_touch before update on public.excursions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- ATELIERS (artisanat / musique / danse)
-- ---------------------------------------------------------------------
create table if not exists public.ateliers (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,

  title_fr      text not null,
  title_en      text,
  title_it      text,
  title_de      text,
  subtitle_fr   text,
  subtitle_en   text,
  subtitle_it   text,
  subtitle_de   text,
  short_fr      text,
  short_en      text,
  short_it      text,
  short_de      text,
  description_fr text,
  description_en text,
  description_it text,
  description_de text,

  category      text not null default 'artisanat',  -- 'artisanat' | 'musique' | 'danse'
  hero_photo    text,
  gallery       jsonb default '[]'::jsonb,

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_ateliers_published on public.ateliers(published) where published;
create index if not exists idx_ateliers_category on public.ateliers(category);
drop trigger if exists trg_ateliers_touch on public.ateliers;
create trigger trg_ateliers_touch before update on public.ateliers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- BLOG POSTS
-- ---------------------------------------------------------------------
create table if not exists public.blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,

  title_fr      text not null,
  title_en      text,
  title_it      text,
  title_de      text,
  excerpt_fr    text,
  excerpt_en    text,
  excerpt_it    text,
  excerpt_de    text,
  content_fr    text,          -- Markdown
  content_en    text,
  content_it    text,
  content_de    text,

  author        text,
  hero_photo    text,
  tags          text[] default '{}',
  published_at  timestamptz,

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_blog_published on public.blog_posts(published, published_at desc) where published;
drop trigger if exists trg_blog_touch on public.blog_posts;
create trigger trg_blog_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- TÉMOIGNAGES CLIENTS
-- ---------------------------------------------------------------------
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  author_country text,          -- ex: 'France', 'Italie'
  source        text default 'internal',  -- 'tripadvisor'|'google'|'internal'

  text_fr       text not null,
  text_en       text,
  text_it       text,
  text_de       text,

  rating        integer check (rating between 1 and 5),
  travel_date   date,           -- date approximative du voyage

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_testimonials_published on public.testimonials(published) where published;
drop trigger if exists trg_testimonials_touch on public.testimonials;
create trigger trg_testimonials_touch before update on public.testimonials
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- ÉQUIPE
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role_fr       text,
  role_en       text,
  role_it       text,
  role_de       text,
  bio_fr        text,
  bio_en        text,
  bio_it        text,
  bio_de        text,
  photo         text,
  email         text,
  phone         text,
  linkedin_url  text,

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_team_published on public.team_members(published, sort_order) where published;
drop trigger if exists trg_team_touch on public.team_members;
create trigger trg_team_touch before update on public.team_members
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- PARTENAIRES
-- ---------------------------------------------------------------------
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo          text,
  website       text,
  description_fr text,
  description_en text,
  description_it text,
  description_de text,
  category      text,            -- ex: 'transport', 'hebergement', 'compagnie-croisiere'

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_partners_published on public.partners(published, sort_order) where published;
drop trigger if exists trg_partners_touch on public.partners;
create trigger trg_partners_touch before update on public.partners
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------
create table if not exists public.faq_items (
  id            uuid primary key default gen_random_uuid(),
  category      text not null default 'general',  -- ex: 'reservation','voyage','paiement'

  question_fr   text not null,
  question_en   text,
  question_it   text,
  question_de   text,
  answer_fr     text not null,
  answer_en     text,
  answer_it     text,
  answer_de     text,

  published     boolean not null default false,
  sort_order    integer not null default 100,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_faq_published on public.faq_items(published, category, sort_order) where published;
drop trigger if exists trg_faq_touch on public.faq_items;
create trigger trg_faq_touch before update on public.faq_items
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- SITE_SETTINGS (key/value multilingue pour tout ce qui n'est pas
-- structuré : slogan, description SEO, adresse, téléphones, heures,
-- textes de pages statiques, réseaux sociaux, etc.)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key           text primary key,       -- ex: 'contact.email', 'footer.tagline'
  value_fr      text,
  value_en      text,
  value_it      text,
  value_de      text,
  description   text,                    -- note interne pour l'admin
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_settings_touch on public.site_settings;
create trigger trg_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- MÉDIATHÈQUE (images uploadées via Supabase Storage)
-- ---------------------------------------------------------------------
create table if not exists public.media_library (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,           -- ex: 'photos/2026/goree.webp'
  public_url    text not null,
  category      text,                    -- ex: 'circuits','excursions','equipe'
  alt_fr        text,
  alt_en        text,
  alt_it        text,
  alt_de        text,
  width         integer,
  height        integer,
  file_size     integer,                 -- octets
  content_type  text,                    -- ex: 'image/webp'
  uploaded_by   uuid,                    -- FK vers auth.users
  created_at    timestamptz not null default now()
);
create index if not exists idx_media_category on public.media_library(category);
create index if not exists idx_media_created on public.media_library(created_at desc);

-- ---------------------------------------------------------------------
-- CONTACTS RECEIVED (formulaires devis + contact remplis sur le site)
-- ---------------------------------------------------------------------
create table if not exists public.contact_requests (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,            -- 'devis' | 'contact' | 'custom'
  full_name     text,
  email         text,
  phone         text,
  country       text,
  language      text,                     -- 'fr'|'en'|'it'|'de'

  -- Contexte voyage (nullable si simple contact)
  circuit_slug  text,
  travelers     integer,
  travel_start  date,
  travel_end    date,
  budget        text,

  message       text,
  extra         jsonb default '{}'::jsonb, -- champs libres

  status        text not null default 'new', -- 'new'|'in-progress'|'closed'
  notes         text,                      -- notes internes ACT

  created_at    timestamptz not null default now()
);
create index if not exists idx_contact_status on public.contact_requests(status, created_at desc);
create index if not exists idx_contact_kind on public.contact_requests(kind, created_at desc);

-- =====================================================================
-- Fin du fichier 001_schema.sql
-- =====================================================================
