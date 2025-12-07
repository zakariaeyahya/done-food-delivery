/**
 * Script de création de données de test
 * @notice Crée des utilisateurs, restaurants, livreurs et commandes dans MongoDB
 * @dev Prérequis: MongoDB démarré, contrats déployés (optionnel)
 * 
 * Utilisation:
 * npm run seed (depuis le dossier backend)
 * ou
 * node scripts/seed-data.js (depuis la racine du projet)
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

// Importer les modèles MongoDB
const User = require("../backend/src/models/User");
const Restaurant = require("../backend/src/models/Restaurant");
const Deliverer = require("../backend/src/models/Deliverer");
const Order = require("../backend/src/models/Order");

/**
 * Fonction principale de seed
 */
async function main() {
  console.log("🌱 Initialisation du seed de données...");

  // === ÉTAPE 1: CONNEXION À MONGODB ===
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✓ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error.message);
    process.exit(1);
  }

  // === ÉTAPE 2: NETTOYER LES COLLECTIONS ===
  console.log("\n🗑️ Suppression des anciennes données...");
  
  try {
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Deliverer.deleteMany({});
    await Order.deleteMany({});
    console.log("✓ Données effacées");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error.message);
  }

  // === ÉTAPE 3: CRÉER DES UTILISATEURS (CLIENTS) ===
  console.log("\n👥 Création des utilisateurs...");
  
  const users = [
    {
      address: "0x1234567890123456789012345678901234567890",
      name: "Alice Martin",
      email: "alice@example.com",
      phone: "+33612345678",
      deliveryAddresses: [
        {
          label: "Domicile",
          address: "15 Rue de la Paix, 75002 Paris",
          lat: 48.8698,
          lng: 2.3316
        }
      ]
    },
    {
      address: "0x2234567890123456789012345678901234567890",
      name: "Bob Dupont",
      email: "bob@example.com",
      phone: "+33623456789",
      deliveryAddresses: [
        {
          label: "Travail",
          address: "10 Avenue des Champs-Élysées, 75008 Paris",
          lat: 48.8698,
          lng: 2.3079
        }
      ]
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✓ Utilisateur créé: ${user.name} - ${user.address}`);
    } catch (error) {
      console.error(`❌ Erreur création utilisateur ${userData.name}:`, error.message);
    }
  }

  // === ÉTAPE 4: CRÉER DES RESTAURANTS ===
  console.log("\n🍕 Création des restaurants...");
  
  const restaurants = [
    {
      address: "0x3234567890123456789012345678901234567890",
      name: "Pizza Roma",
      cuisine: "Italienne",
      description: "Pizzas authentiques cuites au feu de bois",
      location: {
        address: "5 Rue de Rivoli, 75001 Paris",
        lat: 48.8606,
        lng: 2.3376
      },
      images: ["QmPizzaRoma1", "QmPizzaRoma2"],
      menu: [
        {
          name: "Pizza Margherita",
          description: "Tomate, mozzarella, basilic",
          price: 12,
          image: "QmMargherita",
          category: "Pizzas",
          available: true
        },
        {
          name: "Pizza 4 Fromages",
          description: "Mozzarella, gorgonzola, parmesan, chèvre",
          price: 15,
          image: "Qm4Fromages",
          category: "Pizzas",
          available: true
        }
      ],
      rating: 4.5,
      totalOrders: 0,
      isActive: true
    },
    {
      address: "0x4234567890123456789012345678901234567890",
      name: "Sushi Tokyo",
      cuisine: "Japonaise",
      description: "Sushis frais préparés quotidiennement",
      location: {
        address: "20 Rue de la Paix, 75002 Paris",
        lat: 48.8698,
        lng: 2.3316
      },
      images: ["QmSushiTokyo1"],
      menu: [
        {
          name: "Sushi Mix",
          description: "10 pièces de sushi variés",
          price: 18,
          image: "QmSushiMix",
          category: "Sushis",
          available: true
        }
      ],
      rating: 4.7,
      totalOrders: 0,
      isActive: true
    }
  ];

  const createdRestaurants = [];
  for (const restaurantData of restaurants) {
    try {
      const restaurant = await Restaurant.create(restaurantData);
      createdRestaurants.push(restaurant);
      console.log(`✓ Restaurant créé: ${restaurant.name} - ${restaurant.address}`);
    } catch (error) {
      console.error(`❌ Erreur création restaurant ${restaurantData.name}:`, error.message);
    }
  }

  // === ÉTAPE 5: CRÉER DES LIVREURS ===
  console.log("\n🚴 Création des livreurs...");
  
  const deliverers = [
    {
      address: "0x5234567890123456789012345678901234567890",
      name: "Jean Livreur",
      phone: "+33634567890",
      vehicleType: "scooter",
      currentLocation: {
        lat: 48.8566,
        lng: 2.3522,
        lastUpdated: new Date()
      },
      isAvailable: true,
      isStaked: false,
      stakedAmount: 0,
      rating: 4.7,
      totalDeliveries: 0
    },
    {
      address: "0x6234567890123456789012345678901234567890",
      name: "Marie Express",
      phone: "+33645678901",
      vehicleType: "bike",
      currentLocation: {
        lat: 48.8606,
        lng: 2.3376,
        lastUpdated: new Date()
      },
      isAvailable: true,
      isStaked: true,
      stakedAmount: 0.1,
      rating: 4.9,
      totalDeliveries: 0
    }
  ];

  const createdDeliverers = [];
  for (const delivererData of deliverers) {
    try {
      const deliverer = await Deliverer.create(delivererData);
      createdDeliverers.push(deliverer);
      console.log(`✓ Livreur créé: ${deliverer.name} - ${deliverer.address}`);
    } catch (error) {
      console.error(`❌ Erreur création livreur ${delivererData.name}:`, error.message);
    }
  }

  // === ÉTAPE 6: CRÉER UNE COMMANDE DE TEST ===
  console.log("\n📦 Création d'une commande de test...");

  if (createdUsers.length > 0 && createdRestaurants.length > 0) {
    try {
      const client = createdUsers[0];
      const restaurant = createdRestaurants[0];
      
      const order = await Order.create({
        orderId: Date.now(),
        txHash: `seed_${Date.now()}`,
        client: client._id,
        restaurant: restaurant._id,
        items: [
          {
            name: "Pizza Margherita",
            quantity: 1,
            price: 12,
            image: "QmMargherita"
          }
        ],
        deliveryAddress: client.deliveryAddresses[0].address,
        deliveryLocation: {
          lat: client.deliveryAddresses[0].lat,
          lng: client.deliveryAddresses[0].lng
        },
        ipfsHash: "QmOrder1Details",
        status: "CREATED",
        foodPrice: "12000000000000000000", // 12 MATIC en wei
        deliveryFee: "3000000000000000000", // 3 MATIC en wei
        platformFee: "1200000000000000000", // 1.2 MATIC en wei
        totalAmount: "16200000000000000000", // 16.2 MATIC en wei
        gpsTracking: [],
        createdAt: new Date()
      });

      console.log(`✓ Commande créée dans MongoDB, ID: ${order._id}, Order ID: ${order.orderId}`);
    } catch (error) {
      console.error("❌ Erreur création commande:", error.message);
    }
  }

  // === ÉTAPE 7: RÉCAPITULATIF ===
  console.log("\n=== RÉCAPITULATIF SEED ===");
  console.log(`Utilisateurs: ${await User.countDocuments()}`);
  console.log(`Restaurants: ${await Restaurant.countDocuments()}`);
  console.log(`Livreurs: ${await Deliverer.countDocuments()}`);
  console.log(`Commandes: ${await Order.countDocuments()}`);
  console.log("\n✅ Données de test créées avec succès.");

  // === ÉTAPE 8: FERMER LA CONNEXION ===
  await mongoose.connection.close();
  console.log("✓ Connexion MongoDB fermée.");
}

// Exécuter la fonction main et gérer les erreurs
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
