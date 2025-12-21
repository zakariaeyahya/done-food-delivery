# DONE Food Delivery - Frontend Restaurant Dashboard

##  Table des matières

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Composants](#composants)
- [Pages](#pages)
- [Services](#services)
- [Intégration API](#intégration-api)
- [Démarrage](#démarrage)
- [Déploiement](#déploiement)
- [Workflow utilisateur](#workflow-utilisateur)

---

## 🎯 Introduction

Le dashboard restaurant de DONE Food Delivery est une interface React moderne permettant aux restaurants de gérer leurs commandes en temps réel, administrer leur menu et consulter leurs statistiques et revenus. L'application utilise Web3 pour les interactions blockchain et s'intègre avec Socket.io pour les notifications en temps réel.

### Fonctionnalités principales

-  **Gestion des commandes** : Réception et suivi des commandes en temps réel
-  **Confirmation de préparation** : Validation on-chain des commandes prêtes
-  **Gestion du menu** : CRUD complet des items avec upload IPFS
-  **Analytics avancées** : Statistiques détaillées avec graphiques
-  **Revenus on-chain** : Suivi des gains depuis la blockchain
-  **Retraits** : Retrait des fonds depuis le PaymentSplitter
-  **Notifications temps réel** : Alertes instantanées pour nouvelles commandes
-  **Design responsive** : Interface optimisée pour desktop et tablette

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend Restaurant Dashboard                   │
│                      (React + Vite)                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Backend API  │   │   Blockchain    │   │  Services      │
│  (REST)       │   │   (Polygon)     │   │  Externes      │
├────────────────┤   ├─────────────────┤   ├────────────────┤
│ - Orders       │   │ - OrderManager  │   │ - IPFS (Pinata)│
│ - Restaurants  │   │ - PaymentSplit  │   │ - Socket.io    │
│ - Analytics    │   │ - Token         │   │                │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Flux de données

```
Nouvelle Commande → Socket.io → OrdersQueue → Confirmation → Blockchain
                                                              ↓
                                                         PaymentSplit
                                                              ↓
                                                         Analytics
```

---

## 🛠️ Technologies

### Core
- **React** 18.2 : Bibliothèque UI
- **Vite** 4.3 : Build tool et dev server
- **React Router DOM** 6.11 : Routing client-side
- **TailwindCSS** 3.3 : Framework CSS utility-first

### Web3 & Blockchain
- **Ethers.js** 6.4 : Bibliothèque pour interagir avec Ethereum/Polygon
- **MetaMask** : Wallet pour transactions Web3

### Temps réel
- **Socket.io-client** 4.6 : Notifications temps réel

### Visualisation
- **Chart.js** 4.3 : Bibliothèque de graphiques
- **react-chartjs-2** 5.2 : Wrapper React pour Chart.js

### Services
- **Axios** 1.4 : Client HTTP pour appels API
- **date-fns** 2.30 : Manipulation de dates

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MetaMask** installé dans le navigateur
- Un wallet avec le rôle **RESTAURANT_ROLE** sur la blockchain
- L'URL de l'API backend (Sprint 2)
- Les adresses des contrats déployés (Sprint 1)

---

## 🚀 Installation

### 1. Naviguer vers le dossier

```bash
cd frontend/restaurant
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos valeurs (voir section [Configuration](#configuration)).

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `frontend/restaurant/` :

```env
# === API BACKEND ===
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# === BLOCKCHAIN (Polygon Amoy) ===
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...

# === IPFS ===
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# === RÉSEAU ===
VITE_CHAIN_ID=80002
VITE_NETWORK_NAME=Polygon Amoy
```

### Vérification du rôle RESTAURANT

Le restaurant doit avoir le rôle `RESTAURANT_ROLE` sur le contrat `DoneOrderManager`. Si ce n'est pas le cas, contactez l'administrateur de la plateforme.

---

## 📁 Structure du projet

```
frontend/restaurant/
├── public/
│   ├── index.html              # HTML de base
│   └── manifest.json           # Manifest PWA
│
├── src/
│   ├── App.jsx                 # Composant racine + routing
│   ├── index.jsx               # Point d'entrée React
│   ├── index.css               # Styles globaux TailwindCSS
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ConnectWallet.jsx  # Connexion MetaMask
│   │   ├── OrdersQueue.jsx     # File d'attente commandes
│   │   ├── OrderCard.jsx      # Carte commande individuelle
│   │   ├── MenuManager.jsx    # Gestion menu (CRUD)
│   │   ├── Analytics.jsx       # Statistiques restaurant
│   │   └── EarningsChart.jsx  # Graphique revenus on-chain
│   │
│   ├── pages/                  # Pages de l'application
│   │   ├── DashboardPage.jsx  # Tableau de bord principal
│   │   ├── OrdersPage.jsx     # Gestion complète commandes
│   │   ├── MenuPage.jsx       # Gestion menu
│   │   ├── AnalyticsPage.jsx   # Analytics détaillées
│   │   └── RegisterPage.jsx   # Inscription restaurant
│   │
│   ├── services/               # Services API et blockchain
│   │   ├── api.js             # Appels API backend
│   │   ├── blockchain.js      # Interactions Web3
│   │   └── ipfs.js            # Interactions IPFS
│   │
│   ├── contexts/               # Context API (état global)
│   │   ├── WalletContext.jsx  # État wallet connecté
│   │   └── SocketContext.jsx   # Connexion Socket.io
│   │
│   └── utils/                  # Utilitaires
│       ├── web3.js            # Helpers Web3
│       └── formatters.js      # Formatage données
│
├── package.json                # Dépendances et scripts
├── vite.config.js              # Configuration Vite
├── tailwind.config.js          # Configuration TailwindCSS
├── postcss.config.js           # Configuration PostCSS
└── .env                        # Variables d'environnement
```

---

## 🧩 Composants

### ConnectWallet.jsx

**Rôle** : Gestion de la connexion au wallet MetaMask pour le restaurant.

**Fonctionnalités** :
- Détection de MetaMask installé
- Connexion au wallet
- Vérification du réseau (Polygon Amoy)
- Vérification du rôle `RESTAURANT_ROLE` sur la blockchain
- Récupération du profil restaurant depuis l'API
- Affichage de l'adresse connectée (format court)
- Indicateur de réseau

**Utilisation** :
```jsx
import ConnectWallet from './components/ConnectWallet'

<ConnectWallet onConnect={handleConnect} />
```

---

### OrdersQueue.jsx

**Rôle** : File d'attente des commandes en temps réel.

**Fonctionnalités** :
- Réception des nouvelles commandes via Socket.io (`orderCreated`)
- Notification sonore + badge pour nouvelles commandes
- Animation d'entrée des commandes
- Filtres par statut (Toutes / Nouvelles / En préparation / Prêtes)
- Estimation du temps de préparation
- Bouton "Confirmer préparation" (on-chain + off-chain)
- Accept/Reject order (optionnel)

**Socket.io events** :
- `orderCreated` : Nouvelle commande
- `delivererAssigned` : Livreur assigné
- `orderDelivered` : Commande livrée

---

### OrderCard.jsx

**Rôle** : Carte individuelle d'une commande.

**Props** :
```jsx
{
  order: {
    orderId: number,
    client: { name: string, address: string },
    items: Array<{ name: string, quantity: number, price: number, image: string }>,
    deliveryAddress: string,
    totalAmount: number,
    status: string,
    createdAt: Date
  },
  onConfirmPreparation: (orderId: number) => void
}
```

**Fonctionnalités** :
- Affichage des détails de la commande (items, quantités, prix)
- Images des plats depuis IPFS
- Informations client (nom, wallet, téléphone)
- Adresse de livraison
- Badge de statut coloré :
  - `CREATED` : Jaune
  - `PREPARING` : Orange
  - `IN_DELIVERY` : Bleu
  - `DELIVERED` : Vert
- Timer : temps écoulé depuis création
- Bouton "Confirmer préparation" si status = CREATED

---

### MenuManager.jsx

**Rôle** : Gestion complète du menu restaurant (CRUD).

**Fonctionnalités** :

**Create (Ajouter item)** :
- Modal formulaire : nom, description, prix, catégorie, image
- Upload image vers IPFS
- Validation des données
- Ajout au menu

**Read (Lire menu)** :
- Affichage grid des items avec images IPFS
- Groupage par catégories
- Filtres par catégorie

**Update (Modifier item)** :
- Modal pré-remplie avec données existantes
- Modification nom, description, prix, disponibilité
- Upload nouvelle image si changée

**Delete (Supprimer item)** :
- Confirmation avant suppression
- Retrait du menu

**Autres fonctionnalités** :
- Activation/désactivation d'items (toggle)
- Catégorisation (Entrées, Plats, Desserts, Boissons)
- Prix en MATIC + conversion EUR

---

### Analytics.jsx

**Rôle** : Statistiques et analytics du restaurant.

**Fonctionnalités** :
- **Total commandes** : Jour / Semaine / Mois avec variation %
- **Graphique revenus** : Line chart des revenus dans le temps
- **Plats populaires** : Bar chart horizontal (Top 5)
- **Temps moyen de préparation** : Calcul depuis les commandes
- **Vue d'ensemble notes** :
  - Rating moyen
- Nombre total d'avis
- Répartition des notes (1-5 étoiles)
- Derniers commentaires clients
- **Filtres période** : Jour / Semaine / Mois

**Données affichées** :
```javascript
{
  totalOrders: { today: 15, week: 87, month: 342 },
  revenue: { today: 150, week: 870, month: 3420 }, // MATIC
  popularDishes: [
    { name: "Pizza Margherita", orderCount: 45, revenue: 450 }
  ],
  averagePreparationTime: 25, // minutes
  rating: 4.5,
  totalReviews: 120
}
```

---

### EarningsChart.jsx

**Rôle** : Graphique des revenus et gains on-chain.

**Fonctionnalités** :
- **Revenus quotidiens/hebdomadaires** : Line chart depuis events PaymentSplit
- **Retraits en attente** : Solde disponible dans PaymentSplitter
- **Bouton "Retirer"** : Retrait des fonds vers wallet restaurant
- **Montants retirés** : Historique des retraits
- **Historique transactions** : Table avec dates, orderId, montant, txHash
- **Pagination** : Pour l'historique des transactions

**Données blockchain** :
- Events `PaymentSplit` filtrés par restaurant
- Calcul : 70% de chaque `foodPrice`
- Balance du contrat `PaymentSplitter`

---

## 📄 Pages

### DashboardPage.jsx

**Route** : `/`

**Fonctionnalités** :
- Vue d'ensemble des commandes du jour
- Statistiques rapides (KPIs) :
  - Commandes en attente
  - Commandes en préparation
  - Commandes livrées aujourd'hui
  - Revenue aujourd'hui
- Commandes en attente (intègre OrdersQueue)
- Mini graphique des revenus (dernières 24h)
- Comparaison avec hier
- Accès rapide aux autres pages

---

### OrdersPage.jsx

**Route** : `/orders`

**Fonctionnalités** :
- Liste de toutes les commandes
- Table avec colonnes : Order ID, Client, Items, Total, Status, Date, Actions
- Filtres par statut et date
- Date range picker
- Search bar (order ID ou client)
- Actions : Confirmer préparation, Voir détails, Export CSV
- Modal détails commande complète avec :
- Timeline des statuts
- Transaction hash
  - Informations client et livreur

---

### MenuPage.jsx

**Route** : `/menu`

**Fonctionnalités** :
- Intègre MenuManager en mode full-page
- Sidebar avec catégories
- Grid des items avec images
- Bouton "Ajouter item" en header
- Toggle "Mode aperçu" (vue client)
- Gestion complète du menu (CRUD)

---

### AnalyticsPage.jsx

**Route** : `/analytics`

**Fonctionnalités** :
- Intègre Analytics et EarningsChart
- Graphiques détaillés :
  - Revenue over time
  - Orders over time
  - Popular dishes
  - Peak hours
  - Customer ratings
- Export de données (bouton "Export CSV")
- Rapports personnalisés
- Date range selector
- Comparaison entre périodes

---

### RegisterPage.jsx

**Route** : `/register`

**Fonctionnalités** :
- Inscription d'un nouveau restaurant
- Formulaire : nom, cuisine, description, adresse, images
- Upload images vers IPFS
- Création du menu initial
- Attribution du rôle RESTAURANT_ROLE (via admin)

---

##  Services

### api.js

**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getRestaurant(restaurantId)` : Détails restaurant avec menu
- `getOrders(restaurantId, filters)` : Commandes avec filtres
- `confirmPreparation(orderId, restaurantAddress)` : Confirmation préparation
- `updateMenu(restaurantId, menu)` : Mise à jour menu complet
- `addMenuItem(restaurantId, item)` : Ajouter item au menu
- `updateMenuItem(restaurantId, itemId, updates)` : Modifier item
- `deleteMenuItem(restaurantId, itemId)` : Supprimer item
- `getAnalytics(restaurantId, params)` : Statistiques
- `uploadImage(file)` : Upload image IPFS
- `getEarnings(restaurantId, period)` : Revenus on-chain
- `withdraw(restaurantId, restaurantAddress)` : Retirer fonds

**Exemple** :
```javascript
import api from './services/api'

const orders = await api.getOrders(restaurantId, { status: 'CREATED' })
const analytics = await api.getAnalytics(restaurantId, { period: 'week' })
```

---

### blockchain.js

**Rôle** : Service pour les interactions Web3 directes.

**Fonctions principales** :
- `connectWallet()` : Connexion MetaMask
- `hasRole(role, address)` : Vérification rôle RESTAURANT
- `confirmPreparationOnChain(orderId)` : Confirmation on-chain
- `getRestaurantOrders(restaurantAddress)` : Commandes on-chain
- `getEarningsOnChain(restaurantAddress)` : Revenus on-chain
- `getPaymentSplitEvents(restaurantAddress)` : Events PaymentSplit
- `getPendingBalance(restaurantAddress)` : Solde en attente
- `withdraw()` : Retirer fonds depuis PaymentSplitter

**Exemple** :
```javascript
import blockchain from './services/blockchain'

const hasRole = await blockchain.hasRole('RESTAURANT_ROLE', address)
const { txHash } = await blockchain.confirmPreparationOnChain(orderId)
```

---

### ipfs.js

**Rôle** : Service pour les interactions IPFS.

**Fonctions principales** :
- `uploadImage(file)` : Upload image via backend
- `getImage(hash)` : URL image IPFS
- `uploadJSON(data)` : Upload JSON via backend
- `getJSON(hash)` : Récupération JSON

---

## 🌐 Intégration API

### Endpoints utilisés

#### Restaurants
- `GET /api/restaurants/:id` : Détails restaurant
- `PUT /api/restaurants/:id` : Mettre à jour restaurant
- `PUT /api/restaurants/:id/menu` : Mettre à jour menu
- `POST /api/restaurants/:id/menu/item` : Ajouter item
- `PUT /api/restaurants/:id/menu/item/:itemId` : Modifier item
- `DELETE /api/restaurants/:id/menu/item/:itemId` : Supprimer item
- `GET /api/restaurants/:id/analytics` : Statistiques
- `GET /api/restaurants/:id/orders` : Commandes restaurant
- `GET /api/restaurants/:id/earnings` : Revenus on-chain
- `POST /api/restaurants/:id/withdraw` : Retirer fonds

#### Commandes
- `GET /api/orders/:id` : Détails commande
- `POST /api/orders/:id/confirm-preparation` : Confirmer préparation

#### Upload
- `POST /api/upload/image` : Upload image IPFS
- `POST /api/upload/multiple-images` : Upload multiples images

### Socket.io

**Connexion** :
```javascript
import io from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL)
socket.emit('join-restaurant-room', restaurantId)
```

**Events écoutés** :
- `orderCreated` : Nouvelle commande
- `delivererAssigned` : Livreur assigné
- `orderDelivered` : Commande livrée
- `disputeOpened` : Litige ouvert

---

## ▶️ Démarrage

### Mode développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5174` (ou un autre port si occupé).

### Build production

```bash
npm run build
```

Les fichiers optimisés sont générés dans le dossier `dist/`.

### Preview production

```bash
npm run preview
```

Prévisualise le build de production localement.

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. Installer Vercel CLI :
```bash
npm i -g vercel
```

2. Déployer :
```bash
vercel
```

3. Configurer les variables d'environnement dans le dashboard Vercel.

### Netlify

1. Installer Netlify CLI :
```bash
npm i -g netlify-cli
```

2. Déployer :
```bash
netlify deploy --prod
```

3. Configurer les variables d'environnement dans le dashboard Netlify.

### Variables d'environnement à configurer

Assurez-vous de configurer toutes les variables d'environnement dans votre plateforme de déploiement :
- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_ORDER_MANAGER_ADDRESS`
- `VITE_PAYMENT_SPLITTER_ADDRESS`
- `VITE_IPFS_GATEWAY`

---

## 👨‍🍳 Workflow utilisateur

### Parcours complet d'un restaurant

1. **Connexion** : Le restaurant se connecte avec MetaMask
2. **Vérification** : Vérification du rôle RESTAURANT_ROLE
3. **Dashboard** : Accès au tableau de bord
4. **Nouvelle commande** : Réception via Socket.io avec notification
5. **Confirmation** : Le restaurant confirme la préparation (on-chain)
6. **Livreur** : Un livreur est assigné automatiquement
7. **Livraison** : Suivi de la livraison
8. **Revenus** : Les revenus (70%) sont ajoutés au PaymentSplitter
9. **Retrait** : Le restaurant peut retirer ses fonds
10. **Analytics** : Consultation des statistiques et graphiques
11. **Menu** : Gestion du menu (ajout, modification, suppression d'items)

### Gestion d'une commande

1. **Réception** : Nouvelle commande arrive via Socket.io
2. **Affichage** : Commande apparaît dans OrdersQueue
3. **Préparation** : Le restaurant prépare la commande
4. **Confirmation** : Clic sur "Confirmer préparation"
5. **Blockchain** : Transaction on-chain confirmée
6. **Notification** : Les livreurs disponibles sont notifiés
7. **Assignation** : Un livreur accepte la commande
8. **Livraison** : Suivi jusqu'à la livraison
9. **Paiement** : Split automatique (70% restaurant, 20% livreur, 10% plateforme)

---

## 🎨 Personnalisation

### Thème TailwindCSS

Modifiez `tailwind.config.js` pour personnaliser les couleurs, polices, etc.

### Graphiques

Les graphiques utilisent Chart.js. Personnalisez les couleurs et styles dans les composants `Analytics.jsx` et `EarningsChart.jsx`.

---

## 🐛 Dépannage

### MetaMask non détecté

**Problème** : "MetaMask not found"

**Solution** :
1. Installer MetaMask depuis [metamask.io](https://metamask.io/)
2. Rafraîchir la page
3. Vérifier que MetaMask est déverrouillé

### Rôle RESTAURANT non trouvé

**Problème** : "You don't have RESTAURANT_ROLE"

**Solution** :
1. Vérifier que le wallet a bien le rôle RESTAURANT_ROLE
2. Contacter l'administrateur pour attribution du rôle
3. Vérifier que le restaurant est enregistré dans la base de données

### Réseau incorrect

**Problème** : "Wrong network"

**Solution** :
1. Ouvrir MetaMask
2. Changer le réseau vers "Polygon Amoy"
3. Si le réseau n'existe pas, l'ajouter manuellement :
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency: MATIC

### Erreur API

**Problème** : "Failed to fetch"

**Solution** :
1. Vérifier que le backend est démarré
2. Vérifier `VITE_API_URL` dans `.env`
3. Vérifier CORS dans le backend

### Commandes ne s'affichent pas

**Problème** : Aucune commande dans OrdersQueue

**Solution** :
1. Vérifier la connexion Socket.io
2. Vérifier que le restaurant a rejoint la room `restaurant_${restaurantId}`
3. Vérifier les logs du backend pour les events émis

---

##  Ressources

- **React Documentation** : https://react.dev/
- **Vite Documentation** : https://vitejs.dev/
- **TailwindCSS Documentation** : https://tailwindcss.com/
- **Chart.js Documentation** : https://www.chartjs.org/
- **Ethers.js Documentation** : https://docs.ethers.org/
- **Socket.io Documentation** : https://socket.io/docs/

---

##  Scripts NPM

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Build
npm run build            # Build pour production
npm run preview          # Prévisualiser le build

# Linting (si configuré)
npm run lint             # Vérifier le code
npm run lint:fix         # Corriger automatiquement
```

---

## 🤝 Contribution

### Workflow

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Tester localement
4. Créer une pull request

### Standards de code

- Utiliser ESLint (si configuré)
- Suivre les conventions React
- Ajouter des commentaires pour les fonctions complexes
- Tester sur desktop et tablette

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour DONE Food Delivery**
