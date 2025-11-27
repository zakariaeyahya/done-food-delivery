# Dossier frontend/client/

Application React pour les clients permettant de commander des repas, suivre les livraisons en temps réel et gérer leur compte avec tokens de fidélité.

## Structure

```
frontend/client/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── components/
│   │   ├── ConnectWallet.jsx
│   │   ├── RestaurantList.jsx
│   │   ├── RestaurantCard.jsx
│   │   ├── MenuItems.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderTracking.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── TokenBalance.jsx
│   │   └── DisputeModal.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── RestaurantPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── TrackingPage.jsx
│   │   └── ProfilePage.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── blockchain.js
│   │   └── ipfs.js
│   ├── utils/
│   │   ├── web3.js
│   │   └── formatters.js
│   └── styles/
│       └── tailwind.css
├── package.json
└── .env.example
```

## Fichiers

### App.jsx

**Rôle** : Composant racine de l'application client.

**Fonctionnalités** :
- Configuration du router (React Router)
- Gestion de l'état global (Context API)
- Authentification client via wallet
- Layout responsive avec header et footer
- Gestion du panier global
- Connexion Socket.io pour notifications temps réel

**Structure** :
```javascript
// Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { CartProvider } from './contexts/CartProvider'
import { SocketProvider } from './contexts/SocketContext'

// State global
const [wallet, setWallet] = useState(null)
const [cart, setCart] = useState([])
const [activeOrder, setActiveOrder] = useState(null)

// Routes
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/restaurant/:id" element={<RestaurantPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/tracking/:orderId" element={<TrackingPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Routes>

// Header avec ConnectWallet et Cart icon
// Socket.io pour order status updates
```

---

## Components (src/components/)

### ConnectWallet.jsx

**Rôle** : Connexion au wallet MetaMask pour le client.

**Fonctionnalités** :

**1. Détection MetaMask**
- Vérifie window.ethereum disponible
- Affiche message si MetaMask pas installé
- Lien vers installation MetaMask

**2. Connexion wallet**
- Appelle window.ethereum.request({ method: 'eth_requestAccounts' })
- Récupère address du client
- Vérifie réseau Polygon Mumbai
- Switch réseau si incorrect

**3. Affichage de l'adresse connectée**
- Format court : 0x1234...5678
- Bouton déconnexion
- Indicateur réseau
- Solde MATIC affiché

**4. Gestion erreurs**
- User rejected request
- Network not supported
- MetaMask locked

**State** :
```javascript
const [address, setAddress] = useState(null)
const [isConnecting, setIsConnecting] = useState(false)
const [balance, setBalance] = useState(0)
const [network, setNetwork] = useState(null)
```

**Méthodes** :
- connectWallet() : Connexion MetaMask
- switchNetwork() : Changer réseau vers Polygon Mumbai
- disconnect() : Déconnexion
- fetchBalance() : Récupérer balance MATIC

---

### RestaurantList.jsx

**Rôle** : Affichage de la liste des restaurants disponibles.

**Fonctionnalités** :

**1. Affiche liste restaurants**
- Fetch api.getRestaurants()
- Grid layout responsive
- Affiche RestaurantCard pour chaque restaurant
- Skeleton loader pendant chargement

**2. Filtres (cuisine type, prix, rating)**
- Dropdown type de cuisine : Italienne, Japonaise, Française, etc.
- Range slider prix : min-max
- Filter rating minimum : 4+ étoiles
- Filtres cumulatifs

**3. Fetch depuis API backend**
- GET /api/restaurants
- Params : { cuisine, priceRange, minRating }
- Auto-refresh toutes les 30 secondes

**State** :
```javascript
const [restaurants, setRestaurants] = useState([])
const [filters, setFilters] = useState({
  cuisine: 'all',
  priceRange: [0, 100],
  minRating: 0
})
const [loading, setLoading] = useState(false)
```

**Méthodes** :
- fetchRestaurants() : Récupérer restaurants
- applyFilters(filters) : Appliquer filtres
- handleFilterChange(field, value) : Changer filtre

---

### RestaurantCard.jsx

**Rôle** : Carte individuelle d'un restaurant.

**Props** :
```javascript
{
  restaurant: {
    id: String,
    name: String,
    cuisine: String,
    description: String,
    images: [String], // IPFS hashes
    rating: Number,
    totalOrders: Number,
    location: { address, lat, lng }
  }
}
```

**Fonctionnalités** :

**1. Affichage informations**
- Nom du restaurant
- Type de cuisine
- Description courte
- Image principale (IPFS)

**2. Note moyenne et nombre d'avis**
- Étoiles visuelles (5 max)
- Nombre total d'avis
- Badge "Populaire" si totalOrders > 100

**3. Temps de livraison estimé**
- Calcul basé sur distance (si geolocation disponible)
- Affiche "20-30 min" format

**4. Prix moyen**
- Calcul depuis menu items
- Affiche "€€" ou "€€€" indicateur

**5. Bouton "Voir le menu"**
- Navigate vers /restaurant/:id
- Animation hover

**Render** :
```javascript
<div className="restaurant-card">
  <img src={ipfsGateway + restaurant.images[0]} alt={restaurant.name} />

  <div className="card-content">
    <h3>{restaurant.name}</h3>
    <span className="cuisine">{restaurant.cuisine}</span>

    <div className="rating">
      <Stars rating={restaurant.rating} />
      <span>({restaurant.totalOrders} avis)</span>
    </div>

    <div className="card-footer">
      <span className="delivery-time">20-30 min</span>
      <button onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
        Voir le menu
      </button>
    </div>
  </div>
</div>
```

---

### MenuItems.jsx

**Rôle** : Affichage du menu d'un restaurant.

**Props** :
```javascript
{
  restaurantId: String,
  onAddToCart: Function
}
```

**Fonctionnalités** :

**1. Affiche menu avec images (IPFS)**
- Fetch menu depuis api.getRestaurant(restaurantId)
- Grid des plats avec images IPFS
- Lazy loading des images

**2. Add to cart**
- Bouton "Ajouter au panier" par plat
- Modale quantité si clic
- Appelle onAddToCart(item, quantity)
- Animation ajout panier

**3. Prix en ETH/MATIC + EUR**
- Affiche prix en MATIC
- Conversion EUR via price oracle
- Toggle affichage MATIC/EUR

**4. Filtres par catégorie**
- Tabs : Entrées, Plats, Desserts, Boissons
- Filter menu selon category

**State** :
```javascript
const [menu, setMenu] = useState([])
const [selectedCategory, setSelectedCategory] = useState('all')
const [selectedItem, setSelectedItem] = useState(null)
const [quantity, setQuantity] = useState(1)
```

**Méthodes** :
- fetchMenu() : Récupérer menu restaurant
- handleAddToCart(item, quantity) : Ajouter item au panier
- filterByCategory(category) : Filtrer par catégorie

**Render** :
```javascript
<div className="menu-items">
  <div className="category-tabs">
    {categories.map(cat => (
      <button onClick={() => setSelectedCategory(cat)}>
        {cat}
      </button>
    ))}
  </div>

  <div className="items-grid">
    {filteredMenu.map(item => (
      <div key={item.name} className="menu-item">
        <img src={ipfsGateway + item.image} alt={item.name} />
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <div className="price">
          <span>{item.price} MATIC</span>
          <span>({convertToEUR(item.price)} EUR)</span>
        </div>
        <button onClick={() => handleAddToCart(item, 1)}>
          Ajouter au panier
        </button>
      </div>
    ))}
  </div>
</div>
```

---

### Cart.jsx

**Rôle** : Panier d'achat du client.

**Fonctionnalités** :

**1. Liste items**
- Affiche tous items dans panier
- Image, nom, quantité, prix unitaire
- Prix total par item (price * quantity)

**2. Calcul total (food + delivery + platform fee)**
- foodPrice = sum(item.price * item.quantity)
- deliveryFee = fixe (ex: 3 MATIC) ou basé sur distance
- platformFee = foodPrice * 0.1 (10%)
- totalAmount = foodPrice + deliveryFee + platformFee
- Affichage détaillé de chaque composante

**3. Remove items**
- Bouton "X" par item
- Confirmation modal avant suppression
- Update cart state

**4. Modification quantités**
- Boutons +/- par item
- Input direct quantité
- Minimum 1, maximum 10

**State** :
```javascript
const [cart, setCart] = useState([])
const [deliveryFee, setDeliveryFee] = useState(3)
```

**Méthodes** :
- removeItem(itemId) : Supprimer item
- updateQuantity(itemId, quantity) : Modifier quantité
- calculateTotals() : Calculer tous totaux
- clearCart() : Vider panier

**Render** :
```javascript
<div className="cart">
  <h2>Panier ({cart.length} items)</h2>

  {cart.map(item => (
    <div key={item.id} className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="item-details">
        <span>{item.name}</span>
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        </div>
      </div>
      <span>{item.price * item.quantity} MATIC</span>
      <button onClick={() => removeItem(item.id)}>X</button>
    </div>
  ))}

  <div className="cart-totals">
    <div><span>Nourriture:</span> <span>{foodPrice} MATIC</span></div>
    <div><span>Livraison:</span> <span>{deliveryFee} MATIC</span></div>
    <div><span>Frais plateforme (10%):</span> <span>{platformFee} MATIC</span></div>
    <div className="total"><span>Total:</span> <span>{totalAmount} MATIC</span></div>
  </div>

  <button onClick={() => navigate('/checkout')}>
    Passer commande
  </button>
</div>
```

---

### Checkout.jsx

**Rôle** : Page de paiement et validation de commande.

**Fonctionnalités** :

**1. Confirm address**
- Input adresse de livraison
- Autocomplete Google Places
- Sauvegarde adresses favorites
- Validation adresse obligatoire

**2. Approve payment (MetaMask)**
- Calcule totalAmount en wei
- Appelle blockchain.createOrder()
- Popup MetaMask pour approval
- Gestion rejection user

**3. Call createOrder() via backend**
- Upload items vers IPFS via ipfs.uploadJSON()
- Récupère ipfsHash
- POST /api/orders/create avec :
  - restaurantId
  - items[] (avec ipfsHash)
  - deliveryAddress
  - clientAddress
  - foodPrice, deliveryFee, platformFee
- Backend crée order on-chain

**4. Show transaction progress**
- Étapes visuelles :
  1. Préparation commande
  2. Upload IPFS
  3. Confirmation MetaMask
  4. Transaction blockchain
  5. Commande créée
- Loader avec progression
- Redirect vers TrackingPage après succès

**State** :
```javascript
const [deliveryAddress, setDeliveryAddress] = useState('')
const [step, setStep] = useState('address') // address, payment, processing, success
const [txHash, setTxHash] = useState(null)
const [orderId, setOrderId] = useState(null)
const [error, setError] = useState(null)
```

**Méthodes** :
- handleAddressSubmit() : Valider adresse
- handlePayment() : Effectuer paiement
- createOrder() : Créer commande
- uploadToIPFS() : Upload items IPFS

---

### OrderTracking.jsx

**Rôle** : Suivi en temps réel d'une commande.

**Props** :
```javascript
{
  orderId: Number
}
```

**Fonctionnalités** :

**1. Real-time status updates**
- Socket.io listener 'orderStatusUpdate'
- Affiche status actuel : CREATED, PREPARING, IN_DELIVERY, DELIVERED
- Timeline visuelle des étapes
- Timestamps pour chaque étape

**2. GPS map (Google Maps API)**
- Intègre Google Maps
- Markers : restaurant, client, livreur
- Polyline route livreur → client
- Zoom automatique sur zone
- Update position livreur temps réel (toutes les 5 sec)

**3. Deliverer info**
- Nom du livreur
- Photo (si disponible)
- Rating livreur
- Type de véhicule
- Bouton "Appeler livreur"

**4. ETA countdown**
- Temps estimé d'arrivée calculé
- Countdown en minutes
- Update automatique basé sur distance restante
- Affichage "Arrivé" si distance < 100m

**5. Confirm delivery button**
- Visible quand status = IN_DELIVERY et livreur proche (< 100m)
- Appelle api.confirmDelivery(orderId)
- Appelle blockchain.confirmDeliveryOnChain(orderId)
- Trigger payment split automatique
- Affiche tokens DONE gagnés
- Redirect vers OrderHistory

**State** :
```javascript
const [order, setOrder] = useState(null)
const [delivererLocation, setDelivererLocation] = useState(null)
const [eta, setEta] = useState(null)
const [isNearby, setIsNearby] = useState(false)
```

**Socket.io listeners** :
```javascript
useEffect(() => {
  socket.on('orderStatusUpdate', (data) => {
    if (data.orderId === orderId) {
      setOrder(prev => ({ ...prev, status: data.status }))
    }
  })

  socket.on('delivererLocationUpdate', (data) => {
    if (data.orderId === orderId) {
      setDelivererLocation(data.location)
      calculateETA(data.location)
    }
  })

  return () => {
    socket.off('orderStatusUpdate')
    socket.off('delivererLocationUpdate')
  }
}, [orderId])
```

**Méthodes** :
- fetchOrder() : Récupérer order details
- calculateETA(location) : Calculer temps estimé
- handleConfirmDelivery() : Confirmer livraison

---

### OrderHistory.jsx

**Rôle** : Historique des commandes passées.

**Fonctionnalités** :

**1. List past orders**
- Fetch api.getOrdersByClient(address)
- Table avec colonnes :
  - Order ID
  - Restaurant
  - Date
  - Total
  - Status
  - Actions
- Pagination (10 orders par page)

**2. Reorder button**
- Bouton "Commander à nouveau" par order
- Récupère items de l'ancienne commande
- Ajoute au panier
- Redirect vers checkout

**3. Leave review**
- Modal formulaire avis
- Rating 1-5 étoiles
- Commentaire texte
- Submit review via api.submitReview(orderId, rating, comment)

**4. Download receipt (IPFS proof)**
- Bouton "Télécharger reçu"
- Fetch order details depuis IPFS via ipfsHash
- Génère PDF ou affiche JSON
- Proof on-chain avec txHash

**State** :
```javascript
const [orders, setOrders] = useState([])
const [selectedOrder, setSelectedOrder] = useState(null)
const [reviewModal, setReviewModal] = useState(false)
const [rating, setRating] = useState(0)
const [comment, setComment] = useState('')
```

**Méthodes** :
- fetchOrders() : Récupérer historique
- handleReorder(order) : Commander à nouveau
- handleReview(orderId) : Laisser avis
- downloadReceipt(order) : Télécharger reçu

---

### TokenBalance.jsx

**Rôle** : Affichage et gestion des tokens DONE de fidélité.

**Fonctionnalités** :

**1. Display DONE tokens**
- Fetch blockchain.getTokenBalance(address)
- Affiche balance en DONE tokens
- Conversion en EUR (1 DONE = 1€ de réduction)
- Icône token personnalisée

**2. Use tokens for discount**
- Input "Utiliser X tokens"
- Validation : balance >= X
- Applique réduction sur commande
- Max réduction = 50% du total

**3. Token transaction history**
- Fetch blockchain events Transfer where to/from = address
- Liste transactions :
  - Date
  - Type (Earned / Used)
  - Amount
  - Order ID
  - Transaction hash
- Filtres par type et date

**4. Taux de récompense**
- Info : "Gagnez 1 DONE token pour 10€ dépensés"
- Progress bar vers prochain token
- Total tokens gagnés lifetime

**State** :
```javascript
const [balance, setBalance] = useState(0)
const [transactions, setTransactions] = useState([])
const [tokensToUse, setTokensToUse] = useState(0)
```

**Méthodes** :
- fetchBalance() : Récupérer balance
- fetchTransactions() : Récupérer historique
- applyDiscount(tokens) : Appliquer réduction

---

### DisputeModal.jsx

**Rôle** : Modal pour ouvrir un litige sur une commande.

**Props** :
```javascript
{
  orderId: Number,
  onClose: Function,
  onSubmit: Function
}
```

**Fonctionnalités** :

**1. Open dispute form**
- Textarea raison du litige
- Dropdown type de problème :
  - Commande non reçue
  - Qualité insatisfaisante
  - Items manquants
  - Mauvaise livraison
  - Autre

**2. Upload proof images (IPFS)**
- Input file multiple images
- Preview images avant upload
- Upload vers IPFS via ipfs.uploadImage()
- Récupère ipfsHashes array

**3. Submit dispute**
- Valide form (raison non vide)
- Upload preuves vers IPFS
- Appelle api.openDispute(orderId, { reason, evidence: ipfsHashes })
- Appelle blockchain.openDisputeOnChain(orderId)
- Notification arbitrator
- Affiche message succès
- Ferme modal

**State** :
```javascript
const [reason, setReason] = useState('')
const [problemType, setProblemType] = useState('')
const [proofImages, setProofImages] = useState([])
const [uploading, setUploading] = useState(false)
const [submitting, setSubmitting] = useState(false)
```

**Méthodes** :
- handleImageUpload(files) : Upload images
- handleSubmit() : Soumettre litige

**Render** :
```javascript
<Modal isOpen={true} onClose={onClose}>
  <h2>Ouvrir un litige</h2>

  <select value={problemType} onChange={e => setProblemType(e.target.value)}>
    <option value="">Type de problème</option>
    <option value="not_received">Commande non reçue</option>
    <option value="quality">Qualité insatisfaisante</option>
    <option value="missing_items">Items manquants</option>
    <option value="delivery_issue">Problème de livraison</option>
    <option value="other">Autre</option>
  </select>

  <textarea
    value={reason}
    onChange={e => setReason(e.target.value)}
    placeholder="Décrivez le problème..."
  />

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageUpload}
  />

  <div className="proof-previews">
    {proofImages.map((img, i) => (
      <img key={i} src={URL.createObjectURL(img)} alt={`Preuve ${i+1}`} />
    ))}
  </div>

  <button onClick={handleSubmit} disabled={submitting || !reason}>
    {submitting ? 'Envoi...' : 'Soumettre le litige'}
  </button>
</Modal>
```

---

## Pages (src/pages/)

### HomePage.jsx

**Rôle** : Page d'accueil de l'application client.

**Fonctionnalités** :

**1. Hero section avec recherche**
- Input recherche restaurant
- Autocomplete suggestions
- Bouton "Chercher"

**2. Liste des restaurants populaires**
- Intègre RestaurantList avec limit=6
- Filtré par totalOrders > 50
- Bouton "Voir tous les restaurants"

**3. Catégories de cuisine**
- Cards cliquables par cuisine :
  - Italienne
  - Japonaise
  - Française
  - Mexicaine
  - Américaine
- Redirect vers restaurants filtrés

**4. Offres spéciales**
- Section promotions (si disponible)
- Badges "Nouveau restaurant"

**Layout** :
```javascript
<div className="home-page">
  <section className="hero">
    <h1>DONE Food Delivery</h1>
    <input placeholder="Rechercher un restaurant..." />
  </section>

  <section className="categories">
    <h2>Catégories</h2>
    <div className="categories-grid">
      {cuisineTypes.map(type => (
        <div onClick={() => navigate(`/restaurants?cuisine=${type}`)}>
          {type}
        </div>
      ))}
    </div>
  </section>

  <section className="popular">
    <h2>Restaurants populaires</h2>
    <RestaurantList limit={6} sortBy="popular" />
  </section>
</div>
```

---

### RestaurantPage.jsx

**Rôle** : Page de détail d'un restaurant avec menu complet.

**Params** :
- restaurantId (from URL)

**Fonctionnalités** :

**1. Informations complètes du restaurant**
- Nom, description
- Type de cuisine
- Adresse
- Horaires d'ouverture
- Rating et nombre d'avis

**2. Menu complet avec MenuItems**
- Intègre MenuItems component
- Tous les plats du restaurant

**3. Avis et notes**
- Liste des avis clients
- Filtres par rating
- Pagination

**4. Photos du restaurant**
- Galerie images IPFS
- Lightbox au clic

**Layout** :
```javascript
<div className="restaurant-page">
  <div className="restaurant-header">
    <img src={restaurant.images[0]} alt={restaurant.name} />
    <div className="info">
      <h1>{restaurant.name}</h1>
      <p>{restaurant.description}</p>
      <div className="rating">
        <Stars rating={restaurant.rating} />
        <span>({restaurant.totalOrders} avis)</span>
      </div>
    </div>
  </div>

  <MenuItems
    restaurantId={restaurantId}
    onAddToCart={handleAddToCart}
  />

  <section className="reviews">
    <h2>Avis clients</h2>
    {reviews.map(review => (
      <div className="review">
        <Stars rating={review.rating} />
        <p>{review.comment}</p>
        <span>{review.clientName} - {formatDate(review.date)}</span>
      </div>
    ))}
  </section>
</div>
```

---

### CheckoutPage.jsx

**Rôle** : Page de checkout complète.

**Fonctionnalités** :
- Intègre Checkout component
- Gestion flux paiement
- Redirect vers TrackingPage après succès

---

### TrackingPage.jsx

**Rôle** : Page dédiée au suivi de commande.

**Params** :
- orderId (from URL)

**Fonctionnalités** :
- Intègre OrderTracking component
- Vue full-screen avec map
- Notifications temps réel

---

### ProfilePage.jsx

**Rôle** : Page de profil utilisateur.

**Fonctionnalités** :

**1. Informations personnelles**
- Nom, email, téléphone
- Adresse wallet
- Formulaire édition

**2. Historique des commandes**
- Intègre OrderHistory
- Filtres avancés

**3. Solde de tokens DONE**
- Intègre TokenBalance
- Stats fidélité

**4. Paramètres du compte**
- Langue
- Notifications
- Thème

**5. Déconnexion**
- Bouton déconnexion wallet
- Clear local state

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

**1. getRestaurants(params)**
- GET /api/restaurants?cuisine=...&priceRange=...
- Retourne : array of restaurants

**2. getRestaurant(id)**
- GET /api/restaurants/:id
- Retourne : restaurant with menu

**3. createOrder(orderData)**
- POST /api/orders/create
- Body : { restaurantId, items, deliveryAddress, clientAddress, foodPrice, deliveryFee }
- Retourne : { orderId, txHash, ipfsHash }

**4. getOrder(id)**
- GET /api/orders/:id
- Retourne : full order data (on-chain + off-chain)

**5. getOrdersByClient(address)**
- GET /api/orders/client/:address
- Retourne : array of orders

**6. confirmDelivery(orderId)**
- POST /api/orders/:id/confirm-delivery
- Body : { clientAddress }
- Retourne : { txHash, tokensEarned }

**7. openDispute(orderId, data)**
- POST /api/orders/:id/dispute
- Body : { reason, evidence }
- Retourne : { txHash, disputeId }

**8. submitReview(orderId, rating, comment)**
- POST /api/orders/:id/review
- Body : { rating, comment }
- Retourne : { success }

---

### blockchain.js

**Rôle** : Service pour les interactions Web3 directes.

**Configuration** :
```javascript
import { ethers } from 'ethers'
import DoneOrderManager from '../../../contracts/artifacts/DoneOrderManager.json'
import DoneToken from '../../../contracts/artifacts/DoneToken.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const orderManagerAddress = import.meta.env.VITE_ORDER_MANAGER_ADDRESS
const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS
```

**Fonctions principales** :

**1. connectWallet()**
- Request accounts depuis MetaMask
- Retourne : { address, signer }

**2. getBalance(address)**
- Call provider.getBalance(address)
- Retourne : balance en wei, converti en ether

**3. getTokenBalance(address)**
- Call token.balanceOf(address)
- Retourne : DONE token balance

**4. createOrderOnChain(params)**
- Get signer
- Calcule totalAmount = foodPrice + deliveryFee + platformFee
- Call orderManager.createOrder(restaurantAddress, foodPrice, deliveryFee, ipfsHash, { value: totalAmount })
- Wait transaction
- Parse events pour récupérer orderId
- Retourne : { txHash, orderId }

**5. confirmDeliveryOnChain(orderId)**
- Get signer
- Call orderManager.confirmDelivery(orderId)
- Wait transaction
- Parse events pour récupérer tokensEarned
- Retourne : { txHash, tokensEarned }

**6. openDisputeOnChain(orderId)**
- Get signer
- Call orderManager.openDispute(orderId)
- Wait transaction
- Retourne : { txHash }

**7. getOrderOnChain(orderId)**
- Call orderManager.orders(orderId)
- Retourne : order struct from blockchain

---

### ipfs.js

**Rôle** : Service pour les interactions IPFS.

**Configuration** :
```javascript
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'
const API_URL = import.meta.env.VITE_API_URL
```

**Fonctions principales** :

**1. uploadImage(file)**
- FormData avec file
- POST /api/upload/image via backend
- Retourne : { ipfsHash, url }

**2. getImage(hash)**
- Retourne : IPFS_GATEWAY + hash

**3. uploadJSON(data)**
- JSON.stringify(data)
- POST /api/upload/json via backend
- Retourne : { ipfsHash, url }

**4. getJSON(hash)**
- Fetch IPFS_GATEWAY + hash
- Parse JSON
- Retourne : object

---

## Utils (src/utils/)

### web3.js

**Rôle** : Utilitaires Web3.

**Fonctions** :

**1. formatAddress(address)**
```javascript
export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
```

**2. formatBalance(balance)**
```javascript
export const formatBalance = (balance) => {
  return parseFloat(ethers.formatEther(balance)).toFixed(4)
}
```

**3. parseUnits(value, decimals)**
```javascript
export const parseUnits = (value, decimals = 18) => {
  return ethers.parseUnits(value.toString(), decimals)
}
```

**4. formatUnits(value, decimals)**
```javascript
export const formatUnits = (value, decimals = 18) => {
  return ethers.formatUnits(value, decimals)
}
```

**5. isValidAddress(address)**
```javascript
export const isValidAddress = (address) => {
  return ethers.isAddress(address)
}
```

---

### formatters.js

**Rôle** : Formatage des données.

**Fonctions** :

**1. formatPrice(amount, currency)**
```javascript
export const formatPrice = (amount, currency = 'MATIC') => {
  return `${parseFloat(amount).toFixed(2)} ${currency}`
}
```

**2. formatDate(date)**
```javascript
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

**3. formatTime(seconds)**
```javascript
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
```

**4. truncateText(text, length)**
```javascript
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
```

---

## Variables d'environnement

Fichier `.env.example` :

```
VITE_API_URL=http://localhost:3000/api
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_SOCKET_URL=http://localhost:3000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
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

**Maps** :
- Google Maps JavaScript API

**Temps réel** :
- Socket.io-client

**HTTP** :
- Axios

**UI** :
- Headless UI
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
cd frontend/client
npm install

# Configuration
cp .env.example .env
# Éditer .env avec les bonnes adresses

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

---

## Workflow utilisateur

1. Client visite HomePage
2. Connecte son wallet MetaMask
3. Parcourt restaurants via RestaurantList
4. Sélectionne restaurant et consulte menu
5. Ajoute items au panier via MenuItems
6. Va sur CheckoutPage
7. Saisit adresse de livraison
8. Confirme paiement MetaMask
9. Commande créée on-chain + IPFS
10. Redirect vers TrackingPage
11. Suit livraison en temps réel avec GPS
12. Confirme livraison quand livreur arrive
13. Reçoit tokens DONE de fidélité (1 token / 10€)
14. Peut laisser avis sur restaurant
15. Historique consultable dans ProfilePage
