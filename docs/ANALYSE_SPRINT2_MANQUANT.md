# Analyse Sprint 2 : Ce qui manque à développer

## 📊 ÉTAT GLOBAL : ~70% complété

### ✅ CE QUI EST DÉJÀ FAIT

#### 1. Structure et Configuration
- ✅ Structure des dossiers complète
- ✅ `server.js` implémenté avec Socket.io
- ✅ Routes montées (orders, users, restaurants, deliverers, admin, analytics, oracles, disputes, tokens)
- ✅ Middlewares de base (auth, validation, rateLimit, performanceMonitoring)
- ✅ Configuration MongoDB (`database.js`) - **IMPLÉMENTÉ**
- ✅ Configuration IPFS (`ipfs.js`) - **IMPLÉMENTÉ avec Pinata**
- ⚠️ Configuration Blockchain (`blockchain.js`) - **PARTIELLEMENT IMPLÉMENTÉ (TODOs)**

#### 2. Modèles MongoDB
- ✅ `User.js` - **IMPLÉMENTÉ**
- ✅ `Restaurant.js` - **IMPLÉMENTÉ**
- ✅ `Order.js` - **IMPLÉMENTÉ**
- ✅ `Deliverer.js` - **IMPLÉMENTÉ**

#### 3. Services
- ✅ `ipfsService.js` - **IMPLÉMENTÉ (avec Pinata)**
- ✅ `notificationService.js` - **IMPLÉMENTÉ (Socket.io + Email)**
- ⚠️ `blockchainService.js` - **PARTIELLEMENT IMPLÉMENTÉ (beaucoup de TODOs)**

#### 4. Controllers
- ✅ `orderController.js` - **IMPLÉMENTÉ (avec placeholders)**
- ✅ `userController.js` - **IMPLÉMENTÉ**
- ✅ `restaurantController.js` - **IMPLÉMENTÉ (avec placeholders)**
- ✅ `delivererController.js` - **IMPLÉMENTÉ**
- ✅ `adminController.js` - **IMPLÉMENTÉ (Sprint 8 - bonus)**
- ✅ `analyticsController.js` - **IMPLÉMENTÉ (Sprint 8 - bonus)**
- ✅ `oracleController.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**
- ✅ `disputeController.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**
- ✅ `tokenController.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**

#### 5. Routes
- ✅ `orders.js` - **IMPLÉMENTÉ**
- ✅ `users.js` - **IMPLÉMENTÉ**
- ✅ `restaurants.js` - **IMPLÉMENTÉ**
- ✅ `deliverers.js` - **IMPLÉMENTÉ**
- ✅ `admin.js` - **IMPLÉMENTÉ (Sprint 8 - bonus)**
- ✅ `analytics.js` - **IMPLÉMENTÉ (Sprint 8 - bonus)**
- ✅ `oracles.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**
- ✅ `disputes.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**
- ✅ `tokens.js` - **IMPLÉMENTÉ (Sprint 6 - bonus)**

#### 6. Utils
- ✅ `priceOracle.js` - **IMPLÉMENTÉ**
- ✅ `gpsTracker.js` - **IMPLÉMENTÉ**
- ✅ `circuitBreaker.js` - **IMPLÉMENTÉ (bonus)**

#### 7. Middlewares
- ✅ `auth.js` - **IMPLÉMENTÉ (Web3 signature verification)**
- ✅ `validation.js` - **IMPLÉMENTÉ**
- ✅ `rateLimit.js` - **IMPLÉMENTÉ (bonus)**
- ✅ `performanceMonitoring.js` - **IMPLÉMENTÉ (bonus)**
- ✅ `verifyAdminRole.js` - **IMPLÉMENTÉ (bonus)**

---

## ❌ CE QUI MANQUE À DÉVELOPPER

### 🔴 PRIORITÉ 1 : BLOCKCHAIN SERVICE (CRITIQUE)

**Fichier:** `backend/src/services/blockchainService.js`

**État actuel:** Beaucoup de fonctions avec TODOs, placeholders, ou non implémentées

**Fonctions à compléter:**

1. **`createOrder(params)`** - ⚠️ TODO
   - Récupérer instance OrderManager
   - Calculer platformFee et totalAmount
   - Connecter wallet client
   - Appeler createOrder on-chain
   - Parser events pour orderId

2. **`confirmPreparation(orderId, restaurantAddress)`** - ⚠️ TODO
   - Appeler confirmPreparation on-chain
   - Retourner txHash

3. **`assignDeliverer(orderId, delivererAddress)`** - ⚠️ TODO
   - Vérifier que livreur est staké
   - Appeler assignDeliverer on-chain
   - Retourner txHash

4. **`confirmPickup(orderId, delivererAddress)`** - ⚠️ TODO
   - Appeler confirmPickup on-chain
   - Retourner txHash

5. **`confirmDelivery(orderId, delivererAddress)`** - ⚠️ TODO
   - Appeler confirmDelivery on-chain
   - Déclencher split automatique
   - Mint tokens pour client
   - Retourner txHash

6. **`openDispute(orderId, reason, evidence)`** - ⚠️ TODO
   - Appeler openDispute on-chain
   - Retourner txHash

7. **`resolveDispute(orderId, winner)`** - ⚠️ TODO
   - Appeler resolveDispute on-chain
   - Retourner txHash

8. **`getOrder(orderId)`** - ⚠️ TODO
   - Lire données on-chain depuis OrderManager
   - Retourner struct Order complète

9. **`stakeDeliverer(delivererAddress, amount)`** - ⚠️ TODO
   - Appeler stakeAsDeliverer on-chain
   - Retourner txHash

10. **`unstake(delivererAddress)`** - ⚠️ TODO
    - Appeler unstake on-chain
    - Retourner txHash

11. **`isStaked(delivererAddress)`** - ⚠️ TODO
    - Lire isStaked depuis DoneStaking
    - Retourner boolean

12. **`getTokenBalance(address)`** - ⚠️ TODO
    - Lire balance depuis DoneToken
    - Retourner balance en DONE tokens

13. **`mintTokens(address, amount)`** - ⚠️ TODO
    - Appeler mint on-chain (nécessite MINTER_ROLE)
    - Retourner txHash

14. **`listenEvents()`** - ⚠️ TODO
    - Écouter events blockchain (OrderCreated, PaymentSplit, etc.)
    - Émettre via EventEmitter pour Socket.io
    - Intégration avec notificationService

**Impact:** **CRITIQUE** - Sans ces fonctions, aucune interaction réelle avec la blockchain n'est possible.

---

### 🔴 PRIORITÉ 2 : CONFIGURATION BLOCKCHAIN (CRITIQUE)

**Fichier:** `backend/src/config/blockchain.js`

**État actuel:** Structure créée mais fonctions non implémentées (TODOs)

**Fonctions à compléter:**

1. **`initBlockchain()`** - ⚠️ TODO
   - Créer provider ethers.js avec MUMBAI_RPC_URL
   - Créer wallet depuis PRIVATE_KEY
   - Charger ABIs depuis artifacts/
   - Instancier les 4 contrats (OrderManager, PaymentSplitter, Token, Staking)
   - Stocker instances dans objet contracts
   - Retourner instances

2. **`getContractInstance(contractName)`** - ⚠️ TODO
   - Retourner instance du contrat demandé

3. **`getProvider()`** - ⚠️ TODO
   - Retourner provider ethers.js

4. **`getWallet()`** - ⚠️ TODO
   - Retourner wallet backend

5. **`isConnected()`** - ⚠️ TODO
   - Vérifier si blockchain est connectée

**Impact:** **CRITIQUE** - Sans cette configuration, blockchainService ne peut pas fonctionner.

---

### 🟡 PRIORITÉ 3 : CONTROLLERS - IMPLÉMENTATION RÉELLE

**Fichiers concernés:**
- `backend/src/controllers/orderController.js`
- `backend/src/controllers/restaurantController.js`

**État actuel:** Controllers existent mais utilisent des placeholders/TODOs

**Fonctions à compléter dans `orderController.js`:**

1. **`createOrder()`** - ⚠️ Placeholder
   - Upload données vers IPFS
   - Appeler blockchainService.createOrder()
   - Créer enregistrement MongoDB
   - Notifier restaurant via Socket.io

2. **`confirmPreparation()`** - ⚠️ Placeholder
   - Appeler blockchainService.confirmPreparation()
   - Mettre à jour MongoDB
   - Notifier client

3. **`assignDeliverer()`** - ⚠️ Placeholder
   - Vérifier disponibilité livreur
   - Appeler blockchainService.assignDeliverer()
   - Mettre à jour MongoDB
   - Notifier livreur

4. **`confirmPickup()`** - ⚠️ Placeholder
   - Appeler blockchainService.confirmPickup()
   - Mettre à jour MongoDB
   - Notifier client

5. **`updateGPSLocation()`** - ⚠️ Placeholder
   - Mettre à jour MongoDB avec nouvelle position
   - Optionnel: Envoyer à GPS Oracle on-chain

6. **`confirmDelivery()`** - ⚠️ Placeholder
   - Appeler blockchainService.confirmDelivery()
   - Mettre à jour MongoDB
   - Notifier tous les acteurs

7. **`openDispute()`** - ⚠️ Placeholder
   - Upload evidence vers IPFS
   - Appeler blockchainService.openDispute()
   - Mettre à jour MongoDB
   - Notifier arbitres

**Fonctions à compléter dans `restaurantController.js`:**

1. **`addMenuItem()`** - ⚠️ Placeholder
   - Upload image vers IPFS
   - Ajouter au menu MongoDB
   - Retourner menu mis à jour

2. **`updateMenuItem()`** - ⚠️ Placeholder
   - Mettre à jour item dans MongoDB
   - Si nouvelle image: upload IPFS

3. **`deleteMenuItem()`** - ⚠️ Placeholder
   - Supprimer item du menu MongoDB

4. **`getRestaurantEarnings()`** - ⚠️ Placeholder
   - Lire events PaymentSplit depuis blockchain
   - Calculer total earnings
   - Retourner breakdown

5. **`withdrawEarnings()`** - ⚠️ Placeholder
   - Appeler withdraw sur PaymentSplitter
   - Retourner txHash

**Impact:** **MOYEN** - Les routes existent mais retournent des réponses placeholder.

---

### 🟢 PRIORITÉ 4 : AMÉLIORATIONS OPTIONNELLES

**Fichiers concernés:**
- `backend/src/utils/priceOracle.js` - ✅ Implémenté mais peut être amélioré
- `backend/src/utils/gpsTracker.js` - ✅ Implémenté mais peut être amélioré

**Améliorations possibles:**
- Intégration réelle avec Chainlink Price Feed (actuellement simulation)
- Intégration réelle avec GPS Oracle on-chain (actuellement simulation)

**Impact:** **FAIBLE** - Fonctionne déjà en mode simulation.

---

## 📋 CHECKLIST DE DÉVELOPPEMENT

### Phase 1 : Configuration Blockchain (CRITIQUE)
- [ ] Implémenter `initBlockchain()` dans `config/blockchain.js`
- [ ] Implémenter `getContractInstance()`
- [ ] Implémenter `getProvider()` et `getWallet()`
- [ ] Tester connexion avec Polygon Mumbai/Amoy
- [ ] Vérifier que les ABIs sont chargés correctement

### Phase 2 : Blockchain Service Core (CRITIQUE)
- [ ] Implémenter `createOrder()`
- [ ] Implémenter `getOrder()`
- [ ] Implémenter `confirmPreparation()`
- [ ] Implémenter `assignDeliverer()`
- [ ] Implémenter `confirmPickup()`
- [ ] Implémenter `confirmDelivery()`
- [ ] Implémenter `openDispute()`
- [ ] Implémenter `resolveDispute()`

### Phase 3 : Blockchain Service Staking & Tokens
- [ ] Implémenter `stakeDeliverer()`
- [ ] Implémenter `unstake()`
- [ ] Implémenter `isStaked()`
- [ ] Implémenter `getTokenBalance()`
- [ ] Implémenter `mintTokens()`

### Phase 4 : Blockchain Service Events
- [ ] Implémenter `listenEvents()`
- [ ] Intégrer avec notificationService
- [ ] Tester émission d'events via Socket.io

### Phase 5 : Controllers - Remplacement Placeholders
- [ ] Compléter `orderController.createOrder()`
- [ ] Compléter `orderController.confirmPreparation()`
- [ ] Compléter `orderController.assignDeliverer()`
- [ ] Compléter `orderController.confirmPickup()`
- [ ] Compléter `orderController.confirmDelivery()`
- [ ] Compléter `orderController.openDispute()`
- [ ] Compléter `restaurantController.addMenuItem()`
- [ ] Compléter `restaurantController.updateMenuItem()`
- [ ] Compléter `restaurantController.deleteMenuItem()`
- [ ] Compléter `restaurantController.getRestaurantEarnings()`
- [ ] Compléter `restaurantController.withdrawEarnings()`

### Phase 6 : Tests et Validation
- [ ] Tester workflow complet (création → livraison)
- [ ] Tester staking/unstaking
- [ ] Tester mint tokens
- [ ] Tester disputes
- [ ] Vérifier notifications Socket.io
- [ ] Vérifier emails

---

## 🎯 RÉSUMÉ

### Ce qui manque (par priorité):

1. **🔴 CRITIQUE (Bloquant):**
   - Configuration blockchain complète (`config/blockchain.js`)
   - Toutes les fonctions de `blockchainService.js` (14 fonctions)

2. **🟡 IMPORTANT (Fonctionnalités incomplètes):**
   - Remplacement des placeholders dans `orderController.js` (7 fonctions)
   - Remplacement des placeholders dans `restaurantController.js` (5 fonctions)

3. **🟢 OPTIONNEL (Améliorations):**
   - Intégration réelle Chainlink (actuellement simulation)
   - Intégration réelle GPS Oracle (actuellement simulation)

### Estimation du travail restant:

- **Configuration Blockchain:** 1-2 jours
- **Blockchain Service:** 5-7 jours
- **Controllers:** 2-3 jours
- **Tests:** 2-3 jours

**Total estimé:** 10-15 jours de développement

---

## ✅ CONCLUSION

Le Sprint 2 est **~70% complété**. Les éléments critiques manquants sont:

1. **L'intégration réelle avec la blockchain** (config + service)
2. **Le remplacement des placeholders** dans les controllers

Une fois ces éléments complétés, le backend sera **100% fonctionnel** et prêt pour l'intégration frontend.

