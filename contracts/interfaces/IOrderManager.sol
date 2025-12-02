// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOrderManager
 * @notice Interface pour la gestion du cycle de vie des commandes
 * @dev Définit les fonctions essentielles du contrat DoneOrderManager
 */
interface IOrderManager {

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

    // === STRUCTS ===
    // TODO: Définir la struct Order avec tous les champs nécessaires:
    // - id: uint256 - ID unique de la commande
    // - client: address payable - Adresse du client
    // - restaurant: address payable - Adresse du restaurant
    // - deliverer: address payable - Adresse du livreur
    // - foodPrice: uint256 - Prix des plats
    // - deliveryFee: uint256 - Frais de livraison
    // - platformFee: uint256 - Commission plateforme (10%)
    // - totalAmount: uint256 - Montant total (foodPrice + deliveryFee + platformFee)
    // - status: OrderStatus - État actuel de la commande
    // - ipfsHash: string - Hash IPFS des détails de la commande
    // - createdAt: uint256 - Timestamp de création
    // - disputed: bool - Indicateur de litige
    // - delivered: bool - Indicateur de livraison
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
    // TODO: Définir l'event OrderCreated
    // - orderId: uint256 indexed
    // - client: address indexed
    // - restaurant: address indexed
    // - totalAmount: uint256
    event OrderCreated(
        uint256 indexed orderId,
        address indexed client,
        address indexed restaurant,
        uint256 totalAmount
    );

    // TODO: Définir l'event PreparationConfirmed
    // - orderId: uint256 indexed
    // - restaurant: address indexed
    event PreparationConfirmed(
        uint256 indexed orderId,
        address indexed restaurant
    );

    // TODO: Définir l'event DelivererAssigned
    // - orderId: uint256 indexed
    // - deliverer: address indexed
    event DelivererAssigned(
        uint256 indexed orderId,
        address indexed deliverer
    );

    // TODO: Définir l'event PickupConfirmed
    // - orderId: uint256 indexed
    // - deliverer: address indexed
    event PickupConfirmed(
        uint256 indexed orderId,
        address indexed deliverer
    );

    // TODO: Définir l'event DeliveryConfirmed
    // - orderId: uint256 indexed
    // - client: address indexed
    event DeliveryConfirmed(
        uint256 indexed orderId,
        address indexed client
    );

    // TODO: Définir l'event DisputeOpened
    // - orderId: uint256 indexed
    // - opener: address indexed
    event DisputeOpened(
        uint256 indexed orderId,
        address indexed opener
    );

    // TODO: Définir l'event DisputeResolved
    // - orderId: uint256 indexed
    // - winner: address
    // - amount: uint256
    event DisputeResolved(
        uint256 indexed orderId,
        address winner,
        uint256 amount
    );

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Créer une nouvelle commande
     * @dev TODO: Implémenter la logique de création
     * - Vérifier que msg.value >= totalAmount
     * - Calculer platformFee (10% du total)
     * - Créer la struct Order
     * - Stocker dans mapping orders[orderId]
     * - Bloquer les fonds (escrow)
     * - Émettre event OrderCreated
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
     * @dev TODO: Implémenter la logique de confirmation
     * - Vérifier que msg.sender == order.restaurant
     * - Vérifier que order.status == CREATED
     * - Changer status à PREPARING
     * - Émettre event PreparationConfirmed
     * @param orderId ID de la commande
     */
    function confirmPreparation(uint256 orderId) external;

    /**
     * @notice Assigner un livreur
     * @dev TODO: Implémenter la logique d'assignation
     * - Vérifier que msg.sender a le rôle PLATFORM ou RESTAURANT
     * - Vérifier que order.status == PREPARING
     * - Vérifier que le livreur est staked (DoneStaking)
     * - Assigner deliverer à la commande
     * - Changer status à IN_DELIVERY
     * - Émettre event DelivererAssigned
     * @param orderId ID de la commande
     * @param deliverer Adresse du livreur
     */
    function assignDeliverer(uint256 orderId, address payable deliverer) external;

    /**
     * @notice Confirmer récupération (livreur)
     * @dev TODO: Implémenter la logique de confirmation pickup
     * - Vérifier que msg.sender == order.deliverer
     * - Vérifier que order.status == IN_DELIVERY
     * - Émettre event PickupConfirmed
     * @param orderId ID de la commande
     */
    function confirmPickup(uint256 orderId) external;

    /**
     * @notice Confirmer livraison (client)
     * @dev TODO: Implémenter la logique de confirmation livraison
     * - Vérifier que msg.sender == order.client
     * - Vérifier que order.status == IN_DELIVERY
     * - Changer status à DELIVERED
     * - Appeler paymentSplitter.splitPayment() pour répartir les fonds
     * - Mint tokens de récompense (DoneToken)
     * - Émettre event DeliveryConfirmed
     * @param orderId ID de la commande
     */
    function confirmDelivery(uint256 orderId) external;

    /**
     * @notice Ouvrir un litige
     * @dev TODO: Implémenter la logique d'ouverture de litige
     * - Vérifier que msg.sender est client, restaurant ou deliverer
     * - Vérifier que order.status != DELIVERED
     * - Vérifier que order.status != DISPUTED
     * - Changer status à DISPUTED
     * - Marquer order.disputed = true
     * - Geler les fonds (ne pas les libérer)
     * - Émettre event DisputeOpened
     * @param orderId ID de la commande
     */
    function openDispute(uint256 orderId) external;

    /**
     * @notice Résoudre un litige (arbitrator)
     * @dev TODO: Implémenter la logique de résolution
     * - Vérifier que msg.sender a le rôle ARBITRATOR
     * - Vérifier que order.status == DISPUTED
     * - Calculer le montant de remboursement selon refundPercent
     * - Transférer les fonds au winner
     * - Changer status à DELIVERED
     * - Émettre event DisputeResolved
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
     * @dev TODO: Implémenter la fonction view
     * - Retourner orders[orderId]
     * - Vérifier que la commande existe
     * @param orderId ID de la commande
     * @return Order Détails de la commande
     */
    function getOrder(uint256 orderId) external view returns (Order memory);

    /**
     * @notice Récupérer les commandes d'un client
     * @dev TODO: Implémenter la fonction view
     * - Parcourir le mapping clientOrders[client]
     * - Retourner array d'orderIds
     * @param client Adresse du client
     * @return uint256[] Array d'orderIds
     */
    function getClientOrders(address client) external view returns (uint256[] memory);

    /**
     * @notice Récupérer les commandes d'un restaurant
     * @dev TODO: Implémenter la fonction view
     * - Parcourir le mapping restaurantOrders[restaurant]
     * - Retourner array d'orderIds
     * @param restaurant Adresse du restaurant
     * @return uint256[] Array d'orderIds
     */
    function getRestaurantOrders(address restaurant) external view returns (uint256[] memory);

    /**
     * @notice Récupérer les commandes d'un livreur
     * @dev TODO: Implémenter la fonction view
     * - Parcourir le mapping delivererOrders[deliverer]
     * - Retourner array d'orderIds
     * @param deliverer Adresse du livreur
     * @return uint256[] Array d'orderIds
     */
    function getDelivererOrders(address deliverer) external view returns (uint256[] memory);

    /**
     * @notice Récupérer le nombre total de commandes
     * @dev TODO: Implémenter la fonction view
     * - Retourner le compteur totalOrders
     * @return uint256 Compteur de commandes
     */
    function getTotalOrders() external view returns (uint256);

    /**
     * @notice Récupérer le pourcentage de commission plateforme
     * @dev TODO: Implémenter la fonction view
     * - Retourner la constante PLATFORM_FEE_PERCENT (10)
     * @return uint256 Pourcentage (ex: 10 pour 10%)
     */
    function PLATFORM_FEE_PERCENT() external view returns (uint256);
}

