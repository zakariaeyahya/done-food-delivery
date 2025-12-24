# DONE Food Delivery on Blockchain

[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/KrxfQ_f6xAo)

> **Vidéo de démonstration** : [https://youtu.be/KrxfQ_f6xAo](https://youtu.be/KrxfQ_f6xAo)

## Description du Projet

DONE Food Delivery est une plateforme décentralisée de livraison de repas basée sur la blockchain Ethereum (réseau Polygon). Le système garantit transparence, automatisation et traçabilité des transactions en utilisant des smart contracts pour gérer toutes les étapes du processus de livraison.

### Fonctionnalités Principales

- **Gestion décentralisée des commandes** : Toutes les transactions (commande, paiement, livraison) sont enregistrées sur la blockchain
- **Paiements automatiques** : Répartition automatique des fonds (70% restaurant, 20% livreur, 10% plateforme)
- **Système de staking** : Les livreurs doivent déposer 0.1 ETH comme garantie
- **Token de fidélité** : Programme de récompenses avec tokens DONE (1 token par 10€ dépensés)
- **Résolution de litiges** : Mécanisme d'arbitrage décentralisé avec gel temporaire des fonds
- **Stockage décentralisé** : Utilisation d'IPFS pour les images et preuves de livraison
- **Oracles Chainlink** : Suivi GPS on-chain et conversion fiat/crypto en temps réel
- **Fallback paiement** : Support des paiements par carte bancaire via Stripe

### Avantages Blockchain

- Réduction des coûts transactionnels (de 3-5% à <0.5%)
- Paiements instantanés (sans délai de 7-15 jours)
- Système de notation immuable
- Transparence totale des transactions
- Traçabilité complète des commandes

## Stack Technique

### Blockchain & Smart Contracts
- **Réseau** : Polygon Mumbai (testnet)
- **Langage** : Solidity
- **Framework** : Hardhat
- **Bibliothèque** : Ethers.js

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (MongoDB Atlas)
- **ODM** : Mongoose
- **Authentification** : JWT (jsonwebtoken)

### Frontend
- **Framework** : React.js
- **Build Tool** : Vite
- **Styling** : TailwindCSS
- **Web3** : Ethers.js / Web3.js
- **Wallet** : MetaMask

### Services Décentralisés
- **Stockage** : IPFS (avec Pinata pour le pinning)
- **Oracles** : Chainlink (prix, GPS, météo)
- **Notifications** : Socket.io (temps réel)

### Outils de Développement
- **Versioning** : Git
- **Package Manager** : npm (workspaces)
- **Testing** : Hardhat (smart contracts), Jest (backend)
- **Linting** : ESLint

## 🚀 Quick Start (5 minutes)

Pour démarrer rapidement le projet en mode développement :

```bash
# 1. Cloner le projet
git clone <repository-url>
cd done-food-delivery

# 2. Installer toutes les dépendances
npm install
cd backend && npm install && cd ..
cd frontend/client && npm install && cd ../..
cd frontend/deliverer && npm install && cd ../..
cd frontend/restaurant && npm install && cd ../..

# 3. Configurer les variables d'environnement (voir section détaillée ci-dessous)

# 4. Déployer les smart contracts sur Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# 5. Démarrer le backend (terminal 1)
cd backend && npm run dev

# 6. Démarrer les frontends (terminaux séparés)
cd frontend/client && npm run dev      # Terminal 2 - Port 5173
cd frontend/restaurant && npm run dev  # Terminal 3 - Port 5174
cd frontend/deliverer && npm run dev   # Terminal 4 - Port 5175
```

**Accès aux applications** :
- 🛒 Client : http://localhost:5173
- 🍽️ Restaurant : http://localhost:5174
- 🚴 Livreur : http://localhost:5175
-  Backend API : http://localhost:3000

---

##  Setup Instructions Détaillées

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

#### 1. **Node.js et npm**
- **Version** : Node.js v18 ou supérieur
- **Vérification** : `node --version` et `npm --version`
- **Installation** : [nodejs.org](https://nodejs.org/)

#### 2. **Git**
- **Vérification** : `git --version`
- **Installation** : [git-scm.com](https://git-scm.com/)

#### 3. **MetaMask** (extension navigateur)
- **Installation** : [metamask.io](https://metamask.io/)
- **Configuration** :
  1. Installer l'extension Chrome/Firefox
  2. Créer un wallet ou importer via seed phrase
  3. Ajouter le réseau Polygon Mumbai (voir section Configuration MetaMask)

#### 4. **MongoDB Atlas** (base de données cloud gratuite)
- **Compte** : Créer un compte gratuit sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Cluster** : Créer un cluster gratuit (M0)
- **URI** : Copier la connection string (format : `mongodb+srv://...`)

#### 5. **Faucet MATIC** (testnet Mumbai)
- **Obtenir MATIC gratuit** : [faucet.polygon.technology](https://faucet.polygon.technology/)
- **Montant nécessaire** : Au moins 0.5 MATIC pour les tests

#### 6. **Pinata** (IPFS pinning service)
- **Compte** : [pinata.cloud](https://www.pinata.cloud/) (gratuit jusqu'à 1 GB)
- **API Keys** : Générer dans Dashboard → API Keys
  - Copier `API Key` et `API Secret`

#### 7. **Google Maps API Key**
- **Console** : [console.cloud.google.com](https://console.cloud.google.com/)
- **APIs à activer** :
  - Maps JavaScript API
  - Directions API
  - Distance Matrix API
  - Places API
  - Geocoding API
- **Créer clé API** : Credentials → Create Credentials → API Key

---

### Installation Pas à Pas

#### Étape 1 : Cloner le repository

```bash
git clone <repository-url>
cd done-food-delivery
```

#### Étape 2 : Installer les dépendances

**Option A - Installation globale (racine du projet)** :
```bash
# À la racine du projet
npm install
```

**Option B - Installation manuelle (chaque dossier)** :
```bash
# Smart contracts
npm install

# Backend
cd backend
npm install
cd ..

# Frontend Client
cd frontend/client
npm install
cd ../..

# Frontend Restaurant
cd frontend/restaurant
npm install
cd ../..

# Frontend Deliverer
cd frontend/deliverer
npm install
cd ../..
```

#### Étape 3 : Configuration de l'environnement

Créer les fichiers `.env` suivants :

##### **3.1. `.env` à la racine (pour Hardhat - smart contracts)**

```bash
# Copier le template
cp .env.example .env
```

Contenu du fichier `.env` :
```env
# Polygon Mumbai Testnet
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=votre_cle_privee_metamask_sans_0x

# Polygon Mainnet (production uniquement)
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_PRIVATE_KEY=

# Etherscan API (pour vérification des contrats)
POLYGONSCAN_API_KEY=votre_cle_polygonscan

# Configuration
NETWORK=mumbai
```

**Comment obtenir votre PRIVATE_KEY** :
1. Ouvrir MetaMask
2. Cliquer sur les 3 points → Account Details → Export Private Key
3. Entrer votre mot de passe MetaMask
4. Copier la clé ( **JAMAIS** la partager ou commiter dans Git)

##### **3.2. `backend/.env` (pour l'API Node.js)**

```bash
# Aller dans le dossier backend
cd backend
cp .env.example .env
```

Contenu du fichier `backend/.env` :
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/done_food_delivery?retryWrites=true&w=majority
DB_NAME=done_food_delivery

# Blockchain (Polygon Mumbai)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=votre_cle_privee_metamask

# Adresses des Smart Contracts (après déploiement)
ORDER_MANAGER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...
STAKING_ADDRESS=0x...

# IPFS (Pinata)
PINATA_API_KEY=votre_pinata_api_key
PINATA_SECRET_KEY=votre_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

# JWT
JWT_SECRET=votre_secret_super_securise_aleatoire
JWT_EXPIRES_IN=7d

# Email (optionnel - pour notifications)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@donefood.com

# Google Maps (optionnel - pour backend)
GOOGLE_MAPS_API_KEY=votre_google_maps_api_key
```

**Comment obtenir MongoDB URI** :
1. Se connecter à [MongoDB Atlas](https://cloud.mongodb.com/)
2. Clusters → Connect → Connect your application
3. Copier la connection string
4. Remplacer `<password>` par votre mot de passe MongoDB
5. Remplacer `<dbname>` par `done_food_delivery`

##### **3.3. `frontend/client/.env`**

```bash
cd frontend/client
cp .env.example .env
```

Contenu du fichier `frontend/client/.env` :
```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Smart Contracts (adresses après déploiement)
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...

# IPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=votre_google_maps_api_key
```

##### **3.4. `frontend/restaurant/.env`**

```bash
cd frontend/restaurant
cp .env.example .env
```

Contenu du fichier `frontend/restaurant/.env` :
```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Smart Contracts
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...

# IPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

##### **3.5. `frontend/deliverer/.env`**

```bash
cd frontend/deliverer
cp .env.example .env
```

Contenu du fichier `frontend/deliverer/.env` :
```env
# API Backend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Smart Contracts
VITE_ORDER_MANAGER_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=votre_google_maps_api_key
```

---

#### Étape 4 : Configurer MetaMask pour Polygon Mumbai

1. Ouvrir MetaMask
2. Cliquer sur le sélecteur de réseau (en haut)
3. Cliquer sur "Add Network" → "Add a network manually"
4. Entrer les informations suivantes :

```
Network Name: Polygon Mumbai Testnet
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com/
```

5. Cliquer sur "Save"
6. Obtenir des MATIC gratuits : [faucet.polygon.technology](https://faucet.polygon.technology/)

---

#### Étape 5 : Déployer les Smart Contracts

```bash
# Revenir à la racine du projet
cd /path/to/done-food-delivery

# Compiler les contrats
npx hardhat compile

# Déployer sur Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

**Résultat attendu** :
```
Deploying contracts to Mumbai testnet...
 DoneOrderManager deployed to: 0x1234...
 DonePaymentSplitter deployed to: 0x5678...
 DoneToken deployed to: 0x9abc...
 DoneStaking deployed to: 0xdef0...
```

** IMPORTANT** : Copier ces adresses et les coller dans :
- `backend/.env` (ORDER_MANAGER_ADDRESS, PAYMENT_SPLITTER_ADDRESS, etc.)
- `frontend/client/.env` (VITE_ORDER_MANAGER_ADDRESS, VITE_TOKEN_ADDRESS)
- `frontend/restaurant/.env` (VITE_ORDER_MANAGER_ADDRESS, VITE_PAYMENT_SPLITTER_ADDRESS)
- `frontend/deliverer/.env` (VITE_ORDER_MANAGER_ADDRESS, VITE_STAKING_ADDRESS)

---

#### Étape 6 : Démarrer les services

Ouvrir **4 terminaux séparés** :

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
```
 Backend démarré sur http://localhost:3000

**Terminal 2 - Frontend Client** :
```bash
cd frontend/client
npm run dev
```
 App Client sur http://localhost:5173

**Terminal 3 - Frontend Restaurant** :
```bash
cd frontend/restaurant
npm run dev
```
 App Restaurant sur http://localhost:5174

**Terminal 4 - Frontend Deliverer** :
```bash
cd frontend/deliverer
npm run dev
```
 App Deliverer sur http://localhost:5175

---

### Seed Data (Données de test)

Pour peupler MongoDB avec des données de test :

```bash
cd backend
npm run seed
```

Cela va créer :
- 5 restaurants de test
- 3 livreurs de test
- 2 clients de test
- Quelques commandes d'exemple

---

##  Tester le Workflow Complet

### Scénario : Créer une commande de A à Z

#### 1. **Client crée une commande**
- Ouvrir http://localhost:5173
- Connecter MetaMask
- Parcourir les restaurants
- Ajouter des items au panier
- Passer commande (confirmer transaction MetaMask)

#### 2. **Restaurant confirme la préparation**
- Ouvrir http://localhost:5174
- Connecter MetaMask (avec adresse restaurant)
- Voir la nouvelle commande dans la file d'attente
- Cliquer "Confirmer préparation" (transaction MetaMask)

#### 3. **Livreur accepte la livraison**
- Ouvrir http://localhost:5175
- Connecter MetaMask (avec adresse livreur)
- Voir les commandes disponibles
- Cliquer "Accepter" (transaction MetaMask)

#### 4. **Livreur confirme le pickup**
- Aller dans "Livraison active"
- Cliquer "Confirmer récupération" (transaction MetaMask)

#### 5. **Client confirme la livraison**
- Retourner sur http://localhost:5173
- Aller dans "Suivi de commande"
- Cliquer "Confirmer livraison" (transaction MetaMask)
-  Paiement automatique : 70% restaurant, 20% livreur, 10% plateforme
-  Client reçoit des tokens DONE

---

##  Troubleshooting (Résolution de problèmes)

### Problème : MetaMask ne se connecte pas

**Solution** :
1. Vérifier que MetaMask est sur le réseau "Polygon Mumbai"
2. Vérifier que le site est autorisé dans MetaMask (Settings → Connected Sites)
3. Rafraîchir la page et reconnecter

### Problème : Erreur MongoDB "MongoNetworkError"

**Solution** :
1. Vérifier que l'URI MongoDB est correct dans `backend/.env`
2. Vérifier que votre IP est autorisée dans MongoDB Atlas :
   - Atlas → Network Access → Add IP Address → Add Current IP
3. Vérifier que MongoDB est bien démarré (si local)

### Problème : Transaction échoue "insufficient funds"

**Solution** :
1. Obtenir plus de MATIC depuis le faucet : https://faucet.polygon.technology/
2. Vérifier le solde MetaMask : au moins 0.1 MATIC requis

### Problème : Smart contracts non déployés

**Solution** :
```bash
# Recompiler les contrats
npx hardhat clean
npx hardhat compile

# Redéployer
npx hardhat run scripts/deploy.js --network mumbai
```

### Problème : CORS error dans le frontend

**Solution** :
1. Vérifier que le backend est démarré sur http://localhost:3000
2. Vérifier que `VITE_API_URL` dans frontend/.env pointe vers `http://localhost:3000/api`

### Problème : Images IPFS ne chargent pas

**Solution** :
1. Vérifier les clés Pinata dans `backend/.env`
2. Tester l'upload manuel : https://app.pinata.cloud/pinmanager
3. Vérifier le gateway IPFS : `https://gateway.pinata.cloud/ipfs/`

---

##  Documentation Complémentaire

Pour plus de détails sur chaque composant :

- **Smart Contracts** : [contracts/README.md](./contracts/README.md)
- **Backend API** : [backend/README.md](./backend/README.md)
- **Frontend Client** : [frontend/client/README.md](./frontend/client/README.md)
- **Frontend Restaurant** : [frontend/restaurant/README.md](./frontend/restaurant/README.md)
- **Frontend Deliverer** : [frontend/deliverer/README.md](./frontend/deliverer/README.md)
- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)

## Team Roles

### Rôles dans le Système Blockchain

- **CLIENT** : Crée les commandes et effectue les paiements
- **RESTAURANT** : Reçoit les commandes et confirme la préparation
- **DELIVERER** : Accepte les livraisons et confirme le dépôt
- **PLATFORM** : Rôle administrateur (gestion globale, commission)
- **ARBITRATOR** : Résout les litiges entre les parties

### Rôles de Développement

- **Smart Contracts Developer** : Développement et tests des contrats Solidity
- **Backend Developer** : API REST, services, intégration blockchain
- **Frontend Developer** : Interfaces utilisateur (Client, Restaurant, Livreur)
- **DevOps** : Déploiement, infrastructure, CI/CD

## Structure du Projet

```
done-food-delivery/
├── contracts/          # Smart contracts Solidity
├── backend/            # API Node.js
├── frontend/
│   ├── client/        # App Client
│   ├── restaurant/    # App Restaurant
│   └── deliverer/     # App Livreur
├── scripts/           # Scripts de déploiement
└── docs/              # Documentation
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée du système
- Documentation API (à venir)
- Guide utilisateur (à venir)

## Liens Utiles

- [Polygon Mumbai Faucet](https://faucet.polygon.technology/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [IPFS Documentation](https://docs.ipfs.tech/)

---

## Équipe de Développement

Ce projet a été réalisé par des étudiants de l'Université Abdelmalek Essaadi (UAE) :

| Membre | Email |
|--------|-------|
| **Aya Brouki** | brouki.aya@etu.uae.ac.ma |
| **Zakariae Yahya** | zakariae.yahya@etu.uae.ac.ma |
| **Nora Eloumni** | eloumni.nora@etu.uae.ac.ma |
| **Salaheddine Kayouh** | kayouh.salaheddine@etu.uae.ac.ma |
| **Imane Khaila** | imane.khaila@etu.uae.ac.ma |

---

## License

Ce projet est développé dans le cadre d'un projet académique à l'Université Abdelmalek Essaadi (UAE).

