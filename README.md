# Beauty Ley — site officiel

Site vitrine et système de réservation en ligne de **Beauty Ley**, Beauty & Wellness Studio à
Hurghada.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

---

## Système de réservation

### Parcours cliente — `/reservation`

Prestation → professionnelle (ou « peu importe ») → date et créneau → récapitulatif →
coordonnées → confirmation. Le brouillon est conservé dans la session : revenir en arrière ne
perd jamais les informations déjà saisies.

Chaque cliente reçoit un lien de gestion signé, `/rendez-vous/<référence>?t=<jeton>`, pour
consulter, déplacer ou annuler son rendez-vous.

### Administration — `/admin`

Tableau de bord, calendrier (jour / semaine / mois), rendez-vous filtrables, fiches clientes,
catalogue des prestations, équipe et plannings, paramètres.

Protégée par un mot de passe (`ADMIN_PASSWORD`) et une session signée en cookie `httpOnly`.

### Moteur de disponibilité

Les créneaux sont **toujours calculés côté serveur** (`src/server/availability.ts`) à partir
des horaires d'ouverture, du planning de chaque professionnelle (plages multiples = pauses),
des congés et indisponibilités, des fermetures et jours fériés, des rendez-vous existants,
de la durée et du battement de la prestation, du délai minimum de réservation et de l'horizon
d'ouverture des réservations.

Le prix, la durée et la professionnelle sont **re-résolus depuis la base** au moment de
l'écriture : rien de ce qui vient du navigateur n'est utilisé tel quel.

Le fuseau du studio est `Africa/Cairo` (avec heure d'été). Les instants sont stockés en UTC et
convertis à l'affichage (`src/lib/time.ts`).

### Double réservation

Trois barrières :

1. les créneaux occupés ne sont jamais proposés ;
2. une revérification du chevauchement est faite dans le chemin d'écriture ;
3. sur Postgres, la contrainte d'exclusion `appointments_no_overlap` refuse physiquement deux
   rendez-vous qui se chevauchent pour la même professionnelle.

---

## Configuration

Copiez `.env.example` vers `.env.local` et renseignez ce dont vous avez besoin.

### 1. Base de données (obligatoire en production)

Sans `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` :

- **en développement**, les données sont stockées dans `.data/booking.json` (le catalogue de
  départ est créé automatiquement au premier chargement) ;
- **en production**, la réservation en ligne se désactive proprement et le site propose de
  nouveau la prise de rendez-vous par les réseaux sociaux. Rien ne casse.

Pour activer Supabase :

1. créez un projet Supabase ;
2. exécutez `supabase/schema.sql` dans l'éditeur SQL ;
3. renseignez `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

La clé service role ne quitte jamais le serveur. Le RLS est activé sans policy : les rôles
`anon` et `authenticated` n'ont aucun accès direct aux tables.

Le catalogue de départ (9 catégories, ~70 prestations, 4 professionnelles, plannings, horaires)
est inséré automatiquement à la première requête, puis entièrement modifiable depuis `/admin`.

### 2. Administration

```
ADMIN_PASSWORD=un-mot-de-passe-solide
```

Facultatif : `ADMIN_SESSION_SECRET` (sinon la clé de session est dérivée du mot de passe).

### 3. Emails automatiques

```
RESEND_API_KEY=...
NOTIFICATION_FROM="Beauty Ley <rendezvous@votre-domaine.com>"
```

Confirmation, modification et annulation partent automatiquement. **Sans fournisseur, aucun
message n'est simulé** : il est enregistré avec le statut `skipped` et visible dans
`/admin/parametres`.

SMS et WhatsApp : l'architecture est en place (`src/server/notifications/providers.ts`), il
suffit d'implémenter `MessageProvider` et de le retourner dans `getSmsProvider()` /
`getWhatsappProvider()`.

### 4. Rappels de rendez-vous

```
CRON_SECRET=...
```

Puis appelez `/api/cron/reminders` toutes les heures avec l'en-tête
`Authorization: Bearer $CRON_SECRET` (Vercel Cron ou tout autre planificateur). Les rendez-vous
situés dans 23 à 25 h reçoivent un rappel, une seule fois.

### 5. Paiement (non activé)

Tant que `STRIPE_SECRET_KEY` est absent, seul le **paiement sur place** est proposé et il est
le seul mode sélectionnable dans l'administration. L'architecture (mode de règlement, acompte,
`payment_status`, `deposit_amount`) est prête dans `src/server/payments/index.ts` — aucun
paiement n'est simulé.

---

## Structure

```
src/
  app/
    (site)/            pages publiques (accueil, prestations, tarifs, galerie, contact,
                       réservation, gestion de rendez-vous)
    admin/             espace équipe : login + (dashboard) protégé, actions serveur
    api/booking/       API publique de réservation (catalogue, disponibilités, rendez-vous)
    api/cron/          rappels automatiques
  components/
    booking/           parcours de réservation
    admin/             interface d'administration
  lib/                 utilitaires partagés client/serveur (temps, types, client API)
  server/
    availability.ts    moteur de créneaux
    booking.ts         création, annulation, déplacement
    db/                pilotes de stockage (Supabase, JSON local) + schéma des tables
    repo/              accès aux données par domaine
    notifications/     outbox et fournisseurs de messages
    payments/          architecture de paiement
supabase/schema.sql    schéma Postgres complet
```

Pour repartir de zéro en développement : supprimez `.data/booking.json`.
