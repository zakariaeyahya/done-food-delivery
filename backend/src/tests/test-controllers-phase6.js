/**
 * Script de test pour vérifier les controllers Phase 6
 * 
 * Ce script teste:
 * - userController.js : Contrôleur utilisateurs
 * - restaurantController.js : Contrôleur restaurants
 * - delivererController.js : Contrôleur livreurs
 * 
 * Usage:
 * node src/tests/test-controllers-phase6.js
 * 
 * Prérequis:
 * - MongoDB doit être connecté (via database.js)
 * - Variables d'environnement configurées (.env)
 */

require('dotenv').config();
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

// Variables pour stocker les données de test (avec timestamp pour éviter les conflits)
const timestamp = Date.now();
let testUserAddress = `0x${'1'.repeat(40)}`;
let testRestaurantAddress = `0x${'2'.repeat(40)}`;
let testDelivererAddress = `0x${'3'.repeat(40)}`;

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
  log('🧪 TEST DES CONTROLLERS PHASE 6', 'blue');
  log('='.repeat(70), 'blue');

  try {
    // Connexion à MongoDB
    log('\n🔌 Connexion à MongoDB...', 'yellow');
    await connectDB();
    log('✅ Connecté à MongoDB', 'green');

    // Importer les controllers directement
    const userController = require('../controllers/userController');
    const restaurantController = require('../controllers/restaurantController');
    const delivererController = require('../controllers/delivererController');

    // ============================================
    // TEST 1: userController.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('1️⃣  TEST DE userController.js', 'blue');
    log('='.repeat(70), 'blue');

    const User = require('../models/User');
    const Order = require('../models/Order');

    await test('registerUser - Création utilisateur', async () => {
      // Supprimer l'utilisateur s'il existe déjà
      await User.deleteMany({ address: testUserAddress.toLowerCase() });

      const req = {
        body: {
          address: testUserAddress,
          name: 'Test User',
          email: `testuser${timestamp}@example.com`,
          phone: '+33123456789'
        }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.registerUser(req, res);

      if (res.statusCode !== 201) throw new Error(`Status code devrait être 201, reçu ${res.statusCode}`);
      if (!res.jsonData.success) throw new Error('Success devrait être true');
      if (!res.jsonData.user) throw new Error('User devrait être défini');

      const user = await User.findByAddress(testUserAddress);
      if (!user) throw new Error('Utilisateur non trouvé dans MongoDB');
      createdUserIds.push(user._id);

      log(`   👤 Utilisateur créé: ${res.jsonData.user.name}`, 'reset');
    });

    await test('registerUser - Utilisateur déjà existant', async () => {
      const req = {
        body: {
          address: testUserAddress,
          name: 'Another User',
          email: 'another@example.com'
        }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.registerUser(req, res);

      if (res.statusCode !== 409) throw new Error(`Status code devrait être 409, reçu ${res.statusCode}`);
      log(`   ✅ Conflit détecté correctement`, 'reset');
    });

    await test('getUserProfile - Récupération profil', async () => {
      const req = {
        params: { address: testUserAddress },
        validatedAddress: testUserAddress.toLowerCase()
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.getUserProfile(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.user) throw new Error('User devrait être défini');
      if (res.jsonData.user.address !== testUserAddress.toLowerCase()) {
        throw new Error('Adresse incorrecte');
      }

      log(`   🔍 Profil récupéré: ${res.jsonData.user.name}`, 'reset');
    });

    await test('updateUserProfile - Mise à jour profil', async () => {
      const req = {
        params: { address: testUserAddress },
        userAddress: testUserAddress.toLowerCase(),
        body: {
          name: 'Updated Test User',
          email: 'updated@example.com'
        }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.updateUserProfile(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (res.jsonData.user.name !== 'Updated Test User') throw new Error('Nom non mis à jour');

      log(`   ✏️  Profil mis à jour: ${res.jsonData.user.name}`, 'reset');
    });

    await test('getUserOrders - Récupération commandes', async () => {
      const user = await User.findByAddress(testUserAddress);
      const req = {
        params: { address: testUserAddress },
        userAddress: testUserAddress.toLowerCase(),
        query: { page: 1, limit: 10 }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.getUserOrders(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!Array.isArray(res.jsonData.orders)) throw new Error('Orders devrait être un tableau');

      log(`   📋 ${res.jsonData.orders.length} commande(s) trouvée(s)`, 'reset');
    });

    await test('getUserTokens - Mock tokens', async () => {
      const req = {
        params: { address: testUserAddress },
        validatedAddress: testUserAddress.toLowerCase()
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await userController.getUserTokens(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (res.jsonData.balance !== "0") throw new Error('Balance devrait être "0"');
      if (!Array.isArray(res.jsonData.transactions)) throw new Error('Transactions devrait être un tableau');

      log(`   💰 Mock tokens: balance=${res.jsonData.balance}`, 'reset');
    });

    // ============================================
    // TEST 2: restaurantController.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('2️⃣  TEST DE restaurantController.js', 'blue');
    log('='.repeat(70), 'blue');

    const Restaurant = require('../models/Restaurant');

    await test('registerRestaurant - Création restaurant', async () => {
      // Supprimer le restaurant s'il existe déjà
      await Restaurant.deleteMany({ address: testRestaurantAddress.toLowerCase() });

      const req = {
        body: {
          address: testRestaurantAddress,
          name: 'Test Restaurant',
          cuisine: 'Italienne',
          description: 'Un restaurant de test',
          email: `restaurant${timestamp}@example.com`,
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
        },
        files: null // Pas de fichiers pour ce test
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.registerRestaurant(req, res);

      if (res.statusCode !== 201) throw new Error(`Status code devrait être 201, reçu ${res.statusCode}`);
      if (!res.jsonData.restaurant) throw new Error('Restaurant devrait être défini');

      const restaurant = await Restaurant.findByAddress(testRestaurantAddress);
      if (!restaurant) throw new Error('Restaurant non trouvé dans MongoDB');
      createdRestaurantIds.push(restaurant._id);

      log(`   🍕 Restaurant créé: ${res.jsonData.restaurant.name}`, 'reset');
    });

    await test('getRestaurant - Récupération restaurant', async () => {
      const restaurant = await Restaurant.findByAddress(testRestaurantAddress);
      const req = {
        params: { id: restaurant._id.toString() }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.getRestaurant(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.restaurant) throw new Error('Restaurant devrait être défini');

      log(`   🔍 Restaurant récupéré: ${res.jsonData.restaurant.name}`, 'reset');
    });

    await test('getAllRestaurants - Liste restaurants', async () => {
      const req = {
        query: { cuisine: 'Italienne' }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.getAllRestaurants(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!Array.isArray(res.jsonData.restaurants)) throw new Error('Restaurants devrait être un tableau');

      log(`   📋 ${res.jsonData.restaurants.length} restaurant(s) trouvé(s)`, 'reset');
    });

    await test('getRestaurantOrders - Commandes restaurant', async () => {
      const restaurant = await Restaurant.findByAddress(testRestaurantAddress);
      const req = {
        params: { id: restaurant._id.toString() },
        query: {}
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.getRestaurantOrders(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!Array.isArray(res.jsonData.orders)) throw new Error('Orders devrait être un tableau');

      log(`   📋 ${res.jsonData.orders.length} commande(s) trouvée(s)`, 'reset');
    });

    await test('getRestaurantAnalytics - Analytics restaurant', async () => {
      const restaurant = await Restaurant.findByAddress(testRestaurantAddress);
      const req = {
        params: { id: restaurant._id.toString() },
        query: {}
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.getRestaurantAnalytics(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.analytics) throw new Error('Analytics devrait être défini');

      log(`   📊 Analytics: ${res.jsonData.analytics.totalOrders} commandes`, 'reset');
    });

    await test('updateMenu - Mise à jour menu', async () => {
      const restaurant = await Restaurant.findByAddress(testRestaurantAddress);
      const req = {
        params: { id: restaurant._id.toString() },
        body: {
          menu: [
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
          ]
        },
        files: null
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await restaurantController.updateMenu(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.menu) throw new Error('Menu devrait être défini');
      if (res.jsonData.menu.length !== 2) throw new Error('Menu devrait avoir 2 items');

      log(`   📝 Menu mis à jour: ${res.jsonData.menu.length} items`, 'reset');
    });

    // ============================================
    // TEST 3: delivererController.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('3️⃣  TEST DE delivererController.js', 'blue');
    log('='.repeat(70), 'blue');

    const Deliverer = require('../models/Deliverer');

    await test('registerDeliverer - Création livreur', async () => {
      // Supprimer le livreur s'il existe déjà
      await Deliverer.deleteMany({ address: testDelivererAddress.toLowerCase() });

      const req = {
        body: {
          address: testDelivererAddress,
          name: 'Test Deliverer',
          phone: `+3361234567${timestamp.toString().slice(-2)}`, // Numéro unique
          vehicleType: 'bike',
          location: {
            lat: 48.8566,
            lng: 2.3522
          }
        }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.registerDeliverer(req, res);

      if (res.statusCode !== 201) throw new Error(`Status code devrait être 201, reçu ${res.statusCode}`);
      if (!res.jsonData.deliverer) throw new Error('Deliverer devrait être défini');

      const deliverer = await Deliverer.findByAddress(testDelivererAddress);
      if (!deliverer) throw new Error('Livreur non trouvé dans MongoDB');
      createdDelivererIds.push(deliverer._id);

      log(`   🚴 Livreur créé: ${res.jsonData.deliverer.name}`, 'reset');
    });

    await test('getDeliverer - Récupération livreur', async () => {
      const req = {
        params: { address: testDelivererAddress },
        validatedAddress: testDelivererAddress.toLowerCase()
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.getDeliverer(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.deliverer) throw new Error('Deliverer devrait être défini');

      log(`   🔍 Livreur récupéré: ${res.jsonData.deliverer.name}`, 'reset');
    });

    await test('getAvailableDeliverers - Livreurs disponibles', async () => {
      // Mettre le livreur disponible et staké
      await Deliverer.setAvailability(testDelivererAddress, true);
      await Deliverer.findOneAndUpdate(
        { address: testDelivererAddress.toLowerCase() },
        { $set: { isStaked: true } }
      );

      const req = {
        query: {}
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.getAvailableDeliverers(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!Array.isArray(res.jsonData.deliverers)) throw new Error('Deliverers devrait être un tableau');

      log(`   📋 ${res.jsonData.deliverers.length} livreur(s) disponible(s)`, 'reset');
    });

    await test('updateDelivererStatus - Mise à jour statut', async () => {
      const req = {
        params: { address: testDelivererAddress },
        userAddress: testDelivererAddress.toLowerCase(),
        body: {
          isAvailable: false
        }
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.updateDelivererStatus(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (res.jsonData.isAvailable !== false) throw new Error('isAvailable devrait être false');

      log(`   🔄 Statut mis à jour: ${res.jsonData.isAvailable}`, 'reset');
    });

    await test('stakeAsDeliverer - Mock stake', async () => {
      const req = {
        body: {
          address: testDelivererAddress,
          amount: '0.1'
        },
        userAddress: testDelivererAddress.toLowerCase()
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.stakeAsDeliverer(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.deliverer.isStaked) throw new Error('isStaked devrait être true');

      log(`   💰 Mock stake: ${res.jsonData.deliverer.stakedAmount} ETH`, 'reset');
    });

    await test('getDelivererOrders - Commandes livreur', async () => {
      const req = {
        params: { address: testDelivererAddress },
        validatedAddress: testDelivererAddress.toLowerCase(),
        query: {}
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.getDelivererOrders(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!Array.isArray(res.jsonData.orders)) throw new Error('Orders devrait être un tableau');

      log(`   📋 ${res.jsonData.orders.length} commande(s) trouvée(s)`, 'reset');
    });

    await test('getDelivererEarnings - Earnings livreur', async () => {
      const req = {
        params: { address: testDelivererAddress },
        userAddress: testDelivererAddress.toLowerCase(),
        query: {}
      };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.jsonData = data;
          return this;
        }
      };

      await delivererController.getDelivererEarnings(req, res);

      if (res.statusCode !== 200) throw new Error(`Status code devrait être 200, reçu ${res.statusCode}`);
      if (!res.jsonData.earnings) throw new Error('Earnings devrait être défini');

      log(`   💵 Earnings: ${res.jsonData.earnings.totalEarnings} MATIC`, 'reset');
    });

    // ============================================
    // NETTOYAGE
    // ============================================
    log('\n' + '='.repeat(70), 'yellow');
    log('🧹 NETTOYAGE DES DONNÉES DE TEST', 'yellow');
    log('='.repeat(70), 'yellow');

    try {
      if (createdOrderIds.length > 0) {
        await Order.deleteMany({ _id: { $in: createdOrderIds } });
        log(`   🗑️  ${createdOrderIds.length} commande(s) supprimée(s)`, 'reset');
      }
      
      if (createdDelivererIds.length > 0) {
        await Deliverer.deleteMany({ _id: { $in: createdDelivererIds } });
        log(`   🗑️  ${createdDelivererIds.length} livreur(s) supprimé(s)`, 'reset');
      }
      
      if (createdRestaurantIds.length > 0) {
        await Restaurant.deleteMany({ _id: { $in: createdRestaurantIds } });
        log(`   🗑️  ${createdRestaurantIds.length} restaurant(s) supprimé(s)`, 'reset');
      }
      
      if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
        log(`   🗑️  ${createdUserIds.length} utilisateur(s) supprimé(s)`, 'reset');
      }
    } catch (cleanupError) {
      log(`   ⚠️  Erreur lors du nettoyage: ${cleanupError.message}`, 'yellow');
    }

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
      log('\n🎉 Tous les tests sont passés! Les controllers Phase 6 fonctionnent correctement.', 'green');
      log('\n💡 Les controllers sont prêts à être utilisés dans les routes.', 'cyan');
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

