# Edge Functions — Notifications email des demandes

## `notify-contact` — envoi d'un email à chaque nouvelle demande

À chaque envoi d'un formulaire (contact, devis, sur-mesure), le site
appelle **directement** cette fonction juste après avoir enregistré la
demande en base. Elle envoie via **Resend** :
1. **À ACT** : une notification avec le détail de la demande.
2. **Au client** : un accusé de réception localisé (FR/EN/IT/DE).

> **Pas de webhook nécessaire** : le site invoque la fonction lui-même
> (`sb.functions.invoke('notify-contact', …)` dans `supabase-public.jsx`).
> Rien à configurer côté Render.

---

## Étape 1 — Compte Resend

Déjà fait : compte créé + clé API `re_...` générée. **Cette clé est un
secret** — elle ne va QUE dans les secrets Supabase (étape 3), jamais
dans le code.

---

## Étape 2 — Créer la fonction dans Supabase

**Dashboard Supabase** → **Edge Functions** → **Create a function**
- **Nom : `notify-contact`** (⚠️ ce nom exact — c'est celui que le site
  appelle. Si tu as créé une fonction d'exemple `hyper-task`, tu peux la
  supprimer, ou en créer une nouvelle nommée `notify-contact`.)
- Efface le code d'exemple et colle **tout** le contenu de
  `supabase/functions/notify-contact/index.ts`
- **Deploy**

---

## Étape 3 — Renseigner les secrets

**Dashboard** → **Edge Functions** → (ta fonction) → **Secrets**
(ou **Manage secrets**) → ajoute :

| Secret | Valeur | À quoi ça sert |
|---|---|---|
| `RESEND_API_KEY` | ta clé `re_...` | autorise l'envoi via Resend |
| `NOTIFY_TO` | `act@orange.sn` | l'adresse qui reçoit les notifications |
| `NOTIFY_FROM` | `onboarding@resend.dev` | l'adresse d'**expéditeur** (voir note ci-dessous) |

> **Ne mets PAS `WEBHOOK_SECRET`** (on n'utilise pas de webhook).

### 💡 C'est quoi `NOTIFY_FROM` et « vérifier le domaine » ?

Resend doit savoir de **quelle adresse** partent les emails (le « De : »).

- **Maintenant, simple** : `onboarding@resend.dev` — c'est une adresse de
  test que Resend te prête. Ça marche **immédiatement**, sans rien
  configurer. Seul inconvénient : les emails peuvent parfois tomber en
  spam, et le destinataire voit « resend.dev » comme expéditeur.

- **Plus tard, pro** : dans Resend → **Domains** → **Add Domain** →
  `act-senegal.com`. Resend te donne 2-3 lignes DNS (SPF, DKIM) à ajouter
  là où sont gérés les DNS du domaine (chez ton registrar / Render). Une
  fois « Verified », tu changes `NOTIFY_FROM` en
  `ACT <notifications@act-senegal.com>`.
  → `ACT <…>` c'est juste le **nom affiché** + l'adresse : le destinataire
  verra « **ACT** » comme expéditeur au lieu de l'adresse brute. Meilleure
  image + les emails n'arrivent plus en spam.

**En résumé : commence avec `onboarding@resend.dev`, ça suffit pour
tester et démarrer. Le domaine vérifié, c'est une amélioration pour plus
tard.**

---

## Étape 4 — Tester

1. Remplis le formulaire de contact sur https://act-senegal.com
   (attends ~3 s avant d'envoyer, sinon l'anti-bot bloque 😉)
2. Vérifie que :
   - `act@orange.sn` reçoit la notification
   - l'email que tu as saisi reçoit l'accusé de réception
3. En cas de souci : **Edge Functions** → `notify-contact` → **Logs**
   (les erreurs Resend y apparaissent).

---

## Notes

- **Sécurité** : la fonction est appelée avec la clé publishable (publique).
  Elle n'expose aucun secret (la clé Resend reste côté serveur Supabase).
  L'anti-bot des formulaires (honeypot + timing) limite déjà les abus.
- **Coût** : gratuit jusqu'à 3 000 emails/mois — largement suffisant.
- **Newsletter double opt-in** : la même infrastructure pourra servir plus
  tard à l'email de confirmation d'abonnement (RGPD, exigé en Allemagne).
