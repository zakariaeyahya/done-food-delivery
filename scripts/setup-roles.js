// TODO: Importer hardhat pour accéder aux fonctionnalités blockchain
// const hre = require("hardhat");

// TODO: Importer fs pour lire le fichier deployed-addresses.json
// const fs = require("fs");

// TODO: Importer path pour gérer les chemins de fichiers
// const path = require("path");

/**
 * Script de configuration des rôles AccessControl
 * @notice Configure les rôles RESTAURANT, DELIVERER, ARBITRATOR et PLATFORM
 * @dev Prérequis: Les contrats doivent être déployés (deployed-addresses.json doit exister)
 * @dev Le compte exécutant doit avoir DEFAULT_ADMIN_ROLE sur DoneOrderManager
 */
async function main() {
  // TODO: Afficher le réseau sur lequel on configure les rôles
  // console.log("Configuration des rôles sur", hre.network.name);

  // === ÉTAPE 1: CHARGER LES ADRESSES DÉPLOYÉES ===
  // TODO: Définir le chemin du fichier deployed-addresses.json
  // const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  // TODO: Vérifier que le fichier existe, sinon lancer une erreur
  // if (!fs.existsSync(addressesPath)) {
  //   throw new Error("Fichier deployed-addresses.json introuvable. Exécutez d'abord deploy-all.js");
  // }
  
  // TODO: Lire et parser le fichier JSON
  // const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // TODO: Récupérer le compte admin (premier signer)
  // const [admin] = await hre.ethers.getSigners();
  // console.log("Admin:", admin.address);

  // === ÉTAPE 2: RÉCUPÉRER L'INSTANCE DU CONTRAT ===
  // TODO: Récupérer la factory du contrat DoneOrderManager
  // const DoneOrderManager = await hre.ethers.getContractFactory("DoneOrderManager");
  
  // TODO: Attacher l'instance au contrat déployé (utiliser attach au lieu de deploy)
  // const orderManager = DoneOrderManager.attach(addresses.DoneOrderManager);

  // === ÉTAPE 3: RÉCUPÉRER LES RÔLES ===
  // TODO: Récupérer tous les rôles depuis le contrat
  // const CLIENT_ROLE = await orderManager.CLIENT_ROLE();
  // const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
  // const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
  // const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
  // const ARBITRATOR_ROLE = await orderManager.ARBITRATOR_ROLE();

  // TODO: Afficher tous les rôles disponibles
  // console.log("\nRôles disponibles:");
  // console.log("CLIENT_ROLE:", CLIENT_ROLE);
  // console.log("RESTAURANT_ROLE:", RESTAURANT_ROLE);
  // console.log("DELIVERER_ROLE:", DELIVERER_ROLE);
  // console.log("PLATFORM_ROLE:", PLATFORM_ROLE);
  // console.log("ARBITRATOR_ROLE:", ARBITRATOR_ROLE);

  // === ÉTAPE 4: DÉFINIR LES ADRESSES DE TEST ===
  // TODO: Définir les adresses des restaurants (remplacer par les vraies adresses en production)
  // const restaurantAddresses = [
  //   "0x1234567890123456789012345678901234567890", // Restaurant 1
  //   "0x2345678901234567890123456789012345678901", // Restaurant 2
  //   "0x3456789012345678901234567890123456789012"  // Restaurant 3
  // ];

  // TODO: Définir les adresses des livreurs (remplacer par les vraies adresses en production)
  // const delivererAddresses = [
  //   "0x4567890123456789012345678901234567890123", // Livreur 1
  //   "0x5678901234567890123456789012345678901234", // Livreur 2
  //   "0x6789012345678901234567890123456789012345"  // Livreur 3
  // ];

  // TODO: Définir les adresses des arbitres (l'admin est aussi arbitre)
  // const arbitratorAddresses = [
  //   admin.address // L'admin est aussi arbitre
  // ];

  // TODO: Définir l'adresse de la plateforme (l'admin est la plateforme)
  // const platformAddress = admin.address; // L'admin est la plateforme

  // === ÉTAPE 5: ASSIGNER LE RÔLE RESTAURANT ===
  // TODO: Afficher un message de début
  // console.log("\nAssignation rôle RESTAURANT...");
  
  // TODO: Parcourir toutes les adresses de restaurants
  // for (const addr of restaurantAddresses) {
  //   // TODO: Accorder le rôle RESTAURANT_ROLE à chaque adresse
  //   const tx = await orderManager.grantRole(RESTAURANT_ROLE, addr);
  //   // TODO: Attendre la confirmation de la transaction
  //   await tx.wait();
  //   // TODO: Afficher un message de confirmation
  //   console.log("Restaurant autorisé:", addr);
  // }

  // === ÉTAPE 6: ASSIGNER LE RÔLE DELIVERER ===
  // TODO: Afficher un message de début
  // console.log("\nAssignation rôle DELIVERER...");
  
  // TODO: Parcourir toutes les adresses de livreurs
  // for (const addr of delivererAddresses) {
  //   // TODO: Accorder le rôle DELIVERER_ROLE à chaque adresse
  //   const tx = await orderManager.grantRole(DELIVERER_ROLE, addr);
  //   // TODO: Attendre la confirmation de la transaction
  //   await tx.wait();
  //   // TODO: Afficher un message de confirmation
  //   console.log("Livreur autorisé:", addr);
  // }

  // === ÉTAPE 7: ASSIGNER LE RÔLE ARBITRATOR ===
  // TODO: Afficher un message de début
  // console.log("\nAssignation rôle ARBITRATOR...");
  
  // TODO: Parcourir toutes les adresses d'arbitres
  // for (const addr of arbitratorAddresses) {
  //   // TODO: Accorder le rôle ARBITRATOR_ROLE à chaque adresse
  //   const tx = await orderManager.grantRole(ARBITRATOR_ROLE, addr);
  //   // TODO: Attendre la confirmation de la transaction
  //   await tx.wait();
  //   // TODO: Afficher un message de confirmation
  //   console.log("Arbitre autorisé:", addr);
  // }

  // === ÉTAPE 8: ASSIGNER LE RÔLE PLATFORM ===
  // TODO: Afficher un message de début
  // console.log("\nAssignation rôle PLATFORM...");
  
  // TODO: Accorder le rôle PLATFORM_ROLE à l'adresse de la plateforme
  // const tx = await orderManager.grantRole(PLATFORM_ROLE, platformAddress);
  // TODO: Attendre la confirmation de la transaction
  // await tx.wait();
  // TODO: Afficher un message de confirmation
  // console.log("Plateforme autorisée:", platformAddress);

  // === ÉTAPE 9: VÉRIFICATION ===
  // TODO: Afficher un message de début de vérification
  // console.log("\n=== VÉRIFICATION DES RÔLES ===");
  
  // TODO: Vérifier que le premier restaurant a bien le rôle RESTAURANT_ROLE
  // console.log("Restaurant 1 a le rôle?", await orderManager.hasRole(RESTAURANT_ROLE, restaurantAddresses[0]));
  
  // TODO: Vérifier que le premier livreur a bien le rôle DELIVERER_ROLE
  // console.log("Livreur 1 a le rôle?", await orderManager.hasRole(DELIVERER_ROLE, delivererAddresses[0]));
  
  // TODO: Vérifier que l'admin a bien le rôle ARBITRATOR_ROLE
  // console.log("Admin a le rôle ARBITRATOR?", await orderManager.hasRole(ARBITRATOR_ROLE, admin.address));
  
  // TODO: Vérifier que l'admin a bien le rôle PLATFORM_ROLE
  // console.log("Admin a le rôle PLATFORM?", await orderManager.hasRole(PLATFORM_ROLE, platformAddress));

  // TODO: Afficher un message de fin
  // console.log("\nConfiguration des rôles terminée.");
}

// TODO: Exécuter la fonction main et gérer les erreurs
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

