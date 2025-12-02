// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrderLib
 * @notice Bibliothèque de fonctions utilitaires pour gestion des commandes
 * @dev Utilisée par DoneOrderManager pour validations et calculs
 * @dev Optimisation gas : code déployé une seule fois, appelé par référence
 */
library OrderLib {

    // === ENUMS ===
    // TODO: Définir l'enum OrderStatus avec les états suivants:
    // - CREATED: Commande créée, fonds bloqués
    // - PREPARING: Restaurant confirme préparation
    // - IN_DELIVERY: Livreur en route
    // - DELIVERED: Livraison confirmée, fonds libérés
    // - DISPUTED: Litige ouvert, fonds gelés
    enum OrderStatus {
        CREATED,
        PREPARING,
        IN_DELIVERY,
        DELIVERED,
        DISPUTED
    }

    // === ERREURS CUSTOM (OPTIONNEL) ===
    // TODO: Définir des erreurs custom pour économiser du gas (optionnel)
    // error InvalidFoodPrice();
    // error InvalidDeliveryFee();
    // error InvalidStateTransition(OrderStatus current, OrderStatus target);
    // error InvalidPlatformFee();
    // error InvalidIPFSHash();
    // error AmountOverflow();

    // === FONCTIONS ===

    /**
     * @notice Valider que les montants de commande sont corrects et non-nuls
     * @dev TODO: Implémenter la validation des montants
     * - Vérifier que foodPrice > 0 avec require et message d'erreur approprié
     * - Vérifier que deliveryFee > 0 avec require et message d'erreur approprié
     * - Calculer total = foodPrice + deliveryFee
     * - Vérifier qu'il n'y a pas d'overflow: require(total >= foodPrice, "OrderLib: Amount overflow")
     * 
     * Messages d'erreur suggérés:
     * - "OrderLib: Food price must be greater than 0"
     * - "OrderLib: Delivery fee must be greater than 0"
     * - "OrderLib: Amount overflow"
     * 
     * @param foodPrice Prix des plats en wei
     * @param deliveryFee Frais de livraison en wei
     */
    function validateOrderAmount(
        uint256 foodPrice,
        uint256 deliveryFee
    ) internal pure {
        // TODO: require(foodPrice > 0, "OrderLib: Food price must be greater than 0");
        // TODO: require(deliveryFee > 0, "OrderLib: Delivery fee must be greater than 0");
        // TODO: uint256 total = foodPrice + deliveryFee;
        // TODO: require(total >= foodPrice, "OrderLib: Amount overflow");
    }

    /**
     * @notice Calculer le montant total d'une commande incluant la commission plateforme
     * @dev TODO: Implémenter le calcul du montant total
     * - Calculer platformFee = (foodPrice * platformFeePercent) / 100
     * - Calculer totalAmount = foodPrice + deliveryFee + platformFee
     * - Vérifier qu'il n'y a pas d'overflow:
     *   * require(totalAmount >= foodPrice, "OrderLib: Total amount overflow")
     *   * require(totalAmount >= deliveryFee, "OrderLib: Total amount overflow")
     * - Retourner totalAmount
     * 
     * Formule:
     * platformFee = (foodPrice * platformFeePercent) / 100
     * totalAmount = foodPrice + deliveryFee + platformFee
     * 
     * Exemple: foodPrice=100, deliveryFee=20, platformFeePercent=10
     * Result: platformFee=10, totalAmount=130
     * 
     * @param foodPrice Prix des plats en wei
     * @param deliveryFee Frais de livraison en wei
     * @param platformFeePercent Pourcentage de commission (ex: 10 pour 10%)
     * @return totalAmount Montant total calculé
     */
    function calculateTotalAmount(
        uint256 foodPrice,
        uint256 deliveryFee,
        uint256 platformFeePercent
    ) internal pure returns (uint256) {
        // TODO: uint256 platformFee = (foodPrice * platformFeePercent) / 100;
        // TODO: uint256 totalAmount = foodPrice + deliveryFee + platformFee;
        // TODO: require(totalAmount >= foodPrice, "OrderLib: Total amount overflow");
        // TODO: require(totalAmount >= deliveryFee, "OrderLib: Total amount overflow");
        // TODO: return totalAmount;
    }

    /**
     * @notice Vérifier qu'une transition d'état est valide selon le workflow
     * @dev TODO: Implémenter la validation des transitions d'état
     * 
     * Transitions valides:
     * - CREATED → PREPARING (restaurant confirme)
     * - CREATED → DISPUTED (litige possible)
     * - PREPARING → IN_DELIVERY (livreur assigné)
     * - PREPARING → DISPUTED (litige possible)
     * - IN_DELIVERY → DELIVERED (livraison confirmée)
     * - IN_DELIVERY → DISPUTED (litige possible)
     * 
     * Transitions invalides:
     * - DELIVERED → aucun état (état final)
     * - DISPUTED → aucun état (résolu par arbitrator uniquement)
     * 
     * Logique à implémenter:
     * 1. Vérifier que currentStatus != DELIVERED (aucune transition depuis DELIVERED)
     * 2. Si currentStatus == CREATED:
     *    - newStatus doit être PREPARING ou DISPUTED
     * 3. Si currentStatus == PREPARING:
     *    - newStatus doit être IN_DELIVERY ou DISPUTED
     * 4. Si currentStatus == IN_DELIVERY:
     *    - newStatus doit être DELIVERED ou DISPUTED
     * 5. Si currentStatus == DISPUTED:
     *    - revert (résolu par arbitrator uniquement)
     * 
     * Messages d'erreur suggérés:
     * - "OrderLib: Cannot transition from DELIVERED"
     * - "OrderLib: Invalid transition from CREATED"
     * - "OrderLib: Invalid transition from PREPARING"
     * - "OrderLib: Invalid transition from IN_DELIVERY"
     * - "OrderLib: Disputed orders cannot transition"
     * 
     * @param currentStatus État actuel de la commande
     * @param newStatus Nouvel état souhaité
     */
    function validateStateTransition(
        OrderStatus currentStatus,
        OrderStatus newStatus
    ) internal pure {
        // TODO: Vérifier que currentStatus != DELIVERED
        // TODO: require(currentStatus != OrderStatus.DELIVERED, "OrderLib: Cannot transition from DELIVERED");
        
        // TODO: Si currentStatus == CREATED
        // TODO:   require(newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.DISPUTED, "OrderLib: Invalid transition from CREATED");
        
        // TODO: Sinon si currentStatus == PREPARING
        // TODO:   require(newStatus == OrderStatus.IN_DELIVERY || newStatus == OrderStatus.DISPUTED, "OrderLib: Invalid transition from PREPARING");
        
        // TODO: Sinon si currentStatus == IN_DELIVERY
        // TODO:   require(newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.DISPUTED, "OrderLib: Invalid transition from IN_DELIVERY");
        
        // TODO: Sinon si currentStatus == DISPUTED
        // TODO:   revert("OrderLib: Disputed orders cannot transition");
    }

    /**
     * @notice Calculer la commission plateforme sur le prix des plats
     * @dev TODO: Implémenter le calcul de la commission
     * - Vérifier que feePercent <= 100 (pourcentage valide)
     * - Vérifier que feePercent > 0 (pourcentage non nul)
     * - Calculer platformFee = (foodPrice * feePercent) / 100
     * - Retourner platformFee
     * 
     * Messages d'erreur suggérés:
     * - "OrderLib: Fee percent cannot exceed 100"
     * - "OrderLib: Fee percent must be > 0"
     * 
     * Exemple: foodPrice=100 ether, feePercent=10
     * Result: 10 ether (10% de 100)
     * 
     * @param foodPrice Prix des plats en wei
     * @param feePercent Pourcentage de commission (ex: 10 pour 10%)
     * @return platformFee Commission calculée en wei
     */
    function calculatePlatformFee(
        uint256 foodPrice,
        uint256 feePercent
    ) internal pure returns (uint256) {
        // TODO: require(feePercent <= 100, "OrderLib: Fee percent cannot exceed 100");
        // TODO: require(feePercent > 0, "OrderLib: Fee percent must be > 0");
        // TODO: uint256 platformFee = (foodPrice * feePercent) / 100;
        // TODO: return platformFee;
    }

    /**
     * @notice Vérifier qu'un hash IPFS est valide (non vide et longueur minimale)
     * @dev TODO: Implémenter la validation du hash IPFS
     * - Convertir ipfsHash en bytes: bytes memory hashBytes = bytes(ipfsHash)
     * - Vérifier que hashBytes.length > 0 (non vide)
     * - Vérifier que hashBytes.length >= 46 (longueur minimale pour CIDv0 "Qm" + 44 chars)
     * - Retourner true si valide, false sinon
     * 
     * Note: Les hash IPFS typiquement commencent par:
     * - "Qm" (CIDv0) - 46 caractères minimum
     * - "bafy" (CIDv1) - plus long
     * 
     * @param ipfsHash Hash IPFS à valider
     * @return bool True si le hash est valide, false sinon
     */
    function isValidIPFSHash(string memory ipfsHash) internal pure returns (bool) {
        // TODO: bytes memory hashBytes = bytes(ipfsHash);
        // TODO: if (hashBytes.length == 0) return false;
        // TODO: if (hashBytes.length < 46) return false;  // Minimum pour CIDv0
        // TODO: return true;
    }
}

