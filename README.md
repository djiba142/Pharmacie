# Pharmacie - Système de Gestion

Application web de gestion de pharmacie développée avec React, TypeScript et Supabase.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou bun

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## 📦 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run build:dev` - Compile l'application en mode développement
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm test` - Lance les tests
- `npm run test:watch` - Lance les tests en mode watch

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Supabase** - Backend et base de données
- **TanStack Query** - Gestion des données asynchrones
- **React Router** - Routing
- **Radix UI** - Composants UI accessibles
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants UI
- **Zustand** - Gestion d'état
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas

## 📁 Structure du projet

```
pharmacie/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── hooks/         # Hooks personnalisés
│   ├── lib/           # Utilitaires et configurations
│   └── types/         # Types TypeScript
├── public/            # Fichiers statiques
├── supabase/          # Configuration Supabase
└── ...
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
```

## 📝 Licence

Ce projet est privé et propriétaire.
