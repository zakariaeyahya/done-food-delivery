const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de deploiement du contrat DoneArbitration
 *
 * PREREQUIS:
 * - DoneToken doit etre deploye (adresse dans deployed-addresses.json)
 * - DoneOrderManager doit etre deploye (optionnel mais recommande)
 *
 * UTILISATION:
 * cd contracts
 * npx hardhat run scripts/deploy-arbitration.js --network amoy
 * npx hardhat run scripts/deploy-arbitration.js --network localhost
 */
async function main() {
  console.log("=== DEPLOIEMENT DONEARBITRATION ===\n");
  console.log("Reseau:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Compte deployeur:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH/POL\n");

  // === CHARGER LES ADRESSES EXISTANTES ===
  // Le fichier est dans le dossier parent (done/)
  const addressesPath = path.join(__dirname, "../../deployed-addresses.json");

  if (!fs.existsSync(addressesPath)) {
    console.error("Fichier deployed-addresses.json introuvable!");
    console.error("Executez d'abord: npx hardhat run scripts/deploy-all.js --network <network>");
    process.exit(1);
  }

  const existingAddresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  console.log("Adresses existantes chargees:");
  console.log("- DoneToken:", existingAddresses.DoneToken);
  console.log("- DoneOrderManager:", existingAddresses.DoneOrderManager);

  if (!existingAddresses.DoneToken) {
    console.error("Adresse DoneToken manquante!");
    process.exit(1);
  }

  // === DEPLOIEMENT DONEARBITRATION ===
  console.log("\n1. Deploiement DoneArbitration...");

  const DoneArbitration = await hre.ethers.getContractFactory("DoneArbitration");

  // Constructor: address _doneToken, address payable _platformWallet
  const arbitration = await DoneArbitration.deploy(
    existingAddresses.DoneToken,
    deployer.address // platformWallet
  );

  await arbitration.waitForDeployment();
  const arbitrationAddress = await arbitration.getAddress();
  console.log("DoneArbitration deploye a:", arbitrationAddress);

  // === CONFIGURATION POST-DEPLOIEMENT ===
  console.log("\n2. Configuration post-deploiement...");

  // Configurer OrderManager si existant
  if (existingAddresses.DoneOrderManager) {
    console.log("Configuration de OrderManager dans Arbitration...");
    await arbitration.setOrderManager(existingAddresses.DoneOrderManager);
    console.log("OrderManager configure");
  }

  // Afficher les parametres par defaut
  const votingPeriod = await arbitration.votingPeriod();
  const minVotingPower = await arbitration.minVotingPowerRequired();
  const minTokensToVote = await arbitration.minTokensToVote();
  const arbitrationFee = await arbitration.arbitrationFeePercent();

  console.log("\n3. Parametres par defaut:");
  console.log("- Periode de vote:", Number(votingPeriod) / 3600, "heures");
  console.log("- Quorum minimum:", hre.ethers.formatEther(minVotingPower), "DONE");
  console.log("- Minimum pour voter:", hre.ethers.formatEther(minTokensToVote), "DONE");
  console.log("- Frais d'arbitrage:", Number(arbitrationFee), "%");

  // === MISE A JOUR deployed-addresses.json ===
  console.log("\n4. Sauvegarde des adresses...");

  existingAddresses.DoneArbitration = arbitrationAddress;
  existingAddresses.deployedAt = new Date().toISOString();

  fs.writeFileSync(addressesPath, JSON.stringify(existingAddresses, null, 2));
  console.log("Adresse sauvegardee dans deployed-addresses.json");

  // === RECAPITULATIF ===
  console.log("\n=== RECAPITULATIF ===");
  console.log("Reseau:", hre.network.name);
  console.log("DoneArbitration:", arbitrationAddress);
  console.log("DoneToken:", existingAddresses.DoneToken);
  console.log("DoneOrderManager:", existingAddresses.DoneOrderManager || "Non configure");

  console.log("\n=== PROCHAINES ETAPES ===");
  console.log("1. Ajoutez cette adresse dans backend/.env:");
  console.log("   ARBITRATION_ADDRESS=" + arbitrationAddress);
  console.log("\n2. Pour ajouter des arbitres:");
  console.log("   await arbitration.addArbiter(\"0xAdresseArbitre\")");
  console.log("\n3. Pour modifier les parametres:");
  console.log("   await arbitration.setVotingPeriod(24 * 3600) // 24h");
  console.log("   await arbitration.setMinVotingPowerRequired(ethers.parseEther(\"500\"))");

  console.log("\n=== WORKFLOW D'UTILISATION ===");
  console.log(`
1. CREER UN LITIGE:
   arbitration.createDispute{value: escrowAmount}(
     orderId, client, restaurant, deliverer, "raison", "ipfsHash"
   )

2. VOTER (detenteurs de DONE):
   arbitration.voteDispute(disputeId, 1) // 1=CLIENT, 2=RESTAURANT, 3=DELIVERER

3. RESOUDRE (apres 48h ou quorum):
   arbitration.resolveDispute(disputeId)
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
