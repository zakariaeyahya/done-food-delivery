// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DoneWeatherOracle
 * @notice Oracle météo pour adapter conditions de livraison selon météo
 * @dev Bonus: Permet d'ajuster frais de livraison et ETA selon conditions météo
 */

// TODO: Importer Ownable d'OpenZeppelin
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Contrat DoneWeatherOracle hérite de Ownable
 */
// TODO: Définir le contrat
// contract DoneWeatherOracle is Ownable {

    // === ENUMS ===
    
    /**
     * @notice Conditions météo possibles
     */
    // TODO: Définir enum WeatherCondition
    // enum WeatherCondition {
    //     SUNNY,      // 0 - Conditions normales
    //     CLOUDY,     // 1 - Nuageux
    //     RAINY,      // 2 - Pluie (frais légèrement augmentés)
    //     SNOWY,      // 3 - Neige (frais augmentés)
    //     STORM       // 4 - Tempête (annulation gratuite possible)
    // }
    
    // === STRUCTS ===
    
    /**
     * @notice Structure pour données météo
     */
    // TODO: Définir struct WeatherData
    // struct WeatherData {
    //     WeatherCondition condition;
    //     int256 temperature;  // Celsius * 100
    //     uint256 timestamp;
    //     bool isExtreme;      // true si conditions extrêmes
    // }
    
    // === CONSTANTES ===
    
    // TODO: Définir UPDATE_INTERVAL (1 hour)
    // uint256 public constant UPDATE_INTERVAL = 1 hours;
    
    // === VARIABLES D'ÉTAT ===
    
    // TODO: Mapping locationHash => WeatherData
    // mapping(bytes32 => WeatherData) public weatherByLocation;
    
    // TODO: Mapping WeatherCondition => multiplier (en basis points, 10000 = 100%)
    // mapping(WeatherCondition => uint256) public deliveryFeeMultipliers;
    
    // === EVENTS ===
    
    /**
     * @notice Émis quand météo est mise à jour
     */
    // TODO: Définir event WeatherUpdated
    // event WeatherUpdated(
    //     bytes32 indexed locationHash,
    //     WeatherCondition condition,
    //     int256 temperature,
    //     bool isExtreme
    // );
    
    /**
     * @notice Émis quand frais sont ajustés
     */
    // TODO: Définir event DeliveryFeeAdjusted
    // event DeliveryFeeAdjusted(
    //     uint256 baseFee,
    //     uint256 adjustedFee,
    //     WeatherCondition condition
    // );
    
    /**
     * @notice Émis lors d'alerte météo extrême
     */
    // TODO: Définir event ExtremeWeatherAlert
    // event ExtremeWeatherAlert(
    //     bytes32 indexed locationHash,
    //     WeatherCondition condition
    // );
    
    // === CONSTRUCTOR ===
    
    /**
     * @notice Constructeur du contrat DoneWeatherOracle
     * @dev Initialise les multiplicateurs de frais
     */
    // TODO: Implémenter constructor()
    // constructor() Ownable(msg.sender) {
    //     // TODO: Initialiser deliveryFeeMultipliers
    //     // deliveryFeeMultipliers[WeatherCondition.SUNNY] = 10000;   // 100%
    //     // deliveryFeeMultipliers[WeatherCondition.CLOUDY] = 10000;  // 100%
    //     // deliveryFeeMultipliers[WeatherCondition.RAINY] = 12000;   // 120% (+20%)
    //     // deliveryFeeMultipliers[WeatherCondition.SNOWY] = 15000;   // 150% (+50%)
    //     // deliveryFeeMultipliers[WeatherCondition.STORM] = 20000;   // 200% (+100%)
    // }
    
    // === FONCTIONS PRINCIPALES ===
    
    /**
     * @notice Met à jour données météo pour une localisation
     * @param lat Latitude * 1e6
     * @param lng Longitude * 1e6
     * @param condition Condition météo
     * @param temperature Température en Celsius * 100
     * @dev Modifiers: onlyOwner
     * @dev Gas estimé: ~50,000
     */
    // TODO: Implémenter updateWeather(int256 lat, int256 lng, WeatherCondition condition, int256 temperature)
    // function updateWeather(
    //     int256 lat,
    //     int256 lng,
    //     WeatherCondition condition,
    //     int256 temperature
    // ) external onlyOwner {
    //     // TODO: Créer locationHash
    //     // bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
    //     
    //     // TODO: Vérifier UPDATE_INTERVAL
    //     // WeatherData storage weather = weatherByLocation[locationHash];
    //     // require(
    //     //     block.timestamp >= weather.timestamp + UPDATE_INTERVAL,
    //     //     "Too soon to update"
    //     // );
    //     
    //     // TODO: Déterminer isExtreme
    //     // bool isExtreme = (condition == WeatherCondition.STORM) ||
    //     //                  (condition == WeatherCondition.SNOWY) ||
    //     //                  (temperature < -1000 || temperature > 4000); // < -10°C ou > 40°C
    //     
    //     // TODO: Mettre à jour weatherByLocation[locationHash]
    //     // weather.condition = condition;
    //     // weather.temperature = temperature;
    //     // weather.timestamp = block.timestamp;
    //     // weather.isExtreme = isExtreme;
    //     
    //     // TODO: Émettre event WeatherUpdated
    //     // emit WeatherUpdated(locationHash, condition, temperature, isExtreme);
    //     
    //     // TODO: Si isExtreme, émettre ExtremeWeatherAlert
    //     // SI isExtreme:
    //     //     emit ExtremeWeatherAlert(locationHash, condition);
    // }
    
    /**
     * @notice Récupère données météo pour une localisation
     * @param lat Latitude * 1e6
     * @param lng Longitude * 1e6
     * @return condition Condition météo
     * @return temperature Température en Celsius * 100
     * @return timestamp Timestamp de la donnée
     * @return isExtreme true si conditions extrêmes
     * @dev Gas estimé: ~10,000
     */
    // TODO: Implémenter getWeather(int256 lat, int256 lng)
    // function getWeather(int256 lat, int256 lng) external view returns (
    //     WeatherCondition condition,
    //     int256 temperature,
    //     uint256 timestamp,
    //     bool isExtreme
    // ) {
    //     // TODO: Créer locationHash
    //     // bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
    //     
    //     // TODO: Récupérer WeatherData
    //     // WeatherData memory weather = weatherByLocation[locationHash];
    //     
    //     // TODO: Valider qu'il y a des données
    //     // require(weather.timestamp > 0, "No weather data");
    //     
    //     // TODO: Vérifier données fraîches (< 6 heures)
    //     // require(
    //     //     block.timestamp <= weather.timestamp + 6 hours,
    //     //     "Weather data outdated"
    //     // );
    //     
    //     // TODO: Retourner (weather.condition, weather.temperature, weather.timestamp, weather.isExtreme)
    //     // return (weather.condition, weather.temperature, weather.timestamp, weather.isExtreme);
    // }
    
    /**
     * @notice Ajuste frais de livraison selon météo
     * @param baseFee Frais de base
     * @param condition Condition météo
     * @return adjustedFee Frais ajustés
     * @dev Gas estimé: ~5,000
     */
    // TODO: Implémenter adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)
    // function adjustDeliveryFee(
    //     uint256 baseFee,
    //     WeatherCondition condition
    // ) external view returns (uint256) {
    //     // TODO: Récupérer multiplier
    //     // uint256 multiplier = deliveryFeeMultipliers[condition];
    //     
    //     // TODO: Calculer adjustedFee = (baseFee * multiplier) / 10000
    //     // uint256 adjustedFee = (baseFee * multiplier) / 10000;
    //     
    //     // TODO: Émettre event DeliveryFeeAdjusted
    //     // emit DeliveryFeeAdjusted(baseFee, adjustedFee, condition);
    //     
    //     // TODO: Retourner adjustedFee
    //     // return adjustedFee;
    // }
    
    /**
     * @notice Vérifie si livraison possible selon météo
     * @param lat Latitude * 1e6
     * @param lng Longitude * 1e6
     * @return canDeliver true si livraison possible
     */
    // TODO: Implémenter canDeliver(int256 lat, int256 lng)
    // function canDeliver(int256 lat, int256 lng) external view returns (bool) {
    //     // TODO: Créer locationHash
    //     // bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
    //     
    //     // TODO: Récupérer WeatherData
    //     // WeatherData memory weather = weatherByLocation[locationHash];
    //     
    //     // TODO: Si isExtreme, retourner false
    //     // SI weather.isExtreme:
    //     //     return false;
    //     
    //     // TODO: Si STORM, retourner false
    //     // SI weather.condition == WeatherCondition.STORM:
    //     //     return false;
    //     
    //     // TODO: Retourner true
    //     // return true;
    // }
    
    // === FONCTIONS ADMIN (onlyOwner) ===
    
    /**
     * @notice Modifie multiplicateur de frais pour une condition
     * @param condition Condition météo
     * @param multiplier Nouveau multiplicateur (en basis points)
     * @dev Modifiers: onlyOwner
     */
    // TODO: Implémenter setFeeMultiplier(WeatherCondition condition, uint256 multiplier)
    // function setFeeMultiplier(
    //     WeatherCondition condition,
    //     uint256 multiplier
    // ) external onlyOwner {
    //     // TODO: Valider multiplier > 0
    //     // require(multiplier > 0, "Multiplier must be greater than 0");
    //     
    //     // TODO: Mettre à jour deliveryFeeMultipliers[condition]
    //     // deliveryFeeMultipliers[condition] = multiplier;
    // }
// }

