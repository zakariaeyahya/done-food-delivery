# SPRINT 6: ORACLES & ADVANCED FEATURES

## OBJECTIF
Intégrer des Oracles (Chainlink + GPS + Météo) et un système d'arbitrage tokenisé pour rendre l'application plus intelligente, fiable et décentralisée.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES** ou **PARTIELLEMENT REMPLIS**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `contracts/oracles/` (existe)
- ✓ `contracts/governance/` (existe)
- ✓ `backend/src/services/` (existe)

**Fichiers existants mais vides/à compléter:**
- ✓ `contracts/oracles/DonePriceOracle.sol` (vide - à compléter)
- ✓ `contracts/oracles/DoneGPSOracle.sol` (vide - à compléter)
- ✓ `contracts/oracles/DoneWeatherOracle.sol` (vide - à compléter)
- ✓ `contracts/governance/DoneArbitration.sol` (vide - à compléter)
- ✓ `backend/src/services/chainlinkService.js` (vide - à compléter)
- ✓ `backend/src/services/gpsOracleService.js` (vide - à compléter)
- ✓ `backend/src/services/arbitrationService.js` (vide - à compléter)

**Fichiers documentés:**
- ✓ `contracts/oracles/README.md` (créé et documenté)
- ✓ `contracts/governance/README.md` (créé et documenté)
- ✓ `backend/src/services/README_SPRINT6.md` (créé et documenté - 1975 lignes)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Hardhat est configuré (Sprint 1)
- ✓ Obtenir une clé API Chainlink (si nécessaire)
- ✓ Préparer les adresses des contrats existants (OrderManager, Token)
- ✓ Avoir des MATIC de test pour déploiement
- ✓ Comprendre le fonctionnement des Chainlink Price Feeds

### ÉTAPE 2: INSTALLATION DES DÉPENDANCES ORACLES
1. Aller dans le dossier `contracts/`:
   ```bash
   cd contracts
   ```
2. Installer les dépendances Chainlink:
   ```bash
   npm install @chainlink/contracts
   ```
3. Vérifier que OpenZeppelin est installé (déjà fait Sprint 1)

### ÉTAPE 3: IMPLÉMENTATION DU CONTRAT DonePriceOracle.sol
**Fichier à compléter:** `contracts/oracles/DonePriceOracle.sol` (vide - à compléter)

**Implémenter:**
- Oracle de prix MATIC/USD utilisant Chainlink Price Feed
- Imports: `@chainlink/contracts` AggregatorV3Interface, OpenZeppelin Ownable
- Variables: priceFeed (AggregatorV3Interface), DECIMALS, PRECISION
- Constructeur: prend address Chainlink Price Feed (Mumbai ou Mainnet)
- Fonctions:
  * `getLatestPrice()` - Récupère prix MATIC/USD depuis Chainlink
  * `convertUSDtoMATIC(uint256 usdAmount)` - Convertit USD en MATIC
  * `convertMATICtoUSD(uint256 maticAmount)` - Convertit MATIC en USD
  * `getPriceWithAge()` - Prix avec âge de la donnée
- Events: PriceUpdated, ConversionRequested

### ÉTAPE 4: IMPLÉMENTATION DU CONTRAT DoneGPSOracle.sol
**Fichier à compléter:** `contracts/oracles/DoneGPSOracle.sol` (vide - à compléter)

**Implémenter:**
- Oracle GPS pour vérification livraison on-chain
- Imports: OpenZeppelin AccessControl, ReentrancyGuard
- Structs: GPSLocation, DeliveryRoute
- Variables: DELIVERER_ROLE, ORACLE_ROLE, deliveryRoutes mapping, currentLocations mapping
- Constantes: DELIVERY_RADIUS (100m), EARTH_RADIUS (6371000m)
- Fonctions:
  * `updateLocation(uint256 orderId, int256 lat, int256 lng)`
  * `verifyDelivery(uint256 orderId, int256 clientLat, int256 clientLng)`
  * `calculateDistance(int256 lat1, int256 lng1, int256 lat2, int256 lng2)`
  * `getDeliveryRoute(uint256 orderId)`
  * `setDeliveryRadius(uint256 newRadius)`
- Events: LocationUpdated, DeliveryVerified, RouteCompleted

### ÉTAPE 5: IMPLÉMENTATION DU CONTRAT DoneWeatherOracle.sol
**Fichier à compléter:** `contracts/oracles/DoneWeatherOracle.sol` (vide - à compléter)

**Implémenter:**
- Oracle météo (bonus) pour adapter conditions livraison
- Imports: Chainlink AggregatorV3Interface (optionnel), OpenZeppelin Ownable
- Enums: WeatherCondition (SUNNY, CLOUDY, RAINY, SNOWY, STORM)
- Structs: WeatherData
- Variables: weatherByLocation mapping, deliveryFeeMultipliers mapping
- Constantes: UPDATE_INTERVAL (1 hour)
- Fonctions:
  * `updateWeather(int256 lat, int256 lng, WeatherCondition condition, int256 temperature)`
  * `getWeather(int256 lat, int256 lng)`
  * `adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)`
  * `canDeliver(int256 lat, int256 lng)`
  * `setFeeMultiplier(WeatherCondition condition, uint256 multiplier)`
- Events: WeatherUpdated, DeliveryFeeAdjusted, ExtremeWeatherAlert

### ÉTAPE 6: IMPLÉMENTATION DU CONTRAT DoneArbitration.sol
**Fichier à compléter:** `contracts/governance/DoneArbitration.sol` (vide - à compléter)

**Implémenter:**
- Système d'arbitrage décentralisé par vote communautaire
- Imports: OpenZeppelin AccessControl, ReentrancyGuard, DoneToken, DoneOrderManager
- Variables: doneToken, orderManager, disputeCount, disputes mapping, hasVoted mapping, votes mapping
- Structs: Dispute
- Enums: Winner, DisputeStatus
- Events: DisputeCreated, VoteCast, DisputeResolved
- Fonctions:
  * `createDispute(uint256 orderId, string reason, string evidenceIPFS)`
  * `voteDispute(uint256 disputeId, Winner winner)`
  * `resolveDispute(uint256 disputeId)`
  * `getDispute(uint256 disputeId)`
  * `getVoteDistribution(uint256 disputeId)`
  * `getUserVotingPower(address user)`
- Paramètres configurables: minVotingPowerRequired (1000 DONE), votingPeriod (48h)

### ÉTAPE 7: IMPLÉMENTATION DES SERVICES BACKEND
**Fichiers à compléter (existent mais vides):**

1. **`backend/src/services/chainlinkService.js`** (vide - à compléter)
   - Service interaction Chainlink Price Feed et DonePriceOracle
   - Fonctions avec métriques de performance:
     * `fetchPrice()` - Récupère prix MATIC/USD depuis Chainlink
       → Métriques: totalFetches, failedFetches, averageFetchTime, cacheHitRate
       → Performance cible: Cache Hit Rate >75%, Avg Fetch <500ms
     * `convertUSDtoMATIC(usdAmount)` - Convertit USD en MATIC
     * `convertMATICtoUSD(maticAmount)` - Convertit MATIC en USD
     * `syncPrice()` - Synchronise prix avec contrat DonePriceOracle
       → **Cron Job: Toutes les 10 minutes**
     * `getLatestPrice()` - Dernier prix enregistré
     * `getPriceMetrics()` - Récupère métriques de performance
   - Gestion erreurs: Timeouts (5s), Retry Logic (3 tentatives), Fallback cache
   - Routes API: POST /api/oracles/price/convert, GET /api/oracles/price/latest, GET /api/oracles/price/metrics

2. **`backend/src/services/gpsOracleService.js`** (vide - à compléter)
   - Service gestion données GPS et interaction DoneGPSOracle
   - Fonctions avec métriques de performance:
     * `updateLocation(orderId, lat, lng)` - Met à jour position livreur
       → Métriques: totalUpdates, onChainRatio, averageLatency
       → Performance cible: On-chain Ratio 15-25%, Latency <200ms (off-chain)
     * `verifyDelivery(orderId, clientLat, clientLng)` - Vérifie livraison valide
       → Métriques: totalVerifications, successRate, averageDistance
       → Performance cible: Success Rate >90%
     * `calculateDistance(lat1, lng1, lat2, lng2)` - Calcule distance entre points
     * `trackDelivery(orderId)` - Suit livraison temps réel
     * `getDeliveryPath(orderId)` - Récupère chemin complet
     * `getGPSMetrics()` - Récupère métriques de performance
   - Stratégie stockage hybride: Off-chain (MongoDB) + On-chain (Blockchain - every 5th update)
   - Routes API: POST /api/oracles/gps/update, POST /api/oracles/gps/verify, GET /api/oracles/gps/track/:orderId, GET /api/oracles/gps/metrics

3. **`backend/src/services/arbitrationService.js`** (vide - à compléter)
   - Service gestion système arbitrage décentralisé
   - Fonctions avec métriques de performance:
     * `createDispute(orderId, reason, evidence)` - Crée nouveau litige
       → Métriques: totalDisputes, averageCreationTime
     * `voteDispute(disputeId, winner, voterAddress)` - Enregistre vote
       → Métriques: totalVotes, averageVotingPower
     * `resolveDispute(disputeId)` - Résout litige après période vote
       → Métriques: totalResolved, resolutionRate, averageResolutionTime
       → **Cron Job: Toutes les heures (résolution automatique)**
       → Performance cible: Resolution Rate >80%, Avg Time <48h
     * `getDispute(disputeId)` - Récupère détails litige
     * `getVotingPower(address)` - Calcule pouvoir de vote
     * `getDisputeVotes(disputeId)` - Récupère tous votes
     * `getArbitrationMetrics()` - Récupère métriques de performance
   - Routes API: POST /api/oracles/arbitration/dispute, POST /api/oracles/arbitration/vote, POST /api/oracles/arbitration/resolve/:disputeId, GET /api/oracles/arbitration/dispute/:disputeId, GET /api/oracles/arbitration/metrics

### ÉTAPE 8: MISE À JOUR DES CONTRATS EXISTANTS
**Fichier à modifier:** `contracts/DoneOrderManager.sol`

**À ajouter:**
- Intégrer DonePriceOracle pour conversions prix
- Intégrer DoneGPSOracle pour vérification livraison
- Intégrer DoneArbitration pour résolution litiges

### ÉTAPE 9: COMPILATION ET TESTS
1. Compiler les contrats:
   ```bash
   npx hardhat compile
   ```
2. Créer des tests pour les oracles:
   - `test/oracles/DonePriceOracle.test.js` (à créer)
   - `test/oracles/DoneGPSOracle.test.js` (à créer)
   - `test/oracles/DoneWeatherOracle.test.js` (à créer)
   - `test/governance/DoneArbitration.test.js` (à créer)
3. Exécuter les tests:
   ```bash
   npx hardhat test
   ```

### ÉTAPE 10: DÉPLOIEMENT DES ORACLES
1. Déployer DonePriceOracle (avec address Chainlink Price Feed Mumbai):
   ```bash
   npx hardhat run scripts/deploy-oracles.js --network mumbai
   ```
2. Déployer DoneGPSOracle
3. Déployer DoneWeatherOracle (optionnel)
4. Déployer DoneArbitration
5. Configurer les adresses dans DoneOrderManager

### ÉTAPE 11: CONFIGURATION POST-DÉPLOIEMENT
1. Configurer les rôles:
   - ORACLE_ROLE pour backend services
   - DELIVERER_ROLE pour livreurs (GPS)
   - ARBITER_ROLE pour arbitres
2. Configurer Chainlink Price Feed address (Mumbai ou Mainnet)
3. Tester les conversions de prix
4. Tester le GPS tracking
5. Tester l'arbitrage

### ÉTAPE 12: VALIDATION DU SPRINT 6
✓ Tous les fichiers vides complétés avec le code
✓ Oracles intégrés (Price, GPS, Weather)
✓ Prix dynamiques MATIC/USD
✓ GPS verification on-chain
✓ Système arbitrage décentralisé
✓ Services backend pour oracles avec métriques de performance
✓ **11 Routes API créées et documentées**
✓ **4 Types de tests implémentés (Unit, Integration, Performance, Resilience)**
✓ **Gestion erreurs complète (Timeouts, Retry Logic, Logging, Validation)**
✓ **2 Cron Jobs configurés (Price sync 10min, Dispute resolution 1h)**
✓ **Endpoint monitoring /api/oracles/metrics**
✓ Tests passent
✓ Contrats déployés
✓ Documentation complète (3 READMEs 5/5 ⭐, total 1975 lignes pour backend)

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Contrats Oracles (Fichiers vides - à compléter)
- `contracts/oracles/DonePriceOracle.sol` ⚠️ VIDE
- `contracts/oracles/DoneGPSOracle.sol` ⚠️ VIDE
- `contracts/oracles/DoneWeatherOracle.sol` ⚠️ VIDE

### 2. Contrat Governance (Fichier vide - à compléter)
- `contracts/governance/DoneArbitration.sol` ⚠️ VIDE

### 3. Services Backend (Fichiers vides - à compléter)
- `backend/src/services/chainlinkService.js` ⚠️ VIDE
- `backend/src/services/gpsOracleService.js` ⚠️ VIDE
- `backend/src/services/arbitrationService.js` ⚠️ VIDE

### 4. Mise à jour Contrat Existant
- `contracts/DoneOrderManager.sol` (à modifier pour intégrer oracles)

### 5. Tests (Fichiers à créer)
- `test/oracles/DonePriceOracle.test.js` (à créer)
- `test/oracles/DoneGPSOracle.test.js` (à créer)
- `test/oracles/DoneWeatherOracle.test.js` (à créer)
- `test/governance/DoneArbitration.test.js` (à créer)

### 6. Scripts Déploiement
- `scripts/deploy-oracles.js` (à créer)

### 7. Documentation (Déjà créée)
- ✓ `contracts/oracles/README.md` (créé et documenté)
- ✓ `contracts/governance/README.md` (créé et documenté)
- ✓ `backend/src/services/README_SPRINT6.md` (créé et documenté - 1975 lignes)

---

## ROUTES API BACKEND (11 routes)

### Prix Oracles:
- `POST /api/oracles/price/convert` - Convertir USD/MATIC
- `GET /api/oracles/price/latest` - Prix actuel
- `GET /api/oracles/price/metrics` - Métriques prix

### GPS Oracles:
- `POST /api/oracles/gps/update` - Update position livreur
- `POST /api/oracles/gps/verify` - Vérifier livraison
- `GET /api/oracles/gps/track/:orderId` - Tracking temps réel
- `GET /api/oracles/gps/metrics` - Métriques GPS

### Arbitration:
- `POST /api/oracles/arbitration/dispute` - Créer litige
- `POST /api/oracles/arbitration/vote` - Voter
- `POST /api/oracles/arbitration/resolve/:disputeId` - Résoudre
- `GET /api/oracles/arbitration/dispute/:disputeId` - Détails litige
- `GET /api/oracles/arbitration/metrics` - Métriques arbitrage

---

## CRON JOBS

1. **Price Sync Job** (toutes les 10 minutes):
   - Synchronise prix MATIC/USD depuis Chainlink
   - Appelle `chainlinkService.syncPrice()`

2. **Dispute Resolution Job** (toutes les heures):
   - Résout automatiquement disputes après période vote
   - Appelle `arbitrationService.resolveDispute()`

---

## MÉTRIQUES DE PERFORMANCE CIBLES

**chainlinkService.js:**
- Cache Hit Rate: >75% (cible: 78%)
- Average Fetch Time: <500ms
- Sync Success Rate: >95%

**gpsOracleService.js:**
- On-chain Storage Ratio: 15-25% (every 5th update)
- Update Latency: <200ms (off-chain), <2s (on-chain)
- Verification Success Rate: >90%

**arbitrationService.js:**
- Dispute Resolution Rate: >80% (cible: 85%)
- Average Resolution Time: <48h
- Participation Rate: >10% token holders

---

## LIVRABLES ATTENDUS

✓ Oracles intégrés (Price, GPS, Weather)
✓ Prix dynamiques MATIC/USD
✓ GPS verification on-chain
✓ Système arbitrage décentralisé
✓ Services backend pour oracles avec métriques de performance
✓ 11 Routes API créées et documentées
✓ 4 Types de tests implémentés
✓ Gestion erreurs complète
✓ 2 Cron Jobs configurés
✓ Endpoint monitoring /api/oracles/metrics
✓ Documentation complète (1975 lignes pour backend)

---

## NOTES IMPORTANTES

- Sprint 6 rend le système vraiment décentralisé et Web3
- Oracles permettent automatisation et fiabilité
- Arbitrage tokenisé transforme la plateforme en DAO-like
- Documentation backend README_SPRINT6.md est LLM-ready (1975 lignes)
- Vérifier les coûts de gas pour les oracles
- Tester exhaustivement avant mainnet

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 7: Testing & Security
→ Lire `SPRINT_7.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_7.txt` pour les étapes détaillées

