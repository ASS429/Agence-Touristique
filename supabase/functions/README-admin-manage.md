# Edge Function `admin-manage` — gestion des administrateurs

Cette fonction permet de **créer / retirer des administrateurs et de
réinitialiser des mots de passe directement depuis le tableau de bord**
(section « Administrateurs »), sans passer par le SQL editor.

Elle s'exécute côté serveur avec la clé **service role** (jamais exposée
au navigateur) et vérifie à chaque appel que l'appelant est bien un
administrateur **« propriétaire »**.

---

## Déploiement (une seule fois, ~3 min)

**Dashboard Supabase** → **Edge Functions** → **Create a function**

1. **Nom exact : `admin-manage`** (c'est le slug que le tableau de bord appelle).
2. Effacer le code d'exemple et **coller tout le contenu** de
   `supabase/functions/admin-manage/index.ts`.
3. **Deploy**.

> Alternative en ligne de commande, si le CLI Supabase est installé :
> ```bash
> supabase functions deploy admin-manage
> ```

---

## Secrets

**Aucun secret à ajouter.** Supabase injecte automatiquement
`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans toutes les Edge
Functions. La fonction n'a besoin de rien d'autre.

---

## Pré-requis

- La migration **`005_admin_authorization.sql`** doit avoir été exécutée
  (elle crée la table `admin_users` et la fonction `is_admin()`).
- Au moins **un compte administrateur « owner »** doit exister dans
  `admin_users` (le compte que vous remettez à l'agence). C'est lui qui
  pourra ensuite créer/retirer les autres depuis le tableau de bord.

> Rappel création du premier owner (si pas déjà fait) :
> 1. **Authentication → Users → Add user** (email + mot de passe, *Auto Confirm* coché).
> 2. Copier son UID, puis dans le **SQL editor** :
> ```sql
> insert into public.admin_users (user_id, email, role)
> values ('<uuid>', 'admin@act-senegal.com', 'owner');
> ```

---

## Vérifier que ça marche

1. Se connecter au tableau de bord avec le compte **owner**.
2. Menu **Administration → Administrateurs**.
3. La liste des administrateurs doit s'afficher, et le bouton
   **« Ajouter un administrateur »** doit être présent.
4. Tester la création d'un compte de test, puis le retirer.

Si la page affiche « *Service indisponible… vérifiez que la fonction
admin-manage est bien déployée* », c'est que le déploiement (ci-dessus)
n'a pas encore été fait ou que le nom du slug diffère de `admin-manage`.

En cas de souci : **Edge Functions → `admin-manage` → Logs**.

---

## Modèle de rôles

| Rôle | Contenu du site | Gérer les administrateurs |
|---|---|---|
| **Propriétaire** (`owner`) | ✅ | ✅ |
| **Éditeur** (`editor`) | ✅ | ❌ |

Les deux rôles ont le même accès au **contenu** (c'est la table
`admin_users` qui ouvre le CRUD via `is_admin()`). La distinction ne
porte que sur la **gestion des administrateurs**, réservée aux
propriétaires et vérifiée côté serveur par cette fonction.

### Garde-fous intégrés

- On ne peut pas **se retirer soi-même**.
- On ne peut pas **retirer ou rétrograder le dernier propriétaire**
  (anti-verrouillage : l'agence ne peut jamais se couper l'accès).
- La création exige un mot de passe d'**au moins 8 caractères**.
