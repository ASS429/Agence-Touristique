-- =====================================================================
-- Africa Connection Tours — Row Level Security (RLS)
--
-- Principe :
--   * Le rôle `anon` (site public non authentifié) peut LIRE tout ce qui
--     est marqué `published = true`. Il ne peut jamais écrire.
--   * Le rôle `authenticated` (utilisateurs admin connectés) peut tout
--     lire et tout écrire.
--   * Les requêtes de contact (contact_requests) sont écrites par `anon`
--     (n'importe qui peut soumettre un devis via le site public) mais
--     lues UNIQUEMENT par `authenticated`.
-- =====================================================================

-- Activer RLS partout
alter table public.circuits         enable row level security;
alter table public.excursions       enable row level security;
alter table public.ateliers         enable row level security;
alter table public.blog_posts       enable row level security;
alter table public.testimonials     enable row level security;
alter table public.team_members     enable row level security;
alter table public.partners         enable row level security;
alter table public.faq_items        enable row level security;
alter table public.site_settings    enable row level security;
alter table public.media_library    enable row level security;
alter table public.contact_requests enable row level security;

-- ---------------------------------------------------------------------
-- Helper : macro-génération des policies pour contenus publiables
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
    -- Lecture publique des lignes published=true
    execute format($f$
      drop policy if exists %I on public.%I;
      create policy %I on public.%I
        for select
        to anon, authenticated
        using (published = true or (select auth.role()) = 'authenticated');
    $f$, t || '_read', t, t || '_read', t);

    -- CRUD complet pour les authentifiés
    execute format($f$
      drop policy if exists %I on public.%I;
      create policy %I on public.%I
        for all
        to authenticated
        using (true)
        with check (true);
    $f$, t || '_admin', t, t || '_admin', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- site_settings — lecture publique complète, écriture admin
-- ---------------------------------------------------------------------
drop policy if exists site_settings_read on public.site_settings;
create policy site_settings_read on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists site_settings_admin on public.site_settings;
create policy site_settings_admin on public.site_settings
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- media_library — lecture publique complète, upload admin
-- ---------------------------------------------------------------------
drop policy if exists media_read on public.media_library;
create policy media_read on public.media_library
  for select to anon, authenticated using (true);

drop policy if exists media_admin on public.media_library;
create policy media_admin on public.media_library
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- contact_requests — anon peut créer, admin peut tout lire/modifier
-- ---------------------------------------------------------------------
drop policy if exists contact_insert on public.contact_requests;
create policy contact_insert on public.contact_requests
  for insert to anon, authenticated with check (true);

drop policy if exists contact_admin_read on public.contact_requests;
create policy contact_admin_read on public.contact_requests
  for select to authenticated using (true);

drop policy if exists contact_admin_update on public.contact_requests;
create policy contact_admin_update on public.contact_requests
  for update to authenticated using (true) with check (true);

drop policy if exists contact_admin_delete on public.contact_requests;
create policy contact_admin_delete on public.contact_requests
  for delete to authenticated using (true);

-- =====================================================================
-- Fin du fichier 002_rls_policies.sql
-- =====================================================================
