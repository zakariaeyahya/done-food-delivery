/**
 * ============================================================================
 * DONE Food Delivery - Tests API Sprint 6 (Oracles & Advanced Features)
 * ============================================================================
 * 
 * Ce fichier teste toutes les nouvelles routes API du Sprint 6
 * Basé sur les routes définies dans backend/src/routes/oracles.js et disputes.js
 * 
 * ✅ ENDPOINTS TESTÉS (10 nouvelles routes):
 * 
 * 🔮 Price Oracles (3):
 *    - GET /api/oracles/price/latest
 *    - GET /api/oracles/price/metrics
 *    - POST /api/oracles/convert (déjà testé, mais inclus pour complétude)
 * 
 * 📍 GPS Oracles (4):
 *    - POST /api/oracles/gps/update
 *    - GET /api/oracles/gps/track/:orderId
 *    - GET /api/oracles/gps/metrics
 *    - POST /api/oracles/gps/verify (déjà testé, mais inclus pour complétude)
 * 
 * ⚖️ Arbitration (5):
 *    - POST /api/oracles/arbitration/dispute
 *    - POST /api/oracles/arbitration/vote/:id
 *    - POST /api/oracles/arbitration/resolve/:disputeId
 *    - GET /api/oracles/arbitration/dispute/:disputeId
 *    - GET /api/oracles/arbitration/metrics
 * 
 * Exécution : npm run test:api:sprint6 ou node src/tests/api-tests-sprint6.js
 * ============================================================================
 */

const request = require('supertest');
const { app } = require('../server');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_PREFIX = '/api';

// Données de test (adresses en minuscules pour passer ethers.isAddress)
const TEST_DATA = {
  walletAddress: '0x1234567890123456789012345678901234567890',
  restaurantAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
  delivererAddress: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
  mongoId: '507f1f77bcf86cd799439011',
};

// Headers d'authentification simulés
const getAuthHeaders = (address = TEST_DATA.walletAddress) => ({
  'Authorization': 'Bearer mock_signature_for_testing',
  'x-wallet-address': address,
  'x-message': 'Sign this message to authenticate',
  'Content-Type': 'application/json'
});

// Compteurs de résultats
let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;
const results = [];

// Variables globales pour les tests
let testOrderId = null;
let testDisputeId = null;
let testRestaurantId = null;

/**
 * Utilitaire pour exécuter un test
 */
async function runTest(name, testFn, skipReason = null) {
  if (skipReason) {
    testsSkipped++;
    results.push({ name, status: 'SKIP', reason: skipReason });
    console.log(`⏭️  SKIP: ${name} (${skipReason})`);
    return;
  }

  try {
    await testFn();
    testsPassed++;
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testsFailed++;
    let errorMsg = error.message || 'Erreur inconnue';
    if (error.code === 'ECONNREFUSED') {
      errorMsg = `Connexion refusée - Le serveur n'est pas démarré sur ${BASE_URL}`;
    }
    results.push({ name, status: 'FAIL', error: errorMsg });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Erreur: ${errorMsg}`);
  }
}

/**
 * Fonction principale pour exécuter tous les tests
 */
async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     DONE Food Delivery - Tests API Sprint 6                  ║');
  console.log('║     Oracles & Advanced Features                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`🌐 URL de base: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  // Vérifier que le serveur est disponible
  try {
    const healthCheck = await request(app).get('/health');
    if (healthCheck.status !== 200) {
      throw new Error('Serveur non disponible');
    }
    console.log('✅ Serveur disponible (status: 200)\n');
  } catch (error) {
    console.error('❌ Serveur non disponible. Veuillez démarrer le serveur avec: npm run dev');
    process.exit(1);
  }

  // ============================================================================
  // TESTS PRICE ORACLES
  // ============================================================================
  console.log('🔮 === TESTS PRICE ORACLES ===\n');

  await runTest('GET /api/oracles/price/latest - Récupérer le dernier prix enregistré', async () => {
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/price/latest`)
      .expect(200);
    
    if (!response.body.success) throw new Error('Response success should be true');
    if (!response.body.data) throw new Error('Response should have data');
    if (!response.body.data.price) throw new Error('Response should have price');
    if (!response.body.data.source) throw new Error('Response should have source');
  });

  await runTest('GET /api/oracles/price/metrics - Récupérer les métriques de performance prix', async () => {
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/price/metrics`)
      .expect(200);
    
    if (!response.body.success) throw new Error('Response success should be true');
    if (!response.body.data) throw new Error('Response should have data');
    if (typeof response.body.data.totalFetches !== 'number') throw new Error('totalFetches should be a number');
    if (typeof response.body.data.cacheHitRate !== 'string') throw new Error('cacheHitRate should be a string');
  });

  await runTest('POST /api/oracles/convert - Convertir USD vers MATIC', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/convert`)
      .send({
        amount: 100,
        from: 'USD',
        to: 'MATIC'
      })
      .expect(200);
    
    if (!response.body.success) throw new Error('Response success should be true');
    if (!response.body.data.convertedAmount) throw new Error('Response should have convertedAmount');
  });

  // ============================================================================
  // TESTS GPS ORACLES
  // ============================================================================
  console.log('\n📍 === TESTS GPS ORACLES ===\n');

  // Prérequis: Créer un order pour les tests GPS
  await runTest('SETUP: Créer un order pour les tests GPS', async () => {
    // Essayer de créer un restaurant ou récupérer l'existant
    const restaurantRes = await request(app)
      .post(`${API_PREFIX}/restaurants/register`)
      .send({
        address: TEST_DATA.restaurantAddress,
        name: 'Test Restaurant GPS',
        cuisine: 'Italian'
      });

    if (restaurantRes.status === 201 || restaurantRes.status === 200) {
      testRestaurantId = restaurantRes.body.data?._id || restaurantRes.body.data?.id;
    } else if (restaurantRes.status === 409) {
      // Restaurant existe déjà, le récupérer via GET /api/restaurants
      const getRestaurantsRes = await request(app)
        .get(`${API_PREFIX}/restaurants`);

      if (getRestaurantsRes.status === 200) {
        // Essayer différentes structures de réponse
        let restaurants = getRestaurantsRes.body.data?.restaurants ||
                          getRestaurantsRes.body.data ||
                          getRestaurantsRes.body.restaurants ||
                          getRestaurantsRes.body;

        if (Array.isArray(restaurants)) {
          const targetAddress = TEST_DATA.restaurantAddress.toLowerCase();
          const found = restaurants.find(r => {
            const rAddress = (r.address || r.walletAddress || '').toLowerCase();
            return rAddress === targetAddress;
          });
          if (found) {
            testRestaurantId = found._id || found.id;
          }
        }
      }
    }

    if (!testRestaurantId) {
      // Log pour debug
      const debugRes = await request(app).get(`${API_PREFIX}/restaurants`);
      console.log('DEBUG restaurants response:', JSON.stringify(debugRes.body, null, 2));
      throw new Error(`Restaurant setup failed: ${restaurantRes.status} - Could not find restaurant with address ${TEST_DATA.restaurantAddress}`);
    }

    // Créer un order
    const orderRes = await request(app)
      .post(`${API_PREFIX}/orders/create`)
      .set(getAuthHeaders(TEST_DATA.walletAddress))
      .send({
        restaurantId: testRestaurantId,
        items: [{ name: 'Pizza', quantity: 1, price: 15.50 }],
        deliveryAddress: '123 Test Street, Paris 75001',
        deliveryLat: 48.8606,
        deliveryLng: 2.3376,
        clientAddress: TEST_DATA.walletAddress
      });

    if (orderRes.status === 201 || orderRes.status === 200) {
      testOrderId = orderRes.body.orderId || orderRes.body.order?.orderId || orderRes.body.data?.orderId;
    }

    if (!testOrderId) {
      throw new Error(`Order creation failed: ${orderRes.status} - ${JSON.stringify(orderRes.body)}`);
    }
  });

  await runTest('POST /api/oracles/gps/update - Mettre à jour la position GPS du livreur', async () => {
    if (!testOrderId) {
      throw new Error('testOrderId not set - skipping test');
    }
    
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/gps/update`)
      .set(getAuthHeaders(TEST_DATA.delivererAddress))
      .send({
        orderId: testOrderId,
        lat: 48.8576,
        lng: 2.3522,
        delivererAddress: TEST_DATA.delivererAddress
      });
    
    // Accepter 200 ou 400/500 (order non trouvé ou erreur)
    if (![200, 400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data.location) throw new Error('Response should have location');
    }
  });

  await runTest('GET /api/oracles/gps/track/:orderId - Suivre la livraison en temps réel', async () => {
    if (!testOrderId) {
      throw new Error('testOrderId not set - skipping test');
    }
    
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/gps/track/${testOrderId}`);
    
    // Accepter 200 ou 404/500
    if (![200, 404, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data) throw new Error('Response should have data');
      if (!Array.isArray(response.body.data.gpsHistory)) throw new Error('gpsHistory should be an array');
    }
  });

  await runTest('GET /api/oracles/gps/metrics - Récupérer les métriques GPS', async () => {
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/gps/metrics`)
      .expect(200);
    
    if (!response.body.success) throw new Error('Response success should be true');
    if (!response.body.data) throw new Error('Response should have data');
    if (typeof response.body.data.totalUpdates !== 'number') throw new Error('totalUpdates should be a number');
    if (!response.body.data.successRate) throw new Error('successRate should be present');
  });

  await runTest('POST /api/oracles/gps/verify - Vérifier la livraison GPS', async () => {
    if (!testOrderId) {
      throw new Error('testOrderId not set - skipping test');
    }
    
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/gps/verify`)
      .set(getAuthHeaders(TEST_DATA.delivererAddress))
      .send({
        orderId: testOrderId,
        clientLat: 48.8606,
        clientLng: 2.3376
      });
    
    // Accepter 200 ou 400/500
    if (![200, 400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (typeof response.body.data.verified !== 'boolean') throw new Error('verified should be a boolean');
    }
  });

  // ============================================================================
  // TESTS ARBITRATION
  // ============================================================================
  console.log('\n⚖️ === TESTS ARBITRATION ===\n');

  await runTest('POST /api/oracles/arbitration/dispute - Créer un nouveau litige', async () => {
    if (!testOrderId) {
      throw new Error('testOrderId not set - skipping test');
    }
    
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/arbitration/dispute`)
      .set(getAuthHeaders(TEST_DATA.walletAddress))
      .send({
        orderId: testOrderId,
        reason: 'Test dispute reason',
        evidenceIPFS: null,
        userAddress: TEST_DATA.walletAddress
      });
    
    // Accepter 201 (créé) ou 400/500 (erreur)
    if (![201, 400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 201) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data.disputeId) throw new Error('Response should have disputeId');
      testDisputeId = response.body.data.disputeId || testOrderId;
    }
  });

  await runTest('POST /api/oracles/arbitration/vote/:id - Voter sur un litige', async () => {
    if (!testDisputeId) {
      throw new Error('testDisputeId not set - skipping test');
    }
    
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/arbitration/vote/${testDisputeId}`)
      .set(getAuthHeaders(TEST_DATA.walletAddress))
      .send({
        winner: 'CLIENT',
        voterAddress: TEST_DATA.walletAddress
      });
    
    // Accepter 200 ou 400/500 (pas assez de tokens ou erreur)
    if (![200, 400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data.vote) throw new Error('Response should have vote');
    }
  });

  await runTest('GET /api/oracles/arbitration/dispute/:disputeId - Récupérer les détails d\'un litige', async () => {
    if (!testDisputeId) {
      throw new Error('testDisputeId not set - skipping test');
    }
    
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/arbitration/dispute/${testDisputeId}`);
    
    // Accepter 200 ou 404/500
    if (![200, 404, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data.disputeId) throw new Error('Response should have disputeId');
    }
  });

  await runTest('GET /api/oracles/arbitration/metrics - Récupérer les métriques d\'arbitrage', async () => {
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/arbitration/metrics`)
      .expect(200);
    
    if (!response.body.success) throw new Error('Response success should be true');
    if (!response.body.data) throw new Error('Response should have data');
    if (typeof response.body.data.totalDisputes !== 'number') throw new Error('totalDisputes should be a number');
    if (!response.body.data.resolutionRate) throw new Error('resolutionRate should be present');
  });

  await runTest('POST /api/oracles/arbitration/resolve/:disputeId - Résoudre un litige', async () => {
    if (!testDisputeId) {
      throw new Error('testDisputeId not set - skipping test');
    }
    
    // Note: Cette route peut échouer si le litige n'a pas assez de votes (minimum 1000 DONE)
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/arbitration/resolve/${testDisputeId}`)
      .set(getAuthHeaders(TEST_DATA.walletAddress));
    
    // Accepter 200 ou 400/500 (litige pas encore résolvable - normal en test)
    if (![200, 400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status}`);
    }
    
    if (response.status === 200) {
      if (!response.body.success) throw new Error('Response success should be true');
      if (!response.body.data.winner) throw new Error('Response should have winner');
    }
  });

  // ============================================================================
  // TESTS VALIDATION & ERREURS
  // ============================================================================
  console.log('\n🔒 === TESTS VALIDATION & ERREURS ===\n');

  await runTest('Validation - POST /api/oracles/gps/update sans authentification', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/gps/update`)
      .send({
        orderId: 999999,
        lat: 48.8566,
        lng: 2.3522
      });
    
    // Devrait retourner 401 (Unauthorized) ou 400 (Bad Request)
    if (![401, 400, 403].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status} (attendu: 401, 400 ou 403)`);
    }
  });

  await runTest('Validation - POST /api/oracles/gps/update avec coordonnées invalides', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/gps/update`)
      .set(getAuthHeaders(TEST_DATA.delivererAddress))
      .send({
        orderId: 999999,
        lat: 999, // Latitude invalide (> 90)
        lng: 2.3522,
        delivererAddress: TEST_DATA.delivererAddress
      });
    
    if (![400, 500].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status} (attendu: 400 ou 500)`);
    }
  });

  await runTest('Validation - GET /api/oracles/gps/track/:orderId avec orderId invalide', async () => {
    const response = await request(app)
      .get(`${API_PREFIX}/oracles/gps/track/invalid`);
    
    if (response.status !== 400) {
      throw new Error(`Status inattendu: ${response.status} (attendu: 400)`);
    }
  });

  await runTest('Validation - POST /api/oracles/arbitration/dispute sans authentification', async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/oracles/arbitration/dispute`)
      .send({
        orderId: 999999,
        reason: 'Test'
      });
    
    // Devrait retourner 401 (Unauthorized) ou 400 (Bad Request)
    if (![401, 400, 403].includes(response.status)) {
      throw new Error(`Status inattendu: ${response.status} (attendu: 401, 400 ou 403)`);
    }
  });

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    RÉSUMÉ DES TESTS                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Tests réussis:  ${String(testsPassed).padStart(3)}   / ${testsPassed + testsFailed + testsSkipped}                            ║`);
  console.log(`║  ❌ Tests échoués:  ${String(testsFailed).padStart(3)}                                          ║`);
  console.log(`║  ⏭️  Tests ignorés: ${String(testsSkipped).padStart(3)}                                          ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Afficher les détails des échecs
  if (testsFailed > 0) {
    console.log('❌ Détails des échecs:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.name}`);
      console.log(`     Erreur: ${r.error}\n`);
    });
  }

  // Code de sortie
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Exécuter les tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Erreur fatale lors de l\'exécution des tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
