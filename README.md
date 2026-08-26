# 🔧 FolioMeca

Le carnet d'entretien numérique et coffre-fort mécanique pour passionnés d'auto et de moto.

PWA installable (iOS Safari & Android Chrome), thème sombre avec accents **Orange Mécanique** / **Bleu Tech**, propulsée par React + Tailwind CSS + Supabase.

## ✨ Fonctionnalités

- **Mon Garage** : cartes véhicules (Auto / Moto-Scooter), kilométrage, dépenses cumulées, statut des rappels
- **Fiche véhicule** : historique chronologique des entretiens, filtres par catégorie, édition des informations et de la photo à tout moment
- **Entretiens** : ajout avec photo de facture (Supabase Storage), catégories prédéfinies (Entretien/Vidange, Pneus, Freins, Distribution, Autre)
- **Coffre-fort documents** : carte grise, contrôle technique, factures d'achat... stockés par véhicule
- **Rapport de vente imprimable** : export PDF/impression de l'historique complet d'un véhicule (utile en cas de revente)
- **Rappels** : échéances par date et/ou kilométrage, statuts visuels (À jour / Bientôt / En retard)
- **Dashboard** : dépenses par mois, répartition par catégorie, estimation Pièces vs Main d'œuvre
- **Devise** : EUR ou CHF au choix, appliquée à tous les montants affichés (réglage dans Profil)
- **Auth** : email/mot de passe + Google OAuth, Row Level Security sur toutes les tables
- **PWA** : installable sur iOS et Android, mode hors-ligne basique via Service Worker
- **Mode local** : utilisable sans Supabase pour démarrer immédiatement (données en localStorage)

## 🏗️ Stack technique

- React 18 + Vite
- Tailwind CSS
- Lucide Icons
- React Router
- Recharts (graphiques)
- Supabase (Auth, Postgres, Storage)
- vite-plugin-pwa (manifest + service worker)

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Démarrer directement (mode local, sans Supabase)

Aucune configuration n'est requise pour commencer : lancez simplement

```bash
npm run dev
```

Tant que `.env.local` n'existe pas (ou ne contient pas de clés Supabase valides), FolioMeca démarre automatiquement en **mode local** : connexion instantanée avec n'importe quel email/mot de passe, données stockées dans le `localStorage` du navigateur (véhicules, entretiens, rappels, profil, photos en base64). Un bandeau sur l'écran de connexion confirme que le mode local est actif.

Limites du mode local à garder en tête :
- les données restent dans **ce** navigateur, sur **cet** appareil (pas de synchronisation, pas de sauvegarde cloud)
- vider le cache/localStorage du navigateur efface tout
- pas de vraie authentification ni de RLS — inutile pour du multi-utilisateur ou de la production

Quand vous êtes prêt pour la suite (accès depuis plusieurs appareils, vraies factures dans Supabase Storage, authentification réelle), passez à l'étape 3 : dès que `.env.local` contient des clés Supabase valides, l'app bascule automatiquement dessus au prochain démarrage — **vos données locales ne sont pas migrées automatiquement**, il faudra ressaisir vos véhicules (ou on peut écrire un script de migration si besoin).

### 3. Configurer Supabase (optionnel, pour la synchronisation cloud)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécutez le contenu de `supabase/schema.sql` — cela crée :
   - les tables `profiles`, `vehicles`, `maintenance_records`, `reminders`
   - toutes les policies RLS (chaque utilisateur ne voit que ses propres données)
   - le trigger de création automatique du profil à l'inscription
3. Dans **Storage**, créez deux buckets :
   - `vehicle-photos` → **Public bucket : activé**
   - `invoices` → **Public bucket : désactivé**
   - `documents` → **Public bucket : désactivé** (coffre-fort : carte grise, CT, factures d'achat...)
   (les policies storage sont déjà incluses dans `schema.sql`)
4. Dans **Authentication > Providers**, activez **Google** si vous souhaitez le login Google OAuth, et renseignez vos identifiants OAuth (Client ID / Secret depuis Google Cloud Console). Ajoutez votre domaine dans les **Redirect URLs**.
5. Copiez `.env.example` vers `.env.local` et renseignez :

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

(ces valeurs se trouvent dans **Project Settings > API**)

### 3. Icônes de l'application

Des icônes de démonstration sont fournies dans `public/icons/`. Remplacez-les par votre propre iconographie (192×192, 512×512, et une version *maskable* 512×512) avant mise en production.

### 4. Lancer en développement

```bash
npm run dev
```

### 5. Build de production

```bash
npm run build
npm run preview
```

Le dossier `dist/` généré est prêt à être déployé sur Vercel, Netlify, Cloudflare Pages, etc. — la PWA (manifest + service worker) est générée automatiquement au build par `vite-plugin-pwa`.

## 📁 Structure du projet

```
foliomeca/
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── offline.html           # Page affichée hors-ligne
│   └── icons/                 # Icônes PWA (192, 512, maskable, apple-touch)
├── src/
│   ├── components/
│   │   ├── layout/             # Sidebar, BottomNav, Header, AppShell
│   │   ├── vehicles/            # VehicleCard, AddVehicleModal
│   │   ├── maintenance/         # MaintenanceTimeline, AddMaintenanceModal
│   │   ├── reminders/           # ReminderWidget, AddReminderModal
│   │   ├── dashboard/           # StatsCharts (Recharts)
│   │   ├── Modal.jsx
│   │   └── InstallPWAPrompt.jsx # Invite d'installation iOS/Android
│   ├── context/
│   │   └── AuthContext.jsx      # Session, profil, sign in/up/out
│   ├── hooks/
│   │   ├── useVehicles.js
│   │   ├── useMaintenance.js
│   │   └── useReminders.js
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GaragePage.jsx
│   │   ├── VehicleDetailPage.jsx
│   │   ├── MaintenancePage.jsx
│   │   ├── RemindersPage.jsx
│   │   └── ProfilePage.jsx
│   ├── utils/formatters.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── schema.sql              # Tables + RLS + Storage policies
├── vite.config.js               # Config PWA (manifest, service worker)
├── tailwind.config.js           # Thème sombre, couleurs Mécanique/Tech
└── .env.example
```

## 🔒 Sécurité

Toutes les tables (`vehicles`, `maintenance_records`, `reminders`, `profiles`) ont Row Level Security activé. Un utilisateur ne peut lire ou modifier que les lignes rattachées à son propre `user_id`, y compris via les relations (`maintenance_records`/`reminders` → `vehicles.user_id`). Les factures dans le bucket `invoices` sont accessibles uniquement au propriétaire du véhicule associé.
