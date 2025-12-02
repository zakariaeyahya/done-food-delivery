# Dossier backend/

Ce dossier contient l'API Backend Node.js/Express qui orchestre les interactions off-chain, gère la base de données MongoDB et sert d'interface API entre les frontends et la blockchain.

## 📊 Statut de Développement

### ✅ Phase 6 : Controllers Simples (Sans Blockchain) - TERMINÉE

**Tests** : ✅ 19/19 tests réussis (100%)

**Fichiers développés** :
- ✅ `userController.js` - 100% MongoDB (registerUser, getUserProfile, updateUserProfile, getUserOrders, getUserTokens)
- ✅ `restaurantController.js` - 100% MongoDB (registerRestaurant, getRestaurant, getAllRestaurants, updateRestaurant, getRestaurantOrders, getRestaurantAnalytics, updateMenu)
- ✅ `delivererController.js` - 100% MongoDB (registerDeliverer, getDeliverer, getAvailableDeliverers, updateDelivererStatus, stakeAsDeliverer, getDelivererOrders, getDelivererEarnings)
- ✅ `routes/users.js` - Routes API utilisateurs
- ✅ `routes/restaurants.js` - Routes API restaurants
- ✅ `routes/deliverers.js` - Routes API livreurs

**Prochaine étape** : Phase 7 - Controllers avec IPFS (`orderController.js` + `routes/orders.js`)

**Après Phase 7** : ⚠️ Nécessite les smart contracts pour activer `blockchainService.js`

---

## Structure

```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   ├── blockchain.js
│   │   ├── ipfs.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   ├── restaurantController.js
│   │   ├── delivererController.js
│   │   ├── adminController.js       ← Sprint 8 (à créer)
│   │   └── analyticsController.js   ← Sprint 8 (à créer)
│   ├── services/
│   │   ├── blockchainService.js
│   │   ├── ipfsService.js
│   │   ├── notificationService.js
│   │   ├── chainlinkService.js      ← Sprint 6 (à créer)
│   │   ├── gpsOracleService.js      ← Sprint 6 (à créer)
│   │   └── arbitrationService.js    ← Sprint 6 (à créer)
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Order.js
│   │   └── Deliverer.js
│   ├── routes/
│   │   ├── orders.js
│   │   ├── users.js
│   │   ├── restaurants.js
│   │   ├── deliverers.js
│   │   ├── admin.js                 ← Sprint 8 (à créer)
│   │   └── analytics.js             ← Sprint 8 (à créer)
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── verifyAdminRole.js       ← Sprint 8 (à créer)
│   │   ├── rateLimit.js             ← Tolérance pannes (à créer)
│   │   └── performanceMonitoring.js ← Tolérance pannes (à créer)
│   └── utils/
│       ├── priceOracle.js
│       └── gpsTracker.js
├── package.json
└── .env.example
```

## Fichiers

### server.js

**Rôle** : Point d'entrée principal de l'application backend.

**Fonctionnalités** :
- Initialise Express.js avec configuration complète
- Configure les middlewares globaux (CORS, helmet, morgan, body-parser)
- Établit les connexions aux services externes (MongoDB, Blockchain, IPFS)
- Monte les routes API
- Démarre le serveur HTTP et Socket.io pour les notifications temps réel
- Gestion centralisée des erreurs globales

**Pseudo-code** :
```javascript
// Import dependencies

// Initialiser Express
const app = express()

// Middlewares globaux
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Connexions
await connectDB()
await initBlockchain()
await initIPFS()

// Routes
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/deliverers', delivererRoutes)

// Error handling
app.use(errorHandler)

// Démarrer serveur
const server = app.listen(PORT)

// Socket.io pour notifications temps réel
const io = socketio(server)
```

---

## Configuration (src/config/)

### blockchain.js

**Rôle** : Configurer la connexion à la blockchain Polygon Mumbai.

**Variables exportées** :
- `provider` : Instance ethers.js connectée au RPC Mumbai
- `wallet` : Wallet du backend (via PRIVATE_KEY dans .env)
- `contracts` : Objet contenant les instances des 4 contrats
  - `orderManager` : Instance DoneOrderManager
  - `paymentSplitter` : Instance DonePaymentSplitter
  - `token` : Instance DoneToken
  - `staking` : Instance DoneStaking

**Méthodes** :

**initBlockchain()**
- Crée un provider ethers.js avec MUMBAI_RPC_URL
- Crée un wallet depuis PRIVATE_KEY
- Charge les ABIs des contrats depuis artifacts/
- Instancie les 4 contrats avec leurs adresses (.env)
- Retourne les instances de contrats

**getContractInstance(contractName)**
- Entrée : nom du contrat (string)
- Retourne : instance du contrat demandé
- Validation : vérifie que le contrat existe

**isConnected()**
- Vérifie si provider.getNetwork() répond
- Retourne : boolean

**Variables d'environnement requises** :
- MUMBAI_RPC_URL
- PRIVATE_KEY
- ORDER_MANAGER_ADDRESS
- PAYMENT_SPLITTER_ADDRESS
- TOKEN_ADDRESS
- STAKING_ADDRESS

---

### ipfs.js

**Rôle** : Configurer la connexion IPFS (Pinata ou IPFS local).

**Variables exportées** :
- `ipfsClient` : Client IPFS configuré
- `pinataAPI` : Client Pinata si utilisé

**Méthodes** :

**initIPFS()**
- Si PINATA_API_KEY existe : utiliser Pinata SDK
- Sinon : créer client IPFS local
- Retourne : client IPFS configuré

**getPinataConfig()**
- Retourne : { apiKey, secretKey } depuis .env
- Validation : vérifie que les clés existent

**getIPFSGateway()**
- Retourne : URL du gateway IPFS (Pinata ou local)

**Variables d'environnement requises** :
- PINATA_API_KEY (optionnel)
- PINATA_SECRET_KEY (optionnel)
- IPFS_GATEWAY_URL

---

### database.js

**Rôle** : Configurer la connexion MongoDB.

**Variables exportées** :
- `mongoose` : Instance mongoose configurée

**Méthodes** :

**connectDB()**
- Établit connexion à MongoDB via MONGODB_URI
- Options : useNewUrlParser, useUnifiedTopology
- Logs : succès ou erreur de connexion
- Retourne : Promise

**disconnectDB()**
- Ferme la connexion mongoose proprement
- Utilisé lors du shutdown de l'application

**getConnectionStatus()**
- Retourne : état de connexion (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)

**Variables d'environnement requises** :
- MONGODB_URI
- DB_NAME

---

## Controllers (src/controllers/)

### orderController.js

**Status** : ⏳ EN DÉVELOPPEMENT (Phase 7 - Fonctions MongoDB/IPFS uniquement, sans blockchain)

**Rôle** : Gérer toutes les requêtes HTTP liées aux commandes.

**Méthodes** :

**1. createOrder(req, res)**
- Entrée : { restaurantId, items[], deliveryAddress, clientAddress }
- Valide les données (items non vide, prices > 0)
- ⏳ Upload items[] vers IPFS via ipfsService.uploadJSON() (Phase 7)
- Calcule foodPrice total = somme(item.price * item.quantity)
- ⚠️ **Mock temporaire** : Génère orderId mock, sauvegarde dans MongoDB uniquement
- ⏳ **Après smart contracts** : Appelle blockchainService.createOrder()
- Sauvegarde order dans MongoDB avec status CREATED
- Retourne : { success: true, orderId, txHash: "mock-tx-hash", ipfsHash } (mock) ou { success: true, orderId, txHash, ipfsHash } (blockchain)

**2. getOrder(req, res)**
- Entrée : orderId (params)
- ⏳ **Phase 7** : Fetch order depuis MongoDB (sans blockchain pour l'instant)
- ⏳ **Phase 7** : Fetch details depuis IPFS via ipfsService.getJSON(ipfsHash)
- Fetch order MongoDB pour GPS tracking
- ⏳ **Après smart contracts** : Fetch order depuis blockchain via blockchainService.getOrder()
- Merge toutes les données (on-chain + off-chain)
- Retourne : full order data

**3. getOrdersByClient(req, res)**
- Entrée : clientAddress (query)
- Fetch tous les orders du client depuis MongoDB avec populate(restaurant, deliverer)
- Retourne : array of orders

**4. confirmPreparation(req, res)**
- Entrée : orderId (params), restaurantAddress (body)
- Vérifie que restaurantAddress == order.restaurant
- ⚠️ **Mock temporaire** : Update MongoDB uniquement (status = PREPARING)
- ⏳ **Après smart contracts** : Appelle blockchainService.confirmPreparation(orderId)
- Update MongoDB : status = PREPARING
- Notifie livreurs disponibles via notificationService.notifyDeliverersAvailable()
- Retourne : { success: true, txHash: "mock-tx-hash" } (mock) ou { success: true, txHash } (blockchain)

**5. assignDeliverer(req, res)**
- Entrée : orderId (params), delivererAddress (body)
- ⚠️ **Mock temporaire** : Vérifie staking via MongoDB `isStaked`
- ⏳ **Après smart contracts** : Vérifie que deliverer est staké via blockchainService.isStaked(delivererAddress)
- ⚠️ **Mock temporaire** : Update MongoDB uniquement (status = IN_DELIVERY, deliverer = delivererAddress)
- ⏳ **Après smart contracts** : Appelle blockchainService.assignDeliverer(orderId, delivererAddress)
- Update MongoDB : status = IN_DELIVERY, deliverer = delivererAddress
- Notifie deliverer via notificationService.sendNotification()
- Retourne : { success: true, txHash: "mock-tx-hash", deliverer } (mock) ou { success: true, txHash, deliverer } (blockchain)

**6. confirmPickup(req, res)**
- Entrée : orderId (params), delivererAddress (body)
- Vérifie que delivererAddress == order.deliverer
- ⚠️ **Mock temporaire** : Update MongoDB uniquement
- ⏳ **Après smart contracts** : Appelle blockchainService.confirmPickup(orderId)
- Start GPS tracking : initialize gpsTracking[] dans MongoDB
- Notifie client via notificationService.notifyClientOrderUpdate()
- Retourne : { success: true, txHash: "mock-tx-hash" } (mock) ou { success: true, txHash } (blockchain)

**7. updateGPSLocation(req, res)**
- Entrée : orderId (params), { lat, lng } (body)
- Ajoute { lat, lng, timestamp: Date.now() } dans MongoDB order.gpsTracking[]
- Notifie client en temps réel via Socket.io
- Calcule distance restante et ETA via gpsTracker.getETA()
- Retourne : { success: true }

**8. confirmDelivery(req, res)**
- Entrée : orderId (params), clientAddress (body)
- Vérifie que clientAddress == order.client
- ⚠️ **Mock temporaire** : Update MongoDB uniquement (status = DELIVERED, completedAt = Date.now())
- ⏳ **Après smart contracts** : Appelle blockchainService.confirmDelivery(orderId)
- ⏳ **Après smart contracts** : Trigger payment split automatique (géré dans le smart contract)
- ⏳ **Après smart contracts** : Mint DONE tokens pour client (géré dans le smart contract)
- Update MongoDB : status = DELIVERED, completedAt = Date.now()
- Retourne : { success: true, txHash: "mock-tx-hash", tokensEarned: 0 } (mock) ou { success: true, txHash, tokensEarned } (blockchain)

**9. openDispute(req, res)**
- Entrée : orderId (params), { reason, evidence } (body)
- ⏳ **Phase 7** : Upload evidence (images) vers IPFS via ipfsService.uploadImage()
- ⚠️ **Mock temporaire** : Update MongoDB uniquement (status = DISPUTED, disputeReason, disputeEvidence)
- ⏳ **Après smart contracts** : Appelle blockchainService.openDispute(orderId)
- Update MongoDB : status = DISPUTED, disputeReason, disputeEvidence (ipfsHash)
- Notifie arbitrators via notificationService.notifyArbitrators()
- Retourne : { success: true, txHash: "mock-tx-hash", disputeId: "mock-dispute-id" } (mock) ou { success: true, txHash, disputeId } (blockchain)

**10. getOrderHistory(req, res)**
- Entrée : address (query), role (query - client/restaurant/deliverer)
- Fetch orders depuis MongoDB selon role :
  - Si role=client : where client = address
  - Si role=restaurant : where restaurant = address
  - Si role=deliverer : where deliverer = address
- Pagination : skip, limit
- Retourne : { orders[], total, page, limit }

---

### userController.js

**Status** : ✅ DÉVELOPPÉ ET TESTÉ (Phase 6)

**Rôle** : Gérer les utilisateurs (clients).

**Méthodes** :

**1. registerUser(req, res)**
- Entrée : { address, name, email, phone }
- Valide address Ethereum (ethers.isAddress)
- Crée User dans MongoDB
- Retourne : { success: true, user }

**2. getUserProfile(req, res)**
- Entrée : address (params)
- Fetch User depuis MongoDB via User.findByAddress(address)
- Fetch DONE token balance via blockchainService.getTokenBalance(address)
- Retourne : { user, tokenBalance }

**3. updateUserProfile(req, res)**
- Entrée : address (params), { name, email, phone, deliveryAddresses[] } (body)
- Update User dans MongoDB
- Retourne : { success: true, user }

**4. getUserOrders(req, res)**
- Entrée : address (params)
- Appelle orderController.getOrdersByClient(address)
- Retourne : array of orders

**5. getUserTokens(req, res)**
- Entrée : address (params)
- ⚠️ **Mock temporaire** : Retourne `{ balance: "0", transactions: [] }` (sans blockchain)
- ⏳ **Après smart contracts** : Fetch balance via blockchainService.getTokenBalance(address)
- ⏳ **Après smart contracts** : Fetch transaction history via blockchain events (token.Transfer)
- Retourne : { balance, transactions[] }

---

### restaurantController.js

**Status** : ✅ DÉVELOPPÉ ET TESTÉ (Phase 6)

**Rôle** : Gérer les restaurants.

**Méthodes** :

**1. registerRestaurant(req, res)**
- Entrée : { address, name, cuisine, location, images[], menu[] }
- ⏳ Upload images[] vers IPFS via ipfsService.uploadMultipleImages() (Phase 7)
- ⏳ Upload menu items images vers IPFS (Phase 7)
- Crée Restaurant dans MongoDB avec IPFS hashes (ou sans images pour l'instant)
- ⚠️ Assign RESTAURANT_ROLE via blockchain (à activer après smart contracts)
- Retourne : { success: true, restaurant }

**2. getRestaurant(req, res)**
- Entrée : id (params)
- Fetch Restaurant depuis MongoDB
- Populate menu avec images IPFS URLs complètes
- Retourne : restaurant data

**3. getAllRestaurants(req, res)**
- Entrée : { cuisine, location, priceRange } (query filters optionnels)
- Fetch restaurants depuis MongoDB avec filtres :
  - Si cuisine : where cuisine = cuisine
  - Si location : calculer distance avec gpsTracker
  - Si priceRange : filter menu prices
- Retourne : array of restaurants

**4. updateRestaurant(req, res)**
- Entrée : id (params), { name, cuisine, menu[], images[] } (body)
- Upload nouvelles images vers IPFS si fournies
- Update Restaurant dans MongoDB
- Retourne : { success: true, restaurant }

**5. getRestaurantOrders(req, res)**
- Entrée : restaurantId (params), { status } (query optionnel)
- Fetch orders du restaurant depuis MongoDB
- Filter par status si fourni
- Retourne : array of orders

**6. getRestaurantAnalytics(req, res)**
- Entrée : restaurantId (params), { startDate, endDate } (query)
- Calcule stats depuis MongoDB :
  - totalOrders = count(orders where restaurant = restaurantId)
  - revenue = sum(order.foodPrice * 0.7) // 70% du split
  - averageRating = avg(reviews.rating)
  - popularDishes = group by item.name, count
- Retourne : { totalOrders, revenue, averageRating, popularDishes[] }

**7. updateMenu(req, res)**
- Entrée : restaurantId (params), { menu[] } (body)
- Upload dish images vers IPFS si nouvelles images
- Update menu[] dans MongoDB
- Retourne : { success: true, menu }

---

### delivererController.js

**Status** : ✅ DÉVELOPPÉ ET TESTÉ (Phase 6)

**Rôle** : Gérer les livreurs.

**Méthodes** :

**1. registerDeliverer(req, res)**
- Entrée : { address, name, phone, vehicleType, location }
- Crée Deliverer dans MongoDB
- Retourne : { success: true, deliverer }

**2. getDeliverer(req, res)**
- Entrée : address (params)
- Fetch Deliverer depuis MongoDB
- ⚠️ **Mock temporaire** : Utilise `isStaked` et `stakedAmount` depuis MongoDB (sans blockchain)
- ⏳ **Après smart contracts** : Fetch staking status via blockchainService.isStaked(address)
- ⏳ **Après smart contracts** : Fetch stakedAmount via blockchain
- Retourne : { deliverer, isStaked, stakedAmount }

**3. getAvailableDeliverers(req, res)**
- Entrée : { location } (query)
- Fetch deliverers avec isAvailable=true depuis MongoDB
- Filter par distance via gpsTracker.calculateDistance()
- ⚠️ **Mock temporaire** : Vérifie staking via MongoDB `isStaked` (sans blockchain)
- ⏳ **Après smart contracts** : Vérifie staking via blockchainService.isStaked() pour chaque deliverer
- Retourne : array of available deliverers triés par distance

**4. updateDelivererStatus(req, res)**
- Entrée : address (params), { isAvailable } (body)
- Update Deliverer.isAvailable dans MongoDB
- Retourne : { success: true }

**5. stakeAsDeliverer(req, res)**
- Entrée : address (body), amount (body)
- Valide amount >= 0.1 ETH
- ⚠️ **Mock temporaire** : Sauvegarde dans MongoDB uniquement (isStaked=true, stakedAmount=amount)
- ⏳ **Après smart contracts** : Appelle blockchainService.stakeDeliverer(address, amount)
- Update Deliverer dans MongoDB : isStaked=true, stakedAmount=amount
- Retourne : { success: true, txHash: "mock-tx-hash" } (mock) ou { success: true, txHash } (blockchain)

**6. unstake(req, res)**
- Entrée : address (body)
- Vérifie pas de livraisons actives (order.status IN_DELIVERY where deliverer = address)
- ⚠️ **Mock temporaire** : Update MongoDB uniquement (isStaked=false, stakedAmount=0)
- ⏳ **Après smart contracts** : Appelle blockchainService.unstake(address)
- Update Deliverer dans MongoDB : isStaked=false, stakedAmount=0
- Retourne : { success: true, txHash: "mock-tx-hash" } (mock) ou { success: true, txHash } (blockchain)

**7. getDelivererOrders(req, res)**
- Entrée : address (params), { status } (query optionnel)
- Fetch orders du deliverer depuis MongoDB where deliverer = address
- Filter par status si fourni
- Retourne : array of orders

**8. getDelivererEarnings(req, res)**
- Entrée : address (params), { startDate, endDate } (query)
- ⚠️ **Mock temporaire** : Calcule depuis MongoDB uniquement (orders DELIVERED)
- ⏳ **Après smart contracts** : Calcule earnings depuis blockchain events PaymentSplit :
  - Filter events where deliverer = address
  - Sum delivererAmount (20% de chaque commande)
- Calcule stats :
  - totalEarnings = sum(delivererAmount) ou 0 (mock)
  - completedDeliveries = count(orders DELIVERED)
  - averageEarning = totalEarnings / completedDeliveries
- Retourne : { totalEarnings, completedDeliveries, averageEarning }

---

## Services (src/services/)

### blockchainService.js

**Rôle** : Abstraction des interactions avec les smart contracts.

**Méthodes** :

**1. createOrder(params)**
- Entrée : { restaurantAddress, foodPrice, deliveryFee, ipfsHash, clientAddress }
- Calcule platformFee = (foodPrice * 10) / 100
- Calcule totalAmount = foodPrice + deliveryFee + platformFee
- Call orderManager.createOrder(restaurantAddress, foodPrice, deliveryFee, ipfsHash, { value: totalAmount })
- Wait transaction confirmée
- Parse events pour récupérer orderId (event OrderCreated)
- Retourne : { orderId, txHash, blockNumber }

**2. confirmPreparation(orderId, restaurantAddress)**
- Connect wallet restaurant
- Call orderManager.confirmPreparation(orderId)
- Wait transaction
- Retourne : { txHash, blockNumber }

**3. assignDeliverer(orderId, delivererAddress)**
- Connect wallet deliverer
- Call orderManager.assignDeliverer(orderId)
- Wait transaction
- Retourne : { txHash, blockNumber }

**4. confirmPickup(orderId, delivererAddress)**
- Connect wallet deliverer
- Call orderManager.confirmPickup(orderId)
- Wait transaction
- Retourne : { txHash, blockNumber }

**5. confirmDelivery(orderId, clientAddress)**
- Connect wallet client
- Call orderManager.confirmDelivery(orderId)
- Trigger automatic payment split (dans le smart contract)
- Mint tokens pour client (dans le smart contract)
- Parse events pour récupérer tokensEarned
- Retourne : { txHash, blockNumber, tokensEarned }

**6. openDispute(orderId, clientAddress)**
- Connect wallet client
- Call orderManager.openDispute(orderId)
- Wait transaction
- Retourne : { txHash, blockNumber }

**7. resolveDispute(disputeId, winner, arbitratorAddress)**
- Connect wallet arbitrator
- Call orderManager.resolveDispute(disputeId, winner)
- Wait transaction
- Retourne : { txHash, blockNumber }

**8. getOrder(orderId)**
- Call orderManager.orders(orderId) (view function)
- Retourne : order struct (id, client, restaurant, deliverer, status, amounts, ipfsHash, etc.)

**9. stakeDeliverer(delivererAddress, amount)**
- Connect wallet deliverer
- Call staking.stakeAsDeliverer({ value: amount })
- Wait transaction
- Retourne : { txHash, blockNumber }

**10. unstake(delivererAddress)**
- Connect wallet deliverer
- Call staking.unstake()
- Wait transaction
- Retourne : { txHash, blockNumber }

**11. isStaked(delivererAddress)**
- Call staking.isStaked(delivererAddress) (view)
- Retourne : boolean

**12. getTokenBalance(userAddress)**
- Call token.balanceOf(userAddress) (view)
- Retourne : balance en wei, converti en ether

**13. mintTokens(userAddress, amount)**
- Call token.mint(userAddress, amount)
- Wait transaction
- Retourne : { txHash, blockNumber }

**14. listenEvents()**
- Subscribe aux events blockchain :
  - OrderCreated, PreparationConfirmed, DelivererAssigned
  - PickupConfirmed, DeliveryConfirmed, DisputeOpened
  - PaymentSplit
- Pour chaque event : emit via EventEmitter pour WebSocket
- Permet notifications temps réel

---

### ipfsService.js

**Rôle** : Gérer upload/download IPFS.

**Méthodes** :

**1. uploadJSON(data)**
- Entrée : object JavaScript
- Convert en JSON string via JSON.stringify()
- Upload vers IPFS/Pinata via ipfsClient.add()
- Pin le fichier via pinataAPI.pinByHash()
- Retourne : { ipfsHash, url: gateway + ipfsHash }

**2. uploadImage(file)**
- Entrée : file buffer (multer)
- Upload image vers IPFS/Pinata
- Pin le fichier
- Retourne : { ipfsHash, url }

**3. uploadMultipleImages(files[])**
- Entrée : array de files
- Loop : pour chaque file, appeler uploadImage()
- Retourne : [{ ipfsHash, url }, ...]

**4. getJSON(ipfsHash)**
- Entrée : IPFS hash
- Fetch depuis gateway IPFS via HTTP GET
- Parse JSON via JSON.parse()
- Retourne : object JavaScript

**5. getImage(ipfsHash)**
- Entrée : IPFS hash
- Retourne : URL complète du gateway (gateway + ipfsHash)

**6. pinFile(ipfsHash)**
- Entrée : IPFS hash existant
- Pin via pinataAPI.pinByHash(ipfsHash)
- Évite garbage collection
- Retourne : { success: true }

---

### notificationService.js

**Rôle** : Gérer notifications temps réel (Socket.io + Email).

**Méthodes** :

**1. notifyOrderCreated(orderId, restaurantId)**
- Emit Socket.io event 'orderCreated' vers room restaurant_{restaurantId}
- Send email au restaurant via sendEmail()
- Retourne : { success: true }

**2. notifyDeliverersAvailable(orderId, deliverers[])**
- Emit Socket.io event 'orderAvailable' vers chaque deliverer room
- Send push notification (optionnel, via FCM/APNS)
- Retourne : { success: true }

**3. notifyClientOrderUpdate(orderId, clientAddress, status)**
- Emit Socket.io event 'orderStatusUpdate' vers room client_{clientAddress}
- Si status = DELIVERED : send email de confirmation
- Si status = IN_DELIVERY : send email avec lien tracking
- Retourne : { success: true }

**4. notifyArbitrators(disputeId, orderId)**
- Fetch liste des arbitrators depuis DB
- Send email à chaque arbitrator
- Emit Socket.io event 'newDispute' vers room arbitrators
- Retourne : { success: true }

**5. sendEmail(to, subject, body)**
- Configure transporter (nodemailer avec SendGrid ou SMTP)
- Send email avec contenu HTML
- Retourne : { success: true, messageId }

---

## Models MongoDB (src/models/)

### User.js

**Rôle** : Modèle Mongoose pour les utilisateurs (clients).

**Schema Mongoose** :
```javascript
{
  address: String (unique, required),
  name: String (required),
  email: String (unique),
  phone: String,
  deliveryAddresses: [{
    label: String,
    address: String,
    lat: Number,
    lng: Number
  }],
  createdAt: Date (default: Date.now),
  updatedAt: Date
}
```

**Méthodes du modèle** :

**findByAddress(address)**
- Trouve user par address blockchain
- Retourne : User document

**updateProfile(address, updates)**
- Update profil user
- Retourne : updated User

**addDeliveryAddress(address, addressData)**
- Ajoute nouvelle adresse de livraison
- Retourne : updated User

---

### Restaurant.js

**Rôle** : Modèle Mongoose pour les restaurants.

**Schema Mongoose** :
```javascript
{
  address: String (unique, required),
  name: String (required),
  cuisine: String,
  description: String,
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  images: [String], // IPFS hashes
  menu: [{
    name: String,
    description: String,
    price: Number,
    image: String, // IPFS hash
    category: String,
    available: Boolean (default: true)
  }],
  rating: Number (default: 0),
  totalOrders: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Méthodes du modèle** :

**findByAddress(address)**
- Trouve restaurant par address blockchain

**updateMenu(restaurantId, menu)**
- Update menu complet

**incrementOrderCount(restaurantId)**
- Incrémente totalOrders de 1

**updateRating(restaurantId, newRating)**
- Calcule nouvelle moyenne des ratings

---

### Order.js

**Rôle** : Modèle Mongoose pour les commandes (données off-chain).

**Schema Mongoose** :
```javascript
{
  orderId: Number (unique, required), // ID blockchain
  txHash: String (unique, required),
  client: ObjectId (ref: 'User'),
  restaurant: ObjectId (ref: 'Restaurant'),
  deliverer: ObjectId (ref: 'Deliverer'),
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    image: String // IPFS hash
  }],
  deliveryAddress: String,
  ipfsHash: String, // Hash du détail complet
  status: String (enum: ['CREATED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'DISPUTED']),
  foodPrice: Number,
  deliveryFee: Number,
  platformFee: Number,
  totalAmount: Number,
  gpsTracking: [{
    lat: Number,
    lng: Number,
    timestamp: Date
  }],
  disputeReason: String,
  disputeEvidence: String, // IPFS hash
  createdAt: Date,
  completedAt: Date,
  updatedAt: Date
}
```

**Méthodes du modèle** :

**findByOrderId(orderId)**
- Trouve order par blockchain ID

**updateStatus(orderId, newStatus)**
- Update status de la commande

**addGPSLocation(orderId, lat, lng)**
- Ajoute coordonnées GPS au tracking

**getOrdersByClient(clientId)**
- Retourne tous orders d'un client

**getOrdersByRestaurant(restaurantId)**
- Retourne tous orders d'un restaurant

**getOrdersByDeliverer(delivererId)**
- Retourne tous orders d'un deliverer

---

### Deliverer.js

**Rôle** : Modèle Mongoose pour les livreurs.

**Schema Mongoose** :
```javascript
{
  address: String (unique, required),
  name: String (required),
  phone: String (required),
  vehicleType: String (enum: ['bike', 'scooter', 'car']),
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  isAvailable: Boolean (default: false),
  isStaked: Boolean (default: false),
  stakedAmount: Number (default: 0),
  rating: Number (default: 0),
  totalDeliveries: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Méthodes du modèle** :

**findByAddress(address)**
- Trouve deliverer par address blockchain

**updateLocation(address, lat, lng)**
- Update position GPS actuelle

**setAvailability(address, isAvailable)**
- Toggle disponibilité du livreur

**incrementDeliveryCount(address)**
- Incrémente totalDeliveries de 1

**updateRating(address, newRating)**
- Calcule nouvelle moyenne des ratings

---

## Routes API (src/routes/)

### orders.js

**Status** : ⏳ EN DÉVELOPPEMENT (Phase 7)

**Rôle** : Routes API pour les commandes.

**Routes définies** :

```
POST   /api/orders/create
GET    /api/orders/:id
GET    /api/orders/client/:address
POST   /api/orders/:id/confirm-preparation
POST   /api/orders/:id/assign-deliverer
POST   /api/orders/:id/confirm-pickup
POST   /api/orders/:id/update-gps
POST   /api/orders/:id/confirm-delivery
POST   /api/orders/:id/dispute
GET    /api/orders/history/:address
```

**Middleware appliqués** :
- auth.verifySignature : Vérifier signature wallet Web3
- validation.validateOrderCreation : Valider body de création
- validation.validateOrderId : Valider orderId dans params

---

### users.js

**Status** : ✅ DÉVELOPPÉ (Phase 6)

**Rôle** : Routes API pour les utilisateurs (clients).

**Routes définies** :

```
POST   /api/users/register
GET    /api/users/:address
PUT    /api/users/:address
GET    /api/users/:address/orders
GET    /api/users/:address/tokens
```

---

### restaurants.js

**Status** : ✅ DÉVELOPPÉ (Phase 6)

**Rôle** : Routes API pour les restaurants.

**Routes définies** :

```
POST   /api/restaurants/register
GET    /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
GET    /api/restaurants/:id/orders
GET    /api/restaurants/:id/analytics
PUT    /api/restaurants/:id/menu
```

---

### deliverers.js

**Status** : ✅ DÉVELOPPÉ (Phase 6)

**Rôle** : Routes API pour les livreurs.

**Routes définies** :

```
POST   /api/deliverers/register
GET    /api/deliverers/:address
GET    /api/deliverers/available
PUT    /api/deliverers/:address/status
POST   /api/deliverers/stake
POST   /api/deliverers/unstake
GET    /api/deliverers/:address/orders
GET    /api/deliverers/:address/earnings
```

---

### admin.js (Sprint 8 - À CRÉER)

**Rôle** : Routes API pour administration et monitoring plateforme.

**Routes définies** :

```
GET    /api/admin/stats
GET    /api/admin/disputes
POST   /api/admin/resolve-dispute/:id
GET    /api/admin/users
GET    /api/admin/restaurants
GET    /api/admin/deliverers
```

**Middleware requis** :
- `verifyAdminRole` : Vérification rôle PLATFORM/ADMIN via blockchain

**Détails des routes** :

**1. GET /api/admin/stats**
- Statistiques globales plateforme
- Response :
  ```json
  {
    "totalOrders": 1234,
    "gmv": "150 ETH",
    "activeUsers": {
      "clients": 500,
      "restaurants": 50,
      "deliverers": 80
    },
    "platformRevenue": "15 ETH",
    "avgDeliveryTime": "25 min",
    "satisfaction": "4.5/5"
  }
  ```

**2. GET /api/admin/disputes**
- Liste tous litiges avec statut
- Query params : `?status=VOTING` (optionnel)
- Response :
  ```json
  [{
    "disputeId": 1,
    "orderId": 123,
    "client": "0xabc...",
    "restaurant": "0xdef...",
    "deliverer": "0xghi...",
    "reason": "Nourriture froide",
    "evidenceIPFS": "QmXxx...",
    "status": "VOTING",
    "createdAt": "2025-11-30",
    "votes": {
      "client": 60,
      "restaurant": 40
    }
  }]
  ```

**3. POST /api/admin/resolve-dispute/:id**
- Résolution manuelle d'un litige par admin
- Body :
  ```json
  {
    "winner": "CLIENT"
  }
  ```
- Response :
  ```json
  {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 12345
  }
  ```

**4. GET /api/admin/users**
- Liste tous utilisateurs (clients)
- Query params : `?status=active` (optionnel)
- Response :
  ```json
  [{
    "address": "0xabc...",
    "name": "John Doe",
    "email": "john@example.com",
    "totalOrders": 15,
    "totalSpent": "5 ETH",
    "doneBalance": "1000 DONE",
    "status": "active"
  }]
  ```

**5. GET /api/admin/restaurants**
- Liste tous restaurants
- Query params : `?cuisine=Italian` (optionnel)
- Response :
  ```json
  [{
    "address": "0xdef...",
    "name": "Pizza Palace",
    "cuisine": "Italian",
    "totalOrders": 250,
    "revenue": "50 ETH",
    "rating": 4.8,
    "status": "active"
  }]
  ```

**6. GET /api/admin/deliverers**
- Liste tous livreurs
- Query params : `?staked=true` (optionnel)
- Response :
  ```json
  [{
    "address": "0xghi...",
    "name": "Mike Deliverer",
    "vehicle": "BIKE",
    "stakedAmount": "100 DONE",
    "totalDeliveries": 180,
    "rating": 4.6,
    "earnings": "10 ETH",
    "status": "staked"
  }]
  ```

---

### analytics.js (Sprint 8 - À CRÉER)

**Rôle** : Routes API pour analytics et statistiques avancées.

**Routes définies** :

```
GET    /api/analytics/dashboard
GET    /api/analytics/orders
GET    /api/analytics/revenue
GET    /api/analytics/users
```

**Détails des routes** :

**1. GET /api/analytics/dashboard**
- Dashboard analytics complet
- Response :
  ```json
  {
    "stats": {
      "totalOrders": 1234,
      "gmv": "150 ETH",
      "platformRevenue": "15 ETH"
    },
    "charts": {
      "ordersOverTime": [
        { "date": "2025-11-24", "orders": 45 },
        { "date": "2025-11-25", "orders": 52 }
      ],
      "revenueOverTime": [
        { "date": "2025-11-24", "revenue": "4.5 ETH" },
        { "date": "2025-11-25", "revenue": "5.2 ETH" }
      ]
    }
  }
  ```

**2. GET /api/analytics/orders**
- Analytics commandes dans le temps
- Query params : `?period=week` (day/week/month/year)
- Response :
  ```json
  {
    "period": "week",
    "data": [
      { "date": "2025-11-24", "orders": 45, "avgValue": "0.5 ETH" },
      { "date": "2025-11-25", "orders": 52, "avgValue": "0.52 ETH" }
    ],
    "total": 297,
    "growth": "+15%"
  }
  ```

**3. GET /api/analytics/revenue**
- Analytics revenus plateforme
- Query params : `?startDate=2025-11-01&endDate=2025-11-30`
- Response :
  ```json
  {
    "totalRevenue": "15 ETH",
    "breakdown": {
      "platformFee": "15 ETH",
      "restaurants": "105 ETH",
      "deliverers": "30 ETH"
    },
    "timeline": [
      { "date": "2025-11-24", "revenue": "1.5 ETH" },
      { "date": "2025-11-25", "revenue": "1.8 ETH" }
    ]
  }
  ```
- Source données : Blockchain events `PaymentSplit`

**4. GET /api/analytics/users**
- Analytics utilisateurs (growth, distribution)
- Response :
  ```json
  {
    "growth": {
      "clients": [100, 150, 200, 250],
      "restaurants": [10, 15, 18, 20],
      "deliverers": [20, 25, 30, 35]
    },
    "activeToday": {
      "clients": 50,
      "restaurants": 8,
      "deliverers": 12
    },
    "topSpenders": [
      { "address": "0xabc...", "spent": "10 ETH" }
    ]
  }
  ```

---

## Middleware (src/middleware/)

### auth.js

**Rôle** : Authentification et vérification des signatures Web3.

**Méthodes** :

**1. verifySignature(req, res, next)**
- Vérifie signature Web3 dans header Authorization: Bearer <signature>
- Récupère message signé et signature
- Utilise ethers.verifyMessage() pour récupérer address
- Ajoute req.userAddress pour les controllers
- Next() si valide, sinon error 401 Unauthorized

**2. requireRole(role)**
- Middleware factory qui retourne fonction middleware
- Vérifie que req.userAddress a le bon role (client/restaurant/deliverer)
- Check dans DB ou via blockchain role
- Next() si autorisé, sinon error 403 Forbidden

---

### validation.js

**Rôle** : Validation des données des requêtes.

**Méthodes** :

**1. validateOrderCreation(req, res, next)**
- Vérifie body contient : restaurantId, items[], deliveryAddress
- Vérifie items[] non vide
- Vérifie prices > 0 pour chaque item
- Next() si valide, sinon error 400 Bad Request avec détails

**2. validateOrderId(req, res, next)**
- Vérifie orderId est un number valide
- Vérifie order existe dans DB
- Next() si valide, sinon error 404 Not Found

**3. validateAddress(req, res, next)**
- Vérifie address est valide via ethers.isAddress(address)
- Next() si valide, sinon error 400 Bad Request

---

### verifyAdminRole.js (Sprint 8 - À CRÉER)

**Rôle** : Middleware pour vérifier rôle PLATFORM/ADMIN via blockchain.

**Méthodes** :

**1. verifyAdminRole(req, res, next)**
- Récupère address wallet depuis header `x-wallet-address`
- Vérifie signature Web3 si fournie
- Appelle smart contract pour vérifier rôle PLATFORM via `hasRole(PLATFORM_ROLE, address)`
- Si rôle valide : `next()`
- Sinon : retourne error 403 Forbidden

**Pseudo-code** :
```javascript
async function verifyAdminRole(req, res, next) {
  try {
    const walletAddress = req.headers['x-wallet-address'];

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(401).json({ error: 'Invalid wallet address' });
    }

    // Vérifier rôle PLATFORM via blockchain
    const hasRole = await blockchainService.hasRole('PLATFORM_ROLE', walletAddress);

    if (!hasRole) {
      return res.status(403).json({
        error: 'Access denied: PLATFORM/ADMIN role required'
      });
    }

    req.adminAddress = walletAddress;
    next();
  } catch (error) {
    console.error('Admin role verification failed:', error);
    res.status(500).json({ error: 'Role verification failed' });
  }
}
```

**Utilisation dans routes admin** :
```javascript
const verifyAdminRole = require('../middleware/verifyAdminRole');

// Toutes les routes admin protégées
router.get('/stats', verifyAdminRole, adminController.getStats);
router.get('/disputes', verifyAdminRole, adminController.getDisputes);
```

---

## Utils (src/utils/)

### priceOracle.js

**Rôle** : Simuler Chainlink Price Feed pour conversion fiat/crypto.

**Méthodes** :

**1. getMATICPrice()**
- Fetch prix MATIC/USD depuis API externe (CoinGecko ou mock)
- Retourne : price en USD (number)

**2. convertUSDtoMATIC(usdAmount)**
- Entrée : montant en USD (number)
- Fetch prix MATIC actuel
- Calcule équivalent MATIC = usdAmount / maticPrice
- Retourne : amount en MATIC converti en wei (BigNumber)

**3. convertMATICtoUSD(maticAmount)**
- Entrée : montant en MATIC wei (BigNumber)
- Fetch prix MATIC actuel
- Calcule équivalent USD = (maticAmount / 1e18) * maticPrice
- Retourne : amount en USD (number)

---

### gpsTracker.js

**Rôle** : Simuler tracking GPS des livreurs.

**Méthodes** :

**1. calculateDistance(lat1, lng1, lat2, lng2)**
- Calcule distance entre 2 points GPS
- Utilise formule Haversine
- Retourne : distance en km (number)

**2. isNearby(delivererLocation, targetLocation, radiusKm)**
- Vérifie si deliverer est dans radius
- Calcule distance via calculateDistance()
- Retourne : boolean (true si distance <= radiusKm)

**3. getETA(currentLocation, destinationLocation, speedKmh)**
- Calcule distance restante
- Estime temps = distance / speedKmh
- Retourne : ETA en minutes (number)

**4. generateMockRoute(startLocation, endLocation, steps)**
- Génère points GPS intermédiaires pour simulation
- Interpole entre start et end
- Retourne : [{ lat, lng }, ...] array de steps points

---

## Dépendances

**Dependencies principales** :

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "ethers": "^6.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "morgan": "^1.10.0",
  "helmet": "^7.0.0",
  "express-validator": "^7.0.0",
  "multer": "^1.4.5-lts.1",
  "ipfs-http-client": "^60.0.0",
  "pinata-sdk": "^2.1.0",
  "socket.io": "^4.6.0",
  "nodemailer": "^6.9.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0"
}
```

**DevDependencies** :

```json
{
  "nodemon": "^2.0.22",
  "jest": "^29.5.0",
  "supertest": "^6.3.3"
}
```

---

## Variables d'environnement

Fichier `.env.example` :

```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/done-food-delivery
DB_NAME=done_food_delivery

# Blockchain
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=0x...
ORDER_MANAGER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...
STAKING_ADDRESS=0x...

# IPFS
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

# Notifications
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@donefood.com

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

---

## Scripts NPM

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "seed": "node scripts/seed.js"
  }
}
```

---

## Démarrage

```bash
# Installation
cd backend
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Développement
npm run dev

# Production
npm start

# Tests
npm test

# Seed database
npm run seed
```

---

## Résumé des Routes API

### Routes Existantes (Sprint 2-7)

**Orders** (`/api/orders`) - 10 routes :
```
POST   /create
GET    /:id
GET    /client/:address
POST   /:id/confirm-preparation
POST   /:id/assign-deliverer
POST   /:id/confirm-pickup
POST   /:id/update-gps
POST   /:id/confirm-delivery
POST   /:id/dispute
GET    /history/:address
```

**Users** (`/api/users`) - 5 routes :
```
POST   /register
GET    /:address
PUT    /:address
GET    /:address/orders
GET    /:address/tokens
```

**Restaurants** (`/api/restaurants`) - 7 routes :
```
POST   /register
GET    /
GET    /:id
PUT    /:id
GET    /:id/orders
GET    /:id/analytics
PUT    /:id/menu
```

**Deliverers** (`/api/deliverers`) - 8 routes :
```
POST   /register
GET    /:address
GET    /available
PUT    /:address/status
POST   /stake
POST   /unstake
GET    /:address/orders
GET    /:address/earnings
```

**Total routes existantes** : **30 routes**

---

### Routes Sprint 8 (À CRÉER)

**Admin** (`/api/admin`) - 6 routes ⚠️ :
```
GET    /stats                    ← Statistiques globales plateforme
GET    /disputes                 ← Liste tous litiges
POST   /resolve-dispute/:id      ← Résolution manuelle litige
GET    /users                    ← Liste tous clients
GET    /restaurants              ← Liste tous restaurants
GET    /deliverers               ← Liste tous livreurs
```
- **Middleware requis** : `verifyAdminRole` (vérification rôle PLATFORM via blockchain)
- **Fichier à créer** : `backend/src/routes/admin.js`
- **Controller à créer** : `backend/src/controllers/adminController.js`

**Analytics** (`/api/analytics`) - 4 routes ⚠️ :
```
GET    /dashboard                ← Dashboard analytics complet
GET    /orders                   ← Analytics commandes (croissance, tendances)
GET    /revenue                  ← Analytics revenus plateforme
GET    /users                    ← Analytics utilisateurs (growth, distribution)
```
- **Fichier à créer** : `backend/src/routes/analytics.js`
- **Controller à créer** : `backend/src/controllers/analyticsController.js`

**Total routes Sprint 8** : **10 routes**

---

### Statut Global des Routes

| Sprint | Routes | Status | Fichiers |
|--------|--------|--------|----------|
| Phase 6 | 20 routes | ✅ DÉVELOPPÉES | users.js (5 routes), restaurants.js (7 routes), deliverers.js (8 routes) |
| Phase 7 | 10 routes | ⏳ EN DÉVELOPPEMENT | orders.js |
| Sprint 8 | 10 routes | ⚠️ À CRÉER | admin.js, analytics.js |
| **TOTAL** | **40 routes** | 20 ✅ / 10 ⏳ / 10 ⚠️ | **6 fichiers routes** |

---

### Middleware Sprint 8

**À créer** :
- `verifyAdminRole.js` : Vérification rôle PLATFORM/ADMIN via blockchain
  - Utilisé par toutes les routes `/api/admin/*`
  - Appelle `blockchainService.hasRole('PLATFORM_ROLE', address)`
  - Retourne 403 si accès refusé

---

### Controllers Sprint 8

**À créer** :
1. `adminController.js` :
   - `getStats()` : Statistiques plateforme
   - `getDisputes()` : Liste litiges
   - `resolveDispute()` : Résolution manuelle
   - `getUsers()` : Liste clients
   - `getRestaurants()` : Liste restaurants
   - `getDeliverers()` : Liste livreurs

2. `analyticsController.js` :
   - `getDashboard()` : Dashboard complet
   - `getOrdersAnalytics()` : Analytics commandes
   - `getRevenueAnalytics()` : Analytics revenus
   - `getUsersAnalytics()` : Analytics utilisateurs

---

### Intégration dans server.js

**À ajouter** :
```javascript
// Routes Sprint 8
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

// Middleware admin
const verifyAdminRole = require('./middleware/verifyAdminRole');

// Monter les routes
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
```

---

## Tolérance aux Pannes et Redondance

Ce document guide les développeurs pour implémenter les mécanismes de tolérance aux pannes dans le backend DONE Food Delivery.

### 📁 Structure des Fichiers

```
backend/src/
├── services/
│   ├── rpcService.js              ← Failover RPC Polygon (à implémenter)
│   ├── alertService.js            ← Système d'alertes (à implémenter)
│   ├── ipfsCacheService.js        ← Cache IPFS local (à implémenter)
│   ├── priceOracleService.js      ← Prix avec failover (à implémenter)
│   ├── blockchainService.js       ← Déjà existant
│   ├── ipfsService.js             ← Déjà existant
│   ├── chainlinkService.js        ← Déjà existant
│   └── gpsOracleService.js        ← Déjà existant
│
├── cron/
│   ├── healthCheckCron.js         ← Health checks périodiques (à implémenter)
│   ├── backupCron.js              ← Backups MongoDB (à implémenter)
│   └── oracleSyncCron.js          ← Sync oracles (à implémenter)
│
├── middleware/
│   ├── performanceMonitoring.js   ← Monitoring temps réponse (à implémenter)
│   ├── rateLimit.js               ← Protection DDoS (à implémenter)
│   ├── auth.js                    ← Déjà existant
│   └── validation.js              ← Déjà existant
│
├── routes/
│   ├── health.js                  ← Endpoint /health (à implémenter)
│   ├── orders.js                  ← Déjà existant
│   ├── users.js                   ← Déjà existant
│   └── ...
│
├── utils/
│   ├── circuitBreaker.js          ← Pattern isolation pannes (à implémenter)
│   ├── priceOracle.js             ← Déjà existant
│   └── gpsTracker.js              ← Déjà existant
│
└── config/
    ├── database.js                ← Déjà existant
    ├── blockchain.js              ← Déjà existant
    └── ipfs.js                    ← Déjà existant
```

### 🚀 Plan d'Implémentation

#### Sprint 1 : Fondations (Priorité Haute)

##### 1. RPC Service avec Failover
**Fichier** : `services/rpcService.js`

**Objectif** : Éviter la dépendance à un seul endpoint RPC Polygon.

**Étapes** :
1. Installer `ethers` (déjà fait normalement)
2. Créer classe `RPCService` avec liste d'endpoints
3. Implémenter `executeWithRetry(operation, maxRetries)`
4. Implémenter `switchToNextEndpoint()`
5. Tester avec `provider.getBlockNumber()`

**Variables .env requises** :
```env
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
ALCHEMY_API_KEY=your_key
INFURA_API_KEY=your_key
```

**Test** :
```bash
node -e "const rpc = require('./src/services/rpcService'); rpc.executeWithRetry(p => p.getBlockNumber()).then(console.log)"
```

##### 2. Health Check Endpoint
**Fichier** : `routes/health.js`

**Objectif** : Permettre monitoring externe et load balancer de vérifier l'état.

**Étapes** :
1. Créer route GET `/health`
2. Check MongoDB : `mongoose.connection.readyState === 1`
3. Check Blockchain : `provider.getBlockNumber()`
4. Check IPFS : `ipfsService.testConnection()`
5. Return 200 si OK, 503 sinon

**Test** :
```bash
curl http://localhost:3000/health
```

**Intégration server.js** :
```javascript
const healthRouter = require('./routes/health');
app.use('/', healthRouter);
```

##### 3. Performance Monitoring Middleware
**Fichier** : `middleware/performanceMonitoring.js`

**Objectif** : Détecter les requêtes lentes.

**Étapes** :
1. Installer `npm install response-time`
2. Créer middleware avec `response-time()`
3. Logger si temps > 1000ms
4. Send alert via `alertService` si critique

**Intégration server.js** :
```javascript
const performanceMonitoring = require('./middleware/performanceMonitoring');
app.use(performanceMonitoring);
```

---

#### Sprint 2 : Alertes et Monitoring (Priorité Haute)

##### 4. Alert Service
**Fichier** : `services/alertService.js`

**Objectif** : Notifier l'équipe en cas de problème.

**Étapes** :
1. Installer `npm install nodemailer axios`
2. Implémenter `sendEmail(severity, message, details)`
3. Implémenter `sendSlack(severity, message, details)` (optionnel)
4. Niveaux : INFO, WARNING, CRITICAL

**Variables .env requises** :
```env
ALERT_EMAIL=alerts@donefood.com
ALERT_EMAIL_PASSWORD=your_password
ADMIN_EMAIL=admin@donefood.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/... (optionnel)
```

**Test** :
```javascript
const alertService = require('./services/alertService');
alertService.sendAlert('WARNING', 'Test Alert', { test: true });
```

##### 5. Health Check Cron
**Fichier** : `cron/healthCheckCron.js`

**Objectif** : Surveillance continue automatique.

**Étapes** :
1. Installer `npm install node-cron`
2. Schedule toutes les 5 minutes : `cron.schedule('*/5 * * * *', ...)`
3. Appeler health checks (MongoDB, RPC, IPFS)
4. Send alert si échec

**Intégration server.js** :
```javascript
// Démarrer les cron jobs
require('./cron/healthCheckCron');
```

---

#### Sprint 3 : Optimisations et Cache (Priorité Moyenne)

##### 6. IPFS Cache Service
**Fichier** : `services/ipfsCacheService.js`

**Objectif** : Réduire latence et dépendance aux gateways IPFS.

**Étapes** :
1. Installer `npm install node-cache`
2. Créer cache avec TTL 1 heure
3. Implémenter `getFile(ipfsHash)` avec cache-first
4. Implémenter `invalidate(ipfsHash)`

**Utilisation** :
```javascript
const ipfsCacheService = require('./services/ipfsCacheService');
const image = await ipfsCacheService.getFile('QmHash...');
```

##### 7. Price Oracle Service avec Failover
**Fichier** : `services/priceOracleService.js`

**Objectif** : Prix MATIC/USD fiable même si Chainlink échoue.

**Étapes** :
1. Primary : Fetch depuis Chainlink on-chain
2. Fallback : CoinGecko API
3. Cache local avec TTL 5 minutes
4. Validation fraîcheur (< 1 heure)

**Test** :
```javascript
const priceService = require('./services/priceOracleService');
const price = await priceService.getMaticUsdPrice();
console.log(`1 MATIC = $${price}`);
```

##### 8. Rate Limiting
**Fichier** : `middleware/rateLimit.js`

**Objectif** : Protection contre abus et DDoS.

**Étapes** :
1. Installer `npm install express-rate-limit`
2. Créer `apiLimiter` : 100 req/min par IP
3. Créer `authLimiter` : 5 req/min pour login
4. Créer `userLimiter` : 1000 req/min pour users authentifiés

**Intégration server.js** :
```javascript
const rateLimit = require('./middleware/rateLimit');
app.use('/api', rateLimit.apiLimiter);
app.use('/api/auth', rateLimit.authLimiter);
```

---

#### Sprint 4 : Backups et Resilience (Priorité Moyenne)

##### 9. Backup Cron
**Fichier** : `cron/backupCron.js`

**Objectif** : Sauvegardes automatiques MongoDB.

**Étapes** :
1. Schedule : Tous les jours à 3h00
2. Utiliser `mongodump` via `child_process.exec`
3. Compression gzip
4. Cleanup backups > 30 jours

**Test manuel** :
```bash
node src/cron/backupCron.js
```

**Vérifier backup** :
```bash
ls -lh backups/
```

##### 10. Circuit Breaker Utility
**Fichier** : `utils/circuitBreaker.js`

**Objectif** : Isolation des services défaillants.

**Étapes** :
1. Implémenter classe avec états CLOSED/OPEN/HALF_OPEN
2. Threshold : 5 échecs → OPEN
3. Timeout : 60 secondes avant retry
4. Méthode `call(...args)`

**Utilisation** :
```javascript
const CircuitBreaker = require('./utils/circuitBreaker');
const ipfsBreaker = new CircuitBreaker(ipfsService.uploadFile, 5, 60000);

try {
  const hash = await ipfsBreaker.call(fileBuffer);
} catch (error) {
  // Fallback logic
}
```

##### 11. Oracle Sync Cron
**Fichier** : `cron/oracleSyncCron.js`

**Objectif** : Mise à jour périodique des oracles.

**Étapes** :
1. Schedule : Toutes les heures
2. Fetch prix MATIC/USD
3. Fetch météo (si DoneWeatherOracle implémenté)
4. Update cache local

---

### 📊 Configuration MongoDB Replica Set

Pour bénéficier du failover automatique MongoDB, utiliser MongoDB Atlas avec Replica Set.

#### Étapes (MongoDB Atlas) :

1. **Créer cluster M10+ minimum** (M0 gratuit ne supporte pas replica set complet)
2. **Configuration** :
   - Replica Set : 3 nœuds (1 Primary + 2 Secondary)
   - Régions : Multi-régions recommandé (ex: US-East, US-West, EU-West)
3. **Connection String dans .env** :
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/done_food_delivery?retryWrites=true&w=majority
   ```

#### Vérifier Replica Set :

```javascript
// backend/scripts/check-replica-status.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', async () => {
  const admin = mongoose.connection.db.admin();
  const status = await admin.replSetGetStatus();

  console.log('Replica Set Members:');
  status.members.forEach(member => {
    console.log(`- ${member.name}: ${member.stateStr} (health: ${member.health})`);
  });

  process.exit(0);
});
```

---

### 🧪 Tests de Résilience

#### Test 1 : Simuler panne RPC

```javascript
// Test dans services/rpcService.test.js
test('should failover to next RPC endpoint', async () => {
  // Mock primary endpoint to fail
  const rpcService = require('./rpcService');

  // Should switch to backup endpoint automatically
  const blockNumber = await rpcService.executeWithRetry(
    async (provider) => provider.getBlockNumber()
  );

  expect(blockNumber).toBeGreaterThan(0);
});
```

#### Test 2 : Vérifier Health Endpoint

```bash
# Backend running
curl http://localhost:3000/health

# Expected response:
{
  "uptime": 12345,
  "message": "OK",
  "checks": {
    "database": "connected",
    "blockchain": "connected",
    "ipfs": "connected"
  }
}
```

#### Test 3 : Load Test

```bash
# Installer Apache Bench
sudo apt install apache2-utils

# Test 1000 requêtes, 100 concurrent
ab -n 1000 -c 100 http://localhost:3000/api/restaurants

# Métriques à vérifier :
# - Requests per second > 100
# - Failed requests = 0
# - 95th percentile < 500ms
```

---

### 📚 Dépendances NPM à Installer

```bash
# Services
npm install ethers dotenv axios form-data

# Monitoring et Alertes
npm install node-cron nodemailer

# Performance et Sécurité
npm install response-time express-rate-limit

# Cache
npm install node-cache

# Testing (dev dependencies)
npm install --save-dev jest supertest
```

---

### ⚠️ Variables d'Environnement Complètes

Ajouter dans `backend/.env` :

```env
# Existing variables...

# === TOLÉRANCE AUX PANNES ===

# RPC Failover
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
ALCHEMY_API_KEY=your_alchemy_key
INFURA_API_KEY=your_infura_key

# Alertes
ALERT_EMAIL=alerts@donefood.com
ALERT_EMAIL_PASSWORD=your_email_password
ADMIN_EMAIL=admin@donefood.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... (optionnel)

# Oracles
COINGECKO_API_KEY=your_coingecko_key (optionnel)
OPENWEATHERMAP_API_KEY=your_weather_key (optionnel)

# Backups
BACKUP_DIR=./backups
S3_BUCKET=done-backups (optionnel pour cloud backup)

# Performance
PERFORMANCE_THRESHOLD_MS=1000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 🎯 Métriques de Succès

Une fois tous les fichiers implémentés, le système devrait atteindre :

✅ **Uptime** : 99.9%+
✅ **RTO** (Recovery Time Objective) : < 5 minutes
✅ **RPO** (Recovery Point Objective) : < 1 seconde
✅ **API Response Time** : < 200ms (95th percentile)
✅ **Blockchain TX Confirmation** : < 5 secondes
✅ **Zero downtime** lors des mises à jour (blue-green deployment)

---

### 📖 Références

- **ARCHITECTURE.md** - Section "Tolérance aux Pannes et Redondance"
- **contracts/oracles/README.md** - Documentation oracles
- **contracts/governance/README.md** - Système d'arbitrage
- **Infrastructure best practices** : [12factor.net](https://12factor.net/)
- **Circuit Breaker Pattern** : [Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)

---

### 🆘 Aide et Support

Si vous avez des questions lors de l'implémentation :

1. Consultez les commentaires détaillés dans chaque fichier
2. Référez-vous à la documentation dans `ARCHITECTURE.md`
3. Testez chaque composant individuellement avant intégration
4. Utilisez les scripts de test fournis

Bon développement ! 🚀