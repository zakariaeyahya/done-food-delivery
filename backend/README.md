# DONE Food Delivery - Backend API

##  Table des matières

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Documentation API](#documentation-api)
- [Tests](#tests)
- [Services et intégrations](#services-et-intégrations)
- [Sécurité](#sécurité)
- [Dépannage](#dépannage)
- [Contribution](#contribution)

---

## 🎯 Introduction

Le backend DONE Food Delivery est une API REST construite avec Node.js et Express.js qui orchestre les interactions entre les frontends (clients, restaurants, livreurs, administrateurs) et la blockchain Polygon. Il gère les données off-chain via MongoDB, le stockage décentralisé via IPFS, et les interactions avec les smart contracts déployés sur Polygon Amoy.

### Fonctionnalités principales

-  **Gestion des commandes** : Cycle de vie complet des commandes (création, préparation, livraison, litiges)
-  **Gestion des utilisateurs** : Clients, restaurants et livreurs avec profils complets
-  **Intégration blockchain** : Interactions avec les smart contracts (OrderManager, PaymentSplitter, Token, Staking)
-  **Stockage IPFS** : Upload et gestion des images via Pinata
-  **Notifications temps réel** : Socket.io pour les mises à jour en direct
-  **Système d'arbitrage** : Gestion des litiges avec vote décentralisé
-  **Oracles Chainlink** : Prix MATIC/USD et données GPS
-  **Analytics** : Tableaux de bord et statistiques avancées
-  **Administration** : Panel d'administration complet

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  Blockchain │
│  (React)    │     │  (Express)   │     │  (Polygon)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├──▶ MongoDB (données off-chain)
                           ├──▶ IPFS (images et métadonnées)
                           └──▶ Socket.io (notifications)
```

### Couches de l'application

1. **Couche API** : Routes Express.js exposant les endpoints REST
2. **Couche Controllers** : Logique métier et gestion des requêtes HTTP
3. **Couche Services** : Abstraction des services externes (blockchain, IPFS, notifications)
4. **Couche Models** : Schémas Mongoose pour MongoDB
5. **Couche Middleware** : Authentification, validation, rate limiting
6. **Couche Utils** : Utilitaires (logger, GPS tracker, price oracle)

---

## 🛠️ Technologies

### Core
- **Node.js** (v18+) : Runtime JavaScript
- **Express.js** (v4.18) : Framework web
- **MongoDB** (v7.0) : Base de données NoSQL
- **Mongoose** (v7.0) : ODM pour MongoDB

### Blockchain
- **Ethers.js** (v6.0) : Bibliothèque pour interagir avec Ethereum/Polygon
- **Polygon Amoy** : Réseau de test

### Stockage
- **IPFS** : Stockage décentralisé
- **Pinata** : Service de pinning IPFS

### Communication
- **Socket.io** (v4.6) : Notifications temps réel
- **Nodemailer** (v7.0) : Envoi d'emails

### Sécurité
- **Helmet** : Sécurisation des en-têtes HTTP
- **CORS** : Gestion des requêtes cross-origin
- **JWT** : Authentification par tokens
- **bcrypt** : Hachage de mots de passe

### Utilitaires
- **dotenv** : Gestion des variables d'environnement
- **morgan** : Logging des requêtes HTTP
- **express-validator** : Validation des données

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local ou MongoDB Atlas)
- Un compte **Pinata** (pour IPFS)
- Un wallet Ethereum avec des fonds sur Polygon Amoy (pour les transactions)

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos valeurs (voir section [Configuration](#configuration)).

---

## ⚙️ Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine du dossier `backend/` avec les variables suivantes :

```env
# === SERVEUR ===
PORT=3000
NODE_ENV=development

# === MONGODB ===
MONGODB_URI=mongodb://localhost:27017/done_food_delivery
# Ou MongoDB Atlas :
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/done_food_delivery

# === BLOCKCHAIN (Polygon Amoy) ===
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
# Ou utilisez un provider privé :
# ALCHEMY_API_KEY=your_alchemy_key
# INFURA_API_KEY=your_infura_key

PRIVATE_KEY=0x... # Clé privée du wallet backend (sans 0x au début)

# Adresses des contrats déployés
ORDER_MANAGER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...
STAKING_ADDRESS=0x...

# === IPFS (Pinata) ===
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

# === NOTIFICATIONS ===
SENDGRID_API_KEY=your_sendgrid_key (optionnel)
EMAIL_FROM=noreply@donefood.com

# === SÉCURITÉ ===
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# === MODE DÉVELOPPEMENT ===
ALLOW_MOCK_BLOCKCHAIN=false # true pour désactiver la blockchain en dev
ALLOW_MOCK_AUTH=false # true pour désactiver l'auth en dev
```

### Scripts de configuration

Le dossier `scripts/` contient des utilitaires pour faciliter la configuration :

- `generate-private-key.js` : Génère une clé privée sécurisée
- `validate-private-key.js` : Valide le format d'une clé privée
- `check-rpc-config.js` : Vérifie la connexion RPC
- `update-env-for-amoy.js` : Met à jour les variables pour Polygon Amoy

---

## ▶️ Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre avec `nodemon` pour le rechargement automatique.

### Mode production

```bash
npm start
```

### Vérification

Une fois le serveur démarré, vous pouvez vérifier qu'il fonctionne :

```bash
# Health check
curl http://localhost:3000/health

# Informations API
curl http://localhost:3000/api
```

---

## 📁 Structure du projet

```
backend/
├── src/
│   ├── server.js                 # Point d'entrée principal
│   │
│   ├── config/                    # Configurations
│   │   ├── blockchain.js         # Configuration blockchain (ethers.js)
│   │   ├── database.js           # Configuration MongoDB
│   │   └── ipfs.js               # Configuration IPFS (Pinata)
│   │
│   ├── controllers/              # Contrôleurs (logique métier)
│   │   ├── adminController.js    # Administration
│   │   ├── analyticsController.js # Analytics
│   │   ├── cartController.js     # Panier
│   │   ├── delivererController.js # Livreurs
│   │   ├── disputeController.js  # Litiges
│   │   ├── orderController.js    # Commandes
│   │   ├── oracleController.js   # Oracles
│   │   ├── restaurantController.js # Restaurants
│   │   ├── tokenController.js    # Tokens DONE
│   │   └── userController.js     # Utilisateurs
│   │
│   ├── services/                 # Services externes
│   │   ├── alertService.js       # Système d'alertes
│   │   ├── arbitrationService.js # Arbitrage
│   │   ├── blockchainService.js  # Interactions blockchain
│   │   ├── chainlinkService.js   # Oracles Chainlink
│   │   ├── gpsOracleService.js   # Oracle GPS
│   │   ├── ipfsCacheService.js   # Cache IPFS
│   │   ├── ipfsService.js        # Service IPFS
│   │   ├── notificationService.js # Notifications (Socket.io + Email)
│   │   ├── priceOracleService.js  # Oracle prix
│   │   ├── rpcService.js         # Failover RPC
│   │   └── weatherOracleService.js # Oracle météo
│   │
│   ├── models/                    # Modèles MongoDB
│   │   ├── Deliverer.js          # Schéma livreur
│   │   ├── Order.js              # Schéma commande
│   │   ├── Restaurant.js         # Schéma restaurant
│   │   └── User.js               # Schéma utilisateur
│   │
│   ├── routes/                   # Routes API
│   │   ├── admin.js              # Routes administration
│   │   ├── analytics.js          # Routes analytics
│   │   ├── cart.js               # Routes panier
│   │   ├── deliverers.js         # Routes livreurs
│   │   ├── disputes.js            # Routes litiges
│   │   ├── health.js             # Health check
│   │   ├── orders.js             # Routes commandes
│   │   ├── oracles.js            # Routes oracles
│   │   ├── restaurants.js        # Routes restaurants
│   │   ├── reviews.js            # Routes avis
│   │   ├── tokens.js             # Routes tokens
│   │   ├── upload.js             # Routes upload
│   │   └── users.js              # Routes utilisateurs
│   │
│   ├── middleware/               # Middlewares
│   │   ├── auth.js               # Authentification Web3
│   │   ├── performanceMonitoring.js # Monitoring performance
│   │   ├── rateLimit.js          # Rate limiting
│   │   ├── validation.js         # Validation des données
│   │   └── verifyAdminRole.js    # Vérification rôle admin
│   │
│   ├── utils/                    # Utilitaires
│   │   ├── circuitBreaker.js     # Circuit breaker pattern
│   │   ├── gpsTracker.js         # Tracking GPS
│   │   ├── logger.js             # Système de logging
│   │   └── priceOracle.js        # Oracle prix (mock)
│   │
│   ├── cron/                     # Tâches planifiées
│   │   ├── backupCron.js         # Backups MongoDB
│   │   ├── healthCheckCron.js    # Health checks périodiques
│   │   └── oracleSyncCron.js     # Synchronisation oracles
│   │
│   ├── scripts/                  # Scripts utilitaires
│   │   └── seedDemo.js           # Seed données de démo
│   │
│   └── tests/                    # Tests
│       ├── api-tests.js          # Tests API complets
│       ├── api-tests-sprint6.js  # Tests Sprint 6
│       └── test-*.js             # Tests unitaires
│
├── scripts/                      # Scripts de configuration
│   ├── check-rpc-config.js
│   ├── copy-private-key-from-contracts.js
│   ├── generate-private-key.js
│   ├── setup-roles.js
│   ├── test-order-flow.js
│   ├── update-env-for-amoy.js
│   └── validate-private-key.js
│
├── package.json                  # Dépendances et scripts
├── .env.example                  # Exemple de configuration
├── .gitignore                    # Fichiers ignorés par Git
└── README.md                     # Ce fichier
```

---

##  Documentation API

### Endpoints principaux

#### Health Check
```
GET /health
```
Vérifie l'état du serveur et des connexions.

#### Utilisateurs
```
POST   /api/users/register
GET    /api/users/:address
PUT    /api/users/:address
GET    /api/users/:address/orders
GET    /api/users/:address/tokens
```

#### Restaurants
```
POST   /api/restaurants/register
GET    /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
GET    /api/restaurants/:id/orders
GET    /api/restaurants/:id/analytics
PUT    /api/restaurants/:id/menu
```

#### Livreurs
```
POST   /api/deliverers/register
GET    /api/deliverers/:address
GET    /api/deliverers/available
PUT    /api/deliverers/:address/status
POST   /api/deliverers/stake
POST   /api/deliverers/unstake
GET    /api/deliverers/:address/orders
GET    /api/deliverers/:address/earnings
```

#### Commandes
```
POST   /api/orders/create
GET    /api/orders/:id
GET    /api/orders/client/:address
POST   /api/orders/:id/confirm-preparation
POST   /api/orders/:id/assign-deliverer
POST   /api/orders/:id/confirm-pickup
POST   /api/orders/:id/update-gps
POST   /api/orders/:id/confirm-delivery
POST   /api/orders/:id/dispute
POST   /api/orders/:id/review
GET    /api/orders/history/:address
```

#### Administration
```
GET    /api/admin/stats
GET    /api/admin/disputes
POST   /api/admin/resolve-dispute/:id
GET    /api/admin/users
GET    /api/admin/restaurants
GET    /api/admin/deliverers
POST   /api/admin/slash
```

#### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/orders
GET    /api/analytics/revenue
GET    /api/analytics/users
```

#### Oracles
```
GET    /api/oracles/price
POST   /api/oracles/convert
POST   /api/oracles/gps/verify
GET    /api/oracles/weather
```

#### Litiges
```
POST   /api/disputes/vote
GET    /api/disputes/:id/votes
POST   /api/disputes/:id/resolve
```

#### Tokens
```
GET    /api/tokens/rate
POST   /api/tokens/burn
POST   /api/tokens/use-discount
```

### Documentation complète

Pour une documentation détaillée de tous les endpoints avec exemples de requêtes/réponses, consultez le fichier `docs/API_DOCUMENTATION.md` (si disponible).

---

##  Tests

### Tests API complets

Exécutez tous les tests API :

```bash
npm run test:api
```

**Résultats attendus** :  75/75 tests réussis (100%)

### Tests unitaires

```bash
npm test
```

### Tests avec couverture

```bash
npm test -- --coverage
```

### Tests spécifiques

```bash
# Tests Sprint 6
npm run test:api:sprint6

# Tests en mode watch
npm run test:watch
```

---

##  Services et intégrations

### MongoDB

Le backend utilise MongoDB pour stocker toutes les données off-chain :
- Profils utilisateurs
- Menus des restaurants
- Historique des commandes
- Tracking GPS
- Analytics

**Connexion** : Configurée dans `src/config/database.js`

### Blockchain (Polygon Amoy)

Interactions avec les smart contracts via ethers.js :
- **OrderManager** : Gestion du cycle de vie des commandes
- **PaymentSplitter** : Répartition des paiements (70% restaurant, 20% livreur, 10% plateforme)
- **Token (DONE)** : Tokens de récompense
- **Staking** : Staking des livreurs

**Configuration** : `src/config/blockchain.js`

### IPFS (Pinata)

Stockage décentralisé pour :
- Images des plats
- Photos des restaurants
- Preuves de litiges

**Configuration** : `src/config/ipfs.js`

### Socket.io

Notifications temps réel pour :
- Mises à jour de commandes
- Disponibilité des livreurs
- Nouveaux litiges

**Configuration** : Intégré dans `server.js`

---

## 🔒 Sécurité

### Authentification Web3

Le backend utilise l'authentification par signature de wallet (Web3) :
- Les utilisateurs signent un message avec leur wallet
- Le backend vérifie la signature via `ethers.verifyMessage()`
- Middleware : `src/middleware/auth.js`

### Rate Limiting

Protection contre les abus et DDoS :
- 100 requêtes/minute par IP (API générale)
- 5 requêtes/minute pour l'authentification
- Middleware : `src/middleware/rateLimit.js`

### Helmet

Sécurisation des en-têtes HTTP :
- Protection XSS
- Protection clickjacking
- Désactivation de la mise en cache des réponses sensibles

### Validation

Validation stricte des données d'entrée :
- `express-validator` pour la validation
- Middleware : `src/middleware/validation.js`

---

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur de connexion MongoDB

```
Error: MongoDB connection failed
```

**Solution** :
- Vérifiez que MongoDB est démarré (local) ou que l'URI Atlas est correcte
- Vérifiez les variables d'environnement `MONGODB_URI`

#### 2. Erreur de connexion blockchain

```
Error: Blockchain initialization failed
```

**Solution** :
- Vérifiez `AMOY_RPC_URL` ou configurez `ALCHEMY_API_KEY` / `INFURA_API_KEY`
- Vérifiez que `PRIVATE_KEY` est correcte
- Vérifiez que les adresses des contrats sont correctes

#### 3. Erreur IPFS

```
Error: Pinata authentication failed
```

**Solution** :
- Vérifiez `PINATA_API_KEY` et `PINATA_SECRET_KEY`
- Le backend fonctionne en mode "read-only" sans Pinata (téléchargements uniquement)

#### 4. Port déjà utilisé

```
Error: Port 3000 is already in use
```

**Solution** :
- Changez `PORT` dans `.env`
- Ou arrêtez le processus utilisant le port : `lsof -ti:3000 | xargs kill`

### Logs

Le backend utilise un système de logging centralisé (`src/utils/logger.js`). Les logs sont affichés dans la console en mode développement.

---

##  Statut de développement

###  Fonctionnalités complètes

-  Gestion des utilisateurs (clients, restaurants, livreurs)
-  Cycle de vie complet des commandes
-  Intégration blockchain (Polygon Amoy)
-  Stockage IPFS (Pinata)
-  Notifications temps réel (Socket.io)
-  Système d'arbitrage
-  Oracles Chainlink (prix, GPS)
-  Analytics et statistiques
-  Panel d'administration
-  Tests API complets (75/75 tests réussis)

### 🔄 En cours

- Optimisations de performance
- Amélioration de la tolérance aux pannes
- Documentation Swagger/OpenAPI

---

## 🤝 Contribution

### Workflow

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Ajouter des tests
4. Vérifier que tous les tests passent
5. Créer une pull request

### Standards de code

- Utiliser ESLint : `npm run lint`
- Formater le code avant de commit
- Ajouter des commentaires JSDoc pour les fonctions complexes
- Suivre la structure existante des fichiers

---

##  Scripts NPM

```bash
# Démarrage
npm start              # Mode production
npm run dev            # Mode développement (nodemon)

# Tests
npm test               # Tests unitaires
npm run test:api       # Tests API complets
npm run test:watch     # Tests en mode watch

# Qualité de code
npm run lint           # Vérification ESLint
npm run lint:fix       # Correction automatique

# Utilitaires
npm run seed           # Seed données de démo
```

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation dans `docs/`
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire

---

## 🎯 Roadmap

- [ ] Documentation Swagger/OpenAPI
- [ ] Tests d'intégration E2E
- [ ] Monitoring avec Prometheus/Grafana
- [ ] CI/CD avec GitHub Actions
- [ ] Support multi-chaînes (Polygon Mainnet, autres L2)
- [ ] API GraphQL (optionnel)

---

**Développé avec ❤️ pour DONE Food Delivery**
