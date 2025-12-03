# ÉTAPES DE DÉVELOPPEMENT - SPRINT 4 : FRONTEND RESTAURANT DASHBOARD

## 📋 RÉCAPITULATIF GÉNÉRAL

**Objectif** : Créer l'interface React pour les restaurants permettant de gérer les commandes, le menu et consulter les statistiques en temps réel.

**État actuel** : Tous les fichiers existent mais sont **VIDES** et doivent être complétés.

---

## 🔧 ÉTAPE 1 : PRÉPARATION DE L'ENVIRONNEMENT

### Prérequis
- ✓ Node.js (v18+) installé
- ✓ URL de l'API backend (Sprint 2)
- ✓ Adresses des contrats déployés (OrderManager, PaymentSplitter)
- ✓ Avoir accès aux données de test (restaurants)

---

## 📦 ÉTAPE 2 : INITIALISATION DU PROJET

### Commandes à exécuter
```bash
cd frontend/restaurant
npm init -y
npm install react react-dom react-router-dom ethers socket.io-client chart.js react-chartjs-2 axios date-fns
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react vite
npx tailwindcss init -p
```

---

## ⚙️ ÉTAPE 3 : CONFIGURATION (Fichiers vides - à compléter)

### 1. `frontend/restaurant/tailwind.config.js` ⚠️ VIDE
**À implémenter** :
- Configuration TailwindCSS
- Content paths : `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- Thème personnalisé (couleurs, fonts) pour dashboard restaurant

### 2. `frontend/restaurant/vite.config.js` ⚠️ VIDE
**À implémenter** :
- Configuration Vite
- Plugin React
- Port 5176 pour restaurant
- Variables d'environnement
- Proxy API

### 3. `frontend/restaurant/postcss.config.js` ⚠️ VIDE
**À implémenter** :
- Configuration PostCSS
- Plugins : tailwindcss, autoprefixer

### 4. `frontend/restaurant/src/index.css` ⚠️ VIDE
**À implémenter** :
- Directives Tailwind : `@tailwind base; @tailwind components; @tailwind utilities;`
- Styles globaux personnalisés pour dashboard

### 5. `frontend/restaurant/public/index.html` ⚠️ VIDE
**À implémenter** :
- Structure HTML de base
- Point d'entrée React

---

## 🔌 ÉTAPE 4 : SERVICES (Fichiers vides - à compléter)

### 1. `frontend/restaurant/src/services/api.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `getRestaurant(restaurantId)` - GET /api/restaurants/:id
- `getOrders(restaurantId, filters)` - GET /api/restaurants/:id/orders
- `confirmPreparation(orderId, restaurantAddress)` - POST /api/orders/:id/confirm-preparation
- `updateMenu(restaurantId, menu, restaurantAddress)` - PUT /api/restaurants/:id/menu
- `addMenuItem(restaurantId, item, restaurantAddress)` - POST /api/restaurants/:id/menu/item
- `updateMenuItem(restaurantId, itemId, updates, restaurantAddress)` - PUT /api/restaurants/:id/menu/item/:itemId
- `deleteMenuItem(restaurantId, itemId, restaurantAddress)` - DELETE /api/restaurants/:id/menu/item/:itemId
- `getAnalytics(restaurantId, params)` - GET /api/restaurants/:id/analytics
- `uploadImage(file)` - POST /api/upload/image
- `getEarnings(restaurantId, params)` - GET /api/restaurants/:id/earnings
- `withdrawEarnings(restaurantId, restaurantAddress)` - POST /api/restaurants/:id/withdraw
- Configuration : `API_BASE_URL`, `authHeaders(address)`

### 2. `frontend/restaurant/src/services/blockchain.js` ⚠️ VIDE
**Fonctions à implémenter** :
- `connectWallet()` - Connexion MetaMask
- `hasRole(role, address)` - Vérifier rôle RESTAURANT_ROLE
- `confirmPreparationOnChain(orderId)` - Confirmer préparation on-chain
- `getRestaurantOrders(restaurantAddress)` - Récupérer commandes restaurant depuis blockchain
- `getEarningsOnChain(restaurantAddress)` - Récupérer revenus on-chain
- `getPaymentSplitEvents(restaurantAddress)` - Récupérer events PaymentSplit
- `getPendingBalance(restaurantAddress)` - Solde en attente dans PaymentSplitter
- `withdraw()` - Retirer fonds du PaymentSplitter
- Configuration : Provider, contrats (OrderManager, PaymentSplitter)

---

## 🧩 ÉTAPE 5 : COMPOSANTS (Fichiers vides - à compléter)

### 1. `frontend/restaurant/src/components/ConnectWallet.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Détection MetaMask installé
- Connexion wallet (window.ethereum.request)
- Vérification réseau Polygon Mumbai
- Vérification rôle RESTAURANT_ROLE via `blockchain.hasRole()`
- Si pas de rôle : message d'erreur
- Si rôle validé : fetch restaurant profile depuis API
- Affichage adresse connectée (format court)
- Affichage solde MATIC
- Bouton déconnexion
- Gestion erreurs (rejected, network, locked)

**State** : `address`, `isConnecting`, `hasRole`, `restaurant`, `balance`, `network`

### 2. `frontend/restaurant/src/components/OrdersQueue.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Socket.io listener `orderCreated` pour nouvelles commandes
- Ajout nouvelle commande en haut de liste
- Notification sonore + badge
- Animation d'entrée
- Accept/Reject order (optionnel)
- Estimation temps de préparation (input minutes)
- Bouton "Confirmer préparation"
- Filtres par statut (Toutes / Nouvelles / En préparation / Prêtes)
- Socket.io listener `delivererAssigned` pour mise à jour status

**State** : `orders`, `filter`, `loading`, `selectedOrder`

### 3. `frontend/restaurant/src/components/OrderCard.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Carte individuelle commande
- Détails : orderId, items avec quantités, prix, images IPFS
- Adresse de livraison
- Informations client (nom, wallet, téléphone)
- Badge statut coloré (CREATED: jaune, PREPARING: orange, IN_DELIVERY: bleu, DELIVERED: vert)
- Bouton "Confirmer préparation" si status = CREATED
- Timer : temps écoulé depuis création
- Temps de préparation estimé

**Props** : `order`, `onConfirmPreparation`

### 4. `frontend/restaurant/src/components/MenuManager.jsx` ⚠️ VIDE
**Fonctionnalités** :
- CRUD items menu (Create, Read, Update, Delete)
- Upload images vers IPFS via `api.uploadImage()`
- Définition prix (MATIC + conversion EUR)
- Activation/désactivation items (toggle switch)
- Catégorisation (Entrées, Plats, Desserts, Boissons)
- Groupage par catégories
- Modal formulaire pour ajout/modification
- Confirmation modal pour suppression

**State** : `menu`, `selectedItem`, `isModalOpen`, `uploading`, `category`

### 5. `frontend/restaurant/src/components/Analytics.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Statistiques restaurant
- Total commandes (jour/semaine/mois)
- Graphique revenus (line chart Chart.js)
- Plats les plus populaires (bar chart horizontal)
- Temps moyen de préparation
- Vue d'ensemble notes (rating moyen, nombre avis, répartition)
- Derniers commentaires clients
- Filtres période (jour/semaine/mois)

**State** : `analytics`, `period`, `loading`

### 6. `frontend/restaurant/src/components/EarningsChart.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Graphique revenus et gains on-chain
- Revenus quotidiens/hebdomadaires (line chart)
- Data depuis blockchain events PaymentSplit
- Retraits en attente (total MATIC disponible)
- Bouton "Retirer" (call `blockchain.withdraw()`)
- Montants retirés (historique)
- Historique transactions on-chain (table avec dates, orderId, montant, txHash)
- Pagination

**State** : `earnings`, `pendingBalance`, `transactions`, `loading`

---

## 📄 ÉTAPE 6 : PAGES (Fichiers vides - à compléter)

### 1. `frontend/restaurant/src/pages/DashboardPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Tableau de bord principal
- Vue d'ensemble commandes du jour
- Statistiques rapides (KPIs) :
  - Commandes en attente
  - Commandes en préparation
  - Commandes livrées aujourd'hui
  - Revenue aujourd'hui
- Commandes en attente (intègre OrdersQueue avec filter='CREATED')
- Revenus du jour (mini graph)
- Comparaison avec hier
- Accès rapide autres pages

**Layout** : Header + Stats Grid + OrdersQueue + Mini EarningsChart

### 2. `frontend/restaurant/src/pages/OrdersPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Gestion complète des commandes
- Liste toutes commandes
- Table avec colonnes : Order ID, Client, Items, Total, Status, Date, Actions
- Filtres par statut et date
- Date range picker
- Search bar (order ID ou client)
- Actions : Confirmer préparation, Voir détails, Export CSV
- Modal détails commande complète
- Timeline des statuts
- Transaction hash

**State** : `orders`, `filter`, `selectedOrder`, `loading`

### 3. `frontend/restaurant/src/pages/MenuPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Gestion menu restaurant
- Intègre MenuManager en mode full-page
- Sidebar avec catégories
- Grid items avec images
- Bouton "Ajouter item" en header
- Toggle "Mode aperçu" (vue client)

**Layout** : Header + Sidebar Categories + MenuManager Grid

### 4. `frontend/restaurant/src/pages/AnalyticsPage.jsx` ⚠️ VIDE
**Fonctionnalités** :
- Analytics détaillées
- Intègre Analytics et EarningsChart
- Graphiques détaillés :
  - Revenue over time
  - Orders over time
  - Popular dishes
  - Peak hours
  - Customer ratings
- Export données (bouton "Export CSV")
- Rapports personnalisés
- Date range selector
- Comparaison périodes

**Layout** : Header + Filters + Analytics + EarningsChart + Export Button

---

## 🎯 ÉTAPE 7 : APPLICATION PRINCIPALE (Fichiers vides - à compléter)

### 1. `frontend/restaurant/src/index.jsx` ⚠️ VIDE
**À implémenter** :
- Point d'entrée React
- Render App dans root
- Import index.css

### 2. `frontend/restaurant/src/App.jsx` ⚠️ VIDE
**À implémenter** :
- Composant racine de l'application restaurant
- Configuration React Router (BrowserRouter, Routes, Route)
- Gestion état global (Context API) :
  - WalletContext (wallet, address, balance, restaurant)
  - SocketContext (socket connection)
- Authentification restaurant via wallet
- Layout responsive avec sidebar/header
- Sidebar : Navigation (Dashboard, Orders, Menu, Analytics)
- Header : ConnectWallet + Restaurant name + Notifications
- Connexion Socket.io
- Routes :
  - `/` → DashboardPage
  - `/orders` → OrdersPage
  - `/menu` → MenuPage
  - `/analytics` → AnalyticsPage

---

## 🔐 ÉTAPE 8 : CONFIGURATION ENVIRONNEMENT

### Créer `frontend/restaurant/.env.example`
```
VITE_API_URL=http://localhost:3000/api
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...
VITE_SOCKET_URL=http://localhost:3000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Créer `frontend/restaurant/.env`
- Copier `.env.example`
- Remplir avec les valeurs réelles

---

## ✅ ÉTAPE 9 : TEST DE L'APPLICATION

### Commandes
```bash
npm run dev
```

### Tests à effectuer
- ✓ Connexion wallet restaurant MetaMask
- ✓ Vérification rôle RESTAURANT_ROLE
- ✓ Réception commandes en temps réel (Socket.io)
- ✓ Confirmation préparation
- ✓ Gestion menu (CRUD)
- ✓ Analytics et revenus
- ✓ Retrait fonds
- ✓ Responsive mobile

---

## 📚 ÉTAPE 10 : DOCUMENTATION

### Compléter `frontend/restaurant/README.md`
- Documentation complète application restaurant
- Description de chaque composant et page
- Services
- Workflow utilisateur
- Technologies utilisées

---

## 🎯 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1 : Configuration de base
1. Configuration TailwindCSS (`tailwind.config.js`, `index.css`)
2. Configuration Vite (`vite.config.js`)
3. Configuration PostCSS (`postcss.config.js`)
4. HTML de base (`public/index.html`)

### Phase 2 : Services (Fondations)
5. `services/api.js` - Appels API backend
6. `services/blockchain.js` - Interactions Web3

### Phase 3 : Composants de base
7. `components/ConnectWallet.jsx` - Connexion wallet
8. `components/OrdersQueue.jsx` - File d'attente commandes
9. `components/OrderCard.jsx` - Carte commande

### Phase 4 : Gestion menu
10. `components/MenuManager.jsx` - CRUD menu

### Phase 5 : Analytics
11. `components/Analytics.jsx` - Statistiques
12. `components/EarningsChart.jsx` - Revenus on-chain

### Phase 6 : Pages
13. `pages/DashboardPage.jsx` - Tableau de bord
14. `pages/OrdersPage.jsx` - Gestion commandes
15. `pages/MenuPage.jsx` - Gestion menu
16. `pages/AnalyticsPage.jsx` - Analytics détaillées

### Phase 7 : Application principale
17. `index.jsx` - Point d'entrée
18. `App.jsx` - Application principale avec routing

### Phase 8 : Finalisation
19. Variables d'environnement (`.env.example`, `.env`)
20. Tests et corrections
21. Documentation finale

---

## 📝 NOTES IMPORTANTES

- **Tous les fichiers existent déjà mais sont VIDES** - Il faut les compléter
- Utiliser **React 18** avec **Vite** pour build rapide
- **TailwindCSS** pour styling responsive
- **Socket.io** pour notifications temps réel
- **Chart.js** pour graphiques analytics
- **MetaMask** pour authentification Web3
- **Ethers.js v6** pour interactions blockchain
- **IPFS** pour stockage décentralisé (images menu)
- **PaymentSplitter** pour gestion revenus on-chain

---

## 🚀 VALIDATION DU SPRINT 4

✓ Tous les fichiers vides complétés avec le code
✓ Dashboard restaurant fonctionnel
✓ Notifications commandes temps réel
✓ Gestion menu complète
✓ Analytics avec charts
✓ Intégration blockchain pour revenus
✓ Documentation complète

