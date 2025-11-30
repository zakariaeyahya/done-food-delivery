# Dossier contracts/

Ce dossier contient tous les smart contracts Solidity qui constituent le cœur métier de la plateforme DONE Food Delivery. Les contrats sont déployés sur le réseau Polygon Mumbai (testnet).

## Structure

### Contrats Principaux

#### DoneOrderManager.sol
**Rôle** : Contrat principal de gestion du cycle de vie complet des commandes.

**📋 Spécifications Techniques Détaillées** :

**1. Version Solidity & Imports** :
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IPaymentSplitter.sol";
import "./interfaces/IOrderManager.sol";
import "./libraries/OrderLib.sol";
```

**2. Rôles (bytes32)** :
```solidity
bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");
bytes32 public constant RESTAURANT_ROLE = keccak256("RESTAURANT_ROLE");
bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
```

**3. Enum OrderStatus** :
```solidity
enum OrderStatus {
    CREATED,      // 0 - Commande créée, fonds bloqués
    PREPARING,    // 1 - Restaurant confirme préparation
    IN_DELIVERY,  // 2 - Livreur en route
    DELIVERED,    // 3 - Livraison confirmée, fonds libérés
    DISPUTED      // 4 - Litige ouvert, fonds gelés
}
```

**4. Struct Order** :
```solidity
struct Order {
    uint256 id;                    // ID unique de la commande
    address payable client;        // Adresse du client
    address payable restaurant;    // Adresse du restaurant
    address payable deliverer;     // Adresse du livreur (0x0 si pas encore assigné)
    uint256 foodPrice;             // Prix des plats en wei
    uint256 deliveryFee;           // Frais de livraison en wei
    uint256 platformFee;           // Commission plateforme (10% de foodPrice)
    uint256 totalAmount;           // Total = foodPrice + deliveryFee + platformFee
    OrderStatus status;            // État actuel de la commande
    string ipfsHash;               // Hash IPFS des détails (items, adresse livraison)
    uint256 createdAt;             // Timestamp de création
    bool disputed;                 // True si litige ouvert
    bool delivered;                // True si livraison confirmée
}
```

**5. Variables d'État** :
```solidity
uint256 public orderCounter;                           // Compteur d'ordres (auto-increment)
mapping(uint256 => Order) public orders;               // orderId => Order
mapping(address => uint256[]) public clientOrders;     // client => array d'orderIds
mapping(address => uint256[]) public restaurantOrders; // restaurant => array d'orderIds
mapping(address => uint256[]) public delivererOrders;  // deliverer => array d'orderIds

address public paymentSplitterAddress;   // Adresse du contrat DonePaymentSplitter
address public tokenAddress;             // Adresse du contrat DoneToken
address public stakingAddress;           // Adresse du contrat DoneStaking

uint256 public constant PLATFORM_FEE_PERCENT = 10;  // 10% de commission
```

**6. Events** :
```solidity
event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
event DisputeOpened(uint256 indexed orderId, address indexed opener);
event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);
```

**7. Fonctions Principales** :

**a) createOrder() - Création de commande**
```solidity
function createOrder(
    address payable _restaurant,
    uint256 _foodPrice,
    uint256 _deliveryFee,
    string memory _ipfsHash
) external payable nonReentrant whenNotPaused returns (uint256)
```
- **Modifiers** : `nonReentrant`, `whenNotPaused`
- **Validations** :
  - `_restaurant` doit avoir le rôle RESTAURANT_ROLE
  - `_foodPrice > 0`
  - `_deliveryFee > 0`
  - `_ipfsHash` non vide
  - Calcule `platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100`
  - Calcule `totalAmount = _foodPrice + _deliveryFee + platformFee`
  - `msg.value` doit être égal à `totalAmount`
- **Actions** :
  - Incrémente `orderCounter`
  - Crée la structure Order et la stocke dans `orders[orderCounter]`
  - Ajoute l'orderId dans `clientOrders[msg.sender]`
  - Ajoute l'orderId dans `restaurantOrders[_restaurant]`
  - Émet event `OrderCreated`
  - Retourne `orderCounter`
- **Gas estimé** : ~150,000

**b) confirmPreparation() - Confirmation restaurant**
```solidity
function confirmPreparation(uint256 _orderId) external onlyRole(RESTAURANT_ROLE)
```
- **Modifiers** : `onlyRole(RESTAURANT_ROLE)`
- **Validations** :
  - `msg.sender == orders[_orderId].restaurant`
  - `orders[_orderId].status == OrderStatus.CREATED`
- **Actions** :
  - Change `orders[_orderId].status` à `OrderStatus.PREPARING`
  - Émet event `PreparationConfirmed`
- **Gas estimé** : ~45,000

**c) assignDeliverer() - Assignation livreur**
```solidity
function assignDeliverer(uint256 _orderId, address payable _deliverer) external
```
- **Validations** :
  - `_deliverer` doit avoir le rôle DELIVERER_ROLE
  - `_deliverer` doit être staké (appel à `stakingContract.isStaked(_deliverer)`)
  - `orders[_orderId].status == OrderStatus.PREPARING`
  - `orders[_orderId].deliverer == address(0)` (pas déjà assigné)
- **Actions** :
  - Assigne `orders[_orderId].deliverer = _deliverer`
  - Change `status` à `OrderStatus.IN_DELIVERY`
  - Ajoute l'orderId dans `delivererOrders[_deliverer]`
  - Émet event `DelivererAssigned`
- **Gas estimé** : ~80,000

**d) confirmPickup() - Confirmation récupération**
```solidity
function confirmPickup(uint256 _orderId) external onlyRole(DELIVERER_ROLE)
```
- **Modifiers** : `onlyRole(DELIVERER_ROLE)`
- **Validations** :
  - `msg.sender == orders[_orderId].deliverer`
  - `orders[_orderId].status == OrderStatus.IN_DELIVERY`
- **Actions** :
  - Émet event `PickupConfirmed`
  - (Le status reste IN_DELIVERY, c'est juste une confirmation intermédiaire)
- **Gas estimé** : ~30,000

**e) confirmDelivery() - Confirmation livraison + Split automatique**
```solidity
function confirmDelivery(uint256 _orderId) external nonReentrant
```
- **Modifiers** : `nonReentrant`
- **Validations** :
  - `msg.sender == orders[_orderId].client`
  - `orders[_orderId].status == OrderStatus.IN_DELIVERY`
  - `orders[_orderId].disputed == false`
- **Actions** :
  - Change `orders[_orderId].status` à `OrderStatus.DELIVERED`
  - Change `orders[_orderId].delivered` à `true`
  - **Appelle `paymentSplitter.splitPayment()`** :
    ```solidity
    IPaymentSplitter(paymentSplitterAddress).splitPayment{value: totalAmount}(
        _orderId,
        orders[_orderId].restaurant,
        orders[_orderId].deliverer,
        owner() // plateforme
    );
    ```
  - **Mint tokens DONE** pour le client :
    ```solidity
    uint256 tokensToMint = (orders[_orderId].foodPrice / 10 ether) * 1 ether;
    IDoneToken(tokenAddress).mint(orders[_orderId].client, tokensToMint);
    ```
  - Émet event `DeliveryConfirmed`
- **Gas estimé** : ~250,000 (incluant split et mint)

**f) openDispute() - Ouverture litige**
```solidity
function openDispute(uint256 _orderId) external
```
- **Validations** :
  - `msg.sender` doit être `client`, `restaurant` ou `deliverer` de la commande
  - `orders[_orderId].status != OrderStatus.DELIVERED`
  - `orders[_orderId].disputed == false`
- **Actions** :
  - Change `orders[_orderId].status` à `OrderStatus.DISPUTED`
  - Change `orders[_orderId].disputed` à `true`
  - Émet event `DisputeOpened`
  - **Les fonds restent bloqués dans le contrat**
- **Gas estimé** : ~50,000

**g) resolveDispute() - Résolution par arbitre**
```solidity
function resolveDispute(
    uint256 _orderId,
    address payable _winner,
    uint256 _refundPercent
) external onlyRole(ARBITRATOR_ROLE) nonReentrant
```
- **Modifiers** : `onlyRole(ARBITRATOR_ROLE)`, `nonReentrant`
- **Validations** :
  - `orders[_orderId].disputed == true`
  - `_winner` doit être `client`, `restaurant` ou `deliverer`
  - `_refundPercent` entre 0 et 100
- **Actions** :
  - Calcule le montant à transférer selon `_refundPercent`
  - Transfère les fonds à `_winner`
  - Change `disputed` à `false`
  - Émet event `DisputeResolved`
- **Gas estimé** : ~80,000

**8. Fonctions View** :
```solidity
function getOrder(uint256 _orderId) external view returns (Order memory);
function getClientOrders(address _client) external view returns (uint256[] memory);
function getRestaurantOrders(address _restaurant) external view returns (uint256[] memory);
function getDelivererOrders(address _deliverer) external view returns (uint256[] memory);
function getTotalOrders() external view returns (uint256);
```

**9. Sécurité** :
- **ReentrancyGuard** : Protection contre les attaques de réentrance sur `createOrder`, `confirmDelivery`, `resolveDispute`
- **Pausable** : Le owner peut mettre en pause le contrat en cas d'urgence
- **AccessControl** : Gestion fine des rôles avec OpenZeppelin
- **Checks-Effects-Interactions Pattern** : Toujours mettre à jour l'état avant les transfers
- **Pull over Push** : Utilisation du PaymentSplitter pour distribuer les fonds

**10. Optimisations Gas** :
- Utilisation de `uint256` (optimal pour l'EVM)
- Stockage minimal on-chain (détails dans IPFS)
- Events au lieu de storage pour les logs
- Pas de boucles dans les fonctions critiques


#### DonePaymentSplitter.sol
**Rôle** : Répartition automatique des paiements selon le ratio prédéfini.

**📋 Spécifications Techniques Détaillées** :

**1. Version Solidity & Imports** :
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

**2. Constantes de Split** :
```solidity
uint256 public constant RESTAURANT_PERCENT = 70;  // 70%
uint256 public constant DELIVERER_PERCENT = 20;   // 20%
uint256 public constant PLATFORM_PERCENT = 10;    // 10%
```

**3. Events** :
```solidity
event PaymentSplit(
    uint256 indexed orderId,
    address indexed restaurant,
    address indexed deliverer,
    address platform,
    uint256 restaurantAmount,
    uint256 delivererAmount,
    uint256 platformAmount,
    uint256 timestamp
);
```

**4. Fonction Principale : splitPayment()** :
```solidity
function splitPayment(
    uint256 _orderId,
    address payable _restaurant,
    address payable _deliverer,
    address payable _platform
) external payable nonReentrant
```
- **Modifiers** : `nonReentrant`
- **Validations** :
  - `msg.value > 0` (montant à répartir)
  - `_restaurant != address(0)`
  - `_deliverer != address(0)`
  - `_platform != address(0)`
- **Calculs** :
  ```solidity
  uint256 restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100;  // 70%
  uint256 delivererAmount = (msg.value * DELIVERER_PERCENT) / 100;    // 20%
  uint256 platformAmount = (msg.value * PLATFORM_PERCENT) / 100;      // 10%
  ```
- **Actions** :
  - Transfère `restaurantAmount` à `_restaurant` via `.call{value: ...}("")`
  - Transfère `delivererAmount` à `_deliverer` via `.call{value: ...}("")`
  - Transfère `platformAmount` à `_platform` via `.call{value: ...}("")`
  - Vérifie le succès de chaque transfert (require)
  - Émet event `PaymentSplit` avec tous les détails
- **Gas estimé** : ~60,000

**5. Sécurité** :
- **ReentrancyGuard** : Protection contre les attaques de réentrance
- **Checks-Effects-Interactions** : Calculs avant transferts
- **Low-level call** : Utilisation de `.call{value: ...}("")` au lieu de `.transfer()` pour plus de flexibilité
- **Pas de stockage** : Pas de variables d'état modifiables (gas optimisé)

#### DoneToken.sol
**Rôle** : Token ERC20 de fidélité pour récompenser les clients.

**Fonctionnalités** :
- Standard ERC20 avec fonctions `mint()` et `burn()`
- Système de récompenses : 1 token DONE par 10€ dépensés
- `mint()` : Attribue des tokens après une livraison réussie
- `burn()` : Consomme des tokens pour des réductions
- Tokens transférables et échangeables

**Utilisation** : Les tokens sont minés automatiquement après chaque commande livrée.

#### DoneStaking.sol
**Rôle** : Gestion du staking des livreurs pour garantir leur fiabilité.

**Fonctionnalités** :
- `stakeAsDeliverer()` : Dépôt minimum de 0.1 ETH requis pour être livreur
- `unstake()` : Retrait de la caution (si pas d'abus)
- `slash(deliverer, amount)` : Pénalité en cas de comportement abusif
- `isStaked(address)` : Vérification qu'un livreur est bien staké

**Sécurité** : Protège les clients et restaurants contre les annulations abusives et fraudes.

### Dossier interfaces/

#### IOrderManager.sol
**Rôle** : Interface standardisée pour le contrat DoneOrderManager.

**Fonctionnalités** :
- Définit les signatures de fonctions essentielles
- Permet les interactions cross-contracts sans dépendance directe
- Facilite l'upgrade, le testing et la modularité

#### IPaymentSplitter.sol
**Rôle** : Interface standardisée pour le contrat DonePaymentSplitter.

**Fonctionnalités** :
- Définit les signatures de fonctions de répartition
- Standardise la communication entre contrats
- Améliore la maintenabilité du code

### Dossier libraries/

#### OrderLib.sol
**Rôle** : Bibliothèque de fonctions utilitaires pour la gestion des commandes.

**Fonctionnalités** :
- Validations (montant correct, état valide)
- Helpers (calcul du totalAmount)
- Gestion interne des structures Order
- Outils de lecture/écriture optimisée

**Avantages** : Réduit la taille du contrat principal, améliore le gas et la lisibilité.

## Dépendances

- Les contrats utilisent OpenZeppelin pour les rôles et la sécurité
- DoneOrderManager dépend de DonePaymentSplitter, DoneToken et DoneStaking
- Les interfaces permettent la modularité et l'évolutivité

## 🚀 Guide de Déploiement

### Prérequis

Avant de déployer les smart contracts :

1. **Node.js et npm** installés (v18+)
2. **MetaMask** avec au moins **0.5 MATIC** sur Mumbai testnet
3. **Compte PolygonScan** (optionnel - pour vérifier les contrats)

### Configuration Hardhat

#### 1. Installer les dépendances

```bash
# À la racine du projet
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

#### 2. Configuration du fichier `.env`

Créer un fichier `.env` à la **racine du projet** :

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

# PolygonScan API (pour vérification des contrats)
POLYGONSCAN_API_KEY=votre_cle_polygonscan_optionnelle

# Configuration
NETWORK=mumbai
```

**🔑 Comment obtenir votre PRIVATE_KEY** :
1. Ouvrir MetaMask
2. Cliquer sur les 3 points → Account Details → Export Private Key
3. Entrer votre mot de passe MetaMask
4. Copier la clé privée (⚠️ **JAMAIS** la partager ou commiter dans Git)

**🔑 Comment obtenir POLYGONSCAN_API_KEY** (optionnel) :
1. Aller sur [polygonscan.com](https://polygonscan.com/)
2. Créer un compte
3. My Account → API Keys → Add
4. Copier la clé générée

#### 3. Configuration `hardhat.config.js`

Vérifier que le fichier `hardhat.config.js` à la racine contient :

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 6000000,
      gasPrice: 10000000000 // 10 gwei
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.POLYGON_PRIVATE_KEY ? [process.env.POLYGON_PRIVATE_KEY] : [],
      chainId: 137,
      gas: 6000000,
      gasPrice: 50000000000 // 50 gwei
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || ""
    }
  }
};
```

---

### Ordre de Déploiement

⚠️ **IMPORTANT** : Les contrats doivent être déployés dans cet **ordre exact** car ils dépendent les uns des autres :

1. **DoneToken.sol** (indépendant)
2. **DonePaymentSplitter.sol** (indépendant)
3. **DoneStaking.sol** (indépendant)
4. **DoneOrderManager.sol** (nécessite les adresses des 3 contrats précédents)

---

### Option 1 : Déploiement Automatique (Recommandé)

Utiliser le script de déploiement automatique qui gère toutes les dépendances :

```bash
# Compiler les contrats
npx hardhat compile

# Déployer sur Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Ou déployer sur Polygon mainnet (production)
npx hardhat run scripts/deploy.js --network polygon
```

**Résultat attendu** :
```
Deploying contracts to Mumbai testnet...
Deploying DoneToken...
✅ DoneToken deployed to: 0x1234567890abcdef1234567890abcdef12345678

Deploying DonePaymentSplitter...
✅ DonePaymentSplitter deployed to: 0xabcdef1234567890abcdef1234567890abcdef12

Deploying DoneStaking...
✅ DoneStaking deployed to: 0x567890abcdef1234567890abcdef1234567890ab

Deploying DoneOrderManager...
✅ DoneOrderManager deployed to: 0xcdef1234567890abcdef1234567890abcdef1234

All contracts deployed successfully!
Contract addresses saved to: contracts-addresses.json
```

**⚠️ IMPORTANT** : Copier ces adresses dans :
- `backend/.env` → `ORDER_MANAGER_ADDRESS`, `PAYMENT_SPLITTER_ADDRESS`, `TOKEN_ADDRESS`, `STAKING_ADDRESS`
- `frontend/client/.env` → `VITE_ORDER_MANAGER_ADDRESS`, `VITE_TOKEN_ADDRESS`
- `frontend/restaurant/.env` → `VITE_ORDER_MANAGER_ADDRESS`, `VITE_PAYMENT_SPLITTER_ADDRESS`
- `frontend/deliverer/.env` → `VITE_ORDER_MANAGER_ADDRESS`, `VITE_STAKING_ADDRESS`

---

### Option 2 : Déploiement Manuel (Étape par Étape)

Si vous voulez déployer manuellement chaque contrat :

#### Étape 1 : Compiler les contrats

```bash
npx hardhat compile
```

Résultat attendu :
```
Compiled 15 Solidity files successfully
```

#### Étape 2 : Déployer DoneToken

Créer un script `scripts/deploy-token.js` :

```javascript
const hre = require("hardhat");

async function main() {
  const DoneToken = await hre.ethers.getContractFactory("DoneToken");
  const token = await DoneToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("DoneToken deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Déployer :
```bash
npx hardhat run scripts/deploy-token.js --network mumbai
```

#### Étape 3 : Déployer DonePaymentSplitter

```bash
npx hardhat run scripts/deploy-payment-splitter.js --network mumbai
```

#### Étape 4 : Déployer DoneStaking

```bash
npx hardhat run scripts/deploy-staking.js --network mumbai
```

#### Étape 5 : Déployer DoneOrderManager

⚠️ **Nécessite les adresses des 3 contrats précédents**

```javascript
// scripts/deploy-order-manager.js
const TOKEN_ADDRESS = "0x..."; // DoneToken
const PAYMENT_SPLITTER_ADDRESS = "0x..."; // DonePaymentSplitter
const STAKING_ADDRESS = "0x..."; // DoneStaking

const OrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
const orderManager = await OrderManager.deploy(
  TOKEN_ADDRESS,
  PAYMENT_SPLITTER_ADDRESS,
  STAKING_ADDRESS
);
```

---

### Vérifier les Contrats sur PolygonScan

Après déploiement, vérifier les contrats pour permettre l'interaction directe :

```bash
# Vérifier DoneToken
npx hardhat verify --network mumbai <TOKEN_ADDRESS>

# Vérifier DonePaymentSplitter
npx hardhat verify --network mumbai <PAYMENT_SPLITTER_ADDRESS>

# Vérifier DoneStaking
npx hardhat verify --network mumbai <STAKING_ADDRESS>

# Vérifier DoneOrderManager (avec constructor args)
npx hardhat verify --network mumbai <ORDER_MANAGER_ADDRESS> "<TOKEN_ADDRESS>" "<PAYMENT_SPLITTER_ADDRESS>" "<STAKING_ADDRESS>"
```

**Résultat** : Les contrats seront vérifiés et le code source sera visible sur PolygonScan.

---

## 🧪 Tests

### Lancer les tests unitaires

```bash
# Tous les tests
npx hardhat test

# Tests spécifiques
npx hardhat test test/DoneOrderManager.test.js
npx hardhat test test/DonePaymentSplitter.test.js
npx hardhat test test/DoneToken.test.js
npx hardhat test test/DoneStaking.test.js
```

### Coverage des tests

```bash
# Générer le rapport de couverture
npx hardhat coverage
```

**Objectif** : Coverage > 90% pour tous les contrats critiques.

### Tests recommandés

Pour chaque contrat, tester :

**DoneOrderManager** :
- ✅ Création de commande avec paiement correct
- ✅ Rejet si paiement insuffisant
- ✅ Confirmation préparation par restaurant
- ✅ Assignation livreur staké uniquement
- ✅ Confirmation livraison et split automatique
- ✅ Ouverture et résolution de litige
- ✅ Reentrancy protection
- ✅ Access control (rôles)

**DonePaymentSplitter** :
- ✅ Split 70/20/10 correct
- ✅ Transferts réussis
- ✅ Reentrancy protection

**DoneToken** :
- ✅ Mint après livraison
- ✅ Burn pour réductions
- ✅ Transferts ERC20

**DoneStaking** :
- ✅ Stake minimum 0.1 ETH
- ✅ Unstake si pas de livraison active
- ✅ Slashing en cas d'abus

---

## 🔧 Troubleshooting (Problèmes courants)

### Erreur : "insufficient funds for intrinsic transaction cost"

**Cause** : Pas assez de MATIC pour payer le gas.

**Solution** :
1. Obtenir plus de MATIC depuis le faucet : https://faucet.polygon.technology/
2. Vérifier le solde MetaMask : au moins **0.5 MATIC** requis

### Erreur : "nonce too high"

**Cause** : Désynchronisation du nonce entre MetaMask et la blockchain.

**Solution** :
1. Ouvrir MetaMask
2. Settings → Advanced → Clear activity tab data
3. Rafraîchir et réessayer

### Erreur : "contract creation code storage out of gas"

**Cause** : Contrat trop gros (> 24 KB).

**Solution** :
1. Activer l'optimizer dans `hardhat.config.js` :
```javascript
optimizer: {
  enabled: true,
  runs: 200
}
```
2. Séparer le contrat en modules plus petits

### Erreur : "PolygonScan verification failed"

**Cause** : API Key invalide ou constructor args incorrects.

**Solution** :
1. Vérifier `POLYGONSCAN_API_KEY` dans `.env`
2. Vérifier que les constructor args sont dans le bon ordre
3. Attendre 1-2 minutes après le déploiement avant de vérifier

### Erreur : "Error: Cannot find module 'dotenv'"

**Cause** : Dépendances manquantes.

**Solution** :
```bash
npm install dotenv
```

---

## 📚 Ressources Utiles

- **Hardhat Documentation** : https://hardhat.org/docs
- **OpenZeppelin Contracts** : https://docs.openzeppelin.com/contracts/
- **Polygon Mumbai Faucet** : https://faucet.polygon.technology/
- **Mumbai PolygonScan** : https://mumbai.polygonscan.com/
- **Polygon Mainnet PolygonScan** : https://polygonscan.com/
- **Ethers.js Documentation** : https://docs.ethers.org/

---

## 📝 Checklist de Déploiement

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

---

## Templates de Code Complets 


### Template : DoneOrderManager.sol

**Fichier** : `contracts/DoneOrderManager.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IPaymentSplitter.sol";
import "./DoneToken.sol";
import "./DoneStaking.sol";

/**
 * @title DoneOrderManager
 * @notice Contrat principal de gestion du cycle de vie des commandes
 * @dev Gère les états : CREATED → PREPARING → IN_DELIVERY → DELIVERED (ou DISPUTED)
 */
contract DoneOrderManager is AccessControl, ReentrancyGuard, Pausable {

    // === RÔLES (bytes32) ===
    bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");
    bytes32 public constant RESTAURANT_ROLE = keccak256("RESTAURANT_ROLE");
    bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // === ENUMS ===
    enum OrderStatus {
        CREATED,      // 0 - Commande créée, fonds bloqués
        PREPARING,    // 1 - Restaurant confirme préparation
        IN_DELIVERY,  // 2 - Livreur en route
        DELIVERED,    // 3 - Livraison confirmée, fonds libérés
        DISPUTED      // 4 - Litige ouvert, fonds gelés
    }

    // === STRUCTS ===
    struct Order {
        uint256 id;                    // ID unique de la commande
        address payable client;        // Adresse du client
        address payable restaurant;    // Adresse du restaurant
        address payable deliverer;     // Adresse du livreur (0x0 si pas encore assigné)
        uint256 foodPrice;             // Prix des plats en wei
        uint256 deliveryFee;           // Frais de livraison en wei
        uint256 platformFee;           // Commission plateforme (10% de foodPrice)
        uint256 totalAmount;           // Total = foodPrice + deliveryFee + platformFee
        OrderStatus status;            // État actuel de la commande
        string ipfsHash;               // Hash IPFS des détails (items, adresse livraison)
        uint256 createdAt;             // Timestamp de création
        bool disputed;                 // True si litige ouvert
        bool delivered;                // True si livraison confirmée
    }

    // === STATE VARIABLES ===
    uint256 public orderCounter;                           // Compteur d'ordres (auto-increment)
    mapping(uint256 => Order) public orders;               // orderId => Order
    mapping(address => uint256[]) public clientOrders;     // client => array d'orderIds
    mapping(address => uint256[]) public restaurantOrders; // restaurant => array d'orderIds
    mapping(address => uint256[]) public delivererOrders;  // deliverer => array d'orderIds

    address public paymentSplitterAddress;   // Adresse du contrat DonePaymentSplitter
    DoneToken public tokenContract;          // Référence au contrat DoneToken
    DoneStaking public stakingContract;      // Référence au contrat DoneStaking

    uint256 public constant PLATFORM_FEE_PERCENT = 10;  // 10% de commission

    // === EVENTS ===
    event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
    event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
    event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
    event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
    event DisputeOpened(uint256 indexed orderId, address indexed opener);
    event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    // === CONSTRUCTOR ===
    /**
     * @param _paymentSplitterAddress Adresse du contrat DonePaymentSplitter
     * @param _tokenAddress Adresse du contrat DoneToken
     * @param _stakingAddress Adresse du contrat DoneStaking
     */
    constructor(
        address _paymentSplitterAddress,
        address _tokenAddress,
        address _stakingAddress
    ) {
        // TODO: Initialiser paymentSplitterAddress
        // TODO: Initialiser tokenContract = DoneToken(_tokenAddress)
        // TODO: Initialiser stakingContract = DoneStaking(_stakingAddress)
        // TODO: Configurer DEFAULT_ADMIN_ROLE pour msg.sender
        // TODO: Configurer PLATFORM_ROLE pour msg.sender
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Créer une nouvelle commande avec paiement
     * @param _restaurant Adresse du restaurant
     * @param _foodPrice Prix des plats en wei
     * @param _deliveryFee Frais de livraison en wei
     * @param _ipfsHash Hash IPFS contenant les détails de la commande
     * @return orderId ID de la commande créée
     */
    function createOrder(
        address payable _restaurant,
        uint256 _foodPrice,
        uint256 _deliveryFee,
        string memory _ipfsHash
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        // TODO: 1. Vérifier que _restaurant a le rôle RESTAURANT_ROLE
        // TODO: 2. Vérifier _foodPrice > 0
        // TODO: 3. Vérifier _deliveryFee > 0
        // TODO: 4. Vérifier _ipfsHash non vide
        // TODO: 5. Calculer platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100
        // TODO: 6. Calculer totalAmount = _foodPrice + _deliveryFee + platformFee
        // TODO: 7. Vérifier msg.value == totalAmount
        // TODO: 8. Incrémenter orderCounter
        // TODO: 9. Créer Order et stocker dans orders[orderCounter]
        // TODO: 10. Ajouter orderCounter dans clientOrders[msg.sender]
        // TODO: 11. Ajouter orderCounter dans restaurantOrders[_restaurant]
        // TODO: 12. Émettre event OrderCreated
        // TODO: 13. Retourner orderCounter
    }

    /**
     * @notice Confirmer la préparation de la commande (restaurant)
     * @param _orderId ID de la commande
     */
    function confirmPreparation(uint256 _orderId) external onlyRole(RESTAURANT_ROLE) {
        // TODO: 1. Vérifier msg.sender == orders[_orderId].restaurant
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.CREATED
        // TODO: 3. Changer orders[_orderId].status à OrderStatus.PREPARING
        // TODO: 4. Émettre event PreparationConfirmed
    }

    /**
     * @notice Assigner un livreur à la commande
     * @param _orderId ID de la commande
     * @param _deliverer Adresse du livreur
     */
    function assignDeliverer(uint256 _orderId, address payable _deliverer) external {
        // TODO: 1. Vérifier _deliverer a le rôle DELIVERER_ROLE
        // TODO: 2. Vérifier stakingContract.isStaked(_deliverer) == true
        // TODO: 3. Vérifier orders[_orderId].status == OrderStatus.PREPARING
        // TODO: 4. Vérifier orders[_orderId].deliverer == address(0)
        // TODO: 5. Assigner orders[_orderId].deliverer = _deliverer
        // TODO: 6. Changer status à OrderStatus.IN_DELIVERY
        // TODO: 7. Ajouter _orderId dans delivererOrders[_deliverer]
        // TODO: 8. Émettre event DelivererAssigned
    }

    /**
     * @notice Confirmer la récupération de la commande (livreur)
     * @param _orderId ID de la commande
     */
    function confirmPickup(uint256 _orderId) external onlyRole(DELIVERER_ROLE) {
        // TODO: 1. Vérifier msg.sender == orders[_orderId].deliverer
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.IN_DELIVERY
        // TODO: 3. Émettre event PickupConfirmed
        // Note: Le status reste IN_DELIVERY, c'est juste une confirmation intermédiaire
    }

    /**
     * @notice Confirmer la livraison + split automatique des paiements (client)
     * @param _orderId ID de la commande
     */
    function confirmDelivery(uint256 _orderId) external nonReentrant {
        // TODO: 1. Vérifier msg.sender == orders[_orderId].client
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.IN_DELIVERY
        // TODO: 3. Vérifier orders[_orderId].disputed == false
        // TODO: 4. Changer orders[_orderId].status à OrderStatus.DELIVERED
        // TODO: 5. Changer orders[_orderId].delivered à true
        // TODO: 6. Appeler paymentSplitter.splitPayment{value: totalAmount}(...)
        // TODO: 7. Calculer tokensToMint = (foodPrice / 10 ether) * 1 ether
        // TODO: 8. Appeler tokenContract.mint(client, tokensToMint)
        // TODO: 9. Émettre event DeliveryConfirmed
    }

    /**
     * @notice Ouvrir un litige sur une commande
     * @param _orderId ID de la commande
     */
    function openDispute(uint256 _orderId) external {
        // TODO: 1. Vérifier msg.sender est client, restaurant ou deliverer
        // TODO: 2. Vérifier orders[_orderId].status != OrderStatus.DELIVERED
        // TODO: 3. Vérifier orders[_orderId].disputed == false
        // TODO: 4. Changer orders[_orderId].status à OrderStatus.DISPUTED
        // TODO: 5. Changer orders[_orderId].disputed à true
        // TODO: 6. Émettre event DisputeOpened
    }

    /**
     * @notice Résoudre un litige (arbitrator)
     * @param _orderId ID de la commande
     * @param _winner Adresse du gagnant du litige
     * @param _refundPercent Pourcentage de remboursement (0-100)
     */
    function resolveDispute(
        uint256 _orderId,
        address payable _winner,
        uint256 _refundPercent
    ) external onlyRole(ARBITRATOR_ROLE) nonReentrant {
        // TODO: 1. Vérifier orders[_orderId].disputed == true
        // TODO: 2. Vérifier _winner est client, restaurant ou deliverer
        // TODO: 3. Vérifier _refundPercent entre 0 et 100
        // TODO: 4. Calculer montant à transférer selon _refundPercent
        // TODO: 5. Transférer les fonds à _winner
        // TODO: 6. Changer disputed à false
        // TODO: 7. Émettre event DisputeResolved
    }

    // === FONCTIONS VIEW ===

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getClientOrders(address _client) external view returns (uint256[] memory) {
        return clientOrders[_client];
    }

    function getRestaurantOrders(address _restaurant) external view returns (uint256[] memory) {
        return restaurantOrders[_restaurant];
    }

    function getDelivererOrders(address _deliverer) external view returns (uint256[] memory) {
        return delivererOrders[_deliverer];
    }

    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }

    // === FONCTIONS ADMIN ===

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
```

---

### Template : DonePaymentSplitter.sol

**Fichier** : `contracts/DonePaymentSplitter.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DonePaymentSplitter
 * @notice Répartition automatique des paiements (70% restaurant, 20% livreur, 10% plateforme)
 * @dev Appelé automatiquement par DoneOrderManager lors de confirmDelivery()
 */
contract DonePaymentSplitter is Ownable, ReentrancyGuard {

    // === CONSTANTES ===
    uint256 public constant RESTAURANT_PERCENT = 70;  // 70%
    uint256 public constant DELIVERER_PERCENT = 20;   // 20%
    uint256 public constant PLATFORM_PERCENT = 10;    // 10%

    // === EVENTS ===
    event PaymentSplit(
        uint256 indexed orderId,
        address indexed restaurant,
        address indexed deliverer,
        address platform,
        uint256 restaurantAmount,
        uint256 delivererAmount,
        uint256 platformAmount,
        uint256 timestamp
    );

    // === CONSTRUCTOR ===
    constructor() Ownable(msg.sender) {
        // Constructor vide, pas d'initialisation nécessaire
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Répartir le paiement entre restaurant, livreur et plateforme
     * @param _orderId ID de la commande
     * @param _restaurant Adresse du restaurant
     * @param _deliverer Adresse du livreur
     * @param _platform Adresse de la plateforme
     */
    function splitPayment(
        uint256 _orderId,
        address payable _restaurant,
        address payable _deliverer,
        address payable _platform
    ) external payable nonReentrant {
        // TODO: 1. Vérifier msg.value > 0
        // TODO: 2. Vérifier _restaurant != address(0)
        // TODO: 3. Vérifier _deliverer != address(0)
        // TODO: 4. Vérifier _platform != address(0)

        // TODO: 5. Calculer restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100
        // TODO: 6. Calculer delivererAmount = (msg.value * DELIVERER_PERCENT) / 100
        // TODO: 7. Calculer platformAmount = (msg.value * PLATFORM_PERCENT) / 100

        // TODO: 8. Transférer restaurantAmount à _restaurant via call{value}
        // TODO: 9. Transférer delivererAmount à _deliverer via call{value}
        // TODO: 10. Transférer platformAmount à _platform via call{value}

        // TODO: 11. Vérifier succès de chaque transfert (require)
        // TODO: 12. Émettre event PaymentSplit
    }
}
```


---

### Template : DoneToken.sol

**Fichier** : `contracts/DoneToken.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DoneToken
 * @notice Token ERC20 de fidélité (symbole: DONE)
 * @dev 1 DONE token par 10€ dépensés
 */
contract DoneToken is ERC20, AccessControl {

    // === RÔLES ===
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // === CONSTRUCTOR ===
    /**
     * @notice Initialise le token avec nom "DONE Token" et symbole "DONE"
     */
    constructor() ERC20("DONE Token", "DONE") {
        // TODO: 1. Configurer DEFAULT_ADMIN_ROLE pour msg.sender
        // TODO: 2. Configurer MINTER_ROLE pour msg.sender (initial)
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Mint des tokens DONE (réservé au MINTER_ROLE)
     * @param to Adresse destinataire
     * @param amount Montant à mint (en wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        // TODO: Appeler _mint(to, amount)
    }

    /**
     * @notice Burn des tokens DONE
     * @param amount Montant à burn (en wei)
     */
    function burn(uint256 amount) external {
        // TODO: Appeler _burn(msg.sender, amount)
    }

    /**
     * @notice Calculer le montant de tokens à mint pour un montant dépensé
     * @param foodPrice Prix des plats en wei
     * @return tokensToMint Montant de tokens à mint
     * @dev Formule: (foodPrice / 10 ether) * 1 ether = 1 token par 10€
     */
    function calculateReward(uint256 foodPrice) public pure returns (uint256) {
        // TODO: return (foodPrice / 10 ether) * 1 ether;
    }
}
```

---

### Template : DoneStaking.sol

**Fichier** : `contracts/DoneStaking.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DoneStaking
 * @notice Gestion du staking des livreurs (minimum 0.1 ETH)
 * @dev Protection contre les annulations abusives et fraudes
 */
contract DoneStaking is AccessControl, ReentrancyGuard {

    // === RÔLES ===
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // === CONSTANTES ===
    uint256 public constant MINIMUM_STAKE = 0.1 ether;

    // === STATE VARIABLES ===
    mapping(address => uint256) public stakedAmount;  // deliverer => montant staké
    mapping(address => bool) public isStaked;         // deliverer => est staké?

    // === EVENTS ===
    event Staked(address indexed deliverer, uint256 amount);
    event Unstaked(address indexed deliverer, uint256 amount);
    event Slashed(address indexed deliverer, uint256 amount, address platform);

    // === CONSTRUCTOR ===
    constructor() {
        // TODO: Configurer DEFAULT_ADMIN_ROLE pour msg.sender
        // TODO: Configurer PLATFORM_ROLE pour msg.sender
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Staker en tant que livreur (minimum 0.1 ETH)
     */
    function stakeAsDeliverer() external payable nonReentrant {
        // TODO: 1. Vérifier msg.value >= MINIMUM_STAKE
        // TODO: 2. Vérifier isStaked[msg.sender] == false
        // TODO: 3. Incrémenter stakedAmount[msg.sender] += msg.value
        // TODO: 4. Mettre isStaked[msg.sender] = true
        // TODO: 5. Émettre event Staked
    }

    /**
     * @notice Retirer son stake (si pas de livraison active)
     */
    function unstake() external nonReentrant {
        // TODO: 1. Vérifier isStaked[msg.sender] == true
        // TODO: 2. Capturer amount = stakedAmount[msg.sender]
        // TODO: 3. Mettre stakedAmount[msg.sender] = 0
        // TODO: 4. Mettre isStaked[msg.sender] = false
        // TODO: 5. Transférer amount à msg.sender via call{value}
        // TODO: 6. Vérifier succès du transfert
        // TODO: 7. Émettre event Unstaked
    }

    /**
     * @notice Slasher un livreur en cas d'abus (PLATFORM_ROLE uniquement)
     * @param deliverer Adresse du livreur
     * @param amount Montant à slasher
     */
    function slash(address deliverer, uint256 amount) external onlyRole(PLATFORM_ROLE) nonReentrant {
        // TODO: 1. Vérifier isStaked[deliverer] == true
        // TODO: 2. Vérifier amount <= stakedAmount[deliverer]
        // TODO: 3. Décrémenter stakedAmount[deliverer] -= amount
        // TODO: 4. Si stakedAmount[deliverer] == 0, mettre isStaked[deliverer] = false
        // TODO: 5. Transférer amount à msg.sender (platform) via call{value}
        // TODO: 6. Vérifier succès du transfert
        // TODO: 7. Émettre event Slashed
    }

    /**
     * @notice Vérifier si un livreur est staké
     * @param deliverer Adresse du livreur
     * @return bool True si staké
     */
    function isDelivererStaked(address deliverer) external view returns (bool) {
        return isStaked[deliverer];
    }

    /**
     * @notice Récupérer le montant staké d'un livreur
     * @param deliverer Adresse du livreur
     * @return uint256 Montant staké
     */
    function getStakedAmount(address deliverer) external view returns (uint256) {
        return stakedAmount[deliverer];
    }
}
```

---

### Template : hardhat.config.js

**Fichier** : `hardhat.config.js` (racine du projet)

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 6000000,
      gasPrice: 10000000000 // 10 gwei
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.POLYGON_PRIVATE_KEY ? [process.env.POLYGON_PRIVATE_KEY] : [],
      chainId: 137,
      gas: 6000000,
      gasPrice: 50000000000 // 50 gwei
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
```

**Fichier** : `.env.example` (racine du projet)

```env
# Polygon Mumbai Testnet
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_without_0x

# Polygon Mainnet (production)
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_PRIVATE_KEY=

# Etherscan/Polygonscan API (pour vérifier les contrats)
POLYGONSCAN_API_KEY=

# Network
NETWORK=mumbai
```