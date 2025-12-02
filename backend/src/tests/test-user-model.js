/**
 * Script de test pour vérifier le modèle User.js
 * 
 * Ce script teste:
 * - Création d'un utilisateur
 * - Recherche par adresse
 * - Mise à jour du profil
 * - Ajout d'adresse de livraison
 * - Méthodes d'instance
 * 
 * Usage:
 * node test-user-model.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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
  log('🧪 TEST DU MODÈLE User.js', 'blue');
  log('='.repeat(70), 'blue');

  try {
    // Connexion MongoDB
    log('\n🔌 Connexion à MongoDB...', 'yellow');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non défini dans .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ MongoDB connecté', 'green');

    // Nettoyer la base de données de test
    log('\n🧹 Nettoyage des données de test...', 'yellow');
    await User.deleteMany({ address: /^0x[a-f0-9]{40}$/i });
    log('✅ Données de test nettoyées', 'green');

    // Adresse de test
    const testAddress = '0x1234567890123456789012345678901234567890';
    const testAddressLower = testAddress.toLowerCase();

    // ============================================
    // TEST 1: Création d'un utilisateur
    // ============================================
    await test('Création d\'un utilisateur', async () => {
      const userData = {
        address: testAddress,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+33612345678',
        deliveryAddresses: []
      };

      const user = new User(userData);
      await user.save();

      if (!user._id) throw new Error('Utilisateur non créé');
      if (user.address !== testAddressLower) throw new Error('Adresse non normalisée');
      if (!user.createdAt) throw new Error('createdAt non généré');
      
      log(`   📝 Utilisateur créé: ${user.name} (${user.address})`, 'reset');
    });

    // ============================================
    // TEST 2: Recherche par adresse
    // ============================================
    await test('Recherche par adresse (findByAddress)', async () => {
      const user = await User.findByAddress(testAddress);
      
      if (!user) throw new Error('Utilisateur non trouvé');
      if (user.address !== testAddressLower) throw new Error('Adresse incorrecte');
      if (user.name !== 'John Doe') throw new Error('Nom incorrect');
      
      log(`   📍 Utilisateur trouvé: ${user.name}`, 'reset');
    });

    // ============================================
    // TEST 3: Mise à jour du profil
    // ============================================
    await test('Mise à jour du profil (updateProfile)', async () => {
      const updates = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '+33698765432'
      };

      const updatedUser = await User.updateProfile(testAddress, updates);
      
      if (!updatedUser) throw new Error('Utilisateur non mis à jour');
      if (updatedUser.name !== 'John Updated') throw new Error('Nom non mis à jour');
      if (updatedUser.email !== 'john.updated@example.com') throw new Error('Email non mis à jour');
      if (!updatedUser.updatedAt) throw new Error('updatedAt non mis à jour');
      
      log(`   ✏️  Profil mis à jour: ${updatedUser.name}`, 'reset');
    });

    // ============================================
    // TEST 4: Ajout d'adresse de livraison
    // ============================================
    await test('Ajout d\'adresse de livraison (addDeliveryAddress)', async () => {
      const addressData = {
        label: 'Domicile',
        address: '123 Rue de la Paix, Paris',
        lat: 48.8566,
        lng: 2.3522
      };

      const user = await User.addDeliveryAddress(testAddress, addressData);
      
      if (!user) throw new Error('Utilisateur non trouvé');
      if (!user.deliveryAddresses || user.deliveryAddresses.length === 0) {
        throw new Error('Adresse de livraison non ajoutée');
      }
      if (user.deliveryAddresses[0].label !== 'Domicile') {
        throw new Error('Label incorrect');
      }
      
      log(`   📍 Adresse ajoutée: ${user.deliveryAddresses[0].label}`, 'reset');
    });

    // ============================================
    // TEST 5: Méthode d'instance hasDeliveryAddress
    // ============================================
    await test('Méthode d\'instance hasDeliveryAddress', async () => {
      const user = await User.findByAddress(testAddress);
      
      if (!user) throw new Error('Utilisateur non trouvé');
      
      const hasAddress = user.hasDeliveryAddress('Domicile');
      if (!hasAddress) throw new Error('Adresse "Domicile" non trouvée');
      
      const hasNotAddress = user.hasDeliveryAddress('Travail');
      if (hasNotAddress) throw new Error('Adresse "Travail" trouvée alors qu\'elle n\'existe pas');
      
      log(`   ✅ Méthode hasDeliveryAddress fonctionne`, 'reset');
    });

    // ============================================
    // TEST 6: Validation d'adresse Ethereum
    // ============================================
    await test('Validation d\'adresse Ethereum invalide', async () => {
      try {
        const invalidUser = new User({
          address: 'invalid-address',
          name: 'Test'
        });
        await invalidUser.save();
        throw new Error('Validation échouée - adresse invalide acceptée');
      } catch (error) {
        if (error.name === 'ValidationError') {
          log(`   ✅ Validation fonctionne: ${error.message}`, 'reset');
        } else {
          throw error;
        }
      }
    });

    // ============================================
    // TEST 7: Validation d'email
    // ============================================
    await test('Validation d\'email invalide', async () => {
      try {
        const invalidUser = new User({
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          name: 'Test',
          email: 'invalid-email'
        });
        await invalidUser.save();
        throw new Error('Validation échouée - email invalide accepté');
      } catch (error) {
        if (error.name === 'ValidationError') {
          log(`   ✅ Validation email fonctionne`, 'reset');
        } else {
          throw error;
        }
      }
    });

    // ============================================
    // TEST 8: Unicité de l'adresse
    // ============================================
    await test('Unicité de l\'adresse (doublon)', async () => {
      try {
        const duplicateUser = new User({
          address: testAddress, // Même adresse que le premier utilisateur
          name: 'Duplicate User'
        });
        await duplicateUser.save();
        throw new Error('Unicité échouée - doublon accepté');
      } catch (error) {
        if (error.code === 11000 || error.name === 'MongoServerError') {
          log(`   ✅ Unicité fonctionne: doublon rejeté`, 'reset');
        } else {
          throw error;
        }
      }
    });

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
      log('\n🎉 Tous les tests sont passés! Le modèle User.js fonctionne correctement.', 'green');
    } else {
      log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow');
    }

    // Nettoyage
    log('\n🧹 Nettoyage des données de test...', 'yellow');
    await User.deleteMany({ address: testAddressLower });
    log('✅ Données de test supprimées', 'green');

    // Fermeture
    await mongoose.connection.close();
    log('\n✅ Connexion MongoDB fermée', 'green');

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Démarrer les tests
runTests();

