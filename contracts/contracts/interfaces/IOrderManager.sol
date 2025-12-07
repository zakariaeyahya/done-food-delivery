// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOrderManager {

    enum OrderStatus {
        CREATED,
        PREPARING,
        IN_DELIVERY,
        DELIVERED,
        DISPUTED
    }

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

    event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount);
    event PreparationConfirmed(uint256 indexed orderId, address indexed restaurant);
    event DelivererAssigned(uint256 indexed orderId, address indexed deliverer);
    event PickupConfirmed(uint256 indexed orderId, address indexed deliverer);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed client);
    event DisputeOpened(uint256 indexed orderId, address indexed opener);
    event DisputeResolved(uint256 indexed orderId, address winner, uint256 amount);

    function createOrder(
        address payable restaurant,
        uint256 foodPrice,
        uint256 deliveryFee,
        string memory ipfsHash
    ) external payable returns (uint256);

    function confirmPreparation(uint256 orderId) external;
    function assignDeliverer(uint256 orderId, address payable deliverer) external;
    function confirmPickup(uint256 orderId) external;
    function confirmDelivery(uint256 orderId) external;
    function openDispute(uint256 orderId) external;

    function resolveDispute(
        uint256 orderId,
        address payable winner,
        uint256 refundPercent
    ) external;

    function getOrder(uint256 orderId) external view returns (Order memory);
    function getClientOrders(address client) external view returns (uint256[] memory);
    function getRestaurantOrders(address restaurant) external view returns (uint256[] memory);
    function getDelivererOrders(address deliverer) external view returns (uint256[] memory);
    function getTotalOrders() external view returns (uint256);
    function PLATFORM_FEE_PERCENT() external view returns (uint256);
}
