# Dossier backend/

Ce dossier contient l'API Backend Node.js/Express qui orchestre les interactions off-chain, gère la base de données MongoDB et sert d'interface API entre les frontends et la blockchain.

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
│   │   └── delivererController.js
│   ├── services/
│   │   ├── blockchainService.js
│   │   ├── ipfsService.js
│   │   └── notificationService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Order.js
│   │   └── Deliverer.js
│   ├── routes/
│   │   ├── orders.js
│   │   ├── users.js
│   │   ├── restaurants.js
│   │   └── deliverers.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
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

**Rôle** : Gérer toutes les requêtes HTTP liées aux commandes.

**Méthodes** :

**1. createOrder(req, res)**
- Entrée : { restaurantId, items[], deliveryAddress, clientAddress }
- Valide les données (items non vide, prices > 0)
- Upload items[] vers IPFS via ipfsService.uploadJSON()
- Calcule foodPrice total = somme(item.price * item.quantity)
- Appelle blockchainService.createOrder()
- Sauvegarde order dans MongoDB avec status CREATED
- Retourne : { success: true, orderId, txHash, ipfsHash }

**2. getOrder(req, res)**
- Entrée : orderId (params)
- Fetch order depuis blockchain via blockchainService.getOrder()
- Fetch details depuis IPFS via ipfsService.getJSON(ipfsHash)
- Fetch order MongoDB pour GPS tracking
- Merge toutes les données (on-chain + off-chain)
- Retourne : full order data

**3. getOrdersByClient(req, res)**
- Entrée : clientAddress (query)
- Fetch tous les orders du client depuis MongoDB avec populate(restaurant, deliverer)
- Retourne : array of orders

**4. confirmPreparation(req, res)**
- Entrée : orderId (params), restaurantAddress (body)
- Vérifie que restaurantAddress == order.restaurant
- Appelle blockchainService.confirmPreparation(orderId)
- Update MongoDB : status = PREPARING
- Notifie livreurs disponibles via notificationService.notifyDeliverersAvailable()
- Retourne : { success: true, txHash }

**5. assignDeliverer(req, res)**
- Entrée : orderId (params), delivererAddress (body)
- Vérifie que deliverer est staké via blockchainService.isStaked(delivererAddress)
- Appelle blockchainService.assignDeliverer(orderId, delivererAddress)
- Update MongoDB : status = IN_DELIVERY, deliverer = delivererAddress
- Notifie deliverer via notificationService.sendNotification()
- Retourne : { success: true, txHash, deliverer }

**6. confirmPickup(req, res)**
- Entrée : orderId (params), delivererAddress (body)
- Vérifie que delivererAddress == order.deliverer
- Appelle blockchainService.confirmPickup(orderId)
- Start GPS tracking : initialize gpsTracking[] dans MongoDB
- Notifie client via notificationService.notifyClientOrderUpdate()
- Retourne : { success: true, txHash }

**7. updateGPSLocation(req, res)**
- Entrée : orderId (params), { lat, lng } (body)
- Ajoute { lat, lng, timestamp: Date.now() } dans MongoDB order.gpsTracking[]
- Notifie client en temps réel via Socket.io
- Calcule distance restante et ETA via gpsTracker.getETA()
- Retourne : { success: true }

**8. confirmDelivery(req, res)**
- Entrée : orderId (params), clientAddress (body)
- Vérifie que clientAddress == order.client
- Appelle blockchainService.confirmDelivery(orderId)
- Trigger payment split automatique (géré dans le smart contract)
- Mint DONE tokens pour client (géré dans le smart contract)
- Update MongoDB : status = DELIVERED, completedAt = Date.now()
- Retourne : { success: true, txHash, tokensEarned }

**9. openDispute(req, res)**
- Entrée : orderId (params), { reason, evidence } (body)
- Upload evidence (images) vers IPFS via ipfsService.uploadImage()
- Appelle blockchainService.openDispute(orderId)
- Update MongoDB : status = DISPUTED, disputeReason, disputeEvidence (ipfsHash)
- Notifie arbitrators via notificationService.notifyArbitrators()
- Retourne : { success: true, txHash, disputeId }

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
- Fetch balance via blockchainService.getTokenBalance(address)
- Fetch transaction history via blockchain events (token.Transfer)
- Retourne : { balance, transactions[] }

---

### restaurantController.js

**Rôle** : Gérer les restaurants.

**Méthodes** :

**1. registerRestaurant(req, res)**
- Entrée : { address, name, cuisine, location, images[], menu[] }
- Upload images[] vers IPFS via ipfsService.uploadMultipleImages()
- Upload menu items images vers IPFS
- Crée Restaurant dans MongoDB avec IPFS hashes
- Assign RESTAURANT_ROLE via blockchain (optionnel si géré manuellement)
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

**Rôle** : Gérer les livreurs.

**Méthodes** :

**1. registerDeliverer(req, res)**
- Entrée : { address, name, phone, vehicleType, location }
- Crée Deliverer dans MongoDB
- Retourne : { success: true, deliverer }

**2. getDeliverer(req, res)**
- Entrée : address (params)
- Fetch Deliverer depuis MongoDB
- Fetch staking status via blockchainService.isStaked(address)
- Fetch stakedAmount via blockchain
- Retourne : { deliverer, isStaked, stakedAmount }

**3. getAvailableDeliverers(req, res)**
- Entrée : { location } (query)
- Fetch deliverers avec isAvailable=true depuis MongoDB
- Filter par distance via gpsTracker.calculateDistance()
- Vérifie staking via blockchainService.isStaked() pour chaque deliverer
- Retourne : array of available deliverers triés par distance

**4. updateDelivererStatus(req, res)**
- Entrée : address (params), { isAvailable } (body)
- Update Deliverer.isAvailable dans MongoDB
- Retourne : { success: true }

**5. stakeAsDeliverer(req, res)**
- Entrée : address (body), amount (body)
- Valide amount >= 0.1 ETH
- Appelle blockchainService.stakeDeliverer(address, amount)
- Update Deliverer dans MongoDB : isStaked=true, stakedAmount=amount
- Retourne : { success: true, txHash }

**6. unstake(req, res)**
- Entrée : address (body)
- Vérifie pas de livraisons actives (order.status IN_DELIVERY where deliverer = address)
- Appelle blockchainService.unstake(address)
- Update Deliverer dans MongoDB : isStaked=false, stakedAmount=0
- Retourne : { success: true, txHash }

**7. getDelivererOrders(req, res)**
- Entrée : address (params), { status } (query optionnel)
- Fetch orders du deliverer depuis MongoDB where deliverer = address
- Filter par status si fourni
- Retourne : array of orders

**8. getDelivererEarnings(req, res)**
- Entrée : address (params), { startDate, endDate } (query)
- Calcule earnings depuis blockchain events PaymentSplit :
  - Filter events where deliverer = address
  - Sum delivererAmount (20% de chaque commande)
- Calcule stats :
  - totalEarnings = sum(delivererAmount)
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
