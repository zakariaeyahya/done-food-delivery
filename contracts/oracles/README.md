# Dossier contracts/oracles/

Ce dossier contient les smart contracts d'oracles qui permettent d'injecter des données du monde réel (prix, GPS, météo) dans la blockchain. Les oracles sont essentiels car les smart contracts ne peuvent pas accéder directement aux données externes.

## Structure

```
contracts/oracles/
├── DonePriceOracle.sol
├── DoneGPSOracle.sol
└── DoneWeatherOracle.sol
```

## Fichiers

### DonePriceOracle.sol

**Rôle** : Oracle de prix MATIC/USD utilisant Chainlink Price Feed pour convertir les prix fiat en crypto en temps réel.

**Imports** :
```solidity
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

**Variables d'état** :
```solidity
AggregatorV3Interface internal priceFeed;
uint8 public constant DECIMALS = 18;
uint256 public constant PRECISION = 1e18;
```

**Constructeur** :
```solidity
constructor(address _priceFeedAddress) {
  // Mumbai Testnet: MATIC/USD Price Feed
  // Mainnet: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
  priceFeed = AggregatorV3Interface(_priceFeedAddress);
}
```

**Fonctions principales** :

**1. getLatestPrice()**
- Rôle : Récupère le prix MATIC/USD en temps réel depuis Chainlink
- Visibilité : public view
- Returns : (int price, uint8 decimals, uint256 timestamp)

Pseudo-code :
```solidity
function getLatestPrice() public view returns (int, uint8, uint256) {
  // Call Chainlink Price Feed
  (
    uint80 roundID,
    int price,
    uint startedAt,
    uint timeStamp,
    uint80 answeredInRound
  ) = priceFeed.latestRoundData();

  // Validation
  require(price > 0, "Invalid price");
  require(timeStamp > 0, "Invalid timestamp");

  // Return price, decimals, timestamp
  return (price, priceFeed.decimals(), timeStamp);
}
```

**2. convertUSDtoMATIC(uint256 usdAmount)**
- Rôle : Convertit un montant USD en MATIC
- Params : usdAmount (en USD avec 18 decimals)
- Returns : maticAmount (en wei)

Pseudo-code :
```solidity
function convertUSDtoMATIC(uint256 usdAmount) public view returns (uint256) {
  // Get latest MATIC/USD price
  (int price, uint8 decimals, ) = getLatestPrice();

  // Validation
  require(price > 0, "Invalid price");

  // Convert to uint256
  uint256 maticUsdPrice = uint256(price);

  // Adjust for decimals (Chainlink uses 8 decimals for MATIC/USD)
  // Formula: usdAmount * 10^decimals / price
  uint256 maticAmount = (usdAmount * (10 ** decimals)) / maticUsdPrice;

  return maticAmount;
}
```

**3. convertMATICtoUSD(uint256 maticAmount)**
- Rôle : Convertit un montant MATIC en USD
- Params : maticAmount (en wei)
- Returns : usdAmount (en USD avec 18 decimals)

Pseudo-code :
```solidity
function convertMATICtoUSD(uint256 maticAmount) public view returns (uint256) {
  // Get latest price
  (int price, uint8 decimals, ) = getLatestPrice();

  require(price > 0, "Invalid price");

  uint256 maticUsdPrice = uint256(price);

  // Formula: maticAmount * price / 10^decimals
  uint256 usdAmount = (maticAmount * maticUsdPrice) / (10 ** decimals);

  return usdAmount;
}
```

**4. getPriceWithAge()**
- Rôle : Récupère prix avec âge de la donnée
- Returns : (price, age in seconds)

Pseudo-code :
```solidity
function getPriceWithAge() public view returns (int, uint256) {
  (int price, , uint256 timestamp) = getLatestPrice();
  uint256 age = block.timestamp - timestamp;
  return (price, age);
}
```

**Events** :
```solidity
event PriceUpdated(int price, uint256 timestamp);
event ConversionRequested(uint256 usdAmount, uint256 maticAmount);
```

**Pourquoi c'est essentiel** :
- Les restaurants définissent leurs prix en EUR/USD, mais le paiement se fait en MATIC
- Évite les erreurs de conversion manuelle
- Assure que la plateforme reçoit toujours la bonne commission même si le cours crypto varie
- Conversion automatique et précise en temps réel
- Prix décentralisés via Chainlink (pas de point de défaillance unique)

**Utilisation** :
- Appelé automatiquement lors de la création d'une commande
- Backend utilise convertUSDtoMATIC() avant créer order on-chain
- Frontend affiche prix en EUR et MATIC simultanément

**Gas Estimation** :
- getLatestPrice() : ~30,000 gas
- convertUSDtoMATIC() : ~35,000 gas

---

### DoneGPSOracle.sol

**Rôle** : Oracle GPS pour vérification de livraison on-chain avec preuve cryptographique de position.

**Imports** :
```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

**Structs** :
```solidity
struct GPSLocation {
  int256 latitude;   // Latitude * 1e6 (precision 6 decimals)
  int256 longitude;  // Longitude * 1e6
  uint256 timestamp;
  address deliverer;
  bool verified;
}

struct DeliveryRoute {
  uint256 orderId;
  GPSLocation[] locations;
  uint256 totalDistance;  // in meters
  uint256 startTime;
  uint256 endTime;
}
```

**Variables d'état** :
```solidity
bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

// orderId => DeliveryRoute
mapping(uint256 => DeliveryRoute) public deliveryRoutes;

// orderId => current location
mapping(uint256 => GPSLocation) public currentLocations;

uint256 public constant DELIVERY_RADIUS = 100; // meters
uint256 public constant EARTH_RADIUS = 6371000; // meters
```

**Fonctions principales** :

**1. updateLocation(uint256 orderId, int256 lat, int256 lng)**
- Rôle : Met à jour la position du livreur en temps réel
- Modifiers : onlyRole(DELIVERER_ROLE)
- Params : orderId, latitude (lat * 1e6), longitude (lng * 1e6)
- Validations :
  - Order existe et status IN_DELIVERY
  - Livreur assigné à cette order
  - Coordinates valides (-90 <= lat <= 90, -180 <= lng <= 180)

Pseudo-code :
```solidity
function updateLocation(
  uint256 orderId,
  int256 lat,
  int256 lng
) external onlyRole(DELIVERER_ROLE) {
  // Validations
  require(orderExists(orderId), "Order not found");
  require(isDelivererAssigned(orderId, msg.sender), "Not assigned");
  require(lat >= -90000000 && lat <= 90000000, "Invalid latitude");
  require(lng >= -180000000 && lng <= 180000000, "Invalid longitude");

  // Create GPS location
  GPSLocation memory location = GPSLocation({
    latitude: lat,
    longitude: lng,
    timestamp: block.timestamp,
    deliverer: msg.sender,
    verified: false
  });

  // Update current location
  currentLocations[orderId] = location;

  // Add to route history
  deliveryRoutes[orderId].locations.push(location);

  // Calculate distance if previous location exists
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
```

**2. verifyDelivery(uint256 orderId, int256 clientLat, int256 clientLng)**
- Rôle : Vérifie que le livreur est proche du client pour valider la livraison
- Modifiers : onlyRole(ORACLE_ROLE)
- Returns : bool (true si distance <= DELIVERY_RADIUS)

Pseudo-code :
```solidity
function verifyDelivery(
  uint256 orderId,
  int256 clientLat,
  int256 clientLng
) external view returns (bool) {
  // Get current deliverer location
  GPSLocation memory delivererLocation = currentLocations[orderId];

  require(delivererLocation.timestamp > 0, "No location data");

  // Calculate distance between deliverer and client
  uint256 distance = calculateDistance(
    delivererLocation.latitude,
    delivererLocation.longitude,
    clientLat,
    clientLng
  );

  // Check if within delivery radius (100m)
  return distance <= DELIVERY_RADIUS;
}
```

**3. calculateDistance(int256 lat1, int256 lng1, int256 lat2, int256 lng2)**
- Rôle : Calcule la distance entre deux points GPS (formule Haversine)
- Visibilité : public pure
- Returns : distance en mètres (uint256)

Pseudo-code :
```solidity
function calculateDistance(
  int256 lat1,
  int256 lng1,
  int256 lat2,
  int256 lng2
) public pure returns (uint256) {
  // Convert to radians (coordinates are in 1e6 format)
  int256 dLat = (lat2 - lat1) * 1e12 / 57295779513; // PI/180 * 1e18
  int256 dLng = (lng2 - lng1) * 1e12 / 57295779513;

  int256 lat1Rad = lat1 * 1e12 / 57295779513;
  int256 lat2Rad = lat2 * 1e12 / 57295779513;

  // Haversine formula
  // a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLng/2)
  // c = 2 * atan2(√a, √(1-a))
  // distance = R * c

  // Simplified implementation using integer math
  int256 a = (dLat * dLat / 4) +
             (cos(lat1Rad) * cos(lat2Rad) * dLng * dLng / 4);

  uint256 distance = uint256(EARTH_RADIUS * 2 * sqrt(a));

  return distance;
}
```

**4. getDeliveryRoute(uint256 orderId)**
- Rôle : Récupère l'historique complet du trajet
- Returns : (locations[], totalDistance, startTime, endTime)

**5. setDeliveryRadius(uint256 newRadius)**
- Rôle : Modifier le rayon de livraison acceptable
- Modifiers : onlyOwner

**Events** :
```solidity
event LocationUpdated(uint256 indexed orderId, int256 lat, int256 lng, uint256 timestamp);
event DeliveryVerified(uint256 indexed orderId, uint256 distance, bool verified);
event RouteCompleted(uint256 indexed orderId, uint256 totalDistance, uint256 duration);
```

**Pourquoi c'est puissant** :
- Preuve cryptographique de livraison : blockchain enregistre position exacte
- Anti-fraude : livreur ne peut pas confirmer livraison à distance
- Automatisation litiges basés sur localisation
- Traçabilité complète du trajet
- Calcul distance précis on-chain
- Protection client et livreur

**Sécurité** :
- AccessControl : seul livreur assigné peut update sa position
- Vérification distance minimale pour confirmer livraison
- Enregistrement immuable de toutes positions GPS
- Timestamps pour prouver timing

**Gas Estimation** :
- updateLocation() : ~80,000 gas
- verifyDelivery() : ~50,000 gas
- calculateDistance() : ~30,000 gas

---

### DoneWeatherOracle.sol

**Rôle** : Oracle météo (bonus) pour adapter conditions de livraison selon météo.

**Imports** :
```solidity
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

**Enums** :
```solidity
enum WeatherCondition {
  SUNNY,      // 0 - Conditions normales
  CLOUDY,     // 1 - Nuageux
  RAINY,      // 2 - Pluie (frais légèrement augmentés)
  SNOWY,      // 3 - Neige (frais augmentés)
  STORM       // 4 - Tempête (annulation gratuite possible)
}
```

**Structs** :
```solidity
struct WeatherData {
  WeatherCondition condition;
  int256 temperature;  // Celsius * 100
  uint256 timestamp;
  bool isExtreme;      // true si conditions extrêmes
}
```

**Variables d'état** :
```solidity
// location hash => WeatherData
mapping(bytes32 => WeatherData) public weatherByLocation;

// Weather impact multipliers (en basis points, 10000 = 100%)
mapping(WeatherCondition => uint256) public deliveryFeeMultipliers;

uint256 public constant UPDATE_INTERVAL = 1 hours;
```

**Constructeur** :
```solidity
constructor() {
  // Initialize fee multipliers
  deliveryFeeMultipliers[WeatherCondition.SUNNY] = 10000;   // 100% (no change)
  deliveryFeeMultipliers[WeatherCondition.CLOUDY] = 10000;  // 100%
  deliveryFeeMultipliers[WeatherCondition.RAINY] = 12000;   // 120% (+20%)
  deliveryFeeMultipliers[WeatherCondition.SNOWY] = 15000;   // 150% (+50%)
  deliveryFeeMultipliers[WeatherCondition.STORM] = 20000;   // 200% (+100%)
}
```

**Fonctions principales** :

**1. updateWeather(int256 lat, int256 lng, WeatherCondition condition, int256 temperature)**
- Rôle : Met à jour données météo pour une localisation
- Modifiers : onlyOwner ou ORACLE_ROLE
- Params : latitude, longitude, condition météo, température

Pseudo-code :
```solidity
function updateWeather(
  int256 lat,
  int256 lng,
  WeatherCondition condition,
  int256 temperature
) external onlyOwner {
  // Create location hash
  bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));

  // Check update interval
  WeatherData storage weather = weatherByLocation[locationHash];
  require(
    block.timestamp >= weather.timestamp + UPDATE_INTERVAL,
    "Too soon to update"
  );

  // Determine if extreme conditions
  bool isExtreme = (condition == WeatherCondition.STORM) ||
                   (condition == WeatherCondition.SNOWY) ||
                   (temperature < -1000 || temperature > 4000); // < -10°C ou > 40°C

  // Update weather data
  weather.condition = condition;
  weather.temperature = temperature;
  weather.timestamp = block.timestamp;
  weather.isExtreme = isExtreme;

  emit WeatherUpdated(locationHash, condition, temperature, isExtreme);
}
```

**2. getWeather(int256 lat, int256 lng)**
- Rôle : Récupère données météo pour une localisation
- Returns : (WeatherCondition, temperature, timestamp, isExtreme)

Pseudo-code :
```solidity
function getWeather(int256 lat, int256 lng)
  external view returns (WeatherCondition, int256, uint256, bool)
{
  bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
  WeatherData memory weather = weatherByLocation[locationHash];

  require(weather.timestamp > 0, "No weather data");

  // Check if data is fresh (< 6 hours old)
  require(
    block.timestamp <= weather.timestamp + 6 hours,
    "Weather data outdated"
  );

  return (
    weather.condition,
    weather.temperature,
    weather.timestamp,
    weather.isExtreme
  );
}
```

**3. adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)**
- Rôle : Ajuste frais de livraison selon météo
- Returns : adjusted fee

Pseudo-code :
```solidity
function adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)
  external view returns (uint256)
{
  uint256 multiplier = deliveryFeeMultipliers[condition];

  // Apply multiplier (basis points)
  uint256 adjustedFee = (baseFee * multiplier) / 10000;

  return adjustedFee;
}
```

**4. canDeliver(int256 lat, int256 lng)**
- Rôle : Vérifie si livraison possible selon météo
- Returns : bool

Pseudo-code :
```solidity
function canDeliver(int256 lat, int256 lng) external view returns (bool) {
  bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
  WeatherData memory weather = weatherByLocation[locationHash];

  // Cannot deliver in extreme conditions
  if (weather.isExtreme) {
    return false;
  }

  // Cannot deliver in storm
  if (weather.condition == WeatherCondition.STORM) {
    return false;
  }

  return true;
}
```

**5. setFeeMultiplier(WeatherCondition condition, uint256 multiplier)**
- Rôle : Modifier multiplicateur de frais pour une condition
- Modifiers : onlyOwner

**Events** :
```solidity
event WeatherUpdated(bytes32 indexed locationHash, WeatherCondition condition, int256 temperature, bool isExtreme);
event DeliveryFeeAdjusted(uint256 baseFee, uint256 adjustedFee, WeatherCondition condition);
event ExtremeWeatherAlert(bytes32 indexed locationHash, WeatherCondition condition);
```

**Exemples d'usages** :
- Adapter frais de livraison selon météo (pluie +20%, neige +50%, tempête +100%)
- Ajuster automatiquement ETA selon météo
- Protéger livreurs : annulations gratuites lors de tempête
- Bonus pour livreurs qui livrent par mauvais temps
- Alertes météo pour utilisateurs

**Intégration** :
- Peut utiliser Chainlink Weather Data Feed
- Ou API météo externe (OpenWeatherMap) via oracle personnalisé
- Données mises à jour toutes les heures
- Backend service weatherOracleService.js synchronise données

**Gas Estimation** :
- updateWeather() : ~50,000 gas
- getWeather() : ~10,000 gas
- adjustDeliveryFee() : ~5,000 gas

---

## Architecture Oracles

Les oracles fonctionnent en deux couches :

**1. On-chain (Smart Contracts)** :
- Stockent données vérifiées et immuables
- Exposent fonctions pour accéder aux données
- Garantissent intégrité et traçabilité
- Pas d'accès direct aux APIs externes

**2. Off-chain (Backend Services)** :
- Récupèrent données depuis sources externes (Chainlink, APIs)
- Appellent fonctions contrats pour mettre à jour données
- Synchronisent données périodiquement
- Gèrent authentification et rate limiting

**Flux de données** :
```
Source externe (Chainlink/API)
  → Backend Service (chainlinkService.js, gpsOracleService.js)
  → Oracle Contract (DonePriceOracle.sol, DoneGPSOracle.sol)
  → DoneOrderManager.sol
  → Frontends
```

---

## Dépendances

**Chainlink** :
- @chainlink/contracts pour Price Feed et potentiellement Weather Data

**OpenZeppelin** :
- AccessControl pour gestion des rôles
- Ownable pour fonctions admin
- ReentrancyGuard pour sécurité

**Contrats internes** :
- DoneOrderManager appelle oracles pour validations
- Backend services synchronisent données

---

## Déploiement

Ordre de déploiement :
1. DoneToken
2. DonePaymentSplitter
3. DoneStaking
4. DoneOrderManager
5. **DonePriceOracle** (avec address Chainlink Price Feed)
6. **DoneGPSOracle**
7. **DoneWeatherOracle** (optionnel)

Configuration post-déploiement :
- Configurer addresses oracles dans DoneOrderManager
- Assigner rôles ORACLE_ROLE aux backend services
- Configurer Chainlink Price Feed address (Mumbai ou Mainnet)

---

## Sécurité

**Validation données** :
- Vérification prix > 0 avant utilisation
- Vérification coordonnées GPS dans ranges valides
- Check timestamps pour fraîcheur données

**Contrôle d'accès** :
- Seuls services autorisés peuvent mettre à jour (ORACLE_ROLE)
- Fonctions admin protégées par onlyOwner
- DELIVERER_ROLE pour updateLocation GPS

**Rate limiting** :
- UPDATE_INTERVAL pour éviter spam d'updates météo
- Coûts gas dissuadent spam

**Source vérifiée** :
- Chainlink = réseau décentralisé d'oracles vérifiés
- Pas de single point of failure

---

## Backend Services

**chainlinkService.js** :
- Fetch prix MATIC/USD depuis DonePriceOracle
- Convertir fiat ↔ crypto pour affichage frontend
- Synchroniser prix avant création commandes

**gpsOracleService.js** :
- Recevoir updates GPS depuis app livreur
- Appeler updateLocation() sur DoneGPSOracle
- Valider livraison via verifyDelivery()
- Enregistrer distances et preuves GPS

**weatherOracleService.js** :
- Fetch météo depuis OpenWeatherMap API
- Appeler updateWeather() toutes les heures
- Calculer frais ajustés selon météo
- Alerter utilisateurs si conditions extrêmes
