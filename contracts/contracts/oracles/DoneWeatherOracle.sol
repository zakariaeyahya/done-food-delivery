// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DoneWeatherOracle is Ownable {

    enum WeatherCondition {
        SUNNY,
        CLOUDY,
        RAINY,
        SNOWY,
        STORM
    }

    struct WeatherData {
        WeatherCondition condition;
        int256 temperature;
        uint256 timestamp;
        bool isExtreme;
    }

    uint256 public constant UPDATE_INTERVAL = 1 hours;

    mapping(bytes32 => WeatherData) public weatherByLocation;
    mapping(WeatherCondition => uint256) public deliveryFeeMultipliers;

    event WeatherUpdated(bytes32 indexed locationHash, WeatherCondition condition, int256 temperature, bool isExtreme);
    event DeliveryFeeAdjusted(uint256 baseFee, uint256 adjustedFee, WeatherCondition condition);
    event ExtremeWeatherAlert(bytes32 indexed locationHash, WeatherCondition condition);

    constructor() {
        deliveryFeeMultipliers[WeatherCondition.SUNNY] = 10000;
        deliveryFeeMultipliers[WeatherCondition.CLOUDY] = 10000;
        deliveryFeeMultipliers[WeatherCondition.RAINY] = 12000;
        deliveryFeeMultipliers[WeatherCondition.SNOWY] = 15000;
        deliveryFeeMultipliers[WeatherCondition.STORM] = 20000;
    }

    function updateWeather(
        int256 lat,
        int256 lng,
        WeatherCondition condition,
        int256 temperature
    ) external onlyOwner {

        bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
        WeatherData storage weather = weatherByLocation[locationHash];

        require(
            block.timestamp >= weather.timestamp + UPDATE_INTERVAL,
            "Too soon to update"
        );

        bool isExtreme =
            condition == WeatherCondition.STORM ||
            condition == WeatherCondition.SNOWY ||
            temperature < -1000 || temperature > 4000;

        weather.condition = condition;
        weather.temperature = temperature;
        weather.timestamp = block.timestamp;
        weather.isExtreme = isExtreme;

        emit WeatherUpdated(locationHash, condition, temperature, isExtreme);

        if (isExtreme) {
            emit ExtremeWeatherAlert(locationHash, condition);
        }
    }

    function getWeather(int256 lat, int256 lng)
        external
        view
        returns (WeatherCondition, int256, uint256, bool)
    {
        bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
        WeatherData memory weather = weatherByLocation[locationHash];

        require(weather.timestamp > 0, "No weather data");
        require(block.timestamp <= weather.timestamp + 6 hours, "Weather data outdated");

        return (
            weather.condition,
            weather.temperature,
            weather.timestamp,
            weather.isExtreme
        );
    }

    function adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)
        external
        view
        returns (uint256)
    {
        uint256 multiplier = deliveryFeeMultipliers[condition];
        uint256 adjustedFee = (baseFee * multiplier) / 10000;
        return adjustedFee;
    }

    function canDeliver(int256 lat, int256 lng) external view returns (bool) {
        bytes32 locationHash = keccak256(abi.encodePacked(lat, lng));
        WeatherData memory weather = weatherByLocation[locationHash];

        if (weather.isExtreme) return false;
        if (weather.condition == WeatherCondition.STORM) return false;

        return true;
    }

    function setFeeMultiplier(WeatherCondition condition, uint256 multiplier)
        external
        onlyOwner
    {
        require(multiplier > 0, "Multiplier must be greater than 0");
        deliveryFeeMultipliers[condition] = multiplier;
    }
}
