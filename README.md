# DONE Food Delivery on Blockchain

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

## Setup Instructions

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn
- Git
- MetaMask (extension navigateur)
- Compte MongoDB Atlas (gratuit)
- Wallet Ethereum avec des MATIC (testnet Mumbai)

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd done-food-delivery
```

2. **Installer les dépendances**
```bash
npm run install:all
```

3. **Configuration de l'environnement**

Créer les fichiers `.env` nécessaires :
- À la racine : pour Hardhat (smart contracts)
- Dans `backend/` : pour l'API Node.js

Variables d'environnement principales :
```env
# Blockchain
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key

# MongoDB
MONGODB_URI=mongodb+srv://...

# IPFS
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret

# JWT
JWT_SECRET=your_secret
```

4. **Déployer les smart contracts**
```bash
npm run deploy:mumbai
```

5. **Démarrer le backend**
```bash
npm run dev:backend
```

6. **Démarrer les frontends**
```bash
# Application Client
npm run dev:client

# Application Restaurant
npm run dev:restaurant

# Application Livreur
npm run dev:deliverer
```

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

## License

Ce projet est développé dans le cadre d'un projet académique.

