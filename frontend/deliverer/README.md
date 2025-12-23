# DONE Food Delivery - Frontend Livreur

## Vue d'Ensemble

Application React pour les livreurs de la plateforme DONE Food Delivery. Permet d'accepter des livraisons, suivre les trajets GPS en temps reel et gerer les gains. Concue comme PWA pour installation mobile avec acces GPS natif.

**Port:** 5175
**Stack:** React + Vite + TailwindCSS + Ethers.js + Google Maps

---

## Fonctionnalites Principales

| Fonctionnalite | Description |
|----------------|-------------|
| **Connexion Web3** | MetaMask avec verification role DELIVERER |
| **Staking** | Depot garantie 0.1 MATIC minimum sur DoneStaking |
| **Commandes Disponibles** | Liste commandes READY triees par distance |
| **Navigation GPS** | Google Maps avec itineraires temps reel |
| **Tracking Actif** | Suivi GPS automatique pendant livraisons |
| **Confirmation On-chain** | Pickup et delivery valides sur blockchain |
| **Suivi Gains** | Analytics revenus (20% du total) |
| **PWA Mobile** | Installation ecran d'accueil + GPS natif |

---

## Structure du Projet

```
frontend/deliverer/
├── src/
│   ├── components/           # Composants reutilisables
│   │   ├── ConnectWallet     # Connexion MetaMask + role DELIVERER
│   │   ├── StakingPanel      # Gestion staking (stake/unstake)
│   │   ├── AvailableOrders   # Liste commandes disponibles
│   │   ├── ActiveDelivery    # Livraison en cours avec actions
│   │   ├── NavigationMap     # Carte Google Maps interactive
│   │   ├── EarningsTracker   # Suivi gains avec graphiques
│   │   ├── RatingDisplay     # Notes et avis clients
│   │   ├── charts/           # Composants graphiques Chart.js
│   │   ├── delivery/         # Composants livraison
│   │   ├── wallet/           # Composants wallet
│   │   └── ui/               # Composants UI reutilisables
│   ├── pages/                # Pages de l'application
│   │   ├── HomePage          # Dashboard + toggle online/offline
│   │   ├── DeliveriesPage    # Historique livraisons
│   │   ├── EarningsPage      # Revenus detailles
│   │   └── ProfilePage       # Profil + staking + rating
│   ├── services/             # Services API et Blockchain
│   │   ├── api.js            # Appels API backend REST
│   │   ├── blockchain.js     # Interactions smart contracts
│   │   └── geolocation.js    # Service GPS
│   ├── providers/            # Context providers
│   │   └── AppProvider       # Provider global (wallet, state)
│   └── utils/                # Utilitaires
│       └── formatters.ts     # Formatage donnees
├── .env                      # Variables d'environnement
└── package.json              # Dependances
```

---

## Pages

### HomePage
Dashboard principal du livreur:
- **Toggle Online/Offline:** Activation disponibilite pour commandes
- **Stats Rapides:** Livraisons (7j), Gains (7j), Rating, Montant stake
- **Livraison Active:** Si en cours, affiche ActiveDelivery
- **Commandes Disponibles:** Liste des 5 commandes les plus proches

### DeliveriesPage
Historique complet des livraisons:
- **Liste Paginee:** Toutes les livraisons passees et en cours
- **Filtres:** Par statut (Toutes, En cours, Completees, Annulees)
- **Details:** Modal avec timeline, GPS history, transaction hash
- **Export:** Telechargement CSV de l'historique

### EarningsPage
Suivi detaille des revenus:
- **Periode:** Aujourd'hui, Semaine, Mois
- **Montant Total:** Earnings en POL avec graphique evolution
- **Historique Transactions:** Table avec Date, Order ID, Montant, TxHash
- **Export CSV:** Telechargement des donnees

### ProfilePage
Profil et parametres du livreur:
- **Informations:** Nom, telephone, wallet
- **Staking Panel:** Montant stake, boutons stake/unstake
- **Rating:** Note moyenne, avis clients, historique
- **Parametres:** Langue, notifications, theme

---

## Composants

### ConnectWallet
Connexion wallet avec verifications:
- Detection MetaMask installe
- Connexion et recuperation adresse
- Verification reseau Polygon Amoy (chainId 80002)
- Verification role DELIVERER_ROLE on-chain
- Verification staking minimum (0.1 MATIC)

### StakingPanel
Gestion du depot de garantie:
- Affichage montant stake actuel en POL
- Statut: Stake / Non stake (badge visuel)
- Bouton "Stake" avec input montant
- Bouton "Unstake" (desactive si livraison active)
- Historique slashing (si applicable)

### AvailableOrders
Liste des commandes a accepter:
- Fetch commandes status READY depuis API
- Tri par distance (plus proche en premier)
- Auto-refresh toutes les 10 secondes
- Socket.io listener pour nouvelles commandes
- Gains estimes (deliveryFee en POL)
- Bouton "Accepter" par commande

### ActiveDelivery
Gestion de la livraison en cours:
- Details commande (ID, client, items, total)
- Adresse restaurant avec bouton "Naviguer"
- Adresse client avec bouton "Naviguer"
- Bouton "Confirmer Pickup" (actif si < 100m du restaurant)
- Bouton "Confirmer Livraison" (actif si < 100m du client)
- GPS tracking automatique pendant livraison

### NavigationMap
Carte Google Maps interactive:
- Markers: position livreur, restaurant, client
- Itineraire avec DirectionsService
- ETA (temps estime d'arrivee)
- Mise a jour position temps reel
- Recalcul route si deviation

### EarningsTracker
Suivi des gains:
- Gains par periode (jour/semaine/mois)
- Graphique line chart evolution
- Nombre livraisons completees
- Comparaison avec periode precedente

### RatingDisplay
Affichage notes et avis:
- Note moyenne sur 5 etoiles
- Nombre total d'avis et livraisons
- Liste des derniers avis clients
- Graphique evolution rating

---

## Services

### api.js
Service API backend REST:
- `getAvailableOrders(location)` - Commandes disponibles
- `acceptOrder(orderId, address)` - Accepter commande
- `confirmPickup(orderId, address)` - Confirmer recuperation
- `confirmDelivery(orderId, address)` - Confirmer livraison
- `updateGPSLocation(orderId, lat, lng)` - Mise a jour position
- `getEarnings(address, period)` - Revenus par periode
- `getRating(address)` - Notes et avis
- `updateStatus(address, isOnline)` - Toggle disponibilite
- `getDeliverer(address)` - Profil livreur
- `registerDeliverer(data)` - Inscription livreur

### blockchain.js
Service interactions smart contracts:
- `connectWallet()` - Connexion MetaMask
- `hasRole(role, address)` - Verification role DELIVERER
- `getStakeInfo(address)` - Infos staking (montant, statut)
- `stake(amount)` - Effectuer staking on-chain
- `unstake()` - Retirer staking on-chain
- `confirmPickupOnChain(orderId)` - Confirmation pickup on-chain
- `getEarningsEvents(address)` - Events PaymentSplit recus

### geolocation.js
Service GPS:
- `getCurrentPosition()` - Position actuelle
- `watchPosition(callback)` - Suivi continu
- `getDistance(lat1, lng1, lat2, lng2)` - Calcul distance
- `isNearLocation(current, target, radius)` - Verification proximite

---

## Interactions Blockchain

### Staking (DoneStaking Contract)
Le livreur doit staker minimum 0.1 MATIC pour etre actif:
- `stakeAsDeliverer()` - Depot garantie
- `unstake()` - Retrait (si pas de livraison active)
- `getStakeInfo(address)` - Consultation montant

### Livraison (DoneOrderManager Contract)
- `confirmPickup(orderId)` - Change statut IN_DELIVERY
- Declenchement GPS tracking automatique

### Paiement (DonePaymentSplitter Contract)
A la confirmation de livraison par le client:
- PaymentSplit automatique: 70% restaurant, 20% livreur, 10% plateforme
- Event `PaymentSplit` emis avec montants

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-deliverer-room` | Client -> Server | Rejoindre room livreur |
| `orderReady` | Server -> Client | Nouvelle commande disponible |
| `orderAccepted` | Server -> Client | Commande prise par autre livreur |

---

## Workflow Livraison

1. **Connexion** - Livreur connecte MetaMask
2. **Verification** - Role DELIVERER + Staking verifie
3. **Online** - Toggle disponibilite ON
4. **Reception** - Commande apparait dans liste
5. **Acceptation** - Clic "Accepter" (transaction on-chain)
6. **Navigation Restaurant** - Google Maps itineraire
7. **Pickup** - Bouton actif a < 100m, confirmation on-chain
8. **GPS Tracking** - Position envoyee toutes les 5 secondes
9. **Navigation Client** - Itineraire vers adresse livraison
10. **Delivery** - Bouton actif a < 100m, confirmation
11. **Paiement** - 20% recu automatiquement via PaymentSplitter

---

## Variables d'Environnement

```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Blockchain (Polygon Amoy)
VITE_ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
VITE_STAKING_ADDRESS=0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b
VITE_PAYMENT_SPLITTER_ADDRESS=0xE99F26DA1B38a79d08ed8d853E45397C99818C2f
VITE_CHAIN_ID=80002

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Installation et Demarrage

```bash
# Installation
cd frontend/deliverer
npm install

# Developpement
npm run dev

# Build production
npm run build
```

Application accessible sur `http://localhost:5175`

---

## PWA (Progressive Web App)

L'application est instalable sur mobile:
1. Ouvrir dans navigateur mobile
2. Menu -> "Ajouter a l'ecran d'accueil"
3. Application installee avec icone
4. Acces GPS natif disponible

---

## Technologies

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| React Router 6 | Navigation SPA |
| Ethers.js 6 | Interactions blockchain |
| Google Maps API | Cartographie + navigation |
| Socket.io Client | Temps reel |
| Chart.js | Graphiques earnings/rating |
| TailwindCSS 3 | Styling |
| Vite 5 + PWA | Build tool |

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Role DELIVERER non trouve | Contacter admin pour attribution role |
| Staking insuffisant | Staker minimum 0.1 MATIC dans ProfilePage |
| GPS non disponible | Autoriser localisation dans navigateur |
| Carte vide | Verifier cle Google Maps API |
| Commandes non affichees | Verifier toggle Online actif |

---

## Liens Utiles

- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Google Maps API Console](https://console.cloud.google.com/)
- [Documentation Backend](../../backend/README.md)
