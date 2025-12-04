# ÉTAPES DE DÉVELOPPEMENT - FRONTEND DELIVERER

## 📋 Vue d'ensemble

Ce document décrit les étapes de développement pour l'application frontend deliverer, conforme aux spécifications de `Sprint/sprint5.md`, `sprint 5/ETAPES_5.txt`, `sprint 5/SPRINT_5.txt` et `frontend/deliverer/README.md`.

---

## 🛠️ ÉTAPE 1 : CONFIGURATION (Fichiers partiellement remplis)

### 1. `frontend/deliverer/tailwind.config.js` ✅ COMPLÉTÉ
- Configuration TailwindCSS avec couleurs personnalisées (primary, deliverer, success, error)
- Content paths configurés
- Thème étendu avec fonts, shadows

### 2. `frontend/deliverer/vite.config.js` ✅ COMPLÉTÉ
- Configuration Vite avec plugin React
- Plugin PWA configuré (vite-plugin-pwa)
- Port dev server : 5175
- Proxy API configuré
- Code splitting configuré

### 3. `frontend/deliverer/postcss.config.js` ✅ COMPLÉTÉ
- Configuration PostCSS pour TailwindCSS et Autoprefixer

### 4. `frontend/deliverer/src/index.css` ✅ COMPLÉTÉ
- Directives TailwindCSS
- Styles globaux
- Composants personnalisés (buttons, cards, badges)
- Classes utilitaires

---

## 🛠️ ÉTAPE 2 : SERVICES (Fichiers vides - à compléter)

### 1. `frontend/deliverer/src/services/api.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `getAvailableOrders(location)` - GET /api/deliverers/available?lat=...&lng=...
- `acceptOrder(orderId, delivererAddress)` - POST /api/deliverers/orders/:id/accept
- `confirmPickup(orderId, delivererAddress)` - POST /api/orders/:id/confirm-pickup
- `confirmDelivery(orderId, delivererAddress)` - POST /api/orders/:id/confirm-delivery
- `updateGPSLocation(orderId, lat, lng)` - POST /api/orders/:id/update-gps
- `getEarnings(address, period)` - GET /api/deliverers/:address/earnings?period=...
- `getRating(address)` - GET /api/deliverers/:address/rating
- `updateStatus(address, isOnline)` - PUT /api/deliverers/:address/status
- `getDelivererOrders(address, filters)` - GET /api/deliverers/:address/orders?status=...
- `getActiveDelivery(address)` - GET /api/deliverers/:address/active-delivery
- `registerDeliverer(data)` - POST /api/deliverers/register

### 2. `frontend/deliverer/src/services/blockchain.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `connectWallet()` - Connexion MetaMask
- `hasRole(role, address)` - Vérification rôle DELIVERER_ROLE
- `isStaked(address)` - Vérification staking
- `getStakeInfo(address)` - Infos staking (montant, isStaked)
- `stake(amount)` - Effectuer staking (minimum 0.1 MATIC)
- `unstake()` - Retirer staking
- `acceptOrderOnChain(orderId)` - Accepter commande on-chain
- `confirmPickupOnChain(orderId)` - Confirmation pickup on-chain
- `confirmDeliveryOnChain(orderId)` - Confirmation delivery on-chain
- `getSlashingEvents(address)` - Historique slashing
- `getEarningsEvents(address)` - Events PaymentSplit (20% earnings)

### 3. `frontend/deliverer/src/services/geolocation.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `getCurrentPosition()` - Position actuelle (Promise)
- `watchPosition(callback)` - Suivi position continue
- `calculateRoute(origin, destination)` - Itinéraire Google Maps
- `getDistance(lat1, lng1, lat2, lng2)` - Distance Haversine (km)
- `isNearLocation(currentLat, currentLng, targetLat, targetLng, radius)` - Vérification proximité

---

## 🛠️ ÉTAPE 3 : COMPOSANTS (Fichiers vides - à compléter)

### 1. `frontend/deliverer/src/components/ConnectWallet.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Détection MetaMask
- Connexion wallet
- Vérification réseau (Polygon Mumbai)
- Vérification rôle DELIVERER_ROLE
- Vérification staking (minimum 0.1 MATIC)
- Affichage adresse connectée
- Indicateur réseau et status staking
- Warning si pas staké + lien vers StakingPanel

**State** : `address`, `isConnecting`, `hasRole`, `isStaked`, `stakedAmount`, `deliverer`

### 2. `frontend/deliverer/src/components/StakingPanel.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Affichage montant staké (MATIC + USD)
- Statut : Staké / Non staké (badge visuel)
- Input montant à staker (minimum 0.1 MATIC)
- Bouton "Stake 0.1 MATIC"
- Bouton "Unstake" (si pas de livraison active)
- Historique slashing (table : date, raison, montant, txHash)
- Total slashé affiché
- Avertissement si trop de slashing

**State** : `stakedAmount`, `isStaked`, `stakeInput`, `hasActiveDelivery`, `slashingHistory`, `loading`

### 3. `frontend/deliverer/src/components/AvailableOrders.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch commandes avec status PREPARING
- Tri par distance (plus proche en premier)
- Auto-refresh toutes les 10 secondes
- Socket.io listener 'orderReady'
- Distance au restaurant (calculée, affichée en km)
- Icône indicateur distance (vert < 2km, orange 2-5km, rouge > 5km)
- Gains estimés (deliveryFee 20% du total, MATIC + USD)
- Temps estimé livraison
- Bouton "Accepter" par commande
- Vérification staking avant acceptation

**State** : `orders`, `currentLocation`, `loading`, `accepting`

### 4. `frontend/deliverer/src/components/ActiveDelivery.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Détails commande (orderId, client, items, total, delivery fee)
- Adresse restaurant (nom, adresse complète, bouton "Appeler")
- Distance actuelle au restaurant
- Adresse client (nom, adresse complète, bouton "Appeler")
- Distance actuelle au client
- Bouton "Naviguer vers restaurant" (si pas encore récupéré)
- Bouton "Naviguer vers client" (si récupéré)
- Bouton "Confirmer pickup" (visible si proche restaurant < 100m)
- Bouton "Confirmer delivery" (visible si proche client < 100m)
- GPS tracking actif (update toutes les 5 secondes)
- Affichage position sur carte

**State** : `order`, `currentLocation`, `step`, `isNearRestaurant`, `isNearClient`, `tracking`

### 5. `frontend/deliverer/src/components/NavigationMap.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Carte navigation interactive Google Maps
- Intégration @react-google-maps/api
- Markers : position livreur, restaurant, client
- Zoom automatique sur itinéraire
- Route vers restaurant (si step = 'pickup')
- Route vers client (si step = 'delivery')
- DirectionsService Google Maps
- Polyline sur carte
- Update position temps réel (watchposition GPS)
- Recalcul route si déviation
- ETA affiché

**Props** : `origin`, `destination`, `step`, `onArrival`
**State** : `map`, `directions`, `currentPosition`, `eta`

### 6. `frontend/deliverer/src/components/EarningsTracker.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Gains aujourd'hui (MATIC + USD, nombre livraisons)
- Tabs : Jour / Semaine / Mois
- Graphique line chart des earnings
- Total période sélectionnée
- Comparaison avec période précédente
- Paiements en attente (non withdrawable)
- Bouton "Retirer" si solde > 0
- Nombre livraisons complétées
- Taux de succès (%)
- Temps moyen par livraison
- Rating moyen

**State** : `earnings`, `period`, `deliveriesCount`, `chartData`

### 7. `frontend/deliverer/src/components/RatingDisplay.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Note moyenne (sur 5 étoiles, graphique visuel)
- Nombre total avis
- Nombre total livraisons
- Nombre annulations
- Taux de succès (%)
- Avis récents clients (liste 5 derniers : nom, rating, commentaire, date)
- Pagination si plus de 5
- Graphique évolution notes (line chart, 30 derniers jours)
- Objectifs performance (badges : "100 livraisons", "Rating > 4.5")
- Progression vers objectifs
- Récompenses débloquées

**State** : `rating`, `totalDeliveries`, `reviews`, `ratingHistory`, `achievements`

---

## 🛠️ ÉTAPE 4 : PAGES (Fichiers vides - à compléter)

### 1. `frontend/deliverer/src/pages/HomePage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Statut en ligne/hors ligne (toggle switch)
- Si Online : visible pour commandes
- Si Offline : ne reçoit plus de commandes
- Commandes disponibles (intègre AvailableOrders, limite 5)
- Bouton "Voir toutes"
- Livraison active (intègre ActiveDelivery si activeDelivery existe)
- Statistiques rapides (cards) :
  - Livraisons aujourd'hui
  - Gains aujourd'hui
  - Rating
  - Montant staké
- Accès rapide autres pages

**State** : `isOnline`, `activeDelivery`, `stats`

### 2. `frontend/deliverer/src/pages/DeliveriesPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Liste livraisons (passées et en cours)
- Table avec colonnes : Order ID, Restaurant, Client, Status, Earnings, Date, Actions
- Filtres par statut (Toutes / En cours / Complétées / Annulées)
- Modal détails livraison complète
- Timeline des étapes
- GPS tracking history (replay)
- Transaction hash
- Rating client (si disponible)
- Actions : "Continuer livraison" (si IN_DELIVERY), "Voir détails" (si DELIVERED)
- Export historique CSV

**State** : `deliveries`, `filter`, `selectedDelivery`

### 3. `frontend/deliverer/src/pages/EarningsPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Intègre EarningsTracker en full-page
- Graphiques détaillés :
  - Earnings over time
  - Deliveries over time
  - Average earnings per delivery
  - Peak hours
- Historique complet transactions blockchain
- Table : Date, Order ID, Amount earned (20%), Transaction hash, Status
- Pagination
- Export données (bouton "Export CSV")

**State** : `period`, `transactions`, `chartData`

### 4. `frontend/deliverer/src/pages/ProfilePage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Informations personnelles (nom, téléphone, wallet, formulaire édition)
- Statut staking (intègre StakingPanel)
- Notes et avis (intègre RatingDisplay)
- Historique livraisons (statistiques globales) :
  - Total livraisons
  - Taux de succès
  - Temps moyen
  - Distance totale parcourue
- Paramètres (langue, notifications, thème, sons)
- Bouton déconnexion wallet

**State** : `profile`, `settings`

---

## 🛠️ ÉTAPE 5 : APPLICATION PRINCIPALE (Fichiers vides - à compléter)

### 1. `frontend/deliverer/src/index.jsx` ⚠️ VIDE
**À implémenter** :
- Point d'entrée React
- Render App dans root
- Import index.css

### 2. `frontend/deliverer/src/App.jsx` ⚠️ VIDE
**À implémenter** :
- Composant racine application livreur
- Configuration React Router (BrowserRouter, Routes, Route)
- Gestion état global (Context API) :
  - WalletContext (wallet, address, balance)
  - SocketContext (socket connection)
  - GeolocationContext (current location)
  - DeliveryContext (active delivery)
- Authentification wallet
- Layout responsive web-first avec header/footer
- Header : ConnectWallet + Status toggle + Navigation
- Footer : Liens, copyright
- Connexion Socket.io
- Tracking GPS continu si livraison active
- Routes :
  - `/` → HomePage
  - `/deliveries` → DeliveriesPage
  - `/earnings` → EarningsPage
  - `/profile` → ProfilePage

### 3. `frontend/deliverer/public/index.html` ⚠️ VIDE
**À implémenter** :
- Structure HTML de base
- Meta tags PWA
- Script Google Maps API
- Root div pour React

---

## 🛠️ ÉTAPE 6 : CONFIGURATION ENVIRONNEMENT

### 1. `frontend/deliverer/.env.example` ⚠️ À CRÉER
**Variables à définir** :
- `VITE_API_URL=http://localhost:3000/api`
- `VITE_ORDER_MANAGER_ADDRESS=0x...`
- `VITE_STAKING_ADDRESS=0x...`
- `VITE_SOCKET_URL=http://localhost:3000`
- `VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key`

---

## 📝 NOTES IMPORTANTES

- **Application web-first** avec PWA pour mobile
- **Google Maps** pour navigation
- **Geolocation API** native pour GPS
- **Socket.io** pour notifications temps réel
- **Interface optimisée** pour usage mobile (livreur en déplacement)
- **Staking requis** : minimum 0.1 MATIC pour accepter des commandes
- **GPS tracking** : update automatique toutes les 5 secondes pendant livraison active
- **Pattern PUSH** : Les paiements sont transférés immédiatement (voir `contracts/PAYMENT_SPLITTER_NOTES.md`)

---

## ✅ VALIDATION

Après chaque étape, vérifier :
- ✅ Cohérence avec `contracts/README.md`
- ✅ Cohérence avec `backend/README.md`
- ✅ Cohérence avec `frontend/deliverer/README.md`
- ✅ Cohérence avec `Sprint/sprint5.md`
- ✅ Cohérence avec `sprint 5/ETAPES_5.txt` et `sprint 5/SPRINT_5.txt`

