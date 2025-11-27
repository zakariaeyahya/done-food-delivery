# Dossier frontend/restaurant/

Application React pour les restaurants permettant de gérer les commandes, le menu et consulter les statistiques en temps réel.

## Structure

```
frontend/restaurant/
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── components/
│   │   ├── ConnectWallet.jsx
│   │   ├── OrdersQueue.jsx
│   │   ├── OrderCard.jsx
│   │   ├── MenuManager.jsx
│   │   ├── Analytics.jsx
│   │   └── EarningsChart.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── MenuPage.jsx
│   │   └── AnalyticsPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── blockchain.js
│   └── index.css
├── package.json
└── .env.example
```

## Fichiers

### App.jsx

**Rôle** : Composant racine de l'application restaurant.

**Fonctionnalités** :
- Configuration du router (React Router)
- Gestion de l'état global (Context API ou Redux)
- Authentification restaurant via wallet
- Layout avec navigation sidebar/header
- Gestion des notifications Socket.io

**Structure** :
```javascript
// Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { SocketProvider } from './contexts/SocketContext'

// State global
const [restaurant, setRestaurant] = useState(null)
const [isConnected, setIsConnected] = useState(false)

// Routes
<Routes>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/menu" element={<MenuPage />} />
  <Route path="/analytics" element={<AnalyticsPage />} />
</Routes>

// Sidebar navigation
// Socket.io connection pour notifications temps réel
```

---

## Components (src/components/)

### ConnectWallet.jsx

**Rôle** : Connexion au wallet MetaMask pour le restaurant.

**Fonctionnalités** :

**1. Connexion wallet**
- Détecte MetaMask installé
- Appelle window.ethereum.request({ method: 'eth_requestAccounts' })
- Récupère l'adresse du restaurant
- Vérifie le réseau (Polygon Mumbai)

**2. Vérification du rôle RESTAURANT**
- Call blockchain.hasRole(RESTAURANT_ROLE, address)
- Si pas de rôle : afficher message d'erreur
- Si rôle validé : fetch restaurant profile depuis API

**3. Affichage de l'adresse connectée**
- Format court : 0x1234...5678
- Bouton déconnexion
- Indicateur de réseau (Mumbai/Polygon)

**State** :
```javascript
const [address, setAddress] = useState(null)
const [isConnecting, setIsConnecting] = useState(false)
const [hasRole, setHasRole] = useState(false)
const [restaurant, setRestaurant] = useState(null)
```

**Méthodes** :
- connectWallet() : Connexion MetaMask
- checkRole() : Vérification RESTAURANT_ROLE
- fetchRestaurantProfile() : Récupération données restaurant
- disconnect() : Déconnexion

---

### OrdersQueue.jsx

**Rôle** : File d'attente des commandes en temps réel.

**Fonctionnalités** :

**1. Affichage des nouvelles commandes (Socket.io)**
- Écoute event 'orderCreated' depuis backend
- Ajoute nouvelle commande en haut de la liste
- Notification sonore + badge
- Animation d'entrée de la commande

**2. Accept/Reject order (optionnel)**
- Bouton "Accepter" : update status, notify client
- Bouton "Refuser" : cancel order, refund client
- Modal de confirmation

**3. Estimation du temps de préparation**
- Input pour saisir temps estimé (minutes)
- Calcule heure de disponibilité prévue
- Envoie estimation au client via API

**4. Bouton "Confirmer préparation"**
- Appelle api.confirmPreparation(orderId)
- Appelle blockchain.confirmPreparationOnChain(orderId)
- Met à jour status : CREATED → PREPARING
- Notifie livreurs disponibles

**5. Filtres par statut**
- Tabs : Toutes / Nouvelles / En préparation / Prêtes
- Filter orders array selon status

**State** :
```javascript
const [orders, setOrders] = useState([])
const [filter, setFilter] = useState('all')
const [loading, setLoading] = useState(false)
```

**Socket.io listeners** :
```javascript
useEffect(() => {
  socket.on('orderCreated', (order) => {
    // Ajouter order à la liste
    setOrders(prev => [order, ...prev])
    // Notification sonore
    playNotificationSound()
  })

  return () => socket.off('orderCreated')
}, [])
```

**Méthodes** :
- handleConfirmPreparation(orderId) : Confirmer préparation
- handleAcceptOrder(orderId) : Accepter commande
- handleRejectOrder(orderId) : Refuser commande
- filterOrders(status) : Filtrer par statut

---

### OrderCard.jsx

**Rôle** : Carte individuelle d'une commande.

**Props** :
```javascript
{
  order: {
    orderId: Number,
    client: { name, address },
    items: [{ name, quantity, price, image }],
    deliveryAddress: String,
    totalAmount: Number,
    status: String,
    createdAt: Date
  },
  onConfirmPreparation: Function
}
```

**Fonctionnalités** :

**1. Détails de la commande**
- Liste des items avec quantités
- Prix unitaire et total par item
- Total de la commande
- Images des plats (IPFS)

**2. Adresse de livraison**
- Affichage adresse complète
- Bouton "Voir sur carte" (Google Maps)

**3. Informations client**
- Nom du client
- Adresse wallet (format court)
- Numéro de téléphone (si disponible)

**4. Statut de la commande**
- Badge coloré selon status :
  - CREATED : jaune
  - PREPARING : orange
  - IN_DELIVERY : bleu
  - DELIVERED : vert

**5. Actions**
- Bouton "Confirmer préparation" si status = CREATED
- Timer : temps écoulé depuis création
- Temps de préparation estimé

**Render** :
```javascript
<div className="order-card">
  <div className="order-header">
    <span>Commande #{order.orderId}</span>
    <Badge status={order.status} />
  </div>

  <div className="order-items">
    {order.items.map(item => (
      <div key={item.name}>
        <img src={ipfsGateway + item.image} />
        <span>{item.quantity}x {item.name}</span>
        <span>{item.price} MATIC</span>
      </div>
    ))}
  </div>

  <div className="order-footer">
    <span>Total: {order.totalAmount} MATIC</span>
    <button onClick={() => onConfirmPreparation(order.orderId)}>
      Confirmer préparation
    </button>
  </div>
</div>
```

---

### MenuManager.jsx

**Rôle** : Gestion complète du menu restaurant.

**Fonctionnalités** :

**1. CRUD des items du menu**

**Create (Ajouter item)** :
- Modal formulaire : name, description, price, category, image
- Upload image vers IPFS via api.uploadImage(file)
- Call api.addMenuItem(restaurantId, itemData)
- Refresh liste menu

**Read (Lire menu)** :
- Fetch menu depuis api.getRestaurant(restaurantId)
- Affichage grid des items avec images IPFS
- Groupage par catégories

**Update (Modifier item)** :
- Modal pré-remplie avec données item
- Modification name, description, price, availability
- Upload nouvelle image si changée
- Call api.updateMenuItem(restaurantId, itemId, updates)

**Delete (Supprimer item)** :
- Confirmation modal
- Call api.deleteMenuItem(restaurantId, itemId)
- Retrait de la liste

**2. Upload d'images vers IPFS**
- Input file avec preview
- Upload vers IPFS via api.uploadImage()
- Récupère ipfsHash
- Stocke hash dans item.image

**3. Définition des prix**
- Input number pour price (MATIC)
- Validation : price > 0
- Conversion MATIC/USD affichée

**4. Activation/désactivation d'items**
- Toggle switch pour item.available
- Si available=false : grisé dans menu client
- Update en temps réel

**5. Catégorisation des plats**
- Dropdown categories : Entrées, Plats, Desserts, Boissons
- Filtre par catégorie
- Création de nouvelles catégories

**State** :
```javascript
const [menu, setMenu] = useState([])
const [selectedItem, setSelectedItem] = useState(null)
const [isModalOpen, setIsModalOpen] = useState(false)
const [uploading, setUploading] = useState(false)
```

**Méthodes** :
- handleAddItem(itemData) : Ajouter item
- handleUpdateItem(itemId, updates) : Modifier item
- handleDeleteItem(itemId) : Supprimer item
- handleImageUpload(file) : Upload image IPFS
- toggleAvailability(itemId) : Toggle disponibilité

---

### Analytics.jsx

**Rôle** : Statistiques et analytics du restaurant.

**Fonctionnalités** :

**1. Total des commandes (jour/semaine/mois)**
- Fetch analytics depuis api.getAnalytics(restaurantId, { startDate, endDate })
- Affichage cards avec icônes :
  - Commandes aujourd'hui : 15
  - Commandes cette semaine : 87
  - Commandes ce mois : 342
- Pourcentage de variation vs période précédente

**2. Graphique des revenus**
- Line chart (Chart.js ou Recharts)
- Axe X : dates (7 derniers jours / 30 derniers jours)
- Axe Y : revenus en MATIC
- Filtres : Jour / Semaine / Mois

**3. Plats les plus populaires**
- Bar chart horizontal
- Top 5 plats commandés
- Nombre de commandes par plat
- Revenue par plat

**4. Temps moyen de préparation**
- Calcul depuis MongoDB orders
- Moyenne temps entre CREATED et PREPARING
- Affichage en minutes
- Comparaison avec objectif

**5. Vue d'ensemble des notes**
- Rating moyen : 4.5/5 étoiles
- Nombre total d'avis
- Répartition des notes (1-5 étoiles)
- Derniers commentaires clients

**State** :
```javascript
const [analytics, setAnalytics] = useState({
  totalOrders: 0,
  revenue: 0,
  popularDishes: [],
  averagePreparationTime: 0,
  rating: 0
})
const [period, setPeriod] = useState('week') // day, week, month
```

**Fetch data** :
```javascript
useEffect(() => {
  const fetchAnalytics = async () => {
    const data = await api.getAnalytics(restaurantId, {
      startDate: getStartDate(period),
      endDate: new Date()
    })
    setAnalytics(data)
  }
  fetchAnalytics()
}, [period])
```

---

### EarningsChart.jsx

**Rôle** : Graphique des revenus et gains on-chain.

**Fonctionnalités** :

**1. Revenus quotidiens/hebdomadaires**
- Line chart revenus dans le temps
- Data depuis blockchain events PaymentSplit
- Filter events où restaurant = restaurantAddress
- Calcul : 70% de chaque foodPrice

**2. Retraits en attente**
- Total MATIC disponible pour retrait
- Fetch balance du contrat PaymentSplitter
- Bouton "Retirer" : call blockchain.withdraw()

**3. Montants retirés**
- Historique des retraits
- Liste transactions avec dates et montants
- Links vers PolygonScan

**4. Historique des transactions on-chain**
- Table avec colonnes :
  - Date
  - Commande ID
  - Montant reçu (70%)
  - Transaction hash
- Pagination

**State** :
```javascript
const [earnings, setEarnings] = useState({
  daily: [],
  weekly: [],
  pending: 0,
  withdrawn: 0,
  transactions: []
})
```

**Fetch blockchain data** :
```javascript
useEffect(() => {
  const fetchEarnings = async () => {
    // Fetch PaymentSplit events
    const events = await blockchain.getPaymentSplitEvents(restaurantAddress)

    // Calculer earnings
    const totalEarnings = events.reduce((sum, event) => {
      return sum + parseFloat(event.args.restaurantAmount)
    }, 0)

    // Fetch pending balance
    const pending = await blockchain.getPendingBalance(restaurantAddress)

    setEarnings({
      daily: groupByDay(events),
      weekly: groupByWeek(events),
      pending,
      transactions: events
    })
  }
  fetchEarnings()
}, [])
```

**Méthodes** :
- handleWithdraw() : Retirer fonds vers wallet
- groupByDay(events) : Grouper revenus par jour
- groupByWeek(events) : Grouper revenus par semaine

---

## Pages (src/pages/)

### DashboardPage.jsx

**Rôle** : Tableau de bord principal du restaurant.

**Fonctionnalités** :

**1. Vue d'ensemble des commandes du jour**
- Nombre de commandes aujourd'hui
- Revenus du jour
- Temps moyen de préparation

**2. Statistiques rapides**
- Cards avec KPIs :
  - Commandes en attente : 3
  - Commandes en préparation : 5
  - Commandes livrées aujourd'hui : 12
  - Revenue aujourd'hui : 150 MATIC

**3. Commandes en attente**
- Intègre OrdersQueue avec filter='CREATED'
- Notifications temps réel

**4. Revenus du jour**
- Mini graph des revenus (dernières 24h)
- Comparaison avec hier

**5. Accès rapide aux autres pages**
- Boutons vers Orders, Menu, Analytics

**Layout** :
```javascript
<div className="dashboard">
  <Header restaurant={restaurant} />

  <div className="stats-grid">
    <StatCard title="Commandes aujourd'hui" value={todayOrders} />
    <StatCard title="Revenue" value={todayRevenue} />
    <StatCard title="Rating" value={rating} />
  </div>

  <div className="content-grid">
    <OrdersQueue filter="pending" />
    <EarningsChart period="day" />
  </div>
</div>
```

---

### OrdersPage.jsx

**Rôle** : Gestion complète des commandes.

**Fonctionnalités** :

**1. Liste de toutes les commandes**
- Fetch api.getRestaurantOrders(restaurantId)
- Table avec colonnes :
  - Order ID
  - Client
  - Items
  - Total
  - Status
  - Date
  - Actions

**2. Filtres par statut et date**
- Dropdown statut : Toutes / CREATED / PREPARING / IN_DELIVERY / DELIVERED
- Date range picker : startDate, endDate
- Search bar : recherche par order ID ou client

**3. Actions sur les commandes**
- Confirmer préparation (si CREATED)
- Voir détails
- Export CSV

**4. Détails de chaque commande**
- Modal avec full order details
- Items list
- Client info
- Deliverer info (si assigné)
- Timeline des statuts
- Transaction hash

**State** :
```javascript
const [orders, setOrders] = useState([])
const [filter, setFilter] = useState({ status: 'all', startDate: null, endDate: null })
const [selectedOrder, setSelectedOrder] = useState(null)
```

---

### MenuPage.jsx

**Rôle** : Gestion du menu restaurant.

**Fonctionnalités** :

**1. Intègre MenuManager**
- Composant MenuManager en mode full-page
- Tous les CRUD operations

**2. Interface complète de gestion**
- Sidebar avec catégories
- Grid des items avec images
- Bouton "Ajouter item" en header

**3. Prévisualisation du menu client**
- Toggle "Mode aperçu"
- Affiche menu tel que vu par clients
- Avec prices et disponibilités

**Layout** :
```javascript
<div className="menu-page">
  <Header title="Gestion du Menu" />

  <div className="menu-actions">
    <button onClick={openAddItemModal}>Ajouter un plat</button>
    <button onClick={togglePreview}>Aperçu client</button>
  </div>

  <MenuManager
    restaurantId={restaurantId}
    onUpdate={handleMenuUpdate}
  />
</div>
```

---

### AnalyticsPage.jsx

**Rôle** : Analytics détaillées du restaurant.

**Fonctionnalités** :

**1. Intègre Analytics et EarningsChart**
- Section Analytics en haut
- Section EarningsChart en bas

**2. Graphiques détaillés**
- Multiple charts :
  - Revenue over time
  - Orders over time
  - Popular dishes
  - Peak hours
  - Customer ratings

**3. Export de données**
- Bouton "Export CSV"
- Export analytics data
- Export transactions history

**4. Rapports personnalisés**
- Date range selector
- Filtres multiples
- Comparaison périodes

**Layout** :
```javascript
<div className="analytics-page">
  <Header title="Statistiques & Revenus" />

  <div className="filters">
    <DateRangePicker onChange={setDateRange} />
    <PeriodSelector value={period} onChange={setPeriod} />
  </div>

  <Analytics restaurantId={restaurantId} period={period} />

  <EarningsChart restaurantId={restaurantId} period={period} />

  <button onClick={exportData}>Export CSV</button>
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

**1. getRestaurant(restaurantId)**
- GET /api/restaurants/:id
- Retourne : restaurant data avec menu

**2. getOrders(restaurantId, filters)**
- GET /api/restaurants/:id/orders?status=...&startDate=...
- Retourne : array of orders

**3. confirmPreparation(orderId)**
- POST /api/orders/:id/confirm-preparation
- Body : { restaurantAddress }
- Retourne : { success, txHash }

**4. updateMenu(restaurantId, menu)**
- PUT /api/restaurants/:id/menu
- Body : { menu: [...] }
- Retourne : { success, menu }

**5. addMenuItem(restaurantId, item)**
- POST /api/restaurants/:id/menu/item
- Body : { name, description, price, image, category }
- Retourne : { success, item }

**6. updateMenuItem(restaurantId, itemId, updates)**
- PUT /api/restaurants/:id/menu/item/:itemId
- Body : { ...updates }
- Retourne : { success, item }

**7. deleteMenuItem(restaurantId, itemId)**
- DELETE /api/restaurants/:id/menu/item/:itemId
- Retourne : { success }

**8. getAnalytics(restaurantId, params)**
- GET /api/restaurants/:id/analytics?startDate=...&endDate=...
- Retourne : { totalOrders, revenue, popularDishes, rating }

**9. uploadImage(file)**
- POST /api/upload/image
- FormData avec file
- Retourne : { ipfsHash, url }

---

### blockchain.js

**Rôle** : Service pour les interactions Web3.

**Configuration** :
```javascript
import { ethers } from 'ethers'
import DoneOrderManager from '../../../contracts/artifacts/DoneOrderManager.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const orderManagerAddress = import.meta.env.VITE_ORDER_MANAGER_ADDRESS
```

**Fonctions principales** :

**1. connectWallet()**
- Request accounts depuis MetaMask
- Retourne : { address, signer }

**2. hasRole(role, address)**
- Call orderManager.hasRole(role, address)
- Retourne : boolean

**3. confirmPreparationOnChain(orderId)**
- Get signer
- Call orderManager.confirmPreparation(orderId)
- Wait transaction
- Retourne : { txHash, receipt }

**4. getRestaurantOrders(restaurantAddress)**
- Query events OrderCreated where restaurant = restaurantAddress
- Parse events pour récupérer orderIds
- Pour chaque orderId : call orderManager.orders(orderId)
- Retourne : array of orders

**5. getEarningsOnChain(restaurantAddress)**
- Query events PaymentSplit where restaurant = restaurantAddress
- Sum restaurantAmount (70% de chaque commande)
- Retourne : totalEarnings

**6. getPaymentSplitEvents(restaurantAddress)**
- Filter events PaymentSplit
- Retourne : array of events avec { orderId, restaurantAmount, txHash, blockNumber }

**7. getPendingBalance(restaurantAddress)**
- Call paymentSplitter.balances(restaurantAddress)
- Retourne : pending balance en MATIC

**8. withdraw()**
- Get signer
- Call paymentSplitter.withdraw()
- Wait transaction
- Retourne : { txHash, amount }

---

## Variables d'environnement

Fichier `.env.example` :

```
VITE_API_URL=http://localhost:3000/api
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...
VITE_SOCKET_URL=http://localhost:3000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## Technologies utilisées

**Frontend** :
- React 18
- Vite (build tool)
- React Router DOM
- TailwindCSS

**Web3** :
- Ethers.js v6
- MetaMask integration

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
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
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
cd frontend/restaurant
npm install

# Configuration
cp .env.example .env
# Éditer .env avec les bonnes adresses de contrats

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

---

## Workflow utilisateur

1. Restaurant se connecte avec MetaMask
2. Vérification du rôle RESTAURANT_ROLE
3. Accès au dashboard avec commandes en temps réel
4. Nouvelle commande arrive via Socket.io
5. Restaurant confirme préparation (on-chain + off-chain)
6. Livreurs sont notifiés
7. Restaurant suit analytics et revenus
8. Gestion du menu via MenuManager
