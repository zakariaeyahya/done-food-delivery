# SPRINT 2: BACKEND API

## OBJECTIF
Créer l'API REST Node.js/Express pour orchestrer les interactions off-chain, gérer MongoDB et servir d'interface entre les frontends et la blockchain.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES** ou **PARTIELLEMENT REMPLIS**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `backend/` (existe)
- ✓ `backend/src/` (existe)
- ✓ `backend/src/config/` (existe)
- ✓ `backend/src/controllers/` (existe)
- ✓ `backend/src/services/` (existe)
- ✓ `backend/src/models/` (existe)
- ✓ `backend/src/routes/` (existe)
- ✓ `backend/src/middleware/` (existe)
- ✓ `backend/src/utils/` (existe)

**Fichiers existants mais vides/à compléter:**
- ✓ `backend/src/server.js` (vide - à compléter)
- ✓ `backend/src/config/blockchain.js` (vide - à compléter)
- ✓ `backend/src/config/ipfs.js` (vide - à compléter)
- ✓ `backend/src/config/database.js` (vide - à compléter)
- ✓ `backend/src/controllers/orderController.js` (vide - à compléter)
- ✓ `backend/src/controllers/userController.js` (vide - à compléter)
- ✓ `backend/src/controllers/restaurantController.js` (vide - à compléter)
- ✓ `backend/src/controllers/delivererController.js` (vide - à compléter)
- ✓ `backend/src/services/blockchainService.js` (vide - à compléter)
- ✓ `backend/src/services/ipfsService.js` (vide - à compléter)
- ✓ `backend/src/services/notificationService.js` (vide - à compléter)
- ✓ `backend/src/models/User.js` (vide - à compléter)
- ✓ `backend/src/models/Restaurant.js` (vide - à compléter)
- ✓ `backend/src/models/Order.js` (vide - à compléter)
- ✓ `backend/src/models/Deliverer.js` (vide - à compléter)
- ✓ `backend/src/routes/orders.js` (vide - à compléter)
- ✓ `backend/src/routes/users.js` (vide - à compléter)
- ✓ `backend/src/routes/restaurants.js` (vide - à compléter)
- ✓ `backend/src/routes/deliverers.js` (vide - à compléter)
- ✓ `backend/src/middleware/auth.js` (vide - à compléter)
- ✓ `backend/src/middleware/validation.js` (vide - à compléter)
- ✓ `backend/src/utils/priceOracle.js` (vide - à compléter)
- ✓ `backend/src/utils/gpsTracker.js` (vide - à compléter)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Node.js (v18+) est installé
- ✓ Créer un compte MongoDB Atlas (ou installer MongoDB localement)
- ✓ Préparer les variables d'environnement (.env)
- ✓ Avoir les adresses des contrats déployés (Sprint 1)

### ÉTAPE 2: INITIALISATION DU BACKEND
1. Aller dans le dossier `backend/`:
   ```bash
   cd backend
   ```
2. Initialiser npm (si pas déjà fait):
   ```bash
   npm init -y
   ```
3. Installer les dépendances principales:
   ```bash
   npm install express mongoose ethers ipfs-http-client socket.io cors helmet morgan dotenv
   npm install --save-dev nodemon
   ```

### ÉTAPE 3: VÉRIFICATION DE LA STRUCTURE DES DOSSIERS
**Structure attendue (déjà créée):**
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
└── package.json
```

### ÉTAPE 4: IMPLÉMENTATION DES FICHIERS DE CONFIGURATION
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/config/blockchain.js`** (vide - à compléter)
   - Configuration connexion Polygon Mumbai
   - Provider ethers.js
   - Wallet backend (PRIVATE_KEY)
   - Instances des 4 contrats (OrderManager, PaymentSplitter, Token, Staking)
   - Méthodes: `initBlockchain()`, `getContractInstance()`, `isConnected()`
   - Variables d'environnement: `MUMBAI_RPC_URL`, `PRIVATE_KEY`, adresses contrats

2. **`backend/src/config/ipfs.js`** (vide - à compléter)
   - Configuration IPFS (Pinata ou local)
   - Client IPFS configuré
   - Pinata API si utilisé
   - Méthodes: `initIPFS()`, `getPinataConfig()`, `getIPFSGateway()`
   - Variables: `PINATA_API_KEY`, `PINATA_SECRET_KEY`, `IPFS_GATEWAY_URL`

3. **`backend/src/config/database.js`** (vide - à compléter)
   - Configuration MongoDB
   - Instance mongoose
   - Méthodes: `connectDB()`, `disconnectDB()`, `getConnectionStatus()`
   - Variables: `MONGODB_URI`, `DB_NAME`

### ÉTAPE 5: IMPLÉMENTATION DES MODÈLES MONGODB
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/models/User.js`** (vide - à compléter)
   - Schema Mongoose pour clients
   - Champs: `address`, `name`, `email`, `phone`, `deliveryAddresses[]`
   - Méthodes: `findByAddress()`, `updateProfile()`, `addDeliveryAddress()`

2. **`backend/src/models/Restaurant.js`** (vide - à compléter)
   - Schema Mongoose pour restaurants
   - Champs: `address`, `name`, `cuisine`, `location`, `images[]`, `menu[]`, `rating`, `totalOrders`
   - Méthodes: `findByAddress()`, `updateMenu()`, `incrementOrderCount()`, `updateRating()`

3. **`backend/src/models/Order.js`** (vide - à compléter)
   - Schema Mongoose pour commandes (données off-chain)
   - Champs: `orderId`, `txHash`, `client`, `restaurant`, `deliverer`, `items[]`, `status`, `gpsTracking[]`
   - Méthodes: `findByOrderId()`, `updateStatus()`, `addGPSLocation()`, `getOrdersByClient/Restaurant/Deliverer()`

4. **`backend/src/models/Deliverer.js`** (vide - à compléter)
   - Schema Mongoose pour livreurs
   - Champs: `address`, `name`, `phone`, `vehicleType`, `currentLocation`, `isAvailable`, `isStaked`, `rating`
   - Méthodes: `findByAddress()`, `updateLocation()`, `setAvailability()`, `incrementDeliveryCount()`

### ÉTAPE 6: IMPLÉMENTATION DES SERVICES
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/services/blockchainService.js`** (vide - à compléter)
   - Abstraction des interactions avec smart contracts
   - Méthodes:
     * `createOrder()` - Création on-chain
     * `confirmPreparation()` - Confirmation restaurant
     * `assignDeliverer()` - Assignation
     * `confirmPickup()` - Récupération
     * `confirmDelivery()` - Livraison + split + tokens
     * `openDispute()` - Litige
     * `resolveDispute()` - Résolution
     * `getOrder()` - Lecture on-chain
     * `stakeDeliverer()` - Staking
     * `unstake()` - Retrait
     * `isStaked()` - Vérification
     * `getTokenBalance()` - Balance tokens
     * `mintTokens()` - Mint tokens
     * `listenEvents()` - Écoute events blockchain pour WebSocket

2. **`backend/src/services/ipfsService.js`** (vide - à compléter)
   - Gestion upload/download IPFS
   - Méthodes:
     * `uploadJSON()` - Upload données JSON
     * `uploadImage()` - Upload image
     * `uploadMultipleImages()` - Upload multiple images
     * `getJSON()` - Récupération JSON
     * `getImage()` - URL image
     * `pinFile()` - Pin fichier

3. **`backend/src/services/notificationService.js`** (vide - à compléter)
   - Notifications temps réel (Socket.io + Email)
   - Méthodes:
     * `notifyOrderCreated()` - Notification restaurant
     * `notifyDeliverersAvailable()` - Notification livreurs
     * `notifyClientOrderUpdate()` - Notification client
     * `notifyArbitrators()` - Notification arbitres
     * `sendEmail()` - Envoi email

### ÉTAPE 7: IMPLÉMENTATION DES MIDDLEWARES
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/middleware/auth.js`** (vide - à compléter)
   - Authentification Web3
   - Méthodes: `verifySignature()`, `requireRole()`

2. **`backend/src/middleware/validation.js`** (vide - à compléter)
   - Validation des requêtes
   - Méthodes: `validateOrderCreation()`, `validateOrderId()`, `validateAddress()`

### ÉTAPE 8: IMPLÉMENTATION DES UTILS
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/utils/priceOracle.js`** (vide - à compléter)
   - Simulation Chainlink Price Feed
   - Méthodes: `getMATICPrice()`, `convertUSDtoMATIC()`, `convertMATICtoUSD()`

2. **`backend/src/utils/gpsTracker.js`** (vide - à compléter)
   - Simulation tracking GPS
   - Méthodes: `calculateDistance()`, `isNearby()`, `getETA()`, `generateMockRoute()`

### ÉTAPE 9: IMPLÉMENTATION DES CONTROLLERS
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/controllers/orderController.js`** (vide - à compléter)
   - Gestion de toutes les requêtes HTTP liées aux commandes
   - Méthodes:
     * `createOrder()` - Création commande avec upload IPFS
     * `getOrder()` - Récupération commande complète (on-chain + off-chain)
     * `getOrdersByClient()` - Historique client
     * `confirmPreparation()` - Confirmation restaurant
     * `assignDeliverer()` - Assignation livreur
     * `confirmPickup()` - Confirmation récupération
     * `updateGPSLocation()` - Mise à jour position GPS
     * `confirmDelivery()` - Confirmation livraison + split + tokens
     * `openDispute()` - Ouverture litige
     * `getOrderHistory()` - Historique avec pagination

2. **`backend/src/controllers/userController.js`** (vide - à compléter)
   - Gestion des utilisateurs (clients)
   - Méthodes:
     * `registerUser()` - Inscription client
     * `getUserProfile()` - Profil avec balance tokens
     * `updateUserProfile()` - Mise à jour profil
     * `getUserOrders()` - Commandes du client
     * `getUserTokens()` - Balance et historique tokens

3. **`backend/src/controllers/restaurantController.js`** (vide - à compléter)
   - Gestion des restaurants
   - Méthodes:
     * `registerRestaurant()` - Inscription restaurant avec upload IPFS
     * `getRestaurant()` - Détails restaurant avec menu
     * `getAllRestaurants()` - Liste avec filtres
     * `updateRestaurant()` - Mise à jour
     * `getRestaurantOrders()` - Commandes du restaurant
     * `getRestaurantAnalytics()` - Statistiques
     * `updateMenu()` - Gestion menu avec images IPFS

4. **`backend/src/controllers/delivererController.js`** (vide - à compléter)
   - Gestion des livreurs
   - Méthodes:
     * `registerDeliverer()` - Inscription livreur
     * `getDeliverer()` - Profil avec statut staking
     * `getAvailableDeliverers()` - Liste disponible avec distance
     * `updateDelivererStatus()` - Disponibilité
     * `stakeAsDeliverer()` - Staking on-chain
     * `unstake()` - Retrait staking
     * `getDelivererOrders()` - Livraisons
     * `getDelivererEarnings()` - Revenus depuis blockchain events

### ÉTAPE 10: IMPLÉMENTATION DES ROUTES
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/routes/orders.js`** (vide - à compléter)
   - Routes API commandes:
     * `POST /api/orders/create`
     * `GET /api/orders/:id`
     * `GET /api/orders/client/:address`
     * `POST /api/orders/:id/confirm-preparation`
     * `POST /api/orders/:id/assign-deliverer`
     * `POST /api/orders/:id/confirm-pickup`
     * `POST /api/orders/:id/update-gps`
     * `POST /api/orders/:id/confirm-delivery`
     * `POST /api/orders/:id/dispute`
     * `GET /api/orders/history/:address`

2. **`backend/src/routes/users.js`** (vide - à compléter)
   - Routes API utilisateurs:
     * `POST /api/users/register`
     * `GET /api/users/:address`
     * `PUT /api/users/:address`
     * `GET /api/users/:address/orders`
     * `GET /api/users/:address/tokens`

3. **`backend/src/routes/restaurants.js`** (vide - à compléter)
   - Routes API restaurants:
     * `POST /api/restaurants/register`
     * `GET /api/restaurants`
     * `GET /api/restaurants/:id`
     * `PUT /api/restaurants/:id`
     * `GET /api/restaurants/:id/orders`
     * `GET /api/restaurants/:id/analytics`
     * `PUT /api/restaurants/:id/menu`

4. **`backend/src/routes/deliverers.js`** (vide - à compléter)
   - Routes API livreurs:
     * `POST /api/deliverers/register`
     * `GET /api/deliverers/:address`
     * `GET /api/deliverers/available`
     * `PUT /api/deliverers/:address/status`
     * `POST /api/deliverers/stake`
     * `POST /api/deliverers/unstake`
     * `GET /api/deliverers/:address/orders`
     * `GET /api/deliverers/:address/earnings`

### ÉTAPE 11: IMPLÉMENTATION DU SERVEUR PRINCIPAL
**Fichier à compléter:** `backend/src/server.js` (vide - à compléter)

**Implémenter:**
- Initialisation Express.js
- Configuration middlewares (CORS, helmet, morgan, body-parser)
- Connexions aux services (MongoDB, Blockchain, IPFS)
- Montage des routes API
- Démarrage serveur HTTP et Socket.io
- Gestion centralisée des erreurs

### ÉTAPE 12: CONFIGURATION DU package.json
**Fichier à compléter:** `backend/package.json`

**À ajouter:**
- Scripts: `start`, `dev`, `test`, `seed`
- Configurer les dépendances

**Créer:** `backend/.env.example`
- Variables d'environnement requises
- Server, MongoDB, Blockchain, IPFS, Notifications, JWT

### ÉTAPE 13: TEST DE L'API
1. Démarrer le serveur:
   ```bash
   npm run dev
   ```
2. Tester les endpoints avec Postman ou curl:
   - `GET /api/restaurants`
   - `POST /api/users/register`
   - `POST /api/orders/create`
3. Vérifier les connexions:
   - MongoDB connecté
   - Blockchain connectée
   - IPFS connecté

### ÉTAPE 14: DOCUMENTATION
**Fichier à compléter:** `backend/README.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Documentation complète du backend
- Description de chaque fichier et composant
- Architecture détaillée
- Endpoints API
- Modèles MongoDB
- Services et leurs méthodes

### ÉTAPE 15: VALIDATION DU SPRINT 2
✓ Tous les fichiers vides complétés avec le code
✓ API fonctionnelle avec tous les endpoints
✓ MongoDB connecté et opérationnel
✓ Connexion blockchain établie
✓ IPFS configuré
✓ Socket.io pour notifications temps réel
✓ Documentation complète
✓ Tests manuels effectués

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Configuration (Fichiers vides - à compléter)
- `backend/src/config/blockchain.js` ⚠️ VIDE
- `backend/src/config/ipfs.js` ⚠️ VIDE
- `backend/src/config/database.js` ⚠️ VIDE

### 2. Modèles MongoDB (Fichiers vides - à compléter)
- `backend/src/models/User.js` ⚠️ VIDE
- `backend/src/models/Restaurant.js` ⚠️ VIDE
- `backend/src/models/Order.js` ⚠️ VIDE
- `backend/src/models/Deliverer.js` ⚠️ VIDE

### 3. Services (Fichiers vides - à compléter)
- `backend/src/services/blockchainService.js` ⚠️ VIDE
- `backend/src/services/ipfsService.js` ⚠️ VIDE
- `backend/src/services/notificationService.js` ⚠️ VIDE

### 4. Middlewares (Fichiers vides - à compléter)
- `backend/src/middleware/auth.js` ⚠️ VIDE
- `backend/src/middleware/validation.js` ⚠️ VIDE

### 5. Utils (Fichiers vides - à compléter)
- `backend/src/utils/priceOracle.js` ⚠️ VIDE
- `backend/src/utils/gpsTracker.js` ⚠️ VIDE

### 6. Controllers (Fichiers vides - à compléter)
- `backend/src/controllers/orderController.js` ⚠️ VIDE
- `backend/src/controllers/userController.js` ⚠️ VIDE
- `backend/src/controllers/restaurantController.js` ⚠️ VIDE
- `backend/src/controllers/delivererController.js` ⚠️ VIDE

### 7. Routes (Fichiers vides - à compléter)
- `backend/src/routes/orders.js` ⚠️ VIDE
- `backend/src/routes/users.js` ⚠️ VIDE
- `backend/src/routes/restaurants.js` ⚠️ VIDE
- `backend/src/routes/deliverers.js` ⚠️ VIDE

### 8. Serveur Principal (Fichier vide - à compléter)
- `backend/src/server.js` ⚠️ VIDE

### 9. Configuration
- `backend/package.json` (à compléter avec scripts)
- `backend/.env.example` (à créer)

### 10. Documentation
- `backend/README.md` (peut être complété après implémentation)

---

## ENDPOINTS PRINCIPAUX À IMPLÉMENTER

### Commandes
- `POST /api/orders/create` - Création commande
- `GET /api/orders/:id` - Détails commande
- `POST /api/orders/:id/confirm-preparation` - Confirmation restaurant
- `POST /api/orders/:id/assign-deliverer` - Assignation livreur
- `POST /api/orders/:id/confirm-pickup` - Récupération
- `POST /api/orders/:id/update-gps` - Mise à jour GPS
- `POST /api/orders/:id/confirm-delivery` - Livraison
- `POST /api/orders/:id/dispute` - Litige

### Utilisateurs
- `POST /api/users/register` - Inscription client
- `GET /api/users/:address` - Profil utilisateur
- `PUT /api/users/:address` - Mise à jour profil
- `GET /api/users/:address/orders` - Commandes du client
- `GET /api/users/:address/tokens` - Balance tokens

### Restaurants
- `POST /api/restaurants/register` - Inscription restaurant
- `GET /api/restaurants` - Liste restaurants
- `GET /api/restaurants/:id` - Détails restaurant
- `PUT /api/restaurants/:id` - Mise à jour
- `GET /api/restaurants/:id/orders` - Commandes
- `GET /api/restaurants/:id/analytics` - Statistiques
- `PUT /api/restaurants/:id/menu` - Mise à jour menu

### Livreurs
- `POST /api/deliverers/register` - Inscription livreur
- `GET /api/deliverers/:address` - Profil livreur
- `GET /api/deliverers/available` - Livreurs disponibles
- `PUT /api/deliverers/:address/status` - Mise à jour statut
- `POST /api/deliverers/stake` - Staking livreur
- `POST /api/deliverers/unstake` - Retrait staking
- `GET /api/deliverers/:address/orders` - Livraisons
- `GET /api/deliverers/:address/earnings` - Revenus

---

## FONCTIONNALITÉS DÉTAILLÉES PAR COMPOSANT

### blockchainService.js
- Abstraction complète des interactions avec smart contracts
- Gestion des transactions et events
- Intégration avec ethers.js
- Écoute des events pour notifications temps réel

### ipfsService.js
- Upload/download de fichiers (images, JSON)
- Intégration Pinata ou IPFS local
- Gestion des hash IPFS
- URLs gateway pour accès aux fichiers

### notificationService.js
- Notifications Socket.io temps réel
- Envoi d'emails
- Notifications par rôle (client, restaurant, livreur)
- Intégration avec les events blockchain

### Models MongoDB
- Schémas Mongoose pour toutes les entités
- Méthodes statiques et d'instance
- Validation des données
- Index pour performance

---

## LIVRABLES ATTENDUS

✓ API fonctionnelle avec tous les endpoints
✓ MongoDB connecté et opérationnel
✓ Connexion blockchain établie
✓ IPFS configuré
✓ Socket.io pour notifications temps réel
✓ Documentation complète
✓ Tests manuels effectués

---

## NOTES IMPORTANTES

- Backend sert de couche intermédiaire entre frontends et blockchain
- MongoDB pour données off-chain (menus, GPS tracking, analytics)
- Socket.io pour notifications temps réel
- IPFS pour stockage décentralisé des images
- Tous les appels blockchain via `blockchainService`
- Validation des données avant envoi à la blockchain
- Gestion d'erreurs centralisée

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 3: Frontend Client App
→ Lire `SPRINT_3.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_3.txt` pour les étapes détaillées

