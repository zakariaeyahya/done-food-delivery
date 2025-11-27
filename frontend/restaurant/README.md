# Dossier frontend/restaurant/

Application React pour les restaurants permettant de gérer les commandes, le menu et consulter les statistiques.

## Structure

### public/index.html
**Rôle** : Point d'entrée HTML de l'application restaurant.

### src/App.jsx
**Rôle** : Composant racine de l'application.

**Fonctionnalités** :
- Configuration du router
- Gestion de l'état global
- Authentification restaurant
- Layout avec navigation

### src/index.jsx
**Rôle** : Point d'entrée JavaScript.

### src/components/

#### ConnectWallet.jsx
**Rôle** : Connexion au wallet MetaMask pour le restaurant.

**Fonctionnalités** :
- Connexion wallet
- Vérification du rôle RESTAURANT
- Affichage de l'adresse connectée

#### OrdersQueue.jsx
**Rôle** : File d'attente des commandes en temps réel.

**Fonctionnalités** :
- Affichage des nouvelles commandes (Socket.io)
- Acceptation/refus de commandes
- Estimation du temps de préparation
- Bouton "Confirmer préparation"
- Filtres par statut

#### OrderCard.jsx
**Rôle** : Carte individuelle d'une commande.

**Fonctionnalités** :
- Détails de la commande (items, quantité, prix)
- Adresse de livraison
- Informations client
- Statut de la commande
- Actions (accepter, refuser, confirmer préparation)

#### MenuManager.jsx
**Rôle** : Gestion complète du menu.

**Fonctionnalités** :
- CRUD des items du menu (Create, Read, Update, Delete)
- Upload d'images vers IPFS
- Définition des prix
- Activation/désactivation d'items
- Catégorisation des plats
- Gestion des disponibilités

#### Analytics.jsx
**Rôle** : Statistiques et analytics du restaurant.

**Fonctionnalités** :
- Total des commandes (jour/semaine/mois)
- Graphique des revenus
- Plats les plus populaires
- Temps moyen de préparation
- Vue d'ensemble des notes
- Taux de satisfaction

#### EarningsChart.jsx
**Rôle** : Graphique des revenus et gains.

**Fonctionnalités** :
- Revenus quotidiens/hebdomadaires
- Retraits en attente
- Montants retirés
- Historique des transactions on-chain
- Graphiques interactifs (Chart.js ou Recharts)

### src/pages/

#### DashboardPage.jsx
**Rôle** : Tableau de bord principal.

**Fonctionnalités** :
- Vue d'ensemble des commandes du jour
- Statistiques rapides
- Commandes en attente
- Revenus du jour
- Accès rapide aux autres pages

#### OrdersPage.jsx
**Rôle** : Gestion complète des commandes.

**Fonctionnalités** :
- Liste de toutes les commandes
- Filtres par statut et date
- Actions sur les commandes
- Détails de chaque commande

#### MenuPage.jsx
**Rôle** : Gestion du menu.

**Fonctionnalités** :
- Intègre MenuManager
- Interface complète de gestion
- Prévisualisation du menu client

#### AnalyticsPage.jsx
**Rôle** : Analytics détaillées.

**Fonctionnalités** :
- Intègre Analytics et EarningsChart
- Graphiques détaillés
- Export de données
- Rapports personnalisés

### src/services/

#### api.js
**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getOrders(restaurantId)` : Commandes du restaurant
- `confirmPreparation(orderId)` : Confirmer préparation
- `updateMenu(restaurantId, menu)` : Mettre à jour le menu
- `getAnalytics(restaurantId)` : Statistiques
- `getEarnings(restaurantId)` : Revenus

#### blockchain.js
**Rôle** : Service pour les interactions Web3.

**Fonctions principales** :
- `confirmPreparationOnChain(orderId)` : Confirmation on-chain
- `getRestaurantOrders()` : Commandes on-chain
- `getEarningsOnChain()` : Revenus on-chain

### src/index.css
**Rôle** : Styles globaux.

## Technologies

- **React** : Framework UI
- **Vite** : Build tool
- **TailwindCSS** : Styling
- **Ethers.js** : Web3
- **Socket.io-client** : Notifications temps réel
- **Chart.js/Recharts** : Graphiques

## Démarrage

```bash
cd frontend/restaurant
npm install
npm run dev
```

