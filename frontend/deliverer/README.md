# DONE Food Delivery - Frontend Deliverer App

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
- [PWA (Progressive Web App)](#pwa-progressive-web-app)
- [Démarrage](#démarrage)
- [Déploiement](#déploiement)
- [Workflow utilisateur](#workflow-utilisateur)

---

## 🎯 Introduction

L'application frontend deliverer de DONE Food Delivery est une interface React web-first permettant aux livreurs d'accepter des livraisons, suivre leurs trajets en temps réel et gérer leurs gains. L'application est conçue comme une **PWA (Progressive Web App)** pour permettre l'installation sur mobile et l'accès aux fonctionnalités GPS natives.

### Fonctionnalités principales

-  **Connexion Web3** : Intégration MetaMask avec vérification du rôle DELIVERER
-  **Staking** : Gestion du staking minimum (0.1 ETH) pour devenir livreur actif
-  **Commandes disponibles** : Liste des commandes à proximité avec tri par distance
-  **Navigation GPS** : Intégration Google Maps avec itinéraires en temps réel
-  **Tracking actif** : Suivi GPS automatique pendant les livraisons
-  **Confirmation pickup/delivery** : Validation on-chain des étapes
-  **Suivi des gains** : Analytics détaillées des revenus (20% du total)
-  **Notes et avis** : Affichage des ratings clients
-  **PWA mobile** : Installation sur écran d'accueil et accès GPS natif
-  **Design responsive** : Interface optimisée pour mobile et desktop

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│            Frontend Deliverer App (React + Vite)              │
│                    Web-First + PWA Mobile                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Backend API   │   │   Blockchain     │   │  Services      │
│  (REST)        │   │   (Polygon)     │   │  Externes      │
├────────────────┤   ├─────────────────┤   ├────────────────┤
│ - Orders       │   │ - OrderManager  │   │ - Google Maps  │
│ - Deliverers   │   │ - Staking       │   │ - Geolocation  │
│ - GPS Tracking │   │ - PaymentSplit  │   │ - Socket.io    │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Flux de données

```
Livreur en ligne → Commandes disponibles → Acceptation → Navigation GPS
                                                              ↓
                                                         Confirmation pickup
                                                              ↓
                                                         Tracking GPS actif
                                                              ↓
                                                         Confirmation delivery
                                                              ↓
                                                         Paiement automatique (20%)
```

---

## 🛠️ Technologies

### Core
- **React** 18.2 : Bibliothèque UI
- **Vite** 4.3 : Build tool et dev server (avec support PWA)
- **React Router DOM** 6.11 : Routing client-side
- **TailwindCSS** 3.3 : Framework CSS utility-first

### Web3 & Blockchain
- **Ethers.js** 6.4 : Bibliothèque pour interagir avec Ethereum/Polygon
- **MetaMask** : Wallet pour transactions Web3

### Cartographie & GPS
- **Google Maps API** : Cartographie et navigation
- **@react-google-maps/api** 2.19 : Wrapper React pour Google Maps
- **Geolocation API** : API native du navigateur pour GPS

### Temps réel
- **Socket.io-client** 4.6 : Notifications temps réel

### Visualisation
- **Chart.js** 4.3 : Bibliothèque de graphiques
- **react-chartjs-2** 5.2 : Wrapper React pour Chart.js

### Services
- **Axios** 1.4 : Client HTTP pour appels API
- **date-fns** 2.30 : Manipulation de dates

### PWA
- **vite-plugin-pwa** : Support PWA pour installation mobile

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MetaMask** installé dans le navigateur
- Un wallet avec le rôle **DELIVERER_ROLE** sur la blockchain
- Un wallet avec au moins **0.1 MATIC** pour le staking
- L'URL de l'API backend (Sprint 2)
- Les adresses des contrats déployés (Sprint 1)
- Une clé **Google Maps API** (pour la navigation)
- Accès GPS sur le navigateur/mobile (pour le tracking)

---

## 🚀 Installation

### 1. Naviguer vers le dossier

```bash
cd frontend/deliverer
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

Créez un fichier `.env` à la racine du dossier `frontend/deliverer/` :

```env
# === API BACKEND ===
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# === BLOCKCHAIN (Polygon Amoy) ===
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...

# === GOOGLE MAPS ===
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# === RÉSEAU ===
VITE_CHAIN_ID=80002
VITE_NETWORK_NAME=Polygon Amoy
```

### Obtenir une clé Google Maps API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un projet existant
3. Activer les APIs :
   - Maps JavaScript API
   - Directions API
   - Geocoding API
4. Créer des credentials (clé API)
5. Restreindre la clé (optionnel mais recommandé)
6. Copier la clé dans `.env`

### Vérification du rôle DELIVERER

Le livreur doit avoir le rôle `DELIVERER_ROLE` sur le contrat `DoneOrderManager`. Si ce n'est pas le cas, contactez l'administrateur de la plateforme.

### Staking minimum

Le livreur doit staker au minimum **0.1 MATIC** pour être éligible aux livraisons. Le staking se fait via le composant `StakingPanel`.

---

## 📁 Structure du projet

```
frontend/deliverer/
├── public/
│   ├── index.html              # HTML de base
│   ├── manifest.json           # Manifest PWA
│   └── icons/                  # Icônes PWA (192x192, 512x512)
│
├── src/
│   ├── App.jsx                 # Composant racine + routing
│   ├── index.jsx               # Point d'entrée React
│   ├── index.css               # Styles globaux TailwindCSS
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ConnectWallet.jsx  # Connexion MetaMask
│   │   ├── StakingPanel.jsx  # Gestion staking
│   │   ├── AvailableOrders.jsx # Liste commandes disponibles
│   │   ├── ActiveDelivery.jsx # Livraison en cours
│   │   ├── NavigationMap.jsx  # Carte navigation Google Maps
│   │   ├── EarningsTracker.jsx # Suivi gains
│   │   ├── RatingDisplay.jsx  # Notes et avis
│   │   ├── charts/            # Composants graphiques
│   │   │   ├── EarningsChart.tsx
│   │   │   └── RatingChart.tsx
│   │   ├── delivery/          # Composants livraison
│   │   │   ├── ActiveDeliveryCard.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── OrdersList.tsx
│   │   ├── layout/            # Composants layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── rating/            # Composants rating
│   │   │   ├── RatingDisplay.tsx
│   │   │   └── StarRating.tsx
│   │   ├── wallet/            # Composants wallet
│   │   │   ├── ConnectWalletModal.tsx
│   │   │   └── WalletBadge.tsx
│   │   └── ui/                # Composants UI réutilisables
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Skeleton.tsx
│   │       └── PageTransition.tsx
│   │
│   ├── pages/                  # Pages de l'application
│   │   ├── HomePage.jsx       # Page d'accueil
│   │   ├── DeliveriesPage.jsx # Historique livraisons
│   │   ├── EarningsPage.jsx   # Page revenus
│   │   └── ProfilePage.jsx     # Page profil
│   │
│   ├── services/               # Services API et blockchain
│   │   ├── api.js             # Appels API backend
│   │   ├── blockchain.js      # Interactions Web3
│   │   └── geolocation.js     # Service géolocalisation
│   │
│   ├── providers/              # Context providers
│   │   └── AppProvider.tsx     # Provider global
│   │
│   ├── lib/                    # Bibliothèques utilitaires
│   │   ├── animations.ts      # Animations
│   │   ├── constants.ts       # Constantes
│   │   └── utils.ts           # Utilitaires généraux
│   │
│   └── utils/                  # Utilitaires
│       └── formatters.ts      # Formatage données
│
├── package.json                # Dépendances et scripts
├── vite.config.js              # Configuration Vite + PWA
├── tailwind.config.js          # Configuration TailwindCSS
├── postcss.config.js           # Configuration PostCSS
└── .env                        # Variables d'environnement
```

---

## 🧩 Composants

### ConnectWallet.jsx

**Rôle** : Gestion de la connexion au wallet MetaMask pour le livreur.

**Fonctionnalités** :
- Détection de MetaMask installé
- Connexion au wallet
- Vérification du réseau (Polygon Amoy)
- Vérification du rôle `DELIVERER_ROLE` sur la blockchain
- Vérification du staking (minimum 0.1 ETH)
- Récupération du profil livreur depuis l'API
- Affichage de l'adresse connectée (format court)
- Indicateur de réseau et statut staking

**Utilisation** :
```jsx
import ConnectWallet from './components/ConnectWallet'

<ConnectWallet onConnect={handleConnect} />
```

---

### StakingPanel.jsx

**Rôle** : Panel de gestion du staking livreur.

**Fonctionnalités** :
- Affichage du montant staké (MATIC + conversion USD)
- Statut : Staké / Non staké (badge visuel)
- Input pour montant à staker (minimum 0.1 MATIC)
- Bouton "Stake 0.1 ETH" avec transaction MetaMask
- Bouton "Unstake" (désactivé si livraison active)
- Historique des slashing :
  - Table avec dates, raisons, montants, txHash
  - Total slashé affiché
  - Avertissement si trop de slashing

**Props** :
```jsx
{
  address: string
}
```

---

### AvailableOrders.jsx

**Rôle** : Liste des commandes disponibles à accepter.

**Fonctionnalités** :
- Fetch des commandes avec status `PREPARING`
- Tri par distance (plus proche en premier)
- Auto-refresh toutes les 10 secondes
- Socket.io listener `orderReady` pour nouvelles commandes
- Affichage distance au restaurant :
  - Calculée depuis position actuelle
  - Icône indicateur : vert < 2km, orange 2-5km, rouge > 5km
- Gains estimés (deliveryFee = 20% du total, MATIC + USD)
- Temps estimé de livraison
- Bouton "Accepter" par commande
- Vérification staking avant acceptation

**Socket.io events** :
- `orderReady` : Nouvelle commande disponible
- `orderAccepted` : Commande acceptée par un autre livreur

---

### ActiveDelivery.jsx

**Rôle** : Affichage et gestion de la livraison en cours.

**Fonctionnalités** :
- Détails de la commande (orderId, client, items, total, delivery fee)
- Adresse restaurant :
  - Nom du restaurant
  - Adresse complète
  - Bouton "Appeler restaurant"
  - Distance actuelle
- Adresse client :
  - Nom du client
  - Adresse de livraison complète
  - Bouton "Appeler client"
  - Distance depuis position actuelle
- Navigation :
  - Bouton "Naviguer vers restaurant" (si pas encore récupéré)
  - Bouton "Naviguer vers client" (si récupéré)
- Confirmation pickup :
  - Visible si proche restaurant (< 100m)
  - Appelle `api.confirmPickup()` + `blockchain.confirmPickupOnChain()`
  - Démarre GPS tracking automatique
- Confirmation delivery :
  - Visible si proche client (< 100m)
  - Appelle `api.confirmDelivery()` + `blockchain.confirmDeliveryOnChain()`
  - Arrête GPS tracking
  - Déclenche paiement automatique (20%)
- GPS tracking actif :
  - Update position toutes les 5 secondes
  - Envoi au backend via `api.updateGPSLocation()`

---

### NavigationMap.jsx

**Rôle** : Carte de navigation interactive avec Google Maps.

**Fonctionnalités** :
- Intégration Google Maps via `@react-google-maps/api`
- Markers : position livreur, restaurant, client
- Zoom automatique sur itinéraire
- Itinéraire vers restaurant (si step = 'pickup')
- Itinéraire vers client (si step = 'delivery')
- DirectionsService Google Maps avec polyline
- Mise à jour position temps réel (watchPosition GPS)
- Recalcul route si déviation
- ETA affiché (temps estimé d'arrivée)

**Props** :
```jsx
{
  origin: { lat: number, lng: number },      // Position livreur
  destination: { lat: number, lng: number }, // Restaurant ou client
  step: 'pickup' | 'delivery',
  onArrival: () => void
}
```

---

### EarningsTracker.jsx

**Rôle** : Suivi des gains du livreur.

**Fonctionnalités** :
- Gains aujourd'hui (MATIC + USD, nombre livraisons)
- Tabs : Jour / Semaine / Mois
- Graphique line chart des earnings
- Total période sélectionnée
- Comparaison avec période précédente
- Paiements en attente (non withdrawable)
- Bouton "Retirer" si solde > 0
- Statistiques :
  - Nombre livraisons complétées
  - Taux de succès (%)
  - Temps moyen par livraison
  - Rating moyen

**Données affichées** :
```javascript
{
  today: { earnings: 50, deliveries: 5 }, // MATIC
  week: { earnings: 350, deliveries: 35 },
  month: { earnings: 1500, deliveries: 150 },
  pending: 20, // MATIC en attente
  total: 2000  // MATIC total
}
```

---

### RatingDisplay.jsx

**Rôle** : Affichage des notes et avis du livreur.

**Fonctionnalités** :
- Note moyenne sur 5 étoiles (graphique visuel)
- Nombre total d'avis
- Nombre total de livraisons
- Nombre d'annulations
- Taux de succès (%)
- Avis récents clients :
  - Liste des 5 derniers (nom, rating, commentaire, date)
  - Pagination si plus de 5
- Graphique évolution notes :
  - Line chart des 30 derniers jours
  - Axe X : dates, Axe Y : rating (0-5)
- Objectifs de performance :
  - Badges : "100 livraisons", "Rating > 4.5", etc.
  - Progression vers objectifs
  - Récompenses débloquées

---

## 📄 Pages

### HomePage.jsx

**Route** : `/`

**Fonctionnalités** :
- Statut en ligne/hors ligne (toggle switch)
- Si Online : livreur visible pour commandes
- Si Offline : ne reçoit plus de commandes
- Commandes disponibles (intègre AvailableOrders, limite 5)
- Bouton "Voir toutes"
- Livraison active (intègre ActiveDelivery si activeDelivery existe)
- Statistiques rapides (cards) :
  - Livraisons aujourd'hui
  - Gains aujourd'hui
  - Rating
  - Montant staké
- Accès rapide aux autres pages

---

### DeliveriesPage.jsx

**Route** : `/deliveries`

**Fonctionnalités** :
- Liste des livraisons (passées et en cours)
- Table avec colonnes : Order ID, Restaurant, Client, Status, Earnings, Date, Actions
- Filtres par statut (Toutes / En cours / Complétées / Annulées)
- Modal détails livraison complète :
  - Timeline des étapes
  - GPS tracking history (replay)
  - Transaction hash
  - Rating client (si disponible)
- Actions :
  - "Continuer livraison" (si IN_DELIVERY)
  - "Voir détails" (si DELIVERED)
- Export historique CSV

---

### EarningsPage.jsx

**Route** : `/earnings`

**Fonctionnalités** :
- Intègre EarningsTracker en full-page
- Graphiques détaillés :
  - Earnings over time
  - Deliveries over time
  - Average earnings per delivery
  - Peak hours
- Historique complet transactions blockchain :
  - Table : Date, Order ID, Amount earned (20%), Transaction hash, Status
  - Pagination
- Export de données (bouton "Export CSV")

---

### ProfilePage.jsx

**Route** : `/profile`

**Fonctionnalités** :
- Informations personnelles (nom, téléphone, wallet, formulaire édition)
- Statut staking (intègre StakingPanel)
- Notes et avis (intègre RatingDisplay)
- Historique livraisons (statistiques globales) :
  - Total livraisons
  - Taux de succès
  - Temps moyen
  - Distance totale parcourue
- Paramètres :
  - Langue
  - Notifications
  - Thème (light/dark)
  - Sons activés/désactivés

---

##  Services

### api.js

**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getAvailableOrders(location)` : Commandes disponibles avec location
- `acceptOrder(orderId, delivererAddress)` : Accepter commande
- `confirmPickup(orderId, delivererAddress)` : Confirmation récupération
- `confirmDelivery(orderId, delivererAddress)` : Confirmation livraison
- `updateGPSLocation(orderId, lat, lng)` : Mise à jour position GPS
- `getEarnings(address, period)` : Revenus (jour/semaine/mois)
- `getRating(address)` : Notes et avis
- `updateStatus(address, isOnline)` : Mise à jour disponibilité
- `getDelivererOrders(address, filters)` : Livraisons avec filtres
- `getDeliverer(address)` : Profil livreur
- `registerDeliverer(delivererData)` : Inscription livreur

**Exemple** :
```javascript
import api from './services/api'

const orders = await api.getAvailableOrders({ lat: 48.8566, lng: 2.3522 })
const { txHash } = await api.acceptOrder(orderId, address)
```

---

### blockchain.js

**Rôle** : Service pour les interactions Web3 directes.

**Fonctions principales** :
- `connectWallet()` : Connexion MetaMask
- `hasRole(role, address)` : Vérification rôle DELIVERER
- `isStaked(address)` : Vérification staking
- `getStakeInfo(address)` : Infos staking (montant, statut)
- `stake(amount)` : Effectuer staking
- `unstake()` : Retirer staking
- `acceptOrderOnChain(orderId)` : Accepter commande on-chain
- `confirmPickupOnChain(orderId)` : Confirmation pickup on-chain
- `confirmDeliveryOnChain(orderId)` : Confirmation delivery on-chain
- `getSlashingEvents(address)` : Historique slashing
- `getEarningsEvents(address)` : Events PaymentSplit

**Exemple** :
```javascript
import blockchain from './services/blockchain'

const isStaked = await blockchain.isStaked(address)
const { txHash } = await blockchain.stake(ethers.parseEther('0.1'))
```

---

### geolocation.js

**Rôle** : Service de géolocalisation et calculs GPS.

**Fonctions principales** :
- `getCurrentPosition()` : Position actuelle (Promise)
- `watchPosition(callback)` : Suivi position continue (retourne watchId)
- `calculateRoute(origin, destination)` : Itinéraire Google Maps
- `getDistance(lat1, lng1, lat2, lng2)` : Distance Haversine (km)
- `isNearLocation(currentLat, currentLng, targetLat, targetLng, radius)` : Vérification proximité

**Exemple** :
```javascript
import geolocation from './services/geolocation'

const position = await geolocation.getCurrentPosition()
const distance = geolocation.getDistance(lat1, lng1, lat2, lng2)
const isNear = geolocation.isNearLocation(lat1, lng1, lat2, lng2, 0.1) // 100m
```

---

## 🌐 Intégration API

### Endpoints utilisés

#### Livreurs
- `GET /api/deliverers/:address` : Profil livreur
- `GET /api/deliverers/available` : Commandes disponibles
- `PUT /api/deliverers/:address/status` : Mise à jour disponibilité
- `GET /api/deliverers/:address/orders` : Historique livraisons
- `GET /api/deliverers/:address/earnings` : Revenus
- `GET /api/deliverers/:address/rating` : Notes et avis
- `POST /api/deliverers/stake` : Staking
- `POST /api/deliverers/unstake` : Retrait staking

#### Commandes
- `POST /api/deliverers/orders/:id/accept` : Accepter commande
- `POST /api/orders/:id/confirm-pickup` : Confirmer pickup
- `POST /api/orders/:id/confirm-delivery` : Confirmer delivery
- `POST /api/orders/:id/update-gps` : Mise à jour GPS
- `GET /api/orders/:id` : Détails commande
- `GET /api/deliverers/:address/active-delivery` : Livraison active

### Socket.io

**Connexion** :
```javascript
import io from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL)
socket.emit('join-deliverer-room', delivererAddress)
```

**Events écoutés** :
- `orderReady` : Nouvelle commande disponible
- `orderAccepted` : Commande acceptée par un autre livreur
- `clientLocationUpdate` : Mise à jour adresse client

### GPS Tracking automatique

Pendant une livraison active, le livreur envoie sa position toutes les 5 secondes :

```javascript
// ActiveDelivery.jsx
useEffect(() => {
  if (!activeDelivery) return

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      updateGPSLocation(activeDelivery.orderId, latitude, longitude)
      setCurrentLocation({ lat: latitude, lng: longitude })
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}, [activeDelivery])
```

---

## 📱 PWA (Progressive Web App)

### Configuration PWA

L'application est configurée comme PWA pour permettre :

- **Installation sur écran d'accueil** : Sur mobile et desktop
- **Fonctionnement offline partiel** : Cache des données essentielles
- **Notifications push** : Alertes pour nouvelles commandes
- **Accès GPS natif** : Utilisation de l'API Geolocation du navigateur

### Configuration dans vite.config.js

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Done Food Delivery - Livreur',
        short_name: 'Done Livreur',
        description: 'Application pour livreurs Done Food Delivery',
        theme_color: '#0ea5e9',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

### Installation sur mobile

1. Ouvrir l'application dans le navigateur mobile
2. Menu du navigateur → "Ajouter à l'écran d'accueil"
3. L'application s'installe comme une app native
4. Accès GPS natif disponible

---

## ▶️ Démarrage

### Mode développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5175` (ou un autre port si occupé).

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
- `VITE_STAKING_ADDRESS`
- `VITE_GOOGLE_MAPS_API_KEY`

---

## 🚴 Workflow utilisateur

### Parcours complet d'un livreur

1. **Connexion** : Le livreur se connecte avec MetaMask
2. **Vérification** : Vérification du rôle DELIVERER_ROLE
3. **Staking** : Staking minimum de 0.1 MATIC (si pas déjà fait)
4. **En ligne** : Le livreur passe en ligne (toggle status)
5. **Commandes** : Affichage des commandes disponibles à proximité
6. **Acceptation** : Le livreur accepte une commande (on-chain + off-chain)
7. **Navigation** : Navigation GPS vers le restaurant
8. **Pickup** : Confirmation de récupération quand proche (< 100m)
9. **Tracking** : GPS tracking démarre automatiquement
10. **Livraison** : Navigation GPS vers le client
11. **Delivery** : Confirmation de livraison quand proche (< 100m)
12. **Paiement** : Réception automatique du paiement (20% du total)
13. **Analytics** : Consultation des gains et ratings

### Gestion d'une livraison

1. **Réception** : Nouvelle commande arrive via Socket.io
2. **Affichage** : Commande apparaît dans AvailableOrders
3. **Acceptation** : Clic sur "Accepter"
4. **Blockchain** : Transaction on-chain confirmée
5. **Navigation** : Ouverture de NavigationMap vers restaurant
6. **Arrivée restaurant** : Bouton "Confirmer pickup" apparaît (< 100m)
7. **Pickup confirmé** : GPS tracking démarre automatiquement
8. **Navigation client** : Itinéraire vers client
9. **Arrivée client** : Bouton "Confirmer delivery" apparaît (< 100m)
10. **Delivery confirmée** : Paiement automatique déclenché
11. **Gains** : 20% du total ajouté aux earnings

---

## 🎨 Personnalisation

### Thème TailwindCSS

Modifiez `tailwind.config.js` pour personnaliser les couleurs, polices, etc.

### Graphiques

Les graphiques utilisent Chart.js. Personnalisez les couleurs et styles dans les composants `EarningsTracker.jsx` et `RatingDisplay.jsx`.

---

## 🐛 Dépannage

### MetaMask non détecté

**Problème** : "MetaMask not found"

**Solution** :
1. Installer MetaMask depuis [metamask.io](https://metamask.io/)
2. Rafraîchir la page
3. Vérifier que MetaMask est déverrouillé

### Rôle DELIVERER non trouvé

**Problème** : "You don't have DELIVERER_ROLE"

**Solution** :
1. Vérifier que le wallet a bien le rôle DELIVERER_ROLE
2. Contacter l'administrateur pour attribution du rôle
3. Vérifier que le livreur est enregistré dans la base de données

### Staking insuffisant

**Problème** : "Minimum 0.1 MATIC required"

**Solution** :
1. Aller dans ProfilePage
2. Utiliser StakingPanel
3. Staker au minimum 0.1 MATIC

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

### Erreur GPS

**Problème** : "Geolocation not available"

**Solution** :
1. Vérifier que l'accès GPS est autorisé dans le navigateur
2. Sur mobile : Activer la localisation dans les paramètres
3. Vérifier que l'application est en HTTPS (requis pour GPS)

### Google Maps ne s'affiche pas

**Problème** : Carte vide

**Solution** :
1. Vérifier `VITE_GOOGLE_MAPS_API_KEY` dans `.env`
2. Vérifier que les APIs sont activées :
   - Maps JavaScript API
   - Directions API
   - Geocoding API
3. Vérifier les restrictions de la clé API

### Commandes ne s'affichent pas

**Problème** : Aucune commande dans AvailableOrders

**Solution** :
1. Vérifier que le livreur est en ligne (toggle Online)
2. Vérifier la connexion Socket.io
3. Vérifier que le livreur a rejoint la room `deliverer_${address}`
4. Vérifier les logs du backend pour les events émis

---

##  Ressources

- **React Documentation** : https://react.dev/
- **Vite Documentation** : https://vitejs.dev/
- **TailwindCSS Documentation** : https://tailwindcss.com/
- **Chart.js Documentation** : https://www.chartjs.org/
- **Google Maps API** : https://developers.google.com/maps/documentation
- **Ethers.js Documentation** : https://docs.ethers.org/
- **Socket.io Documentation** : https://socket.io/docs/
- **PWA Guide** : https://web.dev/progressive-web-apps/

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
3. Tester localement (sur mobile si possible)
4. Créer une pull request

### Standards de code

- Utiliser ESLint (si configuré)
- Suivre les conventions React
- Ajouter des commentaires pour les fonctions complexes
- Tester sur mobile et desktop
- Vérifier le fonctionnement PWA

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour DONE Food Delivery**
