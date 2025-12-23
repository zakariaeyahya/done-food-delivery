# DONE Food Delivery - Frontend Restaurant

## Vue d'Ensemble

Application React pour les restaurants de la plateforme DONE Food Delivery. Permet de gerer les commandes, le menu et suivre les revenus. Interface connectee a la blockchain Polygon pour la confirmation des preparations et le suivi des paiements.

**Port:** 5174
**Stack:** React + Vite + TailwindCSS + Ethers.js

---

## Fonctionnalites Principales

| Fonctionnalite | Description |
|----------------|-------------|
| **Connexion Web3** | MetaMask avec verification role RESTAURANT |
| **Dashboard** | KPIs temps reel (commandes, revenus, preparation) |
| **Gestion Commandes** | Liste commandes avec actions (accepter, preparer) |
| **Confirmation On-chain** | Appel confirmPreparation() sur blockchain |
| **Gestion Menu** | CRUD plats avec images IPFS |
| **Analytics** | Graphiques revenus, plats populaires, temps preparation |
| **Suivi Revenus** | Lecture events PaymentSplit (70% restaurant) |

---

## Structure du Projet

```
frontend/restaurant/
├── src/
│   ├── components/           # Composants reutilisables
│   │   ├── ConnectWallet     # Connexion MetaMask + role RESTAURANT
│   │   ├── OrdersQueue       # File d'attente commandes
│   │   ├── OrderCard         # Carte commande individuelle
│   │   ├── MenuManager       # Gestion menu (CRUD)
│   │   ├── EarningsChart     # Graphique revenus
│   │   ├── Analytics         # Statistiques detaillees
│   │   └── ui/               # Composants UI reutilisables
│   ├── pages/                # Pages de l'application
│   │   ├── DashboardPage     # KPIs + commandes en attente
│   │   ├── OrdersPage        # Gestion complete commandes
│   │   ├── MenuPage          # Gestion menu restaurant
│   │   ├── AnalyticsPage     # Statistiques detaillees
│   │   └── RegisterPage      # Inscription restaurant
│   ├── services/             # Services API et Blockchain
│   │   ├── api.js            # Appels API backend REST
│   │   ├── blockchain.js     # Interactions smart contracts
│   │   └── ipfs.js           # Upload/lecture IPFS
│   ├── contexts/             # Context providers
│   │   ├── WalletContext     # Etat wallet connecte
│   │   └── SocketContext     # Connexion Socket.io
│   └── utils/                # Utilitaires
│       └── formatters.js     # Formatage donnees
├── .env                      # Variables d'environnement
└── package.json              # Dependances
```

---

## Pages

### DashboardPage
Page d'accueil avec vue d'ensemble:
- **KPIs:** Commandes en attente, En preparation, Livrees aujourd'hui, Revenus
- **File Commandes:** OrdersQueue avec filtre CREATED
- **Graphique Revenus:** EarningsChart periode semaine
- **Bouton Actualiser:** Refresh des donnees

### OrdersPage
Gestion complete des commandes:
- **Liste Filtrable:** Par statut (CREATED, PREPARING, READY, etc.)
- **Actions:** Accepter, Marquer pret, Voir details
- **Timeline:** Historique des changements de statut
- **Recherche:** Par numero de commande ou client

### MenuPage
Gestion du menu restaurant:
- **Liste Plats:** Tous les plats avec image, prix, categorie
- **Ajout Plat:** Formulaire avec upload image IPFS
- **Modification:** Edition prix, description, disponibilite
- **Categories:** Entrees, Plats, Desserts, Boissons
- **Toggle Disponibilite:** Activer/desactiver un plat

### AnalyticsPage
Statistiques detaillees:
- **Revenus:** Graphique evolution par periode
- **Plats Populaires:** Top 5 commandes
- **Temps Preparation:** Moyenne et historique
- **Ratings:** Note moyenne et avis clients

### RegisterPage
Inscription nouveau restaurant:
- **Formulaire:** Nom, cuisine, description, adresse
- **Images:** Upload logo et photos vers IPFS
- **Menu Initial:** Creation premiers plats

---

## Composants

### ConnectWallet
Connexion wallet restaurant:
- Detection MetaMask installe
- Connexion et recuperation adresse
- Verification reseau Polygon Amoy (chainId 80002)
- Verification role RESTAURANT_ROLE on-chain
- Recuperation profil restaurant depuis API

### OrdersQueue
File d'attente des commandes:
- Reception nouvelles commandes via Socket.io
- Notification sonore pour nouvelles commandes
- Filtres par statut (Toutes, Nouvelles, En preparation, Pretes)
- Bouton "Confirmer preparation" (on-chain + off-chain)
- Timer temps ecoule depuis creation

### OrderCard
Carte commande individuelle:
- Numero commande, client, total en POL
- Liste items avec quantites et prix
- Images des plats depuis IPFS
- Badge statut colore
- Boutons actions selon statut

### MenuManager
Gestion complete du menu (CRUD):
- Affichage grid des items avec images IPFS
- Modal formulaire ajout/modification
- Upload image vers IPFS via backend
- Toggle disponibilite par plat
- Suppression avec confirmation

### EarningsChart
Graphique revenus on-chain:
- Chart.js line chart evolution revenus
- Donnees depuis events PaymentSplit
- Periode configurable (jour/semaine/mois)
- Liens vers transactions Polygonscan

### Analytics
Statistiques detaillees:
- Total commandes par periode
- Plats populaires (top 5)
- Temps moyen preparation
- Note moyenne et nombre avis

---

## Services

### api.js
Service API backend REST:
- `getRestaurant(id)` - Profil restaurant
- `getOrders(restaurantId, filters)` - Commandes avec filtres
- `updateOrderStatus(orderId, status)` - Changer statut
- `getMenu(restaurantId)` - Liste plats
- `addMenuItem(data)` - Ajouter plat
- `updateMenuItem(id, data)` - Modifier plat
- `deleteMenuItem(id)` - Supprimer plat
- `getEarnings(restaurantId, period)` - Revenus par periode
- `getAnalytics(restaurantId, period)` - Statistiques

### blockchain.js
Service interactions smart contracts:
- `connectWallet()` - Connexion MetaMask
- `hasRole(role, address)` - Verification role RESTAURANT
- `confirmPreparationOnChain(orderId)` - Confirmation preparation
- `getPaymentSplitEvents(address)` - Events paiements recus

### ipfs.js
Service IPFS (via Pinata):
- `uploadImage(file)` - Upload image, retourne hash
- `getImage(hash)` - URL complete image IPFS

---

## Interactions Blockchain

### Confirmation Preparation (DoneOrderManager Contract)
Quand le restaurant marque une commande comme prete:
- Appel `confirmPreparation(orderId)` on-chain
- Change statut CREATED -> PREPARING
- Emet event `OrderStatusChanged`

### Revenus (DonePaymentSplitter Contract)
A la confirmation de livraison par le client:
- PaymentSplit automatique: **70% restaurant**, 20% livreur, 10% plateforme
- Event `PaymentSplit(orderId, restaurantAmount, ...)` emis
- EarningsChart lit ces events pour afficher les revenus

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-restaurant-room` | Client -> Server | Rejoindre room restaurant |
| `newOrder` | Server -> Client | Nouvelle commande recue |
| `orderStatusUpdate` | Server -> Client | Changement statut commande |
| `delivererAssigned` | Server -> Client | Livreur assigne |

---

## Workflow Commande (Restaurant)

1. **Nouvelle Commande** - Notification Socket.io `newOrder`
2. **Affichage** - Commande apparait dans OrdersQueue (CREATED)
3. **Acceptation** - Clic "Accepter" -> statut PREPARING
4. **Preparation** - Restaurant prepare les plats
5. **Confirmation** - Clic "Pret" -> appel `confirmPreparation()` on-chain
6. **Statut READY** - Commande disponible pour livreur
7. **Livraison** - Livreur recupere et livre
8. **Paiement** - Reception automatique 70% via PaymentSplitter

---

## Variables d'Environnement

```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Blockchain (Polygon Amoy)
VITE_ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
VITE_PAYMENT_SPLITTER_ADDRESS=0xE99F26DA1B38a79d08ed8d853E45397C99818C2f
VITE_CHAIN_ID=80002

# IPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## Installation et Demarrage

```bash
# Installation
cd frontend/restaurant
npm install

# Developpement
npm run dev

# Build production
npm run build
```

Application accessible sur `http://localhost:5174`

---

## Technologies

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| React Router 6 | Navigation SPA |
| Ethers.js 6 | Interactions blockchain |
| Socket.io Client | Temps reel |
| Chart.js | Graphiques revenus |
| Axios | Appels API REST |
| TailwindCSS 3 | Styling |
| Vite 5 | Build tool |

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Role RESTAURANT non trouve | Contacter admin pour attribution role |
| Commandes non affichees | Verifier connexion Socket.io |
| Images non chargees | Verifier gateway IPFS dans .env |
| Revenus a 0 | Verifier events PaymentSplit sur blockchain |

---

## Liens Utiles

- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Documentation Backend](../../backend/README.md)
- [Smart Contracts](../../contracts/README.md)
