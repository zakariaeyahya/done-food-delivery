import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script pour attribuer le rôle RESTAURANT_ROLE à une adresse spécifique
 * @notice Utilisez ce script pour autoriser une adresse à agir comme restaurant
 * @dev Usage: npx hardhat run scripts/grant-restaurant-role.js --network amoy
 */
async function main() {
  // ============================================
  // MODIFIEZ CETTE ADRESSE AVEC VOTRE WALLET
  // ============================================
  const RESTAURANT_ADDRESS = "0x49bef4651a9316b0de3a45f72cede826cafad72a";
  // ============================================

  console.log("Attribution du rôle RESTAURANT_ROLE sur", hre.network.name);
  console.log("Adresse cible:", RESTAURANT_ADDRESS);

  // === ÉTAPE 1: CHARGER LES ADRESSES DÉPLOYÉES ===
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  if (!fs.existsSync(addressesPath)) {
    throw new Error("Fichier deployed-addresses.json introuvable. Exécutez d'abord deploy-all.js");
  }
  
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const [admin] = await hre.ethers.getSigners();
  console.log("Admin (exécuteur):", admin.address);
  console.log("Contrat DoneOrderManager:", addresses.DoneOrderManager);

  // === ÉTAPE 2: RÉCUPÉRER L'INSTANCE DU CONTRAT ===
  const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  const orderManager = await DoneOrderManager.attach(addresses.DoneOrderManager);

  // === ÉTAPE 3: RÉCUPÉRER LE RÔLE ===
  const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
  console.log("\nRESTAURANT_ROLE hash:", RESTAURANT_ROLE);

  // === ÉTAPE 4: VÉRIFIER SI L'ADRESSE A DÉJÀ LE RÔLE ===
  const hasRoleBefore = await orderManager.hasRole(RESTAURANT_ROLE, RESTAURANT_ADDRESS);
  if (hasRoleBefore) {
    console.log("\n Cette adresse a DÉJÀ le rôle RESTAURANT_ROLE!");
    console.log("   Aucune action nécessaire.");
    return;
  }

  // === ÉTAPE 5: ATTRIBUER LE RÔLE ===
  console.log("\nAttribution du rôle en cours...");
  const tx = await orderManager.grantRole(RESTAURANT_ROLE, RESTAURANT_ADDRESS);
  console.log("Transaction envoyée:", tx.hash);

  // Attendre la confirmation
  const receipt = await tx.wait();
  console.log("Transaction confirmée dans le bloc:", receipt.blockNumber);

  // === ÉTAPE 6: VÉRIFICATION ===
  const hasRoleAfter = await orderManager.hasRole(RESTAURANT_ROLE, RESTAURANT_ADDRESS);
  if (hasRoleAfter) {
    console.log("\n Rôle RESTAURANT_ROLE attribué avec succès!");
    console.log("   Adresse:", RESTAURANT_ADDRESS);
    console.log("\n   Vous pouvez maintenant vous connecter à l'interface restaurant.");
  } else {
    console.log("\n Échec de l'attribution du rôle");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Erreur:", error);
    process.exit(1);
  });
