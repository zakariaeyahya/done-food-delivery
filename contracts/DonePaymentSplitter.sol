// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
// TODO: Importer Ownable d'OpenZeppelin
// import "@openzeppelin/contracts/access/Ownable.sol";
// TODO: Importer ReentrancyGuard d'OpenZeppelin
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// TODO: Importer l'interface IPaymentSplitter
// import "./interfaces/IPaymentSplitter.sol";

/**
 * @title DonePaymentSplitter
 * @notice Répartition automatique des paiements selon le ratio prédéfini
 * @dev Split: 70% restaurant, 20% livreur, 10% plateforme
 * @dev Appelé automatiquement par DoneOrderManager lors de confirmDelivery()
 * @dev Pas de stockage d'état (gas optimisé)
 */
contract DonePaymentSplitter {
    // TODO: Hériter de Ownable et ReentrancyGuard
    // TODO: Implémenter l'interface IPaymentSplitter
    // contract DonePaymentSplitter is Ownable, ReentrancyGuard, IPaymentSplitter {

    // === CONSTANTES DE SPLIT ===
    // TODO: Définir les constantes de pourcentage
    // uint256 public constant RESTAURANT_PERCENT = 70;  // 70%
    // uint256 public constant DELIVERER_PERCENT = 20;   // 20%
    // uint256 public constant PLATFORM_PERCENT = 10;    // 10%

    // === EVENTS ===
    // TODO: Définir l'event PaymentSplit (déjà défini dans IPaymentSplitter)
    // event PaymentSplit(
    //     uint256 indexed orderId,
    //     address indexed restaurant,
    //     address indexed deliverer,
    //     address platform,
    //     uint256 restaurantAmount,
    //     uint256 delivererAmount,
    //     uint256 platformAmount,
    //     uint256 timestamp
    // );

    // === CONSTRUCTOR ===
    /**
     * @notice Constructeur du contrat PaymentSplitter
     * @dev TODO: Appeler Ownable(msg.sender) pour définir le owner
     * @dev Constructor vide, pas d'initialisation supplémentaire nécessaire
     */
    constructor() {
        // TODO: Appeler Ownable(msg.sender)
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Répartir le paiement entre restaurant, livreur et plateforme
     * @dev TODO: Implémenter la fonction splitPayment
     * 
     * Validations:
     * - msg.value > 0 (montant à répartir)
     * - _restaurant != address(0)
     * - _deliverer != address(0)
     * - _platform != address(0)
     * 
     * Calculs:
     * - restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100  // 70%
     * - delivererAmount = (msg.value * DELIVERER_PERCENT) / 100      // 20%
     * - platformAmount = (msg.value * PLATFORM_PERCENT) / 100        // 10%
     * 
     * Actions:
     * - Transférer restaurantAmount à _restaurant via low-level call
     * - Transférer delivererAmount à _deliverer via low-level call
     * - Transférer platformAmount à _platform via low-level call
     * - Vérifier le succès de chaque transfert (require)
     * - Émettre event PaymentSplit avec tous les détails
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Utiliser low-level call au lieu de transfer() pour plus de flexibilité
     * - Pattern Checks-Effects-Interactions: calculs avant transferts
     * 
     * Gas estimé: ~60,000
     * 
     * @param _orderId ID de la commande
     * @param _restaurant Adresse payable du restaurant (70%)
     * @param _deliverer Adresse payable du livreur (20%)
     * @param _platform Adresse payable de la plateforme (10%)
     */
    function splitPayment(
        uint256 _orderId,
        address payable _restaurant,
        address payable _deliverer,
        address payable _platform
    ) external payable {
        // TODO: Ajouter modifier nonReentrant
        
        // TODO: 1. Vérifier msg.value > 0
        // require(msg.value > 0, "PaymentSplitter: Amount must be greater than 0");
        
        // TODO: 2. Vérifier _restaurant != address(0)
        // require(_restaurant != address(0), "PaymentSplitter: Invalid restaurant address");
        
        // TODO: 3. Vérifier _deliverer != address(0)
        // require(_deliverer != address(0), "PaymentSplitter: Invalid deliverer address");
        
        // TODO: 4. Vérifier _platform != address(0)
        // require(_platform != address(0), "PaymentSplitter: Invalid platform address");

        // TODO: 5. Calculer restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100
        // uint256 restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100;
        
        // TODO: 6. Calculer delivererAmount = (msg.value * DELIVERER_PERCENT) / 100
        // uint256 delivererAmount = (msg.value * DELIVERER_PERCENT) / 100;
        
        // TODO: 7. Calculer platformAmount = (msg.value * PLATFORM_PERCENT) / 100
        // uint256 platformAmount = (msg.value * PLATFORM_PERCENT) / 100;
        
        // Note: Pour gérer les arrondis, on peut aussi faire:
        // platformAmount = msg.value - restaurantAmount - delivererAmount;

        // TODO: 8. Transférer restaurantAmount à _restaurant via call{value}
        // (bool success1, ) = _restaurant.call{value: restaurantAmount}("");
        // require(success1, "PaymentSplitter: Restaurant transfer failed");
        
        // TODO: 9. Transférer delivererAmount à _deliverer via call{value}
        // (bool success2, ) = _deliverer.call{value: delivererAmount}("");
        // require(success2, "PaymentSplitter: Deliverer transfer failed");
        
        // TODO: 10. Transférer platformAmount à _platform via call{value}
        // (bool success3, ) = _platform.call{value: platformAmount}("");
        // require(success3, "PaymentSplitter: Platform transfer failed");

        // TODO: 11. Émettre event PaymentSplit avec tous les détails
        // emit PaymentSplit(
        //     _orderId,
        //     _restaurant,
        //     _deliverer,
        //     _platform,
        //     restaurantAmount,
        //     delivererAmount,
        //     platformAmount,
        //     block.timestamp
        // );
    }

    // === FONCTIONS VIEW (pour l'interface IPaymentSplitter) ===
    
    /**
     * @notice Récupérer le pourcentage de commission du restaurant
     * @dev TODO: Retourner RESTAURANT_PERCENT (70)
     * @return uint256 Pourcentage (70 pour 70%)
     */
    function RESTAURANT_PERCENT() external pure returns (uint256) {
        // TODO: return RESTAURANT_PERCENT;
    }

    /**
     * @notice Récupérer le pourcentage de commission du livreur
     * @dev TODO: Retourner DELIVERER_PERCENT (20)
     * @return uint256 Pourcentage (20 pour 20%)
     */
    function DELIVERER_PERCENT() external pure returns (uint256) {
        // TODO: return DELIVERER_PERCENT;
    }

    /**
     * @notice Récupérer le pourcentage de commission de la plateforme
     * @dev TODO: Retourner PLATFORM_PERCENT (10)
     * @return uint256 Pourcentage (10 pour 10%)
     */
    function PLATFORM_PERCENT() external pure returns (uint256) {
        // TODO: return PLATFORM_PERCENT;
    }
}


