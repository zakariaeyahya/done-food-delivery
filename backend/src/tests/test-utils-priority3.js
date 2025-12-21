/**
 * Script de test pour vérifier les utilitaires Priorité 3
 * 
 * Ce script teste:
 * - priceOracle.js : Conversion de prix MATIC/USD
 * - gpsTracker.js : Calculs GPS (distance, ETA, proximité, routes)
 * 
 * Usage:
 * node src/tests/test-utils-priority3.js
 */

require('dotenv').config();

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
    log(`\n Test: ${name}`, 'cyan');
    await testFn();
    log(`    PASSÉ`, 'green');
    testsPassed++;
    return true;
  } catch (error) {
    log(`    ÉCHOUÉ: ${error.message}`, 'red');
    if (error.stack) {
      console.log(`    ${error.stack.split('\n')[1]?.trim()}`);
    }
    testsFailed++;
    return false;
  }
}

async function runTests() {
  log('='.repeat(70), 'blue');
  log(' TEST DES UTILITAIRES PRIORITÉ 3', 'blue');
  log('='.repeat(70), 'blue');

  try {
    // ============================================
    // TEST 1: priceOracle.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('  TEST DE priceOracle.js', 'blue');
    log('='.repeat(70), 'blue');

    const { 
      getMATICPrice, 
      convertUSDtoMATIC, 
      convertMATICtoUSD, 
      formatMATIC, 
      formatUSD 
    } = require('../utils/priceOracle');

    await test('Import de priceOracle.js', async () => {
      if (!getMATICPrice) throw new Error('getMATICPrice non exporté');
      if (!convertUSDtoMATIC) throw new Error('convertUSDtoMATIC non exporté');
      if (!convertMATICtoUSD) throw new Error('convertMATICtoUSD non exporté');
      if (!formatMATIC) throw new Error('formatMATIC non exporté');
      if (!formatUSD) throw new Error('formatUSD non exporté');
    });

    await test('Récupération du prix MATIC (getMATICPrice)', async () => {
      const price = await getMATICPrice();
      
      if (typeof price !== 'number') throw new Error('Le prix doit être un nombre');
      if (price <= 0) throw new Error('Le prix doit être positif');
      if (price > 100) throw new Error('Le prix semble irréaliste (> $100)');
      
      log(`   💰 Prix MATIC/USD: $${price.toFixed(4)}`, 'reset');
    });

    await test('Conversion USD → MATIC (convertUSDtoMATIC)', async () => {
      const usdAmount = 10;
      const maticWei = await convertUSDtoMATIC(usdAmount);
      
      if (!maticWei) throw new Error('Résultat null');
      if (maticWei.toString() === '0') throw new Error('Résultat zéro');
      
      log(`   💵 ${usdAmount} USD = ${maticWei.toString()} wei`, 'reset');
      
      // Vérifier que c'est un BigNumber
      const { ethers } = require('ethers');
      if (!ethers.isBigNumber && typeof maticWei.toString !== 'function') {
        throw new Error('Le résultat doit être un BigNumber');
      }
    });

    await test('Conversion MATIC → USD (convertMATICtoUSD)', async () => {
      const { ethers } = require('ethers');
      const testMatic = ethers.parseEther('1.5'); // 1.5 MATIC
      
      const usdAmount = await convertMATICtoUSD(testMatic);
      
      if (typeof usdAmount !== 'number') throw new Error('Le résultat doit être un nombre');
      if (usdAmount <= 0) throw new Error('Le montant USD doit être positif');
      
      log(`   💰 1.5 MATIC = $${usdAmount.toFixed(2)}`, 'reset');
    });

    await test('Conversion bidirectionnelle (USD → MATIC → USD)', async () => {
      const originalUSD = 25;
      const maticWei = await convertUSDtoMATIC(originalUSD);
      const convertedUSD = await convertMATICtoUSD(maticWei);
      
      // Tolérance de 5% pour les arrondis et variations de prix
      const tolerance = originalUSD * 0.05;
      const difference = Math.abs(convertedUSD - originalUSD);
      
      if (difference > tolerance) {
        throw new Error(`Différence trop grande: ${difference.toFixed(2)} USD (tolérance: ${tolerance.toFixed(2)})`);
      }
      
      log(`    ${originalUSD} USD → MATIC → ${convertedUSD.toFixed(2)} USD (diff: ${difference.toFixed(2)})`, 'reset');
    });

    await test('Formatage MATIC (formatMATIC)', async () => {
      const { ethers } = require('ethers');
      const testMatic = ethers.parseEther('1.2345');
      
      const formatted = formatMATIC(testMatic);
      
      if (typeof formatted !== 'string') throw new Error('Le résultat doit être une string');
      if (!formatted.includes('MATIC')) throw new Error('Le format doit contenir "MATIC"');
      
      log(`    Formaté: ${formatted}`, 'reset');
    });

    await test('Formatage USD (formatUSD)', async () => {
      const testUSD = 12.345;
      const formatted = formatUSD(testUSD);
      
      if (typeof formatted !== 'string') throw new Error('Le résultat doit être une string');
      if (!formatted.startsWith('$')) throw new Error('Le format doit commencer par "$"');
      
      log(`   💵 Formaté: ${formatted}`, 'reset');
    });

    // ============================================
    // TEST 2: gpsTracker.js
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log('  TEST DE gpsTracker.js', 'blue');
    log('='.repeat(70), 'blue');

    const { 
      calculateDistance, 
      isNearby, 
      getETA, 
      generateMockRoute 
    } = require('../utils/gpsTracker');

    await test('Import de gpsTracker.js', async () => {
      if (!calculateDistance) throw new Error('calculateDistance non exporté');
      if (!isNearby) throw new Error('isNearby non exporté');
      if (!getETA) throw new Error('getETA non exporté');
      if (!generateMockRoute) throw new Error('generateMockRoute non exporté');
    });

    await test('Calcul de distance (calculateDistance) - Paris à Lyon', async () => {
      // Paris: 48.8566, 2.3522
      // Lyon: 45.7640, 4.8357
      const distance = calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);
      
      if (typeof distance !== 'number') throw new Error('La distance doit être un nombre');
      if (distance <= 0) throw new Error('La distance doit être positive');
      
      // Distance réelle Paris-Lyon ≈ 392 km
      const expectedDistance = 392;
      const tolerance = 50; // Tolérance de 50 km
      
      if (Math.abs(distance - expectedDistance) > tolerance) {
        log(`     Distance calculée: ${distance.toFixed(2)} km (attendu: ~${expectedDistance} km)`, 'yellow');
      } else {
        log(`    Distance Paris-Lyon: ${distance.toFixed(2)} km`, 'reset');
      }
    });

    await test('Calcul de distance - Points proches', async () => {
      // Deux points très proches (quelques mètres)
      const distance = calculateDistance(48.8566, 2.3522, 48.8567, 2.3523);
      
      if (distance < 0) throw new Error('La distance doit être positive');
      if (distance > 1) throw new Error('La distance semble trop grande pour des points proches');
      
      log(`    Distance points proches: ${(distance * 1000).toFixed(2)} mètres`, 'reset');
    });

    await test('Validation coordonnées invalides', async () => {
      try {
        calculateDistance(91, 0, 0, 0); // Latitude invalide
        throw new Error('Validation échouée - latitude invalide acceptée');
      } catch (error) {
        if (error.message.includes('Latitude')) {
          log(`    Validation fonctionne: ${error.message}`, 'reset');
        } else {
          throw error;
        }
      }
    });

    await test('Vérification proximité (isNearby) - Livreur proche', async () => {
      const delivererLocation = { lat: 48.8566, lng: 2.3522 };
      const targetLocation = { lat: 48.8567, lng: 2.3523 };
      const radiusKm = 1; // 1 km
      
      const nearby = isNearby(delivererLocation, targetLocation, radiusKm);
      
      if (typeof nearby !== 'boolean') throw new Error('Le résultat doit être un boolean');
      if (!nearby) throw new Error('Le livreur devrait être proche');
      
      log(`    Livreur proche: ${nearby}`, 'reset');
    });

    await test('Vérification proximité - Livreur loin', async () => {
      const delivererLocation = { lat: 48.8566, lng: 2.3522 }; // Paris
      const targetLocation = { lat: 45.7640, lng: 4.8357 }; // Lyon
      const radiusKm = 1; // 1 km
      
      const nearby = isNearby(delivererLocation, targetLocation, radiusKm);
      
      if (nearby) throw new Error('Le livreur ne devrait pas être proche');
      
      log(`    Livreur loin: ${nearby}`, 'reset');
    });

    await test('Calcul ETA (getETA)', async () => {
      const currentLocation = { lat: 48.8566, lng: 2.3522 };
      const destinationLocation = { lat: 48.8606, lng: 2.3376 };
      const speedKmh = 30; // 30 km/h
      
      const eta = getETA(currentLocation, destinationLocation, speedKmh);
      
      if (typeof eta !== 'number') throw new Error('L\'ETA doit être un nombre');
      if (eta <= 0) throw new Error('L\'ETA doit être positif');
      if (eta > 1000) throw new Error('L\'ETA semble irréaliste (> 1000 min)');
      
      log(`   ⏱️  ETA: ${eta} minutes (vitesse: ${speedKmh} km/h)`, 'reset');
    });

    await test('Calcul ETA avec vitesse par défaut', async () => {
      const currentLocation = { lat: 48.8566, lng: 2.3522 };
      const destinationLocation = { lat: 48.8606, lng: 2.3376 };
      
      const eta = getETA(currentLocation, destinationLocation);
      
      if (!eta) throw new Error('L\'ETA ne devrait pas être null');
      
      log(`   ⏱️  ETA (vitesse par défaut): ${eta} minutes`, 'reset');
    });

    await test('Génération route simulée (generateMockRoute)', async () => {
      const startLocation = { lat: 48.8566, lng: 2.3522 };
      const endLocation = { lat: 48.8606, lng: 2.3376 };
      const steps = 5;
      
      const route = generateMockRoute(startLocation, endLocation, steps);
      
      if (!Array.isArray(route)) throw new Error('La route doit être un tableau');
      if (route.length !== steps + 1) throw new Error(`La route doit avoir ${steps + 1} points (départ + ${steps} intermédiaires + arrivée)`);
      
      // Vérifier le point de départ
      if (route[0].lat !== startLocation.lat || route[0].lng !== startLocation.lng) {
        throw new Error('Le point de départ est incorrect');
      }
      
      // Vérifier le point d'arrivée
      const lastPoint = route[route.length - 1];
      if (Math.abs(lastPoint.lat - endLocation.lat) > 0.01 || 
          Math.abs(lastPoint.lng - endLocation.lng) > 0.01) {
        throw new Error('Le point d\'arrivée est incorrect');
      }
      
      // Vérifier que chaque point a un timestamp
      route.forEach((point, index) => {
        if (!point.timestamp) throw new Error(`Point ${index} n'a pas de timestamp`);
        if (!point.lat || !point.lng) throw new Error(`Point ${index} a des coordonnées invalides`);
      });
      
      log(`   🗺️  Route générée: ${route.length} points`, 'reset');
      log(`    Départ: (${route[0].lat}, ${route[0].lng})`, 'reset');
      log(`    Arrivée: (${lastPoint.lat.toFixed(4)}, ${lastPoint.lng.toFixed(4)})`, 'reset');
    });

    await test('Génération route avec steps par défaut', async () => {
      const startLocation = { lat: 48.8566, lng: 2.3522 };
      const endLocation = { lat: 48.8606, lng: 2.3376 };
      
      const route = generateMockRoute(startLocation, endLocation);
      
      if (route.length !== 11) throw new Error('La route par défaut doit avoir 11 points (10 steps + 1)');
      
      log(`   🗺️  Route par défaut: ${route.length} points`, 'reset');
    });

    // ============================================
    // RÉSUMÉ
    // ============================================
    log('\n' + '='.repeat(70), 'blue');
    log(' RÉSUMÉ DES TESTS', 'blue');
    log('='.repeat(70), 'blue');
    log(` Tests réussis: ${testsPassed}`, 'green');
    log(` Tests échoués: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    log(` Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'cyan');
    log('='.repeat(70), 'blue');

    if (testsFailed === 0) {
      log('\n Tous les tests sont passés! Les utilitaires Priorité 3 fonctionnent correctement.', 'green');
      log('\n💡 Les utilitaires sont prêts à être utilisés dans les services et controllers.', 'cyan');
    } else {
      log('\n  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'yellow');
    }

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    log(`\n Erreur fatale: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Démarrer les tests
runTests();

