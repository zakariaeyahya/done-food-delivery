# SPRINT 8: ANALYTICS & ADMIN DASHBOARD

## OBJECTIF
Créer le dashboard admin pour le monitoring de la plateforme avec analytics en temps réel et gestion des litiges.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Le dossier `frontend/admin/` n'existe pas encore. Il faut le créer ainsi que tous les fichiers.

**Dossiers à créer:**
- ⚠️ `frontend/admin/` (à créer)
- ⚠️ `frontend/admin/src/` (à créer)
- ⚠️ `frontend/admin/src/components/` (à créer)
- ⚠️ `frontend/admin/src/pages/` (à créer)
- ⚠️ `frontend/admin/src/services/` (à créer)

**Fichiers à créer:**
- ⚠️ Tous les fichiers admin (à créer)

**Fichiers backend à créer:**
- ⚠️ `backend/src/routes/admin.js` (à créer)
- ⚠️ `backend/src/routes/analytics.js` (à créer)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Node.js (v18+) est installé
- ✓ Avoir l'URL de l'API backend (Sprint 2)
- ✓ Préparer les adresses des contrats déployés
- ✓ Avoir un wallet avec rôle PLATFORM/ADMIN

### ÉTAPE 2: INITIALISATION DU FRONTEND ADMIN
1. Créer le dossier `frontend/admin/`:
   ```bash
   mkdir -p frontend/admin
   cd frontend/admin
   ```
2. Initialiser le projet Vite + React:
   ```bash
   npm create vite@latest . -- --template react
   ```
3. Installer les dépendances principales:
   ```bash
   npm install react-router-dom ethers chart.js react-chartjs-2 axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

### ÉTAPE 3: CONFIGURATION DE TAILWINDCSS
**Fichiers à créer:**
- `tailwind.config.js` (à créer)
- `index.css` avec directives Tailwind (à créer)
- `vite.config.js` (à créer)

### ÉTAPE 4: CRÉATION DE LA STRUCTURE DES DOSSIERS
1. Créer la structure complète:
   ```
   frontend/admin/
   ├── public/
   │   └── index.html
   ├── src/
   │   ├── components/
   │   ├── pages/
   │   ├── services/
   │   ├── App.jsx
   │   ├── index.jsx
   │   └── index.css
   └── package.json
   ```

### ÉTAPE 5: CRÉATION DES SERVICES
**Fichiers à créer:**

1. **`frontend/admin/src/services/api.js`** (à créer)
   - Service appels API backend admin
   - Fonctions: `getPlatformStats()`, `getDisputes()`, `resolveDispute()`, `getUsers()`, `getRestaurants()`, `getDeliverers()`

2. **`frontend/admin/src/services/blockchain.js`** (à créer)
   - Service interactions Web3 admin
   - Fonctions: `hasRole()`, `getPlatformRevenue()`, `resolveDisputeOnChain()`

### ÉTAPE 6: CRÉATION DES COMPOSANTS
**Fichiers à créer:**

1. **`frontend/admin/src/components/ConnectWallet.jsx`** (à créer)
   - Connexion MetaMask pour admin
   - Vérification rôle PLATFORM/ADMIN
   - Affichage adresse connectée

2. **`frontend/admin/src/components/PlatformStats.jsx`** (à créer)
   - Statistiques globales plateforme
   - Total commandes (aujourd'hui/semaine/mois)
   - Total GMV (Gross Merchandise Value)
   - Utilisateurs actifs (clients/restaurants/livreurs)
   - Revenue plateforme (10% des commandes)
   - Temps moyen livraison
   - Taux satisfaction client
   - Cards avec icônes et pourcentages variation

3. **`frontend/admin/src/components/OrdersChart.jsx`** (à créer)
   - Graphique commandes dans le temps
   - Line chart avec axe X: dates, axe Y: nombre commandes
   - Filtres: Jour / Semaine / Mois / Année
   - Comparaison périodes

4. **`frontend/admin/src/components/RevenueChart.jsx`** (à créer)
   - Graphique revenus plateforme
   - Line chart revenus dans le temps
   - Data depuis blockchain events PaymentSplit
   - Filtres période
   - Breakdown par source (restaurants, livreurs)

5. **`frontend/admin/src/components/UsersTable.jsx`** (à créer)
   - Table utilisateurs (clients)
   - Colonnes: Address, Name, Email, Total Orders, Total Spent, Tokens DONE, Status
   - Pagination
   - Search bar
   - Filtres (actifs/inactifs, avec tokens/sans tokens)

6. **`frontend/admin/src/components/RestaurantsTable.jsx`** (à créer)
   - Table restaurants
   - Colonnes: Address, Name, Cuisine, Total Orders, Revenue, Rating, Status
   - Pagination
   - Search bar
   - Filtres (actifs/inactifs, par cuisine, par rating)

7. **`frontend/admin/src/components/DeliverersTable.jsx`** (à créer)
   - Table livreurs
   - Colonnes: Address, Name, Vehicle, Staked Amount, Total Deliveries, Rating, Earnings, Status
   - Pagination
   - Search bar
   - Filtres (stakés/non-stakés, disponibles/indisponibles)

8. **`frontend/admin/src/components/DisputesManager.jsx`** (à créer)
   - Gestion litiges
   - Liste litiges actifs
   - Interface vote (si arbitrage décentralisé)
   - Détails litige (orderId, parties, raison, preuves IPFS)
   - Historique résolutions
   - Actions: Résoudre manuellement, Voir détails, Voir votes

9. **`frontend/admin/src/components/TokenomicsPanel.jsx`** (à créer)
   - Panel tokenomics DONE
   - Total tokens DONE mintés
   - Tokens en circulation
   - Tokens brûlés
   - Prix token (si listé)
   - Distribution tokens (top holders)
   - Graphique émission/burn dans le temps

### ÉTAPE 7: CRÉATION DES PAGES
**Fichiers à créer:**

1. **`frontend/admin/src/pages/DashboardPage.jsx`** (à créer)
   - Tableau de bord principal admin
   - Intègre PlatformStats, OrdersChart, RevenueChart
   - Vue d'ensemble KPIs
   - Accès rapide autres pages

2. **`frontend/admin/src/pages/OrdersPage.jsx`** (à créer)
   - Gestion toutes commandes plateforme
   - Table avec filtres avancés
   - Détails commande complète
   - Actions admin (annuler, forcer résolution)

3. **`frontend/admin/src/pages/UsersPage.jsx`** (à créer)
   - Gestion utilisateurs
   - Intègre UsersTable
   - Actions: Suspendre, Activer, Voir détails

4. **`frontend/admin/src/pages/DisputesPage.jsx`** (à créer)
   - Gestion litiges
   - Intègre DisputesManager
   - Résolution manuelle si nécessaire
   - Historique complet

5. **`frontend/admin/src/pages/SettingsPage.jsx`** (à créer)
   - Paramètres plateforme
   - Configuration rôles
   - Paramètres contrats
   - Variables système

### ÉTAPE 8: CRÉATION DES ROUTES BACKEND ADMIN
**Fichiers à créer:**

1. **`backend/src/routes/admin.js`** (à créer)
   - Routes API admin
   - `GET /api/admin/stats` - Statistiques globales plateforme
   - `GET /api/admin/disputes` - Tous litiges avec statut
   - `POST /api/admin/resolve-dispute/:id` - Résolution manuelle litige
   - `GET /api/admin/users` - Liste utilisateurs
   - `GET /api/admin/restaurants` - Liste restaurants
   - `GET /api/admin/deliverers` - Liste livreurs
   - Middleware: Vérification rôle ADMIN/PLATFORM

2. **`backend/src/routes/analytics.js`** (à créer)
   - Routes API analytics
   - `GET /api/analytics/dashboard` - Dashboard analytics
   - `GET /api/analytics/orders` - Analytics commandes
   - `GET /api/analytics/revenue` - Analytics revenus
   - `GET /api/analytics/users` - Analytics utilisateurs

3. Mettre à jour `backend/src/server.js`:
   - Ajouter les routes admin et analytics

### ÉTAPE 9: CONFIGURATION DU ROUTING
**Fichier à créer:** `frontend/admin/src/App.jsx` (à créer)

**Implémenter:**
- Composant racine application admin
- Configuration React Router
- Authentification admin via wallet
- Layout avec navigation sidebar/header
- Vérification rôle PLATFORM/ADMIN

**Routes à configurer:**
- `/` → DashboardPage
- `/orders` → OrdersPage
- `/users` → UsersPage
- `/disputes` → DisputesPage
- `/settings` → SettingsPage

### ÉTAPE 10: CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
**Créer:** `frontend/admin/.env.example`
- `VITE_API_URL`
- `VITE_ORDER_MANAGER_ADDRESS`
- `VITE_TOKEN_ADDRESS`

**Créer:** `.env` avec les valeurs réelles

### ÉTAPE 11: TEST DE L'APPLICATION
1. Démarrer le serveur de développement:
   ```bash
   npm run dev
   ```
2. Tester les fonctionnalités:
   - Connexion wallet admin
   - Affichage statistiques globales
   - Gestion utilisateurs/restaurants/livreurs
   - Gestion litiges
   - Analytics et graphiques

### ÉTAPE 12: DOCUMENTATION
**Fichier à compléter:** `docs/ADMIN_GUIDE.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Guide administrateur
- Gestion rôles
- Résolution litiges
- Monitoring transactions
- Configuration système

### ÉTAPE 13: VALIDATION DU SPRINT 8
✓ Tous les fichiers créés et complétés
✓ Dashboard admin fonctionnel
✓ Analytics temps réel
✓ Interface gestion litiges
✓ Gestion utilisateurs/restaurants/livreurs
✓ Routes backend admin créées
✓ Documentation complète

---

## RÉCAPITULATIF DES FICHIERS À CRÉER PAR ORDRE

**⚠️ NOTE:** Ces fichiers doivent être **CRÉÉS**. Il faut les créer dans l'ordre suivant:

### 1. Structure Frontend Admin (À créer)
- `frontend/admin/` (dossier à créer)
- `frontend/admin/src/` (dossier à créer)
- `frontend/admin/src/components/` (dossier à créer)
- `frontend/admin/src/pages/` (dossier à créer)
- `frontend/admin/src/services/` (dossier à créer)

### 2. Configuration (Fichiers à créer)
- `frontend/admin/tailwind.config.js` ⚠️ À CRÉER
- `frontend/admin/vite.config.js` ⚠️ À CRÉER
- `frontend/admin/src/index.css` ⚠️ À CRÉER
- `frontend/admin/public/index.html` ⚠️ À CRÉER

### 3. Services (Fichiers à créer)
- `frontend/admin/src/services/api.js` ⚠️ À CRÉER
- `frontend/admin/src/services/blockchain.js` ⚠️ À CRÉER

### 4. Composants (Fichiers à créer)
- `frontend/admin/src/components/ConnectWallet.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/PlatformStats.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/OrdersChart.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/RevenueChart.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/UsersTable.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/RestaurantsTable.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/DeliverersTable.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/DisputesManager.jsx` ⚠️ À CRÉER
- `frontend/admin/src/components/TokenomicsPanel.jsx` ⚠️ À CRÉER

### 5. Pages (Fichiers à créer)
- `frontend/admin/src/pages/DashboardPage.jsx` ⚠️ À CRÉER
- `frontend/admin/src/pages/OrdersPage.jsx` ⚠️ À CRÉER
- `frontend/admin/src/pages/UsersPage.jsx` ⚠️ À CRÉER
- `frontend/admin/src/pages/DisputesPage.jsx` ⚠️ À CRÉER
- `frontend/admin/src/pages/SettingsPage.jsx` ⚠️ À CRÉER

### 6. Application Principale (Fichiers à créer)
- `frontend/admin/src/App.jsx` ⚠️ À CRÉER
- `frontend/admin/src/index.jsx` ⚠️ À CRÉER

### 7. Routes Backend (Fichiers à créer)
- `backend/src/routes/admin.js` ⚠️ À CRÉER
- `backend/src/routes/analytics.js` ⚠️ À CRÉER

### 8. Configuration
- `frontend/admin/.env.example` (à créer)
- `frontend/admin/.env` (à créer)

### 9. Documentation
- `docs/ADMIN_GUIDE.md` (peut être complété après implémentation)

---

## FONCTIONNALITÉS DÉTAILLÉES PAR COMPOSANT

### PlatformStats.jsx
- Statistiques globales plateforme
- Total commandes, GMV, utilisateurs actifs
- Revenue plateforme, temps moyen livraison
- Taux satisfaction client

### OrdersChart.jsx
- Graphique commandes dans le temps
- Filtres période
- Comparaison périodes

### RevenueChart.jsx
- Graphique revenus plateforme
- Data depuis blockchain events
- Breakdown par source

### DisputesManager.jsx
- Gestion litiges
- Interface vote
- Résolution manuelle
- Historique résolutions

---

## LIVRABLES ATTENDUS

✓ Dashboard admin fonctionnel
✓ Analytics temps réel
✓ Interface gestion litiges
✓ Gestion utilisateurs/restaurants/livreurs
✓ Routes backend admin créées
✓ Documentation complète

---

## NOTES IMPORTANTES

- Dashboard admin pour monitoring complet plateforme
- Analytics depuis données on-chain et off-chain
- Gestion litiges avec interface vote
- Accès restreint aux rôles PLATFORM/ADMIN
- Sécurité importante: vérifier rôles avant chaque action

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 9: Deployment & Documentation
→ Lire `SPRINT_9.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_9.txt` pour les étapes détaillées

