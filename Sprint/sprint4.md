# SPRINT 4: FRONTEND RESTAURANT DASHBOARD

## OBJECTIF
Créer l'interface React pour les restaurants permettant de gérer les commandes, le menu et consulter les statistiques en temps réel.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES** ou **PARTIELLEMENT REMPLIS**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `frontend/restaurant/` (existe)
- ✓ `frontend/restaurant/src/` (existe)
- ✓ `frontend/restaurant/src/components/` (existe)
- ✓ `frontend/restaurant/src/pages/` (existe)
- ✓ `frontend/restaurant/src/services/` (existe)

**Fichiers existants mais vides/à compléter:**
- ✓ `frontend/restaurant/src/App.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/index.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/public/index.html` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/ConnectWallet.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/OrdersQueue.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/OrderCard.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/MenuManager.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/Analytics.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/components/EarningsChart.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/pages/DashboardPage.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/pages/OrdersPage.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/pages/MenuPage.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/pages/AnalyticsPage.jsx` (vide - à compléter)
- ✓ `frontend/restaurant/src/services/api.js` (vide - à compléter)
- ✓ `frontend/restaurant/src/services/blockchain.js` (vide - à compléter)
- ✓ `frontend/restaurant/src/index.css` (vide - à compléter)
- ✓ `frontend/restaurant/vite.config.js` (vide - à compléter)
- ✓ `frontend/restaurant/tailwind.config.js` (vide - à compléter)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Node.js (v18+) est installé
- ✓ Avoir l'URL de l'API backend (Sprint 2)
- ✓ Préparer les adresses des contrats déployés
- ✓ Avoir accès aux données de test (restaurants)

### ÉTAPE 2: INITIALISATION DU FRONTEND RESTAURANT
1. Aller dans le dossier `frontend/restaurant/`:
   ```bash
   cd frontend/restaurant
   ```
2. Initialiser npm (si pas déjà fait):
   ```bash
   npm init -y
   ```
3. Installer les dépendances principales:
   ```bash
   npm install react-router-dom ethers socket.io-client chart.js react-chartjs-2 axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

### ÉTAPE 3: CONFIGURATION DE TAILWINDCSS
**Fichiers à compléter:**
- `tailwind.config.js` (vide - à compléter)
- `index.css` avec directives Tailwind (vide - à compléter)
- `vite.config.js` (vide - à compléter)

### ÉTAPE 4: IMPLÉMENTATION DES SERVICES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/restaurant/src/services/api.js`** (vide - à compléter)
   - Service appels API backend
   - Fonctions: `getRestaurant()`, `getOrders()`, `confirmPreparation()`, `updateMenu()`, `addMenuItem()`, `updateMenuItem()`, `deleteMenuItem()`, `getAnalytics()`, `uploadImage()`

2. **`frontend/restaurant/src/services/blockchain.js`** (vide - à compléter)
   - Service interactions Web3
   - Fonctions: `connectWallet()`, `hasRole()`, `confirmPreparationOnChain()`, `getRestaurantOrders()`, `getEarningsOnChain()`, `getPaymentSplitEvents()`, `getPendingBalance()`, `withdraw()`

### ÉTAPE 5: IMPLÉMENTATION DES COMPOSANTS
**Fichiers à compléter (existent mais vides):**

1. **`frontend/restaurant/src/components/ConnectWallet.jsx`** (vide - à compléter)
   - Connexion MetaMask pour restaurant
   - Détection MetaMask
   - Vérification rôle RESTAURANT_ROLE
   - Affichage adresse connectée

2. **`frontend/restaurant/src/components/OrdersQueue.jsx`** (vide - à compléter)
   - File d'attente commandes en temps réel
   - Socket.io listener 'orderCreated'
   - Accept/Reject order (optionnel)
   - Estimation temps de préparation
   - Bouton "Confirmer préparation"
   - Filtres par statut

3. **`frontend/restaurant/src/components/OrderCard.jsx`** (vide - à compléter)
   - Carte individuelle commande
   - Détails: orderId, items avec quantités, prix, images IPFS
   - Adresse de livraison
   - Informations client
   - Badge statut coloré
   - Timer: temps écoulé depuis création

4. **`frontend/restaurant/src/components/MenuManager.jsx`** (vide - à compléter)
   - Gestion complète du menu restaurant
   - CRUD items menu (Create, Read, Update, Delete)
   - Upload images vers IPFS
   - Définition prix (MATIC + conversion EUR)
   - Activation/désactivation items
   - Catégorisation (Entrées, Plats, Desserts, Boissons)

5. **`frontend/restaurant/src/components/Analytics.jsx`** (vide - à compléter)
   - Statistiques restaurant
   - Total commandes (jour/semaine/mois)
   - Graphique revenus (line chart)
   - Plats les plus populaires (bar chart horizontal)
   - Temps moyen de préparation
   - Vue d'ensemble notes (rating moyen, nombre avis)
   - Derniers commentaires clients
   - Filtres période

6. **`frontend/restaurant/src/components/EarningsChart.jsx`** (vide - à compléter)
   - Graphique revenus et gains on-chain
   - Revenus quotidiens/hebdomadaires (line chart)
   - Data depuis blockchain events PaymentSplit
   - Retraits en attente
   - Bouton "Retirer"
   - Historique transactions on-chain

### ÉTAPE 6: IMPLÉMENTATION DES PAGES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/restaurant/src/pages/DashboardPage.jsx`** (vide - à compléter)
   - Tableau de bord principal
   - Vue d'ensemble commandes du jour
   - Statistiques rapides (KPIs)
   - Commandes en attente (intègre OrdersQueue)
   - Revenus du jour

2. **`frontend/restaurant/src/pages/OrdersPage.jsx`** (vide - à compléter)
   - Gestion complète des commandes
   - Liste toutes commandes
   - Table avec colonnes: Order ID, Client, Items, Total, Status, Date, Actions
   - Filtres par statut et date
   - Search bar
   - Modal détails commande complète

3. **`frontend/restaurant/src/pages/MenuPage.jsx`** (vide - à compléter)
   - Gestion menu restaurant
   - Intègre MenuManager en mode full-page
   - Sidebar avec catégories
   - Grid items avec images
   - Bouton "Ajouter item"

4. **`frontend/restaurant/src/pages/AnalyticsPage.jsx`** (vide - à compléter)
   - Analytics détaillées
   - Intègre Analytics et EarningsChart
   - Graphiques détaillés
   - Export données (bouton "Export CSV")
   - Date range selector

### ÉTAPE 7: CONFIGURATION DU ROUTING
**Fichier à compléter:** `frontend/restaurant/src/App.jsx` (vide - à compléter)

**Implémenter:**
- Composant racine application restaurant
- Configuration React Router
- Gestion état global (Context API ou Redux)
- Authentification restaurant via wallet
- Layout avec navigation sidebar/header
- Gestion notifications Socket.io

**Routes à configurer:**
- `/` → DashboardPage
- `/orders` → OrdersPage
- `/menu` → MenuPage
- `/analytics` → AnalyticsPage

### ÉTAPE 8: CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
**Créer:** `frontend/restaurant/.env.example`
- `VITE_API_URL`
- `VITE_ORDER_MANAGER_ADDRESS`
- `VITE_PAYMENT_SPLITTER_ADDRESS`
- `VITE_SOCKET_URL`
- `VITE_IPFS_GATEWAY`

**Créer:** `.env` avec les valeurs réelles

### ÉTAPE 9: TEST DE L'APPLICATION
1. Démarrer le serveur de développement:
   ```bash
   npm run dev
   ```
2. Tester les fonctionnalités:
   - Connexion wallet restaurant
   - Réception commandes en temps réel
   - Confirmation préparation
   - Gestion menu
   - Analytics et revenus

### ÉTAPE 10: DOCUMENTATION
**Fichier à compléter:** `frontend/restaurant/README.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Documentation complète application restaurant
- Description de chaque composant et page
- Services
- Workflow utilisateur
- Technologies utilisées

### ÉTAPE 11: VALIDATION DU SPRINT 4
✓ Tous les fichiers vides complétés avec le code
✓ Dashboard restaurant fonctionnel
✓ Notifications commandes temps réel
✓ Gestion menu complète
✓ Analytics avec charts
✓ Intégration blockchain pour revenus
✓ Documentation complète

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Configuration (Fichiers vides - à compléter)
- `frontend/restaurant/tailwind.config.js` ⚠️ VIDE
- `frontend/restaurant/vite.config.js` ⚠️ VIDE
- `frontend/restaurant/src/index.css` ⚠️ VIDE

### 2. Services (Fichiers vides - à compléter)
- `frontend/restaurant/src/services/api.js` ⚠️ VIDE
- `frontend/restaurant/src/services/blockchain.js` ⚠️ VIDE

### 3. Composants (Fichiers vides - à compléter)
- `frontend/restaurant/src/components/ConnectWallet.jsx` ⚠️ VIDE
- `frontend/restaurant/src/components/OrdersQueue.jsx` ⚠️ VIDE
- `frontend/restaurant/src/components/OrderCard.jsx` ⚠️ VIDE
- `frontend/restaurant/src/components/MenuManager.jsx` ⚠️ VIDE
- `frontend/restaurant/src/components/Analytics.jsx` ⚠️ VIDE
- `frontend/restaurant/src/components/EarningsChart.jsx` ⚠️ VIDE

### 4. Pages (Fichiers vides - à compléter)
- `frontend/restaurant/src/pages/DashboardPage.jsx` ⚠️ VIDE
- `frontend/restaurant/src/pages/OrdersPage.jsx` ⚠️ VIDE
- `frontend/restaurant/src/pages/MenuPage.jsx` ⚠️ VIDE
- `frontend/restaurant/src/pages/AnalyticsPage.jsx` ⚠️ VIDE

### 5. Application Principale (Fichiers vides - à compléter)
- `frontend/restaurant/src/App.jsx` ⚠️ VIDE
- `frontend/restaurant/src/index.jsx` ⚠️ VIDE
- `frontend/restaurant/public/index.html` ⚠️ VIDE

### 6. Configuration
- `frontend/restaurant/.env.example` (à créer)
- `frontend/restaurant/.env` (à créer)

### 7. Documentation
- `frontend/restaurant/README.md` (peut être complété après implémentation)

---

## FONCTIONNALITÉS DÉTAILLÉES PAR COMPOSANT

### OrdersQueue.jsx
- Real-time incoming orders (Socket.io)
- Accept/Reject order (optionnel)
- Preparation time estimate
- Confirm preparation button

### MenuManager.jsx
- CRUD menu items
- Upload images to IPFS
- Set prices
- Enable/disable items

### Analytics.jsx
- Total orders today/week/month
- Revenue chart
- Popular dishes
- Average preparation time
- Ratings overview

### EarningsChart.jsx
- Daily/weekly earnings
- Pending withdrawals
- Withdrawn amounts
- Transaction history on-chain

---

## LIVRABLES ATTENDUS

✓ Dashboard restaurant fonctionnel
✓ Notifications commandes temps réel
✓ Gestion menu complète
✓ Analytics avec charts
✓ Intégration blockchain pour revenus
✓ Documentation complète

---

## NOTES IMPORTANTES

- Application React avec Vite
- Socket.io pour notifications temps réel
- Chart.js ou Recharts pour graphiques
- Interface optimisée pour gestion commandes
- Analytics complètes avec données on-chain et off-chain

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 5: Frontend Deliverer App
→ Lire `SPRINT_5.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_5.txt` pour les étapes détaillées

