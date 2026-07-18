-- =====================================================================
-- 007 — Circuits réels ACT (brochure « NEW BOOK ANGLAIS », juillet 2026)
--
-- Le front superpose les rows `circuits` de la base sur le catalogue du
-- code (title/subtitle par langue + duration_days + hero_photo), et
-- ressuscite tout slug présent en base mais absent du code. Cette
-- migration aligne donc la base sur le nouveau catalogue :
--   1. suppression des circuits d'exemple (placeholders) retirés du code ;
--   2. upsert des 7 circuits multi-jours réels de la brochure.
--
-- À exécuter dans Supabase → SQL Editor (comme les migrations 001-006).
-- Conservés tels quels : dakart-decouverte-10j, goree-lac-saloum (vitrine),
-- les journées (excursion-goree, excursion-lac-rose, dakar-essentiel) et
-- les packs événementiels.
-- =====================================================================

-- 1. Placeholders retirés du catalogue --------------------------------
delete from public.circuits where slug in (
  'weekend-saint-louis',
  'weekend-saloum',
  'lompoul-saint-louis',
  'diaspora-essentiel',
  'casamance-essentielle',
  'grand-tour-7j',
  'familles-10j',
  'kedougou-bassari',
  'grand-tour-14j',
  'luxe-premium-9j'
);

-- 2. Les 7 circuits réels ---------------------------------------------
insert into public.circuits
  (slug, title_fr, title_en, title_it, title_de,
   subtitle_fr, subtitle_en, subtitle_it, subtitle_de,
   description_fr, duration_days, region, category, published, sort_order, itinerary)
values
  ('saint-louis-2j',
   'Saint-Louis', 'Saint-Louis', 'Saint-Louis', 'Saint-Louis',
   '2 jours · cité UNESCO & parc du Djoudj',
   '2 days · UNESCO city & Djoudj Park',
   '2 giorni · città UNESCO e Parco del Djoudj',
   '2 Tage · UNESCO-Stadt & Djoudj-Park',
   'La route de Thiès et sa manufacture de tapisseries, puis Saint-Louis l''historique : palais du Gouverneur, balcons de fer forgé, calèche dans Guet Ndar. Au matin du deuxième jour, le sanctuaire du Djoudj — plus d''un million d''oiseaux au fil de l''eau.',
   2, 'Sénégal', 'culture', true, 10,
   '[{"day":1,"title_fr":"Dakar → Thiès → Saint-Louis"},{"day":2,"title_fr":"Saint-Louis → parc du Djoudj → Dakar"}]'::jsonb),

  ('gambie-2j',
   'Gambie — Banjul & Juffureh', 'The Gambia — Banjul & Juffureh', 'Gambia — Banjul e Juffureh', 'Gambia — Banjul & Juffureh',
   '2 jours · fleuve, bac & mémoire de « Racines »',
   '2 days · river, ferry & the memory of “Roots”',
   '2 giorni · fiume, traghetto e la memoria di «Radici»',
   '2 Tage · Fluss, Fähre & die Erinnerung an „Roots“',
   'Cap au sud jusqu''à Banjul par les villages mandingues et le bac sur le fleuve Gambie. Au retour, Juffureh — le village de Kunta Kinteh, rendu célèbre par « Racines » d''Alex Haley.',
   2, 'Gambie', 'culture', true, 20,
   '[{"day":1,"title_fr":"Dakar → Banjul"},{"day":2,"title_fr":"Banjul → Juffureh → Dakar"}]'::jsonb),

  ('saint-louis-touba-3j',
   'Saint-Louis & Touba', 'Saint-Louis & Touba', 'Saint-Louis e Touba', 'Saint-Louis & Touba',
   '3 jours · patrimoine, fleuve & ville sainte',
   '3 days · heritage, river & holy city',
   '3 giorni · patrimonio, fiume e città santa',
   '3 Tage · Erbe, Fluss & heilige Stadt',
   'Trois jours entre héritage colonial et islam confrérique : le Lac Rose et Thiès en route, Saint-Louis l''UNESCO en calèche, une cérémonie folklorique à Makhana, puis Touba et sa grande mosquée sous la conduite d''un dignitaire mouride.',
   3, 'Sénégal', 'culture', true, 30,
   '[{"day":1,"title_fr":"Dakar → Lac Rose → Thiès → Saint-Louis"},{"day":2,"title_fr":"Saint-Louis, ancienne capitale"},{"day":3,"title_fr":"Saint-Louis → Touba → Dakar"}]'::jsonb),

  ('saloum-lac-rose-toubacouta-3j',
   'Saloum — Lac Rose & Toubacouta', 'Saloum — Pink Lake & Toubacouta', 'Saloum — Lago Rosa e Toubacouta', 'Saloum — Rosa See & Toubacouta',
   '3 jours · delta UNESCO, îles & traditions',
   '3 days · UNESCO delta, islands & traditions',
   '3 giorni · delta UNESCO, isole e tradizioni',
   '3 Tage · UNESCO-Delta, Inseln & Traditionen',
   'Du Lac Rose au delta du Saloum : Joal-Fadiouth et son cimetière aux coquillages, soirée folklorique à Toubacouta, barbecue de poisson sur une île déserte et rencontre d''une guérisseuse traditionnelle.',
   3, 'Sine Saloum', 'mixte', true, 40,
   '[{"day":1,"title_fr":"Dakar → Lac Rose → Joal-Fadiouth → Toubacouta"},{"day":2,"title_fr":"Toubacouta — le fleuve & les îles"},{"day":3,"title_fr":"Toubacouta → Fatick → Dakar"}]'::jsonb),

  ('saloum-kaolack-sipo-3j',
   'Saloum — Kaolack & Sipo', 'Saloum — Kaolack & Sipo', 'Saloum — Kaolack e Sipo', 'Saloum — Kaolack & Sipo',
   '3 jours · bolongs, villages mandingues & Joal',
   '3 days · bolongs, Mandingo villages & Joal',
   '3 giorni · bolong, villaggi mandinga e Joal',
   '3 Tage · Bolongs, Mandinka-Dörfer & Joal',
   'La variante orientale du delta : Kaolack et son grand marché, les villages mandingues, la remontée des bolongs jusqu''au village de pêcheurs de Sipo, et Joal-Fadiouth au retour.',
   3, 'Sine Saloum', 'nature', true, 50,
   '[{"day":1,"title_fr":"Dakar → Kaolack → Toubacouta"},{"day":2,"title_fr":"Toubacouta → Sipo"},{"day":3,"title_fr":"Toubacouta → Joal-Fadiouth → Dakar"}]'::jsonb),

  ('niokolo-koba-3j',
   'Parc du Niokolo-Koba', 'Niokolo-Koba Park', 'Parco del Niokolo-Koba', 'Niokolo-Koba-Park',
   '3 jours · safari dans 900 000 hectares',
   '3 days · safari across 900,000 hectares',
   '3 giorni · safari in 900 000 ettari',
   '3 Tage · Safari auf 900 000 Hektar',
   'La grande réserve du Sénégal : lions, éléphants, hippopotames, buffles, crocodiles, panthères… Deux safaris guidés par un spécialiste local de la zone, au cœur d''une nature intacte de 900 000 hectares.',
   3, 'Sénégal oriental', 'nature', true, 60,
   '[{"day":1,"title_fr":"Dakar → Tambacounda → Wassadou"},{"day":2,"title_fr":"Safari dans le Niokolo"},{"day":3,"title_fr":"Niokolo → Kaolack → Dakar"}]'::jsonb),

  ('casamance-mandingue-4j',
   'Casamance & pays mandingue', 'Casamance & Mandingo Country', 'Casamance e paese mandinga', 'Casamance & Mandinka-Land',
   '4 jours · royaume d''Oussouye, Karabane & Gambie',
   '4 days · Kingdom of Oussouye, Karabane & The Gambia',
   '4 giorni · regno di Oussouye, Karabane e Gambia',
   '4 Tage · Königreich Oussouye, Karabane & Gambia',
   'Le grand sud en profondeur : le roi d''Oussouye et les maîtres d''initiation, les cases à impluvium d''Enampore, l''île de Karabane en pirogue par la mangrove, et le retour par Banjul.',
   4, 'Casamance', 'mixte', true, 70,
   '[{"day":1,"title_fr":"Dakar → Kaolack → Ziguinchor"},{"day":2,"title_fr":"Ziguinchor — coutumes & traditions"},{"day":3,"title_fr":"Ziguinchor → île de Karabane → Ziguinchor"},{"day":4,"title_fr":"Ziguinchor → Banjul → Dakar"}]'::jsonb)

on conflict (slug) do update set
  title_fr = excluded.title_fr, title_en = excluded.title_en,
  title_it = excluded.title_it, title_de = excluded.title_de,
  subtitle_fr = excluded.subtitle_fr, subtitle_en = excluded.subtitle_en,
  subtitle_it = excluded.subtitle_it, subtitle_de = excluded.subtitle_de,
  description_fr = excluded.description_fr,
  duration_days = excluded.duration_days,
  region = excluded.region, category = excluded.category,
  published = excluded.published, sort_order = excluded.sort_order,
  itinerary = excluded.itinerary;
