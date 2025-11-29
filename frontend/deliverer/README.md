# Dossier frontend/deliverer/

Application React web pour les livreurs permettant d'accepter des livraisons, suivre les trajets en temps réel et gérer les gains. L'application est conçue en web-first avec possibilité de PWA pour accès mobile.

## Structure

```
frontend/deliverer/
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── components/
│   │   ├── ConnectWallet.jsx
│   │   ├── StakingPanel.jsx
│   │   ├── AvailableOrders.jsx
│   │   ├── ActiveDelivery.jsx
│   │   ├── NavigationMap.jsx
│   │   ├── EarningsTracker.jsx
│   │   └── RatingDisplay.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DeliveriesPage.jsx
│   │   ├── EarningsPage.jsx
│   │   └── ProfilePage.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── blockchain.js
│   │   └── geolocation.js
│   └── index.css
├── package.json
└── .env.example
```

## Fichiers

### App.jsx

**Rôle** : Composant racine de l'application livreur.

**Fonctionnalités** :
- Configuration du router (React Router)
- Gestion de l'état global (Context API)
- Authentification livreur via wallet
- Layout responsive web-first
- Gestion des notifications Socket.io
- Tracking GPS continu quand livraison active

**Structure** :
```javascript
// Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { SocketProvider } from './contexts/SocketContext'
import { GeolocationProvider } from './contexts/GeolocationContext'

// State global
const [deliverer, setDeliverer] = useState(null)
const [isOnline, setIsOnline] = useState(false)
const [activeDelivery, setActiveDelivery] = useState(null)
const [currentLocation, setCurrentLocation] = useState(null)

// Routes
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/deliveries" element={<DeliveriesPage />} />
  <Route path="/earnings" element={<EarningsPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Routes>

// Navigation bar
// Socket.io connection pour notifications
// GPS tracking si livraison active
```

---

## Components (src/components/)

### ConnectWallet.jsx

**Rôle** : Connexion au wallet MetaMask pour le livreur.

**Fonctionnalités** :

**1. Connexion wallet**
- Détecte MetaMask installé
- Appelle window.ethereum.request({ method: 'eth_requestAccounts' })
- Récupère l'adresse du livreur
- Vérifie le réseau (Polygon Mumbai)

**2. Vérification du rôle DELIVERER**
- Call blockchain.hasRole(DELIVERER_ROLE, address)
- Si pas de rôle : afficher message d'erreur et lien inscription
- Si rôle validé : fetch deliverer profile depuis API

**3. Vérification du staking (minimum 0.1 ETH)**
- Call blockchain.isStaked(address)
- Si pas staké : afficher warning + lien vers StakingPanel
- Affiche montant staké actuel

**4. Affichage de l'adresse connectée**
- Format court : 0x1234...5678
- Bouton déconnexion
- Indicateur réseau et status staking

**State** :
```javascript
const [address, setAddress] = useState(null)
const [isConnecting, setIsConnecting] = useState(false)
const [hasRole, setHasRole] = useState(false)
const [isStaked, setIsStaked] = useState(false)
const [stakedAmount, setStakedAmount] = useState(0)
const [deliverer, setDeliverer] = useState(null)
```

**Méthodes** :
- connectWallet() : Connexion MetaMask
- checkRole() : Vérification DELIVERER_ROLE
- checkStaking() : Vérification staking
- fetchDelivererProfile() : Récupération données livreur
- disconnect() : Déconnexion

---

### StakingPanel.jsx

**Rôle** : Panel de gestion du staking livreur.

**Fonctionnalités** :

**1. Display staked amount**
- Fetch blockchain.getStakeInfo(address)
- Affiche montant staké en MATIC
- Affiche montant staké en USD (conversion)
- Statut : Staké / Non staké
- Badge visuel : vert si staké, rouge sinon

**2. Stake 0.1 ETH button**
- Input montant à staker (minimum 0.1 MATIC)
- Validation : amount >= 0.1
- Appelle blockchain.stake(amount)
- Affiche transaction en cours
- Update UI après confirmation
- Notification succès

**3. Unstake button (if no active delivery)**
- Vérifie pas de livraison active via api.getActiveDelivery(address)
- Si livraison active : disable button avec tooltip
- Appelle blockchain.unstake()
- Confirmation modal avant unstake
- Update UI après retrait

**4. Slashing history**
- Fetch slashing events depuis blockchain
- Table historique :
  - Date
  - Raison (late delivery, cancelled, etc.)
  - Montant slashé
  - Transaction hash
- Total slashé affiché
- Avertissement si trop de slashing

**State** :
```javascript
const [stakedAmount, setStakedAmount] = useState(0)
const [isStaked, setIsStaked] = useState(false)
const [stakeInput, setStakeInput] = useState('0.1')
const [hasActiveDelivery, setHasActiveDelivery] = useState(false)
const [slashingHistory, setSlashingHistory] = useState([])
const [loading, setLoading] = useState(false)
```

**Méthodes** :
- handleStake() : Effectuer staking
- handleUnstake() : Retirer staking
- fetchStakingInfo() : Récupérer infos staking
- fetchSlashingHistory() : Récupérer historique slashing

---

### AvailableOrders.jsx

**Rôle** : Liste des commandes disponibles à accepter.

**Fonctionnalités** :

**1. List nearby orders**
- Fetch api.getAvailableOrders({ location: currentLocation })
- Affiche commandes avec status PREPARING
- Tri par distance (plus proche en premier)
- Auto-refresh toutes les 10 secondes
- Socket.io listener pour nouvelles commandes

**2. Distance to restaurant**
- Calcule distance depuis position actuelle
- Utilise geolocation.getDistance(currentLat, currentLng, restaurantLat, restaurantLng)
- Affiche en km avec précision
- Icône indicateur : vert si < 2km, orange si 2-5km, rouge si > 5km

**3. Estimated earnings**
- Affiche deliveryFee (20% du total)
- Calcule earnings = deliveryFee
- Affiche en MATIC et USD
- Temps estimé de livraison

**4. Accept order button**
- Bouton "Accepter" par commande
- Vérifie staking avant acceptation
- Appelle api.acceptOrder(orderId)
- Appelle blockchain.acceptOrderOnChain(orderId)
- Redirige vers ActiveDelivery
- Notification au restaurant

**State** :
```javascript
const [orders, setOrders] = useState([])
const [currentLocation, setCurrentLocation] = useState(null)
const [loading, setLoading] = useState(false)
const [accepting, setAccepting] = useState(null) // orderId en cours d'acceptation
```

**Socket.io listeners** :
```javascript
useEffect(() => {
  socket.on('orderReady', (order) => {
    // Nouvelle commande disponible
    setOrders(prev => [order, ...prev])
    // Notification sonore
    playNotificationSound()
  })

  return () => socket.off('orderReady')
}, [])
```

**Méthodes** :
- fetchAvailableOrders() : Récupérer commandes disponibles
- handleAcceptOrder(orderId) : Accepter commande
- calculateDistance(order) : Calculer distance
- calculateEarnings(order) : Calculer gains estimés

**Render** :
```javascript
<div className="available-orders">
  <h2>Commandes disponibles</h2>

  {orders.map(order => (
    <div key={order.orderId} className="order-card">
      <div className="restaurant-info">
        <span>{order.restaurant.name}</span>
        <span>{calculateDistance(order)} km</span>
      </div>

      <div className="earnings">
        <span>{calculateEarnings(order)} MATIC</span>
      </div>

      <button onClick={() => handleAcceptOrder(order.orderId)}>
        Accepter
      </button>
    </div>
  ))}
</div>
```

---

### ActiveDelivery.jsx

**Rôle** : Affichage et gestion de la livraison en cours.

**Fonctionnalités** :

**1. Order details**
- Affiche orderId, client name
- Liste items commandés
- Total de la commande
- Delivery fee (earnings)

**2. Restaurant address**
- Nom du restaurant
- Adresse complète
- Bouton "Appeler restaurant"
- Distance actuelle

**3. Client address**
- Nom du client
- Adresse de livraison complète
- Bouton "Appeler client"
- Distance depuis position actuelle

**4. Navigation button**
- Bouton "Naviguer vers restaurant" (si pas encore récupéré)
- Bouton "Naviguer vers client" (si récupéré)
- Ouvre NavigationMap en plein écran
- Instructions turn-by-turn

**5. Confirm pickup button**
- Visible quand proche du restaurant (< 100m)
- Appelle api.confirmPickup(orderId)
- Appelle blockchain.confirmPickupOnChain(orderId)
- Start GPS tracking automatique
- Change status : PREPARING → IN_DELIVERY
- Notifie client

**6. Confirm delivery button**
- Visible quand proche du client (< 100m)
- Appelle api.confirmDelivery(orderId)
- Appelle blockchain.confirmDeliveryOnChain(orderId)
- Stop GPS tracking
- Trigger payment split automatique
- Affiche earnings reçus
- Redirige vers HomePage

**7. GPS tracking active**
- Update position toutes les 5 secondes
- Appelle api.updateGPSLocation(orderId, lat, lng)
- Affiche sur carte en temps réel
- Client voit position livreur

**State** :
```javascript
const [order, setOrder] = useState(null)
const [currentLocation, setCurrentLocation] = useState(null)
const [step, setStep] = useState('pickup') // pickup ou delivery
const [isNearRestaurant, setIsNearRestaurant] = useState(false)
const [isNearClient, setIsNearClient] = useState(false)
const [tracking, setTracking] = useState(false)
```

**Méthodes** :
- handleConfirmPickup() : Confirmer récupération
- handleConfirmDelivery() : Confirmer livraison
- startGPSTracking() : Démarrer tracking GPS
- stopGPSTracking() : Arrêter tracking GPS
- checkProximity() : Vérifier proximité restaurant/client

---

### NavigationMap.jsx

**Rôle** : Carte de navigation interactive avec Google Maps.

**Fonctionnalités** :

**1. Google Maps integration**
- Intègre @react-google-maps/api
- Affiche carte interactive
- Markers : position livreur, restaurant, client
- Zoom automatique sur itinéraire

**2. Route to restaurant**
- Si step = 'pickup' : itinéraire vers restaurant
- DirectionsService Google Maps
- Affiche route optimisée
- Polyline sur la carte

**3. Route to client**
- Si step = 'delivery' : itinéraire vers client
- Mise à jour automatique de la route
- Temps estimé d'arrivée (ETA)

**4. Real-time location updates**
- Watchposition GPS toutes les 5 secondes
- Update marker livreur
- Recalcule route si déviation
- Affiche position en temps réel

**Props** :
```javascript
{
  origin: { lat, lng }, // Position livreur
  destination: { lat, lng }, // Restaurant ou client
  step: 'pickup' | 'delivery',
  onArrival: Function
}
```

**State** :
```javascript
const [map, setMap] = useState(null)
const [directions, setDirections] = useState(null)
const [currentPosition, setCurrentPosition] = useState(origin)
const [eta, setEta] = useState(null)
```

**Méthodes** :
- calculateRoute() : Calculer itinéraire
- updatePosition(lat, lng) : Mettre à jour position
- checkArrival() : Vérifier arrivée destination

---

### EarningsTracker.jsx

**Rôle** : Suivi des gains du livreur.

**Fonctionnalités** :

**1. Today's earnings**
- Fetch earnings depuis api.getEarnings(address, { period: 'today' })
- Affiche total du jour en MATIC
- Conversion USD
- Nombre de livraisons aujourd'hui

**2. Week/month earnings**
- Tabs : Jour / Semaine / Mois
- Graphique line chart des earnings
- Total période sélectionnée
- Comparaison avec période précédente

**3. Pending payments**
- Fetch blockchain events PaymentSplit
- Calcule total payments en attente (non encore withdrawable)
- Affiche montant disponible
- Bouton "Retirer" si solde > 0

**4. Completed deliveries count**
- Total livraisons complétées
- Taux de succès (%)
- Temps moyen par livraison
- Rating moyen

**State** :
```javascript
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

**Fetch data** :
```javascript
useEffect(() => {
  const fetchEarnings = async () => {
    const data = await api.getEarnings(address, { period })
    setEarnings(data)

    const count = await api.getDeliveriesCount(address)
    setDeliveriesCount(count)
  }
  fetchEarnings()
}, [period])
```

---

### RatingDisplay.jsx

**Rôle** : Affichage des notes et avis du livreur.

**Fonctionnalités** :

**1. Note moyenne**
- Fetch api.getRating(address)
- Affiche rating sur 5 étoiles
- Graphique en étoiles visuel
- Nombre total d'avis

**2. Nombre total de livraisons**
- Total commandes livrées
- Total commandes annulées
- Taux de succès (%)

**3. Avis récents des clients**
- Liste des 5 derniers avis
- Affiche : nom client, rating, commentaire, date
- Pagination si plus de 5

**4. Graphique d'évolution des notes**
- Line chart : évolution rating dans le temps
- Axe X : dates (30 derniers jours)
- Axe Y : rating (0-5)

**5. Objectifs de performance**
- Badges : "100 livraisons", "Rating > 4.5", etc.
- Progression vers objectifs
- Récompenses débloquées

**State** :
```javascript
const [rating, setRating] = useState(0)
const [totalDeliveries, setTotalDeliveries] = useState(0)
const [reviews, setReviews] = useState([])
const [ratingHistory, setRatingHistory] = useState([])
const [achievements, setAchievements] = useState([])
```

---

## Pages (src/pages/)

### HomePage.jsx

**Rôle** : Page d'accueil du livreur.

**Fonctionnalités** :

**1. Statut (en ligne/hors ligne)**
- Toggle switch : Online / Offline
- Si Online : livreur visible pour commandes
- Si Offline : ne reçoit plus de commandes
- Update api.updateStatus(address, isOnline)

**2. Commandes disponibles**
- Intègre AvailableOrders
- Affiche 5 premières commandes
- Bouton "Voir toutes"

**3. Livraison active (si en cours)**
- Intègre ActiveDelivery si activeDelivery existe
- Prend toute la page si active

**4. Statistiques rapides**
- Cards :
  - Livraisons aujourd'hui : X
  - Gains aujourd'hui : Y MATIC
  - Rating : Z/5
  - Montant staké : W MATIC

**5. Accès rapide aux autres pages**
- Boutons navigation : Deliveries, Earnings, Profile

**Layout** :
```javascript
<div className="home-page">
  <Header deliverer={deliverer} />

  <div className="status-toggle">
    <Toggle checked={isOnline} onChange={setIsOnline} />
    <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
  </div>

  {activeDelivery ? (
    <ActiveDelivery order={activeDelivery} />
  ) : (
    <>
      <div className="stats-grid">
        <StatCard title="Aujourd'hui" value={todayDeliveries} />
        <StatCard title="Gains" value={todayEarnings} />
        <StatCard title="Rating" value={rating} />
      </div>

      <AvailableOrders limit={5} />
    </>
  )}
</div>
```

---

### DeliveriesPage.jsx

**Rôle** : Gestion et historique des livraisons.

**Fonctionnalités** :

**1. Liste des livraisons (passées et en cours)**
- Fetch api.getDelivererOrders(address)
- Table avec colonnes :
  - Order ID
  - Restaurant
  - Client
  - Status
  - Earnings
  - Date
  - Actions

**2. Filtres par statut**
- Dropdown : Toutes / En cours / Complétées / Annulées
- Filter orders array selon status

**3. Détails de chaque livraison**
- Modal avec full order details
- Items list
- Timeline des étapes
- GPS tracking history (replay)
- Transaction hash
- Rating client (si disponible)

**4. Actions sur les livraisons**
- Si IN_DELIVERY : bouton "Continuer livraison"
- Si DELIVERED : bouton "Voir détails"
- Export historique CSV

**State** :
```javascript
const [deliveries, setDeliveries] = useState([])
const [filter, setFilter] = useState('all')
const [selectedDelivery, setSelectedDelivery] = useState(null)
```

---

### EarningsPage.jsx

**Rôle** : Page détaillée des revenus.

**Fonctionnalités** :

**1. Intègre EarningsTracker**
- Composant EarningsTracker en full-page
- Graphiques détaillés

**2. Graphiques détaillés**
- Multiple charts :
  - Earnings over time
  - Deliveries over time
  - Average earnings per delivery
  - Peak hours

**3. Historique complet**
- Table transactions blockchain
- Colonnes :
  - Date
  - Order ID
  - Amount earned (20%)
  - Transaction hash
  - Status
- Pagination

**4. Export de données**
- Bouton "Export CSV"
- Export earnings history
- Export blockchain transactions

**Layout** :
```javascript
<div className="earnings-page">
  <Header title="Mes Revenus" />

  <div className="filters">
    <PeriodSelector value={period} onChange={setPeriod} />
  </div>

  <EarningsTracker address={address} period={period} />

  <div className="transactions-history">
    <h3>Historique des transactions</h3>
    <Table data={transactions} />
  </div>

  <button onClick={exportData}>Export CSV</button>
</div>
```

---

### ProfilePage.jsx

**Rôle** : Profil et paramètres du livreur.

**Fonctionnalités** :

**1. Informations personnelles**
- Nom, téléphone, adresse wallet
- Formulaire édition
- Update api.updateProfile(address, data)

**2. Statut de staking**
- Intègre StakingPanel
- Affiche montant staké
- Boutons stake/unstake

**3. Notes et avis**
- Intègre RatingDisplay
- Historique avis clients

**4. Historique des livraisons**
- Statistiques globales :
  - Total livraisons
  - Taux de succès
  - Temps moyen
  - Distance totale parcourue

**5. Paramètres**
- Langue
- Notifications
- Thème (light/dark)
- Sons activés/désactivés

**Layout** :
```javascript
<div className="profile-page">
  <Header title="Mon Profil" />

  <div className="profile-info">
    <input value={name} onChange={setName} />
    <input value={phone} onChange={setPhone} />
    <button onClick={saveProfile}>Sauvegarder</button>
  </div>

  <StakingPanel address={address} />

  <RatingDisplay address={address} />

  <div className="settings">
    <h3>Paramètres</h3>
    {/* Settings form */}
  </div>
</div>
```

---

## Services (src/services/)

### api.js

**Rôle** : Service pour les appels API backend.

**Configuration** :
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const authHeaders = (address) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${address}`
})
```

**Fonctions principales** :

**1. getAvailableOrders(params)**
- GET /api/deliverers/available?location=...
- Params : { location: { lat, lng } }
- Retourne : array of available orders

**2. acceptOrder(orderId)**
- POST /api/deliverers/orders/:id/accept
- Body : { delivererAddress }
- Retourne : { success, order, txHash }

**3. confirmPickup(orderId)**
- POST /api/orders/:id/confirm-pickup
- Body : { delivererAddress }
- Retourne : { success, txHash }

**4. confirmDelivery(orderId)**
- POST /api/orders/:id/confirm-delivery
- Body : { delivererAddress }
- Retourne : { success, txHash, earnings }

**5. updateGPSLocation(orderId, lat, lng)**
- POST /api/orders/:id/update-gps
- Body : { lat, lng }
- Retourne : { success }

**6. getEarnings(address, params)**
- GET /api/deliverers/:address/earnings?period=...
- Retourne : { today, week, month, total }

**7. getRating(address)**
- GET /api/deliverers/:address/rating
- Retourne : { rating, totalDeliveries, reviews[] }

**8. updateStatus(address, isOnline)**
- PUT /api/deliverers/:address/status
- Body : { isAvailable: isOnline }
- Retourne : { success }

**9. getDelivererOrders(address, filters)**
- GET /api/deliverers/:address/orders?status=...
- Retourne : array of deliveries

---

### blockchain.js

**Rôle** : Service pour les interactions Web3.

**Configuration** :
```javascript
import { ethers } from 'ethers'
import DoneOrderManager from '../../../contracts/artifacts/DoneOrderManager.json'
import DoneStaking from '../../../contracts/artifacts/DoneStaking.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const orderManagerAddress = import.meta.env.VITE_ORDER_MANAGER_ADDRESS
const stakingAddress = import.meta.env.VITE_STAKING_ADDRESS
```

**Fonctions principales** :

**1. connectWallet()**
- Request accounts depuis MetaMask
- Retourne : { address, signer }

**2. hasRole(role, address)**
- Call orderManager.hasRole(role, address)
- Retourne : boolean

**3. isStaked(address)**
- Call staking.isStaked(address)
- Retourne : boolean

**4. getStakeInfo(address)**
- Call staking.stakes(address)
- Retourne : { amount, isStaked }

**5. stake(amount)**
- Get signer
- Call staking.stakeAsDeliverer({ value: amount })
- Wait transaction
- Retourne : { txHash, receipt }

**6. unstake()**
- Get signer
- Call staking.unstake()
- Wait transaction
- Retourne : { txHash, amount }

**7. acceptOrderOnChain(orderId)**
- Get signer
- Call orderManager.assignDeliverer(orderId)
- Wait transaction
- Retourne : { txHash, receipt }

**8. confirmPickupOnChain(orderId)**
- Get signer
- Call orderManager.confirmPickup(orderId)
- Wait transaction
- Retourne : { txHash, receipt }

**9. confirmDeliveryOnChain(orderId)**
- Get signer
- Call orderManager.confirmDelivery(orderId)
- Parse events pour récupérer earnings
- Retourne : { txHash, earnings }

**10. getSlashingEvents(address)**
- Query events Slashed where deliverer = address
- Retourne : array of slashing events

**11. getEarningsEvents(address)**
- Query events PaymentSplit where deliverer = address
- Sum delivererAmount (20% de chaque commande)
- Retourne : { events[], totalEarnings }

---

### geolocation.js

**Rôle** : Service de géolocalisation et calculs GPS.

**Fonctions principales** :

**1. getCurrentPosition()**
- Utilise navigator.geolocation.getCurrentPosition()
- Retourne : Promise<{ lat, lng, accuracy }>
- Gestion erreurs (permission denied, timeout)

**2. watchPosition(callback)**
- Utilise navigator.geolocation.watchPosition()
- Appelle callback à chaque update position
- Retourne : watchId (pour cleanup)
- Options : enableHighAccuracy, timeout, maximumAge

**3. calculateRoute(origin, destination)**
- Utilise Google Maps DirectionsService
- Retourne : Promise<{ route, distance, duration }>
- Mode : DRIVING

**4. getDistance(lat1, lng1, lat2, lng2)**
- Formule Haversine pour distance entre 2 points
- Retourne : distance en km (number)

**5. isNearLocation(currentLat, currentLng, targetLat, targetLng, radius)**
- Calcule distance via getDistance()
- Compare avec radius (en km)
- Retourne : boolean (true si distance <= radius)

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

export const getDistance = (lat1, lng1, lat2, lng2) => {
  // Haversine formula
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

---

## Variables d'environnement

Fichier `.env.example` :

```
VITE_API_URL=http://localhost:3000/api
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_SOCKET_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## Intégration API Backend

Cette section décrit comment intégrer les API du backend Node.js/Express dans l'application livreur. Toutes les requêtes API sont gérées via le fichier `src/services/api.js`.

### Configuration de base

**URL de l'API** :
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

**Headers d'authentification** :
```javascript
const authHeaders = (address) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${address}`
})
```

### Endpoints API utilisés par le livreur

#### 1. Livreurs (Deliverers)

**POST /api/deliverers/register**
- **Description** : Enregistrer un nouveau livreur
- **Body** :
```javascript
{
  address: String,
  name: String,
  phone: String,
  vehicleType: String, // 'bike', 'scooter', 'car'
  location: { lat: Number, lng: Number }
}
```
- **Retourne** : `{ success: true, deliverer }`
- **Utilisation** : Lors de la première connexion wallet
- **Exemple** :
```javascript
const registerDeliverer = async (delivererData) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/register`, {
    method: 'POST',
    headers: authHeaders(delivererData.address),
    body: JSON.stringify(delivererData)
  })
  return response.json()
}
```

**GET /api/deliverers/:address**
- **Description** : Récupérer le profil du livreur avec statut staking
- **Retourne** : `{ deliverer, isStaked, stakedAmount }`
- **Utilisation** : `ProfilePage.jsx` et `ConnectWallet.jsx`
- **Exemple** :
```javascript
const getDeliverer = async (address) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}`)
  return response.json()
}
```

**GET /api/deliverers/available**
- **Description** : Récupérer les commandes disponibles à proximité
- **Paramètres** : `{ location: { lat, lng } }`
- **Retourne** : Array of available orders triées par distance
- **Utilisation** : `AvailableOrders.jsx`
- **Exemple** :
```javascript
const getAvailableOrders = async (location) => {
  const params = new URLSearchParams({
    lat: location.lat,
    lng: location.lng
  })
  const response = await fetch(`${API_BASE_URL}/deliverers/available?${params}`)
  return response.json()
}
```

**PUT /api/deliverers/:address/status**
- **Description** : Mettre à jour le statut de disponibilité du livreur
- **Body** : `{ isAvailable: Boolean }`
- **Retourne** : `{ success: true }`
- **Utilisation** : `HomePage.jsx` toggle online/offline
- **Exemple** :
```javascript
const updateStatus = async (address, isAvailable) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}/status`, {
    method: 'PUT',
    headers: authHeaders(address),
    body: JSON.stringify({ isAvailable })
  })
  return response.json()
}
```

**GET /api/deliverers/:address/orders**
- **Description** : Récupérer l'historique des livraisons du livreur
- **Paramètres** : `{ status: String }` (optionnel)
- **Retourne** : Array of orders
- **Utilisation** : `DeliveriesPage.jsx` et `ProfilePage.jsx`
- **Exemple** :
```javascript
const getDelivererOrders = async (address, status) => {
  const params = status ? `?status=${status}` : ''
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}/orders${params}`)
  return response.json()
}
```

**GET /api/deliverers/:address/earnings**
- **Description** : Récupérer les revenus du livreur par période
- **Paramètres** : `{ startDate, endDate, period }`
- **Retourne** : `{ totalEarnings, completedDeliveries, averageEarning }`
- **Utilisation** : `EarningsTracker.jsx` et `EarningsPage.jsx`
- **Exemple** :
```javascript
const getEarnings = async (address, period = 'week') => {
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}/earnings?period=${period}`)
  return response.json()
}
```

**GET /api/deliverers/:address/rating**
- **Description** : Récupérer la note et les avis du livreur
- **Retourne** : `{ rating, totalDeliveries, reviews[] }`
- **Utilisation** : `RatingDisplay.jsx`
- **Exemple** :
```javascript
const getRating = async (address) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}/rating`)
  return response.json()
}
```

#### 2. Staking

**POST /api/deliverers/stake**
- **Description** : Staker des MATIC pour devenir livreur actif
- **Body** : `{ address: String, amount: Number }` (amount en wei)
- **Retourne** : `{ success: true, txHash }`
- **Utilisation** : `StakingPanel.jsx`
- **Exemple** :
```javascript
const stakeAsDeliverer = async (address, amount) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/stake`, {
    method: 'POST',
    headers: authHeaders(address),
    body: JSON.stringify({ address, amount })
  })
  return response.json()
}
```

**POST /api/deliverers/unstake**
- **Description** : Retirer le staking (si aucune livraison active)
- **Body** : `{ address: String }`
- **Retourne** : `{ success: true, txHash }`
- **Utilisation** : `StakingPanel.jsx`
- **Exemple** :
```javascript
const unstake = async (address) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/unstake`, {
    method: 'POST',
    headers: authHeaders(address),
    body: JSON.stringify({ address })
  })
  return response.json()
}
```

#### 3. Commandes (Orders)

**POST /api/deliverers/orders/:id/accept**
- **Description** : Accepter une commande disponible
- **Body** : `{ delivererAddress: String }`
- **Retourne** : `{ success: true, order, txHash }`
- **Utilisation** : `AvailableOrders.jsx`
- **Exemple** :
```javascript
const acceptOrder = async (orderId, delivererAddress) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/orders/${orderId}/accept`, {
    method: 'POST',
    headers: authHeaders(delivererAddress),
    body: JSON.stringify({ delivererAddress })
  })
  return response.json()
}
```

**POST /api/orders/:id/confirm-pickup**
- **Description** : Confirmer la récupération de la commande au restaurant
- **Body** : `{ delivererAddress: String }`
- **Retourne** : `{ success: true, txHash }`
- **Utilisation** : `ActiveDelivery.jsx`
- **Exemple** :
```javascript
const confirmPickup = async (orderId, delivererAddress) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm-pickup`, {
    method: 'POST',
    headers: authHeaders(delivererAddress),
    body: JSON.stringify({ delivererAddress })
  })
  return response.json()
}
```

**POST /api/orders/:id/update-gps**
- **Description** : Mettre à jour la position GPS du livreur en temps réel
- **Body** : `{ lat: Number, lng: Number }`
- **Retourne** : `{ success: true }`
- **Utilisation** : `ActiveDelivery.jsx` - appelé toutes les 5 secondes
- **Exemple** :
```javascript
const updateGPSLocation = async (orderId, lat, lng) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/update-gps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  })
  return response.json()
}
```

**POST /api/orders/:id/confirm-delivery**
- **Description** : Confirmer la livraison au client (déclenche paiement automatique)
- **Body** : `{ delivererAddress: String }`
- **Retourne** : `{ success: true, txHash, earnings }`
- **Utilisation** : `ActiveDelivery.jsx`
- **Exemple** :
```javascript
const confirmDelivery = async (orderId, delivererAddress) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm-delivery`, {
    method: 'POST',
    headers: authHeaders(delivererAddress),
    body: JSON.stringify({ delivererAddress })
  })
  return response.json()
}
```

**GET /api/orders/:id**
- **Description** : Récupérer les détails d'une commande
- **Retourne** : Full order data avec restaurant, client, items, GPS tracking
- **Utilisation** : `ActiveDelivery.jsx` et `DeliveriesPage.jsx`
- **Exemple** :
```javascript
const getOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`)
  return response.json()
}
```

**GET /api/deliverers/:address/active-delivery**
- **Description** : Récupérer la livraison active en cours (s'il y en a une)
- **Retourne** : Order data ou null
- **Utilisation** : `HomePage.jsx` pour afficher la livraison active
- **Exemple** :
```javascript
const getActiveDelivery = async (address) => {
  const response = await fetch(`${API_BASE_URL}/deliverers/${address}/active-delivery`)
  return response.json()
}
```

### Gestion des erreurs

Toutes les fonctions API doivent gérer les erreurs :

```javascript
const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API Error')
    }

    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
```

### Socket.io pour temps réel

**Connexion Socket.io** :
```javascript
import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
const socket = io(SOCKET_URL)

// Rejoindre room deliverer
socket.emit('joinRoom', `deliverer_${delivererAddress}`)
```

**Events Socket.io écoutés** :

**1. orderReady**
- Émis quand un restaurant confirme qu'une commande est prête
- Payload : `{ orderId, restaurant, location, earnings }`
- Utilisation : `AvailableOrders.jsx` pour afficher nouvelle commande
```javascript
socket.on('orderReady', (order) => {
  setOrders(prev => [order, ...prev])
  playNotificationSound()
})
```

**2. orderAccepted**
- Émis quand un autre livreur accepte une commande
- Payload : `{ orderId }`
- Utilisation : `AvailableOrders.jsx` pour retirer commande de la liste
```javascript
socket.on('orderAccepted', (data) => {
  setOrders(prev => prev.filter(o => o.orderId !== data.orderId))
})
```

**3. clientLocationUpdate**
- Émis si le client met à jour son adresse de livraison
- Payload : `{ orderId, newAddress, location }`
- Utilisation : `ActiveDelivery.jsx`
```javascript
socket.on('clientLocationUpdate', (data) => {
  if (data.orderId === activeDelivery.orderId) {
    setClientLocation(data.location)
  }
})
```

### GPS Tracking automatique

Pendant une livraison active, le livreur doit envoyer sa position toutes les 5 secondes :

```javascript
// ActiveDelivery.jsx
useEffect(() => {
  if (!activeDelivery) return

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      // Envoyer position au backend
      updateGPSLocation(activeDelivery.orderId, latitude, longitude)

      // Mettre à jour position locale
      setCurrentLocation({ lat: latitude, lng: longitude })
    },
    (error) => console.error('GPS Error:', error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}, [activeDelivery])
```

### Variables d'environnement requises

Fichier `.env` :
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## Technologies utilisées

**Frontend** :
- React 18
- Vite (build tool)
- React Router DOM
- TailwindCSS (responsive web-first)

**Web3** :
- Ethers.js v6
- MetaMask integration

**Maps & GPS** :
- @react-google-maps/api
- Google Maps JavaScript API
- Geolocation API (browser native)

**Temps réel** :
- Socket.io-client

**Charts** :
- Chart.js ou Recharts

**UI Components** :
- Headless UI ou Shadcn UI
- React Icons

---

## Dépendances

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "ethers": "^6.4.0",
    "socket.io-client": "^4.6.0",
    "@react-google-maps/api": "^2.19.0",
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "vite-plugin-pwa": "^0.16.0",
    "tailwindcss": "^3.3.2",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

---

## Scripts NPM

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Démarrage

```bash
# Installation
cd frontend/deliverer
npm install

# Configuration
cp .env.example .env
# Éditer .env avec les bonnes adresses et Google Maps API key

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

---

## PWA pour mobile

L'application est configurée comme PWA (Progressive Web App) pour permettre :
- Installation sur écran d'accueil mobile
- Fonctionnement offline partiel
- Notifications push
- Accès GPS natif

Configuration PWA dans `vite.config.js` :
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
      }
    })
  ]
}
```

---

## Workflow utilisateur

1. Livreur se connecte avec MetaMask
2. Vérification du rôle DELIVERER_ROLE
3. Vérification du staking (minimum 0.1 MATIC)
4. Livreur passe en ligne (toggle status)
5. Voit les commandes disponibles à proximité
6. Accepte une commande (on-chain + off-chain)
7. Navigation vers restaurant avec GPS
8. Confirme récupération (on-chain)
9. GPS tracking démarre automatiquement
10. Navigation vers client
11. Confirme livraison (on-chain)
12. Reçoit paiement automatique (20% du total)
13. Consulte earnings et rating
