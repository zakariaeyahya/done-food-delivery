# DONE Admin Dashboard

## Vue d'Ensemble

Dashboard d'administration pour la plateforme DONE Food Delivery. Cette application permet aux administrateurs de monitorer la plateforme, gerer les utilisateurs, restaurants, livreurs, et resoudre les litiges.

**Port:** 5176
**Stack:** React + Vite + TailwindCSS + Ethers.js

---

## Fonctionnalites Principales

| Fonctionnalite | Description |
|----------------|-------------|
| **Dashboard** | Vue d'ensemble avec KPIs temps reel (commandes, revenus, utilisateurs actifs) |
| **Gestion Commandes** | Liste filtrable de toutes les commandes, actions admin (annuler, forcer resolution) |
| **Gestion Utilisateurs** | Table des clients avec recherche, filtres, actions (suspendre/activer) |
| **Gestion Restaurants** | Table des restaurants avec stats, filtres par cuisine, rating |
| **Gestion Livreurs** | Table des livreurs avec statut stake, disponibilite, earnings |
| **Gestion Litiges** | Interface de vote et resolution des disputes |
| **Tokenomics** | Stats du token DONE (supply, circulation, top holders) |
| **Blockchain Analytics** | Monitoring temps reel du reseau Polygon Amoy |
| **Parametres** | Configuration plateforme, gestion des roles |

---

## Structure du Projet

```
frontend/admin/
├── src/
│   ├── components/           # Composants reutilisables
│   │   ├── ConnectWallet     # Connexion MetaMask + verification role admin
│   │   ├── PlatformStats     # Cards KPIs plateforme
│   │   ├── OrdersChart       # Graphique evolution commandes
│   │   ├── RevenueChart      # Graphique revenus (blockchain + API)
│   │   ├── UsersTable        # Table paginee utilisateurs
│   │   ├── RestaurantsTable  # Table paginee restaurants
│   │   ├── DeliverersTable   # Table paginee livreurs
│   │   ├── DisputesManager   # Interface gestion litiges
│   │   ├── TokenomicsPanel   # Stats token DONE
│   │   └── blockchain/       # Composants monitoring blockchain
│   │       ├── NetworkStatsCard  # Statut reseau Polygon
│   │       └── MetricsGrid       # Grille metriques blockchain
│   ├── pages/                # Pages de l'application
│   │   ├── DashboardPage     # Page principale avec overview
│   │   ├── OrdersPage        # Gestion complete commandes
│   │   ├── UsersPage         # Gestion utilisateurs
│   │   ├── DisputesPage      # Gestion litiges
│   │   ├── BlockchainPage    # Monitoring blockchain
│   │   └── SettingsPage      # Configuration plateforme
│   ├── services/             # Services API et Blockchain
│   │   ├── api.js            # Appels API backend admin
│   │   ├── blockchain.js     # Interactions smart contracts
│   │   └── blockchainMetrics.js  # Metriques reseau
│   ├── App.jsx               # Routing + authentification
│   └── index.css             # Styles TailwindCSS
├── .env                      # Variables d'environnement
└── package.json              # Dependances
```

---

## Pages

### DashboardPage
Page d'accueil avec vue d'ensemble de la plateforme:
- **KPIs:** Commandes aujourd'hui, GMV total, utilisateurs actifs, revenus plateforme
- **Graphiques:** Evolution commandes et revenus sur periode configurable
- **Actions rapides:** Liens vers les autres sections

### OrdersPage
Gestion de toutes les commandes de la plateforme:
- **Filtres:** Par statut (CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED), par date
- **Actions:** Voir details, annuler commande, forcer resolution
- **Modal:** Details complets avec timeline des statuts et transaction hash

### UsersPage
Gestion des clients de la plateforme:
- **Recherche:** Par adresse wallet, nom, email
- **Filtres:** Actifs/inactifs, avec/sans tokens DONE
- **Actions:** Voir profil, suspendre, activer
- **Stats:** Total commandes, montant depense, tokens DONE

### DisputesPage
Resolution des litiges entre clients, restaurants et livreurs:
- **Liste:** Litiges actifs avec raison, parties impliquees, votes
- **Vote:** Interface pour voter en faveur d'une partie
- **Resolution:** Declenchement resolution on-chain apres periode de vote
- **Preuves:** Affichage des images IPFS soumises

### BlockchainPage
Monitoring en temps reel du reseau Polygon Amoy:
- **Statut reseau:** Block number, gas price (Gwei), chain ID
- **Sante contrats:** Verification deploiement des 4 smart contracts
- **Metriques transactions:** Total, aujourd'hui, taux de succes
- **Latence:** Moyenne, min, max, P95
- **Volume:** Total en POL, repartition PaymentSplit (70/20/10)
- **Auto-refresh:** Configurable (10s, 30s, 1min)

### SettingsPage
Configuration de la plateforme:
- **Roles:** Assigner/retirer roles (PLATFORM_ROLE, ARBITRATOR_ROLE)
- **Contrats:** Affichage adresses des smart contracts deployes
- **Variables:** Configuration frais plateforme, montant stake minimum

---

## Composants

### ConnectWallet
Gere l'authentification admin via MetaMask:
- Verification installation MetaMask
- Connexion wallet et recuperation adresse
- Verification role PLATFORM_ROLE sur le smart contract
- Affichage erreur si pas les droits admin

### PlatformStats
Affiche les KPIs globaux sous forme de cards:
- Commandes du jour avec variation vs veille
- GMV (Gross Merchandise Volume) total
- Utilisateurs actifs avec tendance
- Revenus plateforme (10% des commandes)
- Temps moyen de livraison
- Taux de satisfaction

### OrdersChart / RevenueChart
Graphiques Chart.js pour visualiser les tendances:
- Filtres par periode (jour, semaine, mois, annee)
- Donnees combinees blockchain (events on-chain) et API (off-chain)
- Comparaison avec periode precedente

### Tables (Users, Restaurants, Deliverers)
Tables paginee avec fonctionnalites communes:
- Recherche avec debounce (300ms)
- Filtres multiples combinables
- Pagination cote serveur
- Actions contextuelles par ligne
- Formatage adresses (0x1234...5678)

### DisputesManager
Interface complete de gestion des litiges:
- Cards avec resume du litige (parties, raison, votes)
- Modal avec details complets et preuves IPFS
- Boutons de vote (Client, Restaurant, Livreur)
- Resolution manuelle si periode de vote terminee
- Historique des resolutions passees

### TokenomicsPanel
Statistiques du token DONE ERC20:
- Total supply, circulation, tokens brules
- Graphique doughnut distribution
- Graphique line emission dans le temps
- Top 10 holders avec pourcentage

### NetworkStatsCard
Affiche le statut de connexion au reseau:
- Indicateur connexion (vert/rouge)
- Block number actuel
- Gas price en Gwei
- Temps depuis dernier bloc
- Statut des 4 contrats (deploye/non deploye)

### MetricsGrid
Grille de metriques blockchain en 4 sections:
- **Transactions:** Total, aujourd'hui, taux succes
- **Latence:** Moyenne, min, max, P95
- **Gas:** Prix Gwei, units/tx, cout total POL
- **Volume:** Total POL, split 70/20/10

---

## Services

### api.js
Service centralise pour les appels API backend:
- `getPlatformStats()` - Statistiques globales
- `getDisputes(filters)` - Liste litiges avec filtres
- `resolveDispute(id, resolution)` - Resoudre un litige
- `getUsers/Restaurants/Deliverers(filters)` - Listes paginee
- `getOrders(filters)` - Commandes avec filtres
- `getAnalytics(type, timeframe)` - Donnees analytics

Headers requis: `Authorization: Bearer <signature>`, `x-wallet-address: 0x...`

### blockchain.js
Service pour interactions directes avec les smart contracts:
- `connectWallet()` - Connexion MetaMask
- `hasRole(address, role)` - Verification role on-chain
- `getPlatformRevenue(timeframe)` - Revenus depuis events PaymentSplit
- `resolveDisputeOnChain(disputeId, winner)` - Resolution litige on-chain
- `getTotalSupply/CirculatingSupply/BurnedSupply()` - Stats token DONE

### blockchainMetrics.js
Service pour metriques reseau:
- `getDashboard()` - Toutes les metriques agregees
- `getNetworkStats()` - Stats reseau (block, gas, chain)
- `getHealth()` - Sante systeme et contrats

---

## Authentification

L'acces au dashboard requiert:
1. **MetaMask installe** sur le navigateur
2. **Wallet connecte** au reseau Polygon Amoy (chainId: 80002)
3. **Role PLATFORM_ROLE** assigne sur le smart contract OrderManager

Le role est verifie on-chain via `hasRole(address, PLATFORM_ROLE)` sur le contrat.

---

## Variables d'Environnement

```env
VITE_API_URL=http://localhost:3000
VITE_ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
VITE_PAYMENT_SPLITTER_ADDRESS=0xE99F26DA1B38a79d08ed8d853E45397C99818C2f
VITE_TOKEN_ADDRESS=0x24D89CC7f6F76980F2c088DB203DEa6223B1DEd9
VITE_STAKING_ADDRESS=0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b
VITE_CHAIN_ID=80002
```

---

## Installation et Demarrage

```bash
# Installation des dependances
cd frontend/admin
npm install

# Demarrage en developpement
npm run dev

# Build production
npm run build
```

Application accessible sur `http://localhost:5176`

---

## Securite

- **Verification role:** Toutes les pages verifient le role admin avant affichage
- **Routes protegees:** Backend refuse les requetes sans role valide
- **Signature wallet:** Authentification par signature cryptographique
- **Pas de secrets frontend:** Seules les adresses publiques des contrats

---

## Technologies

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| React Router 6 | Navigation SPA |
| Ethers.js 6 | Interactions blockchain |
| Chart.js 4 | Graphiques |
| Axios | Appels API REST |
| TailwindCSS 3 | Styling |
| Vite 5 | Build tool |

---

## Liens Utiles

- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Documentation API Backend](../backend/README.md)
- [Guide Admin Complet](../../docs/ADMIN_GUIDE.md)
- [Smart Contracts](../../contracts/README.md)
