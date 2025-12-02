// TODO: Importer mongoose pour la connexion MongoDB
// const mongoose = require("mongoose");

// TODO: Importer ethers depuis hardhat pour les interactions blockchain
// const { ethers } = require("hardhat");

// TODO: Importer fs pour lire le fichier deployed-addresses.json
// const fs = require("fs");

// TODO: Importer path pour gérer les chemins de fichiers
// const path = require("path");

// TODO: Importer dotenv pour charger les variables d'environnement
// require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

// TODO: Importer les modèles MongoDB (ajuster les chemins selon votre structure)
// const User = require("../backend/src/models/User");
// const Restaurant = require("../backend/src/models/Restaurant");
// const Deliverer = require("../backend/src/models/Deliverer");
// const Order = require("../backend/src/models/Order");

/**
 * Script de création de données de test
 * @notice Crée des utilisateurs, restaurants, livreurs et commandes dans MongoDB et sur la blockchain
 * @dev Prérequis: MongoDB démarré, contrats déployés, rôles configurés
 */
async function main() {
  // TODO: Afficher un message de début
  // console.log("Initialisation du seed de données...");

  // === ÉTAPE 1: CONNEXION À MONGODB ===
  // TODO: Se connecter à MongoDB avec l'URI depuis les variables d'environnement
  // await mongoose.connect(process.env.MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // });
  // TODO: Afficher un message de confirmation
  // console.log("Connecté à MongoDB");

  // === ÉTAPE 2: NETTOYER LES COLLECTIONS ===
  // TODO: Afficher un message de début
  // console.log("\nSuppression des anciennes données...");
  
  // TODO: Supprimer tous les documents de chaque collection
  // await User.deleteMany({});
  // await Restaurant.deleteMany({});
  // await Deliverer.deleteMany({});
  // await Order.deleteMany({});
  
  // TODO: Afficher un message de confirmation
  // console.log("Données effacées");

  // === ÉTAPE 3: CHARGER LES ADRESSES DES CONTRATS ===
  // TODO: Définir le chemin du fichier deployed-addresses.json
  // const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  // TODO: Lire et parser le fichier JSON
  // const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // === ÉTAPE 4: RÉCUPÉRER LES SIGNERS ===
  // TODO: Récupérer plusieurs signers depuis Hardhat (pour différents utilisateurs)
  // const [deployer, client1, client2, restaurant1, restaurant2, deliverer1, deliverer2] = await ethers.getSigners();

  // === ÉTAPE 5: CRÉER DES UTILISATEURS (CLIENTS) ===
  // TODO: Afficher un message de début
  // console.log("\nCréation des utilisateurs...");
  
  // TODO: Définir un tableau d'utilisateurs avec leurs données
  // const users = [
  //   {
  //     address: client1.address,
  //     name: "Alice Martin",
  //     email: "alice@example.com",
  //     phone: "+33612345678",
  //     deliveryAddresses: [
  //       {
  //         label: "Domicile",
  //         address: "15 Rue de la Paix, 75002 Paris",
  //         lat: 48.8698,
  //         lng: 2.3316
  //       }
  //     ]
  //   },
  //   {
  //     address: client2.address,
  //     name: "Bob Dupont",
  //     email: "bob@example.com",
  //     phone: "+33623456789",
  //     deliveryAddresses: [
  //       {
  //         label: "Travail",
  //         address: "10 Avenue des Champs-Élysées, 75008 Paris",
  //         lat: 48.8698,
  //         lng: 2.3079
  //       }
  //     ]
  //   }
  // ];

  // TODO: Parcourir le tableau et créer chaque utilisateur dans MongoDB
  // for (const userData of users) {
  //   const user = await User.create(userData);
  //   console.log("Utilisateur créé:", user.name, "-", user.address);
  // }

  // === ÉTAPE 6: CRÉER DES RESTAURANTS ===
  // TODO: Afficher un message de début
  // console.log("\nCréation des restaurants...");
  
  // TODO: Définir un tableau de restaurants avec leurs données complètes (nom, cuisine, menu, etc.)
  // const restaurants = [
  //   {
  //     address: restaurant1.address,
  //     name: "Pizza Roma",
  //     cuisine: "Italienne",
  //     description: "Pizzas authentiques cuites au feu de bois",
  //     location: {
  //       address: "5 Rue de Rivoli, 75001 Paris",
  //       lat: 48.8606,
  //       lng: 2.3376
  //     },
  //     images: ["QmPizzaRoma1", "QmPizzaRoma2"], // IPFS hashes simulés
  //     menu: [
  //       {
  //         name: "Pizza Margherita",
  //         description: "Tomate, mozzarella, basilic",
  //         price: 12,
  //         image: "QmMargherita",
  //         category: "Pizzas",
  //         available: true
  //       },
  //       // ... autres items du menu
  //     ],
  //     rating: 4.5,
  //     totalOrders: 0,
  //     isActive: true
  //   },
  //   // ... autres restaurants
  // ];

  // TODO: Parcourir le tableau et créer chaque restaurant dans MongoDB
  // for (const restaurantData of restaurants) {
  //   const restaurant = await Restaurant.create(restaurantData);
  //   console.log("Restaurant créé:", restaurant.name, "-", restaurant.address);
  // }

  // === ÉTAPE 7: CRÉER DES LIVREURS ===
  // TODO: Afficher un message de début
  // console.log("\nCréation des livreurs...");
  
  // TODO: Définir un tableau de livreurs avec leurs données (nom, téléphone, véhicule, localisation, etc.)
  // const deliverers = [
  //   {
  //     address: deliverer1.address,
  //     name: "Jean Livreur",
  //     phone: "+33634567890",
  //     vehicleType: "scooter",
  //     currentLocation: {
  //       lat: 48.8566,
  //       lng: 2.3522,
  //       lastUpdated: new Date()
  //     },
  //     isAvailable: true,
  //     isStaked: false,
  //     stakedAmount: 0,
  //     rating: 4.7,
  //     totalDeliveries: 0
  //   },
  //   // ... autres livreurs
  // ];

  // TODO: Parcourir le tableau et créer chaque livreur dans MongoDB
  // for (const delivererData of deliverers) {
  //   const deliverer = await Deliverer.create(delivererData);
  //   console.log("Livreur créé:", deliverer.name, "-", deliverer.address);
  // }

  // === ÉTAPE 8: CRÉER UNE COMMANDE ON-CHAIN ET OFF-CHAIN ===
  // TODO: Afficher un message de début
  // console.log("\nCréation d'une commande de test...");

  // TODO: Récupérer la factory du contrat DoneOrderManager
  // const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
  
  // TODO: Attacher l'instance au contrat déployé
  // const orderManager = DoneOrderManager.attach(addresses.DoneOrderManager);

  // TODO: Calculer les montants de la commande
  // const foodPrice = ethers.utils.parseEther("12"); // 12 MATIC
  // const deliveryFee = ethers.utils.parseEther("3"); // 3 MATIC
  // const platformFee = foodPrice.mul(10).div(100); // 10% de 12 = 1.2 MATIC
  // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);

  // TODO: Définir un hash IPFS simulé pour les détails de la commande
  // const ipfsHash = "QmOrder1Details"; // Hash IPFS simulé

  // TODO: Créer la commande on-chain avec createOrder
  // const tx = await orderManager.connect(client1).createOrder(
  //   restaurant1.address,
  //   foodPrice,
  //   deliveryFee,
  //   ipfsHash,
  //   { value: totalAmount }
  // );
  
  // TODO: Attendre la confirmation de la transaction
  // const receipt = await tx.wait();

  // TODO: Extraire l'event OrderCreated pour récupérer l'orderId
  // const orderCreatedEvent = receipt.events.find(e => e.event === "OrderCreated");
  // const orderId = orderCreatedEvent.args.orderId.toNumber();

  // TODO: Afficher l'ID de la commande créée
  // console.log("Commande créée on-chain, ID:", orderId);

  // TODO: Récupérer les documents MongoDB correspondants
  // const restaurantDoc = await Restaurant.findOne({ address: restaurant1.address });
  // const clientDoc = await User.findOne({ address: client1.address });

  // TODO: Créer l'entrée MongoDB correspondante avec tous les détails
  // const order = await Order.create({
  //   orderId: orderId,
  //   txHash: tx.hash,
  //   client: clientDoc._id,
  //   restaurant: restaurantDoc._id,
  //   items: [
  //     {
  //       name: "Pizza Margherita",
  //       quantity: 1,
  //       price: 12,
  //       image: "QmMargherita"
  //     }
  //   ],
  //   deliveryAddress: "15 Rue de la Paix, 75002 Paris",
  //   ipfsHash: ipfsHash,
  //   status: "CREATED",
  //   foodPrice: 12,
  //   deliveryFee: 3,
  //   platformFee: 1.2,
  //   totalAmount: 16.2,
  //   gpsTracking: [],
  //   createdAt: new Date()
  // });

  // TODO: Afficher l'ID de la commande créée dans MongoDB
  // console.log("Commande créée dans MongoDB, ID:", order._id);

  // === ÉTAPE 9: RÉCAPITULATIF ===
  // TODO: Afficher un récapitulatif complet
  // console.log("\n=== RÉCAPITULATIF SEED ===");
  // console.log("Utilisateurs:", await User.countDocuments());
  // console.log("Restaurants:", await Restaurant.countDocuments());
  // console.log("Livreurs:", await Deliverer.countDocuments());
  // console.log("Commandes:", await Order.countDocuments());
  // console.log("\nDonnées de test créées avec succès.");

  // === ÉTAPE 10: FERMER LA CONNEXION ===
  // TODO: Fermer la connexion MongoDB
  // await mongoose.connection.close();
  // TODO: Afficher un message de confirmation
  // console.log("Connexion MongoDB fermée.");
}

// TODO: Exécuter la fonction main et gérer les erreurs
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });


