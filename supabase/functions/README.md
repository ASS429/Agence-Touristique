# Edge Functions — Notifications email des demandes

## `notify-contact` — envoi d'un email à chaque nouvelle demande

À chaque insertion dans `contact_requests` (formulaire contact, devis,
sur-mesure), envoie automatiquement :
1. **À ACT** : une notification avec le détail de la demande.
2. **Au client** : un accusé de réception localisé (FR/EN/IT/DE).

Utilise **Resend** (service d'envoi d'emails transactionnels).

---

## Étape 1 — Créer un compte Resend (gratuit)

1. Va sur https://resend.com → **Sign up** (gratuit : 3 000 emails/mois, 100/jour).
2. **API Keys** → **Create API Key** → copie la clé (`re_...`).
3. *(Recommandé, plus tard)* **Domains** → **Add Domain** → `act-senegal.com`,
   puis ajoute les enregistrements DNS chez Render/ton registrar. Cela permet
   d'envoyer depuis `notifications@act-senegal.com` (plus pro et meilleure
   délivrabilité). **En attendant**, on utilise l'expéditeur de test
   `onboarding@resend.dev` qui fonctionne immédiatement.

Donne-moi la clé API (ou saisis-la toi-même à l'étape 3) et je finalise.

---

## Étape 2 — Créer l'Edge Function dans Supabase

**Dashboard Supabase** → **Edge Functions** → **Create a function**
- Nom : `notify-contact`
- Colle le contenu de `supabase/functions/notify-contact/index.ts`
- **Deploy**

*(Alternative en ligne de commande, si tu as le CLI Supabase :*
```bash
supabase functions deploy notify-contact --no-verify-jwt
```
*)*

> `--no-verify-jwt` : la fonction est appelée par le webhook DB, pas par un
> utilisateur connecté. On la protège via `WEBHOOK_SECRET` à la place.

---

## Étape 3 — Renseigner les secrets

**Dashboard** → **Edge Functions** → **Manage secrets** → ajoute :

| Secret | Valeur |
|---|---|
| `RESEND_API_KEY` | ta clé `re_...` |
| `NOTIFY_TO` | `act@orange.sn` (ou l'adresse de réception souhaitée) |
| `NOTIFY_FROM` | `onboarding@resend.dev` (puis `ACT <notifications@act-senegal.com>` une fois le domaine vérifié) |
| `WEBHOOK_SECRET` | une chaîne aléatoire de ton choix (ex. générée sur un gestionnaire de mots de passe) |

---

## Étape 4 — Brancher le webhook sur contact_requests

**Dashboard** → **Database** → **Webhooks** → **Create a new hook**
- Name : `on-contact-request`
- Table : `public.contact_requests`
- Events : **Insert** uniquement
- Type : **HTTP Request** → **POST**
- URL : `https://<ref>.supabase.co/functions/v1/notify-contact`
  (remplace `<ref>` par `divcmjwqgsdkdsdrjwbg`)
- HTTP Headers : ajoute
  - `Content-Type` : `application/json`
  - `x-webhook-secret` : **la même valeur que `WEBHOOK_SECRET`**
- **Create**

---

## Étape 5 — Tester

1. Remplis le formulaire de contact sur https://act-senegal.com
2. Vérifie que :
   - `act@orange.sn` reçoit la notification
   - l'email de test saisi reçoit l'accusé de réception
3. En cas de souci : **Edge Functions** → `notify-contact` → **Logs**.

---

## Notes

- **Délivrabilité** : tant qu'on envoie depuis `onboarding@resend.dev`, les
  emails peuvent arriver en spam. Vérifier le domaine `act-senegal.com` dans
  Resend règle ça (SPF/DKIM). À faire quand tu veux passer en production
  sérieuse.
- **Double opt-in newsletter** : la même fonction pourra être étendue plus
  tard pour l'email de confirmation d'abonnement (RGPD, exigé en Allemagne).
- **Coût** : gratuit jusqu'à 3 000 emails/mois — largement suffisant pour le
  volume de demandes d'ACT.
