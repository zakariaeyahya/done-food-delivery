# Dossier frontend/client/

Application React pour les clients permettant de commander des repas, suivre les livraisons et gérer leur compte.

## Structure

### public/index.html
**Rôle** : Point d'entrée HTML de l'application.

**Contenu** :
- Structure HTML de base
- Meta tags pour SEO et responsive
- Point d'ancrage pour React (`<div id="root">`)

### src/App.jsx
**Rôle** : Composant racine de l'application React.

**Fonctionnalités** :
- Configuration du router (React Router)
- Gestion de l'état global (Context API ou Redux)
- Gestion de la connexion wallet (MetaMask)
- Layout principal avec navigation

### src/index.jsx
**Rôle** : Point d'entrée JavaScript de l'application.

**Fonctionnalités** :
- Rendu de l'application React dans le DOM
- Configuration des providers (Router, Context, etc.)
- Import des styles globaux

### src/components/

#### ConnectWallet.jsx
**Rôle** : Composant de connexion au wallet MetaMask.

**Fonctionnalités** :
- Détection de MetaMask
- Connexion au wallet
- Affichage de l'adresse connectée
- Gestion des erreurs de connexion
- Déconnexion

#### RestaurantList.jsx
**Rôle** : Affichage de la liste des restaurants disponibles.

**Fonctionnalités** :
- Fetch des restaurants depuis l'API backend
- Filtres (type de cuisine, prix, note)
- Recherche par nom
- Affichage en grille ou liste
- Navigation vers la page détail

#### RestaurantCard.jsx
**Rôle** : Carte individuelle d'un restaurant.

**Fonctionnalités** :
- Affichage du nom, description, type de cuisine
- Image du restaurant (depuis IPFS)
- Note moyenne et nombre d'avis
- Temps de livraison estimé
- Prix moyen
- Bouton "Voir le menu"

#### MenuItems.jsx
**Rôle** : Affichage du menu d'un restaurant.

**Fonctionnalités** :
- Liste des plats disponibles
- Images des plats (depuis IPFS)
- Prix en ETH/MATIC et EUR
- Description et ingrédients
- Bouton "Ajouter au panier"
- Filtres par catégorie

#### Cart.jsx
**Rôle** : Panier d'achat du client.

**Fonctionnalités** :
- Liste des items sélectionnés
- Calcul du total (foodPrice + deliveryFee + platformFee)
- Affichage en ETH/MATIC et EUR
- Ajout/suppression d'items
- Modification des quantités
- Bouton "Passer commande"

#### Checkout.jsx
**Rôle** : Page de paiement et validation de commande.

**Fonctionnalités** :
- Confirmation de l'adresse de livraison
- Récapitulatif de la commande
- Approbation du paiement via MetaMask
- Appel à l'API backend pour créer la commande
- Affichage de la progression de la transaction
- Gestion des erreurs de paiement

#### OrderTracking.jsx
**Rôle** : Suivi en temps réel d'une commande.

**Fonctionnalités** :
- Mise à jour en temps réel du statut (Socket.io)
- Carte GPS avec position du livreur (Google Maps API)
- Informations du livreur (nom, véhicule, note)
- Compte à rebours ETA (temps estimé d'arrivée)
- Historique des mises à jour
- Bouton "Confirmer la livraison"

#### OrderHistory.jsx
**Rôle** : Historique des commandes passées.

**Fonctionnalités** :
- Liste de toutes les commandes du client
- Filtres par statut et date
- Bouton "Commander à nouveau"
- Laisse un avis/note
- Téléchargement du reçu (depuis IPFS)
- Détails de chaque commande

#### TokenBalance.jsx
**Rôle** : Affichage et gestion des tokens DONE.

**Fonctionnalités** :
- Affichage du solde de tokens DONE
- Historique des transactions de tokens
- Utilisation de tokens pour des réductions
- Affichage du taux de récompense (1 DONE = 10€)

#### DisputeModal.jsx
**Rôle** : Modal pour ouvrir un litige.

**Fonctionnalités** :
- Formulaire de litige
- Upload de preuves (images vers IPFS)
- Description du problème
- Sélection du type de litige
- Soumission du litige on-chain

### src/pages/

#### HomePage.jsx
**Rôle** : Page d'accueil de l'application.

**Fonctionnalités** :
- Hero section avec recherche
- Liste des restaurants populaires
- Catégories de cuisine
- Offres spéciales
- Navigation vers les autres pages

#### RestaurantPage.jsx
**Rôle** : Page de détail d'un restaurant.

**Fonctionnalités** :
- Informations complètes du restaurant
- Menu complet avec MenuItems
- Avis et notes
- Photos du restaurant
- Bouton "Commander"

#### CheckoutPage.jsx
**Rôle** : Page de checkout complète.

**Fonctionnalités** :
- Intègre le composant Checkout
- Gestion du flux de paiement
- Redirection après succès

#### TrackingPage.jsx
**Rôle** : Page dédiée au suivi de commande.

**Fonctionnalités** :
- Intègre le composant OrderTracking
- Vue complète avec carte GPS
- Notifications en temps réel

#### ProfilePage.jsx
**Rôle** : Page de profil utilisateur.

**Fonctionnalités** :
- Informations personnelles
- Historique des commandes
- Solde de tokens DONE
- Paramètres du compte
- Déconnexion

### src/services/

#### api.js
**Rôle** : Service pour les appels API backend.

**Fonctions principales** :
- `getRestaurants()` : Liste des restaurants
- `getRestaurant(id)` : Détails d'un restaurant
- `createOrder(orderData)` : Créer une commande
- `getOrder(id)` : Récupérer une commande
- `getOrdersByClient(address)` : Commandes du client
- `confirmDelivery(orderId)` : Confirmer livraison
- `openDispute(orderId, data)` : Ouvrir litige

#### blockchain.js
**Rôle** : Service pour les interactions Web3 directes.

**Fonctions principales** :
- `connectWallet()` : Connexion MetaMask
- `getBalance(address)` : Solde ETH/MATIC
- `getTokenBalance(address)` : Solde tokens DONE
- `approvePayment(amount)` : Approbation de paiement
- `createOrderOnChain(data)` : Création commande on-chain
- `confirmDeliveryOnChain(orderId)` : Confirmation livraison on-chain

#### ipfs.js
**Rôle** : Service pour les interactions IPFS.

**Fonctions principales** :
- `uploadImage(file)` : Upload d'image vers IPFS
- `getImage(hash)` : Récupération d'image depuis IPFS
- `uploadJSON(data)` : Upload de JSON vers IPFS
- `getJSON(hash)` : Récupération de JSON depuis IPFS

### src/utils/

#### web3.js
**Rôle** : Utilitaires Web3.

**Fonctions principales** :
- `formatAddress(address)` : Formatage d'adresse (0x1234...5678)
- `formatBalance(balance)` : Formatage de balance (ETH/MATIC)
- `parseUnits(value, decimals)` : Conversion en wei
- `formatUnits(value, decimals)` : Conversion depuis wei
- `isValidAddress(address)` : Validation d'adresse

#### formatters.js
**Rôle** : Formatage des données.

**Fonctions principales** :
- `formatPrice(amount, currency)` : Formatage de prix
- `formatDate(date)` : Formatage de date
- `formatTime(seconds)` : Formatage de temps
- `truncateText(text, length)` : Troncature de texte

### src/index.css
**Rôle** : Styles globaux de l'application.

**Contenu** :
- Import de TailwindCSS
- Styles de base (reset CSS)
- Variables CSS personnalisées
- Styles globaux pour l'application

## Technologies

- **React** : Framework UI
- **Vite** : Build tool et dev server
- **TailwindCSS** : Framework CSS
- **Ethers.js** : Interaction Web3
- **React Router** : Navigation
- **Socket.io-client** : Notifications temps réel
- **Axios** : Appels HTTP

## Démarrage

```bash
cd frontend/client
npm install
npm run dev  # Démarre le serveur de développement
```

## Variables d'environnement

- `VITE_API_URL` : URL de l'API backend
- `VITE_BLOCKCHAIN_RPC` : URL RPC Polygon Mumbai
- `VITE_ORDER_MANAGER_ADDRESS` : Adresse du contrat DoneOrderManager
- `VITE_TOKEN_ADDRESS` : Adresse du contrat DoneToken

