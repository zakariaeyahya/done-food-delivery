# DONE Food Delivery - Frontend Client

## Vue d'Ensemble

Application React pour les clients de la plateforme DONE Food Delivery. Permet de commander des repas, suivre les livraisons en temps reel et gerer un compte avec tokens de fidelite. Utilise Web3 pour les paiements via MetaMask sur la blockchain Polygon.

**Port:** 5173
**Stack:** React + Vite + TailwindCSS + Ethers.js

---

## Fonctionnalites Principales

| Fonctionnalite | Description |
|----------------|-------------|
| **Connexion Web3** | Integration MetaMask pour paiements securises sur Polygon |
| **Catalogue Restaurants** | Parcourir et filtrer les restaurants par cuisine, prix, note |
| **Panier d'achat** | Gestion complete avec calcul automatique des frais |
| **Checkout Blockchain** | Paiement on-chain avec confirmation MetaMask |
| **Suivi Temps Reel** | Tracking GPS avec Google Maps et Socket.io |
| **Tokens Fidelite** | Systeme de recompenses DONE tokens (1 token / 10 EUR) |
| **Historique Commandes** | Consultation et possibilite de recommander |
| **Systeme Litiges** | Ouverture de disputes avec preuves IPFS |

---

## Structure du Projet

```
frontend/client/
├── src/
│   ├── components/           # Composants reutilisables
│   │   ├── ConnectWallet     # Connexion MetaMask + verification reseau
│   │   ├── RestaurantList    # Liste restaurants avec filtres
│   │   ├── RestaurantCard    # Carte individuelle restaurant
│   │   ├── MenuItems         # Menu restaurant avec categories
│   │   ├── Cart              # Panier avec calcul des frais
│   │   ├── Checkout          # Processus paiement complet
│   │   ├── OrderTracking     # Suivi temps reel avec carte
│   │   ├── OrderHistory      # Historique commandes paginee
│   │   ├── TokenBalance      # Solde et gestion tokens DONE
│   │   ├── DisputeModal      # Modal ouverture litige
│   │   ├── Header            # Navigation principale
│   │   └── Footer            # Pied de page
│   ├── pages/                # Pages de l'application
│   │   ├── HomePage          # Accueil avec recherche et categories
│   │   ├── RestaurantPage    # Detail restaurant + menu
│   │   ├── CheckoutPage      # Paiement et validation
│   │   ├── TrackingPage      # Suivi commande temps reel
│   │   └── ProfilePage       # Profil utilisateur
│   ├── services/             # Services API et Blockchain
│   │   ├── api.js            # Appels API backend REST
│   │   ├── blockchain.js     # Interactions smart contracts
│   │   └── ipfs.js           # Upload/lecture IPFS
│   ├── contexts/             # Context API (etat global)
│   │   ├── WalletContext     # Etat wallet connecte
│   │   ├── CartContext       # Etat panier
│   │   └── SocketContext     # Connexion Socket.io
│   └── utils/                # Utilitaires
│       ├── web3.js           # Helpers Web3
│       └── formatters.js     # Formatage donnees
├── .env                      # Variables d'environnement
└── package.json              # Dependances
```

---

## Pages

### HomePage
Page d'accueil de l'application:
- **Hero Section:** Barre de recherche restaurants
- **Restaurants Populaires:** Liste des restaurants les mieux notes
- **Categories Cuisine:** Cards cliquables (Italien, Japonais, Burger, etc.)
- **Offres Speciales:** Promotions et reductions en cours

### RestaurantPage
Page detail d'un restaurant:
- **Informations:** Nom, description, cuisine, horaires, localisation
- **Menu Complet:** Liste des plats par categorie avec prix en POL
- **Galerie Photos:** Images IPFS avec lightbox
- **Avis Clients:** Notes et commentaires des clients precedents
- **Ajout Panier:** Selection quantite et ajout au panier

### CheckoutPage
Page de validation et paiement:
- **Resume Panier:** Liste des items avec quantites
- **Adresse Livraison:** Saisie avec autocomplete Google Places
- **Calcul Frais:** Prix nourriture + livraison + plateforme (10%)
- **Paiement MetaMask:** Confirmation transaction blockchain
- **Progression:** Etapes visuelles (IPFS → MetaMask → Blockchain → OK)

### TrackingPage
Page de suivi en temps reel:
- **Timeline Statuts:** CREATED → PREPARING → IN_DELIVERY → DELIVERED
- **Carte Google Maps:** Position restaurant, client, livreur
- **Infos Livreur:** Nom, photo, vehicule, note
- **ETA Countdown:** Temps estime d'arrivee
- **Bouton Confirmation:** Actif quand livreur a moins de 100m

### ProfilePage
Page profil utilisateur:
- **Informations:** Nom, email, telephone, adresse wallet
- **Historique Commandes:** Liste paginee avec actions
- **Solde Tokens:** Balance DONE avec historique
- **Parametres:** Langue, notifications, theme sombre
- **Deconnexion:** Deconnexion du wallet

---

## Composants

### ConnectWallet
Gestion connexion wallet MetaMask:
- Detection MetaMask installe
- Connexion et recuperation adresse
- Verification reseau Polygon Amoy (chainId 80002)
- Affichage adresse courte (0x1234...5678)
- Affichage solde MATIC
- Gestion erreurs (rejet, mauvais reseau)

### RestaurantList
Liste des restaurants avec filtres:
- Fetch depuis API backend avec pagination
- Filtres: cuisine, fourchette prix, note minimum
- Layout grid responsive (1-2-3-4 colonnes)
- Skeleton loader pendant chargement
- Auto-refresh toutes les 30 secondes

### RestaurantCard
Carte individuelle d'un restaurant:
- Image principale depuis IPFS
- Nom, type de cuisine, description courte
- Note moyenne avec etoiles
- Temps de livraison estime
- Prix moyen par personne
- Bouton "Voir le menu"

### MenuItems
Affichage du menu d'un restaurant:
- Categories: Entrees, Plats, Desserts, Boissons
- Image IPFS, nom, description, prix POL
- Conversion prix EUR affichee
- Selecteur quantite (1-10)
- Bouton ajout au panier
- Lazy loading images

### Cart
Panier d'achat complet:
- Liste items avec image, nom, quantite, prix
- Boutons +/- pour modifier quantites
- Bouton supprimer item
- Calcul automatique:
  - Sous-total nourriture
  - Frais de livraison
  - Frais plateforme (10%)
  - Total en POL

### Checkout
Processus de paiement:
- Formulaire adresse avec Google Places autocomplete
- Resume commande et verification total
- Upload items vers IPFS (preuve commande)
- Approbation transaction MetaMask
- Creation commande on-chain (OrderManager)
- Sauvegarde off-chain (API backend)
- Barre de progression visuelle
- Redirection vers TrackingPage apres succes

### OrderTracking
Suivi commande en temps reel:
- Connexion Socket.io pour mises a jour live
- Timeline visuelle des etapes de la commande
- Carte Google Maps interactive:
  - Marker restaurant (point de depart)
  - Marker client (destination)
  - Marker livreur (position temps reel)
  - Polyline route livreur → client
- Informations livreur (nom, photo, vehicule, note)
- Countdown ETA mise a jour automatique
- Bouton "Confirmer livraison" (actif si distance < 100m)

### OrderHistory
Historique des commandes passees:
- Liste paginee (10 par page)
- Colonnes: ID, Restaurant, Date, Total, Statut
- Actions par commande:
  - Voir details
  - Commander a nouveau
  - Laisser un avis
  - Telecharger recu IPFS
- Modal avis: note 1-5 etoiles + commentaire

### TokenBalance
Gestion des tokens DONE:
- Solde actuel en tokens DONE
- Equivalence EUR (1 DONE = 1 EUR de reduction)
- Historique des transactions tokens
- Taux affiche: 1 token gagne pour 10 EUR depenses
- Progress bar vers prochain token
- Option utiliser tokens au checkout

### DisputeModal
Modal pour ouvrir un litige:
- Selection type de probleme (liste deroulante)
- Champ texte description du probleme
- Upload preuves images (max 3 fichiers)
- Preview images avant upload
- Upload vers IPFS via backend
- Soumission litige on-chain + off-chain

---

## Services

### api.js
Service API backend REST:
- `getRestaurants(filters)` - Liste restaurants avec filtres
- `getRestaurant(id)` - Details d'un restaurant
- `createOrder(orderData)` - Creer une commande
- `getOrder(id)` - Details d'une commande
- `getOrdersByClient(address)` - Historique client
- `confirmDelivery(orderId, address)` - Confirmer livraison
- `openDispute(orderId, data)` - Ouvrir litige
- `submitReview(orderId, rating, comment)` - Laisser avis
- `getUserProfile(address)` - Profil utilisateur
- `updateUserProfile(address, data)` - Mettre a jour profil

### blockchain.js
Service interactions smart contracts:
- `connectWallet()` - Connexion MetaMask
- `getBalance(address)` - Balance MATIC
- `getTokenBalance(address)` - Balance tokens DONE
- `createOrderOnChain(params)` - Creation commande on-chain
- `confirmDeliveryOnChain(orderId)` - Confirmation on-chain
- `openDisputeOnChain(orderId)` - Litige on-chain
- `getOrderOnChain(orderId)` - Lecture ordre on-chain

### ipfs.js
Service interactions IPFS (via Pinata):
- `uploadImage(file)` - Upload image, retourne hash
- `getImage(hash)` - URL complete image IPFS
- `uploadJSON(data)` - Upload donnees JSON
- `getJSON(hash)` - Recuperation JSON depuis hash

---

## Contexts (Etat Global)

### WalletContext
Etat de connexion wallet:
- `address` - Adresse wallet connecte
- `isConnected` - Boolean connexion
- `balance` - Solde MATIC
- `tokenBalance` - Solde tokens DONE
- `connectWallet()` - Fonction connexion
- `disconnectWallet()` - Fonction deconnexion

### CartContext
Etat du panier:
- `items` - Liste des items dans le panier
- `restaurant` - Restaurant actuel
- `addItem(item, qty)` - Ajouter item
- `removeItem(itemId)` - Supprimer item
- `updateQuantity(itemId, qty)` - Modifier quantite
- `clearCart()` - Vider le panier
- `getTotal()` - Calcul total

### SocketContext
Connexion temps reel:
- `socket` - Instance Socket.io
- `isConnected` - Statut connexion
- `joinRoom(roomId)` - Rejoindre une room
- `leaveRoom(roomId)` - Quitter une room

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-client-room` | Client → Server | Rejoindre room client |
| `orderStatusUpdate` | Server → Client | Mise a jour statut commande |
| `delivererLocationUpdate` | Server → Client | Position GPS livreur |

---

## Workflow Commande

1. **Accueil** - Client visite la page d'accueil
2. **Connexion** - Connexion wallet MetaMask
3. **Recherche** - Parcours restaurants ou recherche
4. **Selection** - Choix restaurant et consultation menu
5. **Panier** - Ajout items avec quantites
6. **Checkout** - Saisie adresse + verification total
7. **Paiement** - Approbation MetaMask
8. **Creation** - Commande on-chain + IPFS
9. **Suivi** - Redirection page tracking
10. **Tracking** - Suivi temps reel sur carte
11. **Livraison** - Confirmation quand livreur arrive
12. **Recompense** - Reception tokens DONE
13. **Avis** - Possibilite laisser un avis

---

## Variables d'Environnement

```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Blockchain (Polygon Amoy)
VITE_ORDER_MANAGER_ADDRESS=0x257D63E05bcf8840896b1ECb5c6d98eb5Ba06182
VITE_TOKEN_ADDRESS=0x24D89CC7f6F76980F2c088DB203DEa6223B1DEd9
VITE_PAYMENT_SPLITTER_ADDRESS=0xE99F26DA1B38a79d08ed8d853E45397C99818C2f
VITE_STAKING_ADDRESS=0xFf9CD2596e73BB0bCB28d9E24d945B0ed34f874b
VITE_CHAIN_ID=80002

# Services externes
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Installation et Demarrage

```bash
# Installation
cd frontend/client
npm install

# Developpement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

Application accessible sur `http://localhost:5173`

---

## Configuration Reseau MetaMask

Pour utiliser l'application, MetaMask doit etre configure sur Polygon Amoy:

| Parametre | Valeur |
|-----------|--------|
| Network Name | Polygon Amoy |
| RPC URL | https://rpc-amoy.polygon.technology |
| Chain ID | 80002 |
| Currency | MATIC |
| Explorer | https://amoy.polygonscan.com |

---

## Technologies

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| React Router 6 | Navigation SPA |
| Ethers.js 6 | Interactions blockchain |
| Socket.io Client | Temps reel |
| Axios | Appels API REST |
| TailwindCSS 3 | Styling |
| Vite 5 | Build tool |
| Google Maps API | Cartographie |

---

## Depannage

| Probleme | Solution |
|----------|----------|
| MetaMask non detecte | Installer MetaMask et rafraichir la page |
| Mauvais reseau | Changer vers Polygon Amoy dans MetaMask |
| Erreur API | Verifier que le backend est demarre sur port 3000 |
| Carte vide | Verifier la cle Google Maps API dans .env |
| Transaction echouee | Verifier solde MATIC suffisant pour gas |

---

## Liens Utiles

- [Polygon Amoy Faucet](https://faucet.polygon.technology/) - Obtenir des MATIC de test
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/) - Explorer les transactions
- [Documentation Backend](../../backend/README.md)
- [Smart Contracts](../../contracts/README.md)
