# Supabase — Base de données ACT

Cette base de données alimente le tableau de bord admin et sert les
contenus au site public. Backend hébergé chez [Supabase](https://supabase.com).

## Vue d'ensemble

- **11 tables** couvrant tous les contenus éditables : circuits, excursions,
  ateliers, blog, témoignages, équipe, partenaires, FAQ, réglages
  généraux, médiathèque, demandes de contact.
- **RLS activé partout** : le rôle `anon` lit uniquement ce qui est
  publié ; le rôle `authenticated` (admin connecté) a un accès CRUD complet.
- **Multilingue** : 4 colonnes par champ (`_fr`, `_en`, `_it`, `_de`).
  Le FR est la source de vérité, les autres sont traduites via DeepL
  depuis l'admin.
- **Storage** : bucket `media` public pour les photos.

## Setup initial (~15 min)

### 1. Créer le projet Supabase

1. Se connecter à https://supabase.com et cliquer **New project**.
2. **Region** : `eu-central-1 (Frankfurt)` (~ 30 ms de latence depuis Dakar).
3. **Plan** : Free (500 MB DB, 1 GB storage, 50k MAU — largement suffisant).
4. **Database password** : à noter dans un gestionnaire de mots de passe.

### 2. Exécuter les migrations

Depuis le **SQL Editor** du dashboard Supabase, exécuter dans l'ordre :

1. `migrations/001_schema.sql` — crée les 11 tables + triggers
2. `migrations/002_rls_policies.sql` — active RLS + policies
3. Créer le bucket : **Storage** → **New bucket** → nom `media`, coché
   *Public bucket* → **Save**
4. `migrations/003_storage_bucket.sql` — policies du bucket
5. `migrations/004_phase2_extensions.sql` — newsletter, départs, espace client
6. `migrations/005_admin_authorization.sql` — **⚠️ CORRECTIF SÉCURITÉ
   OBLIGATOIRE** : restreint le CRUD aux membres de `admin_users`
   (voir §3 ci-dessous). Sans ce fichier, tout compte authentifié
   (y compris un client créé via l'espace client magic link) a les
   droits d'administrateur.

### 3. Créer le premier utilisateur admin **et l'enrôler**

**Authentication** → **Users** → **Add user** → **Create new user**

- Email : `admin@act-senegal.com` (ou l'email de M. Badiane)
- Password : à générer et communiquer de façon sécurisée
- **Auto Confirm User** : coché

Puis **copier l'UID** du compte créé (colonne `UID` dans la liste des
users) et l'enrôler comme administrateur via le **SQL Editor** :

```sql
insert into public.admin_users (user_id, email, role)
values ('<uuid-du-compte>', 'admin@act-senegal.com', 'owner');
```

> **Important** : tant qu'aucune ligne n'existe dans `admin_users`,
> PERSONNE n'a de droits d'écriture (c'est volontaire : la migration 005
> ferme d'abord, on ouvre ensuite au compte légitime). Le login admin
> (`/admin`) refuse d'ailleurs tout compte absent de `admin_users`.

**MFA (recommandé)** : Dashboard → **Authentication** → **Providers**
→ activer **MFA (TOTP)** et enrôler une app d'authentification pour
chaque compte admin.

**Signup public à désactiver** : Dashboard → **Authentication** →
**Providers** → **Email** → décocher *Enable Sign-ups*. Les comptes
admin sont créés manuellement ; l'espace client utilise le magic link
(OTP) qui reste autorisé indépendamment de ce réglage.

### 4. Récupérer les clés d'accès pour le site

**Settings** → **API** — noter :

- `Project URL` (ex : `https://xxxx.supabase.co`)
- `anon public key` (pour lecture publique côté site)

Ces valeurs vont dans `src/admin/supabase.jsx` (voir le fichier pour l'emplacement exact des `SUPABASE_URL` / `SUPABASE_ANON_KEY`).

**⚠️ La `service_role key` ne doit JAMAIS être exposée côté client**
(elle contourne RLS). Elle sert uniquement pour les scripts de seed
exécutés en local ou depuis un serveur.

### 5. Charger les contenus initiaux

Depuis le poste de développement :

```bash
python supabase/seed/export_data_jsx.py
```

Ce script lit `src/data.jsx` (CIRCUITS + EXCURSIONS + ATELIERS) et
génère un fichier `supabase/seed/seed_content.sql` qu'on colle ensuite
dans le SQL editor Supabase.

## Accès admin

Une fois la base setup, le tableau de bord admin est accessible sur :
`https://act-senegal.com/admin`

## Coûts

- **Free tier** : 0 €/mois (limites : 500 MB DB, 1 GB storage, 50k
  utilisateurs actifs mensuels, 2 GB de transfert).
- **Pro** : 25 $/mois si on dépasse (pas prévu pour ACT).

## Backup

Free tier : **7 jours de backups automatiques quotidiens**. Pour
exporter manuellement : **Database** → **Backups** → **Download**.

Pour un export ponctuel :
```bash
pg_dump "postgresql://postgres.[ref]:[password]@[host]:6543/postgres" > backup.sql
```

## Schéma en un coup d'œil

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ circuits        │  │ excursions      │  │ ateliers        │
│ - slug (uniq)   │  │ - slug (uniq)   │  │ - slug (uniq)   │
│ - title_{lang}  │  │ - title_{lang}  │  │ - title_{lang}  │
│ - badges JSON   │  │ - format        │  │ - category      │
│ - itinerary JSON│  │ - start_point   │  │ - hero_photo    │
│ - published     │  │ - published     │  │ - published     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ blog_posts      │  │ testimonials    │  │ team_members    │
│ - content MD    │  │ - rating 1-5    │  │ - photo, bio    │
│ - tags[]        │  │ - source        │  │ - published     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ partners        │  │ faq_items       │  │ site_settings   │
│ - logo, website │  │ - Q/A par lang  │  │ - k/v par lang  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌────────────────────┐
│ media_library   │  │ contact_requests   │
│ - URL storage   │  │ - devis + contact  │
│ - alt par lang  │  │ - statuts          │
└─────────────────┘  └────────────────────┘
```

## Sécurité

- **Autorisation admin par `admin_users`** (migration 005) : le CRUD
  n'est ouvert qu'aux comptes présents dans `admin_users`, via la
  fonction `is_admin()`. Le simple statut `authenticated` (obtenu par
  n'importe quel visiteur via l'espace client magic link) ne donne
  AUCUN droit d'écriture ni de lecture des demandes d'autres clients.
- Toutes les requêtes du site public passent par la **publishable key**
  et sont filtrées par RLS. Aucun risque de fuite de données non publiées.
- Le formulaire de contact utilise `insert` autorisé aux `anon` mais le
  `select` est réservé à l'admin (`is_admin()`) ou au client propriétaire
  de la demande (match sur l'email du JWT).
- Les sessions admin utilisent JWT avec expiration à **1 heure**
  (paramétrable). Le login `/admin` revalide `is_admin()` à chaque
  connexion et à chaque restauration de session (fail-closed).
- **À durcir (voir AUDIT)** : les formulaires publics n'ont pas encore
  de captcha/rate-limit applicatif — prévu via Cloudflare Turnstile +
  Edge Function. Storage : upload réservé aux admins depuis la 005.

### Enrôler / retirer un administrateur

```sql
-- Ajouter un admin (après création du compte dans Auth → Users)
insert into public.admin_users (user_id, email, role)
values ('<uuid>', 'personne@act-senegal.com', 'owner');

-- Retirer un admin
delete from public.admin_users where email = 'personne@act-senegal.com';
```
