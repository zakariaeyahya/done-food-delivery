// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonePriceOracle is Ownable {

    AggregatorV3Interface internal priceFeed;

    uint8 public constant DECIMALS = 18;
    uint256 public constant PRECISION = 1e18;

    event PriceUpdated(int256 price, uint256 timestamp);
    event ConversionRequested(uint256 usdAmount, uint256 maticAmount);

    constructor(address _priceFeedAddress) {
        require(_priceFeedAddress != address(0), "Invalid price feed address");
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function getLatestPrice() public view returns (int256, uint8, uint256) {
        uint80 roundID;
        int256 price;
        uint256 startedAt;
        uint256 timestamp;
        uint80 answeredInRound;

        (
            roundID,
            price,
            startedAt,
            timestamp,
            answeredInRound
        ) = priceFeed.latestRoundData();

        require(price > 0, "Invalid price");
        require(timestamp > 0, "Invalid timestamp");

        return (price, priceFeed.decimals(), timestamp);
    }

    function convertUSDtoMATIC(uint256 usdAmount) public returns (uint256) {
        require(usdAmount > 0, "Amount must be greater than 0");

        (int256 price, uint8 decimals, ) = getLatestPrice();
        uint256 maticUsdPrice = uint256(price);

        uint256 maticAmount = (usdAmount * (10 ** decimals)) / maticUsdPrice;

        emit ConversionRequested(usdAmount, maticAmount);

        return maticAmount;
    }

    function convertMATICtoUSD(uint256 maticAmount) public returns (uint256) {
        require(maticAmount > 0, "Amount must be greater than 0");

        (int256 price, uint8 decimals, ) = getLatestPrice();
        uint256 maticUsdPrice = uint256(price);

        uint256 usdAmount = (maticAmount * maticUsdPrice) / (10 ** decimals);

        emit ConversionRequested(usdAmount, maticAmount);

        return usdAmount;
    }

    function getPriceWithAge() public view returns (int256, uint256) {
        (int256 price, , uint256 timestamp) = getLatestPrice();
        uint256 age = block.timestamp - timestamp;
        return (price, age);
    }

    function updatePriceFeed(address _newPriceFeedAddress) external onlyOwner {
        require(_newPriceFeedAddress != address(0), "Invalid address");
        priceFeed = AggregatorV3Interface(_newPriceFeedAddress);
    }
}
