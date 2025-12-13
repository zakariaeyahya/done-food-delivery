# Guide des Oracles - DONE Food Delivery

Documentation complete pour l'utilisation des oracles dans la plateforme DONE Food Delivery.

---

## Table des Matieres

1. [Introduction](#1-introduction)
2. [Architecture des Oracles](#2-architecture-des-oracles)
3. [DonePriceOracle](#3-donepriceoracle)
4. [DoneGPSOracle](#4-donegpsoracle)
5. [DoneWeatherOracle](#5-doneweatheroracle)
6. [DoneArbitration](#6-donearbitration)
7. [Integration Backend](#7-integration-backend)
8. [API Endpoints](#8-api-endpoints)
9. [Configuration](#9-configuration)
10. [Exemples d'utilisation](#10-exemples-dutilisation)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Introduction

### Qu'est-ce qu'un Oracle ?

Un oracle est un pont entre la blockchain (on-chain) et le monde exterieur (off-chain). Il permet d'integrer des donnees externes dans les smart contracts.

### Oracles dans DONE Food Delivery

| Oracle | Role | Source |
|--------|------|--------|
| **DonePriceOracle** | Prix MATIC/USD | Chainlink Price Feed |
| **DoneGPSOracle** | Verification livraison | GPS livreur + client |
| **DoneWeatherOracle** | Conditions meteo | Service externe |
| **DoneArbitration** | Resolution litiges | Vote communautaire |

### Pourquoi des Oracles ?

1. **Prix dynamique** : Convertir les prix USD en MATIC en temps reel
2. **Preuve de livraison** : Verifier que le livreur est bien arrive
3. **Frais adaptatifs** : Ajuster les frais selon la meteo
4. **Justice decentralisee** : Resoudre les litiges par vote

---

## 2. Architecture des Oracles

### Schema Global

```
                    +------------------+
                    |   Frontend       |
                    |   (React)        |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |   Backend API    |
                    |   (Node.js)      |
                    +--------+---------+
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
+----------------+  +----------------+  +------------------+
| chainlink      |  | gpsOracle      |  | weatherOracle    |
| Service        |  | Service        |  | Service          |
+-------+--------+  +-------+--------+  +--------+---------+
        |                   |                    |
        v                   v                    v
+----------------+  +----------------+  +------------------+
| DonePrice      |  | DoneGPS        |  | DoneWeather      |
| Oracle         |  | Oracle         |  | Oracle           |
| (Solidity)     |  | (Solidity)     |  | (Solidity)       |
+-------+--------+  +----------------+  +------------------+
        |
        v
+----------------+
| Chainlink      |
| Price Feed     |
| (External)     |
+----------------+
```

### Contrats Deployes (Polygon Amoy)

| Contrat | Adresse |
|---------|---------|
| DonePriceOracle | `0x1D4fF5879B7b2653b6aB8d23423A9799FdABc582` |
| DoneGPSOracle | `0x1a52184023BF93eb0cD150C4595FbCeD3dE88d97` |
| DoneWeatherOracle | `0xa8E5C18c397120699969D22f703e273044c5a125` |
| DoneArbitration | `0xf339Af8A5e429E015Ee038198665026844a87EF6` |
| Chainlink MATIC/USD | `0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada` |

---

## 3. DonePriceOracle

### Description

Oracle de prix utilisant Chainlink pour obtenir le prix MATIC/USD en temps reel.

### Fonctions du Contrat

```solidity
// Obtenir le dernier prix
function getLatestPrice() public view returns (int256 price, uint8 decimals, uint256 timestamp)

// Convertir USD en MATIC
function convertUSDtoMATIC(uint256 usdAmount) public view returns (uint256)

// Convertir MATIC en USD
function convertMATICtoUSD(uint256 maticAmount) public view returns (uint256)
```

### Service Backend : `chainlinkService.js`

```javascript
const chainlinkService = require('./services/chainlinkService');

// Obtenir le prix actuel
const price = await chainlinkService.fetchPrice();
console.log(`MATIC/USD: $${price}`);

// Obtenir le dernier prix (avec cache)
const latest = await chainlinkService.getLatestPrice();
console.log(`Prix: $${latest.price}, Source: ${latest.source}`);

// Convertir USD en MATIC
const result = await chainlinkService.convertUSDtoMATIC(100);
console.log(`100 USD = ${result.matic} MATIC`);
```

### API Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/oracles/price` | Prix MATIC/USD actuel |
| GET | `/api/oracles/price/latest` | Dernier prix (cache) |
| GET | `/api/oracles/price/metrics` | Metriques performance |
| POST | `/api/oracles/convert` | Conversion USD/MATIC |

### Exemple API

```bash
# Obtenir le prix
curl http://localhost:3000/api/oracles/price

# Reponse
{
  "success": true,
  "data": {
    "pair": "MATIC/USD",
    "price": "0.89",
    "timestamp": "2025-12-13T12:00:00.000Z",
    "source": "chainlink"
  }
}

# Convertir 100 USD en MATIC
curl -X POST http://localhost:3000/api/oracles/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "MATIC"}'

# Reponse
{
  "success": true,
  "data": {
    "originalAmount": "100",
    "convertedAmount": "112.359550",
    "from": "USD",
    "to": "MATIC",
    "exchangeRate": "0.89"
  }
}
```

---

## 4. DoneGPSOracle

### Description

Oracle GPS pour la verification de livraison on-chain. Enregistre les positions des livreurs et verifie la proximite avec le client.

### Fonctions du Contrat

```solidity
// Mettre a jour la position du livreur
function updateLocation(uint256 orderId, int256 lat, int256 lng) external

// Verifier la livraison (distance < 100m)
function verifyDelivery(uint256 orderId, int256 clientLat, int256 clientLng) external view returns (bool)

// Calculer la distance entre deux points
function calculateDistance(int256 lat1, int256 lng1, int256 lat2, int256 lng2) public pure returns (uint256)

// Obtenir l'historique du trajet
function getDeliveryRoute(uint256 orderId) external view returns (GPSLocation[] locations, uint256 totalDistance, uint256 startTime, uint256 endTime)
```

### Roles Requis

| Role | Permission |
|------|------------|
| `DELIVERER_ROLE` | Mettre a jour sa position |
| `ORACLE_ROLE` | Verifier les livraisons |

### Service Backend : `gpsOracleService.js`

```javascript
const gpsOracleService = require('./services/gpsOracleService');

// Mettre a jour la position (off-chain + on-chain)
const result = await gpsOracleService.updateLocation(
  orderId,      // ID de la commande
  48.8566,      // Latitude
  2.3522,       // Longitude
  delivererAddress
);

console.log(`Position mise a jour: ${result.location.lat}, ${result.location.lng}`);
console.log(`On-chain: ${result.onChainUpdate}, TxHash: ${result.txHash}`);

// Verifier la livraison
const verification = await gpsOracleService.verifyDelivery(
  orderId,
  clientLat,
  clientLng
);

console.log(`Livraison verifiee: ${verification.verified}`);
console.log(`Distance: ${verification.distance}m`);

// Suivre une livraison
const tracking = await gpsOracleService.trackDelivery(orderId);
console.log(`Points GPS: ${tracking.totalPoints}`);
console.log(`Distance totale: ${tracking.totalDistance}`);
```

### Strategie Hybride

```
Position GPS
    |
    v
+-------------------+
| MongoDB (rapide)  |  <-- Toutes les positions (off-chain)
+-------------------+
    |
    | Every 5th position OR near destination
    v
+-------------------+
| DoneGPSOracle     |  <-- Positions critiques (on-chain)
| (blockchain)      |
+-------------------+
```

### API Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/oracles/gps/update` | Mettre a jour position |
| POST | `/api/oracles/gps/verify` | Verifier livraison |
| GET | `/api/oracles/gps/track/:orderId` | Suivre livraison |
| GET | `/api/oracles/gps/metrics` | Metriques GPS |

### Exemple API

```bash
# Mettre a jour la position (necessite authentification)
curl -X POST http://localhost:3000/api/oracles/gps/update \
  -H "Content-Type: application/json" \
  -H "x-wallet-address: 0x..." \
  -d '{
    "orderId": 1,
    "lat": 48.8566,
    "lng": 2.3522,
    "delivererAddress": "0x..."
  }'

# Suivre une livraison
curl http://localhost:3000/api/oracles/gps/track/1

# Reponse
{
  "success": true,
  "data": {
    "orderId": 1,
    "gpsHistory": [
      {"lat": 48.8566, "lng": 2.3522, "timestamp": "..."},
      {"lat": 48.8570, "lng": 2.3530, "timestamp": "..."}
    ],
    "totalDistance": "150.25m",
    "totalPoints": 10,
    "duration": "15.00 min",
    "averageSpeed": "0.60 km/h"
  }
}
```

---

## 5. DoneWeatherOracle

### Description

Oracle meteo pour adapter les conditions de livraison et ajuster les frais.

### Conditions Meteo

| Condition | Code | Multiplicateur Frais |
|-----------|------|---------------------|
| SUNNY | 0 | 100% (1.0x) |
| CLOUDY | 1 | 100% (1.0x) |
| RAINY | 2 | 120% (1.2x) |
| SNOWY | 3 | 150% (1.5x) |
| STORM | 4 | 200% (2.0x) - Livraison suspendue |

### Fonctions du Contrat

```solidity
// Obtenir la meteo pour une position
function getWeather(int256 lat, int256 lng) external view returns (
  WeatherCondition condition,
  int256 temperature,
  uint256 timestamp,
  bool isExtreme
)

// Verifier si la livraison est possible
function canDeliver(int256 lat, int256 lng) external view returns (bool)

// Ajuster les frais de livraison
function adjustDeliveryFee(uint256 baseFee, WeatherCondition condition) external view returns (uint256)

// Mettre a jour la meteo (admin seulement)
function updateWeather(int256 lat, int256 lng, WeatherCondition condition, int256 temperature) external
```

### Service Backend : `weatherOracleService.js`

```javascript
const weatherOracleService = require('./services/weatherOracleService');

// Obtenir la meteo
const weather = await weatherOracleService.getWeather(48.8566, 2.3522);
console.log(`Condition: ${weather.weather.condition}`);
console.log(`Temperature: ${weather.weather.temperature}C`);
console.log(`Peut livrer: ${weather.delivery.canDeliver}`);
console.log(`Multiplicateur: ${weather.delivery.feeMultiplier}x`);

// Verifier si livraison possible
const canDeliver = await weatherOracleService.canDeliver(48.8566, 2.3522);

// Calculer frais ajustes
const fees = await weatherOracleService.adjustDeliveryFee(1000000, 48.8566, 2.3522);
console.log(`Frais de base: ${fees.baseFee}`);
console.log(`Frais ajustes: ${fees.adjustedFee}`);

// Mettre a jour meteo (admin)
const result = await weatherOracleService.updateWeather(
  48.8566,    // lat
  2.3522,     // lng
  "RAINY",    // condition
  15          // temperature (Celsius)
);
```

### API Endpoint

| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/oracles/weather?lat=X&lng=Y` | Obtenir meteo |

### Exemple API

```bash
# Obtenir la meteo pour Paris
curl "http://localhost:3000/api/oracles/weather?lat=48.8566&lng=2.3522"

# Reponse
{
  "success": true,
  "data": {
    "source": "on-chain",
    "location": {"lat": 48.8566, "lng": 2.3522},
    "weather": {
      "condition": "SUNNY",
      "conditionCode": 0,
      "temperature": 20,
      "temperatureUnit": "C",
      "isExtreme": false
    },
    "delivery": {
      "canDeliver": true,
      "feeMultiplier": 1
    },
    "timestamp": "2025-12-13T12:00:00.000Z"
  }
}
```

---

## 6. DoneArbitration

### Description

Systeme d'arbitrage decentralise par vote communautaire. Les detenteurs de tokens DONE peuvent voter pour resoudre les litiges.

### Workflow

```
1. Client ouvre un litige
        |
        v
2. Litige cree (OPEN)
        |
        v
3. Periode de vote (48h)
        |
        v
4. Detenteurs DONE votent
   (1 token = 1 vote)
        |
        v
5. Quorum atteint (1000 DONE)
        |
        v
6. Arbitre resout le litige
        |
        v
7. Fonds redistribues
```

### Gagnants Possibles

| Gagnant | Action |
|---------|--------|
| CLIENT | Remboursement complet |
| RESTAURANT | Paiement normal |
| DELIVERER | Annulation slashing |

### Fonctions du Contrat

```solidity
// Creer un litige
function createDispute(
  uint256 orderId,
  address client,
  address restaurant,
  address deliverer,
  string reason,
  string evidenceIPFS
) external payable returns (uint256 disputeId)

// Voter sur un litige
function voteDispute(uint256 disputeId, Winner winner) external

// Resoudre un litige
function resolveDispute(uint256 disputeId) external

// Obtenir les details d'un litige
function getDispute(uint256 disputeId) external view returns (Dispute)

// Obtenir la distribution des votes
function getVoteDistribution(uint256 disputeId) external view returns (
  uint256 clientVotes,
  uint256 restaurantVotes,
  uint256 delivererVotes
)
```

### API Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/oracles/arbitration/dispute` | Creer litige |
| POST | `/api/oracles/arbitration/vote/:id` | Voter |
| POST | `/api/oracles/arbitration/resolve/:id` | Resoudre |
| GET | `/api/oracles/arbitration/dispute/:id` | Details litige |
| GET | `/api/oracles/arbitration/metrics` | Metriques |

---

## 7. Integration Backend

### Services et leurs roles

| Service | Fichier | Contrat |
|---------|---------|---------|
| Prix | `chainlinkService.js` | DonePriceOracle |
| Prix (fallback) | `priceOracleService.js` | Chainlink + CoinGecko |
| GPS | `gpsOracleService.js` | DoneGPSOracle |
| Meteo | `weatherOracleService.js` | DoneWeatherOracle |
| Arbitrage | `arbitrationService.js` | DoneArbitration |

### Controller

```
backend/src/controllers/oracleController.js
```

Gere toutes les routes `/api/oracles/*`

### Routes

```
backend/src/routes/oracles.js
```

---

## 8. API Endpoints - Resume

### Price Oracle

```
GET  /api/oracles/price           # Prix actuel
GET  /api/oracles/price/latest    # Dernier prix (cache)
GET  /api/oracles/price/metrics   # Metriques
POST /api/oracles/convert         # Conversion
```

### GPS Oracle

```
POST /api/oracles/gps/update      # Mettre a jour position
POST /api/oracles/gps/verify      # Verifier livraison
GET  /api/oracles/gps/track/:id   # Suivre livraison
GET  /api/oracles/gps/metrics     # Metriques
```

### Weather Oracle

```
GET  /api/oracles/weather         # Obtenir meteo
```

### Arbitration

```
POST /api/oracles/arbitration/dispute       # Creer litige
POST /api/oracles/arbitration/vote/:id      # Voter
POST /api/oracles/arbitration/resolve/:id   # Resoudre
GET  /api/oracles/arbitration/dispute/:id   # Details
GET  /api/oracles/arbitration/metrics       # Metriques
```

---

## 9. Configuration

### Variables d'environnement (`backend/.env`)

```bash
# Oracles Addresses
PRICE_ORACLE_ADDRESS=0x1D4fF5879B7b2653b6aB8d23423A9799FdABc582
GPS_ORACLE_ADDRESS=0x1a52184023BF93eb0cD150C4595FbCeD3dE88d97
WEATHER_ORACLE_ADDRESS=0xa8E5C18c397120699969D22f703e273044c5a125
ARBITRATION_ADDRESS=0xf339Af8A5e429E015Ee038198665026844a87EF6

# Chainlink
CHAINLINK_PRICE_FEED_ADDRESS=0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada

# RPC
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Backend wallet (pour transactions)
PRIVATE_KEY=0x...
```

### Attribution des Roles

```javascript
// GPS Oracle - Donner DELIVERER_ROLE aux livreurs
const DELIVERER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DELIVERER_ROLE"));
await gpsOracle.grantRole(DELIVERER_ROLE, delivererAddress);

// GPS Oracle - Donner ORACLE_ROLE au backend
const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
await gpsOracle.grantRole(ORACLE_ROLE, backendWalletAddress);

// Arbitration - Donner ARBITER_ROLE
const ARBITER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ARBITER_ROLE"));
await arbitration.grantRole(ARBITER_ROLE, arbiterAddress);
```

---

## 10. Exemples d'utilisation

### Cas 1 : Client passe une commande avec prix USD

```javascript
// 1. Frontend affiche prix en USD
const foodPriceUSD = 25; // $25

// 2. Convertir en MATIC via API
const response = await fetch('/api/oracles/convert', {
  method: 'POST',
  body: JSON.stringify({ amount: foodPriceUSD, from: 'USD', to: 'MATIC' })
});
const { convertedAmount } = await response.json();

// 3. Creer commande avec montant MATIC
await orderManager.createOrder(
  restaurantAddress,
  ethers.parseEther(convertedAmount),
  deliveryFee,
  ipfsHash,
  { value: totalAmount }
);
```

### Cas 2 : Livreur met a jour sa position

```javascript
// Frontend Deliverer
navigator.geolocation.watchPosition(async (position) => {
  const { latitude, longitude } = position.coords;

  // Envoyer au backend
  await fetch('/api/oracles/gps/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-address': delivererAddress
    },
    body: JSON.stringify({
      orderId,
      lat: latitude,
      lng: longitude,
      delivererAddress
    })
  });
});
```

### Cas 3 : Client confirme livraison avec verification GPS

```javascript
// 1. Client clique "Confirmer livraison"
// 2. Backend verifie la position
const verification = await gpsOracleService.verifyDelivery(
  orderId,
  clientLat,
  clientLng
);

if (verification.verified) {
  // 3. Confirmer on-chain
  await orderManager.confirmDelivery(orderId);
} else {
  throw new Error(`Livreur trop loin: ${verification.distance}m`);
}
```

### Cas 4 : Ajuster frais selon meteo

```javascript
// 1. Obtenir meteo pour la destination
const weather = await weatherOracleService.getWeather(destLat, destLng);

// 2. Verifier si livraison possible
if (!weather.delivery.canDeliver) {
  throw new Error('Livraison suspendue: conditions extremes');
}

// 3. Calculer frais ajustes
const baseDeliveryFee = ethers.parseEther('0.01');
const adjustedFee = baseDeliveryFee * BigInt(Math.round(weather.delivery.feeMultiplier * 100)) / 100n;
```

### Cas 5 : Ouvrir et resoudre un litige

```javascript
// 1. Client ouvre un litige
await arbitration.createDispute(
  orderId,
  clientAddress,
  restaurantAddress,
  delivererAddress,
  "Commande jamais recue",
  "QmEvidenceIPFSHash...",
  { value: ethers.parseEther("0.1") } // escrow
);

// 2. Detenteurs de DONE votent
await arbitration.voteDispute(disputeId, 1); // 1 = CLIENT

// 3. Apres 48h, arbitre resout
await arbitration.resolveDispute(disputeId);
// -> Client rembourse si majorite CLIENT
```

---

## 11. Troubleshooting

### Erreur : "Provider not initialized"

**Cause** : La connexion blockchain n'est pas etablie.

**Solution** :
```bash
# Verifier .env
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Redemarrer le backend
npm run dev
```

### Erreur : "GPS_ORACLE_ADDRESS not configured"

**Cause** : L'adresse du contrat GPS n'est pas definie.

**Solution** :
```bash
# Ajouter dans backend/.env
GPS_ORACLE_ADDRESS=0x1a52184023BF93eb0cD150C4595FbCeD3dE88d97
```

### Erreur : "No weather data"

**Cause** : Aucune donnee meteo n'a ete enregistree pour cette position.

**Solution** :
```javascript
// Utiliser updateWeather (admin) pour ajouter des donnees
await weatherOracleService.updateWeather(lat, lng, "SUNNY", 20);
```

### Erreur : "Deliverer not assigned"

**Cause** : Le livreur n'est pas assigne a cette commande.

**Solution** : Verifier que `assignDeliverer()` a ete appele avant.

### Erreur : "Not enough voting power"

**Cause** : Quorum de 1000 DONE non atteint.

**Solution** : Plus de detenteurs de DONE doivent voter.

---

## Ressources

- **Contrats** : `contracts/contracts/oracles/`
- **Services** : `backend/src/services/`
- **Routes** : `backend/src/routes/oracles.js`
- **Controller** : `backend/src/controllers/oracleController.js`
- **Tests** : `contracts/test/test-oracles-api.sh`

---

**Derniere mise a jour** : 2025-12-13
