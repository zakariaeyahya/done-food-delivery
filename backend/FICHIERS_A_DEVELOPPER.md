# 📋 Fichiers à Développer (Sans Smart Contracts)

## ✅ Configuration terminée
- ✅ MongoDB Atlas connecté et testé
- ✅ Pinata API keys obtenues

---

## 🎯 PRIORITÉ 1 : Configuration et Infrastructure (3 fichiers)

### 1. `backend/src/config/database.js` ⭐
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : Aucune (MongoDB déjà testé)  
**Temps estimé** : 1-2 heures  
**Description** : Connexion MongoDB via Mongoose  
**Implémenté** :
- ✅ `connectDB()` - Connexion MongoDB
- ✅ `disconnectDB()` - Fermeture propre
- ✅ `getConnectionStatus()` - État de connexion
- ✅ `isConnected()` - Vérification
- ✅ `getMongoose()`, `getConnection()`, etc.

### 2. `backend/src/config/ipfs.js` ⭐
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : Pinata API keys dans .env  
**Temps estimé** : 1-2 heures  
**Description** : Configuration IPFS/Pinata  
**Implémenté** :
- ✅ `initIPFS()` - Initialisation Pinata ou gateway public
- ✅ `getPinataConfig()` - Récupération config
- ✅ `getIPFSGateway()` - URL du gateway
- ✅ `testConnection()` - Test de connexion

### 3. `backend/src/server.js` ⭐
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : database.js et ipfs.js (blockchain commenté)  
**Temps estimé** : 2-3 heures  
**Description** : Serveur Express principal  
**Implémenté** :
- ✅ Initialisation Express
- ✅ Middlewares (CORS, helmet, morgan)
- ✅ Connexions (MongoDB, IPFS - blockchain commenté)
- ✅ Routes API (structure de base)
- ✅ Socket.io (notifications)
- ✅ Gestion d'erreurs

---

## 🎯 PRIORITÉ 2 : Modèles MongoDB (4 fichiers)

### 4. `backend/src/models/User.js`
**Status** : ✅ DÉVELOPPÉ ET TESTÉ  
**Dépendances** : database.js  
**Temps estimé** : 1 heure  
**Description** : Schéma Mongoose pour clients  
**Implémenté** :
- ✅ Schéma User (address, name, email, phone, deliveryAddresses)
- ✅ Méthodes : `findByAddress()`, `updateProfile()`, `addDeliveryAddress()`

### 5. `backend/src/models/Restaurant.js`
**Status** : ✅ DÉVELOPPÉ ET TESTÉ  
**Dépendances** : database.js  
**Temps estimé** : 1-2 heures  
**Description** : Schéma Mongoose pour restaurants  
**Implémenté** :
- ✅ Schéma Restaurant (address, name, cuisine, location, images, menu, rating)
- ✅ Méthodes : `findByAddress()`, `updateMenu()`, `incrementOrderCount()`, `isMenuItemAvailable()`

### 6. `backend/src/models/Order.js`
**Status** : ✅ DÉVELOPPÉ ET TESTÉ  
**Dépendances** : database.js  
**Temps estimé** : 1-2 heures  
**Description** : Schéma Mongoose pour commandes (données off-chain)  
**Implémenté** :
- ✅ Schéma Order (orderId, txHash, client, restaurant, deliverer, items, status, gpsTracking)
- ✅ Méthodes : `findByOrderId()`, `updateStatus()`, `addGPSLocation()`, `getOrdersByClient()`, `getOrdersByRestaurant()`, `getOrdersByDeliverer()`, `canBeUpdated()`

### 7. `backend/src/models/Deliverer.js`
**Status** : ✅ DÉVELOPPÉ ET TESTÉ  
**Dépendances** : database.js  
**Temps estimé** : 1 heure  
**Description** : Schéma Mongoose pour livreurs  
**Implémenté** :
- ✅ Schéma Deliverer (address, name, phone, vehicleType, currentLocation, isAvailable, isStaked)
- ✅ Méthodes : `findByAddress()`, `updateLocation()`, `setAvailability()`, `incrementDeliveryCount()`, `getAvailableDeliverers()`, `canAcceptDelivery()`

---

## 🎯 PRIORITÉ 3 : Utilitaires (2 fichiers)

### 8. `backend/src/utils/priceOracle.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : Aucune (API externe CoinGecko)  
**Temps estimé** : 1-2 heures  
**Description** : Simulation Chainlink Price Feed  
**Implémenté** :
- ✅ `getMATICPrice()` - Prix MATIC/USD (CoinGecko)
- ✅ `convertUSDtoMATIC()` - Conversion USD → MATIC
- ✅ `convertMATICtoUSD()` - Conversion MATIC → USD
- ✅ `formatMATIC()`, `formatUSD()` - Formatage

### 9. `backend/src/utils/gpsTracker.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : Aucune (calculs purs)  
**Temps estimé** : 1-2 heures  
**Description** : Simulation tracking GPS  
**Implémenté** :
- ✅ `calculateDistance()` - Distance Haversine
- ✅ `isNearby()` - Vérification proximité
- ✅ `getETA()` - Estimation temps d'arrivée
- ✅ `generateMockRoute()` - Génération route simulée

---

## 🎯 PRIORITÉ 4 : Services (2 fichiers)

### 10. `backend/src/services/ipfsService.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : ipfs.js  
**Temps estimé** : 2-3 heures  
**Description** : Service upload/download IPFS  
**Implémenté** :
- ✅ `uploadJSON()` - Upload objet JSON vers IPFS
- ✅ `uploadImage()` - Upload image vers IPFS
- ✅ `uploadMultipleImages()` - Upload plusieurs images
- ✅ `getJSON()` - Télécharger JSON depuis IPFS
- ✅ `getImage()` - Télécharger image depuis IPFS
- ✅ `pinFile()` - Pin fichier IPFS
- ✅ `testConnection()` - Test connexion

### 11. `backend/src/services/notificationService.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : Socket.io (partiel, peut être fait sans blockchain)  
**Temps estimé** : 2-3 heures  
**Description** : Service notifications (Socket.io + Email)  
**Implémenté** :
- ✅ `initNotificationService()` - Initialisation Socket.io
- ✅ `notifyOrderCreated()` - Notification création commande
- ✅ `notifyDeliverersAvailable()` - Notification livreurs
- ✅ `notifyClientOrderUpdate()` - Notification client
- ✅ `notifyArbitrators()` - Notification arbitres
- ✅ `sendEmail()` - Envoi email (nodemailer)

---

## 🎯 PRIORITÉ 5 : Middleware (2 fichiers)

### 12. `backend/src/middleware/validation.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : express-validator  
**Temps estimé** : 1-2 heures  
**Description** : Validation des requêtes HTTP  
**Implémenté** :
- ✅ `validateOrderCreation()` - Validation création commande
- ✅ `validateOrderId()` - Validation ID commande
- ✅ `validateAddress()` - Validation adresse Ethereum
- ✅ `validateGPS()` - Validation coordonnées GPS

### 13. `backend/src/middleware/auth.js`
**Status** : ✅ DÉVELOPPÉ  
**Dépendances** : ethers.js (partiel)  
**Temps estimé** : 1-2 heures  
**Description** : Authentification Web3  
**Implémenté** :
- ✅ `verifySignature()` - Vérification signature wallet (ethers.js)
- ✅ `requireRole()` - Vérification rôle (MongoDB pour l'instant, blockchain plus tard)
- ✅ `requireOwnership()` - Vérification propriétaire

---

## 📊 Résumé par Priorité

| Priorité | Fichiers | Temps Estimé | Status |
|----------|----------|--------------|--------|
| **Priorité 1** | 3 fichiers | 4-7 heures | ✅ TERMINÉ |
| **Priorité 2** | 4 fichiers | 4-6 heures | ✅ TERMINÉ |
| **Priorité 3** | 2 fichiers | 2-4 heures | ✅ TERMINÉ |
| **Priorité 4** | 2 fichiers | 4-6 heures | ✅ TERMINÉ |
| **Priorité 5** | 2 fichiers | 2-4 heures | ✅ TERMINÉ |
| **Phase 6** | 6 fichiers | 8-12 heures | ⏳ À DÉVELOPPER |
| **Phase 7** | 2 fichiers | 4-6 heures | ⏳ À DÉVELOPPER |
| **Phase 8** | 1 fichier | 1 heure | ⏳ À DÉVELOPPER |
| **TOTAL (Sans Blockchain)** | **22 fichiers** | **29-44 heures** | ✅ **13/22 COMPLÉTÉ** (59%) |
| **TOTAL (Avec Blockchain)** | **+2 fichiers** | **+6-8 heures** | ⚠️ **NÉCESSITE SMART CONTRACTS** |

---

## 🚫 Fichiers nécessitant les Smart Contracts (À FAIRE APRÈS PHASE 7)

**⚠️ ATTENTION : La prochaine étape après Phase 7 nécessite les smart contracts déployés !**

Ces fichiers nécessitent les smart contracts déployés :

- ❌ `backend/src/config/blockchain.js` - Nécessite contrats déployés
- ❌ `backend/src/services/blockchainService.js` - Nécessite contrats
- ❌ Activation des appels blockchain dans `orderController.js` :
  - `createOrder()` - Appel `blockchainService.createOrder()`
  - `confirmPreparation()` - Appel `blockchainService.confirmPreparation()`
  - `assignDeliverer()` - Appel `blockchainService.assignDeliverer()`
  - `confirmPickup()` - Appel `blockchainService.confirmPickup()`
  - `confirmDelivery()` - Appel `blockchainService.confirmDelivery()`
  - `openDispute()` - Appel `blockchainService.openDispute()`
- ❌ Activation des appels blockchain dans `userController.js` :
  - `getUserTokens()` - Appel `blockchainService.getTokenBalance()`
- ❌ Activation des appels blockchain dans `delivererController.js` :
  - `stakeAsDeliverer()` - Appel `blockchainService.stake()`
  - `unstake()` - Appel `blockchainService.unstake()`
- ❌ Routes qui utilisent `requireRole()` avec vérification blockchain (au lieu de MongoDB)

---

## 🎯 Ordre Recommandé de Développement

### Phase 1 : Infrastructure (Terminé)
1. ✅ `database.js` - Connexion MongoDB (DÉVELOPPÉ)
2. ✅ `ipfs.js` - Configuration IPFS/Pinata (DÉVELOPPÉ)
3. ✅ `server.js` - Serveur Express (DÉVELOPPÉ, blockchain commenté)

### Phase 2 : Modèles (Après Phase 1)
4. ✅ `User.js` - DÉVELOPPÉ ET TESTÉ
5. ✅ `Restaurant.js` - DÉVELOPPÉ ET TESTÉ
6. ✅ `Order.js` - DÉVELOPPÉ ET TESTÉ
7. ✅ `Deliverer.js` - DÉVELOPPÉ ET TESTÉ

### Phase 3 : Utilitaires (Terminé)
8. ✅ `priceOracle.js` - DÉVELOPPÉ
9. ✅ `gpsTracker.js` - DÉVELOPPÉ

### Phase 4 : Services (Terminé)
10. ✅ `ipfsService.js` - DÉVELOPPÉ
11. ✅ `notificationService.js` - DÉVELOPPÉ (partiel, sans blockchain)

### Phase 5 : Middleware (Terminé)
12. ✅ `validation.js` - DÉVELOPPÉ
13. ✅ `auth.js` - DÉVELOPPÉ (verifySignature + requireRole via MongoDB)

### Phase 6 : Controllers Simples (Sans Blockchain) ⭐ PROCHAINE ÉTAPE
14. `userController.js` - 100% MongoDB
    - ✅ `registerUser()` - Enregistrement client (MongoDB uniquement)
    - ✅ `getUserProfile()` - Profil utilisateur (MongoDB uniquement)
    - ✅ `updateUserProfile()` - Mise à jour profil (MongoDB uniquement)
    - ✅ `getUserOrders()` - Commandes client (MongoDB uniquement)
    - ⚠️ `getUserTokens()` - Mock temporaire (retourner `{ balance: "0", transactions: [] }`)

15. `restaurantController.js` - 100% MongoDB
    - ✅ `registerRestaurant()` - Enregistrement restaurant (MongoDB uniquement)
    - ✅ `getRestaurant()` - Détails restaurant (MongoDB uniquement)
    - ✅ `getAllRestaurants()` - Liste restaurants (MongoDB uniquement)
    - ✅ `updateRestaurant()` - Mise à jour restaurant (MongoDB uniquement)
    - ✅ `getRestaurantOrders()` - Commandes restaurant (MongoDB uniquement)
    - ✅ `getRestaurantAnalytics()` - Statistiques (Calculs MongoDB uniquement)
    - ✅ `updateMenu()` - Mise à jour menu (MongoDB uniquement)

16. `delivererController.js` - 100% MongoDB
    - ✅ `registerDeliverer()` - Enregistrement livreur (MongoDB uniquement)
    - ✅ `getDeliverer()` - Profil livreur (MongoDB uniquement)
    - ✅ `getAvailableDeliverers()` - Livreurs disponibles (MongoDB uniquement)
    - ✅ `updateDelivererStatus()` - Mise à jour statut (MongoDB uniquement)
    - ✅ `getDelivererOrders()` - Commandes livreur (MongoDB uniquement)
    - ⚠️ `stakeAsDeliverer()` - Mock temporaire (sauvegarder dans MongoDB seulement)
    - ⚠️ `unstake()` - Mock temporaire
    - ✅ `getDelivererEarnings()` - Calculs MongoDB uniquement

17. Routes correspondantes
    - ✅ `routes/users.js` - Routes API utilisateurs
    - ✅ `routes/restaurants.js` - Routes API restaurants
    - ✅ `routes/deliverers.js` - Routes API livreurs

### Phase 7 : Controllers avec IPFS
18. `orderController.js` - Fonctions MongoDB/IPFS uniquement
    - ✅ `getOrder()` - Détails commande (MongoDB + IPFS, sans blockchain)
    - ✅ `getOrdersByClient()` - Commandes client (MongoDB uniquement)
    - ✅ `updateGPSLocation()` - Mise à jour GPS (MongoDB uniquement)
    - ✅ `getOrderHistory()` - Historique commandes (MongoDB uniquement)
    - ⚠️ `createOrder()` - Partiel (MongoDB + IPFS, mock blockchain)
    - ⚠️ `confirmPreparation()` - Partiel (MongoDB, mock blockchain)
    - ⚠️ `assignDeliverer()` - Partiel (MongoDB, mock blockchain)
    - ⚠️ `confirmPickup()` - Partiel (MongoDB, mock blockchain)
    - ⚠️ `confirmDelivery()` - Partiel (MongoDB, mock blockchain)
    - ⚠️ `openDispute()` - Partiel (MongoDB + IPFS, mock blockchain)

19. Routes orders
    - ✅ `routes/orders.js` - Routes API commandes

### Phase 8 : Intégration dans server.js
20. Décommenter les routes dans `server.js`
    - Activer les routes users, restaurants, deliverers, orders

---

## ✅ Checklist de Progression

- [x] Phase 1 : Infrastructure (3 fichiers)
  - [x] `database.js` ✅
  - [x] `ipfs.js` ✅
  - [x] `server.js` ✅
- [x] Phase 2 : Modèles (4 fichiers)
  - [x] `User.js` ✅
  - [x] `Restaurant.js` ✅
  - [x] `Order.js` ✅
  - [x] `Deliverer.js` ✅
- [x] Phase 3 : Utilitaires (2 fichiers)
  - [x] `priceOracle.js` ✅
  - [x] `gpsTracker.js` ✅
- [x] Phase 4 : Services (2 fichiers)
  - [x] `ipfsService.js` ✅
  - [x] `notificationService.js` ✅
- [x] Phase 5 : Middleware (2 fichiers)
  - [x] `validation.js` ✅
  - [x] `auth.js` ✅
- [ ] Phase 6 : Controllers Simples (Sans Blockchain) ⭐ PROCHAINE ÉTAPE
  - [ ] `userController.js` - 100% MongoDB
  - [ ] `restaurantController.js` - 100% MongoDB
  - [ ] `delivererController.js` - 100% MongoDB
  - [ ] `routes/users.js`
  - [ ] `routes/restaurants.js`
  - [ ] `routes/deliverers.js`
- [ ] Phase 7 : Controllers avec IPFS
  - [ ] `orderController.js` - Fonctions MongoDB/IPFS uniquement
  - [ ] `routes/orders.js`
- [ ] Phase 8 : Intégration
  - [ ] Décommenter routes dans `server.js`

---

## 💡 Notes Importantes

1. **Commencez par Priorité 1** : Ces fichiers sont la base de tout ✅ TERMINÉ
2. **Testez après chaque fichier** : Vérifiez que tout fonctionne
3. **Commentez les parties blockchain** : Dans controllers, commentez les appels `blockchainService` temporairement
4. **Utilisez les pseudo-codes existants** : Tous les fichiers ont déjà des TODO détaillés
5. **Phase 6-7 peuvent être développées maintenant** : Controllers et routes sans blockchain
6. **Phase 8 nécessite smart contracts** : Après déploiement des contrats, activer `blockchainService.js`

## 🎯 Prochaines Étapes Recommandées

### Maintenant (Sans Smart Contracts) :
1. **Phase 6** : Développer `userController.js`, `restaurantController.js`, `delivererController.js` + routes
2. **Phase 7** : Développer `orderController.js` (partiel, sans blockchain) + routes orders
3. **Phase 8** : Intégrer toutes les routes dans `server.js`

### Après Smart Contracts (Sprint 1 terminé) :
4. **Phase 9** : Développer `blockchain.js` et `blockchainService.js`
5. **Phase 10** : Activer les appels blockchain dans les controllers
6. **Phase 11** : Tests d'intégration complets

---

**Dernière mise à jour** : 
- ✅ Tous les fichiers infrastructure, modèles, services, middleware sont développés et testés (29/29 tests passés)
- ⭐ **Prochaine étape** : Phase 6 - Controllers simples (sans blockchain)
- ⚠️ **Après Phase 7** : Attendre smart contracts pour activer blockchainService

