// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrderLib
 * @notice Bibliothèque utilitaire pour gestion des commandes
 * @dev Optimisation gas : code déployé une seule fois, appelé par référence
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

    // === FONCTIONS ===

    /**
     * @notice Valider que les montants de commande sont corrects et non-nuls
     */
    function validateOrderAmount(
        uint256 foodPrice,
        uint256 deliveryFee
    ) internal pure {
        require(foodPrice > 0, "OrderLib: Food price must be greater than 0");
        require(deliveryFee > 0, "OrderLib: Delivery fee must be greater than 0");

        uint256 total = foodPrice + deliveryFee;
        require(total >= foodPrice, "OrderLib: Amount overflow");
    }

    /**
     * @notice Calculer le montant total incluant la commission plateforme
     */
    function calculateTotalAmount(
        uint256 foodPrice,
        uint256 deliveryFee,
        uint256 platformFeePercent
    ) internal pure returns (uint256) {
        uint256 platformFee = (foodPrice * platformFeePercent) / 100;
        uint256 totalAmount = foodPrice + deliveryFee + platformFee;

        require(totalAmount >= foodPrice, "OrderLib: Total amount overflow");
        require(totalAmount >= deliveryFee, "OrderLib: Total amount overflow");

        return totalAmount;
    }

    /**
     * @notice Vérifier qu'une transition d'état est valide selon le workflow
     */
    function validateStateTransition(
        OrderStatus currentStatus,
        OrderStatus newStatus
    ) internal pure {
        
        // État final : aucune transition possible
        require(
            currentStatus != OrderStatus.DELIVERED,
            "OrderLib: Cannot transition from DELIVERED"
        );

        // Disputed : ne peut pas changer d’état sans arbitrage externe
        if (currentStatus == OrderStatus.DISPUTED) {
            revert("OrderLib: Disputed orders cannot transition");
        }

        // CREATED → PREPARING ou DISPUTED
        if (currentStatus == OrderStatus.CREATED) {
            require(
                newStatus == OrderStatus.PREPARING ||
                newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from CREATED"
            );
            return;
        }

        // PREPARING → IN_DELIVERY ou DISPUTED
        if (currentStatus == OrderStatus.PREPARING) {
            require(
                newStatus == OrderStatus.IN_DELIVERY ||
                newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from PREPARING"
            );
            return;
        }

        // IN_DELIVERY → DELIVERED ou DISPUTED
        if (currentStatus == OrderStatus.IN_DELIVERY) {
            require(
                newStatus == OrderStatus.DELIVERED ||
                newStatus == OrderStatus.DISPUTED,
                "OrderLib: Invalid transition from IN_DELIVERY"
            );
            return;
        }
    }

    /**
     * @notice Calculer la commission plateforme
     */
    function calculatePlatformFee(
        uint256 foodPrice,
        uint256 feePercent
    ) internal pure returns (uint256) {
        require(feePercent <= 100, "OrderLib: Fee percent cannot exceed 100");
        require(feePercent > 0, "OrderLib: Fee percent must be > 0");

        return (foodPrice * feePercent) / 100;
    }

    /**
     * @notice Vérifier qu'un hash IPFS est valide
     */
    function isValidIPFSHash(
        string memory ipfsHash
    ) internal pure returns (bool) {
        bytes memory hashBytes = bytes(ipfsHash);

        if (hashBytes.length == 0) return false;

        // 46 caractères = format CIDv0 "Qm..."
        if (hashBytes.length < 46) return false;

        return true;
    }
}
