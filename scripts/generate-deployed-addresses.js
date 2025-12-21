import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script pour générer deployed-addresses.json à partir des contrats déjà déployés
 * Ce script récupère l'adresse du déployeur et génère le fichier au format attendu
 */
async function main() {
  console.log("Génération de deployed-addresses.json...\n");

  // Lire les adresses depuis contracts-amoy.json
  const contractsAmoyPath = path.join(__dirname, "../contracts/contracts-amoy.json");
  
  if (!fs.existsSync(contractsAmoyPath)) {
    console.error(" Fichier contracts-amoy.json introuvable!");
    console.error("   Chemin attendu:", contractsAmoyPath);
    console.error("\n   Option 1: Déployer les contrats avec:");
    console.error("   cd contracts && npx hardhat run ../scripts/deploy-all.js --network amoy");
    console.error("\n   Option 2: Vérifier que contracts-amoy.json existe dans contracts/");
    process.exit(1);
  }

  const contractsAmoy = JSON.parse(fs.readFileSync(contractsAmoyPath, "utf8"));
  console.log(" Fichier contracts-amoy.json trouvé");

  // Récupérer l'adresse du déployeur depuis le compte configuré
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = deployer.address;
  console.log(" Adresse du déployeur:", deployerAddress);

  // Récupérer l'adresse de la plateforme depuis DoneOrderManager
  let platformAddress = deployerAddress; // Par défaut
  try {
    const orderManager = await hre.ethers.getContractAt(
      "DoneOrderManager",
      contractsAmoy.DoneOrderManager
    );
    // Essayer de récupérer l'adresse de la plateforme depuis le contrat
    // Si le contrat a une fonction platformAddress() ou owner()
    try {
      platformAddress = await orderManager.platformAddress();
      console.log(" Adresse de la plateforme récupérée depuis le contrat:", platformAddress);
    } catch (e) {
      // Si la fonction n'existe pas, utiliser l'adresse du déployeur
      console.log("  Impossible de récupérer platformAddress depuis le contrat, utilisation du déployeur");
      platformAddress = deployerAddress;
    }
  } catch (error) {
    console.log("  Impossible de se connecter au contrat, utilisation du déployeur comme plateforme");
    platformAddress = deployerAddress;
  }

  // Créer l'objet des adresses au format attendu
  const addresses = {
    network: contractsAmoy.Network || "polygon-amoy",
    deployer: deployerAddress,
    DoneToken: contractsAmoy.DoneToken,
    DonePaymentSplitter: contractsAmoy.DonePaymentSplitter,
    DoneStaking: contractsAmoy.DoneStaking,
    DoneOrderManager: contractsAmoy.DoneOrderManager,
    platformAddress: platformAddress,
    deployedAt: new Date().toISOString()
  };

  // Sauvegarder dans deployed-addresses.json à la racine
  const outputPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));

  console.log("\n Fichier deployed-addresses.json créé avec succès!");
  console.log("   Chemin:", outputPath);
  console.log("\n Contenu:");
  console.log(JSON.stringify(addresses, null, 2));
  console.log("\n💡 Vous pouvez maintenant utiliser ce fichier dans votre backend et frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Erreur:", error);
    process.exit(1);
  });

