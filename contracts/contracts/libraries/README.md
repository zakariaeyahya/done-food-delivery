# Dossier contracts/libraries/

Ce dossier contient les bibliothèques Solidity réutilisables qui fournissent des fonctions utilitaires pour optimiser le gas et éviter la duplication de code.

## Structure

```
contracts/libraries/
└── OrderLib.sol
```

---

## OrderLib.sol

**Rôle** : Bibliothèque de fonctions utilitaires pour la gestion et validation des commandes.

### Pourquoi une bibliothèque ?

Les bibliothèques Solidity permettent :
- **Réutilisation du code** : Partagé entre plusieurs contrats
- **Optimisation gas** : Code déployé une seule fois, appelé par référence
- **Organisation** : Séparer logique utilitaire du contrat principal
- **Type safety** : Fonctions attachées aux types Solidity

### Imports

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
```

### Enums utilisés

```solidity
enum OrderStatus {
    CREATED,
    PREPARING,
    IN_DELIVERY,
    DELIVERED,
    DISPUTED
}
```

---

## Fonctions

### 1. validateOrderAmount(uint256 foodPrice, uint256 deliveryFee)

**Rôle** : Valider que les montants de commande sont corrects et non-nuls.

**Paramètres** :
- `foodPrice` : Prix des plats en wei
- `deliveryFee` : Frais de livraison en wei

**Validations** :
- foodPrice doit être > 0
- deliveryFee doit être > 0
- Somme totale ne doit pas overflow

**Pseudo-code** :
```solidity
function validateOrderAmount(
    uint256 foodPrice,
    uint256 deliveryFee
) internal pure {
    require(foodPrice > 0, "OrderLib: Food price must be greater than 0");
    require(deliveryFee > 0, "OrderLib: Delivery fee must be greater than 0");

    // Check overflow protection
    uint256 total = foodPrice + deliveryFee;
    require(total >= foodPrice, "OrderLib: Amount overflow");
}
```

**Utilisation** :
```solidity
import "./libraries/OrderLib.sol";

contract DoneOrderManager {
    function createOrder(...) external {
        OrderLib.validateOrderAmount(foodPrice, deliveryFee);
        // Continue...
    }
}
```

---

### 2. calculateTotalAmount(uint256 foodPrice, uint256 deliveryFee, uint256 platformFeePercent)

**Rôle** : Calculer le montant total d'une commande incluant la commission plateforme.

**Paramètres** :
- `foodPrice` : Prix des plats en wei
- `deliveryFee` : Frais de livraison en wei
- `platformFeePercent` : Pourcentage de commission (ex: 10 pour 10%)

**Returns** : `uint256 totalAmount`

**Formule** :
```
platformFee = (foodPrice * platformFeePercent) / 100
totalAmount = foodPrice + deliveryFee + platformFee
```

**Pseudo-code** :
```solidity
function calculateTotalAmount(
    uint256 foodPrice,
    uint256 deliveryFee,
    uint256 platformFeePercent
) internal pure returns (uint256) {
    // Calculate platform fee (10% of food price)
    uint256 platformFee = (foodPrice * platformFeePercent) / 100;

    // Sum all components
    uint256 totalAmount = foodPrice + deliveryFee + platformFee;

    // Check no overflow occurred
    require(totalAmount >= foodPrice, "OrderLib: Total amount overflow");
    require(totalAmount >= deliveryFee, "OrderLib: Total amount overflow");

    return totalAmount;
}
```

**Exemple** :
```solidity
uint256 total = OrderLib.calculateTotalAmount(
    100 ether,  // foodPrice
    20 ether,   // deliveryFee
    10          // 10% platform fee
);
// Result: 100 + 20 + 10 = 130 ether
```

---

### 3. validateStateTransition(OrderStatus currentStatus, OrderStatus newStatus)

**Rôle** : Vérifier qu'une transition d'état est valide selon le workflow.

**Paramètres** :
- `currentStatus` : État actuel de la commande
- `newStatus` : Nouvel état souhaité

**Transitions valides** :
```
CREATED → PREPARING
PREPARING → IN_DELIVERY
IN_DELIVERY → DELIVERED
Tout état → DISPUTED (sauf DELIVERED)
```

**Pseudo-code** :
```solidity
function validateStateTransition(
    OrderStatus currentStatus,
    OrderStatus newStatus
) internal pure {
    // Cannot transition from DELIVERED
    require(
        currentStatus != OrderStatus.DELIVERED,
        "OrderLib: Cannot transition from DELIVERED"
    );

    // CREATED can only go to PREPARING or DISPUTED
    if (currentStatus == OrderStatus.CREATED) {
        require(
            newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.DISPUTED,
            "OrderLib: Invalid transition from CREATED"
        );
    }

    // PREPARING can only go to IN_DELIVERY or DISPUTED
    else if (currentStatus == OrderStatus.PREPARING) {
        require(
            newStatus == OrderStatus.IN_DELIVERY || newStatus == OrderStatus.DISPUTED,
            "OrderLib: Invalid transition from PREPARING"
        );
    }

    // IN_DELIVERY can only go to DELIVERED or DISPUTED
    else if (currentStatus == OrderStatus.IN_DELIVERY) {
        require(
            newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.DISPUTED,
            "OrderLib: Invalid transition from IN_DELIVERY"
        );
    }

    // DISPUTED cannot transition (resolved by arbitrator only)
    else if (currentStatus == OrderStatus.DISPUTED) {
        revert("OrderLib: Disputed orders cannot transition");
    }
}
```

**Utilisation** :
```solidity
function confirmPreparation(uint256 orderId) external {
    Order storage order = orders[orderId];

    // Validate transition
    OrderLib.validateStateTransition(
        order.status,
        OrderStatus.PREPARING
    );

    // Update status
    order.status = OrderStatus.PREPARING;
}
```

---

### 4. calculatePlatformFee(uint256 foodPrice, uint256 feePercent)

**Rôle** : Calculer la commission plateforme sur le prix des plats.

**Paramètres** :
- `foodPrice` : Prix des plats en wei
- `feePercent` : Pourcentage de commission (ex: 10 pour 10%)

**Returns** : `uint256 platformFee`

**Pseudo-code** :
```solidity
function calculatePlatformFee(
    uint256 foodPrice,
    uint256 feePercent
) internal pure returns (uint256) {
    require(feePercent <= 100, "OrderLib: Fee percent cannot exceed 100");
    require(feePercent > 0, "OrderLib: Fee percent must be > 0");

    uint256 platformFee = (foodPrice * feePercent) / 100;

    return platformFee;
}
```

**Exemple** :
```solidity
uint256 fee = OrderLib.calculatePlatformFee(100 ether, 10);
// Result: 10 ether (10% of 100)
```

---

### 5. isValidIPFSHash(string memory ipfsHash)

**Rôle** : Vérifier qu'un hash IPFS est valide (non vide).

**Paramètres** :
- `ipfsHash` : Hash IPFS à valider

**Returns** : `bool` (true si valide)

**Pseudo-code** :
```solidity
function isValidIPFSHash(string memory ipfsHash) internal pure returns (bool) {
    // Check not empty
    bytes memory hashBytes = bytes(ipfsHash);

    if (hashBytes.length == 0) {
        return false;
    }

    // IPFS hashes typically start with "Qm" (CIDv0) or "bafy" (CIDv1)
    // Minimum length check
    if (hashBytes.length < 46) {  // Qm + 44 chars
        return false;
    }

    return true;
}
```

**Utilisation** :
```solidity
function createOrder(..., string memory ipfsHash) external {
    require(
        OrderLib.isValidIPFSHash(ipfsHash),
        "Invalid IPFS hash"
    );
    // Continue...
}
```

---

## Template Complet : OrderLib.sol

**Fichier** : `contracts/libraries/OrderLib.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrderLib
 * @notice Bibliothèque de fonctions utilitaires pour gestion des commandes
 * @dev Utilisée par DoneOrderManager pour validations et calculs
 */
library OrderLib {

    // === ENUMS ===
    enum OrderStatus {
        CREATED,
        PREPARING,
        IN_DELIVERY,
        DELIVERED,
        DISPUTED
    }

    // === ERREURS CUSTOM ===
    error InvalidFoodPrice();
    error InvalidDeliveryFee();
    error InvalidStateTransition(OrderStatus current, OrderStatus target);
    error InvalidPlatformFee();
    error InvalidIPFSHash();
    error AmountOverflow();

    // === FONCTIONS ===

    /**
     * @notice Valider montants de commande
     * @param foodPrice Prix des plats
     * @param deliveryFee Frais de livraison
     */
    function validateOrderAmount(
        uint256 foodPrice,
        uint256 deliveryFee
    ) internal pure {
        require(foodPrice > 0, "OrderLib: Food price must be greater than 0");
        require(deliveryFee > 0, "OrderLib: Delivery fee must be greater than 0");

        // Check overflow protection
        uint256 total = foodPrice + deliveryFee;
        require(total >= foodPrice, "OrderLib: Amount overflow");
    }

    /**
     * @notice Calculer montant total avec commission
     * @param foodPrice Prix des plats
     * @param deliveryFee Frais de livraison
     * @param platformFeePercent Pourcentage commission (10 = 10%)
     * @return totalAmount Montant total
     */
    function calculateTotalAmount(
        uint256 foodPrice,
        uint256 deliveryFee,
        uint256 platformFeePercent
    ) internal pure returns (uint256) {
        // Calculate platform fee (10% of food price)
        uint256 platformFee = (foodPrice * platformFeePercent) / 100;

        // Sum all components
        uint256 totalAmount = foodPrice + deliveryFee + platformFee;

        // Check no overflow occurred
        require(totalAmount >= foodPrice, "OrderLib: Total amount overflow");
        require(totalAmount >= deliveryFee, "OrderLib: Total amount overflow");

        return totalAmount;
    }

    /**
     * @notice Valider transition d'état
     * @param currentStatus État actuel
     * @param newStatus Nouvel état
     */
    function validateStateTransition(
        OrderStatus currentStatus,
        OrderStatus newStatus
    ) internal pure {
        // Cannot transition from DELIVERED
        require(
            currentStatus != OrderStatus.DELIVERED,
            "OrderLib: Cannot transition from DELIVERED"
        );

        // CREATED can only go to PREPARING or DISPUTED
        if (currentStatus == OrderStatus.CREATED) {
            require(
                newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from CREATED"
            );
        }

        // PREPARING can only go to IN_DELIVERY or DISPUTED
        else if (currentStatus == OrderStatus.PREPARING) {
            require(
                newStatus == OrderStatus.IN_DELIVERY || newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from PREPARING"
            );
        }

        // IN_DELIVERY can only go to DELIVERED or DISPUTED
        else if (currentStatus == OrderStatus.IN_DELIVERY) {
            require(
                newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from IN_DELIVERY"
            );
        }

        // DISPUTED cannot transition (resolved by arbitrator only)
        else if (currentStatus == OrderStatus.DISPUTED) {
            revert("OrderLib: Disputed orders cannot transition");
        }
    }

    /**
     * @notice Calculer commission plateforme
     * @param foodPrice Prix des plats
     * @param feePercent Pourcentage (10 = 10%)
     * @return platformFee Commission calculée
     */
    function calculatePlatformFee(
        uint256 foodPrice,
        uint256 feePercent
    ) internal pure returns (uint256) {
        require(feePercent <= 100, "OrderLib: Fee percent cannot exceed 100");
        require(feePercent > 0, "OrderLib: Fee percent must be > 0");

        uint256 platformFee = (foodPrice * feePercent) / 100;

        return platformFee;
    }

    /**
     * @notice Vérifier validité hash IPFS
     * @param ipfsHash Hash à valider
     * @return bool True si valide
     */
    function isValidIPFSHash(string memory ipfsHash) internal pure returns (bool) {
        // Check not empty
        bytes memory hashBytes = bytes(ipfsHash);

        if (hashBytes.length == 0) {
            return false;
        }

        // IPFS hashes typically start with "Qm" (CIDv0) or "bafy" (CIDv1)
        // Minimum length check
        if (hashBytes.length < 46) {  // Qm + 44 chars
            return false;
        }

        return true;
    }
}
```

---

## Avantages de OrderLib

**Optimisation Gas** :
- Code bibliothèque déployé une seule fois
- Appelé via DELEGATECALL (pas de duplication)
- Économie ~20-30% de gas vs code inline

**Maintenabilité** :
- Logique centralisée
- Facile à tester unitairement
- Réutilisable dans futurs contrats

**Lisibilité** :
- Contrat principal plus court
- Séparation des responsabilités
- Noms de fonctions explicites

**Exemple d'économie gas** :
```
Sans bibliothèque (code dupliqué) : ~150,000 gas
Avec bibliothèque OrderLib : ~120,000 gas
Économie : 30,000 gas (~20%)
```

---

## Tests Recommandés

Créer `test/OrderLib.test.js` :

```javascript
describe("OrderLib", function() {
  it("should validate order amounts correctly", async function() {
    // Test validateOrderAmount
  });

  it("should calculate total amount with platform fee", async function() {
    // Test calculateTotalAmount
  });

  it("should validate state transitions", async function() {
    // Test validateStateTransition
  });

  it("should revert on invalid transitions", async function() {
    // Test cas d'erreur
  });
});
```

---

## Gas Estimation

| Fonction | Gas (approx) |
|----------|--------------|
| validateOrderAmount() | ~5,000 |
| calculateTotalAmount() | ~8,000 |
| validateStateTransition() | ~10,000 |
| calculatePlatformFee() | ~3,000 |
| isValidIPFSHash() | ~5,000 |

**Total overhead** : ~30,000 gas par commande (négligeable comparé au coût total ~200,000 gas)
