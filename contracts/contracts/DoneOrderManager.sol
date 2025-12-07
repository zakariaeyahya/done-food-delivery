// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IMPORTS CORE ===
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./interfaces/IPaymentSplitter.sol";
import "./DoneToken.sol";
import "./DoneStaking.sol";

// === IMPORTS ORACLES ===
import "./oracles/DoneGPSOracle.sol";
import "./oracles/DonePriceOracle.sol";
import "./oracles/DoneWeatherOracle.sol";

/**
 * @title DoneOrderManager
 * @notice Gestion complète des commandes Done Delivery:
 */
contract DoneOrderManager is AccessControl, ReentrancyGuard, Pausable {

    // === RÔLES ===
    bytes32 public constant CLIENT_ROLE     = keccak256("CLIENT_ROLE");
    bytes32 public constant RESTAURANT_ROLE = keccak256("RESTAURANT_ROLE");
    bytes32 public constant DELIVERER_ROLE  = keccak256("DELIVERER_ROLE");
    bytes32 public constant PLATFORM_ROLE   = keccak256("PLATFORM_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // === ENUMS ===
    enum OrderStatus {
        CREATED,
        PREPARING,
        ASSIGNED,
        IN_DELIVERY,
        DELIVERED,
        DISPUTED
    }

    // === STRUCT ===
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

    // === STATE VARIABLES ===
    uint256 public orderCounter;

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public clientOrders;
    mapping(address => uint256[]) public restaurantOrders;
    mapping(address => uint256[]) public delivererOrders;

    // Contrats externes
    address public paymentSplitterAddress;
    DoneToken public tokenContract;
    DoneStaking public stakingContract;

    uint256 public constant PLATFORM_FEE_PERCENT = 10;
    address payable public platformWallet;

    // === ORACLES ===
    DoneGPSOracle public gpsOracle;
    DonePriceOracle public priceOracle;
    DoneWeatherOracle public weatherOracle;

    // === EVENTS ===
    event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
    event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
    event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
    event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
    event DisputeOpened(uint256 indexed orderId, address indexed opener);
    event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    // === CONSTRUCTOR ===
    constructor(
        address _paymentSplitterAddress,
        address _tokenAddress,
        address _stakingAddress,
        address payable _platformWallet
    ) {
        require(_paymentSplitterAddress != address(0), "Invalid splitter");
        require(_tokenAddress != address(0), "Invalid token");
        require(_stakingAddress != address(0), "Invalid staking");
        require(_platformWallet != address(0), "Invalid platform wallet");

        paymentSplitterAddress = _paymentSplitterAddress;
        tokenContract = DoneToken(_tokenAddress);
        stakingContract = DoneStaking(_stakingAddress);
        platformWallet = _platformWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
    }

    // =========================================================
    //                     CORE FONCTIONS
    // =========================================================

    function createOrder(
        address payable _restaurant,
        uint256 _foodPrice,
        uint256 _deliveryFee,
        string memory _ipfsHash
    ) external payable nonReentrant whenNotPaused returns (uint256)
    {
        require(hasRole(RESTAURANT_ROLE, _restaurant), "Not restaurant");

        uint256 platformFee = (_foodPrice * PLATFORM_FEE_PERCENT) / 100;
        uint256 totalAmount = _foodPrice + _deliveryFee + platformFee;

        require(msg.value == totalAmount, "Payment mismatch");

        orderCounter++;
        uint256 orderId = orderCounter;

        orders[orderId] = Order({
            id: orderId,
            client: payable(msg.sender),
            restaurant: _restaurant,
            deliverer: payable(address(0)),
            foodPrice: _foodPrice,
            deliveryFee: _deliveryFee,
            platformFee: platformFee,
            totalAmount: totalAmount,
            status: OrderStatus.CREATED,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            disputed: false,
            delivered: false
        });

        clientOrders[msg.sender].push(orderId);
        restaurantOrders[_restaurant].push(orderId);

        emit OrderCreated(orderId, msg.sender, _restaurant, totalAmount);
        return orderId;
    }

    function confirmPreparation(uint256 _orderId)
        external whenNotPaused onlyRole(RESTAURANT_ROLE)
    {
        Order storage order = orders[_orderId];
        require(order.restaurant == msg.sender, "Not order restaurant");
        require(order.status == OrderStatus.CREATED, "Invalid state");

        order.status = OrderStatus.PREPARING;
        emit PreparationConfirmed(_orderId, msg.sender);
    }

    function assignDeliverer(uint256 _orderId, address payable _deliverer)
        external whenNotPaused onlyRole(PLATFORM_ROLE)
    {
        Order storage order = orders[_orderId];

        require(hasRole(DELIVERER_ROLE, _deliverer), "Not deliverer");
        require(stakingContract.isStaked(_deliverer), "Not staked");
        require(order.status == OrderStatus.PREPARING, "Invalid state");

        order.deliverer = _deliverer;
        order.status = OrderStatus.ASSIGNED;

        delivererOrders[_deliverer].push(_orderId);

        emit DelivererAssigned(_orderId, _deliverer);
    }

    function confirmPickup(uint256 _orderId)
        external whenNotPaused onlyRole(DELIVERER_ROLE)
    {
        Order storage order = orders[_orderId];
        require(order.deliverer == msg.sender, "Not assigned deliverer");
        require(order.status == OrderStatus.ASSIGNED, "Invalid state");

        order.status = OrderStatus.IN_DELIVERY;
        emit PickupConfirmed(_orderId, msg.sender);
    }

    function confirmDelivery(uint256 _orderId)
        external nonReentrant whenNotPaused
    {
        Order storage order = orders[_orderId];

        require(order.client == msg.sender, "Not client");
        require(order.status == OrderStatus.IN_DELIVERY, "Invalid state");

        order.status = OrderStatus.DELIVERED;
        order.delivered = true;

        IPaymentSplitter(paymentSplitterAddress).splitPayment{value: order.totalAmount}(
            _orderId, order.restaurant, order.deliverer, platformWallet
        );

        uint256 tokensToMint = order.foodPrice / 10;
        if (tokensToMint > 0) tokenContract.mint(order.client, tokensToMint);

        emit DeliveryConfirmed(_orderId, msg.sender);
    }

    function openDispute(uint256 _orderId) external whenNotPaused {
        Order storage order = orders[_orderId];

        require(msg.sender == order.client || msg.sender == order.restaurant || msg.sender == order.deliverer, "Not allowed");
        require(order.status != OrderStatus.DELIVERED, "Already delivered");

        order.disputed = true;
        order.status = OrderStatus.DISPUTED;

        emit DisputeOpened(_orderId, msg.sender);
    }

    function resolveDispute(uint256 _orderId, address payable _winner, uint256 _refundPercent)
        external onlyRole(ARBITRATOR_ROLE) nonReentrant whenNotPaused
    {
        Order storage order = orders[_orderId];

        require(order.disputed, "No dispute");
        require(_refundPercent <= 100, "Invalid percent");

        uint256 refundAmount = (order.totalAmount * _refundPercent) / 100;

        (bool success,) = _winner.call{value: refundAmount}("");
        require(success, "Transfer failed");

        order.status = OrderStatus.DELIVERED;
        order.disputed = false;

        emit DisputeResolved(_orderId, _winner, refundAmount);
    }

    // =========================================================
    //                 ORACLE INTEGRATION
    // =========================================================

    // 1. GPS ORACLE
    function confirmDeliveryWithGPS(uint256 _orderId, int256 clientLat, int256 clientLng)
        external nonReentrant whenNotPaused
    {
        require(address(gpsOracle) != address(0), "GPS oracle not set");

        Order storage order = orders[_orderId];

        require(order.client == msg.sender, "Not client");
        require(order.status == OrderStatus.IN_DELIVERY, "Invalid state");

        bool ok = gpsOracle.verifyDelivery(_orderId, clientLat, clientLng);
        require(ok, "GPS: too far");

        order.status = OrderStatus.DELIVERED;
        order.delivered = true;

        IPaymentSplitter(paymentSplitterAddress).splitPayment{value: order.totalAmount}(
            _orderId, order.restaurant, order.deliverer, platformWallet
        );

        uint256 tokensToMint = order.foodPrice / 10;
        if (tokensToMint > 0) tokenContract.mint(order.client, tokensToMint);

        emit DeliveryConfirmed(_orderId, msg.sender);
    }

    // 2. PRICE ORACLE — CORRECTED (plus view)
    function convertUSDToMatic(uint256 usdAmount) public returns (uint256) {
        require(address(priceOracle) != address(0), "Price oracle not set");
        return priceOracle.convertUSDtoMATIC(usdAmount);
    }

    // 3. WEATHER ORACLE
    function calculateDynamicDeliveryFee(uint256 baseFee, int256 lat, int256 lng)
        public view returns (uint256)
    {
        require(address(weatherOracle) != address(0), "Weather oracle not set");

        (DoneWeatherOracle.WeatherCondition condition,,,) =
            weatherOracle.getWeather(lat, lng);

        return weatherOracle.adjustDeliveryFee(baseFee, condition);
    }

    function canDeliverAtLocation(int256 lat, int256 lng)
        external view returns (bool)
    {
        require(address(weatherOracle) != address(0), "Weather oracle not set");
        return weatherOracle.canDeliver(lat, lng);
    }

    // =========================================================
    //                           VIEWS
    // =========================================================

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getClientOrders(address _client) external view returns (uint256[] memory) {
        return clientOrders[_client];
    }

    function getRestaurantOrders(address _restaurant) external view returns (uint256[] memory) {
        return restaurantOrders[_restaurant];
    }

    function getDelivererOrders(address _deliverer) external view returns (uint256[] memory) {
        return delivererOrders[_deliverer];
    }

    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }

    // =========================================================
    //                          ADMIN
    // =========================================================

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function updatePlatformWallet(address payable newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }

    function setGPSOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oracle != address(0), "Invalid oracle");
        gpsOracle = DoneGPSOracle(_oracle);
    }

    function setPriceOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oracle != address(0), "Invalid oracle");
        priceOracle = DonePriceOracle(_oracle);
    }

    function setWeatherOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oracle != address(0), "Invalid oracle");
        weatherOracle = DoneWeatherOracle(_oracle);
    }
}
