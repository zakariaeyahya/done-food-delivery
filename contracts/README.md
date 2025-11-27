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

## Déploiement

Les contrats doivent être déployés dans l'ordre suivant :
1. DoneToken.sol
2. DonePaymentSplitter.sol
3. DoneStaking.sol
4. DoneOrderManager.sol (utilise les adresses des contrats précédents)

Utiliser le script `scripts/deploy-all.js` pour un déploiement automatique.

