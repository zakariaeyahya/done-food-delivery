// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonePriceOracle
 * @notice Oracle de prix MATIC/USD utilisant Chainlink Price Feed
 * @dev Permet conversion automatique USD ↔ MATIC en temps réel
 * @dev Utilisé par DoneOrderManager pour convertir prix fiat en crypto
 */

// TODO: Importer AggregatorV3Interface de Chainlink
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// TODO: Importer Ownable d'OpenZeppelin
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Contrat DonePriceOracle hérite de Ownable
 */
// TODO: Définir le contrat
// contract DonePriceOracle is Ownable {

    // === VARIABLES D'ÉTAT ===
    
    // TODO: Définir priceFeed (AggregatorV3Interface)
    // AggregatorV3Interface internal priceFeed;
    
    // TODO: Définir constantes
    // uint8 public constant DECIMALS = 18;
    // uint256 public constant PRECISION = 1e18;
    
    // === EVENTS ===
    
    /**
     * @notice Émis quand le prix est mis à jour
     * @param price Prix MATIC/USD
     * @param timestamp Timestamp de la mise à jour
     */
    // TODO: Définir event PriceUpdated
    // event PriceUpdated(int256 price, uint256 timestamp);
    
    /**
     * @notice Émis lors d'une conversion
     * @param usdAmount Montant USD
     * @param maticAmount Montant MATIC converti
     */
    // TODO: Définir event ConversionRequested
    // event ConversionRequested(uint256 usdAmount, uint256 maticAmount);
    
    // === CONSTRUCTOR ===
    
    /**
     * @notice Constructeur du contrat DonePriceOracle
     * @param _priceFeedAddress Adresse du Chainlink Price Feed (MATIC/USD)
     * @dev Mumbai Testnet: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     * @dev Mainnet: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
     */
    // TODO: Implémenter constructor(address _priceFeedAddress)
    // constructor(address _priceFeedAddress) Ownable(msg.sender) {
    //     require(_priceFeedAddress != address(0), "Invalid price feed address");
    //     priceFeed = AggregatorV3Interface(_priceFeedAddress);
    // }
    
    // === FONCTIONS PRINCIPALES ===
    
    /**
     * @notice Récupère le prix MATIC/USD en temps réel depuis Chainlink
     * @return price Prix MATIC/USD (int256)
     * @return decimals Nombre de décimales (uint8)
     * @return timestamp Timestamp de la donnée (uint256)
     * @dev Gas estimé: ~30,000
     */
    // TODO: Implémenter getLatestPrice()
    // function getLatestPrice() public view returns (int256, uint8, uint256) {
    //     // TODO: Appeler priceFeed.latestRoundData()
    //     // (
    //     //     uint80 roundID,
    //     //     int256 price,
    //     //     uint256 startedAt,
    //     //     uint256 timeStamp,
    //     //     uint80 answeredInRound
    //     // ) = priceFeed.latestRoundData();
    //     
    //     // TODO: Valider price > 0
    //     // require(price > 0, "Invalid price");
    //     
    //     // TODO: Valider timeStamp > 0
    //     // require(timeStamp > 0, "Invalid timestamp");
    //     
    //     // TODO: Récupérer decimals depuis priceFeed
    //     // uint8 decimals = priceFeed.decimals();
    //     
    //     // TODO: Retourner (price, decimals, timeStamp)
    //     // return (price, decimals, timeStamp);
    // }
    
    /**
     * @notice Convertit un montant USD en MATIC
     * @param usdAmount Montant en USD (avec 18 decimals)
     * @return maticAmount Montant en MATIC (wei)
     * @dev Formula: usdAmount * 10^decimals / price
     * @dev Gas estimé: ~35,000
     */
    // TODO: Implémenter convertUSDtoMATIC(uint256 usdAmount)
    // function convertUSDtoMATIC(uint256 usdAmount) public view returns (uint256) {
    //     // TODO: Valider usdAmount > 0
    //     // require(usdAmount > 0, "Amount must be greater than 0");
    //     
    //     // TODO: Récupérer prix via getLatestPrice()
    //     // (int256 price, uint8 decimals, ) = getLatestPrice();
    //     
    //     // TODO: Valider price > 0
    //     // require(price > 0, "Invalid price");
    //     
    //     // TODO: Convertir price en uint256
    //     // uint256 maticUsdPrice = uint256(price);
    //     
    //     // TODO: Calculer maticAmount = (usdAmount * 10^decimals) / maticUsdPrice
    //     // uint256 maticAmount = (usdAmount * (10 ** decimals)) / maticUsdPrice;
    //     
    //     // TODO: Émettre event ConversionRequested
    //     // emit ConversionRequested(usdAmount, maticAmount);
    //     
    //     // TODO: Retourner maticAmount
    //     // return maticAmount;
    // }
    
    /**
     * @notice Convertit un montant MATIC en USD
     * @param maticAmount Montant en MATIC (wei)
     * @return usdAmount Montant en USD (avec 18 decimals)
     * @dev Formula: maticAmount * price / 10^decimals
     * @dev Gas estimé: ~35,000
     */
    // TODO: Implémenter convertMATICtoUSD(uint256 maticAmount)
    // function convertMATICtoUSD(uint256 maticAmount) public view returns (uint256) {
    //     // TODO: Valider maticAmount > 0
    //     // require(maticAmount > 0, "Amount must be greater than 0");
    //     
    //     // TODO: Récupérer prix via getLatestPrice()
    //     // (int256 price, uint8 decimals, ) = getLatestPrice();
    //     
    //     // TODO: Valider price > 0
    //     // require(price > 0, "Invalid price");
    //     
    //     // TODO: Convertir price en uint256
    //     // uint256 maticUsdPrice = uint256(price);
    //     
    //     // TODO: Calculer usdAmount = (maticAmount * maticUsdPrice) / (10 ** decimals)
    //     // uint256 usdAmount = (maticAmount * maticUsdPrice) / (10 ** decimals);
    //     
    //     // TODO: Émettre event ConversionRequested
    //     // emit ConversionRequested(usdAmount, maticAmount);
    //     
    //     // TODO: Retourner usdAmount
    //     // return usdAmount;
    // }
    
    /**
     * @notice Récupère le prix avec l'âge de la donnée
     * @return price Prix MATIC/USD
     * @return age Âge de la donnée en secondes
     * @dev Utile pour vérifier la fraîcheur des données
     */
    // TODO: Implémenter getPriceWithAge()
    // function getPriceWithAge() public view returns (int256, uint256) {
    //     // TODO: Récupérer prix via getLatestPrice()
    //     // (int256 price, , uint256 timestamp) = getLatestPrice();
    //     
    //     // TODO: Calculer age = block.timestamp - timestamp
    //     // uint256 age = block.timestamp - timestamp;
    //     
    //     // TODO: Retourner (price, age)
    //     // return (price, age);
    // }
    
    // === FONCTIONS ADMIN (onlyOwner) ===
    
    /**
     * @notice Met à jour l'adresse du Price Feed (onlyOwner)
     * @param _newPriceFeedAddress Nouvelle adresse du Price Feed
     * @dev Permet de changer de réseau ou de Price Feed
     */
    // TODO: Implémenter updatePriceFeed(address _newPriceFeedAddress)
    // function updatePriceFeed(address _newPriceFeedAddress) external onlyOwner {
    //     // TODO: Valider nouvelle adresse
    //     // require(_newPriceFeedAddress != address(0), "Invalid address");
    //     
    //     // TODO: Mettre à jour priceFeed
    //     // priceFeed = AggregatorV3Interface(_newPriceFeedAddress);
    // }
// }

