# ÉTAPES DE DÉVELOPPEMENT - SPRINT 8 : FRONTEND ADMIN DASHBOARD

## 📋 RÉCAPITULATIF GÉNÉRAL

**Objectif** : Créer le dashboard administrateur pour le monitoring de la plateforme avec analytics en temps réel et gestion des litiges.

**État actuel** : Le dossier `frontend/admin/` n'existe pas encore. Il faut le créer ainsi que tous les fichiers.

---

## 🔧 ÉTAPE 1 : PRÉPARATION DE L'ENVIRONNEMENT

### Prérequis
- ✓ Node.js (v18+) installé
- ✓ URL de l'API backend (Sprint 2)
- ✓ Adresses des contrats déployés (OrderManager, Token, Staking)
- ✓ Wallet avec rôle PLATFORM/ADMIN

---

## 📦 ÉTAPE 2 : INITIALISATION DU PROJET

### Commandes à exécuter
```bash
mkdir -p frontend/admin
cd frontend/admin
npm create vite@latest . -- --template react
npm install react-router-dom ethers chart.js react-chartjs-2 axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## ⚙️ ÉTAPE 3 : CONFIGURATION (Fichiers à créer)

### 1. `frontend/admin/tailwind.config.js` ⚠️ À CRÉER
**À implémenter** :
- Configuration TailwindCSS
- Content paths : `["./index.html", "./src/**/*.{js,jsx}"]`
- Thème personnalisé (couleurs admin, fonts)
- Extend colors pour thème admin

### 2. `frontend/admin/vite.config.js` ⚠️ À CRÉER
**À implémenter** :
- Configuration Vite
- Plugin React
- Port dev server : 3003
- Proxy API vers backend (localhost:3000)

### 3. `frontend/admin/src/index.css` ⚠️ À CRÉER
**À implémenter** :
- Directives Tailwind : `@tailwind base; @tailwind components; @tailwind utilities;`
- Styles globaux personnalisés pour admin
- Reset CSS si nécessaire

### 4. `frontend/admin/public/index.html` ⚠️ À CRÉER
**À implémenter** :
- Structure HTML de base
- Meta tags (viewport, charset)
- Titre "DONE Admin Dashboard"
- Point d'entrée React (#root)

---

## 🔌 ÉTAPE 4 : SERVICES (Fichiers à créer)

### 1. `frontend/admin/src/services/api.js` ⚠️ À CRÉER
**Fonctions à implémenter** :
- `getPlatformStats()` - GET /api/admin/stats
  - Retourne : total commandes, GMV, utilisateurs actifs, revenue plateforme, temps moyen livraison, taux satisfaction
- `getDisputes(filters)` - GET /api/admin/disputes
  - Paramètres : { status, page, limit }
  - Retourne : liste litiges avec détails
- `resolveDispute(disputeId, resolution)` - POST /api/admin/resolve-dispute/:id
  - Paramètres : disputeId, { winner, reason }
  - Résout un litige manuellement
- `getUsers(filters)` - GET /api/admin/users
  - Paramètres : { search, status, page, limit, hasTokens }
  - Retourne : liste utilisateurs paginée
- `getRestaurants(filters)` - GET /api/admin/restaurants
  - Paramètres : { search, cuisine, status, page, limit, minRating }
  - Retourne : liste restaurants paginée
- `getDeliverers(filters)` - GET /api/admin/deliverers
  - Paramètres : { search, staked, available, page, limit }
  - Retourne : liste livreurs paginée
- Configuration : `API_BASE_URL`, `authHeaders(address)`, interceptors axios

### 2. `frontend/admin/src/services/blockchain.js` ⚠️ À CRÉER
**Fonctions à implémenter** :
- `connectWallet()` - Connexion MetaMask pour admin
- `hasRole(userAddress, role)` - Vérifier rôle PLATFORM/ADMIN
  - Utilise `ORDER_MANAGER.hasRole(PLATFORM_ROLE, userAddress)`
- `getPlatformRevenue(timeframe)` - Revenue plateforme depuis events
  - Paramètres : timeframe = "day" | "week" | "month"
  - Filtre events PaymentSplit depuis blockchain
  - Calcule total revenue (10% de chaque commande)
  - Retourne : { total, transactions, breakdown }
- `resolveDisputeOnChain(disputeId, winner)` - Résolution on-chain
  - Appelle `ORDER_MANAGER.resolveDispute(disputeId, winner)`
  - Attend confirmation transaction
- `getTotalSupply()` - Total tokens DONE mintés
- `getCirculatingSupply()` - Tokens en circulation
- `getBurnedSupply()` - Tokens brûlés
- Configuration : Provider, contrats (OrderManager, Token, Staking)

---

## 🧩 ÉTAPE 5 : COMPOSANTS (Fichiers à créer)

### 1. `frontend/admin/src/components/ConnectWallet.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Détection MetaMask installé
- Connexion wallet (window.ethereum.request)
- Vérification rôle PLATFORM/ADMIN via `blockchain.hasRole()`
- Affichage adresse connectée (format court)
- Affichage solde MATIC
- Bouton déconnexion
- Gestion erreurs (rejected, network, pas de rôle admin)
- Message d'erreur si pas de rôle admin

**State** : `address`, `isConnecting`, `balance`, `hasAdminRole`, `error`

### 2. `frontend/admin/src/components/PlatformStats.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Fetch stats via `api.getPlatformStats()`
- Grid layout responsive (4 colonnes)
- Cards statistiques :
  - Commandes Aujourd'hui (avec variation %)
  - GMV Total (avec variation %)
  - Utilisateurs Actifs (clients/restaurants/livreurs)
  - Revenue Plateforme (10% des commandes)
  - Temps Moyen Livraison (format mm:ss)
  - Taux Satisfaction Client (format %)
- Icônes de tendance (↑ vert si positif, ↓ rouge si négatif)
- Auto-refresh toutes les 30 secondes
- Skeleton loader pendant chargement

**State** : `stats`, `loading`, `error`

### 3. `frontend/admin/src/components/OrdersChart.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Graphique line chart (Chart.js) des commandes dans le temps
- Axe X : dates
- Axe Y : nombre commandes
- Filtres période : Jour / Semaine / Mois / Année
- Comparaison avec période précédente (optionnel)
- Fetch via `api.getAnalytics('orders', { timeframe })`
- Options graphique : responsive, tooltips, légende

**State** : `timeframe`, `chartData`, `loading`

### 4. `frontend/admin/src/components/RevenueChart.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Graphique line chart revenus plateforme
- Data depuis blockchain events PaymentSplit
- Filtres période : Jour / Semaine / Mois
- Breakdown par source :
  - Revenue Total (plateforme)
  - Revenue Restaurants (70%)
  - Revenue Livreurs (20%)
- Multi-datasets sur même graphique
- Formater montants en MATIC et USD
- Fetch via `blockchain.getPlatformRevenue()` + `api.getAnalytics('revenue')`

**State** : `timeframe`, `chartData`, `breakdown`, `loading`

### 5. `frontend/admin/src/components/UsersTable.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Table paginée des utilisateurs (clients)
- Colonnes : Address, Name, Email, Total Orders, Total Spent, Tokens DONE, Status
- Search bar (debounce 300ms)
- Filtres :
  - Status : Tous / Actifs / Inactifs
  - Tokens : Tous / Avec tokens / Sans tokens
- Pagination (10 users par page)
- Actions : Voir détails, Suspendre, Activer
- Formatage adresses (0x1234...5678)
- Formatage montants (MATIC + EUR)

**State** : `users`, `page`, `limit`, `search`, `filters`, `total`, `loading`

### 6.   ⚠️ À CRÉER
**Fonctionnalités** :
- Table paginée des restaurants
- Colonnes : Address, Name, Cuisine, Total Orders, Revenue, Rating, Status
- Search bar (debounce 300ms)
- Filtres :
  - Status : Tous / Actifs / Inactifs
  - Cuisine : Toutes / Italienne / Chinoise / etc.
  - Rating minimum (input number)
- Pagination (10 restaurants par page)
- Afficher étoiles pour rating
- Actions : Voir détails, Suspendre, Activer

**State** : `restaurants`, `page`, `limit`, `search`, `filters`, `total`, `loading`

### 7. `frontend/admin/src/components/DeliverersTable.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Table paginée des livreurs
- Colonnes : Address, Name, Vehicle, Staked Amount, Total Deliveries, Rating, Earnings, Status
- Search bar (debounce 300ms)
- Filtres :
  - Stakés : Tous / Stakés / Non stakés
  - Disponibles : Tous / Disponibles / Indisponibles
- Pagination (10 livreurs par page)
- Afficher warning si livreur non staké
- Afficher montant staké en MATIC
- Actions : Voir détails, Suspendre, Activer

**State** : `deliverers`, `page`, `limit`, `search`, `filters`, `total`, `loading`

### 8. `frontend/admin/src/components/DisputesManager.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Liste litiges actifs
- Cards litiges avec :
  - Order ID
  - Client et Restaurant (adresses formatées)
  - Raison du litige
  - Status (ACTIVE, RESOLVED)
  - Votes : Client X | Restaurant Y
- Interface vote (si arbitrage décentralisé)
  - Boutons "Voter Client" / "Voter Restaurant"
- Détails litige (modal) :
  - orderId, parties, raison
  - Preuves IPFS (images)
  - Historique votes
- Actions :
  - Voir détails (ouvre modal)
  - Résoudre manuellement (si période vote terminée)
- Historique résolutions
- Fetch via `api.getDisputes({ status: 'active' })`

**State** : `disputes`, `selectedDispute`, `showModal`, `loading`

### 9. `frontend/admin/src/components/TokenomicsPanel.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Panel tokenomics DONE
- Stats cards :
  - Total tokens DONE mintés
  - Tokens en circulation
  - Tokens brûlés
  - Prix token (si listé sur DEX)
- Graphique doughnut : Distribution tokens
  - En circulation
  - Brûlés
  - Locked
- Graphique line : Émission/burn dans le temps
- Table Top 10 Holders :
  - Colonnes : Address, Balance, Percentage
- Fetch via `blockchain.getTotalSupply()` + `api.getTopTokenHolders()`

**State** : `tokenomics`, `topHolders`, `loading`

---

## 📄 ÉTAPE 6 : PAGES (Fichiers à créer)

### 1. `frontend/admin/src/pages/DashboardPage.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Tableau de bord principal admin
- Intègre `PlatformStats` (stats globales)
- Intègre `OrdersChart` (graphique commandes)
- Intègre `RevenueChart` (graphique revenus)
- Vue d'ensemble KPIs
- Section "Actions Rapides" :
  - Liens vers autres pages (Orders, Users, Disputes, Settings)
- Layout responsive (grid)
- Auto-refresh données toutes les 30 secondes

**Layout** : Header + Stats Cards + Charts Grid + Quick Actions

### 2. `frontend/admin/src/pages/OrdersPage.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Gestion toutes commandes plateforme
- Table avec colonnes : Order ID, Client, Restaurant, Total, Status, Date, Actions
- Filtres avancés :
  - Status : Tous / CREATED / PREPARING / IN_DELIVERY / DELIVERED / DISPUTED
  - Date range (dateFrom, dateTo)
- Détails commande complète (modal) :
  - Timeline des statuts
  - Transaction hash
  - Items commande (depuis IPFS)
  - Livreur assigné
- Actions admin :
  - Annuler commande (si status != DELIVERED)
  - Forcer résolution (si status = DISPUTED)
- Fetch via `api.getOrders(filters)`

**State** : `orders`, `filters`, `selectedOrder`, `showModal`, `loading`

### 3. `frontend/admin/src/pages/UsersPage.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Gestion utilisateurs
- Intègre `UsersTable` component
- Actions :
  - Suspendre utilisateur (via API)
  - Activer utilisateur (via API)
  - Voir détails (modal avec historique commandes)
- Modal détails utilisateur :
  - Informations complètes
  - Historique commandes
  - Tokens DONE détenus
  - Stats fidélité

**State** : `selectedUser`, `showModal`

### 4. `frontend/admin/src/pages/DisputesPage.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Gestion litiges
- Intègre `DisputesManager` component
- Filtres : Actifs / Résolus / Tous
- Résolution manuelle si nécessaire
- Historique complet des résolutions
- Interface vote (si arbitrage décentralisé)

**State** : `filter` (active, resolved, all)

### 5. `frontend/admin/src/pages/SettingsPage.jsx` ⚠️ À CRÉER
**Fonctionnalités** :
- Paramètres plateforme
- Section "Configuration Rôles" :
  - Liste rôles (CLIENT, RESTAURANT, DELIVERER, PLATFORM, ARBITRATOR)
  - Assigner rôle à une adresse
  - Retirer rôle d'une adresse
  - Utilise `blockchain.assignRole()` / `blockchain.revokeRole()`
- Section "Adresses Contrats" :
  - Afficher adresses contrats (OrderManager, Token, Staking)
  - Read-only
- Section "Variables Système" :
  - Platform Fee (10%)
  - Min Stake Amount (0.1 ETH)
  - Autres paramètres configurables
- Bouton "Sauvegarder" (confirmation requise)

**State** : `settings`, `saving`, `loading`

---

## 🎯 ÉTAPE 7 : APPLICATION PRINCIPALE (Fichiers à créer)

### 1. `frontend/admin/src/index.jsx` ⚠️ À CRÉER
**À implémenter** :
- Point d'entrée React
- Render App dans root
- Import index.css
- React.StrictMode

### 2. `frontend/admin/src/App.jsx` ⚠️ À CRÉER
**À implémenter** :
- Composant racine application admin
- Configuration React Router (BrowserRouter, Routes, Route)
- Authentification admin via wallet
- Vérification rôle PLATFORM/ADMIN avant affichage
- Layout avec navigation :
  - Header : ConnectWallet + Navigation + User info
  - Sidebar : Menu navigation (Dashboard, Orders, Users, Disputes, Settings)
  - Main content : Routes
- Gestion état global (Context API) :
  - WalletContext (wallet, address, hasAdminRole)
- Protection routes : Rediriger vers connexion si pas admin
- Routes :
  - `/` → DashboardPage
  - `/orders` → OrdersPage
  - `/users` → UsersPage
  - `/disputes` → DisputesPage
  - `/settings` → SettingsPage

---

## 🔐 ÉTAPE 8 : CONFIGURATION ENVIRONNEMENT

### Créer `frontend/admin/.env.example`
```env
VITE_API_URL=http://localhost:3000
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
```

### Créer `frontend/admin/.env`
- Copier `.env.example`
- Remplir avec les valeurs réelles

---

## 🔧 ÉTAPE 9 : ROUTES BACKEND (Fichiers à créer)

### 1. `backend/src/routes/admin.js` ⚠️ À CRÉER
**Routes à implémenter** :
- `GET /api/admin/stats` - Statistiques globales plateforme
  - Retourne : total commandes, GMV, utilisateurs actifs, revenue, temps moyen, satisfaction
- `GET /api/admin/disputes` - Tous litiges avec statut
  - Query params : { status, page, limit }
  - Retourne : liste litiges paginée
- `POST /api/admin/resolve-dispute/:id` - Résolution manuelle litige
  - Body : { winner, reason }
  - Résout un litige manuellement
- `GET /api/admin/users` - Liste utilisateurs
  - Query params : { search, status, page, limit, hasTokens }
  - Retourne : liste utilisateurs paginée
- `GET /api/admin/restaurants` - Liste restaurants
  - Query params : { search, cuisine, status, page, limit, minRating }
  - Retourne : liste restaurants paginée
- `GET /api/admin/deliverers` - Liste livreurs
  - Query params : { search, staked, available, page, limit }
  - Retourne : liste livreurs paginée
- Middleware : Vérification rôle ADMIN/PLATFORM (via `authMiddleware.requireAdminRole`)

### 2. `backend/src/routes/analytics.js` ⚠️ À CRÉER
**Routes à implémenter** :
- `GET /api/analytics/dashboard` - Dashboard analytics
  - Retourne : données agrégées pour dashboard
- `GET /api/analytics/orders` - Analytics commandes
  - Query params : { timeframe }
  - Retourne : données commandes dans le temps (dates, counts)
- `GET /api/analytics/revenue` - Analytics revenus
  - Query params : { timeframe }
  - Retourne : données revenus dans le temps + breakdown
- `GET /api/analytics/users` - Analytics utilisateurs
  - Query params : { timeframe }
  - Retourne : données utilisateurs dans le temps
- Middleware : Vérification rôle ADMIN/PLATFORM

### 3. Mettre à jour `backend/src/server.js`
- Ajouter les routes admin et analytics
- Importer et utiliser les routers

---

## ✅ ÉTAPE 10 : TEST DE L'APPLICATION

### Commandes
```bash
cd frontend/admin
npm run dev
```

### Tests à effectuer
- ✓ Connexion wallet admin (vérification rôle)
- ✓ Affichage statistiques globales
- ✓ Graphiques commandes et revenus
- ✓ Gestion utilisateurs (recherche, filtres, pagination)
- ✓ Gestion restaurants (recherche, filtres, pagination)
- ✓ Gestion livreurs (recherche, filtres, pagination)
- ✓ Gestion litiges (vote, résolution)
- ✓ Tokenomics panel
- ✓ Paramètres plateforme
- ✓ Responsive mobile

---

## 📚 ÉTAPE 11 : DOCUMENTATION

### Compléter `docs/ADMIN_GUIDE.md`
- Guide administrateur complet
- Gestion rôles
- Résolution litiges
- Monitoring transactions
- Configuration système
- Troubleshooting

---

## 🎯 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1 : Configuration de base
1. Créer dossier `frontend/admin/`
2. Initialiser projet Vite + React
3. Configuration TailwindCSS (`tailwind.config.js`, `index.css`)
4. Configuration Vite (`vite.config.js`)
5. HTML de base (`public/index.html`)

### Phase 2 : Services (Fondations)
6. `services/api.js` - Appels API backend admin
7. `services/blockchain.js` - Interactions Web3 admin

### Phase 3 : Composants de base
8. `components/ConnectWallet.jsx` - Authentification admin
9. `App.jsx` - Routing et layout avec vérification rôle

### Phase 4 : Composants statistiques
10. `components/PlatformStats.jsx` - Stats globales
11. `components/OrdersChart.jsx` - Graphique commandes
12. `components/RevenueChart.jsx` - Graphique revenus

### Phase 5 : Composants tables
13. `components/UsersTable.jsx` - Table utilisateurs
14. `components/RestaurantsTable.jsx` - Table restaurants
15. `components/DeliverersTable.jsx` - Table livreurs

### Phase 6 : Composants avancés
16. `components/DisputesManager.jsx` - Gestion litiges
17. `components/TokenomicsPanel.jsx` - Tokenomics

### Phase 7 : Pages
18. `pages/DashboardPage.jsx` - Dashboard principal
19. `pages/OrdersPage.jsx` - Page commandes
20. `pages/UsersPage.jsx` - Page utilisateurs
21. `pages/DisputesPage.jsx` - Page litiges
22. `pages/SettingsPage.jsx` - Page paramètres

### Phase 8 : Backend routes
23. `backend/src/routes/admin.js` - Routes API admin
24. `backend/src/routes/analytics.js` - Routes API analytics
25. Mettre à jour `backend/src/server.js`

### Phase 9 : Application principale
26. `index.jsx` - Point d'entrée
27. Finaliser `App.jsx` - Application principale

### Phase 10 : Finalisation
28. Variables d'environnement (`.env.example`, `.env`)
29. Tests et corrections
30. Documentation finale (`docs/ADMIN_GUIDE.md`)

---

## 📝 NOTES IMPORTANTES

- **Le dossier `frontend/admin/` n'existe pas encore** - Il faut le créer
- Utiliser **React 18** avec **Vite** pour build rapide
- **TailwindCSS** pour styling responsive
- **Chart.js** avec **react-chartjs-2** pour graphiques
- **Ethers.js v6** pour interactions blockchain
- **Axios** pour appels API
- **Sécurité critique** : Toujours vérifier rôle ADMIN/PLATFORM avant chaque action
- **Protection routes** : Rediriger vers connexion si pas admin
- **Auto-refresh** : Actualiser données toutes les 30 secondes pour stats temps réel

---

## 🚀 VALIDATION DU SPRINT 8

✓ Tous les fichiers créés et complétés
✓ Dashboard admin fonctionnel
✓ Analytics temps réel (commandes, revenus)
✓ Interface gestion litiges avec vote
✓ Gestion utilisateurs/restaurants/livreurs
✓ Routes backend admin créées
✓ Routes backend analytics créées
✓ Documentation complète

---

## 🔒 SÉCURITÉ

- **Vérification rôle** : Toujours vérifier rôle ADMIN/PLATFORM avant affichage
- **Protection routes** : Routes backend protégées par middleware
- **Validation données** : Valider tous les inputs côté frontend et backend
- **Gestion erreurs** : Ne pas exposer messages d'erreur sensibles
- **Authentification** : Vérifier wallet connecté et rôle valide à chaque chargement

---

## 📊 TECHNOLOGIES UTILISÉES

- **React 18** - Framework UI
- **React Router** - Routing
- **Ethers.js v6** - Interactions blockchain
- **Chart.js** + **react-chartjs-2** - Graphiques
- **Axios** - Appels API
- **TailwindCSS** - Styling
- **Vite** - Build tool

---

## 🎯 FONCTIONNALITÉS PRINCIPALES

✅ Dashboard avec KPIs en temps réel
✅ Analytics avec graphiques (commandes, revenus)
✅ Gestion utilisateurs avec recherche et filtres
✅ Gestion restaurants avec recherche et filtres
✅ Gestion livreurs avec recherche et filtres
✅ Gestion litiges avec interface vote
✅ Tokenomics DONE avec statistiques
✅ Configuration plateforme et rôles

---

## 📚 RÉFÉRENCES

- **Frontend Client** : `frontend/client/ETAPES_DEVELOPPEMENT.md`
- **Frontend Restaurant** : `frontend/restaurant/README.md`
- **Frontend Deliverer** : `frontend/deliverer/README.md`
- **Backend API** : `backend/README.md`
- **Smart Contracts** : `contracts/README.md`
- **Sprint 8 Documentation** : `Sprint/sprint8.md`, `sprint 8/SPRINT_8.txt`, `sprint 8/ETAPES_8.txt`

---

Bon développement ! 🚀

