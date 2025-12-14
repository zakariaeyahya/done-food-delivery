# DONE Food Delivery - Smart Contracts

## 📋 Table des matières

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Contrats principaux](#contrats-principaux)
- [Interfaces et bibliothèques](#interfaces-et-bibliothèques)
- [Oracles et gouvernance](#oracles-et-gouvernance)
- [Installation et configuration](#installation-et-configuration)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Optimisations](#optimisations)
- [Dépannage](#dépannage)
- [Ressources](#ressources)

---

## 🎯 Introduction

Ce dépôt contient tous les smart contracts Solidity qui constituent le cœur métier de la plateforme DONE Food Delivery. Les contrats sont conçus pour fonctionner sur le réseau **Polygon Amoy** (testnet) et sont prêts pour un déploiement sur **Polygon Mainnet** en production.

### Fonctionnalités principales

- ✅ **Gestion complète des commandes** : Cycle de vie de la commande (création → livraison)
- ✅ **Système de paiement sécurisé** : Escrow et répartition automatique (70% restaurant, 20% livreur, 10% plateforme)
- ✅ **Token de fidélité** : Token ERC20 (DONE) pour récompenser les clients
- ✅ **Staking des livreurs** : Garantie de fiabilité avec staking minimum
- ✅ **Système d'arbitrage** : Résolution décentralisée des litiges
- ✅ **Oracles Chainlink** : Intégration avec Chainlink pour prix, GPS et météo

### Technologies utilisées

- **Solidity** : ^0.8.20
- **Hardhat** : Framework de développement et déploiement
- **OpenZeppelin** : Bibliothèques de contrats sécurisés
- **Chainlink** : Oracles pour données externes

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    DONE Food Delivery                        │
│                    Smart Contracts Layer                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌───────▼────────┐
│  Core          │   │  Oracles        │   │  Governance     │
│  Contracts     │   │  & Data         │   │  & Disputes     │
├────────────────┤   ├─────────────────┤   ├────────────────┤
│ DoneOrderManager│   │ DonePriceOracle │   │ DoneArbitration │
│ DonePaymentSplit│   │ DoneGPSOracle   │   │                 │
│ DoneToken       │   │ DoneWeatherOracle│   │                 │
│ DoneStaking     │   │                 │   │                 │
└────────────────┘   └─────────────────┘   └────────────────┘
```

### Flux de données

```
Client → createOrder() → OrderManager
                              │
                              ├──→ Escrow (fonds bloqués)
                              │
Restaurant → confirmPreparation() → OrderManager
                              │
                              ├──→ Status: PREPARING
                              │
Deliverer → assignDeliverer() → OrderManager
                              │
                              ├──→ Vérification staking
                              │
Deliverer → confirmPickup() → OrderManager
                              │
                              ├──→ Status: IN_DELIVERY
                              │
Client → confirmDelivery() → OrderManager
                              │
                              ├──→ PaymentSplitter (70/20/10)
                              ├──→ DoneToken.mint() (récompense)
                              └──→ Status: DELIVERED
```

---

## 📦 Contrats principaux

### 1. DoneOrderManager.sol

**Rôle** : Contrat principal de gestion du cycle de vie complet des commandes.

#### Caractéristiques

- **Héritage** : `AccessControl`, `ReentrancyGuard`, `Pausable`
- **Rôles** : CLIENT, RESTAURANT, DELIVERER, PLATFORM, ARBITRATOR
- **Pattern** : Escrow pour sécuriser les fonds

#### Structure Order

```solidity
struct Order {
    uint256 id;                    // ID unique
    address payable client;         // Adresse du client
    address payable restaurant;     // Adresse du restaurant
    address payable deliverer;      // Adresse du livreur
    uint256 foodPrice;             // Prix des plats (wei)
    uint256 deliveryFee;           // Frais de livraison (wei)
    uint256 platformFee;           // Commission plateforme (10%)
    uint256 totalAmount;           // Total = foodPrice + deliveryFee + platformFee
    OrderStatus status;            // État actuel
    string ipfsHash;               // Hash IPFS des détails
    uint256 createdAt;             // Timestamp
    bool disputed;                 // Litige ouvert
    bool delivered;                // Livraison confirmée
}
```

#### États de commande

```solidity
enum OrderStatus {
    CREATED,      // 0 - Commande créée, fonds bloqués
    PREPARING,    // 1 - Restaurant confirme préparation
    ASSIGNED,     // 2 - Livreur assigné
    IN_DELIVERY,  // 3 - Livreur en route
    DELIVERED,    // 4 - Livraison confirmée, fonds libérés
    DISPUTED      // 5 - Litige ouvert, fonds gelés
}
```

#### Fonctions principales

**createOrder()**
- Crée une nouvelle commande avec paiement
- Valide les montants et rôles
- Bloque les fonds en escrow
- Émet `OrderCreated` event
- **Gas estimé** : ~150,000

**confirmPreparation()**
- Confirme la préparation par le restaurant
- Change le statut à `PREPARING`
- Émet `PreparationConfirmed` event
- **Gas estimé** : ~45,000

**assignDeliverer()**
- Assigne un livreur à la commande
- Vérifie que le livreur est staké
- Change le statut à `ASSIGNED` puis `IN_DELIVERY`
- Émet `DelivererAssigned` event
- **Gas estimé** : ~80,000

**confirmPickup()**
- Confirme la récupération par le livreur
- Émet `PickupConfirmed` event
- **Gas estimé** : ~30,000

**confirmDelivery()**
- Confirme la livraison par le client
- Appelle `PaymentSplitter.splitPayment()` automatiquement
- Mint des tokens DONE pour le client
- Change le statut à `DELIVERED`
- Émet `DeliveryConfirmed` event
- **Gas estimé** : ~250,000

**openDispute()**
- Ouvre un litige sur une commande
- Gèle les fonds
- Change le statut à `DISPUTED`
- Émet `DisputeOpened` event
- **Gas estimé** : ~50,000

**resolveDispute()**
- Résout un litige par un arbitre
- Transfère les fonds selon la décision
- Émet `DisputeResolved` event
- **Gas estimé** : ~80,000

#### Sécurité

- ✅ **ReentrancyGuard** : Protection contre les attaques de réentrance
- ✅ **Pausable** : Possibilité de mettre en pause en cas d'urgence
- ✅ **AccessControl** : Gestion fine des rôles
- ✅ **Checks-Effects-Interactions** : Pattern de sécurité respecté

---

### 2. DonePaymentSplitter.sol

**Rôle** : Répartition automatique des paiements selon un ratio prédéfini.

#### Caractéristiques

- **Héritage** : `Ownable`, `ReentrancyGuard`
- **Ratio de split** : 70% restaurant, 20% livreur, 10% plateforme

#### Fonction principale

**splitPayment()**
```solidity
function splitPayment(
    uint256 _orderId,
    address payable _restaurant,
    address payable _deliverer,
    address payable _platform
) external payable nonReentrant
```

- Calcule les montants selon le ratio
- Transfère les fonds via `call{value: ...}("")`
- Vérifie le succès de chaque transfert
- Émet `PaymentSplit` event avec tous les détails
- **Gas estimé** : ~60,000

#### Sécurité

- ✅ **ReentrancyGuard** : Protection contre la réentrance
- ✅ **Low-level call** : Utilisation de `.call()` pour plus de flexibilité
- ✅ **Validation des adresses** : Vérification que les adresses ne sont pas nulles

---

### 3. DoneToken.sol

**Rôle** : Token ERC20 de fidélité pour récompenser les clients.

#### Caractéristiques

- **Héritage** : `ERC20`, `AccessControl`
- **Nom** : "DONE Token"
- **Symbole** : "DONE"
- **Décimales** : 18
- **Taux de récompense** : 1 DONE token par 10 ETH dépensés (10% du montant)

#### Fonctions principales

**mint(address to, uint256 amount)**
- Mint des tokens pour récompenser un client
- Réservé au `MINTER_ROLE`
- Appelé automatiquement après `confirmDelivery()`

**burn(uint256 amount)**
- Permet à un client de brûler ses tokens
- Utilisé pour des réductions ou promotions

**calculateReward(uint256 foodPrice)**
- Calcule le montant de tokens à mint
- Formule : `foodPrice / 10`

#### Sécurité

- ✅ **AccessControl** : Seul le `MINTER_ROLE` peut mint
- ✅ **Standard ERC20** : Compatible avec tous les wallets et DEX

---

### 4. DoneStaking.sol

**Rôle** : Gestion du staking des livreurs pour garantir leur fiabilité.

#### Caractéristiques

- **Héritage** : `AccessControl`, `ReentrancyGuard`
- **Staking minimum** : 0.1 ETH
- **Protection** : Slashing en cas d'abus

#### Fonctions principales

**stakeAsDeliverer()**
- Permet à un livreur de déposer sa garantie
- Minimum 0.1 ETH requis
- Émet `Staked` event
- **Gas estimé** : ~50,000

**unstake()**
- Permet au livreur de retirer sa garantie
- Vérifie qu'il n'y a pas de livraison active
- Émet `Unstaked` event
- **Gas estimé** : ~40,000

**slash(address deliverer, uint256 amount)**
- Pénalise un livreur en cas d'abus
- Réservé au `PLATFORM_ROLE`
- Transfère le montant à la plateforme
- Émet `Slashed` event
- **Gas estimé** : ~60,000

**isStaked(address deliverer)**
- Vérifie si un livreur est staké
- Utilisé par `DoneOrderManager` avant assignation

#### Sécurité

- ✅ **ReentrancyGuard** : Protection contre la réentrance
- ✅ **AccessControl** : Seul `PLATFORM_ROLE` peut slasher
- ✅ **Validation** : Vérification du montant minimum

---

## 🔗 Interfaces et bibliothèques

### Interfaces

#### IOrderManager.sol
Interface standardisée pour `DoneOrderManager` facilitant les interactions cross-contracts et améliorant la modularité.

#### IPaymentSplitter.sol
Interface pour `DonePaymentSplitter` standardisant la communication entre contrats.

### Bibliothèques

#### OrderLib.sol
Bibliothèque de fonctions utilitaires pour la gestion des commandes :
- Validations (montant, état)
- Helpers (calcul `totalAmount`)
- Optimisation gas

---

## 🔮 Oracles et gouvernance

### Oracles Chainlink

#### DonePriceOracle.sol
Oracle pour obtenir le prix MATIC/USD depuis Chainlink Price Feed.

#### DoneGPSOracle.sol
Oracle pour vérifier les données GPS des livreurs.

#### DoneWeatherOracle.sol
Oracle pour obtenir les données météo (optionnel).

### Gouvernance

#### DoneArbitration.sol
Système d'arbitrage décentralisé pour résoudre les litiges avec vote des arbitres.

---

## 🚀 Installation et configuration

### Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MetaMask** avec au moins **0.5 MATIC** sur Polygon Amoy
- **Compte PolygonScan** (optionnel - pour vérifier les contrats)

### Installation

```bash
# Cloner le dépôt
cd contracts

# Installer les dépendances
npm install

# Installer Hardhat (si pas déjà installé)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Installer OpenZeppelin
npm install @openzeppelin/contracts

# Installer Chainlink
npm install @chainlink/contracts
```

### Configuration

#### 1. Créer le fichier `.env`

À la racine du projet, créez un fichier `.env` :

```env
# Polygon Amoy Testnet
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
# Ou utilisez un provider privé :
# ALCHEMY_API_KEY=your_alchemy_key
# INFURA_API_KEY=your_infura_key

PRIVATE_KEY=votre_cle_privee_metamask_sans_0x

# PolygonScan API (optionnel - pour vérification)
POLYGONSCAN_API_KEY=votre_cle_polygonscan

# Network
NETWORK=amoy
```

**⚠️ IMPORTANT** : Ne jamais commiter le fichier `.env` dans Git !

#### 2. Configuration Hardhat

Le fichier `hardhat.config.js` est déjà configuré avec :

- **Solidity** : ^0.8.20
- **Optimizer** : Activé (200 runs)
- **Réseau Amoy** : Configuré avec RPC URL et accounts
- **ViaIR** : Activé pour optimiser le gas

---

## 📤 Déploiement

### Ordre de déploiement

⚠️ **IMPORTANT** : Les contrats doivent être déployés dans cet **ordre exact** car ils dépendent les uns des autres :

1. **DoneToken.sol** (indépendant)
2. **DonePaymentSplitter.sol** (indépendant)
3. **DoneStaking.sol** (indépendant)
4. **DoneOrderManager.sol** (nécessite les adresses des 3 contrats précédents)
5. **DoneArbitration.sol** (optionnel)
6. **Oracles** (optionnel)

### Compilation

```bash
# Compiler tous les contrats
npx hardhat compile
```

Résultat attendu :
```
Compiled X Solidity files successfully
```

### Déploiement automatique

Créez un script `scripts/deploy-all.js` pour déployer tous les contrats :

```bash
# Déployer sur Polygon Amoy
npx hardhat run scripts/deploy-all.js --network amoy
```

**Résultat attendu** :
```
Deploying contracts to Polygon Amoy...
Deploying DoneToken...
✅ DoneToken deployed to: 0x...

Deploying DonePaymentSplitter...
✅ DonePaymentSplitter deployed to: 0x...

Deploying DoneStaking...
✅ DoneStaking deployed to: 0x...

Deploying DoneOrderManager...
✅ DoneOrderManager deployed to: 0x...

All contracts deployed successfully!
Contract addresses saved to: contracts-amoy.json
```

### Configuration post-déploiement

#### 1. Sauvegarder les adresses

Les adresses sont sauvegardées dans `contracts-amoy.json`. Copiez-les dans :

- `backend/.env` :
  ```env
  ORDER_MANAGER_ADDRESS=0x...
  PAYMENT_SPLITTER_ADDRESS=0x...
  TOKEN_ADDRESS=0x...
  STAKING_ADDRESS=0x...
  ```

- `frontend/client/.env` :
  ```env
  VITE_ORDER_MANAGER_ADDRESS=0x...
  VITE_TOKEN_ADDRESS=0x...
  ```

#### 2. Configurer les rôles

Exécutez le script de configuration des rôles :

```bash
npx hardhat run scripts/setup-roles.js --network amoy
```

Ce script assigne les rôles nécessaires :
- `RESTAURANT_ROLE` aux restaurants
- `DELIVERER_ROLE` aux livreurs
- `ARBITRATOR_ROLE` aux arbitres
- `MINTER_ROLE` au `DoneOrderManager`

#### 3. Vérifier sur PolygonScan

```bash
# Vérifier DoneToken
npx hardhat verify --network amoy <TOKEN_ADDRESS>

# Vérifier DonePaymentSplitter
npx hardhat verify --network amoy <PAYMENT_SPLITTER_ADDRESS>

# Vérifier DoneStaking
npx hardhat verify --network amoy <STAKING_ADDRESS>

# Vérifier DoneOrderManager (avec constructor args)
npx hardhat verify --network amoy <ORDER_MANAGER_ADDRESS> "<PAYMENT_SPLITTER_ADDRESS>" "<TOKEN_ADDRESS>" "<STAKING_ADDRESS>" "<PLATFORM_WALLET>"
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npx hardhat test

# Tests spécifiques
npx hardhat test test/DoneOrderManager.test.js
npx hardhat test test/DonePaymentSplitter.test.js
npx hardhat test test/DoneToken.test.js
npx hardhat test test/DoneStaking.test.js
```

### Coverage

```bash
# Générer le rapport de couverture
npx hardhat coverage
```

**Objectif** : Coverage > 90% pour tous les contrats critiques.

### Tests critiques

#### T1 : Création de commande avec paiement correct
- ✅ Vérifie que le paiement est correct
- ✅ Vérifie que les fonds sont bloqués
- ✅ Vérifie l'émission de l'event `OrderCreated`

#### T2 : Workflow complet (CREATED → DELIVERED)
- ✅ Teste toutes les transitions d'état
- ✅ Vérifie le split automatique des paiements
- ✅ Vérifie le mint des tokens DONE

#### T3 : Split de paiement automatique (70/20/10)
- ✅ Vérifie les calculs mathématiques
- ✅ Vérifie la gestion des arrondis
- ✅ Vérifie les transferts réussis

#### T4 : Dispute et gel des fonds
- ✅ Vérifie que les fonds sont gelés lors d'un litige
- ✅ Vérifie que seul un arbitre peut résoudre

#### T5 : Staking et slashing livreur
- ✅ Vérifie le minimum de 0.1 ETH
- ✅ Vérifie le slashing en cas d'abus
- ✅ Vérifie l'unstake

#### T6 : Distribution de récompenses tokens
- ✅ Vérifie le calcul correct des tokens
- ✅ Vérifie le mint automatique

---

## 🔒 Sécurité

### Mesures de sécurité implémentées

#### 1. Protection contre la réentrance
- ✅ `ReentrancyGuard` sur toutes les fonctions critiques
- ✅ Pattern Checks-Effects-Interactions respecté

#### 2. Gestion des rôles
- ✅ `AccessControl` d'OpenZeppelin
- ✅ Rôles séparés pour chaque acteur
- ✅ Vérification stricte des permissions

#### 3. Gestion des fonds
- ✅ Pattern Escrow pour sécuriser les paiements
- ✅ Pull over Push pour les transferts
- ✅ Validation des montants avant transfert

#### 4. Pause d'urgence
- ✅ `Pausable` pour arrêter le contrat en cas d'urgence
- ✅ Seul le `DEFAULT_ADMIN_ROLE` peut pauser

#### 5. Validation des entrées
- ✅ Vérification des adresses non nulles
- ✅ Vérification des montants > 0
- ✅ Vérification des états valides

### Audit recommandé

Avant un déploiement en production, il est **fortement recommandé** de faire auditer les contrats par une firme spécialisée.

---

## ⚡ Optimisations

### Optimisations gas

#### 1. Compilateur
- ✅ Optimizer activé (200 runs)
- ✅ ViaIR activé pour optimisations avancées

#### 2. Stockage
- ✅ Stockage minimal on-chain (détails dans IPFS)
- ✅ Utilisation de `uint256` (optimal pour l'EVM)
- ✅ Events au lieu de storage pour les logs

#### 3. Fonctions
- ✅ Pas de boucles dans les fonctions critiques
- ✅ Utilisation de bibliothèques pour réduire la taille du contrat

### Coûts de gas estimés

| Fonction | Gas estimé |
|----------|------------|
| `createOrder()` | ~150,000 |
| `confirmPreparation()` | ~45,000 |
| `assignDeliverer()` | ~80,000 |
| `confirmPickup()` | ~30,000 |
| `confirmDelivery()` | ~250,000 |
| `openDispute()` | ~50,000 |
| `resolveDispute()` | ~80,000 |
| `splitPayment()` | ~60,000 |
| `stakeAsDeliverer()` | ~50,000 |
| `unstake()` | ~40,000 |

---

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur : "insufficient funds for intrinsic transaction cost"

**Cause** : Pas assez de MATIC pour payer le gas.

**Solution** :
1. Obtenir plus de MATIC depuis le faucet : https://faucet.polygon.technology/
2. Vérifier le solde MetaMask : au moins **0.5 MATIC** requis

#### 2. Erreur : "nonce too high"

**Cause** : Désynchronisation du nonce entre MetaMask et la blockchain.

**Solution** :
1. Ouvrir MetaMask
2. Settings → Advanced → Clear activity tab data
3. Rafraîchir et réessayer

#### 3. Erreur : "contract creation code storage out of gas"

**Cause** : Contrat trop gros (> 24 KB).

**Solution** :
1. Vérifier que l'optimizer est activé dans `hardhat.config.js`
2. Augmenter `runs` à 200 ou plus
3. Séparer le contrat en modules plus petits

#### 4. Erreur : "PolygonScan verification failed"

**Cause** : API Key invalide ou constructor args incorrects.

**Solution** :
1. Vérifier `POLYGONSCAN_API_KEY` dans `.env`
2. Vérifier que les constructor args sont dans le bon ordre
3. Attendre 1-2 minutes après le déploiement avant de vérifier

#### 5. Erreur : "Cannot find module 'dotenv'"

**Cause** : Dépendances manquantes.

**Solution** :
```bash
npm install dotenv
```

---

## 📚 Ressources

### Documentation

- **Hardhat Documentation** : https://hardhat.org/docs
- **OpenZeppelin Contracts** : https://docs.openzeppelin.com/contracts/
- **Solidity Documentation** : https://docs.soliditylang.org/
- **Chainlink Documentation** : https://docs.chain.link/

### Réseaux

- **Polygon Amoy Faucet** : https://faucet.polygon.technology/
- **Amoy PolygonScan** : https://amoy.polygonscan.com/
- **Polygon Mainnet PolygonScan** : https://polygonscan.com/

### Outils

- **Ethers.js Documentation** : https://docs.ethers.org/
- **Remix IDE** : https://remix.ethereum.org/
- **Tenderly** : https://tenderly.co/ (pour debug)

---

## 📝 Checklist de déploiement

Avant de déployer en production (Polygon Mainnet) :

- [ ] Tous les tests unitaires passent (coverage > 90%)
- [ ] Audit de sécurité effectué
- [ ] Gas optimization effectuée
- [ ] Fichiers `.env` configurés pour mainnet
- [ ] MATIC suffisant pour le déploiement (~2-5 MATIC)
- [ ] Backup de la PRIVATE_KEY sécurisé
- [ ] Contrats vérifiés sur PolygonScan
- [ ] Documentation mise à jour avec les nouvelles adresses
- [ ] Backend et frontends configurés avec les nouvelles adresses
- [ ] Tests d'intégration effectués sur testnet
- [ ] Plan de rollback préparé

---

## 📄 Licence

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

## 🤝 Contribution

### Workflow

1. Créer une branche depuis `main`
2. Développer la fonctionnalité
3. Ajouter des tests
4. Vérifier que tous les tests passent
5. Créer une pull request

### Standards de code

- Utiliser Solidity ^0.8.20
- Suivre les conventions de nommage Solidity
- Ajouter des commentaires NatSpec pour toutes les fonctions publiques
- Tester toutes les fonctions avant commit

---

**Développé avec ❤️ pour DONE Food Delivery**
