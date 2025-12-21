# DONE Food Delivery - Frontend Client

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

L'application frontend client de DONE Food Delivery est une interface React moderne permettant aux clients de commander des repas, suivre leurs livraisons en temps réel et gérer leur compte avec des tokens de fidélité. L'application utilise Web3 pour les paiements via MetaMask et s'intègre avec la blockchain Polygon pour garantir la transparence et la sécurité.

### Fonctionnalités principales

-  **Connexion Web3** : Intégration MetaMask pour paiements sécurisés
-  **Catalogue de restaurants** : Parcourir et filtrer les restaurants disponibles
-  **Panier d'achat** : Gestion complète du panier avec calcul automatique des frais
-  **Checkout sécurisé** : Paiement via blockchain avec confirmation MetaMask
-  **Suivi en temps réel** : Tracking GPS avec Google Maps et Socket.io
-  **Tokens de fidélité** : Système de récompenses DONE tokens
-  **Historique des commandes** : Consultation et réorganisation des commandes passées
-  **Système de litiges** : Ouverture de litiges avec preuves IPFS
-  **Design responsive** : Interface optimisée mobile et desktop

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Client (React)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Backend API   │   │   Blockchain    │   │  Services      │
│  (REST)        │   │   (Polygon)     │   │  Externes      │
├────────────────┤   ├─────────────────┤   ├────────────────┤
│ - Restaurants  │   │ - OrderManager  │   │ - IPFS (Pinata)│
│ - Orders       │   │ - Token (DONE)  │   │ - Google Maps  │
│ - Users        │   │ - PaymentSplit  │   │ - Socket.io    │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Flux de données

```
User Action → Component → Service → API/Blockchain → Response → State Update → UI Update
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

### Services externes
- **Socket.io-client** 4.6 : Notifications temps réel
- **Google Maps API** : Cartographie et tracking GPS
- **Axios** 1.4 : Client HTTP pour appels API

### Utilitaires
- **date-fns** 2.30 : Manipulation de dates
- **React Icons** : Bibliothèque d'icônes

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MetaMask** installé dans le navigateur
- Un compte **Google Maps API** (pour le tracking GPS)
- L'URL de l'API backend (Sprint 2)
- Les adresses des contrats déployés (Sprint 1)

---

## 🚀 Installation

### 1. Cloner et naviguer

```bash
cd frontend/client
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

Créez un fichier `.env` à la racine du dossier `frontend/client/` :

```env
# === API BACKEND ===
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# === BLOCKCHAIN (Polygon Amoy) ===
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...

# === IPFS ===
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# === GOOGLE MAPS ===
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# === RÉSEAU ===
VITE_CHAIN_ID=80002
VITE_NETWORK_NAME=Polygon Amoy
```

### Obtenir une clé Google Maps API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un projet existant
3. Activer l'API "Maps JavaScript API"
4. Créer des credentials (clé API)
5. Restreindre la clé (optionnel mais recommandé)
6. Copier la clé dans `.env`

---

## 📁 Structure du projet

```
frontend/client/
├── public/
│   └── index.html              # HTML de base
│
├── src/
│   ├── App.jsx                 # Composant racine + routing
│   ├── index.jsx               # Point d'entrée React
│   ├── index.css               # Styles globaux TailwindCSS
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ConnectWallet.jsx   # Connexion MetaMask
│   │   ├── RestaurantList.jsx  # Liste restaurants
│   │   ├── RestaurantCard.jsx  # Carte restaurant
│   │   ├── MenuItems.jsx       # Menu restaurant
│   │   ├── Cart.jsx            # Panier d'achat
│   │   ├── Checkout.jsx        # Processus checkout
│   │   ├── OrderTracking.jsx   # Suivi commande temps réel
│   │   ├── OrderHistory.jsx    # Historique commandes
│   │   ├── TokenBalance.jsx    # Solde tokens DONE
│   │   ├── DisputeModal.jsx    # Modal litige
│   │   ├── Header.jsx          # En-tête navigation
│   │   └── Footer.jsx          # Pied de page
│   │
│   ├── pages/                  # Pages de l'application
│   │   ├── HomePage.jsx        # Page d'accueil
│   │   ├── RestaurantPage.jsx  # Page détail restaurant
│   │   ├── CheckoutPage.jsx    # Page checkout
│   │   ├── TrackingPage.jsx    # Page suivi commande
│   │   └── ProfilePage.jsx     # Page profil utilisateur
│   │
│   ├── services/               # Services API et blockchain
│   │   ├── api.js              # Appels API backend
│   │   ├── blockchain.js       # Interactions Web3
│   │   └── ipfs.js             # Interactions IPFS
│   │
│   ├── contexts/               # Context API (état global)
│   │   ├── WalletContext.jsx   # État wallet connecté
│   │   ├── CartContext.jsx     # État panier
│   │   └── SocketContext.jsx   # Connexion Socket.io
│   │
│   └── utils/                  # Utilitaires
│       ├── web3.js             # Helpers Web3
│       └── formatters.js       # Formatage données
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

**Rôle** : Gestion de la connexion au wallet MetaMask.

**Fonctionnalités** :
- Détection de MetaMask installé
- Connexion au wallet
- Vérification du réseau (Polygon Amoy)
- Affichage de l'adresse connectée (format court)
- Affichage du solde MATIC
- Gestion des erreurs (rejet, réseau incorrect, wallet verrouillé)

**Utilisation** :
```jsx
import ConnectWallet from './components/ConnectWallet'

<ConnectWallet />
```

---

### RestaurantList.jsx

**Rôle** : Affichage de la liste des restaurants avec filtres.

**Fonctionnalités** :
- Fetch des restaurants depuis l'API backend
- Filtres par type de cuisine, prix, note
- Grid layout responsive
- Skeleton loader pendant le chargement
- Auto-refresh toutes les 30 secondes

**Props** :
```jsx
{
  filters?: {
    cuisine?: string,
    priceRange?: [number, number],
    minRating?: number
  },
  limit?: number
}
```

---

### RestaurantCard.jsx

**Rôle** : Carte individuelle d'un restaurant.

**Props** :
```jsx
{
  restaurant: {
    id: string,
    name: string,
    cuisine: string,
    description: string,
    images: string[], // IPFS hashes
    rating: number,
    totalOrders: number,
    location: { address: string, lat: number, lng: number }
  }
}
```

**Fonctionnalités** :
- Affichage des informations du restaurant
- Image principale depuis IPFS
- Note moyenne avec étoiles
- Temps de livraison estimé
- Prix moyen
- Bouton "Voir le menu"

---

### MenuItems.jsx

**Rôle** : Affichage du menu d'un restaurant.

**Props** :
```jsx
{
  restaurantId: string,
  onAddToCart: (item: MenuItem, quantity: number) => void
}
```

**Fonctionnalités** :
- Affichage du menu avec images IPFS
- Filtres par catégorie (Entrées, Plats, Desserts, Boissons)
- Prix en MATIC + conversion EUR
- Ajout au panier avec sélection de quantité
- Lazy loading des images

---

### Cart.jsx

**Rôle** : Panier d'achat du client.

**Fonctionnalités** :
- Liste des items dans le panier
- Calcul automatique :
  - Prix nourriture
  - Frais de livraison
  - Frais plateforme (10%)
  - Total
- Modification des quantités (+/-)
- Suppression d'items
- Affichage détaillé de chaque composante

**State** :
```jsx
const [cart, setCart] = useState([])
const [deliveryFee, setDeliveryFee] = useState(3) // MATIC
```

---

### Checkout.jsx

**Rôle** : Processus de paiement et validation de commande.

**Fonctionnalités** :
- Confirmation de l'adresse de livraison
- Autocomplete Google Places
- Approbation paiement MetaMask
- Upload des items vers IPFS
- Création de la commande (on-chain + off-chain)
- Affichage de la progression de la transaction
- Redirection vers TrackingPage après succès

**Étapes visuelles** :
  1. Préparation commande
  2. Upload IPFS
  3. Confirmation MetaMask
  4. Transaction blockchain
5. Commande créée 

---

### OrderTracking.jsx

**Rôle** : Suivi en temps réel d'une commande.

**Props** :
```jsx
{
  orderId: number
}
```

**Fonctionnalités** :
- Mises à jour temps réel via Socket.io
- Timeline visuelle des étapes
- Carte Google Maps avec :
  - Marker restaurant
  - Marker client
  - Marker livreur (mise à jour toutes les 5 sec)
- Polyline route livreur → client
- Informations livreur (nom, photo, rating, véhicule)
- ETA countdown
- Bouton "Confirmer livraison" (visible si < 100m)

**Socket.io events** :
- `orderStatusUpdate` : Mise à jour du statut
- `delivererLocationUpdate` : Mise à jour position livreur

---

### OrderHistory.jsx

**Rôle** : Historique des commandes passées.

**Fonctionnalités** :
- Liste des commandes avec pagination (10 par page)
- Colonnes : Order ID, Restaurant, Date, Total, Status, Actions
- Bouton "Commander à nouveau"
- Modal pour laisser un avis (rating 1-5 + commentaire)
- Téléchargement du reçu (IPFS proof)

---

### TokenBalance.jsx

**Rôle** : Affichage et gestion des tokens DONE.

**Fonctionnalités** :
- Affichage du solde tokens DONE
- Conversion en EUR (1 DONE = 1€ de réduction)
- Utilisation des tokens pour discount
- Historique des transactions tokens
- Taux de récompense affiché (1 token / 10€)
- Progress bar vers le prochain token

---

### DisputeModal.jsx

**Rôle** : Modal pour ouvrir un litige.

**Props** :
```jsx
{
  orderId: number,
  onClose: () => void,
  onSubmit: (disputeData) => void
}
```

**Fonctionnalités** :
- Formulaire de litige (raison, type de problème)
- Upload de preuves images (IPFS)
- Preview des images avant upload
- Soumission du litige (on-chain + off-chain)

---

## 📄 Pages

### HomePage.jsx

**Route** : `/`

**Fonctionnalités** :
- Hero section avec recherche
- Liste des restaurants populaires
- Catégories de cuisine (cards cliquables)
- Offres spéciales

---

### RestaurantPage.jsx

**Route** : `/restaurant/:id`

**Fonctionnalités** :
- Informations complètes du restaurant
- Menu complet avec MenuItems
- Avis et notes clients
- Galerie photos IPFS avec lightbox

---

### CheckoutPage.jsx

**Route** : `/checkout`

**Fonctionnalités** :
- Intègre le composant Checkout
- Gestion du flux de paiement
- Redirection vers TrackingPage après succès

---

### TrackingPage.jsx

**Route** : `/tracking/:orderId`

**Fonctionnalités** :
- Intègre le composant OrderTracking
- Vue full-screen avec carte
- Notifications temps réel

---

### ProfilePage.jsx

**Route** : `/profile`

**Fonctionnalités** :
- Informations personnelles (nom, email, téléphone, wallet)
- Formulaire d'édition
- Historique des commandes (intègre OrderHistory)
- Solde tokens DONE (intègre TokenBalance)
- Paramètres compte (langue, notifications, thème)
- Bouton déconnexion wallet

---

##  Services

### api.js

**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getRestaurants(filters)` : Liste des restaurants
- `getRestaurant(id)` : Détails d'un restaurant
- `createOrder(orderData)` : Créer une commande
- `getOrder(id)` : Détails d'une commande
- `getOrdersByClient(address)` : Historique client
- `confirmDelivery(orderId, clientAddress)` : Confirmer livraison
- `openDispute(orderId, disputeData)` : Ouvrir litige
- `submitReview(orderId, rating, comment)` : Laisser avis

**Exemple** :
```javascript
import api from './services/api'

const restaurants = await api.getRestaurants({ cuisine: 'Italian' })
```

---

### blockchain.js

**Rôle** : Service pour les interactions Web3 directes.

**Fonctions principales** :
- `connectWallet()` : Connexion MetaMask
- `getBalance(address)` : Balance MATIC
- `getTokenBalance(address)` : Balance tokens DONE
- `createOrderOnChain(params)` : Création on-chain
- `confirmDeliveryOnChain(orderId)` : Confirmation on-chain
- `openDisputeOnChain(orderId)` : Litige on-chain
- `getOrderOnChain(orderId)` : Lecture on-chain

**Exemple** :
```javascript
import blockchain from './services/blockchain'

const { address, signer } = await blockchain.connectWallet()
const balance = await blockchain.getBalance(address)
```

---

### ipfs.js

**Rôle** : Service pour les interactions IPFS.

**Fonctions principales** :
- `uploadImage(file)` : Upload image via backend
- `getImage(hash)` : URL image IPFS
- `uploadJSON(data)` : Upload JSON via backend
- `getJSON(hash)` : Récupération JSON

**Exemple** :
```javascript
import ipfs from './services/ipfs'

const { ipfsHash, url } = await ipfs.uploadImage(file)
const imageUrl = ipfs.getImage(ipfsHash)
```

---

## 🌐 Intégration API

### Endpoints utilisés

#### Restaurants
- `GET /api/restaurants` : Liste des restaurants
- `GET /api/restaurants/:id` : Détails d'un restaurant

#### Commandes
- `POST /api/orders/create` : Créer une commande
- `GET /api/orders/:id` : Détails d'une commande
- `GET /api/orders/client/:address` : Historique client
- `POST /api/orders/:id/confirm-delivery` : Confirmer livraison
- `POST /api/orders/:id/dispute` : Ouvrir litige
- `POST /api/orders/:id/review` : Laisser avis

#### Utilisateurs
- `POST /api/users/register` : Enregistrer client
- `GET /api/users/:address` : Profil client
- `PUT /api/users/:address` : Mettre à jour profil
- `GET /api/users/:address/tokens` : Solde tokens

#### Upload
- `POST /api/upload/image` : Upload image IPFS
- `POST /api/upload/json` : Upload JSON IPFS

### Socket.io

**Connexion** :
```javascript
import io from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL)
socket.emit('join-client-room', clientAddress)
```

**Events écoutés** :
- `orderStatusUpdate` : Mise à jour statut commande
- `delivererLocationUpdate` : Mise à jour position livreur

---

## ▶️ Démarrage

### Mode développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173` (ou un autre port si 5173 est occupé).

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
- `VITE_TOKEN_ADDRESS`
- `VITE_IPFS_GATEWAY`
- `VITE_GOOGLE_MAPS_API_KEY`

---

## 👤 Workflow utilisateur

### Parcours complet d'une commande

1. **Accueil** : Le client visite la page d'accueil
2. **Connexion** : Connexion du wallet MetaMask
3. **Recherche** : Parcours des restaurants via la liste ou recherche
4. **Sélection** : Sélection d'un restaurant et consultation du menu
5. **Panier** : Ajout d'items au panier avec quantités
6. **Checkout** : 
   - Saisie de l'adresse de livraison
   - Vérification du total
   - Approbation MetaMask
7. **Création** : Commande créée on-chain + upload IPFS
8. **Suivi** : Redirection vers la page de suivi
9. **Tracking** : Suivi en temps réel avec carte GPS
10. **Livraison** : Confirmation de livraison quand le livreur arrive
11. **Récompense** : Réception de tokens DONE (1 token / 10€)
12. **Avis** : Possibilité de laisser un avis sur le restaurant
13. **Historique** : Consultation de l'historique dans le profil

---

## 🎨 Personnalisation

### Thème TailwindCSS

Modifiez `tailwind.config.js` pour personnaliser les couleurs, polices, etc.

### Styles globaux

Les styles globaux sont dans `src/index.css`. Ajoutez vos styles personnalisés ici.

---

## 🐛 Dépannage

### MetaMask non détecté

**Problème** : "MetaMask not found"

**Solution** :
1. Installer MetaMask depuis [metamask.io](https://metamask.io/)
2. Rafraîchir la page
3. Vérifier que MetaMask est déverrouillé

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

### Google Maps ne s'affiche pas

**Problème** : Carte vide

**Solution** :
1. Vérifier `VITE_GOOGLE_MAPS_API_KEY` dans `.env`
2. Vérifier que l'API "Maps JavaScript API" est activée
3. Vérifier les restrictions de la clé API

---

##  Ressources

- **React Documentation** : https://react.dev/
- **Vite Documentation** : https://vitejs.dev/
- **TailwindCSS Documentation** : https://tailwindcss.com/
- **Ethers.js Documentation** : https://docs.ethers.org/
- **Google Maps API** : https://developers.google.com/maps/documentation
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
- Tester sur mobile et desktop

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour DONE Food Delivery**
