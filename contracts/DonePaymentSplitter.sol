// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DonePaymentSplitter
 * @notice Répartition automatique des paiements avec système de balance en attente (PULL pattern)
 * @dev Split: 70% restaurant, 20% livreur, 10% plateforme
 * @dev Appelé automatiquement par DoneOrderManager lors de confirmDelivery()
 * @dev Pattern PULL: Les fonds sont crédités dans balances[], puis retirés via withdraw()
 */
contract DonePaymentSplitter is Ownable, ReentrancyGuard {

    // === CONSTANTES DE SPLIT ===
    uint256 public constant RESTAURANT_PERCENT = 70;  // 70%
    uint256 public constant DELIVERER_PERCENT = 20;   // 20%
    uint256 public constant PLATFORM_PERCENT = 10;    // 10%

    // === STATE VARIABLES ===
    // Mapping pour stocker les balances en attente de chaque adresse
    mapping(address => uint256) public balances;

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

    event Withdrawn(address indexed payee, uint256 amount);

    // === CONSTRUCTOR ===
    /**
     * @notice Constructeur du contrat PaymentSplitter
     * @dev Définit msg.sender comme owner
     */
    constructor() Ownable(msg.sender) {
        // Constructor vide, pas d'initialisation supplémentaire nécessaire
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Répartir le paiement entre restaurant, livreur et plateforme
     * @dev Crédite les balances au lieu de transférer immédiatement (PULL pattern)
     *
     * Validations:
     * - msg.value > 0 (montant à répartir)
     * - _restaurant != address(0)
     * - _deliverer != address(0)
     * - _platform != address(0)
     *
     * Calculs:
     * - restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100  // 70%
     * - delivererAmount = (msg.value * DELIVERER_PERCENT) / 100    // 20%
     * - platformAmount = (msg.value * PLATFORM_PERCENT) / 100      // 10%
     *
     * Actions:
     * - Créditer balances[_restaurant] += restaurantAmount
     * - Créditer balances[_deliverer] += delivererAmount
     * - Créditer balances[_platform] += platformAmount
     * - Émettre event PaymentSplit avec tous les détails
     *
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Pattern Checks-Effects-Interactions: calculs avant modifications d'état
     *
     * Gas estimé: ~80,000 (plus élevé que PUSH car stockage)
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
    ) external payable nonReentrant {

        // Validations
        require(msg.value > 0, "PaymentSplitter: Amount must be greater than 0");
        require(_restaurant != address(0), "PaymentSplitter: Invalid restaurant address");
        require(_deliverer != address(0), "PaymentSplitter: Invalid deliverer address");
        require(_platform != address(0), "PaymentSplitter: Invalid platform address");

        // Calculs des montants
        uint256 restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100;  // 70%
        uint256 delivererAmount = (msg.value * DELIVERER_PERCENT) / 100;    // 20%
        uint256 platformAmount = (msg.value * PLATFORM_PERCENT) / 100;      // 10%

        // Créditer les balances (PULL pattern)
        balances[_restaurant] += restaurantAmount;
        balances[_deliverer] += delivererAmount;
        balances[_platform] += platformAmount;

        // Émettre event
        emit PaymentSplit(
            _orderId,
            _restaurant,
            _deliverer,
            _platform,
            restaurantAmount,
            delivererAmount,
            platformAmount,
            block.timestamp
        );
    }

    /**
     * @notice Retirer les fonds accumulés vers le wallet
     * @dev PULL pattern: L'utilisateur retire ses fonds quand il le souhaite
     *
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Reset balance AVANT le transfert (protection réentrance)
     * - Vérifier succès du transfert
     *
     * Gas estimé: ~35,000
     */
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "PaymentSplitter: No balance to withdraw");

        // Reset balance AVANT transfert (protection contre réentrance)
        balances[msg.sender] = 0;

        // Transfert via low-level call
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "PaymentSplitter: Withdraw failed");

        // Émettre event
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Récupérer le solde en attente d'une adresse
     * @param payee Adresse à vérifier
     * @return uint256 Solde en attente en wei
     */
    function getPendingBalance(address payee) external view returns (uint256) {
        return balances[payee];
    }

    /**
     * @notice Récupérer le pourcentage de commission du restaurant
     * @return uint256 Pourcentage (70 pour 70%)
     */
    function getRestaurantPercent() external pure returns (uint256) {
        return RESTAURANT_PERCENT;
    }

    /**
     * @notice Récupérer le pourcentage de commission du livreur
     * @return uint256 Pourcentage (20 pour 20%)
     */
    function getDelivererPercent() external pure returns (uint256) {
        return DELIVERER_PERCENT;
    }

    /**
     * @notice Récupérer le pourcentage de commission de la plateforme
     * @return uint256 Pourcentage (10 pour 10%)
     */
    function getPlatformPercent() external pure returns (uint256) {
        return PLATFORM_PERCENT;
    }

    /**
     * @notice Fonction de secours pour recevoir des ETH
     * @dev Permet au contrat de recevoir des ETH sans appeler de fonction
     */
    receive() external payable {}
}
