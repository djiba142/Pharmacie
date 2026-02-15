# 🏥 Pharmacie Guinée - Système de Gestion Pharmaceutique

Application web complète de gestion pharmaceutique pour la République de Guinée, développée avec React, TypeScript et Supabase.

## 👨‍💻 Auteur

**Djiba Kourouma**  
Développeur Principal et Mainteneur

## 📋 Description

Système de gestion pharmaceutique moderne permettant la gestion complète des stocks, commandes, livraisons et pharmacovigilance pour les structures de santé en Guinée.

### Fonctionnalités Principales

- 📦 **Gestion des Stocks** - Suivi en temps réel des médicaments
- 🛒 **Gestion des Commandes** - Workflow de validation multi-niveaux
- 🚚 **Suivi des Livraisons** - Carte GPS en temps réel
- 📊 **Tableau de Bord** - Statistiques et KPIs
- 👥 **Gestion des Utilisateurs** - Système de rôles et permissions
- 🗺️ **Carte Interactive** - Visualisation des agences régionales
- 💊 **Pharmacovigilance** - Déclaration et suivi des effets indésirables
- 📈 **Rapports** - Génération de rapports PDF

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou bun
- Compte Supabase

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/djiba142/Pharmacie.git
cd pharmacie

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## 📦 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run build:dev` - Compile en mode développement
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm test` - Lance les tests
- `npm run test:watch` - Lance les tests en mode watch

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI modernes

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de données relationnelle

### Librairies Principales
- **TanStack Query** - Gestion des données asynchrones
- **React Router** - Routing côté client
- **Radix UI** - Composants UI accessibles
- **Zustand** - Gestion d'état légère
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas
- **Leaflet** - Cartes interactives
- **Recharts** - Graphiques et visualisations
- **jsPDF** - Génération de PDF

## 📁 Structure du Projet

```
pharmacie/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── dashboard/       # Composants du tableau de bord
│   │   ├── layout/          # Composants de mise en page
│   │   ├── structures/      # Gestion des structures
│   │   └── ui/              # Composants UI de base (Shadcn)
│   ├── pages/               # Pages de l'application
│   ├── hooks/               # Hooks personnalisés
│   ├── store/               # Stores Zustand
│   ├── lib/                 # Utilitaires et configurations
│   ├── integrations/        # Intégrations (Supabase)
│   └── types/               # Types TypeScript
├── supabase/                # Configuration Supabase
│   ├── migrations/          # Migrations de base de données
│   └── functions/           # Edge Functions
├── public/                  # Fichiers statiques
└── ...
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
```

### Configuration Supabase

1. Créer un projet Supabase
2. Exécuter les migrations dans `supabase/migrations/`
3. Configurer les Row Level Security (RLS) policies
4. Ajouter les variables d'environnement

## 🗺️ Agences Régionales

Le système couvre les principales agences en Guinée :

- **Conakry** - Siège Social (Dixinn Mosquée)
- **Kankan** - Pharmacie Centrale
- **Mamou** - Quartier Petel 2
- **Nzérékoré** - Agence Régionale
- **Kindia, Boké, Labé, Faranah** - Autres agences

## 👥 Système de Rôles

- **SUPER_ADMIN** - Accès complet
- **ADMIN_CENTRAL** - Administration centrale
- **ADMIN_DRS** - Administration régionale
- **ADMIN_DPS** - Administration préfectorale
- **Autres rôles** - Pharmaciens, gestionnaires, livreurs, etc.

## 📝 Licence

Ce projet est **privé et propriétaire**.  
© 2024-2026 Djiba Kourouma. Tous droits réservés.

## 🤝 Contribution

Ce projet est maintenu par **Djiba Kourouma**.  
Pour toute question ou suggestion, veuillez ouvrir une issue sur GitHub.

## 📞 Contact

- **GitHub**: [@djiba142](https://github.com/djiba142)
- **Repository**: [Pharmacie](https://github.com/djiba142/Pharmacie.git)

---

**Développé avec ❤️ pour la santé en Guinée**
