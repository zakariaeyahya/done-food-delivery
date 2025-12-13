const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de deploiement des Oracles (Sprint 6)
 *
 * DEPLOIE:
 * 1. DonePriceOracle - Oracle prix Chainlink MATIC/USD
 * 2. DoneGPSOracle - Oracle GPS pour verification livraison
 * 3. DoneWeatherOracle - Oracle meteo (bonus)
 *
 * PREREQUIS:
 * - DoneOrderManager doit etre deploye
 * - Adresses dans deployed-addresses.json
 *
 * UTILISATION:
 * cd contracts
 * npx hardhat run scripts/deploy-oracles.js --network amoy
 */

// Chainlink Price Feed addresses
const CHAINLINK_PRICE_FEEDS = {
  // Polygon Amoy Testnet - MATIC/USD
  amoy: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  // Polygon Mumbai Testnet (deprecated but kept for reference)
  mumbai: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  // Polygon Mainnet - MATIC/USD
  polygon: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  // Localhost (mock)
  localhost: "0x0000000000000000000000000000000000000000",
  hardhat: "0x0000000000000000000000000000000000000000"
};

async function main() {
  console.log("=== DEPLOIEMENT DES ORACLES (Sprint 6) ===\n");
  console.log("Reseau:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Compte deployeur:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH/POL\n");

  // === CHARGER LES ADRESSES EXISTANTES ===
  const addressesPath = path.join(__dirname, "../../deployed-addresses.json");

  if (!fs.existsSync(addressesPath)) {
    console.error("Fichier deployed-addresses.json introuvable!");
    console.error("Executez d'abord: npx hardhat run scripts/deploy-all.js --network <network>");
    process.exit(1);
  }

  const existingAddresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  console.log("Adresses existantes chargees:");
  console.log("- DoneOrderManager:", existingAddresses.DoneOrderManager);
  console.log("- DoneToken:", existingAddresses.DoneToken);

  // === 1. DEPLOIEMENT DonePriceOracle ===
  console.log("\n1. Deploiement DonePriceOracle...");

  const chainlinkPriceFeed = CHAINLINK_PRICE_FEEDS[hre.network.name] || CHAINLINK_PRICE_FEEDS.amoy;
  console.log("   Chainlink Price Feed:", chainlinkPriceFeed);

  let priceOracleAddress;

  // Pour localhost/hardhat, on skip le deploiement de PriceOracle car il necessite un vrai price feed
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("   [SKIP] PriceOracle necessite un vrai Chainlink Price Feed");
    priceOracleAddress = "0x0000000000000000000000000000000000000000";
  } else {
    const DonePriceOracle = await hre.ethers.getContractFactory("DonePriceOracle");
    const priceOracle = await DonePriceOracle.deploy(chainlinkPriceFeed);
    await priceOracle.waitForDeployment();
    priceOracleAddress = await priceOracle.getAddress();
    console.log("   DonePriceOracle deploye a:", priceOracleAddress);

    // Test du prix
    try {
      const [price, decimals, timestamp] = await priceOracle.getLatestPrice();
      console.log("   Prix MATIC/USD:", hre.ethers.formatUnits(price, decimals), "USD");
    } catch (e) {
      console.log("   [WARN] Impossible de lire le prix (normal sur testnet)");
    }
  }

  // === 2. DEPLOIEMENT DoneGPSOracle ===
  console.log("\n2. Deploiement DoneGPSOracle...");

  const DoneGPSOracle = await hre.ethers.getContractFactory("DoneGPSOracle");
  const gpsOracle = await DoneGPSOracle.deploy();
  await gpsOracle.waitForDeployment();
  const gpsOracleAddress = await gpsOracle.getAddress();
  console.log("   DoneGPSOracle deploye a:", gpsOracleAddress);

  // Afficher parametres
  const deliveryRadius = await gpsOracle.deliveryRadius();
  console.log("   Rayon de livraison:", deliveryRadius.toString(), "metres");

  // === 3. DEPLOIEMENT DoneWeatherOracle ===
  console.log("\n3. Deploiement DoneWeatherOracle...");

  const DoneWeatherOracle = await hre.ethers.getContractFactory("DoneWeatherOracle");
  const weatherOracle = await DoneWeatherOracle.deploy();
  await weatherOracle.waitForDeployment();
  const weatherOracleAddress = await weatherOracle.getAddress();
  console.log("   DoneWeatherOracle deploye a:", weatherOracleAddress);

  // Afficher multiplicateurs
  const sunnyMultiplier = await weatherOracle.deliveryFeeMultipliers(0); // SUNNY
  const rainyMultiplier = await weatherOracle.deliveryFeeMultipliers(2); // RAINY
  const stormMultiplier = await weatherOracle.deliveryFeeMultipliers(4); // STORM
  console.log("   Multiplicateurs frais:");
  console.log("   - SUNNY:", Number(sunnyMultiplier) / 100, "%");
  console.log("   - RAINY:", Number(rainyMultiplier) / 100, "%");
  console.log("   - STORM:", Number(stormMultiplier) / 100, "%");

  // === 4. CONFIGURATION DoneOrderManager ===
  console.log("\n4. Configuration DoneOrderManager...");

  if (existingAddresses.DoneOrderManager) {
    const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
    const orderManager = DoneOrderManager.attach(existingAddresses.DoneOrderManager);

    // Configurer Price Oracle (si deploye)
    if (priceOracleAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const tx1 = await orderManager.setPriceOracle(priceOracleAddress);
        await tx1.wait();
        console.log("   PriceOracle configure dans OrderManager");
      } catch (e) {
        console.log("   [WARN] Impossible de configurer PriceOracle:", e.message);
      }
    }

    // Configurer GPS Oracle
    try {
      const tx2 = await orderManager.setGPSOracle(gpsOracleAddress);
      await tx2.wait();
      console.log("   GPSOracle configure dans OrderManager");
    } catch (e) {
      console.log("   [WARN] Impossible de configurer GPSOracle:", e.message);
    }

    // Configurer Weather Oracle
    try {
      const tx3 = await orderManager.setWeatherOracle(weatherOracleAddress);
      await tx3.wait();
      console.log("   WeatherOracle configure dans OrderManager");
    } catch (e) {
      console.log("   [WARN] Impossible de configurer WeatherOracle:", e.message);
    }
  } else {
    console.log("   [SKIP] DoneOrderManager non deploye");
  }

  // === 5. CONFIGURATION DES ROLES ===
  console.log("\n5. Configuration des roles...");

  // Donner ORACLE_ROLE au deployer pour le GPS Oracle
  const ORACLE_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ORACLE_ROLE"));
  try {
    const tx = await gpsOracle.grantRole(ORACLE_ROLE, deployer.address);
    await tx.wait();
    console.log("   ORACLE_ROLE accorde au deployer sur GPSOracle");
  } catch (e) {
    console.log("   [WARN] ORACLE_ROLE deja accorde ou erreur:", e.message);
  }

  // === 6. SAUVEGARDE DES ADRESSES ===
  console.log("\n6. Sauvegarde des adresses...");

  existingAddresses.DonePriceOracle = priceOracleAddress;
  existingAddresses.DoneGPSOracle = gpsOracleAddress;
  existingAddresses.DoneWeatherOracle = weatherOracleAddress;
  existingAddresses.ChainlinkPriceFeed = chainlinkPriceFeed;
  existingAddresses.deployedAt = new Date().toISOString();

  fs.writeFileSync(addressesPath, JSON.stringify(existingAddresses, null, 2));
  console.log("   Adresses sauvegardees dans deployed-addresses.json");

  // === RECAPITULATIF ===
  console.log("\n=== RECAPITULATIF ===");
  console.log("Reseau:", hre.network.name);
  console.log("\nOracles deployes:");
  console.log("- DonePriceOracle:", priceOracleAddress);
  console.log("- DoneGPSOracle:", gpsOracleAddress);
  console.log("- DoneWeatherOracle:", weatherOracleAddress);
  console.log("\nChainlink Price Feed:", chainlinkPriceFeed);

  console.log("\n=== PROCHAINES ETAPES ===");
  console.log("1. Ajoutez ces adresses dans backend/.env:");
  console.log("   PRICE_ORACLE_ADDRESS=" + priceOracleAddress);
  console.log("   GPS_ORACLE_ADDRESS=" + gpsOracleAddress);
  console.log("   WEATHER_ORACLE_ADDRESS=" + weatherOracleAddress);
  console.log("   CHAINLINK_PRICE_FEED_ADDRESS=" + chainlinkPriceFeed);

  console.log("\n2. Pour accorder DELIVERER_ROLE (GPS updates):");
  console.log("   await gpsOracle.grantRole(DELIVERER_ROLE, delivererAddress)");

  console.log("\n3. Pour mettre a jour la meteo:");
  console.log("   await weatherOracle.updateWeather(lat, lng, condition, temperature)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
