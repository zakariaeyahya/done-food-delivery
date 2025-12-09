import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de configuration des rôles AccessControl
 * @notice Configure les rôles RESTAURANT, DELIVERER, ARBITRATOR et PLATFORM
 * @dev Prérequis: Les contrats doivent être déployés (deployed-addresses.json doit exister)
 * @dev Le compte exécutant doit avoir DEFAULT_ADMIN_ROLE sur DoneOrderManager
 */
async function main() {
  console.log("Configuration des rôles sur", hre.network.name);

  // === ÉTAPE 1: CHARGER LES ADRESSES DÉPLOYÉES ===
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  if (!fs.existsSync(addressesPath)) {
    throw new Error("Fichier deployed-addresses.json introuvable. Exécutez d'abord deploy-all.js");
  }
  
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const [admin] = await hre.ethers.getSigners();
  console.log("Admin:", admin.address);

  // === ÉTAPE 2: RÉCUPÉRER L'INSTANCE DU CONTRAT ===
  const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  const orderManager = await DoneOrderManager.attach(addresses.DoneOrderManager);

  // === ÉTAPE 3: RÉCUPÉRER LES RÔLES ===
  const CLIENT_ROLE = await orderManager.CLIENT_ROLE();
  const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
  const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
  const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
  const ARBITRATOR_ROLE = await orderManager.ARBITRATOR_ROLE();

  console.log("\nRôles disponibles:");
  console.log("CLIENT_ROLE:", CLIENT_ROLE);
  console.log("RESTAURANT_ROLE:", RESTAURANT_ROLE);
  console.log("DELIVERER_ROLE:", DELIVERER_ROLE);
  console.log("PLATFORM_ROLE:", PLATFORM_ROLE);
  console.log("ARBITRATOR_ROLE:", ARBITRATOR_ROLE);

  // === ÉTAPE 4: DÉFINIR LES ADRESSES ===
  // Sur un réseau réel (Amoy), on utilise des adresses fixes
  // Modifiez ces adresses selon vos besoins
  
  // En mode test/dev, l'admin a tous les rôles
  // Pour ajouter des restaurants spécifiques, ajoutez leurs adresses ici
  const restaurantAddresses = [
    admin.address // L'admin a tous les rôles pour les tests
  ];

  const delivererAddresses = [
    admin.address // L'admin peut aussi être livreur pour les tests
  ];

  const arbitratorAddresses = [
    admin.address // L'admin est aussi arbitre
  ];

  const platformAddress = admin.address; // L'admin est la plateforme

  // === ÉTAPE 5: ASSIGNER LE RÔLE RESTAURANT ===
  console.log("\nAssignation rôle RESTAURANT...");
  
  for (const addr of restaurantAddresses) {
    const tx = await orderManager.grantRole(RESTAURANT_ROLE, addr);
    await tx.wait();
    console.log("Restaurant autorisé:", addr);
  }

  // === ÉTAPE 6: ASSIGNER LE RÔLE DELIVERER ===
  console.log("\nAssignation rôle DELIVERER...");
  
  for (const addr of delivererAddresses) {
    const tx = await orderManager.grantRole(DELIVERER_ROLE, addr);
    await tx.wait();
    console.log("Livreur autorisé:", addr);
  }

  // === ÉTAPE 7: ASSIGNER LE RÔLE ARBITRATOR ===
  console.log("\nAssignation rôle ARBITRATOR...");
  
  for (const addr of arbitratorAddresses) {
    const tx = await orderManager.grantRole(ARBITRATOR_ROLE, addr);
    await tx.wait();
    console.log("Arbitre autorisé:", addr);
  }

  // === ÉTAPE 8: ASSIGNER LE RÔLE PLATFORM ===
  console.log("\nAssignation rôle PLATFORM...");
  
  const tx = await orderManager.grantRole(PLATFORM_ROLE, platformAddress);
  await tx.wait();
  console.log("Plateforme autorisée:", platformAddress);

  // === ÉTAPE 9: VÉRIFICATION ===
  console.log("\n=== VÉRIFICATION DES RÔLES ===");
  
  console.log("Restaurant 1 a le rôle?", await orderManager.hasRole(RESTAURANT_ROLE, restaurantAddresses[0]));
  console.log("Livreur 1 a le rôle?", await orderManager.hasRole(DELIVERER_ROLE, delivererAddresses[0]));
  console.log("Admin a le rôle ARBITRATOR?", await orderManager.hasRole(ARBITRATOR_ROLE, admin.address));
  console.log("Admin a le rôle PLATFORM?", await orderManager.hasRole(PLATFORM_ROLE, platformAddress));

  console.log("\nConfiguration des rôles terminée.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
