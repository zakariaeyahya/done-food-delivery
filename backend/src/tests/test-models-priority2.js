/**
 * Script de test pour vérifier les modèles MongoDB Priorité 2
 * 
 * Ce script teste:
 * - User.js : Modèle utilisateurs/clients
 * - Restaurant.js : Modèle restaurants
 * - Order.js : Modèle commandes
 * - Deliverer.js : Modèle livreurs
 * 
 * Usage:
 * node src/tests/test-models-priority2.js
 * 
 * Prérequis:
 * - MongoDB doit être connecté (via database.js)
 * - Variables d'environnement configurées (.env)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let testsPassed = 0;
let testsFailed = 0;

// Variables pour stocker les IDs créés (pour nettoyage)
let createdUserIds = [];
let createdRestaurantIds = [];
let createdOrderIds = [];
let createdDelivererIds = [];

async function test(name, testFn) {
  try {
    log(`\n📋 Test: ${name}`, 'cyan');
    await testFn();
    log(`   ✅ PASSÉ`, 'green');
    testsPassed++;
    return true;
  } catch (error) {
    log(`   ❌ ÉCHOUÉ: ${error.message}`, 'red');
    if (error.stack) {
      console.log(`   📚 ${error.stack.split('\n')[1]?.trim()}`);
    }
    testsFailed++;
    return false;
  }
}

async function runTests() {
  log('='.repeat(70), 'blue');
  log('🧪 TEST DES MODÈLES MONGODB PRIORITÉ 2', 'blue');
  log('='.repeat(70), 'blue');

  try {
    // Connexion à MongoDB
    log('\n🔌 Connexion à MongoDB...', 'yellow');
    await connectDB();
    log('✅ Connecté à MongoDB', 'green');

    // ============================================
    // TEST 1: User.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('1️⃣  TEST DE User.js', 'blue');
    log('='.repeat(70), 'blue');

    const User = require('../models/User');

    await test('Import de User.js', async () => {
      if (!User) throw new Error('User non exporté');
    });

    await test('Création d\'un utilisateur', async () => {
      const userData = {
        address: '0x1111111111111111111111111111111111111111',
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+33123456789'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      if (!savedUser._id) throw new Error('Utilisateur non sauvegardé');
      if (savedUser.address !== userData.address.toLowerCase()) throw new Error('Adresse non normalisée');
      
      createdUserIds.push(savedUser._id);
      global.testUserId = savedUser._id;
      global.testUserAddress = savedUser.address;
      
      log(`   👤 Utilisateur créé: ${savedUser.name} (${savedUser.address})`, 'reset');
    });

    await test('Recherche utilisateur par adresse (findByAddress)', async () => {
      const user = await User.findByAddress(global.testUserAddress);
      
      if (!user) throw new Error('Utilisateur non trouvé');
      if (user.address !== global.testUserAddress) throw new Error('Mauvais utilisateur trouvé');
      
      log(`   🔍 Utilisateur trouvé: ${user.name}`, 'reset');
    });

    await test('Mise à jour profil utilisateur (updateProfile)', async () => {
      const updates = {
        name: 'Updated Test User',
        email: 'updated@example.com'
      };
      
      const updatedUser = await User.updateProfile(global.testUserAddress, updates);
      
      if (!updatedUser) throw new Error('Profil non mis à jour');
      if (updatedUser.name !== updates.name) throw new Error('Nom non mis à jour');
      if (updatedUser.email !== updates.email) throw new Error('Email non mis à jour');
      
      log(`   ✏️  Profil mis à jour: ${updatedUser.name}`, 'reset');
    });

    await test('Ajout adresse de livraison (addDeliveryAddress)', async () => {
      const deliveryAddress = {
        label: 'Domicile',
        address: '123 Rue Test, Paris',
        lat: 48.8566,
        lng: 2.3522
      };
      
      const updatedUser = await User.addDeliveryAddress(global.testUserAddress, deliveryAddress);
      
      if (!updatedUser) throw new Error('Adresse non ajoutée');
      if (!updatedUser.deliveryAddresses || updatedUser.deliveryAddresses.length === 0) {
        throw new Error('Adresse de livraison non trouvée');
      }
      
      log(`   📍 Adresse de livraison ajoutée`, 'reset');
    });

    await test('Validation adresse Ethereum invalide', async () => {
      try {
        const invalidUser = new User({
          address: 'invalid-address',
          name: 'Invalid User',
          email: 'invalid@example.com'
        });
        await invalidUser.save();
        throw new Error('Validation devrait échouer');
      } catch (error) {
        if (error.name === 'ValidationError') {
          // C'est attendu
          log(`   ✅ Validation fonctionne (erreur attendue)`, 'reset');
        } else {
          throw error;
        }
      }
    });

    // ============================================
    // TEST 2: Restaurant.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('2️⃣  TEST DE Restaurant.js', 'blue');
    log('='.repeat(70), 'blue');

    const Restaurant = require('../models/Restaurant');

    await test('Import de Restaurant.js', async () => {
      if (!Restaurant) throw new Error('Restaurant non exporté');
    });

    await test('Création d\'un restaurant', async () => {
      const restaurantData = {
        address: '0x2222222222222222222222222222222222222222',
        name: 'Test Restaurant',
        cuisine: 'Italienne',
        description: 'Un restaurant de test',
        email: 'restaurant@example.com',
        phone: '+33987654321',
        location: {
          address: '456 Avenue Test, Paris',
          lat: 48.8606,
          lng: 2.3376
        },
        menu: [
          {
            name: 'Pizza Margherita',
            description: 'Pizza classique',
            price: 12.50,
            category: 'Pizzas',
            available: true
          }
        ]
      };
      
      const restaurant = new Restaurant(restaurantData);
      const savedRestaurant = await restaurant.save();
      
      if (!savedRestaurant._id) throw new Error('Restaurant non sauvegardé');
      
      createdRestaurantIds.push(savedRestaurant._id);
      global.testRestaurantId = savedRestaurant._id;
      global.testRestaurantAddress = savedRestaurant.address;
      
      log(`   🍕 Restaurant créé: ${savedRestaurant.name}`, 'reset');
    });

    await test('Recherche restaurant par adresse (findByAddress)', async () => {
      const restaurant = await Restaurant.findByAddress(global.testRestaurantAddress);
      
      if (!restaurant) throw new Error('Restaurant non trouvé');
      if (restaurant.address !== global.testRestaurantAddress) throw new Error('Mauvais restaurant trouvé');
      
      log(`   🔍 Restaurant trouvé: ${restaurant.name}`, 'reset');
    });

    await test('Mise à jour menu (updateMenu)', async () => {
      const newMenu = [
        {
          name: 'Pizza Margherita',
          description: 'Pizza classique',
          price: 12.50,
          category: 'Pizzas',
          available: true
        },
        {
          name: 'Pasta Carbonara',
          description: 'Pâtes à la carbonara',
          price: 14.00,
          category: 'Pâtes',
          available: true
        }
      ];
      
      const updatedRestaurant = await Restaurant.updateMenu(global.testRestaurantId, newMenu);
      
      if (!updatedRestaurant) throw new Error('Menu non mis à jour');
      if (updatedRestaurant.menu.length !== 2) throw new Error('Menu incorrect');
      
      log(`   📝 Menu mis à jour: ${updatedRestaurant.menu.length} items`, 'reset');
    });

    await test('Incrémenter compteur commandes (incrementOrderCount)', async () => {
      const restaurant = await Restaurant.findById(global.testRestaurantId);
      const initialCount = restaurant.totalOrders;
      
      await Restaurant.incrementOrderCount(global.testRestaurantId);
      
      const updatedRestaurant = await Restaurant.findById(global.testRestaurantId);
      if (updatedRestaurant.totalOrders !== initialCount + 1) {
        throw new Error('Compteur non incrémenté');
      }
      
      log(`   📊 Compteur commandes: ${updatedRestaurant.totalOrders}`, 'reset');
    });

    await test('Vérifier disponibilité item menu (isMenuItemAvailable)', async () => {
      const restaurant = await Restaurant.findById(global.testRestaurantId);
      
      const isAvailable = restaurant.isMenuItemAvailable('Pizza Margherita');
      if (!isAvailable) throw new Error('Item devrait être disponible');
      
      const isNotAvailable = restaurant.isMenuItemAvailable('Item Inexistant');
      if (isNotAvailable) throw new Error('Item inexistant ne devrait pas être disponible');
      
      log(`   ✅ Vérification disponibilité menu fonctionne`, 'reset');
    });

    // ============================================
    // TEST 3: Deliverer.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('3️⃣  TEST DE Deliverer.js', 'blue');
    log('='.repeat(70), 'blue');

    const Deliverer = require('../models/Deliverer');

    await test('Import de Deliverer.js', async () => {
      if (!Deliverer) throw new Error('Deliverer non exporté');
    });

    await test('Création d\'un livreur', async () => {
      const delivererData = {
        address: '0x3333333333333333333333333333333333333333',
        name: 'Test Deliverer',
        phone: '+33612345678',
        vehicleType: 'bike',
        currentLocation: {
          lat: 48.8566,
          lng: 2.3522
        },
        isAvailable: true,
        isStaked: true,
        stakedAmount: 1000000000000000000 // 1 ETH en wei
      };
      
      const deliverer = new Deliverer(delivererData);
      const savedDeliverer = await deliverer.save();
      
      if (!savedDeliverer._id) throw new Error('Livreur non sauvegardé');
      
      createdDelivererIds.push(savedDeliverer._id);
      global.testDelivererId = savedDeliverer._id;
      global.testDelivererAddress = savedDeliverer.address;
      
      log(`   🚴 Livreur créé: ${savedDeliverer.name}`, 'reset');
    });

    await test('Recherche livreur par adresse (findByAddress)', async () => {
      const deliverer = await Deliverer.findByAddress(global.testDelivererAddress);
      
      if (!deliverer) throw new Error('Livreur non trouvé');
      if (deliverer.address !== global.testDelivererAddress) throw new Error('Mauvais livreur trouvé');
      
      log(`   🔍 Livreur trouvé: ${deliverer.name}`, 'reset');
    });

    await test('Mise à jour position GPS (updateLocation)', async () => {
      const newLat = 48.8606;
      const newLng = 2.3376;
      
      const updatedDeliverer = await Deliverer.updateLocation(global.testDelivererAddress, newLat, newLng);
      
      if (!updatedDeliverer) throw new Error('Position non mise à jour');
      if (updatedDeliverer.currentLocation.lat !== newLat) throw new Error('Latitude incorrecte');
      if (updatedDeliverer.currentLocation.lng !== newLng) throw new Error('Longitude incorrecte');
      
      log(`   📍 Position mise à jour: ${newLat}, ${newLng}`, 'reset');
    });

    await test('Mise à jour disponibilité (setAvailability)', async () => {
      const updatedDeliverer = await Deliverer.setAvailability(global.testDelivererAddress, false);
      
      if (!updatedDeliverer) throw new Error('Disponibilité non mise à jour');
      if (updatedDeliverer.isAvailable !== false) throw new Error('Disponibilité incorrecte');
      
      log(`   🔄 Disponibilité mise à jour: ${updatedDeliverer.isAvailable}`, 'reset');
    });

    await test('Incrémenter compteur livraisons (incrementDeliveryCount)', async () => {
      const deliverer = await Deliverer.findById(global.testDelivererId);
      const initialCount = deliverer.totalDeliveries;
      
      await Deliverer.incrementDeliveryCount(global.testDelivererAddress);
      
      const updatedDeliverer = await Deliverer.findById(global.testDelivererId);
      if (updatedDeliverer.totalDeliveries !== initialCount + 1) {
        throw new Error('Compteur non incrémenté');
      }
      
      log(`   📊 Compteur livraisons: ${updatedDeliverer.totalDeliveries}`, 'reset');
    });

    await test('Récupérer livreurs disponibles (getAvailableDeliverers)', async () => {
      // Remettre le livreur disponible
      await Deliverer.setAvailability(global.testDelivererAddress, true);
      
      const availableDeliverers = await Deliverer.getAvailableDeliverers();
      
      if (!Array.isArray(availableDeliverers)) throw new Error('Résultat doit être un tableau');
      if (availableDeliverers.length === 0) throw new Error('Aucun livreur disponible trouvé');
      
      log(`   📋 ${availableDeliverers.length} livreur(s) disponible(s)`, 'reset');
    });

    await test('Vérifier peut accepter livraison (canAcceptDelivery)', async () => {
      const deliverer = await Deliverer.findById(global.testDelivererId);
      
      const canAccept = deliverer.canAcceptDelivery();
      if (!canAccept) throw new Error('Livreur devrait pouvoir accepter (disponible et staké)');
      
      log(`   ✅ canAcceptDelivery fonctionne`, 'reset');
    });

    // ============================================
    // TEST 4: Order.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('4️⃣  TEST DE Order.js', 'blue');
    log('='.repeat(70), 'blue');

    const Order = require('../models/Order');

    await test('Import de Order.js', async () => {
      if (!Order) throw new Error('Order non exporté');
    });

    await test('Création d\'une commande', async () => {
      const orderData = {
        orderId: 1,
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        client: global.testUserId,
        restaurant: global.testRestaurantId,
        items: [
          {
            name: 'Pizza Margherita',
            quantity: 2,
            price: 12.50
          }
        ],
        deliveryAddress: '123 Rue Test, Paris',
        ipfsHash: 'QmTestHash123456789',
        status: 'CREATED',
        foodPrice: 25000000000000000000, // 25 USD en wei (approximatif)
        deliveryFee: 5000000000000000000, // 5 USD en wei
        platformFee: 3000000000000000000, // 3 USD en wei
        totalAmount: 33000000000000000000 // 33 USD en wei
      };
      
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      if (!savedOrder._id) throw new Error('Commande non sauvegardée');
      
      createdOrderIds.push(savedOrder._id);
      global.testOrderId = savedOrder.orderId;
      
      log(`   📦 Commande créée: #${savedOrder.orderId}`, 'reset');
    });

    await test('Recherche commande par orderId (findByOrderId)', async () => {
      const order = await Order.findByOrderId(global.testOrderId);
      
      if (!order) throw new Error('Commande non trouvée');
      if (order.orderId !== global.testOrderId) throw new Error('Mauvaise commande trouvée');
      
      log(`   🔍 Commande trouvée: #${order.orderId}`, 'reset');
    });

    await test('Mise à jour statut commande (updateStatus)', async () => {
      const updatedOrder = await Order.updateStatus(global.testOrderId, 'PREPARING');
      
      if (!updatedOrder) throw new Error('Statut non mis à jour');
      if (updatedOrder.status !== 'PREPARING') throw new Error('Statut incorrect');
      
      log(`   🔄 Statut mis à jour: ${updatedOrder.status}`, 'reset');
    });

    await test('Ajout position GPS (addGPSLocation)', async () => {
      const lat = 48.8566;
      const lng = 2.3522;
      
      const updatedOrder = await Order.addGPSLocation(global.testOrderId, lat, lng);
      
      if (!updatedOrder) throw new Error('Position GPS non ajoutée');
      if (!updatedOrder.gpsTracking || updatedOrder.gpsTracking.length === 0) {
        throw new Error('Tracking GPS vide');
      }
      
      const lastPosition = updatedOrder.gpsTracking[updatedOrder.gpsTracking.length - 1];
      if (lastPosition.lat !== lat || lastPosition.lng !== lng) {
        throw new Error('Position GPS incorrecte');
      }
      
      log(`   📍 Position GPS ajoutée`, 'reset');
    });

    await test('Mise à jour statut DELIVERED (avec completedAt)', async () => {
      const updatedOrder = await Order.updateStatus(global.testOrderId, 'DELIVERED');
      
      if (!updatedOrder) throw new Error('Statut non mis à jour');
      if (updatedOrder.status !== 'DELIVERED') throw new Error('Statut incorrect');
      if (!updatedOrder.completedAt) throw new Error('completedAt non défini');
      
      log(`   ✅ Commande livrée: ${updatedOrder.completedAt}`, 'reset');
    });

    await test('Récupérer commandes par client (getOrdersByClient)', async () => {
      const orders = await Order.getOrdersByClient(global.testUserId);
      
      if (!Array.isArray(orders)) throw new Error('Résultat doit être un tableau');
      if (orders.length === 0) throw new Error('Aucune commande trouvée');
      
      log(`   📋 ${orders.length} commande(s) trouvée(s) pour le client`, 'reset');
    });

    await test('Récupérer commandes par restaurant (getOrdersByRestaurant)', async () => {
      const orders = await Order.getOrdersByRestaurant(global.testRestaurantId);
      
      if (!Array.isArray(orders)) throw new Error('Résultat doit être un tableau');
      if (orders.length === 0) throw new Error('Aucune commande trouvée');
      
      log(`   📋 ${orders.length} commande(s) trouvée(s) pour le restaurant`, 'reset');
    });

    await test('Vérifier peut être mise à jour (canBeUpdated)', async () => {
      // Remettre la commande en CREATED
      await Order.updateStatus(global.testOrderId, 'CREATED');
      
      const order = await Order.findByOrderId(global.testOrderId);
      const canBeUpdated = order.canBeUpdated();
      
      if (!canBeUpdated) throw new Error('Commande devrait pouvoir être mise à jour');
      
      // Mettre en DELIVERED
      await Order.updateStatus(global.testOrderId, 'DELIVERED');
      const deliveredOrder = await Order.findByOrderId(global.testOrderId);
      const cannotBeUpdated = deliveredOrder.canBeUpdated();
      
      if (cannotBeUpdated) throw new Error('Commande DELIVERED ne devrait pas pouvoir être mise à jour');
      
      log(`   ✅ canBeUpdated fonctionne`, 'reset');
    });
// ============================================
// NETTOYAGE
// ============================================
// log('\n' + '='.repeat(70), 'yellow');
// log('🧹 NETTOYAGE DES DONNÉES DE TEST', 'yellow');
// log('='.repeat(70), 'yellow');

// try {
//   if (createdOrderIds.length > 0) {
//     await Order.deleteMany({ _id: { $in: createdOrderIds } });
//   }
  
//   if (createdDelivererIds.length > 0) {
//     await Deliverer.deleteMany({ _id: { $in: createdDelivererIds } });
//   }
  
//   if (createdRestaurantIds.length > 0) {
//     await Restaurant.deleteMany({ _id: { $in: createdRestaurantIds } });
//   }
  
//   if (createdUserIds.length > 0) {
//     await User.deleteMany({ _id: { $in: createdUserIds } });
//   }
// } catch (cleanupError) {
//   ...
// }


    // ============================================
    // RÉSUMÉ
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('📊 RÉSUMÉ DES TESTS', 'blue');
    log('='.repeat(70), 'blue');
    log(`✅ Tests réussis: ${testsPassed}`, 'green');
    log(`❌ Tests échoués: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    log(`📈 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'cyan');
    log('='.repeat(70), 'blue');

    if (testsFailed === 0) {
      log('\n🎉 Tous les tests sont passés! Les modèles MongoDB Priorité 2 fonctionnent correctement.', 'green');
      log('\n💡 Les modèles sont prêts à être utilisés dans les controllers.', 'cyan');
    } else {
      log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow');
    }

    // Déconnexion de MongoDB
    await disconnectDB();
    log('\n🔌 Déconnecté de MongoDB', 'yellow');

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
    
    // Nettoyage en cas d'erreur
    try {
      await disconnectDB();
    } catch (disconnectError) {
      // Ignorer les erreurs de déconnexion
    }
    
    process.exit(1);
  }
}

// Démarrer les tests
runTests();

