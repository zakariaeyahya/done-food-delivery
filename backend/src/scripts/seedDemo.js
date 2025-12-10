/**
 * Script pour insérer des données de démonstration
 * Usage: node src/scripts/seedDemo.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Order = require("../models/Order");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/done_delivery";

async function seedDatabase() {
  try {
    console.log("Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    // Nettoyer les collections existantes
    console.log("Nettoyage des données existantes...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Deliverer.deleteMany({});
    await Order.deleteMany({});

    // === CRÉER DES UTILISATEURS ===
    console.log("Création des utilisateurs...");
    const users = await User.insertMany([
      { address: "0x1111111111111111111111111111111111111111", name: "Alice Martin", email: "alice@example.com" },
      { address: "0x2222222222222222222222222222222222222222", name: "Bob Dupont", email: "bob@example.com" },
      { address: "0x3333333333333333333333333333333333333333", name: "Claire Bernard", email: "claire@example.com" },
      { address: "0x4444444444444444444444444444444444444444", name: "David Leroy", email: "david@example.com" },
      { address: "0x5555555555555555555555555555555555555555", name: "Emma Petit", email: "emma@example.com" },
    ]);
    console.log(`✅ ${users.length} utilisateurs créés`);

    // === CRÉER DES RESTAURANTS ===
    console.log("Création des restaurants...");
    const restaurants = await Restaurant.insertMany([
      { address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", name: "Pizza Roma", cuisine: "Italien", rating: 4.5, location: { address: "10 Rue de Rome, Paris", lat: 48.8566, lng: 2.3522 } },
      { address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", name: "Sushi Master", cuisine: "Japonais", rating: 4.8, location: { address: "25 Rue du Japon, Paris", lat: 48.8600, lng: 2.3400 } },
      { address: "0xcccccccccccccccccccccccccccccccccccccccc", name: "Burger King", cuisine: "Américain", rating: 4.2, location: { address: "5 Avenue des USA, Paris", lat: 48.8700, lng: 2.3300 } },
      { address: "0xdddddddddddddddddddddddddddddddddddddddd", name: "Taj Mahal", cuisine: "Indien", rating: 4.6, location: { address: "15 Rue de l'Inde, Paris", lat: 48.8500, lng: 2.3600 } },
      { address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", name: "Le Bistrot", cuisine: "Français", rating: 4.7, location: { address: "30 Rue de France, Paris", lat: 48.8650, lng: 2.3450 } },
    ]);
    console.log(`✅ ${restaurants.length} restaurants créés`);

    // === CRÉER DES LIVREURS ===
    console.log("Création des livreurs...");
    const deliverers = await Deliverer.insertMany([
      { address: "0xf1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1", name: "Lucas Livreur", phone: "+33612345678", vehicleType: "scooter", rating: 4.9, isStaked: true, stakedAmount: 100, currentLocation: { lat: 48.8566, lng: 2.3522 } },
      { address: "0xf2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2", name: "Marie Express", phone: "+33698765432", vehicleType: "bike", rating: 4.7, isStaked: true, stakedAmount: 50, currentLocation: { lat: 48.8600, lng: 2.3400 } },
      { address: "0xf3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3", name: "Pierre Rapide", phone: "+33611223344", vehicleType: "car", rating: 4.5, isStaked: false, stakedAmount: 0, currentLocation: { lat: 48.8700, lng: 2.3300 } },
    ]);
    console.log(`✅ ${deliverers.length} livreurs créés`);

    // === CRÉER DES COMMANDES ===
    console.log("Création des commandes...");
    const statuses = ["CREATED", "PREPARING", "IN_DELIVERY", "DELIVERED", "DELIVERED", "DELIVERED", "DISPUTED"];
    const orders = [];

    for (let i = 1; i <= 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const randomDeliverer = deliverers[Math.floor(Math.random() * deliverers.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const foodPrice = Math.floor(Math.random() * 30 + 10) * 100; // 10-40€ en centimes
      const deliveryFee = Math.floor(Math.random() * 5 + 2) * 100; // 2-7€
      const platformFee = Math.floor((foodPrice + deliveryFee) * 0.1);
      const totalAmount = foodPrice + deliveryFee + platformFee;

      // Date aléatoire dans les 30 derniers jours
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

      orders.push({
        orderId: i,
        txHash: `0x${i.toString().padStart(64, "0")}`,
        client: randomUser._id,
        restaurant: randomRestaurant._id,
        deliverer: randomStatus !== "CREATED" ? randomDeliverer._id : null,
        items: [
          { name: "Plat principal", quantity: 1, price: foodPrice * 0.7 },
          { name: "Accompagnement", quantity: 1, price: foodPrice * 0.3 },
        ],
        deliveryAddress: `${Math.floor(Math.random() * 100)} Rue de la Demo, Paris`,
        ipfsHash: `Qm${i.toString().padStart(44, "X")}`,
        status: randomStatus,
        foodPrice,
        deliveryFee,
        platformFee,
        totalAmount,
        disputed: randomStatus === "DISPUTED",
        disputeReason: randomStatus === "DISPUTED" ? "Commande non reçue" : undefined,
        createdAt: randomDate,
        completedAt: randomStatus === "DELIVERED" ? new Date(randomDate.getTime() + 45 * 60000) : null,
      });
    }

    await Order.insertMany(orders);
    console.log(`✅ ${orders.length} commandes créées`);

    // === RÉSUMÉ ===
    console.log("\n========== RÉSUMÉ ==========");
    console.log(`Utilisateurs: ${await User.countDocuments()}`);
    console.log(`Restaurants: ${await Restaurant.countDocuments()}`);
    console.log(`Livreurs: ${await Deliverer.countDocuments()}`);
    console.log(`Commandes: ${await Order.countDocuments()}`);
    console.log("============================\n");

    console.log("✅ Base de données initialisée avec succès!");

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Déconnecté de MongoDB");
    process.exit(0);
  }
}

seedDatabase();
