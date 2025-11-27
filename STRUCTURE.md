# Structure Complète du Projet DONE Food Delivery

## Structure Globale

```
done-food-delivery/
│
├── README.md
├── ARCHITECTURE.md
├── STRUCTURE.md
├── .gitignore
├── package.json
├── hardhat.config.js
├── .env.example
│
├── contracts/                           # Sprint 1 - Smart Contracts
│   ├── DoneOrderManager.sol
│   ├── DonePaymentSplitter.sol
│   ├── DoneToken.sol
│   ├── DoneStaking.sol
│   ├── interfaces/
│   │   ├── IOrderManager.sol
│   │   └── IPaymentSplitter.sol
│   └── libraries/
│       └── OrderLib.sol
│
├── scripts/                             # Sprint 1 - Scripts de déploiement
│   ├── deploy-all.js
│   ├── setup-roles.js
│   └── seed-data.js
│
├── test/                                # Sprint 1 - Tests Smart Contracts
│   ├── DoneOrderManager.test.js
│   ├── DonePaymentSplitter.test.js
│   ├── DoneToken.test.js
│   └── DoneStaking.test.js
│
├── backend/                             # Sprint 2 - API Backend
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── blockchain.js
│   │   │   ├── ipfs.js
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── orderController.js
│   │   │   ├── userController.js
│   │   │   ├── restaurantController.js
│   │   │   └── delivererController.js
│   │   ├── services/
│   │   │   ├── blockchainService.js
│   │   │   ├── ipfsService.js
│   │   │   └── notificationService.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Order.js
│   │   │   └── Deliverer.js
│   │   ├── routes/
│   │   │   ├── orders.js
│   │   │   ├── users.js
│   │   │   ├── restaurants.js
│   │   │   └── deliverers.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   └── utils/
│   │       ├── priceOracle.js
│   │       └── gpsTracker.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                            # Sprints 3-5 - Applications Frontend
│   ├── client/                          # Sprint 3 - Application Client
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── index.jsx
│   │   │   ├── components/
│   │   │   │   ├── ConnectWallet.jsx
│   │   │   │   ├── RestaurantList.jsx
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   ├── MenuItems.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── OrderTracking.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   ├── TokenBalance.jsx
│   │   │   │   └── DisputeModal.jsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── RestaurantPage.jsx
│   │   │   │   ├── CheckoutPage.jsx
│   │   │   │   ├── TrackingPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── services/
│   │   │   │   ├── api.js
│   │   │   │   ├── blockchain.js
│   │   │   │   └── ipfs.js
│   │   │   ├── utils/
│   │   │   │   ├── web3.js
│   │   │   │   └── formatters.js
│   │   │   └── index.css
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── .env.example
│   │
│   ├── restaurant/                      # Sprint 4 - Application Restaurant
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── index.jsx
│   │   │   ├── components/
│   │   │   │   ├── ConnectWallet.jsx
│   │   │   │   ├── OrdersQueue.jsx
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── MenuManager.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── EarningsChart.jsx
│   │   │   ├── pages/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   └── AnalyticsPage.jsx
│   │   │   ├── services/
│   │   │   │   ├── api.js
│   │   │   │   └── blockchain.js
│   │   │   └── index.css
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── .env.example
│   │
│   └── deliverer/                       # Sprint 5 - Application Livreur
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── App.jsx
│       │   ├── index.jsx
│       │   ├── components/
│       │   │   ├── ConnectWallet.jsx
│       │   │   ├── StakingPanel.jsx
│       │   │   ├── AvailableOrders.jsx
│       │   │   ├── ActiveDelivery.jsx
│       │   │   ├── NavigationMap.jsx
│       │   │   ├── EarningsTracker.jsx
│       │   │   └── RatingDisplay.jsx
│       │   ├── pages/
│       │   │   ├── HomePage.jsx
│       │   │   ├── DeliveriesPage.jsx
│       │   │   ├── EarningsPage.jsx
│       │   │   └── ProfilePage.jsx
│       │   ├── services/
│       │   │   ├── api.js
│       │   │   ├── blockchain.js
│       │   │   └── geolocation.js
│       │   └── index.css
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── .env.example
│
└── docs/                                # Sprint 10 - Documentation
    ├── USER_GUIDE.md
    ├── RESTAURANT_GUIDE.md
    ├── DELIVERER_GUIDE.md
    ├── ADMIN_GUIDE.md
    ├── API_DOCUMENTATION.md
    ├── SMART_CONTRACTS.md
    └── TROUBLESHOOTING.md
```

## Description Détaillée des Dossiers

### Racine du Projet

- **README.md** : Documentation principale du projet
- **ARCHITECTURE.md** : Architecture détaillée du système
- **STRUCTURE.md** : Ce fichier - structure complète du projet
- **.gitignore** : Fichiers à ignorer par Git
- **package.json** : Configuration npm avec workspaces
- **hardhat.config.js** : Configuration Hardhat pour les smart contracts
- **.env.example** : Exemple de variables d'environnement

### contracts/ (Sprint 1)

Contient tous les smart contracts Solidity :

- **DoneOrderManager.sol** : Contrat principal de gestion des commandes
- **DonePaymentSplitter.sol** : Répartition automatique des paiements (70/20/10)
- **DoneToken.sol** : Token ERC20 de fidélité (DONE)
- **DoneStaking.sol** : Gestion du staking des livreurs
- **interfaces/** : Interfaces pour standardiser les contrats
  - IOrderManager.sol
  - IPaymentSplitter.sol
- **libraries/** : Bibliothèques utilitaires
  - OrderLib.sol

### scripts/ (Sprint 1)

Scripts de déploiement et configuration :

- **deploy-all.js** : Déploiement de tous les contrats sur Mumbai
- **setup-roles.js** : Configuration des rôles après déploiement
- **seed-data.js** : Remplissage avec des données de test

### test/ (Sprint 1)

Tests unitaires pour les smart contracts :

- **DoneOrderManager.test.js** : Tests du workflow complet
- **DonePaymentSplitter.test.js** : Tests de répartition des paiements
- **DoneToken.test.js** : Tests du token ERC20
- **DoneStaking.test.js** : Tests du staking et slashing

### backend/ (Sprint 2)

API Backend Node.js/Express :

#### src/config/
- **blockchain.js** : Configuration connexion blockchain
- **ipfs.js** : Configuration IPFS
- **database.js** : Configuration MongoDB

#### src/controllers/
- **orderController.js** : Logique métier des commandes
- **userController.js** : Gestion des utilisateurs
- **restaurantController.js** : Gestion des restaurants
- **delivererController.js** : Gestion des livreurs

#### src/services/
- **blockchainService.js** : Interactions avec les smart contracts
- **ipfsService.js** : Upload/récupération IPFS
- **notificationService.js** : Notifications Socket.io et emails

#### src/models/
- **User.js** : Modèle Mongoose utilisateur
- **Restaurant.js** : Modèle Mongoose restaurant
- **Order.js** : Modèle Mongoose commande (données off-chain)
- **Deliverer.js** : Modèle Mongoose livreur

#### src/routes/
- **orders.js** : Routes API pour les commandes
- **users.js** : Routes API pour les utilisateurs
- **restaurants.js** : Routes API pour les restaurants
- **deliverers.js** : Routes API pour les livreurs

#### src/middleware/
- **auth.js** : Authentification JWT
- **validation.js** : Validation des requêtes

#### src/utils/
- **priceOracle.js** : Simulation Chainlink Price Oracle
- **gpsTracker.js** : Simulation GPS tracking

### frontend/client/ (Sprint 3)

Application React pour les clients :

#### src/components/
- **ConnectWallet.jsx** : Connexion MetaMask
- **RestaurantList.jsx** : Liste des restaurants
- **RestaurantCard.jsx** : Carte restaurant
- **MenuItems.jsx** : Affichage du menu
- **Cart.jsx** : Panier d'achat
- **Checkout.jsx** : Page de paiement
- **OrderTracking.jsx** : Suivi de commande en temps réel
- **OrderHistory.jsx** : Historique des commandes
- **TokenBalance.jsx** : Affichage du solde de tokens DONE
- **DisputeModal.jsx** : Modal pour ouvrir un litige

#### src/pages/
- **HomePage.jsx** : Page d'accueil
- **RestaurantPage.jsx** : Page détail restaurant
- **CheckoutPage.jsx** : Page de checkout
- **TrackingPage.jsx** : Page de suivi
- **ProfilePage.jsx** : Profil utilisateur

#### src/services/
- **api.js** : Appels API backend
- **blockchain.js** : Interactions Web3
- **ipfs.js** : Interactions IPFS

#### src/utils/
- **web3.js** : Utilitaires Web3
- **formatters.js** : Formatage des données

### frontend/restaurant/ (Sprint 4)

Application React pour les restaurants :

#### src/components/
- **ConnectWallet.jsx** : Connexion MetaMask
- **OrdersQueue.jsx** : File d'attente des commandes
- **OrderCard.jsx** : Carte de commande
- **MenuManager.jsx** : Gestion du menu
- **Analytics.jsx** : Statistiques
- **EarningsChart.jsx** : Graphique des revenus

#### src/pages/
- **DashboardPage.jsx** : Tableau de bord
- **OrdersPage.jsx** : Gestion des commandes
- **MenuPage.jsx** : Gestion du menu
- **AnalyticsPage.jsx** : Analytics détaillées

### frontend/deliverer/ (Sprint 5)

Application React pour les livreurs :

#### src/components/
- **ConnectWallet.jsx** : Connexion MetaMask
- **StakingPanel.jsx** : Panel de staking
- **AvailableOrders.jsx** : Commandes disponibles
- **ActiveDelivery.jsx** : Livraison en cours
- **NavigationMap.jsx** : Carte de navigation
- **EarningsTracker.jsx** : Suivi des gains
- **RatingDisplay.jsx** : Affichage des notes

#### src/pages/
- **HomePage.jsx** : Page d'accueil
- **DeliveriesPage.jsx** : Gestion des livraisons
- **EarningsPage.jsx** : Revenus
- **ProfilePage.jsx** : Profil livreur

#### src/services/
- **geolocation.js** : Services de géolocalisation

### docs/ (Sprint 10)

Documentation complète :

- **USER_GUIDE.md** : Guide utilisateur client
- **RESTAURANT_GUIDE.md** : Guide restaurant
- **DELIVERER_GUIDE.md** : Guide livreur
- **ADMIN_GUIDE.md** : Guide administrateur
- **API_DOCUMENTATION.md** : Documentation API REST
- **SMART_CONTRACTS.md** : Documentation des smart contracts
- **TROUBLESHOOTING.md** : Guide de dépannage

## Fichiers de Configuration par Workspace

### Racine
- `package.json` : Workspaces npm
- `hardhat.config.js` : Configuration Hardhat
- `.env.example` : Variables d'environnement globales

### backend/
- `package.json` : Dépendances backend
- `.env.example` : Variables d'environnement backend

### frontend/client/
- `package.json` : Dépendances client
- `vite.config.js` : Configuration Vite
- `tailwind.config.js` : Configuration TailwindCSS
- `.env.example` : Variables d'environnement client

### frontend/restaurant/
- `package.json` : Dépendances restaurant
- `vite.config.js` : Configuration Vite
- `tailwind.config.js` : Configuration TailwindCSS
- `.env.example` : Variables d'environnement restaurant

### frontend/deliverer/
- `package.json` : Dépendances livreur
- `vite.config.js` : Configuration Vite
- `tailwind.config.js` : Configuration TailwindCSS
- `.env.example` : Variables d'environnement livreur

## Notes Importantes

1. **Workspaces npm** : Le projet utilise npm workspaces pour gérer les dépendances de manière centralisée
2. **Sprints** : Chaque dossier est associé à un sprint de développement
3. **Environnement** : Chaque workspace a son propre `.env.example` à copier en `.env`
4. **Tests** : Les tests sont organisés par composant (smart contracts, backend, frontend)
5. **Documentation** : La documentation est centralisée dans le dossier `docs/`

