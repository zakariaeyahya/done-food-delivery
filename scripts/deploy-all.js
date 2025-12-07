import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de déploiement automatique de tous les smart contracts
 * @notice Déploie les contrats dans l'ordre: DoneToken → DonePaymentSplitter → DoneStaking → DoneOrderManager
 * @dev Sauvegarde les adresses dans deployed-addresses.json
 * @dev Configure les autorisations post-déploiement (MINTER_ROLE pour OrderManager)
 */
async function main() {
  console.log("Démarrage du déploiement sur", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Compte déployeur:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  // === ÉTAPE 1: DÉPLOIEMENT DONETOKEN ===
  console.log("\n1. Déploiement DoneToken...");
  
  const DoneToken = await hre.ethers.getContractFactory("DoneToken");
  const doneToken = await DoneToken.deploy();
  await doneToken.waitForDeployment();
  
  const doneTokenAddress = await doneToken.getAddress();
  console.log("DoneToken déployé à:", doneTokenAddress);

  // === ÉTAPE 2: DÉPLOIEMENT DONEPAYMENTSPLITTER ===
  console.log("\n2. Déploiement DonePaymentSplitter...");
  
  const DonePaymentSplitter = await hre.ethers.getContractFactory("DonePaymentSplitter");
  const paymentSplitter = await DonePaymentSplitter.deploy();
  await paymentSplitter.waitForDeployment();
  
  const paymentSplitterAddress = await paymentSplitter.getAddress();
  console.log("DonePaymentSplitter déployé à:", paymentSplitterAddress);

  // === ÉTAPE 3: DÉPLOIEMENT DONESTAKING ===
  console.log("\n3. Déploiement DoneStaking...");
  
  const DoneStaking = await hre.ethers.getContractFactory("DoneStaking");
  const staking = await DoneStaking.deploy();
  await staking.waitForDeployment();
  
  const stakingAddress = await staking.getAddress();
  console.log("DoneStaking déployé à:", stakingAddress);

  // === ÉTAPE 4: DÉPLOIEMENT DONEORDERMANAGER ===
  console.log("\n4. Déploiement DoneOrderManager...");
  
  // Vérification de la balance avant déploiement
  const balanceBefore = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance avant déploiement:", hre.ethers.formatEther(balanceBefore), "POL");
  
  const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  
  // Estimation du gas pour le déploiement
  try {
    const deployTx = await DoneOrderManager.getDeployTransaction(
      paymentSplitterAddress,
      doneTokenAddress,
      stakingAddress,
      deployer.address
    );
    const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
    const feeData = await hre.ethers.provider.getFeeData();
    const estimatedCost = estimatedGas * (feeData.gasPrice || 0n);
    console.log("Coût estimé:", hre.ethers.formatEther(estimatedCost), "POL");
    
    if (balanceBefore < estimatedCost) {
      const needed = estimatedCost - balanceBefore;
      console.error("\n❌ Balance insuffisante!");
      console.error("Il vous manque:", hre.ethers.formatEther(needed), "POL");
      console.error("Obtenez plus de POL via: https://faucet.polygon.technology/");
      console.error("Sélectionnez 'Polygon Amoy' et entrez votre adresse:", deployer.address);
      process.exit(1);
    }
  } catch (error) {
    console.warn("⚠️  Impossible d'estimer le gas, tentative de déploiement quand même...");
  }
  
  const orderManager = await DoneOrderManager.deploy(
    paymentSplitterAddress,  // _paymentSplitterAddress
    doneTokenAddress,         // _tokenAddress
    stakingAddress,           // _stakingAddress
    deployer.address           // _platformAddress
  );
  
  await orderManager.waitForDeployment();
  
  const orderManagerAddress = await orderManager.getAddress();
  console.log("DoneOrderManager déployé à:", orderManagerAddress);

  // === ÉTAPE 5: CONFIGURATION POST-DÉPLOIEMENT ===
  console.log("\n5. Configuration des autorisations...");

  const MINTER_ROLE = await doneToken.MINTER_ROLE();
  await doneToken.grantRole(MINTER_ROLE, orderManagerAddress);
  
  console.log("OrderManager autorisé à mint des tokens");

  // === ÉTAPE 6: SAUVEGARDE DES ADRESSES ===
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    DoneToken: doneTokenAddress,
    DonePaymentSplitter: paymentSplitterAddress,
    DoneStaking: stakingAddress,
    DoneOrderManager: orderManagerAddress,
    platformAddress: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log("\nAdresses sauvegardées dans:", addressesPath);

  // === ÉTAPE 7: RÉCAPITULATIF ===
  console.log("\n=== RÉCAPITULATIF DÉPLOIEMENT ===");
  console.log("Réseau:", hre.network.name);
  console.log("DoneToken:", doneTokenAddress);
  console.log("DonePaymentSplitter:", paymentSplitterAddress);
  console.log("DoneStaking:", stakingAddress);
  console.log("DoneOrderManager:", orderManagerAddress);
  console.log("\nCopiez ces adresses dans backend/.env et frontend/.env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
