# 📻 Radio La Voix du Développement de Béré — 96.7 FM

PWA Site vitrine officiel de la Radio La Voix du Développement de Béré.
Béré · Province de la Tandjilé · Tchad

## 🚀 Stack technique

- **Frontend** : React 18 + TypeScript + Vite
- **Style** : Tailwind CSS v3 + design system custom (vert #006400 / rouge #CC0000)
- **Routing** : TanStack Router
- **Base de données** : Supabase (PostgreSQL + RLS)
- **PWA** : vite-plugin-pwa + Service Worker
- **Fonts** : Playfair Display + Nunito Sans
- **Déploiement** : Vercel (gratuit)

## 📁 Structure

```
src/
├── components/
│   ├── layout/     # Header, Footer, Player global, LiveButton, Ticker
│   └── shared/     # ArticleCard, PodcastCard, GoogleMap, SectionHeader
├── contexts/       # LanguageContext (FR/EN/AR+RTL), PlayerContext
├── hooks/          # useSupabaseQuery, useConfig
├── lib/            # Client Supabase + helpers typés
├── pages/          # 8 pages complètes
├── styles/         # globals.css avec design tokens
└── types/          # Types TypeScript complets (Database)
```

## 🌍 Pages

| Page | Route |
|---|---|
| Accueil | `/` |
| Actualités | `/actualites` |
| Radio & Émissions | `/radio` |
| Projets & Partenariats | `/projets` |
| Galerie | `/galerie` |
| À Propos | `/apropos` |
| Contact | `/contact` |
| Mentions légales | `/mentions-legales` |

## ⚙️ Installation

```bash
npm install
cp .env.example .env.local
# Remplir les variables Supabase dans .env.local
npm run dev
```

## 🗄️ Base de données

Migrations SQL dans `/supabase/migrations/` :
1. `init_schema.sql` — 16 tables (actualités, programmes, podcasts, etc.)
2. `rls_policies.sql` — Sécurité RLS complète
3. `seed_data.sql` — Données de démonstration
4. `functions_views.sql` — Vues et fonctions utilitaires

## 🌐 Déploiement

1. Pousser sur GitHub
2. Connecter à Vercel (vercel.com) — import automatique
3. Ajouter les variables d'environnement dans Vercel Dashboard
4. URL automatique : `https://votre-projet.vercel.app`
5. Connecter le domaine personnalisé : `voixdubere.com`

## 📱 PWA

Installable sur Android et iOS depuis le navigateur.
Manifest configuré avec icônes, thème vert, raccourcis vers Direct et Actualités.

## 🔴 Streaming radio

Configurer `VITE_STREAM_URL` avec l'URL du flux Icecast/HLS quand le streaming sera prêt.

---
Réalisé par **ETS FLANGUST BUSINESS** · flaugustb@gmail.com
