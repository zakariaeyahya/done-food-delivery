# SPRINT 5: FRONTEND DELIVERER APP

## OBJECTIF
Créer l'application React web-first pour les livreurs permettant d'accepter des livraisons, suivre les trajets en temps réel et gérer les gains. Application conçue en web-first avec possibilité PWA pour accès mobile.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES** ou **PARTIELLEMENT REMPLIS**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `frontend/deliverer/` (existe)
- ✓ `frontend/deliverer/src/` (existe)
- ✓ `frontend/deliverer/src/components/` (existe)
- ✓ `frontend/deliverer/src/pages/` (existe)
- ✓ `frontend/deliverer/src/services/` (existe)

**Fichiers existants mais vides/à compléter:**
- ✓ `frontend/deliverer/src/App.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/index.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/public/index.html` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/ConnectWallet.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/StakingPanel.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/AvailableOrders.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/ActiveDelivery.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/NavigationMap.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/EarningsTracker.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/components/RatingDisplay.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/pages/HomePage.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/pages/DeliveriesPage.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/pages/EarningsPage.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/pages/ProfilePage.jsx` (vide - à compléter)
- ✓ `frontend/deliverer/src/services/api.js` (vide - à compléter)
- ✓ `frontend/deliverer/src/services/blockchain.js` (vide - à compléter)
- ✓ `frontend/deliverer/src/services/geolocation.js` (vide - à compléter)
- ✓ `frontend/deliverer/src/index.css` (vide - à compléter)
- ✓ `frontend/deliverer/vite.config.js` (vide - à compléter)
- ✓ `frontend/deliverer/tailwind.config.js` (vide - à compléter)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Node.js (v18+) est installé
- ✓ Avoir l'URL de l'API backend (Sprint 2)
- ✓ Obtenir une clé API Google Maps
- ✓ Préparer les adresses des contrats déployés
- ✓ Tester l'accès GPS sur navigateur mobile

### ÉTAPE 2: INITIALISATION DU FRONTEND DELIVERER
1. Aller dans le dossier `frontend/deliverer/`:
   ```bash
   cd frontend/deliverer
   ```
2. Initialiser npm (si pas déjà fait):
   ```bash
   npm init -y
   ```
3. Installer les dépendances principales:
   ```bash
   npm install react-router-dom ethers socket.io-client @react-google-maps/api chart.js axios
   npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
   npx tailwindcss init -p
   ```

### ÉTAPE 3: CONFIGURATION DE TAILWINDCSS ET PWA
**Fichiers à compléter:**
- `tailwind.config.js` (vide - à compléter)
- `index.css` avec directives Tailwind (vide - à compléter)
- `vite.config.js` avec plugin PWA (vide - à compléter)
- `manifest.json` pour PWA (à créer)

### ÉTAPE 4: IMPLÉMENTATION DES SERVICES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/deliverer/src/services/api.js`** (vide - à compléter)
   - Service appels API backend
   - Fonctions: `getAvailableOrders()`, `acceptOrder()`, `confirmPickup()`, `confirmDelivery()`, `updateGPSLocation()`, `getEarnings()`, `getRating()`, `updateStatus()`, `getDelivererOrders()`

2. **`frontend/deliverer/src/services/blockchain.js`** (vide - à compléter)
   - Service interactions Web3
   - Fonctions: `connectWallet()`, `hasRole()`, `isStaked()`, `getStakeInfo()`, `stake()`, `unstake()`, `acceptOrderOnChain()`, `confirmPickupOnChain()`, `confirmDeliveryOnChain()`, `getSlashingEvents()`, `getEarningsEvents()`

3. **`frontend/deliverer/src/services/geolocation.js`** (vide - à compléter)
   - Service géolocalisation et calculs GPS
   - Fonctions: `getCurrentPosition()`, `watchPosition()`, `calculateRoute()`, `getDistance()`, `isNearLocation()`

### ÉTAPE 5: IMPLÉMENTATION DES COMPOSANTS
**Fichiers à compléter (existent mais vides):**

1. **`frontend/deliverer/src/components/ConnectWallet.jsx`** (vide - à compléter)
   - Connexion MetaMask pour livreur
   - Détection MetaMask
   - Vérification rôle DELIVERER_ROLE
   - Vérification staking (minimum 0.1 ETH)
   - Affichage montant staké actuel

2. **`frontend/deliverer/src/components/StakingPanel.jsx`** (vide - à compléter)
   - Panel gestion staking livreur
   - Affichage montant staké (MATIC + USD)
   - Statut: Staké / Non staké (badge visuel)
   - Input montant à staker (minimum 0.1 MATIC)
   - Bouton "Stake 0.1 ETH"
   - Bouton "Unstake" (si pas de livraison active)
   - Historique slashing

3. **`frontend/deliverer/src/components/AvailableOrders.jsx`** (vide - à compléter)
   - Liste commandes disponibles à accepter
   - Fetch commandes avec status PREPARING
   - Tri par distance (plus proche en premier)
   - Auto-refresh toutes les 10 secondes
   - Socket.io listener 'orderReady'
   - Distance au restaurant
   - Gains estimés (deliveryFee 20% du total)
   - Bouton "Accepter" par commande

4. **`frontend/deliverer/src/components/ActiveDelivery.jsx`** (vide - à compléter)
   - Affichage livraison en cours
   - Détails commande (orderId, client, items, total, delivery fee)
   - Adresse restaurant et client
   - Distance actuelle au restaurant/client
   - Bouton "Naviguer vers restaurant"
   - Bouton "Naviguer vers client"
   - Bouton "Confirmer pickup" (visible si proche restaurant < 100m)
   - Bouton "Confirmer delivery" (visible si proche client < 100m)
   - GPS tracking actif

5. **`frontend/deliverer/src/components/NavigationMap.jsx`** (vide - à compléter)
   - Carte navigation interactive Google Maps
   - Intégration @react-google-maps/api
   - Markers: position livreur, restaurant, client
   - Route vers restaurant (si step = 'pickup')
   - Route vers client (si step = 'delivery')
   - DirectionsService Google Maps
   - Update position temps réel (watchposition GPS)
   - ETA affiché

6. **`frontend/deliverer/src/components/EarningsTracker.jsx`** (vide - à compléter)
   - Suivi gains livreur
   - Gains aujourd'hui (MATIC + USD, nombre livraisons)
   - Tabs: Jour / Semaine / Mois
   - Graphique line chart des earnings
   - Paiements en attente
   - Bouton "Retirer" si solde > 0
   - Statistiques: nombre livraisons, taux de succès, temps moyen, rating moyen

7. **`frontend/deliverer/src/components/RatingDisplay.jsx`** (vide - à compléter)
   - Affichage notes et avis livreur
   - Note moyenne (sur 5 étoiles)
   - Nombre total avis et livraisons
   - Avis récents clients
   - Graphique évolution notes
   - Objectifs performance

### ÉTAPE 6: IMPLÉMENTATION DES PAGES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/deliverer/src/pages/HomePage.jsx`** (vide - à compléter)
   - Page d'accueil livreur
   - Statut en ligne/hors ligne (toggle switch)
   - Commandes disponibles (intègre AvailableOrders, limite 5)
   - Livraison active (intègre ActiveDelivery si activeDelivery existe)
   - Statistiques rapides (cards)
   - Accès rapide autres pages

2. **`frontend/deliverer/src/pages/DeliveriesPage.jsx`** (vide - à compléter)
   - Gestion et historique livraisons
   - Liste livraisons (passées et en cours)
   - Table avec colonnes: Order ID, Restaurant, Client, Status, Earnings, Date, Actions
   - Filtres par statut
   - Modal détails livraison complète
   - Timeline des étapes
   - GPS tracking history (replay)

3. **`frontend/deliverer/src/pages/EarningsPage.jsx`** (vide - à compléter)
   - Page détaillée revenus
   - Intègre EarningsTracker en full-page
   - Graphiques détaillés
   - Historique complet transactions blockchain
   - Export données (bouton "Export CSV")

4. **`frontend/deliverer/src/pages/ProfilePage.jsx`** (vide - à compléter)
   - Profil et paramètres livreur
   - Informations personnelles
   - Statut staking (intègre StakingPanel)
   - Notes et avis (intègre RatingDisplay)
   - Historique livraisons (statistiques globales)
   - Paramètres (langue, notifications, thème, sons)

### ÉTAPE 7: CONFIGURATION DU ROUTING
**Fichier à compléter:** `frontend/deliverer/src/App.jsx` (vide - à compléter)

**Implémenter:**
- Composant racine application livreur
- Configuration React Router
- Gestion état global (Context API)
- Authentification livreur via wallet
- Layout responsive web-first
- Gestion notifications Socket.io
- Tracking GPS continu si livraison active

**Routes à configurer:**
- `/` → HomePage
- `/deliveries` → DeliveriesPage
- `/earnings` → EarningsPage
- `/profile` → ProfilePage

### ÉTAPE 8: CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
**Créer:** `frontend/deliverer/.env.example`
- `VITE_API_URL`
- `VITE_ORDER_MANAGER_ADDRESS`
- `VITE_STAKING_ADDRESS`
- `VITE_SOCKET_URL`
- `VITE_GOOGLE_MAPS_API_KEY`

**Créer:** `.env` avec les valeurs réelles

### ÉTAPE 9: CONFIGURATION PWA
1. Configurer `vite.config.js` avec plugin PWA
2. Créer `manifest.json` avec:
   - Nom de l'application
   - Icônes (différentes tailles)
   - Thème et couleurs
   - Mode d'affichage
3. Tester l'installation PWA sur mobile

### ÉTAPE 10: TEST DE L'APPLICATION
1. Démarrer le serveur de développement:
   ```bash
   npm run dev
   ```
2. Tester les fonctionnalités:
   - Connexion wallet livreur
   - Staking (0.1 ETH)
   - Acceptation commandes
   - Navigation GPS
   - Confirmation pickup/delivery
   - Suivi gains
3. Tester sur mobile (PWA):
   - Installation sur écran d'accueil
   - Accès GPS natif
   - Notifications push

### ÉTAPE 11: DOCUMENTATION
**Fichier à compléter:** `frontend/deliverer/README.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Documentation complète application livreur
- Description de chaque composant et page
- Services (api, blockchain, geolocation)
- Configuration PWA
- Workflow utilisateur
- Technologies utilisées

### ÉTAPE 12: VALIDATION DU SPRINT 5
✓ Tous les fichiers vides complétés avec le code
✓ Application livreur fonctionnelle
✓ GPS tracking simulé
✓ Affichage staking/earnings
✓ PWA pour mobile
✓ Intégration Google Maps
✓ Socket.io pour notifications temps réel
✓ Documentation complète

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Configuration (Fichiers vides - à compléter)
- `frontend/deliverer/tailwind.config.js` ⚠️ VIDE
- `frontend/deliverer/vite.config.js` ⚠️ VIDE
- `frontend/deliverer/src/index.css` ⚠️ VIDE
- `frontend/deliverer/public/manifest.json` (à créer)

### 2. Services (Fichiers vides - à compléter)
- `frontend/deliverer/src/services/api.js` ⚠️ VIDE
- `frontend/deliverer/src/services/blockchain.js` ⚠️ VIDE
- `frontend/deliverer/src/services/geolocation.js` ⚠️ VIDE

### 3. Composants (Fichiers vides - à compléter)
- `frontend/deliverer/src/components/ConnectWallet.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/StakingPanel.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/AvailableOrders.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/ActiveDelivery.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/NavigationMap.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/EarningsTracker.jsx` ⚠️ VIDE
- `frontend/deliverer/src/components/RatingDisplay.jsx` ⚠️ VIDE

### 4. Pages (Fichiers vides - à compléter)
- `frontend/deliverer/src/pages/HomePage.jsx` ⚠️ VIDE
- `frontend/deliverer/src/pages/DeliveriesPage.jsx` ⚠️ VIDE
- `frontend/deliverer/src/pages/EarningsPage.jsx` ⚠️ VIDE
- `frontend/deliverer/src/pages/ProfilePage.jsx` ⚠️ VIDE

### 5. Application Principale (Fichiers vides - à compléter)
- `frontend/deliverer/src/App.jsx` ⚠️ VIDE
- `frontend/deliverer/src/index.jsx` ⚠️ VIDE
- `frontend/deliverer/public/index.html` ⚠️ VIDE

### 6. Configuration
- `frontend/deliverer/.env.example` (à créer)
- `frontend/deliverer/.env` (à créer)

### 7. Documentation
- `frontend/deliverer/README.md` (peut être complété après implémentation)

---

## FONCTIONNALITÉS DÉTAILLÉES PAR COMPOSANT

### StakingPanel.jsx
- Display staked amount
- Stake 0.1 ETH button
- Unstake button (if no active delivery)
- Slashing history

### AvailableOrders.jsx
- List nearby orders
- Distance to restaurant
- Estimated earnings
- Accept order button

### ActiveDelivery.jsx
- Order details
- Restaurant address
- Client address
- Navigation button
- Confirm pickup button
- Confirm delivery button
- GPS tracking active

### NavigationMap.jsx
- Google Maps integration
- Route to restaurant
- Route to client
- Real-time location updates

### EarningsTracker.jsx
- Today's earnings
- Week/month earnings
- Pending payments
- Completed deliveries count

### RatingDisplay.jsx
- Note moyenne
- Nombre total livraisons
- Avis récents clients
- Graphique évolution notes
- Objectifs performance

---

## PWA POUR MOBILE

- Configuration PWA dans vite.config.js
- Installation sur écran d'accueil mobile
- Fonctionnement offline partiel
- Notifications push
- Accès GPS natif
- Manifest avec icônes

---

## LIVRABLES ATTENDUS

✓ Application livreur fonctionnelle
✓ GPS tracking simulé
✓ Affichage staking/earnings
✓ PWA pour mobile
✓ Intégration Google Maps
✓ Socket.io pour notifications temps réel
✓ Documentation complète

---

## NOTES IMPORTANTES

- Application web-first avec PWA pour mobile
- Google Maps pour navigation
- Geolocation API native pour GPS
- Socket.io pour notifications temps réel
- Interface optimisée pour usage mobile (livreur en déplacement)

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 6: Oracles & Advanced Features
→ Lire `SPRINT_6.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_6.txt` pour les étapes détaillées

