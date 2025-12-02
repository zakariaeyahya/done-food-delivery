// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS ===
// TODO: Importer AccessControl d'OpenZeppelin
// import "@openzeppelin/contracts/access/AccessControl.sol";
// TODO: Importer ReentrancyGuard d'OpenZeppelin
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// TODO: Importer Pausable d'OpenZeppelin
// import "@openzeppelin/contracts/security/Pausable.sol";
// TODO: Importer l'interface IPaymentSplitter
// import "./interfaces/IPaymentSplitter.sol";
// TODO: Importer DoneToken
// import "./DoneToken.sol";
// TODO: Importer DoneStaking
// import "./DoneStaking.sol";
// TODO: Importer OrderLib (optionnel, pour validations)
// import "./libraries/OrderLib.sol";

/**
 * @title DoneOrderManager
 * @notice Contrat principal de gestion du cycle de vie complet des commandes
 * @dev Gère les états : CREATED → PREPARING → IN_DELIVERY → DELIVERED (ou DISPUTED)
 * @dev Escrow pattern pour sécuriser les fonds
 * @dev AccessControl pour les rôles
 * @dev ReentrancyGuard pour sécurité
 * @dev Pausable pour urgence
 */
contract DoneOrderManager {
    // TODO: Hériter de AccessControl, ReentrancyGuard, Pausable
    // contract DoneOrderManager is AccessControl, ReentrancyGuard, Pausable {

    // === RÔLES (bytes32) ===
    // TODO: Définir les rôles avec keccak256
    // bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");
    // bytes32 public constant RESTAURANT_ROLE = keccak256("RESTAURANT_ROLE");
    // bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
    // bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    // bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // === ENUMS ===
    // TODO: Définir l'enum OrderStatus
    enum OrderStatus {
        CREATED,      // 0 - Commande créée, fonds bloqués
        PREPARING,    // 1 - Restaurant confirme préparation
        IN_DELIVERY,  // 2 - Livreur en route
        DELIVERED,    // 3 - Livraison confirmée, fonds libérés
        DISPUTED      // 4 - Litige ouvert, fonds gelés
    }

    // === STRUCTS ===
    // TODO: Définir la struct Order
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

    // === STATE VARIABLES ===
    // TODO: Définir le compteur d'ordres
    // uint256 public orderCounter;                           // Compteur d'ordres (auto-increment)
    
    // TODO: Définir le mapping des commandes
    // mapping(uint256 => Order) public orders;               // orderId => Order
    
    // TODO: Définir les mappings pour les listes de commandes par utilisateur
    // mapping(address => uint256[]) public clientOrders;     // client => array d'orderIds
    // mapping(address => uint256[]) public restaurantOrders; // restaurant => array d'orderIds
    // mapping(address => uint256[]) public delivererOrders;  // deliverer => array d'orderIds

    // TODO: Définir les adresses des contrats dépendants
    // address public paymentSplitterAddress;   // Adresse du contrat DonePaymentSplitter
    // DoneToken public tokenContract;          // Référence au contrat DoneToken
    // DoneStaking public stakingContract;      // Référence au contrat DoneStaking

    // TODO: Définir la constante de commission plateforme
    // uint256 public constant PLATFORM_FEE_PERCENT = 10;  // 10% de commission

    // === EVENTS ===
    // TODO: Définir tous les events
    // event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
    // event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
    // event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
    // event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
    // event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
    // event DisputeOpened(uint256 indexed orderId, address indexed opener);
    // event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    // === CONSTRUCTOR ===
    /**
     * @notice Constructeur du contrat DoneOrderManager
     * @dev TODO: Initialiser les adresses des contrats dépendants
     * @dev TODO: Configurer les rôles
     * @param _paymentSplitterAddress Adresse du contrat DonePaymentSplitter
     * @param _tokenAddress Adresse du contrat DoneToken
     * @param _stakingAddress Adresse du contrat DoneStaking
     */
    constructor(
        address _paymentSplitterAddress,
        address _tokenAddress,
        address _stakingAddress
    ) {
        // TODO: Initialiser paymentSplitterAddress = _paymentSplitterAddress
        // TODO: Initialiser tokenContract = DoneToken(_tokenAddress)
        // TODO: Initialiser stakingContract = DoneStaking(_stakingAddress)
        // TODO: Configurer DEFAULT_ADMIN_ROLE pour msg.sender
        // TODO: _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // TODO: Configurer PLATFORM_ROLE pour msg.sender
        // TODO: _grantRole(PLATFORM_ROLE, msg.sender);
    }

    // === FONCTIONS PRINCIPALES ===

    /**
     * @notice Créer une nouvelle commande avec paiement
     * @dev TODO: Implémenter la fonction createOrder
     * 
     * Validations:
     * - _restaurant doit avoir le rôle RESTAURANT_ROLE
     * - _foodPrice > 0
     * - _deliveryFee > 0
     * - _ipfsHash non vide (utiliser OrderLib.isValidIPFSHash si disponible)
     * - Calculer platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100
     * - Calculer totalAmount = _foodPrice + _deliveryFee + platformFee
     * - msg.value doit être égal à totalAmount
     * 
     * Actions:
     * - Incrémenter orderCounter
     * - Créer la structure Order et la stocker dans orders[orderCounter]
     * - Ajouter orderCounter dans clientOrders[msg.sender]
     * - Ajouter orderCounter dans restaurantOrders[_restaurant]
     * - Émettre event OrderCreated
     * - Retourner orderCounter
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Utiliser whenNotPaused modifier
     * - Pattern Checks-Effects-Interactions
     * 
     * Gas estimé: ~150,000
     * 
     * @param _restaurant Adresse du restaurant
     * @param _foodPrice Prix des plats en wei
     * @param _deliveryFee Frais de livraison en wei
     * @param _ipfsHash Hash IPFS contenant les détails de la commande
     * @return orderId ID de la commande créée
     */
    function createOrder(
        address payable _restaurant,
        uint256 _foodPrice,
        uint256 _deliveryFee,
        string memory _ipfsHash
    ) external payable returns (uint256) {
        // TODO: Ajouter modifiers nonReentrant et whenNotPaused
        
        // TODO: 1. Vérifier que _restaurant a le rôle RESTAURANT_ROLE
        // require(hasRole(RESTAURANT_ROLE, _restaurant), "OrderManager: Restaurant must have RESTAURANT_ROLE");
        
        // TODO: 2. Vérifier _foodPrice > 0
        // require(_foodPrice > 0, "OrderManager: Food price must be greater than 0");
        
        // TODO: 3. Vérifier _deliveryFee > 0
        // require(_deliveryFee > 0, "OrderManager: Delivery fee must be greater than 0");
        
        // TODO: 4. Vérifier _ipfsHash non vide
        // require(bytes(_ipfsHash).length > 0, "OrderManager: IPFS hash cannot be empty");
        
        // TODO: 5. Calculer platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100
        // uint256 platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100;
        
        // TODO: 6. Calculer totalAmount = _foodPrice + _deliveryFee + platformFee
        // uint256 totalAmount = _foodPrice + _deliveryFee + platformFee;
        
        // TODO: 7. Vérifier msg.value == totalAmount
        // require(msg.value == totalAmount, "OrderManager: Payment amount mismatch");
        
        // TODO: 8. Incrémenter orderCounter
        // orderCounter++;
        // uint256 orderId = orderCounter;
        
        // TODO: 9. Créer Order et stocker dans orders[orderId]
        // orders[orderId] = Order({
        //     id: orderId,
        //     client: payable(msg.sender),
        //     restaurant: _restaurant,
        //     deliverer: payable(address(0)),
        //     foodPrice: _foodPrice,
        //     deliveryFee: _deliveryFee,
        //     platformFee: platformFee,
        //     totalAmount: totalAmount,
        //     status: OrderStatus.CREATED,
        //     ipfsHash: _ipfsHash,
        //     createdAt: block.timestamp,
        //     disputed: false,
        //     delivered: false
        // });
        
        // TODO: 10. Ajouter orderId dans clientOrders[msg.sender]
        // clientOrders[msg.sender].push(orderId);
        
        // TODO: 11. Ajouter orderId dans restaurantOrders[_restaurant]
        // restaurantOrders[_restaurant].push(orderId);
        
        // TODO: 12. Émettre event OrderCreated
        // emit OrderCreated(orderId, msg.sender, _restaurant, totalAmount);
        
        // TODO: 13. Retourner orderId
        // return orderId;
    }

    /**
     * @notice Confirmer la préparation de la commande (restaurant)
     * @dev TODO: Implémenter la fonction confirmPreparation
     * 
     * Validations:
     * - msg.sender == orders[_orderId].restaurant
     * - orders[_orderId].status == OrderStatus.CREATED
     * 
     * Actions:
     * - Changer orders[_orderId].status à OrderStatus.PREPARING
     * - Émettre event PreparationConfirmed
     * 
     * Sécurité:
     * - Utiliser onlyRole(RESTAURANT_ROLE) modifier
     * 
     * Gas estimé: ~45,000
     * 
     * @param _orderId ID de la commande
     */
    function confirmPreparation(uint256 _orderId) external {
        // TODO: Ajouter modifier onlyRole(RESTAURANT_ROLE)
        
        // TODO: 1. Vérifier msg.sender == orders[_orderId].restaurant
        // require(msg.sender == orders[_orderId].restaurant, "OrderManager: Only restaurant can confirm");
        
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.CREATED
        // require(orders[_orderId].status == OrderStatus.CREATED, "OrderManager: Order must be CREATED");
        
        // TODO: 3. Changer orders[_orderId].status à OrderStatus.PREPARING
        // orders[_orderId].status = OrderStatus.PREPARING;
        
        // TODO: 4. Émettre event PreparationConfirmed
        // emit PreparationConfirmed(_orderId, msg.sender);
    }

    /**
     * @notice Assigner un livreur à la commande
     * @dev TODO: Implémenter la fonction assignDeliverer
     * 
     * Validations:
     * - _deliverer doit avoir le rôle DELIVERER_ROLE
     * - stakingContract.isStaked(_deliverer) == true
     * - orders[_orderId].status == OrderStatus.PREPARING
     * - orders[_orderId].deliverer == address(0) (pas déjà assigné)
     * 
     * Actions:
     * - Assigner orders[_orderId].deliverer = _deliverer
     * - Changer status à OrderStatus.IN_DELIVERY
     * - Ajouter _orderId dans delivererOrders[_deliverer]
     * - Émettre event DelivererAssigned
     * 
     * Gas estimé: ~80,000
     * 
     * @param _orderId ID de la commande
     * @param _deliverer Adresse du livreur
     */
    function assignDeliverer(uint256 _orderId, address payable _deliverer) external {
        // TODO: 1. Vérifier _deliverer a le rôle DELIVERER_ROLE
        // require(hasRole(DELIVERER_ROLE, _deliverer), "OrderManager: Deliverer must have DELIVERER_ROLE");
        
        // TODO: 2. Vérifier stakingContract.isStaked(_deliverer) == true
        // require(stakingContract.isStaked(_deliverer), "OrderManager: Deliverer must be staked");
        
        // TODO: 3. Vérifier orders[_orderId].status == OrderStatus.PREPARING
        // require(orders[_orderId].status == OrderStatus.PREPARING, "OrderManager: Order must be PREPARING");
        
        // TODO: 4. Vérifier orders[_orderId].deliverer == address(0)
        // require(orders[_orderId].deliverer == address(0), "OrderManager: Deliverer already assigned");
        
        // TODO: 5. Assigner orders[_orderId].deliverer = _deliverer
        // orders[_orderId].deliverer = _deliverer;
        
        // TODO: 6. Changer status à OrderStatus.IN_DELIVERY
        // orders[_orderId].status = OrderStatus.IN_DELIVERY;
        
        // TODO: 7. Ajouter _orderId dans delivererOrders[_deliverer]
        // delivererOrders[_deliverer].push(_orderId);
        
        // TODO: 8. Émettre event DelivererAssigned
        // emit DelivererAssigned(_orderId, _deliverer);
    }

    /**
     * @notice Confirmer la récupération de la commande (livreur)
     * @dev TODO: Implémenter la fonction confirmPickup
     * 
     * Validations:
     * - msg.sender == orders[_orderId].deliverer
     * - orders[_orderId].status == OrderStatus.IN_DELIVERY
     * 
     * Actions:
     * - Émettre event PickupConfirmed
     * - (Le status reste IN_DELIVERY, c'est juste une confirmation intermédiaire)
     * 
     * Sécurité:
     * - Utiliser onlyRole(DELIVERER_ROLE) modifier
     * 
     * Gas estimé: ~30,000
     * 
     * @param _orderId ID de la commande
     */
    function confirmPickup(uint256 _orderId) external {
        // TODO: Ajouter modifier onlyRole(DELIVERER_ROLE)
        
        // TODO: 1. Vérifier msg.sender == orders[_orderId].deliverer
        // require(msg.sender == orders[_orderId].deliverer, "OrderManager: Only assigned deliverer can confirm");
        
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.IN_DELIVERY
        // require(orders[_orderId].status == OrderStatus.IN_DELIVERY, "OrderManager: Order must be IN_DELIVERY");
        
        // TODO: 3. Émettre event PickupConfirmed
        // emit PickupConfirmed(_orderId, msg.sender);
        // Note: Le status reste IN_DELIVERY, c'est juste une confirmation intermédiaire
    }

    /**
     * @notice Confirmer la livraison + split automatique des paiements (client)
     * @dev TODO: Implémenter la fonction confirmDelivery
     * 
     * Validations:
     * - msg.sender == orders[_orderId].client
     * - orders[_orderId].status == OrderStatus.IN_DELIVERY
     * - orders[_orderId].disputed == false
     * 
     * Actions:
     * - Changer orders[_orderId].status à OrderStatus.DELIVERED
     * - Changer orders[_orderId].delivered à true
     * - Appeler paymentSplitter.splitPayment{value: totalAmount}(...)
     * - Calculer tokensToMint = (foodPrice / 10 ether) * 1 ether
     * - Appeler tokenContract.mint(client, tokensToMint)
     * - Émettre event DeliveryConfirmed
     * 
     * Sécurité:
     * - Utiliser nonReentrant modifier
     * - Pattern Checks-Effects-Interactions: mettre à jour l'état avant les appels externes
     * 
     * Gas estimé: ~250,000 (incluant split et mint)
     * 
     * @param _orderId ID de la commande
     */
    function confirmDelivery(uint256 _orderId) external {
        // TODO: Ajouter modifier nonReentrant
        
        // TODO: 1. Vérifier msg.sender == orders[_orderId].client
        // require(msg.sender == orders[_orderId].client, "OrderManager: Only client can confirm delivery");
        
        // TODO: 2. Vérifier orders[_orderId].status == OrderStatus.IN_DELIVERY
        // require(orders[_orderId].status == OrderStatus.IN_DELIVERY, "OrderManager: Order must be IN_DELIVERY");
        
        // TODO: 3. Vérifier orders[_orderId].disputed == false
        // require(!orders[_orderId].disputed, "OrderManager: Cannot confirm disputed order");
        
        // TODO: 4. Changer orders[_orderId].status à OrderStatus.DELIVERED
        // orders[_orderId].status = OrderStatus.DELIVERED;
        
        // TODO: 5. Changer orders[_orderId].delivered à true
        // orders[_orderId].delivered = true;
        
        // TODO: 6. Appeler paymentSplitter.splitPayment{value: totalAmount}(...)
        // IPaymentSplitter(paymentSplitterAddress).splitPayment{value: orders[_orderId].totalAmount}(
        //     _orderId,
        //     orders[_orderId].restaurant,
        //     orders[_orderId].deliverer,
        //     payable(owner()) // ou une adresse plateforme dédiée
        // );
        
        // TODO: 7. Calculer tokensToMint = (foodPrice / 10 ether) * 1 ether
        // uint256 tokensToMint = (orders[_orderId].foodPrice / 10 ether) * 1 ether;
        
        // TODO: 8. Appeler tokenContract.mint(client, tokensToMint)
        // tokenContract.mint(orders[_orderId].client, tokensToMint);
        
        // TODO: 9. Émettre event DeliveryConfirmed
        // emit DeliveryConfirmed(_orderId, orders[_orderId].client);
    }

    /**
     * @notice Ouvrir un litige sur une commande
     * @dev TODO: Implémenter la fonction openDispute
     * 
     * Validations:
     * - msg.sender est client, restaurant ou deliverer de la commande
     * - orders[_orderId].status != OrderStatus.DELIVERED
     * - orders[_orderId].disputed == false
     * 
     * Actions:
     * - Changer orders[_orderId].status à OrderStatus.DISPUTED
     * - Changer orders[_orderId].disputed à true
     * - Émettre event DisputeOpened
     * - Les fonds restent bloqués dans le contrat
     * 
     * Gas estimé: ~50,000
     * 
     * @param _orderId ID de la commande
     */
    function openDispute(uint256 _orderId) external {
        // TODO: 1. Vérifier msg.sender est client, restaurant ou deliverer
        // Order storage order = orders[_orderId];
        // require(
        //     msg.sender == order.client || 
        //     msg.sender == order.restaurant || 
        //     msg.sender == order.deliverer,
        //     "OrderManager: Only client, restaurant or deliverer can open dispute"
        // );
        
        // TODO: 2. Vérifier orders[_orderId].status != OrderStatus.DELIVERED
        // require(orders[_orderId].status != OrderStatus.DELIVERED, "OrderManager: Cannot dispute delivered order");
        
        // TODO: 3. Vérifier orders[_orderId].disputed == false
        // require(!orders[_orderId].disputed, "OrderManager: Dispute already opened");
        
        // TODO: 4. Changer orders[_orderId].status à OrderStatus.DISPUTED
        // orders[_orderId].status = OrderStatus.DISPUTED;
        
        // TODO: 5. Changer orders[_orderId].disputed à true
        // orders[_orderId].disputed = true;
        
        // TODO: 6. Émettre event DisputeOpened
        // emit DisputeOpened(_orderId, msg.sender);
    }

    /**
     * @notice Résoudre un litige (arbitrator)
     * @dev TODO: Implémenter la fonction resolveDispute
     * 
     * Validations:
     * - msg.sender a le rôle ARBITRATOR_ROLE
     * - orders[_orderId].disputed == true
     * - _winner est client, restaurant ou deliverer
     * - _refundPercent entre 0 et 100
     * 
     * Actions:
     * - Calculer montant à transférer selon _refundPercent
     * - Transférer les fonds à _winner
     * - Changer disputed à false
     * - Émettre event DisputeResolved
     * 
     * Sécurité:
     * - Utiliser onlyRole(ARBITRATOR_ROLE) modifier
     * - Utiliser nonReentrant modifier
     * - Pattern Checks-Effects-Interactions
     * 
     * Gas estimé: ~80,000
     * 
     * @param _orderId ID de la commande
     * @param _winner Adresse du gagnant du litige
     * @param _refundPercent Pourcentage de remboursement (0-100)
     */
    function resolveDispute(
        uint256 _orderId,
        address payable _winner,
        uint256 _refundPercent
    ) external {
        // TODO: Ajouter modifiers onlyRole(ARBITRATOR_ROLE) et nonReentrant
        
        // TODO: 1. Vérifier orders[_orderId].disputed == true
        // require(orders[_orderId].disputed, "OrderManager: Order is not disputed");
        
        // TODO: 2. Vérifier _winner est client, restaurant ou deliverer
        // Order storage order = orders[_orderId];
        // require(
        //     _winner == order.client || 
        //     _winner == order.restaurant || 
        //     _winner == order.deliverer,
        //     "OrderManager: Winner must be client, restaurant or deliverer"
        // );
        
        // TODO: 3. Vérifier _refundPercent entre 0 et 100
        // require(_refundPercent <= 100, "OrderManager: Refund percent cannot exceed 100");
        
        // TODO: 4. Calculer montant à transférer selon _refundPercent
        // uint256 refundAmount = (orders[_orderId].totalAmount * _refundPercent) / 100;
        
        // TODO: 5. Transférer les fonds à _winner
        // (bool success, ) = _winner.call{value: refundAmount}("");
        // require(success, "OrderManager: Transfer failed");
        
        // TODO: 6. Changer disputed à false
        // orders[_orderId].disputed = false;
        
        // TODO: 7. Émettre event DisputeResolved
        // emit DisputeResolved(_orderId, _winner, refundAmount);
    }

    // === FONCTIONS VIEW ===

    /**
     * @notice Récupérer une commande
     * @param _orderId ID de la commande
     * @return Order Détails de la commande
     */
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        // TODO: return orders[_orderId];
    }

    /**
     * @notice Récupérer les commandes d'un client
     * @param _client Adresse du client
     * @return uint256[] Array d'orderIds
     */
    function getClientOrders(address _client) external view returns (uint256[] memory) {
        // TODO: return clientOrders[_client];
    }

    /**
     * @notice Récupérer les commandes d'un restaurant
     * @param _restaurant Adresse du restaurant
     * @return uint256[] Array d'orderIds
     */
    function getRestaurantOrders(address _restaurant) external view returns (uint256[] memory) {
        // TODO: return restaurantOrders[_restaurant];
    }

    /**
     * @notice Récupérer les commandes d'un livreur
     * @param _deliverer Adresse du livreur
     * @return uint256[] Array d'orderIds
     */
    function getDelivererOrders(address _deliverer) external view returns (uint256[] memory) {
        // TODO: return delivererOrders[_deliverer];
    }

    /**
     * @notice Récupérer le nombre total de commandes
     * @return uint256 Compteur de commandes
     */
    function getTotalOrders() external view returns (uint256) {
        // TODO: return orderCounter;
    }

    /**
     * @notice Récupérer le pourcentage de commission plateforme
     * @return uint256 Pourcentage (10 pour 10%)
     */
    function PLATFORM_FEE_PERCENT() external pure returns (uint256) {
        // TODO: return PLATFORM_FEE_PERCENT;
    }

    // === FONCTIONS ADMIN ===

    /**
     * @notice Mettre en pause le contrat (DEFAULT_ADMIN_ROLE uniquement)
     * @dev TODO: Appeler _pause() de Pausable
     */
    function pause() external {
        // TODO: Ajouter modifier onlyRole(DEFAULT_ADMIN_ROLE)
        // TODO: _pause();
    }

    /**
     * @notice Reprendre le contrat (DEFAULT_ADMIN_ROLE uniquement)
     * @dev TODO: Appeler _unpause() de Pausable
     */
    function unpause() external {
        // TODO: Ajouter modifier onlyRole(DEFAULT_ADMIN_ROLE)
        // TODO: _unpause();
    }
}

