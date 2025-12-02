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
     * @dev TODO: Implémenter l'event PaymentSplit
     * - orderId: uint256 indexed - ID de la commande
     * - restaurant: address indexed - Adresse du restaurant
     * - deliverer: address indexed - Adresse du livreur
     * - platform: address - Adresse de la plateforme
     * - restaurantAmount: uint256 - Montant reçu par le restaurant (70%)
     * - delivererAmount: uint256 - Montant reçu par le livreur (20%)
     * - platformAmount: uint256 - Montant reçu par la plateforme (10%)
     * - timestamp: uint256 - Timestamp de la transaction
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
     * @dev TODO: Implémenter la fonction splitPayment
     * - Vérifier que msg.value > 0
     * - Vérifier que restaurant, deliverer, platform != address(0)
     * - Calculer restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100  // 70%
     * - Calculer delivererAmount = (msg.value * DELIVERER_PERCENT) / 100    // 20%
     * - Calculer platformAmount = (msg.value * PLATFORM_PERCENT) / 100      // 10%
     * - Gérer les arrondis (platformAmount = msg.value - restaurantAmount - delivererAmount)
     * - Transférer restaurantAmount à restaurant (via low-level call)
     * - Transférer delivererAmount à deliverer (via low-level call)
     * - Transférer platformAmount à platform (via low-level call)
     * - Vérifier que tous les transferts ont réussi
     * - Émettre event PaymentSplit avec tous les détails
     * - Utiliser ReentrancyGuard pour protection
     * 
     * Requirements:
     * - msg.value > 0
     * - restaurant, deliverer, platform != address(0)
     * - Transferts doivent réussir
     *
     * Emits: PaymentSplit event
     * @param orderId ID de la commande
     * @param restaurant Adresse payable du restaurant (70%)
     * @param deliverer Adresse payable du livreur (20%)
     * @param platform Adresse payable de la plateforme (10%)
     */
    function splitPayment(
        uint256 orderId,
        address payable restaurant,
        address payable deliverer,
        address payable platform
    ) external payable;

    /**
     * @notice Récupérer le pourcentage de commission du restaurant
     * @dev TODO: Implémenter la fonction view
     * - Retourner la constante RESTAURANT_PERCENT = 70 (70%)
     * - Utiliser pourcentage simple (diviser par 100 dans les calculs)
     * - Calcul: restaurantAmount = (msg.value * RESTAURANT_PERCENT) / 100
     * @return uint256 Pourcentage (70 pour 70%)
     */
    function RESTAURANT_PERCENT() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission du livreur
     * @dev TODO: Implémenter la fonction view
     * - Retourner la constante DELIVERER_PERCENT = 20 (20%)
     * - Utiliser pourcentage simple (diviser par 100 dans les calculs)
     * - Calcul: delivererAmount = (msg.value * DELIVERER_PERCENT) / 100
     * @return uint256 Pourcentage (20 pour 20%)
     */
    function DELIVERER_PERCENT() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission de la plateforme
     * @dev TODO: Implémenter la fonction view
     * - Retourner la constante PLATFORM_PERCENT = 10 (10%)
     * - Utiliser pourcentage simple (diviser par 100 dans les calculs)
     * - Calcul: platformAmount = (msg.value * PLATFORM_PERCENT) / 100
     * @return uint256 Pourcentage (10 pour 10%)
     */
    function PLATFORM_PERCENT() external view returns (uint256);
}

