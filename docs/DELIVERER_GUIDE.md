# Guide Complet - Application Livreur DONE Food Delivery

## Table des Matières

1. [Introduction](#1-introduction)
2. [Vue d'Ensemble du Système](#2-vue-densemble-du-système)
3. [Rôle du Livreur](#3-rôle-du-livreur)
4. [Prérequis & Installation](#4-prérequis--installation)
5. [Configuration](#5-configuration)
6. [Architecture de l'Application](#6-architecture-de-lapplication)
7. [Technologies Utilisées](#7-technologies-utilisées)
8. [Structure du Projet](#8-structure-du-projet)
9. [Composants Principaux](#9-composants-principaux)
10. [Pages de l'Application](#10-pages-de-lapplication)
11. [Services](#11-services)
12. [Workflow Complet du Livreur](#12-workflow-complet-du-livreur)
13. [Système de Staking](#13-système-de-staking)
14. [Gains et Paiements](#14-gains-et-paiements)
15. [GPS et Navigation](#15-gps-et-navigation)
16. [Système de Notation](#16-système-de-notation)
17. [Intégrations Blockchain](#17-intégrations-blockchain)
18. [Progressive Web App (PWA)](#18-progressive-web-app-pwa)
19. [API Backend - Endpoints](#19-api-backend---endpoints)
20. [Socket.io - Communication Temps Réel](#20-socketio---communication-temps-réel)
21. [Résolution de Problèmes](#21-résolution-de-problèmes)
22. [Bonnes Pratiques](#22-bonnes-pratiques)

---

## 1. Introduction

**DONE Food Delivery** est une plateforme décentralisée de livraison de repas basée sur la blockchain **Polygon (Mumbai Testnet)**. L'application livreur est une interface web-first (avec support PWA pour mobile) qui permet aux livreurs de :

- Se connecter via **MetaMask**
- S'inscrire et effectuer un **staking minimum de 0.1 MATIC**
- Accepter des **livraisons en temps réel**
- Suivre des **itinéraires GPS** intégrés
- Confirmer les étapes (**pickup** au restaurant, **delivery** au client)
- Recevoir automatiquement **20% du montant total** de chaque commande
- Gérer leur **staking**, **gains**, et **réputation**
- Consulter l'**historique** complet de leurs livraisons

### Avantages de la Blockchain

- **Paiement instantané** : Dès la livraison confirmée, le smart contract distribue automatiquement les fonds
- **Transparence totale** : Toutes les transactions sont traçables sur la blockchain
- **Aucun intermédiaire** : Pas de délai de traitement bancaire (7-15 jours traditionnels → instantané)
- **Sécurité** : Système de staking protège contre les comportements abusifs
- **Immuabilité** : Les notes et transactions ne peuvent pas être modifiées

---

## 2. Vue d'Ensemble du Système

### Flux Principal d'une Commande

```
CLIENT → RESTAURANT → LIVREUR → LIVRAISON → PAIEMENT AUTOMATIQUE
```

### États Successifs d'une Commande

1. **CREATED** : Commande créée par le client, fonds bloqués en escrow
2. **PREPARING** : Restaurant confirme la préparation
3. **IN_DELIVERY** : Livreur assigné et en route
4. **DELIVERED** : Livraison confirmée → Paiement automatique (70% restaurant, 20% livreur, 10% plateforme)

### Acteurs du Système

- **CLIENT** : Commande et paie les repas
- **RESTAURANT** : Prépare les commandes (70% du montant)
- **LIVREUR** : Livre les commandes (20% du montant)
- **PLATEFORME** : Gère le système (10% de commission)
- **ARBITRATOR** : Résout les litiges si nécessaire

---

## 3. Rôle du Livreur

Le livreur dans DONE Food Delivery a les responsabilités suivantes :

### Inscription et Activation

1. Se connecter avec **MetaMask** (wallet Polygon)
2. S'inscrire avec nom, téléphone, type de véhicule
3. Effectuer un **staking minimum de 0.1 MATIC** pour devenir actif
4. Passer en mode "**En ligne**" pour recevoir des commandes

### Pendant une Livraison

1. Accepter une commande disponible (vérification du staking)
2. Se rendre au **restaurant** en suivant la carte GPS
3. **Confirmer le pickup** (< 100m du restaurant)
4. Se rendre chez le **client** en suivant la carte GPS
5. **Confirmer la delivery** (< 100m du client)
6. Recevoir automatiquement **20% du montant total** de la commande

### Gestion du Profil

- Consulter ses **gains** (jour, semaine, mois)
- Suivre sa **note moyenne** et les avis clients
- Gérer son **staking** (stake/unstake)
- Consulter l'**historique** de toutes ses livraisons

---

## 4. Prérequis & Installation

### Prérequis

#### 1. Node.js et npm
- **Version** : Node.js v18 ou supérieur
- **Vérification** : `node --version` et `npm --version`
- **Installation** : [nodejs.org](https://nodejs.org/)

#### 2. MetaMask (Extension Navigateur)
- **Installation** : [metamask.io](https://metamask.io/)
- **Configuration** :
  - Installer l'extension Chrome/Firefox
  - Créer ou importer un wallet
  - Ajouter le réseau **Polygon Mumbai**

#### 3. MATIC Testnet (Gratuit)
- **Faucet** : [faucet.polygon.technology](https://faucet.polygon.technology/)
- **Montant recommandé** : Au moins 0.5 MATIC pour les tests

#### 4. API Backend Accessible
- Backend DONE Food Delivery doit être démarré (voir README principal)
- Par défaut : `http://localhost:3000`

#### 5. Clé Google Maps API
- **Console** : [console.cloud.google.com](https://console.cloud.google.com/)
- **APIs à activer** :
  - Maps JavaScript API
  - Directions API
  - Geocoding API

### Installation

```bash
# Aller dans le dossier deliverer
cd frontend/deliverer

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
# VITE_API_URL=http://localhost:3000/api
# VITE_ORDER_MANAGER_ADDRESS=0x...
# VITE_STAKING_ADDRESS=0x...
# VITE_GOOGLE_MAPS_API_KEY=your_key

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur **http://localhost:5175**

---

## 5. Configuration

### 5.1. Configuration MetaMask pour Polygon Mumbai

1. Ouvrir MetaMask
2. Cliquer sur le sélecteur de réseau (en haut)
3. Cliquer sur "Add Network" → "Add a network manually"
4. Entrer les informations suivantes :

```
Network Name: Polygon Mumbai Testnet
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com/
```

5. Cliquer sur "Save"
6. Obtenir des MATIC gratuits : [faucet.polygon.technology](https://faucet.polygon.technology/)

### 5.2. Variables d'Environnement

Fichier `.env` à créer dans `frontend/deliverer/` :

```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Smart Contracts (adresses après déploiement)
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# IPFS Gateway (optionnel)
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 5.3. Démarrage de l'Application

```bash
# Mode développement (hot reload)
npm run dev

# Build production
npm run build

# Preview du build production
npm run preview
```

---

## 6. Architecture de l'Application

### Structure des Dossiers

```
frontend/deliverer/
├── public/
│   ├── index.html
│   └── manifest.json (PWA)
├── src/
│   ├── App.jsx              # Composant racine + routing
│   ├── index.jsx            # Point d'entrée React
│   ├── index.css            # Styles globaux (TailwindCSS)
│   ├── components/          # Composants réutilisables
│   │   ├── ConnectWallet.jsx
│   │   ├── StakingPanel.jsx
│   │   ├── AvailableOrders.jsx
│   │   ├── ActiveDelivery.jsx
│   │   ├── NavigationMap.jsx
│   │   ├── EarningsTracker.jsx
│   │   └── RatingDisplay.jsx
│   ├── pages/               # Pages principales
│   │   ├── HomePage.jsx
│   │   ├── DeliveriesPage.jsx
│   │   ├── EarningsPage.jsx
│   │   └── ProfilePage.jsx
│   └── services/            # Logique métier
│       ├── api.js           # Appels API backend
│       ├── blockchain.js    # Interactions Web3
│       └── geolocation.js   # GPS et calculs
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env
```

### Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│                     React App                           │
│                                                         │
│  ┌──────────┐   ┌───────────┐   ┌──────────────┐      │
│  │  Pages   │──→│ Components│──→│   Services   │      │
│  └──────────┘   └───────────┘   └──────┬───────┘      │
│                                          │              │
└──────────────────────────────────────────┼──────────────┘
                                           │
                    ┌──────────────────────┼──────────────┐
                    │                      │              │
                    ▼                      ▼              ▼
            ┌──────────────┐      ┌─────────────┐  ┌──────────┐
            │  API Backend │      │  Blockchain │  │   GPS    │
            │   (Node.js)  │      │  (Polygon)  │  │ Browser  │
            └──────────────┘      └─────────────┘  └──────────┘
```

---

## 7. Technologies Utilisées

### Frontend Core

- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **React Router DOM** : Routing et navigation
- **TailwindCSS** : Framework CSS responsive

### Web3 & Blockchain

- **Ethers.js v6** : Librairie Web3 pour Ethereum/Polygon
- **MetaMask** : Wallet de connexion
- **Polygon Mumbai** : Réseau blockchain testnet

### Maps & GPS

- **@react-google-maps/api** : Intégration Google Maps
- **Google Maps JavaScript API** : Affichage cartes et directions
- **Geolocation API** : API native du navigateur pour GPS

### Temps Réel & Communication

- **Socket.io-client** : WebSockets pour notifications temps réel
- **Axios** : Client HTTP pour API calls

### Charts & Data Visualization

- **Chart.js** ou **Recharts** : Graphiques de gains

### Progressive Web App

- **vite-plugin-pwa** : Support PWA (installation mobile, offline, notifications)

---

## 8. Structure du Projet

### Point d'Entrée : `index.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Composant Racine : `App.jsx`

Le fichier `App.jsx` est le composant racine qui :

1. Configure le **routing** avec React Router
2. Gère l'**authentification** MetaMask
3. Fournit le **contexte global** (adresse wallet, statut connexion)
4. Configure la **navigation** entre les pages
5. Initialise les **WebSockets** Socket.io

**Fonctionnalités principales** :

- Context API : `useApp()` pour partager `address`, `connectWallet()`, `setAddress()`
- Router : Configuration des routes `/`, `/deliveries`, `/earnings`, `/profile`
- Layout : Navigation bar responsive
- Auto-connexion : Tentative de reconnexion automatique si wallet déjà connecté

---

## 9. Composants Principaux

### 9.1. ConnectWallet.jsx

**Rôle** : Connexion au wallet MetaMask pour le livreur

**Fonctionnalités** :

1. **Détection MetaMask** : Vérifie si MetaMask est installé
2. **Connexion wallet** : Appelle `window.ethereum.request({ method: 'eth_requestAccounts' })`
3. **Vérification rôle DELIVERER** : Appelle `blockchain.hasRole(DELIVERER_ROLE, address)`
4. **Vérification staking** : Vérifie que le livreur a staké au moins 0.1 MATIC
5. **Chargement profil** : Récupère les données du livreur depuis l'API

**State** :

```jsx
const [address, setAddress] = useState(null)
const [isConnecting, setIsConnecting] = useState(false)
const [hasRole, setHasRole] = useState(false)
const [isStaked, setIsStaked] = useState(false)
const [stakedAmount, setStakedAmount] = useState(0)
```

**Méthodes** :

- `connectWallet()` : Connexion MetaMask
- `checkRole()` : Vérification DELIVERER_ROLE
- `checkStaking()` : Vérification staking
- `disconnect()` : Déconnexion

### 9.2. StakingPanel.jsx

**Rôle** : Panel de gestion du staking livreur

**Fonctionnalités** :

1. **Affichage montant staké** : Affiche le montant staké en MATIC et USD
2. **Stake** : Bouton pour staker (minimum 0.1 MATIC)
3. **Unstake** : Bouton pour retirer le staking (seulement si pas de livraison active)
4. **Historique slashing** : Affiche l'historique des pénalités

**State** :

```jsx
const [stakedAmount, setStakedAmount] = useState(0)
const [isStaked, setIsStaked] = useState(false)
const [stakeInput, setStakeInput] = useState('0.1')
const [hasActiveDelivery, setHasActiveDelivery] = useState(false)
const [slashingHistory, setSlashingHistory] = useState([])
```

**Méthodes** :

- `handleStake()` : Effectuer staking
- `handleUnstake()` : Retirer staking
- `fetchStakingInfo()` : Récupérer infos staking
- `fetchSlashingHistory()` : Récupérer historique slashing

### 9.3. AvailableOrders.jsx

**Rôle** : Liste des commandes disponibles à accepter

**Fonctionnalités** :

1. **Liste commandes proches** : Affiche les commandes avec status PREPARING
2. **Tri par distance** : Commandes triées de la plus proche à la plus éloignée
3. **Auto-refresh** : Rechargement automatique toutes les 10 secondes
4. **Socket.io** : Écoute l'événement `orderReady` pour nouvelles commandes
5. **Distance restaurant** : Calcule la distance depuis la position actuelle
6. **Gains estimés** : Affiche le deliveryFee (20% du total)
7. **Accepter commande** : Bouton pour accepter une commande

**State** :

```jsx
const [orders, setOrders] = useState([])
const [currentLocation, setCurrentLocation] = useState(null)
const [loading, setLoading] = useState(false)
const [accepting, setAccepting] = useState(null)
```

**Socket.io Listeners** :

```jsx
socket.on('orderReady', (order) => {
  setOrders(prev => [order, ...prev])
  playNotificationSound()
})
```

**Méthodes** :

- `fetchAvailableOrders()` : Récupérer commandes disponibles
- `handleAcceptOrder(orderId)` : Accepter commande
- `calculateDistance(order)` : Calculer distance
- `calculateEarnings(order)` : Calculer gains estimés

### 9.4. ActiveDelivery.jsx

**Rôle** : Affichage et gestion de la livraison en cours

**Fonctionnalités** :

1. **Détails commande** : Affiche orderId, client, items, total, delivery fee
2. **Adresse restaurant** : Nom, adresse, bouton "Appeler restaurant"
3. **Adresse client** : Nom, adresse, bouton "Appeler client"
4. **Navigation** : Bouton "Naviguer vers restaurant" ou "Naviguer vers client"
5. **Confirmer pickup** : Bouton visible quand < 100m du restaurant
6. **Confirmer delivery** : Bouton visible quand < 100m du client
7. **GPS tracking** : Position mise à jour toutes les 5 secondes

**State** :

```jsx
const [order, setOrder] = useState(null)
const [currentLocation, setCurrentLocation] = useState(null)
const [step, setStep] = useState('pickup') // 'pickup' ou 'delivery'
const [isNearRestaurant, setIsNearRestaurant] = useState(false)
const [isNearClient, setIsNearClient] = useState(false)
const [tracking, setTracking] = useState(false)
```

**Méthodes** :

- `handleConfirmPickup()` : Confirmer récupération
- `handleConfirmDelivery()` : Confirmer livraison
- `startGPSTracking()` : Démarrer tracking GPS
- `stopGPSTracking()` : Arrêter tracking GPS
- `checkProximity()` : Vérifier proximité restaurant/client

### 9.5. NavigationMap.jsx

**Rôle** : Carte de navigation interactive avec Google Maps

**Fonctionnalités** :

1. **Intégration Google Maps** : Affiche une carte interactive
2. **Markers** : Position livreur, restaurant, client
3. **Route restaurant** : Itinéraire vers restaurant (si step = 'pickup')
4. **Route client** : Itinéraire vers client (si step = 'delivery')
5. **Directions Service** : Calcule l'itinéraire optimal
6. **Update position** : Position mise à jour en temps réel

**Props** :

```jsx
{
  origin: { lat, lng },           // Position livreur
  destination: { lat, lng },      // Restaurant ou client
  step: 'pickup' | 'delivery',
  onArrival: Function
}
```

**State** :

```jsx
const [map, setMap] = useState(null)
const [directions, setDirections] = useState(null)
const [currentPosition, setCurrentPosition] = useState(origin)
const [eta, setEta] = useState(null)
```

**Méthodes** :

- `calculateRoute()` : Calculer itinéraire
- `updatePosition(lat, lng)` : Mettre à jour position
- `checkArrival()` : Vérifier arrivée destination

### 9.6. EarningsTracker.jsx

**Rôle** : Suivi des gains du livreur

**Fonctionnalités** :

1. **Gains aujourd'hui** : Total du jour en MATIC et USD
2. **Tabs période** : Jour / Semaine / Mois
3. **Graphique** : Line chart des earnings
4. **Paiements en attente** : Montant disponible à retirer
5. **Statistiques** : Nombre livraisons, taux de succès, temps moyen

**State** :

```jsx
const [earnings, setEarnings] = useState({
  today: 0,
  week: 0,
  month: 0,
  pending: 0,
  total: 0
})
const [period, setPeriod] = useState('week')
const [deliveriesCount, setDeliveriesCount] = useState(0)
```

### 9.7. RatingDisplay.jsx

**Rôle** : Affichage des notes et avis du livreur

**Fonctionnalités** :

1. **Note moyenne** : Affichage sur 5 étoiles
2. **Nombre total** : Total livraisons et avis
3. **Avis récents** : Liste des 5 derniers avis clients
4. **Graphique évolution** : Line chart de l'évolution de la note
5. **Objectifs** : Badges et objectifs de performance

**State** :

```jsx
const [rating, setRating] = useState(0)
const [totalDeliveries, setTotalDeliveries] = useState(0)
const [reviews, setReviews] = useState([])
const [ratingHistory, setRatingHistory] = useState([])
const [achievements, setAchievements] = useState([])
```

---

## 10. Pages de l'Application

### 10.1. HomePage.jsx

**Rôle** : Page d'accueil du livreur (Tableau de bord)

**Fonctionnalités** :

1. **Vérification connexion** : Affiche bouton "Connecter MetaMask" si non connecté
2. **Vérification inscription** : Si connecté mais pas inscrit, affiche formulaire d'inscription
3. **Formulaire inscription** : Nom, téléphone, type de véhicule (bike/scooter/car)
4. **Toggle statut** : Switch "En ligne" / "Hors ligne"
5. **Statistiques rapides** : Cards (Livraisons aujourd'hui, Gains, Rating, Montant staké)
6. **Livraison active** : Si en cours, affiche `<ActiveDelivery />`
7. **Commandes disponibles** : Si en ligne et pas de livraison active, affiche `<AvailableOrders limit={5} />`

**State** :

```jsx
const [isOnline, setIsOnline] = useState(false)
const [activeDelivery, setActiveDelivery] = useState(null)
const [isRegistered, setIsRegistered] = useState(null)
const [checkingRegistration, setCheckingRegistration] = useState(true)
const [stats, setStats] = useState({
  todayDeliveries: 0,
  todayEarnings: 0,
  rating: 0,
  stakedAmount: 0
})
const [registerForm, setRegisterForm] = useState({
  name: "",
  phone: "",
  vehicleType: "bike"
})
```

**Méthodes** :

- `loadData()` : Charge données profil, livraison active, earnings, stake info
- `handleRegister()` : Inscription du livreur via API
- `toggleStatus()` : Change le statut en ligne/hors ligne

**Workflow** :

1. Si pas connecté → Affiche bouton "Connecter MetaMask"
2. Si connecté mais pas inscrit → Affiche formulaire inscription
3. Si inscrit → Affiche tableau de bord avec toggle statut
4. Si livraison active → Affiche `<ActiveDelivery />`
5. Sinon → Affiche stats + commandes disponibles (si en ligne)

### 10.2. DeliveriesPage.jsx

**Rôle** : Gestion et historique des livraisons

**Fonctionnalités** :

1. **Liste livraisons** : Table avec toutes les livraisons (passées et en cours)
2. **Colonnes** : Order ID, Restaurant, Client, Status, Earnings, Date
3. **Filtres** : Toutes / En cours / Complétées / Annulées
4. **Export CSV** : Bouton pour exporter l'historique en CSV

**State** :

```jsx
const [deliveries, setDeliveries] = useState([])
const [filter, setFilter] = useState("all")
const [loading, setLoading] = useState(false)
```

**Méthodes** :

- `loadDeliveries()` : Charge l'historique des livraisons via `api.getDelivererOrders(address, filters)`
- `exportCSV()` : Exporte les données en format CSV

**Table** :

```jsx
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Restaurant</th>
      <th>Client</th>
      <th>Status</th>
      <th>Gains</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {deliveries.map(d => (
      <tr key={d.orderId}>
        <td>{d.orderId}</td>
        <td>{d.restaurant?.name}</td>
        <td>{d.client?.name}</td>
        <td><span className={`badge badge-${d.status?.toLowerCase()}`}>{d.status}</span></td>
        <td>{d.earnings || 0} MATIC</td>
        <td>{new Date(d.createdAt).toLocaleDateString()}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 10.3. EarningsPage.jsx

**Rôle** : Page détaillée des revenus

**Fonctionnalités** :

1. **Intègre EarningsTracker** : Composant complet de suivi des gains
2. **Historique transactions** : Table des transactions blockchain
3. **Colonnes** : Date, Order ID, Montant, Transaction Hash, Status
4. **Export CSV** : Bouton pour exporter les transactions

**State** :

```jsx
const [transactions, setTransactions] = useState([])
const [loading, setLoading] = useState(false)
```

**Méthodes** :

- `loadTransactions()` : Charge les événements `PaymentSplit` depuis la blockchain
- `exportCSV()` : Exporte les transactions en CSV

**Table Transactions** :

```jsx
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Order ID</th>
      <th>Montant</th>
      <th>Transaction</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {transactions.map((tx, i) => (
      <tr key={i}>
        <td>{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
        <td>{tx.orderId}</td>
        <td>{tx.delivererAmount} MATIC</td>
        <td>
          <a href={`https://mumbai.polygonscan.com/tx/${tx.txHash}`} target="_blank">
            {tx.txHash.slice(0, 12)}...
          </a>
        </td>
        <td>✅</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 10.4. ProfilePage.jsx

**Rôle** : Profil et paramètres du livreur

**Fonctionnalités** :

1. **Informations personnelles** : Nom, téléphone, adresse wallet
2. **Édition profil** : Formulaire pour modifier nom et téléphone
3. **Staking** : Intègre `<StakingPanel />` pour gérer le staking
4. **Notes et avis** : Intègre `<RatingDisplay />` pour voir les avis
5. **Déconnexion** : Bouton pour se déconnecter

**State** :

```jsx
const [profile, setProfile] = useState({ name: "", phone: "" })
const [loading, setLoading] = useState(false)
```

**Méthodes** :

- `loadProfile()` : Charge le profil via `api.getDeliverer(address)`
- `saveProfile()` : Sauvegarde les modifications du profil
- `disconnect()` : Déconnecte le wallet et redirige vers la page d'accueil

---

## 11. Services

### 11.1. api.js

**Rôle** : Service pour les appels API backend

**Configuration** :

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const authHeaders = (address) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${address}`
})
```

**Fonctions Principales** :

#### 1. `registerDeliverer(data)`
- **POST** `/api/deliverers/register`
- **Body** : `{ address, name, phone, vehicleType, location }`
- **Retourne** : `{ success: true, deliverer }`
- **Usage** : Inscription d'un nouveau livreur

#### 2. `getDeliverer(address)`
- **GET** `/api/deliverers/:address`
- **Retourne** : `{ deliverer, isStaked, stakedAmount }`
- **Usage** : Récupération du profil livreur

#### 3. `getAvailableOrders(location)`
- **GET** `/api/deliverers/available?lat=...&lng=...`
- **Params** : `{ location: { lat, lng } }`
- **Retourne** : Array of available orders triées par distance
- **Usage** : Récupération des commandes disponibles

#### 4. `acceptOrder(orderId, delivererAddress)`
- **POST** `/api/deliverers/orders/:id/accept`
- **Body** : `{ delivererAddress }`
- **Retourne** : `{ success: true, order, txHash }`
- **Usage** : Acceptation d'une commande

#### 5. `confirmPickup(orderId, delivererAddress)`
- **POST** `/api/orders/:id/confirm-pickup`
- **Body** : `{ delivererAddress }`
- **Retourne** : `{ success: true, txHash }`
- **Usage** : Confirmation de récupération au restaurant

#### 6. `updateGPSLocation(orderId, lat, lng)`
- **POST** `/api/orders/:id/update-gps`
- **Body** : `{ lat, lng }`
- **Retourne** : `{ success: true }`
- **Usage** : Mise à jour de la position GPS (toutes les 5s)

#### 7. `confirmDelivery(orderId, delivererAddress)`
- **POST** `/api/orders/:id/confirm-delivery`
- **Body** : `{ delivererAddress }`
- **Retourne** : `{ success: true, txHash, earnings }`
- **Usage** : Confirmation de livraison au client (déclenche paiement automatique)

#### 8. `getEarnings(address, period)`
- **GET** `/api/deliverers/:address/earnings?period=...`
- **Params** : `{ period: 'today' | 'week' | 'month' }`
- **Retourne** : `{ totalEarnings, completedDeliveries, averageEarning }`
- **Usage** : Récupération des revenus par période

#### 9. `getRating(address)`
- **GET** `/api/deliverers/:address/rating`
- **Retourne** : `{ rating, totalDeliveries, reviews[] }`
- **Usage** : Récupération de la note et des avis

#### 10. `updateStatus(address, isAvailable)`
- **PUT** `/api/deliverers/:address/status`
- **Body** : `{ isAvailable }`
- **Retourne** : `{ success: true }`
- **Usage** : Mise à jour du statut en ligne/hors ligne

#### 11. `getDelivererOrders(address, filters)`
- **GET** `/api/deliverers/:address/orders?status=...`
- **Params** : `{ status: 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED' }`
- **Retourne** : Array of orders
- **Usage** : Récupération de l'historique des livraisons

#### 12. `getActiveDelivery(address)`
- **GET** `/api/deliverers/:address/active-delivery`
- **Retourne** : Order data ou null
- **Usage** : Récupération de la livraison active en cours

### 11.2. blockchain.js

**Rôle** : Service pour les interactions Web3

**Configuration** :

```javascript
import { ethers } from 'ethers'
import DoneOrderManager from '../../../contracts/artifacts/DoneOrderManager.json'
import DoneStaking from '../../../contracts/artifacts/DoneStaking.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const orderManagerAddress = import.meta.env.VITE_ORDER_MANAGER_ADDRESS
const stakingAddress = import.meta.env.VITE_STAKING_ADDRESS
```

**Fonctions Principales** :

#### 1. `connectWallet()`
- Request accounts depuis MetaMask
- **Retourne** : `{ address, signer }`

#### 2. `hasRole(role, address)`
- Call `orderManager.hasRole(role, address)`
- **Retourne** : boolean

#### 3. `isStaked(address)`
- Call `staking.isStaked(address)`
- **Retourne** : boolean

#### 4. `getStakeInfo(address)`
- Call `staking.stakes(address)`
- **Retourne** : `{ amount, isStaked }`

#### 5. `stake(amount)`
- Call `staking.stakeAsDeliverer({ value: amount })`
- **Retourne** : `{ txHash, receipt }`

#### 6. `unstake()`
- Call `staking.unstake()`
- **Retourne** : `{ txHash, amount }`

#### 7. `acceptOrderOnChain(orderId)`
- Call `orderManager.assignDeliverer(orderId)`
- **Retourne** : `{ txHash, receipt }`

#### 8. `confirmPickupOnChain(orderId)`
- Call `orderManager.confirmPickup(orderId)`
- **Retourne** : `{ txHash, receipt }`

#### 9. `confirmDeliveryOnChain(orderId)`
- Call `orderManager.confirmDelivery(orderId)`
- Parse events pour récupérer earnings
- **Retourne** : `{ txHash, earnings }`

#### 10. `getSlashingEvents(address)`
- Query events `Slashed` where deliverer = address
- **Retourne** : array of slashing events

#### 11. `getEarningsEvents(address)`
- Query events `PaymentSplit` where deliverer = address
- Sum delivererAmount (20% de chaque commande)
- **Retourne** : `{ events[], totalEarnings }`

### 11.3. geolocation.js

**Rôle** : Service de géolocalisation et calculs GPS

**Fonctions Principales** :

#### 1. `getCurrentPosition()`
- Utilise `navigator.geolocation.getCurrentPosition()`
- **Retourne** : `Promise<{ lat, lng, accuracy }>`
- **Gestion erreurs** : permission denied, timeout

**Implémentation** :

```javascript
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}
```

#### 2. `watchPosition(callback)`
- Utilise `navigator.geolocation.watchPosition()`
- **Callback** : Appelé à chaque update position
- **Retourne** : watchId (pour cleanup)
- **Options** : enableHighAccuracy, timeout, maximumAge

**Implémentation** :

```javascript
export const watchPosition = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported')
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
    },
    (error) => console.error('Geolocation error:', error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )
}
```

#### 3. `calculateRoute(origin, destination)`
- Utilise Google Maps DirectionsService
- **Retourne** : `Promise<{ route, distance, duration }>`
- **Mode** : DRIVING

#### 4. `getDistance(lat1, lng1, lat2, lng2)`
- Formule Haversine pour distance entre 2 points
- **Retourne** : distance en km (number)

**Implémentation** :

```javascript
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance en km
}
```

#### 5. `isNearLocation(currentLat, currentLng, targetLat, targetLng, radius)`
- Calcule distance via `getDistance()`
- Compare avec radius (en km)
- **Retourne** : boolean (true si distance <= radius)

---

## 12. Workflow Complet du Livreur

### Étape 1 : Connexion et Inscription

1. **Ouvrir l'application** : `http://localhost:5175`
2. **Connecter MetaMask** : Cliquer sur "Connecter MetaMask"
3. **Vérifications automatiques** :
   - Réseau Polygon Mumbai
   - Wallet connecté
4. **Inscription** (si première fois) :
   - Remplir nom, téléphone, type de véhicule
   - Cliquer sur "S'inscrire"
   - Transaction envoyée à l'API backend
5. **Staking** (obligatoire pour être actif) :
   - Aller dans "Profil" → Section Staking
   - Entrer montant (minimum 0.1 MATIC)
   - Cliquer sur "Stake"
   - Confirmer transaction MetaMask
   - Attendre confirmation blockchain (~2 secondes)

### Étape 2 : Passer en Ligne

1. **Aller sur la page d'accueil**
2. **Toggle "En ligne"** : Passer le switch de "Hors ligne" à "En ligne"
3. **Appel API** : `api.updateStatus(address, true)`
4. **Socket.io** : Connexion WebSocket établie pour recevoir les commandes en temps réel

### Étape 3 : Voir les Commandes Disponibles

1. **Affichage automatique** : Composant `<AvailableOrders />` s'affiche
2. **Liste commandes** :
   - Nom du restaurant
   - Distance (en km)
   - Gains estimés (20% du total)
   - Bouton "Accepter"
3. **Auto-refresh** : Liste rechargée toutes les 10 secondes
4. **Notification temps réel** : Si nouvelle commande créée, notification via Socket.io

### Étape 4 : Accepter une Commande

1. **Cliquer sur "Accepter"** pour une commande
2. **Vérifications** :
   - Staking actif (minimum 0.1 MATIC)
   - Pas de livraison déjà en cours
3. **API Call** : `api.acceptOrder(orderId, delivererAddress)`
4. **Transaction blockchain** : `blockchain.acceptOrderOnChain(orderId)`
5. **Confirmation MetaMask** : Confirmer la transaction
6. **Attente confirmation** : ~2 secondes
7. **Redirection** : Page d'accueil affiche maintenant `<ActiveDelivery />`

### Étape 5 : Se Rendre au Restaurant

1. **Affichage détails** :
   - Nom et adresse du restaurant
   - Distance actuelle
   - Bouton "Appeler restaurant"
2. **Navigation GPS** :
   - Cliquer sur "Naviguer vers restaurant"
   - Carte Google Maps s'affiche avec itinéraire
   - Position mise à jour en temps réel
3. **Tracking automatique** : Position envoyée au backend toutes les 5 secondes via `api.updateGPSLocation(orderId, lat, lng)`

### Étape 6 : Confirmer le Pickup

1. **Proximité détectée** : Quand < 100m du restaurant, bouton "Confirmer pickup" devient actif
2. **Cliquer sur "Confirmer pickup"**
3. **API Call** : `api.confirmPickup(orderId, delivererAddress)`
4. **Transaction blockchain** : `blockchain.confirmPickupOnChain(orderId)`
5. **Confirmation MetaMask** : Confirmer la transaction
6. **Status change** : PREPARING → IN_DELIVERY
7. **Notification client** : Le client reçoit une notification que le livreur a récupéré la commande

### Étape 7 : Se Rendre chez le Client

1. **Navigation GPS** :
   - Bouton change automatiquement : "Naviguer vers client"
   - Carte affiche itinéraire vers adresse client
2. **Tracking continu** : Position envoyée toutes les 5 secondes
3. **Client suit en temps réel** : Le client voit la position du livreur sur une carte

### Étape 8 : Confirmer la Livraison

1. **Proximité détectée** : Quand < 100m du client, bouton "Confirmer delivery" devient actif
2. **Cliquer sur "Confirmer delivery"**
3. **API Call** : `api.confirmDelivery(orderId, delivererAddress)`
4. **Transaction blockchain** : `blockchain.confirmDeliveryOnChain(orderId)`
5. **Confirmation MetaMask** : Confirmer la transaction
6. **Paiement automatique** : Smart contract distribue automatiquement :
   - 70% → Restaurant
   - 20% → Livreur
   - 10% → Plateforme
7. **Confirmation** : Notification "Livraison confirmée ! Vous avez reçu X MATIC"
8. **Redirection** : Retour à la page d'accueil, prêt pour nouvelle commande

### Étape 9 : Consulter ses Gains

1. **Aller sur "Mes Revenus"** (menu navigation)
2. **Voir statistiques** :
   - Gains aujourd'hui / semaine / mois
   - Graphique évolution
   - Historique transactions blockchain
3. **Export CSV** : Bouton pour exporter les données

### Étape 10 : Gérer son Profil

1. **Aller sur "Mon Profil"**
2. **Modifier informations** : Nom, téléphone
3. **Voir staking** : Montant staké, historique slashing
4. **Voir notes** : Note moyenne, avis clients
5. **Déconnexion** : Bouton pour se déconnecter

---

## 13. Système de Staking

### Pourquoi le Staking ?

Le staking est un mécanisme de sécurité qui :

1. **Garantit l'engagement** : Un livreur doit "mettre en jeu" de l'argent pour prouver son sérieux
2. **Protège contre les abus** : En cas de comportement frauduleux, le staking peut être "slashé" (pénalité)
3. **Assure la disponibilité** : Un livreur staké est considéré comme actif et disponible

### Montant Minimum

- **Minimum** : 0.1 MATIC
- **Recommandé** : 0.2-0.5 MATIC pour avoir une marge

### Comment Staker ?

1. Aller dans "Mon Profil" → Section "Staking"
2. Entrer le montant à staker (minimum 0.1 MATIC)
3. Cliquer sur "Stake"
4. Confirmer la transaction MetaMask
5. Attendre la confirmation blockchain (~2 secondes)
6. Statut change de "Non staké" à "Staké"

### Unstake (Retirer le Staking)

**Conditions pour unstake** :

- ✅ Pas de livraison active en cours
- ✅ Aucune commande assignée

**Processus** :

1. Aller dans "Mon Profil" → Section "Staking"
2. Cliquer sur "Unstake"
3. Confirmer dans la modale
4. Confirmer la transaction MetaMask
5. Attendre la confirmation blockchain
6. Fonds restitués sur le wallet

### Slashing (Pénalités)

**Cas de slashing** :

- Annulation injustifiée d'une livraison
- Retard excessif (> 2 heures)
- Commande non livrée
- Mauvais comportement signalé
- Fraude détectée

**Montant de la pénalité** :

- Variable selon la gravité (0.01 à 0.1 MATIC)
- Historique visible dans "Staking Panel"

**Conséquences** :

- Montant staké réduit
- Si montant < 0.1 MATIC, statut passe à "Non staké" (impossibilité d'accepter commandes)
- Obligation de re-staker pour continuer

### Affichage du Staking

**StakingPanel.jsx** affiche :

- Montant staké actuel (en MATIC et USD)
- Badge visuel : 🟢 Staké / 🔴 Non staké
- Bouton "Stake" (si montant insuffisant)
- Bouton "Unstake" (si pas de livraison active)
- Tableau "Historique Slashing" :
  - Date
  - Raison
  - Montant slashé
  - Transaction hash

---

## 14. Gains et Paiements

### Répartition Automatique

Lors de la confirmation de livraison (`confirmDelivery`), le smart contract `DonePaymentSplitter` distribue automatiquement les fonds :

```
Montant Total
  ├─→ 70% → Restaurant
  ├─→ 20% → Livreur
  └─→ 10% → Plateforme
```

### Exemple Concret

Pour une commande de **100 MATIC** :

- **Restaurant** : 70 MATIC
- **Livreur** : 20 MATIC (vous)
- **Plateforme** : 10 MATIC

### Caractéristiques

- **Instantané** : Paiement immédiat dès confirmation blockchain (~2 secondes)
- **Automatique** : Aucune intervention manuelle
- **Transparent** : Transaction visible sur [mumbai.polygonscan.com](https://mumbai.polygonscan.com/)
- **Immuable** : Impossible d'annuler ou modifier

### Suivi des Gains

**EarningsTracker.jsx** affiche :

1. **Gains aujourd'hui** : Total du jour en MATIC et USD
2. **Gains semaine** : Total de la semaine
3. **Gains mois** : Total du mois
4. **Nombre de livraisons** : Total livraisons complétées
5. **Taux de succès** : Pourcentage de livraisons réussies
6. **Temps moyen** : Temps moyen par livraison

### Historique Transactions Blockchain

**EarningsPage.jsx** affiche un tableau avec :

- Date de la transaction
- Order ID
- Montant reçu (20% du total)
- Transaction Hash (lien vers Polygonscan)
- Status (✅)

### Export CSV

Bouton "Export CSV" permet d'exporter :

- Historique complet des livraisons
- Historique des transactions blockchain
- Gains par période

---

## 15. GPS et Navigation

### Géolocalisation du Livreur

**Permissions requises** :

- Autoriser la géolocalisation dans le navigateur
- Sur mobile : Autoriser l'accès à la position dans les paramètres

**Fréquence de mise à jour** :

- **Position actuelle** : Toutes les 5 secondes
- **Tracking actif** : Seulement pendant une livraison active
- **Envoi au backend** : Toutes les 5 secondes via `api.updateGPSLocation(orderId, lat, lng)`

### Carte Google Maps

**Intégration** : `@react-google-maps/api`

**Affichage** :

- Carte interactive
- Markers : Position livreur, restaurant, client
- Itinéraire : Polyline de la route optimale
- Zoom automatique : Ajuste le zoom pour voir tout l'itinéraire

**Calcul d'Itinéraire** :

- Service : Google Maps DirectionsService
- Mode : DRIVING
- Optimisation : Évite les péages et autoroutes (optionnel)
- ETA : Temps estimé d'arrivée affiché

### Boutons de Confirmation

**Confirm Pickup** :

- Visible quand distance au restaurant < 100m
- Grisé si distance > 100m
- Calcul distance : Formule Haversine (geolocation.js)

**Confirm Delivery** :

- Visible quand distance au client < 100m
- Grisé si distance > 100m

### Tracking pour le Client

**Pendant la livraison** :

- Position du livreur envoyée toutes les 5 secondes au backend
- Backend notifie le client via Socket.io
- Client voit la position en temps réel sur une carte

**Arrêt du tracking** :

- Dès confirmation de livraison
- Position finale enregistrée dans la base de données

---

## 16. Système de Notation

### Note Moyenne

- Calculée sur 5 étoiles (0.0 à 5.0)
- Moyenne pondérée de tous les avis clients
- Affichée sur le profil et le tableau de bord

### Avis Clients

**Processus** :

1. Client confirme la réception de la commande
2. Client peut laisser un avis (optionnel) :
   - Note sur 5 étoiles
   - Commentaire
3. Avis enregistré dans la base de données
4. Note moyenne recalculée

**Affichage** : `RatingDisplay.jsx`

- Note moyenne
- Nombre total d'avis
- Liste des 5 derniers avis
- Graphique d'évolution de la note dans le temps

### Impact sur le Futur

- **Priorité assignation** : Livreurs avec meilleure note prioritaires
- **Badges et récompenses** : Objectifs de performance (ex: 100 livraisons, note > 4.5)
- **Visibilité** : Note visible par les clients (futur)

### Objectifs de Performance

**Badges débloquables** :

- 🥇 10 livraisons complétées
- 🥇 50 livraisons complétées
- 🥇 100 livraisons complétées
- ⭐ Note moyenne > 4.0
- ⭐ Note moyenne > 4.5
- ⚡ Temps moyen < 30 minutes
- 🚀 100% de taux de succès

---

## 17. Intégrations Blockchain

### Smart Contracts Utilisés

1. **DoneOrderManager** : Gestion des commandes
   - `assignDeliverer(orderId)` : Assigner un livreur
   - `confirmPickup(orderId)` : Confirmer récupération
   - `confirmDelivery(orderId)` : Confirmer livraison

2. **DoneStaking** : Gestion du staking
   - `stakeAsDeliverer()` : Staker comme livreur
   - `unstake()` : Retirer le staking
   - `isStaked(address)` : Vérifier si staké
   - `stakes(address)` : Récupérer infos de staking

3. **DonePaymentSplitter** : Répartition automatique des paiements
   - Appelé automatiquement par `confirmDelivery()`
   - Distribue 70/20/10

### Événements Blockchain

**PaymentSplit** :

```solidity
event PaymentSplit(
    uint256 orderId,
    address restaurant,
    address deliverer,
    address platform,
    uint256 restaurantAmount,
    uint256 delivererAmount,
    uint256 platformAmount
);
```

**DeliveryConfirmed** :

```solidity
event DeliveryConfirmed(
    uint256 orderId,
    address deliverer,
    uint256 timestamp
);
```

**Slashed** :

```solidity
event Slashed(
    address deliverer,
    uint256 amount,
    string reason,
    uint256 timestamp
);
```

### Lecture des Événements

**getEarningsEvents(address)** :

```javascript
const filter = paymentSplitter.filters.PaymentSplit(null, null, address)
const events = await paymentSplitter.queryFilter(filter)
const totalEarnings = events.reduce((sum, e) => sum + e.args.delivererAmount, 0n)
```

**getSlashingEvents(address)** :

```javascript
const filter = staking.filters.Slashed(address)
const events = await staking.queryFilter(filter)
```

---

## 18. Progressive Web App (PWA)

### Qu'est-ce qu'une PWA ?

Une **Progressive Web App** est une application web qui peut être installée sur un appareil mobile et utilisée comme une application native.

### Avantages pour les Livreurs

1. **Installation** : Installer l'app sur l'écran d'accueil du téléphone
2. **Offline** : Fonctionnement partiel hors ligne
3. **Notifications push** : Recevoir des notifications pour nouvelles commandes
4. **GPS natif** : Accès à la géolocalisation du téléphone
5. **Performance** : Chargement plus rapide grâce au cache

### Configuration PWA

**vite.config.js** :

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DONE Deliverer',
        short_name: 'DONE',
        description: 'Application de livraison DONE Food Delivery',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache'
            }
          }
        ]
      }
    })
  ]
}
```

### Installation sur Mobile

**Android (Chrome)** :

1. Ouvrir l'application dans Chrome
2. Cliquer sur les 3 points (menu)
3. Cliquer sur "Installer l'application"
4. Icône ajoutée sur l'écran d'accueil

**iOS (Safari)** :

1. Ouvrir l'application dans Safari
2. Cliquer sur le bouton "Partager"
3. Cliquer sur "Sur l'écran d'accueil"
4. Icône ajoutée sur l'écran d'accueil

### Fonctionnalités Offline

**Cache automatique** :

- Pages principales (HomePage, ProfilePage)
- Assets statiques (CSS, JS, images)
- API calls récentes

**Synchronisation** :

- Dès que la connexion revient, données synchronisées
- Affichage d'un badge "Offline" si pas de connexion

---

## 19. API Backend - Endpoints

### Base URL

```
http://localhost:3000/api
```

### Endpoints Livreur

| Méthode | Endpoint | Description | Body | Retour |
|---------|----------|-------------|------|--------|
| POST | `/deliverers/register` | Inscription nouveau livreur | `{ address, name, phone, vehicleType }` | `{ success, deliverer }` |
| GET | `/deliverers/:address` | Récupérer profil livreur | - | `{ deliverer, isStaked, stakedAmount }` |
| GET | `/deliverers/available` | Commandes disponibles | Query: `lat, lng` | `[orders]` |
| PUT | `/deliverers/:address/status` | Changer statut (en ligne/hors ligne) | `{ isAvailable }` | `{ success }` |
| GET | `/deliverers/:address/orders` | Historique livraisons | Query: `status` | `[orders]` |
| GET | `/deliverers/:address/earnings` | Revenus par période | Query: `period` | `{ totalEarnings, completedDeliveries }` |
| GET | `/deliverers/:address/rating` | Note et avis | - | `{ rating, totalDeliveries, reviews }` |
| GET | `/deliverers/:address/active-delivery` | Livraison active | - | `order` ou `null` |

### Endpoints Commandes

| Méthode | Endpoint | Description | Body | Retour |
|---------|----------|-------------|------|--------|
| POST | `/deliverers/orders/:id/accept` | Accepter commande | `{ delivererAddress }` | `{ success, order, txHash }` |
| POST | `/orders/:id/confirm-pickup` | Confirmer récupération | `{ delivererAddress }` | `{ success, txHash }` |
| POST | `/orders/:id/update-gps` | Mettre à jour position GPS | `{ lat, lng }` | `{ success }` |
| POST | `/orders/:id/confirm-delivery` | Confirmer livraison | `{ delivererAddress }` | `{ success, txHash, earnings }` |
| GET | `/orders/:id` | Détails commande | - | `order` |

### Headers d'Authentification

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${delivererAddress}`
}
```

---

## 20. Socket.io - Communication Temps Réel

### Connexion Socket.io

```javascript
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const socket = io(SOCKET_URL)

// Rejoindre room deliverer
socket.emit('joinRoom', `deliverer_${delivererAddress}`)
```

### Événements Écoutés

#### 1. `orderReady`

**Déclenché** : Quand un restaurant confirme qu'une commande est prête

**Payload** :

```javascript
{
  orderId: 123,
  restaurant: {
    name: "Pizza Hut",
    location: { lat: 48.8566, lng: 2.3522 }
  },
  earnings: 2.5 // MATIC
}
```

**Usage** : `AvailableOrders.jsx`

```javascript
socket.on('orderReady', (order) => {
  setOrders(prev => [order, ...prev])
  playNotificationSound()
  showNotification('Nouvelle commande disponible !')
})
```

#### 2. `orderAccepted`

**Déclenché** : Quand un autre livreur accepte une commande

**Payload** :

```javascript
{
  orderId: 123
}
```

**Usage** : `AvailableOrders.jsx`

```javascript
socket.on('orderAccepted', (data) => {
  setOrders(prev => prev.filter(o => o.orderId !== data.orderId))
})
```

#### 3. `clientLocationUpdate`

**Déclenché** : Si le client met à jour son adresse de livraison

**Payload** :

```javascript
{
  orderId: 123,
  newAddress: "15 Rue de la Paix, Paris",
  location: { lat: 48.8698, lng: 2.3318 }
}
```

**Usage** : `ActiveDelivery.jsx`

```javascript
socket.on('clientLocationUpdate', (data) => {
  if (data.orderId === activeDelivery.orderId) {
    setClientLocation(data.location)
    alert('⚠️ L\'adresse du client a été mise à jour')
  }
})
```

### Déconnexion Socket.io

```javascript
useEffect(() => {
  return () => {
    socket.disconnect()
  }
}, [])
```

---

## 21. Résolution de Problèmes

### Problème : MetaMask ne se connecte pas

**Solutions** :

1. Vérifier que MetaMask est installé : [metamask.io](https://metamask.io/)
2. Vérifier que le réseau est **Polygon Mumbai**
3. Vérifier que le site est autorisé dans MetaMask :
   - MetaMask → Settings → Connected Sites
4. Rafraîchir la page et reconnecter
5. Vider le cache du navigateur

### Problème : GPS ne fonctionne pas

**Solutions** :

1. **Autoriser la géolocalisation** dans le navigateur :
   - Chrome : Paramètres → Confidentialité → Localisation → Autoriser
   - Firefox : Paramètres → Vie privée → Permissions → Localisation → Autoriser
2. **Sur mobile** : Autoriser dans les paramètres système
3. **Vérifier en HTTPS** : Geolocation API nécessite HTTPS (sauf localhost)
4. **Redémarrer l'appareil** si le problème persiste

### Problème : Google Maps ne s'affiche pas

**Solutions** :

1. Vérifier que la **clé API Google Maps** est correcte dans `.env`
2. Vérifier que les APIs sont activées dans Google Cloud Console :
   - Maps JavaScript API
   - Directions API
   - Geocoding API
3. Vérifier les quotas (gratuit jusqu'à 28 000 requêtes/mois)
4. Vérifier la console navigateur pour erreurs

### Problème : Transactions blockchain échouent

**Solutions** :

1. **Solde MATIC insuffisant** : Obtenir plus de MATIC depuis [faucet.polygon.technology](https://faucet.polygon.technology/)
2. **Gas price trop élevé** : Attendre quelques minutes et réessayer
3. **Contrats non déployés** : Vérifier que les adresses dans `.env` sont correctes
4. **Réseau incorrect** : Vérifier que MetaMask est sur **Polygon Mumbai**

### Problème : Erreur CORS dans le frontend

**Solutions** :

1. Vérifier que le **backend est démarré** sur `http://localhost:3000`
2. Vérifier que `VITE_API_URL` dans `.env` pointe vers `http://localhost:3000/api`
3. Vérifier les CORS dans le backend : `app.use(cors({ origin: 'http://localhost:5175' }))`

### Problème : Images IPFS ne chargent pas

**Solutions** :

1. Vérifier les clés **Pinata** dans `backend/.env`
2. Tester l'upload manuel : [app.pinata.cloud](https://app.pinata.cloud/pinmanager)
3. Vérifier le gateway IPFS : `https://gateway.pinata.cloud/ipfs/`
4. Vérifier la console navigateur pour erreurs

### Problème : Socket.io ne se connecte pas

**Solutions** :

1. Vérifier que le **backend est démarré**
2. Vérifier que `VITE_SOCKET_URL` dans `.env` est correct
3. Vérifier dans la console navigateur :
   - Doit afficher "Socket connected"
   - Si erreur, vérifier les ports et CORS

---

## 22. Bonnes Pratiques

### Sécurité

1. **Ne JAMAIS partager sa clé privée MetaMask**
2. **Ne JAMAIS commiter le fichier `.env` dans Git** (ajouter à `.gitignore`)
3. **Vérifier toujours l'adresse du contrat** avant d'interagir
4. **Utiliser HTTPS en production** pour sécuriser les données

### Performance

1. **Toujours garder au moins 0.2 MATIC** pour les frais gas
2. **Fermer l'application** quand pas utilisée pour économiser batterie
3. **Désactiver le GPS** quand pas de livraison active
4. **Vider le cache** régulièrement pour améliorer performances

### Utilisation

1. **Ne rester "En ligne" que si réellement disponible** pour accepter commandes
2. **Vérifier zone et trafic** avant d'accepter une commande
3. **Maintenir profil et numéro à jour** pour faciliter communication
4. **Consulter régulièrement ses gains** pour suivre performance
5. **Lire les avis clients** pour améliorer son service

### Comportement

1. **Respecter les délais** pour éviter le slashing
2. **Être courtois** avec restaurants et clients
3. **Vérifier l'état de la commande** avant de partir du restaurant
4. **Contacter le client** si problème de livraison
5. **Signaler tout problème** via le système de dispute si nécessaire

---

## Conclusion

L'application **DONE Food Delivery Deliverer** offre une solution complète et moderne pour les livreurs, en tirant parti de la **blockchain Polygon** pour garantir :

- ✅ **Paiements instantanés** (20% de chaque commande)
- ✅ **Transparence totale** des transactions
- ✅ **Sécurité** via le système de staking
- ✅ **Traçabilité complète** des livraisons
- ✅ **Navigation GPS** intégrée
- ✅ **Notifications temps réel** via Socket.io

Grâce à cette application, les livreurs peuvent **maximiser leurs revenus**, **gérer efficacement leurs livraisons**, et **bénéficier d'un système équitable et décentralisé**.

---

**Merci d'utiliser DONE Food Delivery — La plateforme décentralisée, transparente et équitable.**

---

## Annexes

### Liens Utiles

- [Documentation Polygon](https://docs.polygon.technology/)
- [Faucet Mumbai Testnet](https://faucet.polygon.technology/)
- [MetaMask](https://metamask.io/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### Support

Pour toute question ou problème, consultez :

- **README principal** : `../README.md`
- **Architecture** : `../ARCHITECTURE.md`
- **Backend README** : `../../backend/README.md`
- **Issues GitHub** : [Créer une issue](https://github.com/zakariaeyahya/done-food-delivery)

---

**Version** : 1.0.0
**Date** : 2024
**Auteurs** : Équipe DONE Food Delivery
