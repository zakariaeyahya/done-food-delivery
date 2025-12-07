// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DoneGPSOracle
 * @notice Oracle GPS pour vérification de livraison on-chain avec preuve cryptographique
 * @dev Enregistre positions GPS livreur et vérifie proximité client pour validation livraison
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @dev Contrat DoneGPSOracle hérite de AccessControl et ReentrancyGuard
 */
contract DoneGPSOracle is AccessControl, ReentrancyGuard {

    // === RÔLES ===
    
    bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // === STRUCTS ===
    
    struct GPSLocation {
        int256 latitude;   
        int256 longitude;
        uint256 timestamp;
        address deliverer;
        bool verified;
    }
    
    struct DeliveryRoute {
        uint256 orderId;
        GPSLocation[] locations;
        uint256 totalDistance;
        uint256 startTime;
        uint256 endTime;
    }
    
    // === CONSTANTES ===
    
    uint256 public constant DELIVERY_RADIUS = 100; 
    uint256 public constant EARTH_RADIUS = 6371000;
    
    // === VARIABLES D'ÉTAT ===
    
    mapping(uint256 => DeliveryRoute) public deliveryRoutes;
    mapping(uint256 => GPSLocation) public currentLocations;
    
    uint256 public deliveryRadius;
    
    // === EVENTS ===
    
    event LocationUpdated(
        uint256 indexed orderId,
        int256 lat,
        int256 lng,
        uint256 timestamp
    );
    
    event DeliveryVerified(
        uint256 indexed orderId,
        uint256 distance,
        bool verified
    );
    
    event RouteCompleted(
        uint256 indexed orderId,
        uint256 totalDistance,
        uint256 duration
    );
    
    // === CONSTRUCTOR ===
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        deliveryRadius = DELIVERY_RADIUS;
    }
    
    // === FONCTIONS PRINCIPALES ===
    
    function updateLocation(
        uint256 orderId,
        int256 lat,
        int256 lng
    ) external onlyRole(DELIVERER_ROLE) nonReentrant {

        require(lat >= -90000000 && lat <= 90000000, "Invalid latitude");
        require(lng >= -180000000 && lng <= 180000000, "Invalid longitude");
        
        GPSLocation memory location = GPSLocation({
            latitude: lat,
            longitude: lng,
            timestamp: block.timestamp,
            deliverer: msg.sender,
            verified: false
        });
        
        currentLocations[orderId] = location;

        if (deliveryRoutes[orderId].orderId == 0) {
            deliveryRoutes[orderId].orderId = orderId;
            deliveryRoutes[orderId].startTime = block.timestamp;
        }

        deliveryRoutes[orderId].locations.push(location);

        if (deliveryRoutes[orderId].locations.length > 1) {
            uint256 lastIndex = deliveryRoutes[orderId].locations.length - 1;

            GPSLocation memory prevLocation = deliveryRoutes[orderId].locations[lastIndex - 1];

            uint256 distance = calculateDistance(
                prevLocation.latitude,
                prevLocation.longitude,
                lat,
                lng
            );

            deliveryRoutes[orderId].totalDistance += distance;
        }
        
        emit LocationUpdated(orderId, lat, lng, block.timestamp);
    }
    
    
    function verifyDelivery(
        uint256 orderId,
        int256 clientLat,
        int256 clientLng
    ) external view onlyRole(ORACLE_ROLE) returns (bool) {
        
        GPSLocation memory delivererLocation = currentLocations[orderId];
        
        require(delivererLocation.timestamp > 0, "No location data");

        uint256 distance = calculateDistance(
            delivererLocation.latitude,
            delivererLocation.longitude,
            clientLat,
            clientLng
        );

        bool verified = distance <= deliveryRadius;

        return verified;
    }
    
    function calculateDistance(
        int256 lat1,
        int256 lng1,
        int256 lat2,
        int256 lng2
    ) public pure returns (uint256) {

        int256 dLat = lat2 - lat1;
        int256 dLng = lng2 - lng1;

        uint256 dist = uint256(
            sqrt(
                (dLat * dLat) + (dLng * dLng)
            )
        );

        return dist;
    }

    function sqrt(int256 x) internal pure returns (int256 y) {
        int256 z = (x + 1) / 2;
        y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    function getDeliveryRoute(uint256 orderId) external view returns (
        GPSLocation[] memory locations,
        uint256 totalDistance,
        uint256 startTime,
        uint256 endTime
    ) {
        DeliveryRoute memory route = deliveryRoutes[orderId];
        return (route.locations, route.totalDistance, route.startTime, route.endTime);
    }
    
    // === FONCTIONS ADMIN ===
    
    function setDeliveryRadius(uint256 newRadius) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRadius > 0, "Radius must be greater than 0");
        deliveryRadius = newRadius;
    }
}
