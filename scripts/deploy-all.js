// TODO: Importer hardhat pour accéder aux fonctionnalités de déploiement
// const hre = require("hardhat");

// TODO: Importer fs pour écrire le fichier de sauvegarde des adresses
// const fs = require("fs");

// TODO: Importer path pour gérer les chemins de fichiers
// const path = require("path");

/**
 * Script de déploiement automatique de tous les smart contracts
 * @notice Déploie les contrats dans l'ordre: DoneToken → DonePaymentSplitter → DoneStaking → DoneOrderManager
 * @dev Sauvegarde les adresses dans deployed-addresses.json
 * @dev Configure les autorisations post-déploiement (MINTER_ROLE pour OrderManager)
 */
async function main() {
  // TODO: Afficher le réseau sur lequel on déploie
  // console.log("Démarrage du déploiement sur", hre.network.name);

  // TODO: Récupérer le compte déployeur (premier signer)
  // const [deployer] = await hre.ethers.getSigners();
  // console.log("Compte déployeur:", deployer.address);
  
  // TODO: Afficher la balance du déployeur
  // console.log("Balance:", (await deployer.getBalance()).toString());

  // === ÉTAPE 1: DÉPLOIEMENT DONETOKEN ===
  // TODO: Afficher un message de début
  // console.log("\n1. Déploiement DoneToken...");
  
  // TODO: Récupérer la factory du contrat DoneToken
  // const DoneToken = await hre.ethers.getContractFactory("DoneToken");
  
  // TODO: Déployer le contrat DoneToken (pas de paramètres dans le constructor)
  // const doneToken = await DoneToken.deploy();
  
  // TODO: Attendre que le contrat soit déployé
  // await doneToken.deployed();
  
  // TODO: Afficher l'adresse du contrat déployé
  // console.log("DoneToken déployé à:", doneToken.address);

  // === ÉTAPE 2: DÉPLOIEMENT DONEPAYMENTSPLITTER ===
  // TODO: Afficher un message de début
  // console.log("\n2. Déploiement DonePaymentSplitter...");
  
  // TODO: Récupérer la factory du contrat DonePaymentSplitter
  // const DonePaymentSplitter = await hre.ethers.getContractFactory("DonePaymentSplitter");
  
  // TODO: Déployer le contrat DonePaymentSplitter (pas de paramètres dans le constructor)
  // const paymentSplitter = await DonePaymentSplitter.deploy();
  
  // TODO: Attendre que le contrat soit déployé
  // await paymentSplitter.deployed();
  
  // TODO: Afficher l'adresse du contrat déployé
  // console.log("DonePaymentSplitter déployé à:", paymentSplitter.address);

  // === ÉTAPE 3: DÉPLOIEMENT DONESTAKING ===
  // TODO: Afficher un message de début
  // console.log("\n3. Déploiement DoneStaking...");
  
  // TODO: Récupérer la factory du contrat DoneStaking
  // const DoneStaking = await hre.ethers.getContractFactory("DoneStaking");
  
  // TODO: Déployer le contrat DoneStaking (pas de paramètres dans le constructor)
  // const staking = await DoneStaking.deploy();
  
  // TODO: Attendre que le contrat soit déployé
  // await staking.deployed();
  
  // TODO: Afficher l'adresse du contrat déployé
  // console.log("DoneStaking déployé à:", staking.address);

  // === ÉTAPE 4: DÉPLOIEMENT DONEORDERMANAGER ===
  // TODO: Afficher un message de début
  // console.log("\n4. Déploiement DoneOrderManager...");
  
  // TODO: Récupérer la factory du contrat DoneOrderManager
  // const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  
  // TODO: Déployer le contrat DoneOrderManager avec les adresses des 3 contrats précédents
  // const orderManager = await DoneOrderManager.deploy(
  //   paymentSplitter.address,  // _paymentSplitterAddress
  //   doneToken.address,         // _tokenAddress
  //   staking.address            // _stakingAddress
  // );
  
  // TODO: Attendre que le contrat soit déployé
  // await orderManager.deployed();
  
  // TODO: Afficher l'adresse du contrat déployé
  // console.log("DoneOrderManager déployé à:", orderManager.address);

  // === ÉTAPE 5: CONFIGURATION POST-DÉPLOIEMENT ===
  // TODO: Afficher un message de début
  // console.log("\n5. Configuration des autorisations...");

  // TODO: Donner au OrderManager le droit de mint des tokens
  // - Récupérer le MINTER_ROLE depuis le contrat DoneToken
  // const MINTER_ROLE = await doneToken.MINTER_ROLE();
  
  // TODO: Accorder le rôle MINTER_ROLE à l'adresse du OrderManager
  // await doneToken.grantRole(MINTER_ROLE, orderManager.address);
  
  // TODO: Afficher un message de confirmation
  // console.log("OrderManager autorisé à mint des tokens");

  // === ÉTAPE 6: SAUVEGARDE DES ADRESSES ===
  // TODO: Créer un objet avec toutes les adresses déployées
  // const addresses = {
  //   network: hre.network.name,
  //   deployer: deployer.address,
  //   DoneToken: doneToken.address,
  //   DonePaymentSplitter: paymentSplitter.address,
  //   DoneStaking: staking.address,
  //   DoneOrderManager: orderManager.address,
  //   deployedAt: new Date().toISOString()
  // };

  // TODO: Définir le chemin du fichier de sauvegarde (à la racine du projet)
  // const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  // TODO: Écrire le fichier JSON avec les adresses (format indenté avec 2 espaces)
  // fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  // TODO: Afficher le chemin du fichier sauvegardé
  // console.log("\nAdresses sauvegardées dans:", addressesPath);

  // === ÉTAPE 7: RÉCAPITULATIF ===
  // TODO: Afficher un récapitulatif complet du déploiement
  // console.log("\n=== RÉCAPITULATIF DÉPLOIEMENT ===");
  // console.log("Réseau:", hre.network.name);
  // console.log("DoneToken:", doneToken.address);
  // console.log("DonePaymentSplitter:", paymentSplitter.address);
  // console.log("DoneStaking:", staking.address);
  // console.log("DoneOrderManager:", orderManager.address);
  // console.log("\nCopiez ces adresses dans backend/.env et frontend/.env");
}

// TODO: Exécuter la fonction main et gérer les erreurs
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

