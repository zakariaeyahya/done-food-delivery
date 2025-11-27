# Dossier frontend/deliverer/

Application React mobile-first pour les livreurs permettant d'accepter des livraisons, suivre les trajets et gérer les gains.

## Structure

### public/index.html
**Rôle** : Point d'entrée HTML de l'application livreur.

### src/App.jsx
**Rôle** : Composant racine de l'application.

**Fonctionnalités** :
- Configuration du router
- Gestion de l'état global
- Authentification livreur
- Layout mobile-optimized

### src/index.jsx
**Rôle** : Point d'entrée JavaScript.

### src/components/

#### ConnectWallet.jsx
**Rôle** : Connexion au wallet MetaMask pour le livreur.

**Fonctionnalités** :
- Connexion wallet
- Vérification du rôle DELIVERER
- Vérification du staking (minimum 0.1 ETH)

#### StakingPanel.jsx
**Rôle** : Panel de gestion du staking.

**Fonctionnalités** :
- Affichage du montant staké actuel
- Dépôt de staking (minimum 0.1 ETH)
- Retrait de staking (si conditions OK)
- Historique des transactions de staking
- Avertissements en cas de slashing

#### AvailableOrders.jsx
**Rôle** : Liste des commandes disponibles à accepter.

**Fonctionnalités** :
- Affichage des commandes en attente de livreur
- Informations (restaurant, adresse, distance, prix)
- Bouton "Accepter la commande"
- Filtres par distance et prix
- Carte avec localisation

#### ActiveDelivery.jsx
**Rôle** : Affichage de la livraison en cours.

**Fonctionnalités** :
- Détails de la commande active
- Position actuelle du livreur (GPS)
- Itinéraire vers le restaurant puis le client
- Bouton "Confirmer récupération"
- Bouton "Confirmer livraison"
- Timer de livraison

#### NavigationMap.jsx
**Rôle** : Carte de navigation interactive.

**Fonctionnalités** :
- Carte Google Maps intégrée
- Position GPS en temps réel
- Itinéraire optimisé
- Instructions de navigation
- Distance et temps estimé
- Mise à jour automatique

#### EarningsTracker.jsx
**Rôle** : Suivi des gains du livreur.

**Fonctionnalités** :
- Total des gains (on-chain)
- Gains du jour/semaine/mois
- Historique des paiements
- Graphique des gains
- Retraits disponibles

#### RatingDisplay.jsx
**Rôle** : Affichage des notes et avis.

**Fonctionnalités** :
- Note moyenne
- Nombre total de livraisons
- Avis récents des clients
- Graphique d'évolution des notes
- Objectifs de performance

### src/pages/

#### HomePage.jsx
**Rôle** : Page d'accueil du livreur.

**Fonctionnalités** :
- Statut (en ligne/hors ligne)
- Commandes disponibles
- Livraison active (si en cours)
- Statistiques rapides
- Accès rapide aux autres pages

#### DeliveriesPage.jsx
**Rôle** : Gestion des livraisons.

**Fonctionnalités** :
- Liste des livraisons (passées et en cours)
- Filtres par statut
- Détails de chaque livraison
- Actions sur les livraisons

#### EarningsPage.jsx
**Rôle** : Page des revenus.

**Fonctionnalités** :
- Intègre EarningsTracker
- Graphiques détaillés
- Historique complet
- Export de données

#### ProfilePage.jsx
**Rôle** : Profil du livreur.

**Fonctionnalités** :
- Informations personnelles
- Statut de staking
- Notes et avis
- Historique des livraisons
- Paramètres

### src/services/

#### api.js
**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getAvailableOrders()` : Commandes disponibles
- `acceptOrder(orderId)` : Accepter une commande
- `confirmPickup(orderId)` : Confirmer récupération
- `confirmDelivery(orderId)` : Confirmer livraison
- `updateGPSLocation(orderId, lat, lng)` : Mettre à jour position
- `getEarnings()` : Revenus
- `getRating()` : Note moyenne

#### blockchain.js
**Rôle** : Service pour les interactions Web3.

**Fonctions principales** :
- `stake(amount)` : Effectuer staking
- `unstake()` : Retirer staking
- `acceptOrderOnChain(orderId)` : Accepter commande on-chain
- `confirmPickupOnChain(orderId)` : Confirmer récupération on-chain
- `confirmDeliveryOnChain(orderId)` : Confirmer livraison on-chain
- `getStakeInfo()` : Informations de staking

#### geolocation.js
**Rôle** : Service de géolocalisation.

**Fonctions principales** :
- `getCurrentPosition()` : Position GPS actuelle
- `watchPosition(callback)` : Suivi continu de position
- `calculateRoute(origin, destination)` : Calcul d'itinéraire
- `getDistance(lat1, lng1, lat2, lng2)` : Distance entre deux points
- `isNearLocation(lat1, lng1, lat2, lng2, radius)` : Vérification proximité

### src/index.css
**Rôle** : Styles globaux mobile-first.

## Technologies

- **React** : Framework UI
- **Vite** : Build tool
- **TailwindCSS** : Styling (mobile-first)
- **Ethers.js** : Web3
- **Socket.io-client** : Notifications temps réel
- **Google Maps API** : Cartes et navigation
- **Geolocation API** : Position GPS

## Démarrage

```bash
cd frontend/deliverer
npm install
npm run dev
```

## Caractéristiques Mobile

- Design responsive mobile-first
- Optimisé pour écrans tactiles
- Utilisation du GPS natif
- Notifications push
- Mode hors ligne partiel

