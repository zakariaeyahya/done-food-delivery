// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReentrancyAttacker
 * @notice Contrat malveillant pour tester la protection contre les attaques de réentrance
 * @dev Ce contrat tente de réentrer dans les fonctions critiques du OrderManager
 */
interface IDoneOrderManager {
    function confirmDelivery(uint256 orderId) external;
}

interface IDoneStaking {
    function unstake() external;
}

contract ReentrancyAttacker {
    IDoneOrderManager public orderManager;
    IDoneStaking public staking;
    uint256 public orderId;
    bool public attackingDelivery;
    bool public attackingUnstake;
    uint256 public attackCount;

    event AttackAttempted(uint256 count);

    constructor(address _orderManager, address _staking) {
        orderManager = IDoneOrderManager(_orderManager);
        staking = IDoneStaking(_staking);
    }

    /**
     * @notice Tente une attaque de réentrance sur confirmDelivery
     * @param _orderId ID de la commande à attaquer
     */
    function attackDelivery(uint256 _orderId) external {
        orderId = _orderId;
        attackingDelivery = true;
        attackCount = 0;
        orderManager.confirmDelivery(orderId);
    }

    /**
     * @notice Tente une attaque de réentrance sur unstake
     */
    function attackUnstake() external {
        attackingUnstake = true;
        attackCount = 0;
        staking.unstake();
    }

    /**
     * @notice Fonction receive pour tenter la réentrance lors de la réception d'ETH
     */
    receive() external payable {
        if (attackingDelivery && attackCount < 3) {
            attackCount++;
            emit AttackAttempted(attackCount);
            // Tentative de réentrancy sur confirmDelivery
            orderManager.confirmDelivery(orderId);
        }

        if (attackingUnstake && attackCount < 3) {
            attackCount++;
            emit AttackAttempted(attackCount);
            // Tentative de réentrancy sur unstake
            staking.unstake();
        }
    }

    /**
     * @notice Fallback pour capturer les appels
     */
    fallback() external payable {
        if (attackingDelivery && attackCount < 3) {
            attackCount++;
            emit AttackAttempted(attackCount);
            orderManager.confirmDelivery(orderId);
        }
    }

    /**
     * @notice Permet de recevoir des ETH
     */
    function deposit() external payable {}

    /**
     * @notice Récupère les fonds après l'attaque
     */
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @notice Reset les flags d'attaque
     */
    function reset() external {
        attackingDelivery = false;
        attackingUnstake = false;
        attackCount = 0;
    }
}
