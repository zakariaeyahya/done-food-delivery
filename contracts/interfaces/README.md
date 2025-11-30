# Dossier contracts/interfaces/

Ce dossier contient les interfaces Solidity qui définissent les contrats standards pour faciliter les interactions cross-contracts et améliorer la modularité du système.

## Structure

```
contracts/interfaces/
├── IOrderManager.sol
└── IPaymentSplitter.sol
```

## Pourquoi utiliser des Interfaces ?

Les interfaces Solidity offrent plusieurs avantages :

**Modularité** :
- Séparer définition (interface) de l'implémentation (contrat)
- Permet de changer l'implémentation sans casser les contrats qui l'utilisent
- Facilite les upgrades et la maintenance

**Standardisation** :
- Garantit que les contrats respectent un certain format
- Facilite l'intégration avec d'autres contrats
- Documentation claire des fonctions disponibles

**Type Safety** :
- Solidity vérifie que le contrat implémente bien toutes les fonctions
- Évite les erreurs d'appel de fonctions inexistantes
- Compile-time checking

**Testabilité** :
- Permet de créer des mocks facilement
- Tests unitaires plus simples
- Isolation des dépendances

---

## IPaymentSplitter.sol

**Rôle** : Interface pour le contrat DonePaymentSplitter qui gère la répartition automatique des paiements (70% restaurant, 20% livreur, 10% plateforme).

### Définition de l'Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentSplitter
 * @notice Interface pour la répartition automatique des paiements
 * @dev Utilisée par DoneOrderManager pour appeler le splitter
 */
interface IPaymentSplitter {

    // === EVENTS ===

    /**
     * @dev Émis lorsqu'un paiement est réparti
     * @param orderId ID de la commande
     * @param restaurant Adresse du restaurant
     * @param deliverer Adresse du livreur
     * @param platform Adresse de la plateforme
     * @param restaurantAmount Montant reçu par le restaurant
     * @param delivererAmount Montant reçu par le livreur
     * @param platformAmount Montant reçu par la plateforme
     * @param timestamp Timestamp de la transaction
     */
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

    // === FONCTIONS ===

    /**
     * @notice Répartir le paiement entre restaurant, livreur et plateforme
     * @dev Doit être appelé avec msg.value contenant le montant total
     * @param orderId ID de la commande
     * @param restaurant Adresse payable du restaurant (70%)
     * @param deliverer Adresse payable du livreur (20%)
     * @param platform Adresse payable de la plateforme (10%)
     *
     * Requirements:
     * - msg.value > 0
     * - restaurant, deliverer, platform != address(0)
     * - Transferts doivent réussir
     *
     * Emits: PaymentSplit event
     */
    function splitPayment(
        uint256 orderId,
        address payable restaurant,
        address payable deliverer,
        address payable platform
    ) external payable;

    /**
     * @notice Récupérer le pourcentage de commission du restaurant
     * @dev Constante : 70% (7000 basis points)
     * @return uint256 Pourcentage en basis points (10000 = 100%)
     */
    function RESTAURANT_PERCENT() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission du livreur
     * @dev Constante : 20% (2000 basis points)
     * @return uint256 Pourcentage en basis points
     */
    function DELIVERER_PERCENT() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission de la plateforme
     * @dev Constante : 10% (1000 basis points)
     * @return uint256 Pourcentage en basis points
     */
    function PLATFORM_PERCENT() external view returns (uint256);
}
```

### Utilisation dans DoneOrderManager

```solidity
import "./interfaces/IPaymentSplitter.sol";

contract DoneOrderManager {
    IPaymentSplitter public paymentSplitter;

    constructor(address _paymentSplitterAddress) {
        paymentSplitter = IPaymentSplitter(_paymentSplitterAddress);
    }

    function confirmDelivery(uint256 orderId) external {
        Order storage order = orders[orderId];

        // ... validations ...

        // Appel du splitter via l'interface
        paymentSplitter.splitPayment{value: order.totalAmount}(
            orderId,
            order.restaurant,
            order.deliverer,
            platformAddress
        );

        // ... reste du code ...
    }
}
```

### Avantages

**Flexibilité** :
- On peut changer l'implémentation de DonePaymentSplitter sans toucher à DoneOrderManager
- Permet de tester avec un mock PaymentSplitter
- Facilite les upgrades

**Sécurité** :
- Type checking au compile-time
- Garantit que toutes les fonctions requises existent
- Évite les erreurs de typo dans les noms de fonctions

---

## IOrderManager.sol

**Rôle** : Interface pour le contrat DoneOrderManager qui gère le cycle de vie complet des commandes.

### Définition de l'Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOrderManager
 * @notice Interface pour la gestion du cycle de vie des commandes
 * @dev Définit les fonctions essentielles du contrat DoneOrderManager
 */
interface IOrderManager {

    // === ENUMS ===

    enum OrderStatus {
        CREATED,      // Commande créée, fonds bloqués
        PREPARING,    // Restaurant confirme préparation
        IN_DELIVERY,  // Livreur en route
        DELIVERED,    // Livraison confirmée, fonds libérés
        DISPUTED      // Litige ouvert, fonds gelés
    }

    // === STRUCTS ===

    struct Order {
        uint256 id;
        address payable client;
        address payable restaurant;
        address payable deliverer;
        uint256 foodPrice;
        uint256 deliveryFee;
        uint256 platformFee;
        uint256 totalAmount;
        OrderStatus status;
        string ipfsHash;
        uint256 createdAt;
        bool disputed;
        bool delivered;
    }

    // === EVENTS ===

    event OrderCreated(
        uint256 indexed orderId,
        address indexed client,
        address indexed restaurant,
        uint256 totalAmount
    );

    event PreparationConfirmed(
        uint256 indexed orderId,
        address indexed restaurant
    );

    event DelivererAssigned(
        uint256 indexed orderId,
        address indexed deliverer
    );

    event PickupConfirmed(
        uint256 indexed orderId,
        address indexed deliverer
    );

    event DeliveryConfirmed(
        uint256 indexed orderId,
        address indexed client
    );

    event DisputeOpened(
        uint256 indexed orderId,
        address indexed opener
    );

    event DisputeResolved(
        uint256 indexed orderId,
        address winner,
        uint256 amount
    );

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Créer une nouvelle commande
     * @param restaurant Adresse du restaurant
     * @param foodPrice Prix des plats
     * @param deliveryFee Frais de livraison
     * @param ipfsHash Hash IPFS des détails
     * @return orderId ID de la commande créée
     */
    function createOrder(
        address payable restaurant,
        uint256 foodPrice,
        uint256 deliveryFee,
        string memory ipfsHash
    ) external payable returns (uint256);

    /**
     * @notice Confirmer préparation (restaurant)
     * @param orderId ID de la commande
     */
    function confirmPreparation(uint256 orderId) external;

    /**
     * @notice Assigner un livreur
     * @param orderId ID de la commande
     * @param deliverer Adresse du livreur
     */
    function assignDeliverer(uint256 orderId, address payable deliverer) external;

    /**
     * @notice Confirmer récupération (livreur)
     * @param orderId ID de la commande
     */
    function confirmPickup(uint256 orderId) external;

    /**
     * @notice Confirmer livraison (client)
     * @param orderId ID de la commande
     */
    function confirmDelivery(uint256 orderId) external;

    /**
     * @notice Ouvrir un litige
     * @param orderId ID de la commande
     */
    function openDispute(uint256 orderId) external;

    /**
     * @notice Résoudre un litige (arbitrator)
     * @param orderId ID de la commande
     * @param winner Adresse du gagnant
     * @param refundPercent Pourcentage de remboursement (0-100)
     */
    function resolveDispute(
        uint256 orderId,
        address payable winner,
        uint256 refundPercent
    ) external;

    // === FONCTIONS VIEW ===

    /**
     * @notice Récupérer une commande
     * @param orderId ID de la commande
     * @return Order Détails de la commande
     */
    function getOrder(uint256 orderId) external view returns (Order memory);

    /**
     * @notice Récupérer les commandes d'un client
     * @param client Adresse du client
     * @return uint256[] Array d'orderIds
     */
    function getClientOrders(address client) external view returns (uint256[] memory);

    /**
     * @notice Récupérer les commandes d'un restaurant
     * @param restaurant Adresse du restaurant
     * @return uint256[] Array d'orderIds
     */
    function getRestaurantOrders(address restaurant) external view returns (uint256[] memory);

    /**
     * @notice Récupérer les commandes d'un livreur
     * @param deliverer Adresse du livreur
     * @return uint256[] Array d'orderIds
     */
    function getDelivererOrders(address deliverer) external view returns (uint256[] memory);

    /**
     * @notice Récupérer le nombre total de commandes
     * @return uint256 Compteur de commandes
     */
    function getTotalOrders() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission plateforme
     * @return uint256 Pourcentage (ex: 10 pour 10%)
     */
    function PLATFORM_FEE_PERCENT() external view returns (uint256);
}
```

### Utilisation dans d'autres contrats

```solidity
import "./interfaces/IOrderManager.sol";

contract DoneAnalytics {
    IOrderManager public orderManager;

    constructor(address _orderManagerAddress) {
        orderManager = IOrderManager(_orderManagerAddress);
    }

    function getOrderStats() external view returns (uint256) {
        // Utiliser l'interface pour accéder aux données
        uint256 totalOrders = orderManager.getTotalOrders();
        return totalOrders;
    }

    function getClientOrderCount(address client) external view returns (uint256) {
        uint256[] memory orders = orderManager.getClientOrders(client);
        return orders.length;
    }
}
```

### Utilisation dans le Backend

```javascript
// backend/services/blockchainService.js
const IOrderManagerABI = require('../abis/IOrderManager.json');

const orderManager = new ethers.Contract(
  orderManagerAddress,
  IOrderManagerABI,
  provider
);

// Appeler les fonctions via l'interface
const order = await orderManager.getOrder(orderId);
const totalOrders = await orderManager.getTotalOrders();
```

---

## Templates Complets

### Template : IPaymentSplitter.sol

**Fichier** : `contracts/interfaces/IPaymentSplitter.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentSplitter {
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

    // === FONCTIONS ===

    /**
     * @notice Répartir paiement (70/20/10)
     */
    function splitPayment(
        uint256 orderId,
        address payable restaurant,
        address payable deliverer,
        address payable platform
    ) external payable;

    /**
     * @notice Pourcentage restaurant (70%)
     */
    function RESTAURANT_PERCENT() external view returns (uint256);

    /**
     * @notice Pourcentage livreur (20%)
     */
    function DELIVERER_PERCENT() external view returns (uint256);

    /**
     * @notice Pourcentage plateforme (10%)
     */
    function PLATFORM_PERCENT() external view returns (uint256);
}
```

**Instructions** :
1. Copier dans `contracts/interfaces/IPaymentSplitter.sol`
2. Aucune implémentation nécessaire (interface = signatures uniquement)
3. Importer dans les contrats qui utilisent PaymentSplitter

---

### Template : IOrderManager.sol

**Fichier** : `contracts/interfaces/IOrderManager.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOrderManager {
    // === ENUMS ===
    enum OrderStatus { CREATED, PREPARING, IN_DELIVERY, DELIVERED, DISPUTED }

    // === STRUCTS ===
    struct Order {
        uint256 id;
        address payable client;
        address payable restaurant;
        address payable deliverer;
        uint256 foodPrice;
        uint256 deliveryFee;
        uint256 platformFee;
        uint256 totalAmount;
        OrderStatus status;
        string ipfsHash;
        uint256 createdAt;
        bool disputed;
        bool delivered;
    }

    // === EVENTS ===
    event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
    event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
    event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
    event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
    event DisputeOpened(uint256 indexed orderId, address indexed opener);
    event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    // === FONCTIONS ===
    function createOrder(address payable restaurant, uint256 foodPrice, uint256 deliveryFee, string memory ipfsHash) external payable returns (uint256);
    function confirmPreparation(uint256 orderId) external;
    function assignDeliverer(uint256 orderId, address payable deliverer) external;
    function confirmPickup(uint256 orderId) external;
    function confirmDelivery(uint256 orderId) external;
    function openDispute(uint256 orderId) external;
    function resolveDispute(uint256 orderId, address payable winner, uint256 refundPercent) external;

    // === VIEW FUNCTIONS ===
    function getOrder(uint256 orderId) external view returns (Order memory);
    function getClientOrders(address client) external view returns (uint256[] memory);
    function getRestaurantOrders(address restaurant) external view returns (uint256[] memory);
    function getDelivererOrders(address deliverer) external view returns (uint256[] memory);
    function getTotalOrders() external view returns (uint256);
    function PLATFORM_FEE_PERCENT() external view returns (uint256);
}
```

**Instructions** :
1. Copier dans `contracts/interfaces/IOrderManager.sol`
2. Aucune implémentation nécessaire
3. Importer dans les contrats tiers qui interagissent avec OrderManager

---

## Génération ABI

Les interfaces génèrent automatiquement des ABIs (Application Binary Interface) lors de la compilation.

**Utilisation** :

```bash
# Compiler les contrats
npx hardhat compile

# Les ABIs sont générés dans artifacts/contracts/interfaces/
```

**Export pour Backend** :

```javascript
// scripts/export-abis.js
const fs = require('fs');
const path = require('path');

// Exporter IOrderManager ABI
const IOrderManagerArtifact = require('../artifacts/contracts/interfaces/IOrderManager.sol/IOrderManager.json');
fs.writeFileSync(
  path.join(__dirname, '../backend/abis/IOrderManager.json'),
  JSON.stringify(IOrderManagerArtifact.abi, null, 2)
);

// Exporter IPaymentSplitter ABI
const IPaymentSplitterArtifact = require('../artifacts/contracts/interfaces/IPaymentSplitter.sol/IPaymentSplitter.json');
fs.writeFileSync(
  path.join(__dirname, '../backend/abis/IPaymentSplitter.json'),
  JSON.stringify(IPaymentSplitterArtifact.abi, null, 2)
);

console.log('ABIs exportés avec succès');
```

---

## Avantages des Interfaces

| Aspect | Avec Interface | Sans Interface |
|--------|----------------|----------------|
| **Couplage** | Faible (modulaire) | Fort (dépendance directe) |
| **Testabilité** | Facile (mocks) | Difficile |
| **Upgradabilité** | Simple (proxy pattern) | Complexe |
| **Documentation** | Auto-documenté | Manuelle |
| **Type Safety** | Compile-time | Runtime errors |
| **Gas Cost** | 0 gas (interface) | 0 gas |

---

## Best Practices

✅ **À faire** :
- Utiliser interfaces pour tous les contrats externes
- Documenter chaque fonction avec NatSpec
- Définir events dans l'interface
- Versionner les interfaces (IOrderManagerV1, V2, etc.)

❌ **À éviter** :
- Implémenter logique dans une interface (impossible de toute façon)
- Importer contrats complets quand interface suffit
- Changer signature de fonction dans interface (breaking change)

---

## Tests Recommandés

```javascript
// test/interfaces.test.js
describe("Interfaces", function() {
  it("DoneOrderManager should implement IOrderManager", async function() {
    const OrderManager = await ethers.getContractFactory("DoneOrderManager");
    const orderManager = await OrderManager.deploy(...);

    // Vérifier que toutes les fonctions existent
    expect(orderManager.createOrder).to.exist;
    expect(orderManager.confirmDelivery).to.exist;
    expect(orderManager.getOrder).to.exist;
  });

  it("DonePaymentSplitter should implement IPaymentSplitter", async function() {
    const PaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
    const splitter = await PaymentSplitter.deploy();

    expect(splitter.splitPayment).to.exist;
    expect(await splitter.RESTAURANT_PERCENT()).to.equal(70);
  });
});
```

---
