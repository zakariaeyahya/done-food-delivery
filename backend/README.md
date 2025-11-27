# Dossier backend/

Ce dossier contient l'API Backend Node.js/Express qui orchestre les interactions off-chain, gère la base de données MongoDB et sert d'interface API entre les frontends et la blockchain.

## Structure

### src/server.js
**Rôle** : Point d'entrée principal de l'application backend.

**Fonctionnalités** :
- Initialise Express.js
- Configure les middlewares (CORS, helmet, morgan, body-parser)
- Connecte MongoDB, blockchain et IPFS
- Configure les routes API
- Démarre le serveur HTTP et Socket.io
- Gestion des erreurs globales

### src/config/

#### blockchain.js
**Rôle** : Configuration de la connexion à la blockchain Polygon Mumbai.

**Variables exportées** :
- `provider` : Instance ethers.js connectée au RPC Mumbai
- `wallet` : Wallet du backend (via PRIVATE_KEY)
- `contracts` : Objet contenant les instances des 4 contrats
- `orderManager` : Instance DoneOrderManager
- `paymentSplitter` : Instance DonePaymentSplitter
- `token` : Instance DoneToken
- `staking` : Instance DoneStaking

**Méthodes** :
- `initBlockchain()` : Initialise la connexion et charge les contrats
- `getContractInstance(contractName)` : Retourne une instance de contrat
- `isConnected()` : Vérifie si la connexion est active

**Variables d'environnement** : MUMBAI_RPC_URL, PRIVATE_KEY, ORDER_MANAGER_ADDRESS, etc.

#### ipfs.js
**Rôle** : Configuration de la connexion IPFS (Pinata ou IPFS local).

**Variables exportées** :
- `ipfsClient` : Client IPFS configuré
- `pinataAPI` : Client Pinata si utilisé

**Méthodes** :
- `initIPFS()` : Initialise la connexion IPFS
- `getPinataConfig()` : Retourne la config Pinata
- `getIPFSGateway()` : Retourne l'URL du gateway IPFS

**Variables d'environnement** : PINATA_API_KEY, PINATA_SECRET_KEY, IPFS_GATEWAY_URL

#### database.js
**Rôle** : Configuration de la connexion MongoDB.

**Variables exportées** :
- `mongoose` : Instance mongoose configurée

**Méthodes** :
- `connectDB()` : Établit la connexion MongoDB
- `disconnectDB()` : Ferme la connexion proprement
- `getConnectionStatus()` : Retourne le statut de connexion

**Variables d'environnement** : MONGODB_URI, DB_NAME

### src/controllers/

#### orderController.js
**Rôle** : Gère toutes les requêtes HTTP liées aux commandes.

**Méthodes principales** :
- `createOrder(req, res)` : Crée une commande, upload IPFS, appelle blockchain, sauvegarde MongoDB
- `getOrder(req, res)` : Récupère une commande complète (blockchain + IPFS + MongoDB)
- `getOrdersByClient(req, res)` : Liste toutes les commandes d'un client
- `confirmPreparation(req, res)` : Confirme la préparation par le restaurant
- `assignDeliverer(req, res)` : Assigne un livreur à la commande
- `confirmPickup(req, res)` : Confirme la récupération par le livreur
- `updateGPSLocation(req, res)` : Met à jour la position GPS en temps réel
- `confirmDelivery(req, res)` : Confirme la livraison et déclenche le split
- `openDispute(req, res)` : Ouvre un litige

#### userController.js
**Rôle** : Gestion des utilisateurs (clients).

**Méthodes principales** :
- `register(req, res)` : Inscription d'un nouvel utilisateur
- `login(req, res)` : Authentification JWT
- `getProfile(req, res)` : Récupère le profil utilisateur
- `updateProfile(req, res)` : Met à jour le profil
- `getTokenBalance(req, res)` : Récupère le solde de tokens DONE

#### restaurantController.js
**Rôle** : Gestion des restaurants.

**Méthodes principales** :
- `register(req, res)` : Inscription d'un restaurant
- `getRestaurants(req, res)` : Liste tous les restaurants
- `getRestaurant(req, res)` : Détails d'un restaurant
- `updateMenu(req, res)` : Met à jour le menu
- `getOrders(req, res)` : Liste les commandes du restaurant
- `getAnalytics(req, res)` : Statistiques et revenus

#### delivererController.js
**Rôle** : Gestion des livreurs.

**Méthodes principales** :
- `register(req, res)` : Inscription d'un livreur
- `stake(req, res)` : Effectue le staking (0.1 ETH minimum)
- `getAvailableOrders(req, res)` : Liste les commandes disponibles
- `acceptOrder(req, res)` : Accepte une commande
- `getEarnings(req, res)` : Récupère les gains du livreur
- `getRating(req, res)` : Récupère la note moyenne

### src/services/

#### blockchainService.js
**Rôle** : Abstraction pour interagir avec les smart contracts.

**Méthodes principales** :
- `createOrder(restaurant, foodPrice, deliveryFee, ipfsHash)` : Crée une commande on-chain
- `getOrder(orderId)` : Récupère une commande depuis la blockchain
- `confirmPreparation(orderId)` : Confirme la préparation
- `assignDeliverer(orderId, deliverer)` : Assigne un livreur
- `confirmPickup(orderId)` : Confirme la récupération
- `confirmDelivery(orderId)` : Confirme la livraison
- `openDispute(orderId)` : Ouvre un litige
- `isStaked(address)` : Vérifie si un livreur est staké
- `mintTokens(address, amount)` : Mint des tokens DONE

#### ipfsService.js
**Rôle** : Gestion de l'upload et récupération de fichiers IPFS.

**Méthodes principales** :
- `uploadJSON(data)` : Upload un objet JSON vers IPFS
- `uploadImage(file)` : Upload une image vers IPFS
- `getJSON(ipfsHash)` : Récupère un JSON depuis IPFS
- `getImage(ipfsHash)` : Récupère une image depuis IPFS
- `pinFile(ipfsHash)` : Pin un fichier sur Pinata (permanent)

#### notificationService.js
**Rôle** : Gestion des notifications en temps réel et emails.

**Méthodes principales** :
- `sendNotification(userId, message)` : Envoie une notification Socket.io
- `sendEmail(to, subject, body)` : Envoie un email via SendGrid/Nodemailer
- `notifyOrderStatus(orderId, status)` : Notifie un changement de statut
- `notifyNewOrder(restaurantId, orderId)` : Notifie un nouveau restaurant

### src/models/

#### User.js
**Rôle** : Modèle Mongoose pour les utilisateurs (clients).

**Schéma** :
- `walletAddress` : Adresse Ethereum
- `email`, `name`, `phone`
- `role` : CLIENT
- `tokenBalance` : Solde de tokens DONE
- `createdAt`, `updatedAt`

#### Restaurant.js
**Rôle** : Modèle Mongoose pour les restaurants.

**Schéma** :
- `walletAddress` : Adresse Ethereum
- `name`, `description`, `cuisineType`
- `address`, `location` : { lat, lng }
- `menu` : Array d'items avec images IPFS
- `rating`, `totalOrders`
- `createdAt`, `updatedAt`

#### Order.js
**Rôle** : Modèle Mongoose pour les commandes (données off-chain).

**Schéma** :
- `orderId` : ID on-chain
- `client`, `restaurant`, `deliverer` : ObjectId
- `items` : Array avec name, quantity, price, image (IPFS)
- `deliveryAddress`, `ipfsHash`
- `status` : CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED
- `gpsTracking` : Array de { lat, lng, timestamp }
- `createdAt`, `completedAt`

#### Deliverer.js
**Rôle** : Modèle Mongoose pour les livreurs.

**Schéma** :
- `walletAddress` : Adresse Ethereum
- `name`, `phone`, `vehicleType`
- `isStaked` : Boolean
- `stakeAmount` : Montant staké
- `rating`, `totalDeliveries`
- `earnings` : Total des gains
- `createdAt`, `updatedAt`

### src/routes/

#### orders.js
**Rôle** : Routes API pour les commandes.

**Endpoints** :
- `POST /api/orders` : Créer une commande
- `GET /api/orders/:id` : Récupérer une commande
- `GET /api/orders/client/:address` : Commandes d'un client
- `PUT /api/orders/:id/prepare` : Confirmer préparation
- `PUT /api/orders/:id/assign` : Assigner livreur
- `PUT /api/orders/:id/pickup` : Confirmer récupération
- `PUT /api/orders/:id/deliver` : Confirmer livraison
- `PUT /api/orders/:id/gps` : Mettre à jour GPS
- `POST /api/orders/:id/dispute` : Ouvrir litige

#### users.js
**Rôle** : Routes API pour les utilisateurs.

**Endpoints** :
- `POST /api/users/register` : Inscription
- `POST /api/users/login` : Connexion
- `GET /api/users/profile` : Profil (authentifié)
- `PUT /api/users/profile` : Mettre à jour profil
- `GET /api/users/tokens` : Solde de tokens

#### restaurants.js
**Rôle** : Routes API pour les restaurants.

**Endpoints** :
- `POST /api/restaurants/register` : Inscription restaurant
- `GET /api/restaurants` : Liste restaurants
- `GET /api/restaurants/:id` : Détails restaurant
- `PUT /api/restaurants/:id/menu` : Mettre à jour menu
- `GET /api/restaurants/:id/orders` : Commandes du restaurant
- `GET /api/restaurants/:id/analytics` : Statistiques

#### deliverers.js
**Rôle** : Routes API pour les livreurs.

**Endpoints** :
- `POST /api/deliverers/register` : Inscription livreur
- `POST /api/deliverers/stake` : Effectuer staking
- `GET /api/deliverers/orders/available` : Commandes disponibles
- `POST /api/deliverers/orders/:id/accept` : Accepter commande
- `GET /api/deliverers/earnings` : Gains du livreur
- `GET /api/deliverers/rating` : Note moyenne

### src/middleware/

#### auth.js
**Rôle** : Authentification JWT et vérification des rôles.

**Fonctions** :
- `authenticate(req, res, next)` : Vérifie le token JWT
- `authorize(...roles)` : Vérifie que l'utilisateur a le bon rôle
- `verifyWallet(req, res, next)` : Vérifie la signature du wallet

#### validation.js
**Rôle** : Validation des données des requêtes.

**Fonctions** :
- `validateOrder(req, res, next)` : Valide les données d'une commande
- `validateUser(req, res, next)` : Valide les données utilisateur
- `validateAddress(req, res, next)` : Valide une adresse Ethereum

### src/utils/

#### priceOracle.js
**Rôle** : Simulation Chainlink Price Oracle pour conversion fiat/crypto.

**Fonctions** :
- `getETHPrice()` : Récupère le prix ETH en USD
- `convertToETH(usdAmount)` : Convertit USD en ETH
- `convertToUSD(ethAmount)` : Convertit ETH en USD

#### gpsTracker.js
**Rôle** : Simulation GPS tracking pour suivi des livraisons.

**Fonctions** :
- `calculateDistance(lat1, lng1, lat2, lng2)` : Calcule la distance
- `estimateETA(currentLocation, destination)` : Estime le temps d'arrivée
- `isNearLocation(lat1, lng1, lat2, lng2, radius)` : Vérifie la proximité

## Dépendances

- **express** : Framework web
- **mongoose** : ODM MongoDB
- **ethers** : Interaction blockchain
- **ipfs-http-client** : Client IPFS
- **socket.io** : Notifications temps réel
- **jsonwebtoken** : Authentification JWT
- **bcrypt** : Hashage de mots de passe

## Démarrage

```bash
cd backend
npm install
npm run dev  # Mode développement avec nodemon
```

