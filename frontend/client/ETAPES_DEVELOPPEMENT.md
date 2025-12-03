# ÉTAPES DE DÉVELOPPEMENT - SPRINT 3 : FRONTEND CLIENT APP

## 📋 RÉCAPITULATIF GÉNÉRAL

**Objectif** : Créer l'interface React pour les clients permettant de commander des repas, suivre les livraisons en temps réel et gérer leur compte avec tokens de fidélité.

**État actuel** : Tous les fichiers existent mais sont **VIDES** et doivent être complétés.

---

## 🔧 ÉTAPE 1 : PRÉPARATION DE L'ENVIRONNEMENT

### Prérequis
- ✓ Node.js (v18+) installé
- ✓ URL de l'API backend (Sprint 2)
- ✓ Clé API Google Maps
- ✓ Adresses des contrats déployés (OrderManager, Token)

---

## 📦 ÉTAPE 2 : INITIALISATION DU PROJET

### Commandes à exécuter
```bash
cd frontend/client
npm init -y
npm install react react-dom react-router-dom ethers socket.io-client @react-google-maps/api axios
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react vite
npx tailwindcss init -p
```

---

## ⚙️ ÉTAPE 3 : CONFIGURATION (Fichiers vides - à compléter)

### 1. `frontend/client/tailwind.config.js` ⚠️ VIDE
**À implémenter** :
- Configuration TailwindCSS
- Content paths : `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- Thème personnalisé (couleurs, fonts)

### 2. `frontend/client/vite.config.js` ⚠️ VIDE
**À implémenter** :
- Configuration Vite
- Plugin React
- Variables d'environnement

### 3. `frontend/client/src/index.css` ⚠️ VIDE
**À implémenter** :
- Directives Tailwind : `@tailwind base; @tailwind components; @tailwind utilities;`
- Styles globaux personnalisés

### 4. `frontend/client/public/index.html` ⚠️ VIDE
**À implémenter** :
- Structure HTML de base
- Script Google Maps API
- Point d'entrée React

---

## 🔌 ÉTAPE 4 : SERVICES (Fichiers vides - à compléter)

### 1. `frontend/client/src/services/api.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `getRestaurants(params)` - GET /api/restaurants
- `getRestaurant(id)` - GET /api/restaurants/:id
- `createOrder(orderData)` - POST /api/orders/create
- `getOrder(id)` - GET /api/orders/:id
- `getOrdersByClient(address)` - GET /api/orders/client/:address
- `confirmDelivery(orderId, clientAddress)` - POST /api/orders/:id/confirm-delivery
- `openDispute(orderId, data)` - POST /api/orders/:id/dispute
- `submitReview(orderId, rating, comment, clientAddress)` - POST /api/orders/:id/review
- Configuration : `API_BASE_URL`, `authHeaders(address)`

### 2. `frontend/client/src/services/blockchain.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `connectWallet()` - Connexion MetaMask
- `getBalance(address)` - Solde MATIC
- `getTokenBalance(address)` - Solde tokens DONE
- `createOrderOnChain(params)` - Créer commande on-chain
- `confirmDeliveryOnChain(orderId)` - Confirmer livraison
- `openDisputeOnChain(orderId)` - Ouvrir litige
- `getOrderOnChain(orderId)` - Récupérer commande depuis blockchain
- Configuration : Provider, contrats (OrderManager, Token)

### 3. `frontend/client/src/services/ipfs.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `uploadImage(file)` - Upload image vers IPFS
- `getImage(hash)` - Récupérer URL image IPFS
- `uploadJSON(data)` - Upload JSON vers IPFS
- `getJSON(hash)` - Récupérer JSON depuis IPFS
- Configuration : `IPFS_GATEWAY`, endpoints backend

---

## 🛠️ ÉTAPE 5 : UTILS (Fichiers vides - à compléter)

### 1. `frontend/client/src/utils/web3.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `formatAddress(address)` - Format : 0x1234...5678
- `formatBalance(balance)` - Format balance en ether
- `parseUnits(value, decimals)` - Convertir en wei
- `formatUnits(value, decimals)` - Convertir wei en ether
- `isValidAddress(address)` - Valider adresse Ethereum

### 2. `frontend/client/src/utils/formatters.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `formatPrice(amount, currency)` - Format prix
- `formatDate(date)` - Format date française
- `formatTime(seconds)` - Format temps (mm:ss)
- `truncateText(text, length)` - Tronquer texte

---

## 🧩 ÉTAPE 6 : COMPOSANTS (Fichiers vides - à compléter)

### 1. `frontend/client/src/components/ConnectWallet.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Détection MetaMask installé
- Connexion wallet (window.ethereum.request)
- Vérification réseau Polygon Mumbai
- Switch réseau si incorrect
- Affichage adresse connectée (format court)
- Affichage solde MATIC
- Bouton déconnexion
- Gestion erreurs (rejected, network, locked)

**State** : `address`, `isConnecting`, `balance`, `network`

### 2. `frontend/client/src/components/RestaurantList.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch restaurants via `api.getRestaurants()`
- Grid layout responsive
- Filtres : cuisine type, prix (range slider), rating minimum
- Auto-refresh toutes les 30 secondes
- Skeleton loader pendant chargement
- Affiche `RestaurantCard` pour chaque restaurant

**State** : `restaurants`, `filters`, `loading`

### 3. `frontend/client/src/components/RestaurantCard.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Affichage : nom, cuisine, description, image IPFS
- Note moyenne (étoiles) et nombre d'avis
- Temps de livraison estimé (20-30 min)
- Prix moyen (€€ ou €€€)
- Badge "Populaire" si totalOrders > 100
- Bouton "Voir le menu" → navigate `/restaurant/:id`

**Props** : `restaurant` object

### 4. `frontend/client/src/components/MenuItems.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch menu via `api.getRestaurant(restaurantId)`
- Grid des plats avec images IPFS
- Lazy loading images
- Bouton "Ajouter au panier" par plat
- Modal quantité si clic
- Prix en MATIC + conversion EUR
- Toggle affichage MATIC/EUR
- Filtres par catégorie (Tabs : Entrées, Plats, Desserts, Boissons)

**Props** : `restaurantId`, `onAddToCart`
**State** : `menu`, `selectedCategory`, `selectedItem`, `quantity`

### 5. `frontend/client/src/components/Cart.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Liste items dans panier (image, nom, quantité, prix)
- Calcul total :
  - foodPrice = sum(item.price * quantity)
  - deliveryFee = 3 MATIC (fixe)
  - platformFee = foodPrice * 0.1 (10%)
  - totalAmount = foodPrice + deliveryFee + platformFee
- Boutons +/- pour modifier quantités
- Bouton "X" pour supprimer item
- Bouton "Passer commande" → navigate `/checkout`

**State** : `cart`, `deliveryFee`

### 6. `frontend/client/src/components/Checkout.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Input adresse de livraison
- Autocomplete Google Places
- Sauvegarde adresses favorites
- Validation adresse obligatoire
- Calcul totalAmount en wei
- Appel `blockchain.createOrderOnChain()`
- Popup MetaMask pour approval
- Upload items vers IPFS via `ipfs.uploadJSON()`
- Appel `api.createOrder()` via backend
- Progression visuelle :
  1. Préparation commande
  2. Upload IPFS
  3. Confirmation MetaMask
  4. Transaction blockchain
  5. Commande créée
- Redirect vers `/tracking/:orderId` après succès

**State** : `deliveryAddress`, `step`, `txHash`, `orderId`, `error`

### 7. `frontend/client/src/components/OrderTracking.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Socket.io listener `orderStatusUpdate`
- Timeline visuelle des étapes (CREATED → PREPARING → IN_DELIVERY → DELIVERED)
- Intégration Google Maps
- Markers : restaurant, client, livreur
- Polyline route livreur → client
- Update position livreur temps réel (toutes les 5 sec)
- Socket.io listener `delivererLocationUpdate`
- Info livreur : nom, photo, rating, véhicule
- Bouton "Appeler livreur"
- ETA countdown (temps estimé d'arrivée)
- Bouton "Confirmer livraison" (visible si status = IN_DELIVERY et distance < 100m)
- Appelle `api.confirmDelivery()` + `blockchain.confirmDeliveryOnChain()`
- Affiche tokens DONE gagnés
- Redirect vers OrderHistory

**Props** : `orderId`
**State** : `order`, `delivererLocation`, `eta`, `isNearby`

### 8. `frontend/client/src/components/OrderHistory.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch via `api.getOrdersByClient(address)`
- Table avec colonnes : Order ID, Restaurant, Date, Total, Status, Actions
- Pagination (10 orders par page)
- Bouton "Commander à nouveau" → ajoute items au panier
- Modal avis (rating 1-5 étoiles + commentaire)
- Submit via `api.submitReview()`
- Bouton "Télécharger reçu" → fetch depuis IPFS

**State** : `orders`, `selectedOrder`, `reviewModal`, `rating`, `comment`

### 9. `frontend/client/src/components/TokenBalance.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch balance via `blockchain.getTokenBalance(address)`
- Affichage balance DONE tokens
- Conversion en EUR (1 DONE = 1€)
- Input "Utiliser X tokens" pour discount
- Validation : balance >= X, max 50% du total
- Historique transactions (fetch events Transfer)
- Info : "Gagnez 1 DONE token pour 10€ dépensés"
- Progress bar vers prochain token

**State** : `balance`, `transactions`, `tokensToUse`

### 10. `frontend/client/src/components/DisputeModal.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Modal formulaire litige
- Textarea raison du litige
- Dropdown type problème :
  - Commande non reçue
  - Qualité insatisfaisante
  - Items manquants
  - Mauvaise livraison
  - Autre
- Input file multiple images
- Preview images avant upload
- Upload vers IPFS via `ipfs.uploadImage()`
- Submit via `api.openDispute()` + `blockchain.openDisputeOnChain()`
- Notification arbitrator
- Message succès + fermeture modal

**Props** : `orderId`, `onClose`, `onSubmit`
**State** : `reason`, `problemType`, `proofImages`, `uploading`, `submitting`

---

## 📄 ÉTAPE 7 : PAGES (Fichiers vides - à compléter)

### 1. `frontend/client/src/pages/HomePage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Hero section avec input recherche restaurant
- Autocomplete suggestions
- Section catégories de cuisine (cards cliquables)
- Liste restaurants populaires (intègre `RestaurantList` avec limit=6)
- Section offres spéciales / promotions
- Badges "Nouveau restaurant"

**Layout** : Hero + Categories + Popular Restaurants

### 2. `frontend/client/src/pages/RestaurantPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Fetch restaurant via `api.getRestaurant(restaurantId)`
- Header : nom, description, cuisine, adresse, horaires
- Rating et nombre d'avis
- Intègre `MenuItems` component
- Section avis clients (liste avec filtres par rating)
- Galerie photos IPFS (lightbox au clic)

**Params** : `restaurantId` (from URL)

### 3. `frontend/client/src/pages/CheckoutPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Intègre `Checkout` component
- Gestion flux paiement complet
- Redirect vers TrackingPage après succès

### 4. `frontend/client/src/pages/TrackingPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Intègre `OrderTracking` component
- Vue full-screen avec map
- Notifications temps réel

**Params** : `orderId` (from URL)

### 5. `frontend/client/src/pages/ProfilePage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Informations personnelles (nom, email, téléphone, wallet)
- Formulaire édition profil
- Intègre `OrderHistory` (historique commandes)
- Intègre `TokenBalance` (solde tokens DONE)
- Stats fidélité
- Paramètres compte (langue, notifications, thème)
- Bouton déconnexion wallet

---

## 🎯 ÉTAPE 8 : APPLICATION PRINCIPALE (Fichiers vides - à compléter)

### 1. `frontend/client/src/index.jsx` ⚠️ VIDE
**À implémenter** :
- Point d'entrée React
- Render App dans root
- Import index.css

### 2. `frontend/client/src/App.jsx` ⚠️ VIDE
**À implémenter** :
- Composant racine de l'application
- Configuration React Router (BrowserRouter, Routes, Route)
- Gestion état global (Context API) :
  - WalletContext (wallet, address, balance)
  - CartContext (cart, addItem, removeItem, clearCart)
  - SocketContext (socket connection)
- Authentification wallet
- Layout responsive avec header/footer
- Header : ConnectWallet + Cart icon + Navigation
- Footer : Liens, copyright
- Connexion Socket.io
- Routes :
  - `/` → HomePage
  - `/restaurant/:id` → RestaurantPage
  - `/checkout` → CheckoutPage
  - `/tracking/:orderId` → TrackingPage
  - `/profile` → ProfilePage

---

## 🔐 ÉTAPE 9 : CONFIGURATION ENVIRONNEMENT

### Créer `frontend/client/.env.example`
```
VITE_API_URL=http://localhost:3000/api
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_SOCKET_URL=http://localhost:3000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Créer `frontend/client/.env`
- Copier `.env.example`
- Remplir avec les valeurs réelles

---

## ✅ ÉTAPE 10 : TEST DE L'APPLICATION

### Commandes
```bash
npm run dev
```

### Tests à effectuer
- ✓ Connexion wallet MetaMask
- ✓ Affichage restaurants
- ✓ Filtres restaurants
- ✓ Ajout au panier
- ✓ Checkout et paiement
- ✓ Suivi commande temps réel
- ✓ Historique commandes
- ✓ Responsive mobile

---

## 📚 ÉTAPE 11 : DOCUMENTATION

### Compléter `frontend/client/README.md`
- Documentation complète application client
- Description de chaque composant et page
- Services et utils
- Workflow utilisateur
- Technologies utilisées

---

## 🎯 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1 : Configuration de base
1. Configuration TailwindCSS (`tailwind.config.js`, `index.css`)
2. Configuration Vite (`vite.config.js`)
3. HTML de base (`public/index.html`)

### Phase 2 : Services et Utils (Fondations)
4. `utils/web3.js` - Utilitaires Web3
5. `utils/formatters.js` - Formatage données
6. `services/api.js` - Appels API backend
7. `services/blockchain.js` - Interactions Web3
8. `services/ipfs.js` - Interactions IPFS

### Phase 3 : Composants de base
9. `components/ConnectWallet.jsx` - Connexion wallet
10. `components/RestaurantList.jsx` - Liste restaurants
11. `components/RestaurantCard.jsx` - Carte restaurant
12. `components/MenuItems.jsx` - Menu restaurant
13. `components/Cart.jsx` - Panier

### Phase 4 : Flux de commande
14. `components/Checkout.jsx` - Paiement
15. `components/OrderTracking.jsx` - Suivi commande
16. `components/OrderHistory.jsx` - Historique

### Phase 5 : Fonctionnalités avancées
17. `components/TokenBalance.jsx` - Tokens fidélité
18. `components/DisputeModal.jsx` - Litiges

### Phase 6 : Pages
19. `pages/HomePage.jsx` - Page d'accueil
20. `pages/RestaurantPage.jsx` - Page restaurant
21. `pages/CheckoutPage.jsx` - Page checkout
22. `pages/TrackingPage.jsx` - Page suivi
23. `pages/ProfilePage.jsx` - Page profil

### Phase 7 : Application principale
24. `index.jsx` - Point d'entrée
25. `App.jsx` - Application principale avec routing

### Phase 8 : Finalisation
26. Variables d'environnement (`.env.example`, `.env`)
27. Tests et corrections
28. Documentation finale

---

## 📝 NOTES IMPORTANTES

- **Tous les fichiers existent déjà mais sont VIDES** - Il faut les compléter
- Utiliser **React 18** avec **Vite** pour build rapide
- **TailwindCSS** pour styling responsive
- **Socket.io** pour notifications temps réel
- **Google Maps API** pour tracking GPS
- **MetaMask** pour paiements Web3
- **Ethers.js v6** pour interactions blockchain
- **IPFS** pour stockage décentralisé (images, JSON)

---

## 🚀 VALIDATION DU SPRINT 3

✓ Tous les fichiers vides complétés avec le code
✓ Application client fonctionnelle
✓ Connexion wallet + flux commande complet
✓ Responsive mobile
✓ Intégration Google Maps
✓ Socket.io pour notifications temps réel
✓ Documentation complète

