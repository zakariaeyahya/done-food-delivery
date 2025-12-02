# Frontend Admin Dashboard - Guide de Développement

## 📋 Vue d'Ensemble

Ce dossier contient l'application React pour le dashboard administrateur de la plateforme DONE Food Delivery. Cette application permet de monitorer la plateforme, gérer les utilisateurs, restaurants, livreurs, et résoudre les litiges.

---

## 📁 Structure des Fichiers

```
frontend/admin/
├── public/
│   └── index.html              ← HTML de base
├── src/
│   ├── components/             ← Composants réutilisables
│   │   ├── ConnectWallet.jsx
│   │   ├── PlatformStats.jsx
│   │   ├── OrdersChart.jsx
│   │   ├── RevenueChart.jsx
│   │   ├── UsersTable.jsx
│   │   ├── RestaurantsTable.jsx
│   │   ├── DeliverersTable.jsx
│   │   ├── DisputesManager.jsx
│   │   └── TokenomicsPanel.jsx
│   ├── pages/                  ← Pages de l'application
│   │   ├── DashboardPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── DisputesPage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/               ← Services API et Blockchain
│   │   ├── api.js
│   │   └── blockchain.js
│   ├── App.jsx                 ← Composant racine avec routing
│   ├── index.jsx               ← Point d'entrée React
│   └── index.css               ← Styles globaux TailwindCSS
├── package.json                ← Dépendances npm
├── vite.config.js              ← Configuration Vite
├── tailwind.config.js          ← Configuration TailwindCSS
└── README.md                   ← Ce fichier
```

---

## 🚀 Guide de Développement par Fichier

### 1. `src/App.jsx` - Composant Racine

**Rôle:** Composant principal qui configure le routing, l'authentification, et le layout de l'application.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER BrowserRouter, Routes, Route, Navigate
IMPORTER Layout components (Header, Sidebar)
IMPORTER Toutes les Pages
IMPORTER ConnectWallet component
IMPORTER blockchainService

FONCTION App():
    ÉTAT: walletConnected = false
    ÉTAT: userAddress = null
    ÉTAT: hasAdminRole = false
    ÉTAT: loading = true

    EFFET au montage:
        VÉRIFIER si MetaMask est installé
        SI oui:
            VÉRIFIER si wallet déjà connecté (localStorage)
            SI connecté:
                CONNECTER wallet automatiquement
                VÉRIFIER rôle admin via blockchainService.hasRole()
                SI rôle valide:
                    hasAdminRole = true
                    userAddress = adresse connectée
                SINON:
                    AFFICHER erreur "Vous n'avez pas les droits admin"
            SINON:
                AFFICHER composant ConnectWallet
        SINON:
            AFFICHER message "Installer MetaMask"
        loading = false

    FONCTION handleConnect():
        APPELER blockchainService.connectWallet()
        SI succès:
            walletConnected = true
            userAddress = adresse connectée
            VÉRIFIER rôle admin
            SI rôle valide:
                hasAdminRole = true
                SAUVEGARDER dans localStorage
            SINON:
                AFFICHER erreur "Accès refusé"
        SINON:
            AFFICHER erreur connexion

    FONCTION handleDisconnect():
        DÉCONNECTER wallet
        walletConnected = false
        userAddress = null
        hasAdminRole = false
        SUPPRIMER localStorage

    SI loading:
        RETOURNER <LoadingSpinner />

    SI !walletConnected OU !hasAdminRole:
        RETOURNER <ConnectWallet onConnect={handleConnect} />

    RETOURNER:
        <BrowserRouter>
            <Layout>
                <Header 
                    userAddress={userAddress}
                    onDisconnect={handleDisconnect}
                />
                <Sidebar />
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/disputes" element={<DisputesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </BrowserRouter>
```

**Points importants:**
- Vérifier le rôle admin AVANT d'afficher l'interface
- Protéger toutes les routes avec vérification rôle
- Gérer les états de chargement et d'erreur
- Sauvegarder l'état de connexion dans localStorage

---

### 2. `src/index.jsx` - Point d'Entrée

**Rôle:** Point d'entrée React qui rend l'application.

**Pseudo-code:**

```
IMPORTER React
IMPORTER ReactDOM
IMPORTER App depuis './App'
IMPORTER './index.css'

RENDRE:
    <React.StrictMode>
        <App />
    </React.StrictMode>
    DANS document.getElementById('root')
```

**Points importants:**
- Utiliser React.StrictMode pour détecter les problèmes
- Importer les styles globaux

---

### 3. `public/index.html` - HTML de Base

**Rôle:** Structure HTML de base de l'application.

**Pseudo-code:**

```
<!DOCTYPE html>
<html>
    <head>
        META charset="utf-8"
        META viewport pour responsive
        TITRE "DONE Admin Dashboard"
        LIEN favicon
    </head>
    <body>
        DIV id="root" (où React va s'attacher)
        SCRIPT type="module" src="/src/index.jsx"
    </body>
</html>
```

**Points importants:**
- Meta viewport pour mobile responsive
- Point d'attache pour React (#root)

---

### 4. `src/services/api.js` - Service API Backend

**Rôle:** Service centralisé pour tous les appels API backend admin.

**Pseudo-code:**

```
IMPORTER axios
IMPORTER .env variables (VITE_API_URL)

CONST API_BASE_URL = import.meta.env.VITE_API_URL

FONCTION getPlatformStats():
    ESSAYER:
        RÉPONSE = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur avec message

FONCTION getDisputes(filters):
    PARAMÈTRES: filters = { status, page, limit }
    ESSAYER:
        RÉPONSE = await axios.get(`${API_BASE_URL}/api/admin/disputes`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        })
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur

FONCTION resolveDispute(disputeId, resolution):
    PARAMÈTRES: disputeId, resolution = { winner, reason }
    ESSAYER:
        RÉPONSE = await axios.post(
            `${API_BASE_URL}/api/admin/resolve-dispute/${disputeId}`,
            resolution,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur

FONCTION getUsers(filters):
    PARAMÈTRES: filters = { search, status, page, limit }
    ESSAYER:
        RÉPONSE = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        })
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur

FONCTION getRestaurants(filters):
    PARAMÈTRES: filters = { search, cuisine, status, page, limit }
    ESSAYER:
        RÉPONSE = await axios.get(`${API_BASE_URL}/api/admin/restaurants`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        })
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur

FONCTION getDeliverers(filters):
    PARAMÈTRES: filters = { search, staked, available, page, limit }
    ESSAYER:
        RÉPONSE = await axios.get(`${API_BASE_URL}/api/admin/deliverers`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        })
        RETOURNER RÉPONSE.data
    ATTRAPER erreur:
        LOG erreur
        LANCER nouvelle erreur

EXPORTER toutes les fonctions
```

**Points importants:**
- Gérer les erreurs HTTP (401, 403, 500)
- Ajouter token d'authentification dans headers
- Utiliser interceptors axios pour gestion globale erreurs
- Gérer les timeouts (5 secondes)

---

### 5. `src/services/blockchain.js` - Service Blockchain

**Rôle:** Service pour interactions Web3 directes avec les smart contracts.

**Pseudo-code:**

```
IMPORTER ethers
IMPORTER .env variables (VITE_ORDER_MANAGER_ADDRESS, VITE_TOKEN_ADDRESS)
IMPORTER ABI des contrats

CONST provider = new ethers.BrowserProvider(window.ethereum)
CONST ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS
CONST TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS

FONCTION hasRole(userAddress, role):
    PARAMÈTRES: userAddress, role = "PLATFORM_ROLE"
    ESSAYER:
        CONTRAT = new ethers.Contract(ORDER_MANAGER_ADDRESS, ABI, provider)
        hasRole = await CONTRAT.hasRole(role, userAddress)
        RETOURNER hasRole
    ATTRAPER erreur:
        LOG erreur
        RETOURNER false

FONCTION getPlatformRevenue(timeframe):
    PARAMÈTRES: timeframe = "day" | "week" | "month"
    ESSAYER:
        CONTRAT = new ethers.Contract(ORDER_MANAGER_ADDRESS, ABI, provider)
        FILTRER events PaymentSplit depuis timeframe
        CALCULER total revenue (10% de chaque commande)
        RETOURNER {
            total: totalRevenue,
            transactions: events,
            breakdown: { byDay, byWeek, byMonth }
        }
    ATTRAPER erreur:
        LOG erreur
        RETOURNER { total: 0, transactions: [], breakdown: {} }

FONCTION resolveDisputeOnChain(disputeId, winner):
    PARAMÈTRES: disputeId, winner = "CLIENT" | "RESTAURANT" | "DELIVERER"
    ESSAYER:
        SIGNER = provider.getSigner()
        CONTRAT = new ethers.Contract(ORDER_MANAGER_ADDRESS, ABI, signer)
        TRANSACTION = await CONTRAT.resolveDispute(disputeId, winner)
        ATTENDRE confirmation transaction
        RETOURNER { txHash: transaction.hash, success: true }
    ATTRAPER erreur:
        LOG erreur
        RETOURNER { success: false, error: erreur.message }

EXPORTER toutes les fonctions
```

**Points importants:**
- Vérifier que MetaMask est connecté avant chaque appel
- Gérer les erreurs de transaction (rejected, failed)
- Attendre confirmation blockchain avant retourner succès
- Utiliser events pour récupérer données historiques

---

### 6. `src/components/ConnectWallet.jsx` - Connexion Wallet

**Rôle:** Composant pour connecter MetaMask et vérifier le rôle admin.

**Pseudo-code:**

```
IMPORTER React, useState
IMPORTER blockchainService

FONCTION ConnectWallet({ onConnect }):
    ÉTAT: connecting = false
    ÉTAT: error = null

    FONCTION handleConnect():
        connecting = true
        error = null
        
        ESSAYER:
            ADRESSE = await blockchainService.connectWallet()
            HAS_ROLE = await blockchainService.hasRole(ADRESSE, "PLATFORM_ROLE")
            
            SI HAS_ROLE:
                APPELER onConnect(ADRESSE)
            SINON:
                error = "Vous n'avez pas les droits administrateur"
                connecting = false
        ATTRAPER erreur:
            error = erreur.message
            connecting = false

    VÉRIFIER si MetaMask installé:
        SI non:
            RETOURNER <div>Installer MetaMask</div>

    RETOURNER:
        <div>
            <h1>Connexion Admin</h1>
            SI error:
                <div className="error">{error}</div>
            <button onClick={handleConnect} disabled={connecting}>
                {connecting ? "Connexion..." : "Connecter MetaMask"}
            </button>
        </div>
```

**Points importants:**
- Vérifier MetaMask installé
- Vérifier rôle admin après connexion
- Gérer les erreurs de connexion
- Désactiver bouton pendant connexion

---

### 7. `src/components/PlatformStats.jsx` - Statistiques Plateforme

**Rôle:** Afficher les statistiques globales de la plateforme avec cards.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService
IMPORTER Icons (TrendingUp, TrendingDown, Users, etc.)

FONCTION PlatformStats():
    ÉTAT: stats = null
    ÉTAT: loading = true
    ÉTAT: error = null

    EFFET au montage:
        CHARGER stats:
            ESSAYER:
                DATA = await apiService.getPlatformStats()
                stats = DATA
                loading = false
            ATTRAPER erreur:
                error = erreur.message
                loading = false

    SI loading:
        RETOURNER <LoadingSpinner />

    SI error:
        RETOURNER <ErrorMessage error={error} />

    CALCULER variations (comparaison avec période précédente):
        ordersVariation = (stats.ordersToday - stats.ordersYesterday) / stats.ordersYesterday * 100
        revenueVariation = (stats.revenueToday - stats.revenueYesterday) / stats.revenueYesterday * 100
        usersVariation = (stats.activeUsers - stats.activeUsersLastWeek) / stats.activeUsersLastWeek * 100

    RETOURNER:
        <div className="grid grid-cols-4 gap-4">
            <StatCard
                title="Commandes Aujourd'hui"
                value={stats.ordersToday}
                variation={ordersVariation}
                icon={<OrdersIcon />}
            />
            <StatCard
                title="GMV Total"
                value={formatCurrency(stats.totalGMV)}
                variation={revenueVariation}
                icon={<RevenueIcon />}
            />
            <StatCard
                title="Utilisateurs Actifs"
                value={stats.activeUsers}
                variation={usersVariation}
                icon={<UsersIcon />}
            />
            <StatCard
                title="Revenue Plateforme"
                value={formatCurrency(stats.platformRevenue)}
                icon={<PlatformIcon />}
            />
            <StatCard
                title="Temps Moyen Livraison"
                value={formatTime(stats.avgDeliveryTime)}
                icon={<TimeIcon />}
            />
            <StatCard
                title="Taux Satisfaction"
                value={formatPercentage(stats.satisfactionRate)}
                icon={<RatingIcon />}
            />
        </div>
```

**Points importants:**
- Auto-refresh toutes les 30 secondes
- Calculer variations avec période précédente
- Afficher icônes de tendance (↑ vert, ↓ rouge)
- Formater les valeurs (devise, pourcentage, temps)

---

### 8. `src/components/OrdersChart.jsx` - Graphique Commandes

**Rôle:** Afficher graphique line chart des commandes dans le temps.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER { Line } depuis 'react-chartjs-2'
IMPORTER apiService

FONCTION OrdersChart():
    ÉTAT: timeframe = "week"
    ÉTAT: chartData = null
    ÉTAT: loading = true

    EFFET quand timeframe change:
        CHARGER données:
            ESSAYER:
                DATA = await apiService.getAnalytics('orders', { timeframe })
                chartData = {
                    labels: DATA.dates,
                    datasets: [{
                        label: 'Commandes',
                        data: DATA.orders,
                        borderColor: 'blue',
                        fill: false
                    }]
                }
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    RETOURNER:
        <div>
            <div className="filters">
                <button onClick={() => timeframe = "day"}>Jour</button>
                <button onClick={() => timeframe = "week"}>Semaine</button>
                <button onClick={() => timeframe = "month"}>Mois</button>
                <button onClick={() => timeframe = "year"}>Année</button>
            </div>
            SI loading:
                <LoadingSpinner />
            SINON:
                <Line data={chartData} options={chartOptions} />
        </div>
```

**Points importants:**
- Utiliser Chart.js avec react-chartjs-2
- Gérer filtres période (jour/semaine/mois/année)
- Options graphique: responsive, tooltips, légende
- Comparaison avec période précédente (optionnel)

---

### 9. `src/components/RevenueChart.jsx` - Graphique Revenus

**Rôle:** Afficher graphique revenus plateforme depuis blockchain events.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER { Line } depuis 'react-chartjs-2'
IMPORTER blockchainService
IMPORTER apiService

FONCTION RevenueChart():
    ÉTAT: timeframe = "week"
    ÉTAT: chartData = null
    ÉTAT: loading = true
    ÉTAT: breakdown = null

    EFFET quand timeframe change:
        CHARGER données:
            ESSAYER:
                // Récupérer depuis blockchain
                BLOCKCHAIN_DATA = await blockchainService.getPlatformRevenue(timeframe)
                // Récupérer depuis API pour breakdown
                API_DATA = await apiService.getAnalytics('revenue', { timeframe })
                
                chartData = {
                    labels: BLOCKCHAIN_DATA.dates,
                    datasets: [
                        {
                            label: 'Revenue Total',
                            data: BLOCKCHAIN_DATA.revenue,
                            borderColor: 'green'
                        },
                        {
                            label: 'Revenue Restaurants',
                            data: API_DATA.restaurantRevenue,
                            borderColor: 'blue'
                        },
                        {
                            label: 'Revenue Livreurs',
                            data: API_DATA.delivererRevenue,
                            borderColor: 'orange'
                        }
                    ]
                }
                breakdown = API_DATA.breakdown
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    RETOURNER:
        <div>
            <div className="filters">
                <button onClick={() => timeframe = "day"}>Jour</button>
                <button onClick={() => timeframe = "week"}>Semaine</button>
                <button onClick={() => timeframe = "month"}>Mois</button>
            </div>
            SI loading:
                <LoadingSpinner />
            SINON:
                <Line data={chartData} options={chartOptions} />
                <div className="breakdown">
                    <h3>Breakdown</h3>
                    <div>Restaurants: {breakdown.restaurant}%</div>
                    <div>Livreurs: {breakdown.deliverer}%</div>
                    <div>Plateforme: {breakdown.platform}%</div>
                </div>
        </div>
```

**Points importants:**
- Combiner données blockchain (on-chain) et API (off-chain)
- Afficher plusieurs datasets (total, restaurants, livreurs)
- Breakdown par source (70% restaurant, 20% livreur, 10% plateforme)
- Formater montants en MATIC et USD

---

### 10. `src/components/UsersTable.jsx` - Table Utilisateurs

**Rôle:** Afficher table paginée des utilisateurs avec recherche et filtres.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService

FONCTION UsersTable():
    ÉTAT: users = []
    ÉTAT: loading = true
    ÉTAT: page = 1
    ÉTAT: limit = 10
    ÉTAT: search = ""
    ÉTAT: filters = { status: "all", hasTokens: "all" }
    ÉTAT: total = 0

    EFFET quand page, search, filters changent:
        CHARGER utilisateurs:
            ESSAYER:
                DATA = await apiService.getUsers({
                    page,
                    limit,
                    search,
                    ...filters
                })
                users = DATA.users
                total = DATA.total
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    FONCTION handleSearch(value):
        search = value
        page = 1 // Reset à première page

    FONCTION handleFilterChange(filterName, value):
        filters[filterName] = value
        page = 1

    FONCTION handlePageChange(newPage):
        page = newPage
        SCROLLER en haut de table

    RETOURNER:
        <div>
            <div className="controls">
                <input 
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <select onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                </select>
                <select onChange={(e) => handleFilterChange('hasTokens', e.target.value)}>
                    <option value="all">Tous</option>
                    <option value="yes">Avec tokens</option>
                    <option value="no">Sans tokens</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Total Orders</th>
                        <th>Total Spent</th>
                        <th>Tokens DONE</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    POUR CHAQUE user DANS users:
                        <tr>
                            <td>{formatAddress(user.address)}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.totalOrders}</td>
                            <td>{formatCurrency(user.totalSpent)}</td>
                            <td>{formatTokens(user.tokensDONE)}</td>
                            <td><StatusBadge status={user.status} /></td>
                            <td>
                                <button onClick={() => viewDetails(user.id)}>Voir</button>
                                <button onClick={() => suspendUser(user.id)}>Suspendre</button>
                            </td>
                        </tr>
                </tbody>
            </table>
            <Pagination 
                currentPage={page}
                totalPages={Math.ceil(total / limit)}
                onPageChange={handlePageChange}
            />
        </div>
```

**Points importants:**
- Debounce recherche (attendre 300ms après dernière frappe)
- Pagination côté serveur (pas tout charger)
- Actions: Voir détails, Suspendre, Activer
- Formatage adresses (0x1234...5678)

---

### 11. `src/components/RestaurantsTable.jsx` - Table Restaurants

**Rôle:** Afficher table paginée des restaurants avec recherche et filtres.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService

FONCTION RestaurantsTable():
    ÉTAT: restaurants = []
    ÉTAT: loading = true
    ÉTAT: page = 1
    ÉTAT: limit = 10
    ÉTAT: search = ""
    ÉTAT: filters = { status: "all", cuisine: "all", minRating: 0 }
    ÉTAT: total = 0

    EFFET quand page, search, filters changent:
        CHARGER restaurants:
            ESSAYER:
                DATA = await apiService.getRestaurants({
                    page,
                    limit,
                    search,
                    ...filters
                })
                restaurants = DATA.restaurants
                total = DATA.total
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    RETOURNER:
        <div>
            <div className="controls">
                <input 
                    type="text"
                    placeholder="Rechercher restaurant..."
                    value={search}
                    onChange={(e) => search = e.target.value}
                />
                <select onChange={(e) => filters.cuisine = e.target.value}>
                    <option value="all">Toutes cuisines</option>
                    <option value="italian">Italienne</option>
                    <option value="chinese">Chinoise</option>
                    // ... autres cuisines
                </select>
                <input 
                    type="number"
                    placeholder="Rating min"
                    value={filters.minRating}
                    onChange={(e) => filters.minRating = e.target.value}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Name</th>
                        <th>Cuisine</th>
                        <th>Total Orders</th>
                        <th>Revenue</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    POUR CHAQUE restaurant DANS restaurants:
                        <tr>
                            <td>{formatAddress(restaurant.address)}</td>
                            <td>{restaurant.name}</td>
                            <td>{restaurant.cuisine}</td>
                            <td>{restaurant.totalOrders}</td>
                            <td>{formatCurrency(restaurant.revenue)}</td>
                            <td><StarRating rating={restaurant.rating} /></td>
                            <td><StatusBadge status={restaurant.status} /></td>
                            <td>
                                <button onClick={() => viewDetails(restaurant.id)}>Voir</button>
                                <button onClick={() => suspendRestaurant(restaurant.id)}>Suspendre</button>
                            </td>
                        </tr>
                </tbody>
            </table>
            <Pagination 
                currentPage={page}
                totalPages={Math.ceil(total / limit)}
                onPageChange={(p) => page = p}
            />
        </div>
```

**Points importants:**
- Filtres par cuisine (dropdown)
- Filtre par rating minimum
- Afficher étoiles pour rating
- Actions: Voir détails, Suspendre, Activer

---

### 12. `src/components/DeliverersTable.jsx` - Table Livreurs

**Rôle:** Afficher table paginée des livreurs avec recherche et filtres.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService

FONCTION DeliverersTable():
    ÉTAT: deliverers = []
    ÉTAT: loading = true
    ÉTAT: page = 1
    ÉTAT: limit = 10
    ÉTAT: search = ""
    ÉTAT: filters = { staked: "all", available: "all" }
    ÉTAT: total = 0

    EFFET quand page, search, filters changent:
        CHARGER livreurs:
            ESSAYER:
                DATA = await apiService.getDeliverers({
                    page,
                    limit,
                    search,
                    ...filters
                })
                deliverers = DATA.deliverers
                total = DATA.total
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    RETOURNER:
        <div>
            <div className="controls">
                <input 
                    type="text"
                    placeholder="Rechercher livreur..."
                    value={search}
                    onChange={(e) => search = e.target.value}
                />
                <select onChange={(e) => filters.staked = e.target.value}>
                    <option value="all">Tous</option>
                    <option value="yes">Stakés</option>
                    <option value="no">Non stakés</option>
                </select>
                <select onChange={(e) => filters.available = e.target.value}>
                    <option value="all">Tous</option>
                    <option value="yes">Disponibles</option>
                    <option value="no">Indisponibles</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Name</th>
                        <th>Vehicle</th>
                        <th>Staked Amount</th>
                        <th>Total Deliveries</th>
                        <th>Rating</th>
                        <th>Earnings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    POUR CHAQUE deliverer DANS deliverers:
                        <tr>
                            <td>{formatAddress(deliverer.address)}</td>
                            <td>{deliverer.name}</td>
                            <td>{deliverer.vehicleType}</td>
                            <td>
                                {deliverer.stakedAmount > 0 
                                    ? formatCurrency(deliverer.stakedAmount) 
                                    : <span className="warning">Non staké</span>
                                }
                            </td>
                            <td>{deliverer.totalDeliveries}</td>
                            <td><StarRating rating={deliverer.rating} /></td>
                            <td>{formatCurrency(deliverer.earnings)}</td>
                            <td><StatusBadge status={deliverer.status} /></td>
                            <td>
                                <button onClick={() => viewDetails(deliverer.id)}>Voir</button>
                                <button onClick={() => suspendDeliverer(deliverer.id)}>Suspendre</button>
                            </td>
                        </tr>
                </tbody>
            </table>
            <Pagination 
                currentPage={page}
                totalPages={Math.ceil(total / limit)}
                onPageChange={(p) => page = p}
            />
        </div>
```

**Points importants:**
- Afficher warning si livreur non staké
- Filtres: stakés/non-stakés, disponibles/indisponibles
- Afficher montant staké en MATIC
- Actions: Voir détails, Suspendre, Activer

---

### 13. `src/components/DisputesManager.jsx` - Gestion Litiges

**Rôle:** Gérer les litiges avec interface de vote et résolution.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService
IMPORTER blockchainService

FONCTION DisputesManager():
    ÉTAT: disputes = []
    ÉTAT: loading = true
    ÉTAT: selectedDispute = null
    ÉTAT: showModal = false

    EFFET au montage:
        CHARGER litiges:
            ESSAYER:
                DATA = await apiService.getDisputes({ status: "active" })
                disputes = DATA.disputes
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    FONCTION handleViewDetails(disputeId):
        TROUVER dispute DANS disputes avec id = disputeId
        selectedDispute = dispute
        showModal = true

    FONCTION handleVote(disputeId, winner):
        ESSAYER:
            CONFIRMER vote avec utilisateur
            APPELER apiService.voteDispute(disputeId, winner)
            ACTUALISER liste disputes
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    FONCTION handleResolve(disputeId):
        ESSAYER:
            CONFIRMER résolution avec utilisateur
            APPELER apiService.resolveDispute(disputeId)
            APPELER blockchainService.resolveDisputeOnChain(disputeId)
            ACTUALISER liste disputes
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    RETOURNER:
        <div>
            <h2>Litiges Actifs</h2>
            <div className="disputes-list">
                POUR CHAQUE dispute DANS disputes:
                    <DisputeCard
                        dispute={dispute}
                        onViewDetails={() => handleViewDetails(dispute.id)}
                        onVote={(winner) => handleVote(dispute.id, winner)}
                        onResolve={() => handleResolve(dispute.id)}
                    />
            </div>
            SI showModal ET selectedDispute:
                <DisputeModal
                    dispute={selectedDispute}
                    onClose={() => showModal = false}
                    onVote={handleVote}
                    onResolve={handleResolve}
                />
        </div>

FONCTION DisputeCard({ dispute, onViewDetails, onVote, onResolve }):
    RETOURNER:
        <div className="dispute-card">
            <div>Order ID: {dispute.orderId}</div>
            <div>Client: {formatAddress(dispute.client)}</div>
            <div>Restaurant: {formatAddress(dispute.restaurant)}</div>
            <div>Raison: {dispute.reason}</div>
            <div>Status: {dispute.status}</div>
            <div>Votes: Client {dispute.votes.client} | Restaurant {dispute.votes.restaurant}</div>
            <div className="actions">
                <button onClick={onViewDetails}>Voir détails</button>
                <button onClick={() => onVote("CLIENT")}>Voter Client</button>
                <button onClick={() => onVote("RESTAURANT")}>Voter Restaurant</button>
                SI dispute.votingPeriodEnded:
                    <button onClick={onResolve}>Résoudre</button>
            </div>
        </div>
```

**Points importants:**
- Afficher preuves IPFS (images) dans modal
- Interface vote avec sélection gagnant
- Vérifier période de vote (48h)
- Résolution manuelle si nécessaire
- Historique résolutions

---

### 14. `src/components/TokenomicsPanel.jsx` - Panel Tokenomics

**Rôle:** Afficher statistiques tokenomics DONE avec graphiques.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER { Line, Doughnut } depuis 'react-chartjs-2'
IMPORTER blockchainService
IMPORTER apiService

FONCTION TokenomicsPanel():
    ÉTAT: tokenomics = null
    ÉTAT: loading = true
    ÉTAT: topHolders = []

    EFFET au montage:
        CHARGER données:
            ESSAYER:
                // Depuis blockchain
                TOTAL_SUPPLY = await blockchainService.getTotalSupply()
                CIRCULATING = await blockchainService.getCirculatingSupply()
                BURNED = await blockchainService.getBurnedSupply()
                
                // Depuis API
                TOP_HOLDERS = await apiService.getTopTokenHolders(10)
                EMISSION_HISTORY = await apiService.getTokenEmissionHistory()
                
                tokenomics = {
                    totalSupply: TOTAL_SUPPLY,
                    circulating: CIRCULATING,
                    burned: BURNED,
                    price: await getTokenPrice(), // Si listé
                    topHolders: TOP_HOLDERS,
                    emissionHistory: EMISSION_HISTORY
                }
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    CALCULER distribution:
        distributionData = {
            labels: ["En circulation", "Brûlés", "Locked"],
            data: [
                tokenomics.circulating,
                tokenomics.burned,
                tokenomics.totalSupply - tokenomics.circulating - tokenomics.burned
            ]
        }

    RETOURNER:
        <div>
            <h2>Tokenomics DONE</h2>
            <div className="stats-grid">
                <StatCard title="Total Minté" value={formatTokens(tokenomics.totalSupply)} />
                <StatCard title="En Circulation" value={formatTokens(tokenomics.circulating)} />
                <StatCard title="Brûlés" value={formatTokens(tokenomics.burned)} />
                SI tokenomics.price:
                    <StatCard title="Prix" value={formatCurrency(tokenomics.price)} />
            </div>
            <div className="charts">
                <Doughnut data={distributionData} />
                <Line data={tokenomics.emissionHistory} />
            </div>
            <div className="top-holders">
                <h3>Top 10 Holders</h3>
                <table>
                    POUR CHAQUE holder DANS tokenomics.topHolders:
                        <tr>
                            <td>{formatAddress(holder.address)}</td>
                            <td>{formatTokens(holder.balance)}</td>
                            <td>{formatPercentage(holder.percentage)}</td>
                        </tr>
                </table>
            </div>
        </div>
```

**Points importants:**
- Récupérer données depuis blockchain (supply, burned)
- Graphique doughnut pour distribution
- Graphique line pour émission/burn dans le temps
- Top holders avec pourcentage
- Prix token si listé sur DEX

---

### 15. `src/pages/DashboardPage.jsx` - Page Dashboard

**Rôle:** Page principale avec vue d'ensemble KPIs et graphiques.

**Pseudo-code:**

```
IMPORTER React
IMPORTER PlatformStats
IMPORTER OrdersChart
IMPORTER RevenueChart

FONCTION DashboardPage():
    RETOURNER:
        <div className="dashboard">
            <h1>Tableau de Bord Admin</h1>
            <PlatformStats />
            <div className="charts-section">
                <div className="chart-card">
                    <h2>Commandes</h2>
                    <OrdersChart />
                </div>
                <div className="chart-card">
                    <h2>Revenus</h2>
                    <RevenueChart />
                </div>
            </div>
            <div className="quick-actions">
                <h2>Actions Rapides</h2>
                <Link to="/orders">Voir toutes les commandes</Link>
                <Link to="/users">Gérer utilisateurs</Link>
                <Link to="/disputes">Gérer litiges</Link>
                <Link to="/settings">Paramètres</Link>
            </div>
        </div>
```

**Points importants:**
- Layout responsive (grid)
- Intégrer tous les composants stats et charts
- Liens rapides vers autres pages
- Auto-refresh données toutes les 30 secondes

---

### 16. `src/pages/OrdersPage.jsx` - Page Commandes

**Rôle:** Gestion complète de toutes les commandes plateforme.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService

FONCTION OrdersPage():
    ÉTAT: orders = []
    ÉTAT: loading = true
    ÉTAT: filters = { status: "all", dateFrom: null, dateTo: null }
    ÉTAT: selectedOrder = null
    ÉTAT: showModal = false

    EFFET quand filters changent:
        CHARGER commandes:
            ESSAYER:
                DATA = await apiService.getOrders(filters)
                orders = DATA.orders
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    FONCTION handleViewDetails(orderId):
        TROUVER order DANS orders avec id = orderId
        selectedOrder = order
        showModal = true

    FONCTION handleCancelOrder(orderId):
        CONFIRMER avec utilisateur
        ESSAYER:
            APPELER apiService.cancelOrder(orderId)
            ACTUALISER liste orders
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    FONCTION handleForceResolve(orderId):
        CONFIRMER avec utilisateur
        ESSAYER:
            APPELER apiService.forceResolveOrder(orderId)
            ACTUALISER liste orders
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    RETOURNER:
        <div>
            <h1>Gestion Commandes</h1>
            <div className="filters">
                <select onChange={(e) => filters.status = e.target.value}>
                    <option value="all">Tous</option>
                    <option value="CREATED">Créées</option>
                    <option value="PREPARING">En préparation</option>
                    <option value="IN_DELIVERY">En livraison</option>
                    <option value="DELIVERED">Livrées</option>
                    <option value="DISPUTED">En litige</option>
                </select>
                <input 
                    type="date"
                    onChange={(e) => filters.dateFrom = e.target.value}
                />
                <input 
                    type="date"
                    onChange={(e) => filters.dateTo = e.target.value}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Client</th>
                        <th>Restaurant</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    POUR CHAQUE order DANS orders:
                        <tr>
                            <td>{order.orderId}</td>
                            <td>{formatAddress(order.client)}</td>
                            <td>{order.restaurantName}</td>
                            <td>{formatCurrency(order.total)}</td>
                            <td><StatusBadge status={order.status} /></td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                                <button onClick={() => handleViewDetails(order.id)}>Voir</button>
                                SI order.status != "DELIVERED":
                                    <button onClick={() => handleCancelOrder(order.id)}>Annuler</button>
                                SI order.status == "DISPUTED":
                                    <button onClick={() => handleForceResolve(order.id)}>Forcer résolution</button>
                            </td>
                        </tr>
                </tbody>
            </table>
            SI showModal:
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => showModal = false}
                />
        </div>
```

**Points importants:**
- Filtres avancés (statut, date range)
- Actions admin: Annuler, Forcer résolution
- Modal détails commande complète
- Timeline des statuts
- Transaction hash affiché

---

### 17. `src/pages/UsersPage.jsx` - Page Utilisateurs

**Rôle:** Gestion des utilisateurs avec table et actions.

**Pseudo-code:**

```
IMPORTER React
IMPORTER UsersTable
IMPORTER apiService

FONCTION UsersPage():
    ÉTAT: selectedUser = null
    ÉTAT: showModal = false

    FONCTION handleSuspend(userId):
        CONFIRMER avec utilisateur
        ESSAYER:
            APPELER apiService.suspendUser(userId)
            ACTUALISER UsersTable
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    FONCTION handleActivate(userId):
        ESSAYER:
            APPELER apiService.activateUser(userId)
            ACTUALISER UsersTable
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    FONCTION handleViewDetails(userId):
        CHARGER détails utilisateur:
            ESSAYER:
                USER = await apiService.getUserDetails(userId)
                selectedUser = USER
                showModal = true
            ATTRAPER erreur:
                AFFICHER message erreur

    RETOURNER:
        <div>
            <h1>Gestion Utilisateurs</h1>
            <UsersTable
                onSuspend={handleSuspend}
                onActivate={handleActivate}
                onViewDetails={handleViewDetails}
            />
            SI showModal:
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => showModal = false}
                />
        </div>
```

**Points importants:**
- Intègre UsersTable component
- Actions: Suspendre, Activer, Voir détails
- Modal détails utilisateur complet
- Historique commandes utilisateur

---

### 18. `src/pages/DisputesPage.jsx` - Page Litiges

**Rôle:** Gestion complète des litiges avec résolution.

**Pseudo-code:**

```
IMPORTER React, useState
IMPORTER DisputesManager
IMPORTER apiService

FONCTION DisputesPage():
    ÉTAT: filter = "active" // active, resolved, all

    RETOURNER:
        <div>
            <h1>Gestion Litiges</h1>
            <div className="filters">
                <button onClick={() => filter = "active"}>Actifs</button>
                <button onClick={() => filter = "resolved"}>Résolus</button>
                <button onClick={() => filter = "all"}>Tous</button>
            </div>
            <DisputesManager filter={filter} />
        </div>
```

**Points importants:**
- Intègre DisputesManager component
- Filtres: Actifs, Résolus, Tous
- Résolution manuelle si nécessaire
- Historique complet

---

### 19. `src/pages/SettingsPage.jsx` - Page Paramètres

**Rôle:** Configuration plateforme, rôles, contrats.

**Pseudo-code:**

```
IMPORTER React, useState, useEffect
IMPORTER apiService
IMPORTER blockchainService

FONCTION SettingsPage():
    ÉTAT: settings = null
    ÉTAT: loading = true
    ÉTAT: saving = false

    EFFET au montage:
        CHARGER paramètres:
            ESSAYER:
                DATA = await apiService.getSettings()
                settings = DATA
                loading = false
            ATTRAPER erreur:
                LOG erreur
                loading = false

    FONCTION handleSaveSettings():
        saving = true
        ESSAYER:
            APPELER apiService.updateSettings(settings)
            AFFICHER message succès
            saving = false
        ATTRAPER erreur:
            AFFICHER message erreur
            saving = false

    FONCTION handleAssignRole(address, role):
        CONFIRMER avec utilisateur
        ESSAYER:
            APPELER blockchainService.assignRole(address, role)
            AFFICHER message succès
        ATTRAPER erreur:
            AFFICHER message erreur

    RETOURNER:
        <div>
            <h1>Paramètres Plateforme</h1>
            <div className="settings-sections">
                <section>
                    <h2>Configuration Rôles</h2>
                    <RoleManager onAssignRole={handleAssignRole} />
                </section>
                <section>
                    <h2>Adresses Contrats</h2>
                    <div>
                        OrderManager: {settings?.contracts?.orderManager}
                        Token: {settings?.contracts?.token}
                        Staking: {settings?.contracts?.staking}
                    </div>
                </section>
                <section>
                    <h2>Variables Système</h2>
                    <input 
                        value={settings?.platformFee}
                        onChange={(e) => settings.platformFee = e.target.value}
                    />
                    <input 
                        value={settings?.minStakeAmount}
                        onChange={(e) => settings.minStakeAmount = e.target.value}
                    />
                </section>
            </div>
            <button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
        </div>
```

**Points importants:**
- Gestion rôles (assigner/retirer)
- Afficher adresses contrats
- Variables système configurables
- Sauvegarde avec confirmation

---

### 20. `tailwind.config.js` - Configuration TailwindCSS

**Rôle:** Configuration TailwindCSS pour styling.

**Pseudo-code:**

```
EXPORTER config = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: '#...',
                secondary: '#...',
            }
        }
    },
    plugins: []
}
```

**Points importants:**
- Configurer content paths
- Personnaliser thème (couleurs, fonts)
- Ajouter plugins si nécessaire

---

### 21. `vite.config.js` - Configuration Vite

**Rôle:** Configuration Vite pour build et dev server.

**Pseudo-code:**

```
IMPORTER { defineConfig } depuis 'vite'
IMPORTER react depuis '@vitejs/plugin-react'

EXPORTER defineConfig({
    plugins: [react()],
    server: {
        port: 3003,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
```

**Points importants:**
- Port dev server (3003 pour admin)
- Proxy API vers backend
- Plugins React

---

### 22. `package.json` - Dépendances

**Rôle:** Dépendances npm du projet.

**Pseudo-code:**

```
{
    "name": "done-admin",
    "version": "1.0.0",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.x",
        "react-router-dom": "^6.x",
        "ethers": "^6.x",
        "chart.js": "^4.x",
        "react-chartjs-2": "^5.x",
        "axios": "^1.x"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.x",
        "tailwindcss": "^3.x",
        "postcss": "^8.x",
        "autoprefixer": "^10.x"
    }
}
```

**Points importants:**
- Scripts: dev, build, preview
- Dépendances: React, Router, ethers, Chart.js, axios
- DevDependencies: Vite, TailwindCSS

---

### 23. `backend/src/routes/admin.js` - Routes API Admin

**Rôle:** Routes API backend pour fonctionnalités admin.

**Pseudo-code:**

```
IMPORTER express
IMPORTER adminController
IMPORTER authMiddleware

CONST router = express.Router()

// Middleware: Vérifier rôle ADMIN/PLATFORM
router.use(authMiddleware.requireAdminRole)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    ESSAYER:
        STATS = await adminController.getPlatformStats()
        RETOURNER res.json(STATS)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/admin/disputes
router.get('/disputes', async (req, res) => {
    PARAMÈTRES: { status, page, limit } = req.query
    ESSAYER:
        DISPUTES = await adminController.getDisputes({ status, page, limit })
        RETOURNER res.json(DISPUTES)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// POST /api/admin/resolve-dispute/:id
router.post('/resolve-dispute/:id', async (req, res) => {
    PARAMÈTRES: disputeId = req.params.id
    BODY: { winner, reason } = req.body
    ESSAYER:
        RESULT = await adminController.resolveDispute(disputeId, winner, reason)
        RETOURNER res.json(RESULT)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
    PARAMÈTRES: { search, status, page, limit } = req.query
    ESSAYER:
        USERS = await adminController.getUsers({ search, status, page, limit })
        RETOURNER res.json(USERS)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/admin/restaurants
router.get('/restaurants', async (req, res) => {
    PARAMÈTRES: { search, cuisine, status, page, limit } = req.query
    ESSAYER:
        RESTAURANTS = await adminController.getRestaurants({ search, cuisine, status, page, limit })
        RETOURNER res.json(RESTAURANTS)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/admin/deliverers
router.get('/deliverers', async (req, res) => {
    PARAMÈTRES: { search, staked, available, page, limit } = req.query
    ESSAYER:
        DELIVERERS = await adminController.getDeliverers({ search, staked, available, page, limit })
        RETOURNER res.json(DELIVERERS)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

EXPORTER router
```

**Points importants:**
- Middleware vérification rôle ADMIN/PLATFORM
- Gestion erreurs avec try/catch
- Pagination pour toutes les listes
- Filtres dans query params

---

### 24. `backend/src/routes/analytics.js` - Routes API Analytics

**Rôle:** Routes API pour analytics et statistiques.

**Pseudo-code:**

```
IMPORTER express
IMPORTER analyticsController
IMPORTER authMiddleware

CONST router = express.Router()

// Middleware: Vérifier rôle ADMIN/PLATFORM
router.use(authMiddleware.requireAdminRole)

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
    ESSAYER:
        DATA = await analyticsController.getDashboardAnalytics()
        RETOURNER res.json(DATA)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/analytics/orders
router.get('/orders', async (req, res) => {
    PARAMÈTRES: { timeframe } = req.query
    ESSAYER:
        DATA = await analyticsController.getOrdersAnalytics(timeframe)
        RETOURNER res.json(DATA)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/analytics/revenue
router.get('/revenue', async (req, res) => {
    PARAMÈTRES: { timeframe } = req.query
    ESSAYER:
        DATA = await analyticsController.getRevenueAnalytics(timeframe)
        RETOURNER res.json(DATA)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

// GET /api/analytics/users
router.get('/users', async (req, res) => {
    PARAMÈTRES: { timeframe } = req.query
    ESSAYER:
        DATA = await analyticsController.getUsersAnalytics(timeframe)
        RETOURNER res.json(DATA)
    ATTRAPER erreur:
        RETOURNER res.status(500).json({ error: erreur.message })
})

EXPORTER router
```

**Points importants:**
- Analytics depuis MongoDB (off-chain)
- Analytics depuis blockchain events (on-chain)
- Timeframe: day, week, month, year
- Agrégation données pour graphiques

---

## 🔧 Installation et Démarrage

### 1. Installation des Dépendances

```bash
cd frontend/admin
npm install
```

### 2. Configuration Variables d'Environnement

Créer `.env` basé sur `.env.example`:
```env
VITE_API_URL=http://localhost:3000
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
```

### 3. Démarrage en Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3003`

---

## 📝 Ordre de Développement Recommandé

1. **Configuration de base:**
   - `package.json` - Installer dépendances
   - `vite.config.js` - Configurer Vite
   - `tailwind.config.js` - Configurer TailwindCSS
   - `index.css` - Styles globaux

2. **Services:**
   - `services/api.js` - Service API backend
   - `services/blockchain.js` - Service blockchain

3. **Composants de base:**
   - `components/ConnectWallet.jsx` - Authentification
   - `App.jsx` - Routing et layout

4. **Composants statistiques:**
   - `components/PlatformStats.jsx` - Stats globales
   - `components/OrdersChart.jsx` - Graphique commandes
   - `components/RevenueChart.jsx` - Graphique revenus

5. **Composants tables:**
   - `components/UsersTable.jsx` - Table utilisateurs
   - `components/RestaurantsTable.jsx` - Table restaurants
   - `components/DeliverersTable.jsx` - Table livreurs

6. **Composants avancés:**
   - `components/DisputesManager.jsx` - Gestion litiges
   - `components/TokenomicsPanel.jsx` - Tokenomics

7. **Pages:**
   - `pages/DashboardPage.jsx` - Dashboard principal
   - `pages/OrdersPage.jsx` - Page commandes
   - `pages/UsersPage.jsx` - Page utilisateurs
   - `pages/DisputesPage.jsx` - Page litiges
   - `pages/SettingsPage.jsx` - Page paramètres

8. **Backend routes:**
   - `backend/src/routes/admin.js` - Routes admin
   - `backend/src/routes/analytics.js` - Routes analytics

---

## 🔒 Sécurité

- **Vérification rôle:** Toujours vérifier rôle ADMIN/PLATFORM avant affichage
- **Protection routes:** Routes backend protégées par middleware
- **Validation données:** Valider tous les inputs côté frontend et backend
- **Gestion erreurs:** Ne pas exposer messages d'erreur sensibles

---

## 📊 Technologies Utilisées

- **React 18** - Framework UI
- **React Router** - Routing
- **Ethers.js** - Interactions blockchain
- **Chart.js** - Graphiques
- **Axios** - Appels API
- **TailwindCSS** - Styling
- **Vite** - Build tool

---

## 🎯 Fonctionnalités Principales

✅ Dashboard avec KPIs en temps réel
✅ Analytics avec graphiques (commandes, revenus)
✅ Gestion utilisateurs/restaurants/livreurs
✅ Gestion litiges avec interface vote
✅ Tokenomics DONE avec statistiques
✅ Configuration plateforme et rôles

---

## 📚 Références

- **Frontend Client:** `frontend/client/README.md`
- **Frontend Restaurant:** `frontend/restaurant/README.md`
- **Frontend Deliverer:** `frontend/deliverer/README.md`
- **Backend API:** `backend/README.md`
- **Smart Contracts:** `contracts/README.md`

---

## 🆘 Support

Pour toute question ou problème:
1. Consulter la documentation dans `docs/ADMIN_GUIDE.md`
2. Vérifier les logs console et réseau
3. Tester les endpoints API avec Postman
4. Vérifier les rôles blockchain

Bon développement ! 🚀







