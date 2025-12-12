# Documentation des Smart Contracts - DoneFood

Documentation technique complète des smart contracts de la plateforme DoneFood déployés sur Polygon.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Contrats principaux](#contrats-principaux)
4. [Oracles (Sprint 6)](#-oracles-sprint-6)
5. [Interfaces et bibliothèques](#interfaces-et-bibliothèques)
6. [Événements](#événements)
7. [Sécurité](#sécurité)
8. [Interactions entre contrats](#interactions-entre-contrats)
9. [Exemples d'utilisation](#exemples-dutilisation)
10. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

DoneFood utilise une architecture de smart contracts décentralisée sur Polygon pour gérer :

- 📦 **Gestion des commandes** : Cycle de vie complet des commandes
- 💰 **Paiements** : Escrow et répartition automatique des fonds
- 🎁 **Tokens de fidélité** : Système de récompenses DONE
- 🔒 **Staking** : Garantie de fiabilité pour les livreurs
- ⚖️ **Arbitrage** : Résolution des litiges décentralisée
- 🔮 **Oracles** : Prix (Chainlink), GPS, Météo pour automatisation

### Technologies utilisées

- **Solidity** : Version 0.8.20
- **OpenZeppelin** : Contrats sécurisés (AccessControl, ReentrancyGuard, Pausable)
- **Réseau** : Polygon (Mainnet/Testnet)
- **Standards** : ERC20 pour les tokens

---

## 🏗️ Architecture

### Contrats principaux

```
DoneOrderManager (Contrat principal)
    ├── DonePaymentSplitter (Répartition des paiements)
    ├── DoneToken (Tokens de fidélité)
    ├── DoneStaking (Staking des livreurs)
    ├── DonePriceOracle (Oracle prix MATIC/USD - Chainlink)
    ├── DoneGPSOracle (Oracle GPS pour vérification livraison)
    ├── DoneWeatherOracle (Oracle météo pour ajustement frais)
    └── DoneArbitration (Arbitrage décentralisé tokenisé)
```

### Flux de données

```
Client → createOrder() → DoneOrderManager
                              ↓
                    Escrow des fonds
                              ↓
Restaurant → confirmPreparation() → PREPARING
                              ↓
Platform → assignDeliverer() → ASSIGNED
                              ↓
Deliverer → confirmPickup() → IN_DELIVERY
                              ↓
Client → confirmDelivery() → DELIVERED
                              ↓
                    PaymentSplitter → Split (70/20/10)
                              ↓
                    DoneToken → Mint rewards
```

---

## 📄 Contrats principaux

### 1. DoneOrderManager.sol

**Contrat principal** gérant le cycle de vie complet des commandes.

#### Rôles (AccessControl)

```solidity
CLIENT_ROLE      // Clients qui passent des commandes
RESTAURANT_ROLE  // Restaurants qui reçoivent des commandes
DELIVERER_ROLE   // Livreurs qui livrent les commandes
PLATFORM_ROLE    // Plateforme qui assigne les livreurs
ARBITRATOR_ROLE  // Arbitres qui résolvent les litiges
```

#### États des commandes (OrderStatus)

```solidity
enum OrderStatus {
    CREATED,      // Commande créée, en attente de préparation
    PREPARING,    // Restaurant prépare la commande
    ASSIGNED,     // Livreur assigné, en attente de récupération
    IN_DELIVERY,  // Livreur en route vers le client
    DELIVERED,    // Commande livrée et payée
    DISPUTED      // Litige ouvert
}
```

#### Structure Order

```solidity
struct Order {
    uint256 id;              // Identifiant unique de la commande
    address payable client;  // Adresse du client
    address payable restaurant; // Adresse du restaurant
    address payable deliverer;  // Adresse du livreur (assigné plus tard)
    uint256 foodPrice;       // Prix de la nourriture (en wei)
    uint256 deliveryFee;     // Frais de livraison (en wei)
    uint256 platformFee;     // Commission plateforme (10% de foodPrice)
    uint256 totalAmount;     // Montant total = foodPrice + deliveryFee + platformFee
    OrderStatus status;      // État actuel de la commande
    string ipfsHash;         // Hash IPFS des détails de la commande
    uint256 createdAt;      // Timestamp de création
    bool disputed;           // Indique si un litige est ouvert
    bool delivered;          // Indique si la commande a été livrée
}
```

#### Fonctions principales

##### `createOrder()`

Crée une nouvelle commande avec paiement en escrow.

```solidity
function createOrder(
    address payable _restaurant,
    uint256 _foodPrice,
    uint256 _deliveryFee,
    string memory _ipfsHash
) external payable returns (uint256)
```

**Paramètres :**
- `_restaurant` : Adresse du restaurant (doit avoir RESTAURANT_ROLE)
- `_foodPrice` : Prix de la nourriture en wei
- `_deliveryFee` : Frais de livraison en wei
- `_ipfsHash` : Hash IPFS contenant les détails de la commande

**Paiement requis :** `msg.value` doit être égal à `foodPrice + deliveryFee + platformFee`

**Événement émis :** `OrderCreated(uint256 orderId, address client, address restaurant, uint256 totalAmount)`

**Retourne :** `orderId` (identifiant unique de la commande)

---

##### `confirmPreparation()`

Le restaurant confirme qu'il a commencé la préparation.

```solidity
function confirmPreparation(uint256 _orderId) external
```

**Contrôles :**
- L'appelant doit être le restaurant de la commande
- La commande doit être en état `CREATED`
- L'appelant doit avoir `RESTAURANT_ROLE`

**Transition :** `CREATED` → `PREPARING`

**Événement émis :** `PreparationConfirmed(uint256 orderId, address restaurant)`

---

##### `assignDeliverer()`

La plateforme assigne un livreur à la commande.

```solidity
function assignDeliverer(uint256 _orderId, address payable _deliverer) external
```

**Contrôles :**
- L'appelant doit avoir `PLATFORM_ROLE`
- Le livreur doit avoir `DELIVERER_ROLE`
- Le livreur doit être staké (`isStaked(_deliverer) == true`)
- La commande doit être en état `PREPARING`

**Transition :** `PREPARING` → `ASSIGNED`

**Événement émis :** `DelivererAssigned(uint256 orderId, address deliverer)`

---

##### `confirmPickup()`

Le livreur confirme avoir récupéré la commande au restaurant.

```solidity
function confirmPickup(uint256 _orderId) external
```

**Contrôles :**
- L'appelant doit être le livreur assigné
- La commande doit être en état `ASSIGNED`
- L'appelant doit avoir `DELIVERER_ROLE`

**Transition :** `ASSIGNED` → `IN_DELIVERY`

**Événement émis :** `PickupConfirmed(uint256 orderId, address deliverer)`

---

##### `confirmDelivery()`

Le client confirme la réception de la commande. Déclenche automatiquement :
1. Le split de paiement (70% restaurant, 20% livreur, 10% plateforme)
2. Le mint de tokens DONE pour le client (10% de foodPrice)

```solidity
function confirmDelivery(uint256 _orderId) external
```

**Contrôles :**
- L'appelant doit être le client de la commande
- La commande doit être en état `IN_DELIVERY`

**Actions automatiques :**
1. Transition : `IN_DELIVERY` → `DELIVERED`
2. Appel à `PaymentSplitter.splitPayment()` avec le montant total
3. Mint de tokens DONE : `tokensToMint = foodPrice / 10`

**Événement émis :** `DeliveryConfirmed(uint256 orderId, address client)`

---

##### `openDispute()`

Ouvre un litige pour une commande. Les fonds sont gelés jusqu'à résolution.

```solidity
function openDispute(uint256 _orderId) external
```

**Contrôles :**
- L'appelant doit être le client, le restaurant ou le livreur de la commande
- La commande ne doit pas être déjà `DELIVERED`

**Transition :** `*` → `DISPUTED` (depuis n'importe quel état sauf DELIVERED)

**Événement émis :** `DisputeOpened(uint256 orderId, address opener)`

---

##### `resolveDispute()`

Un arbitre résout un litige en faveur d'une partie.

```solidity
function resolveDispute(
    uint256 _orderId,
    address payable _winner,
    uint256 _refundPercent
) external
```

**Contrôles :**
- L'appelant doit avoir `ARBITRATOR_ROLE`
- La commande doit être en litige (`disputed == true`)
- `_refundPercent` doit être ≤ 100

**Actions :**
- Calcul du remboursement : `refundAmount = totalAmount * refundPercent / 100`
- Transfert au gagnant
- Transition : `DISPUTED` → `DELIVERED`

**Événement émis :** `DisputeResolved(uint256 orderId, address winner, uint256 amount)`

---

#### Fonctions de consultation (view)

##### `getOrder(uint256 _orderId)`

Retourne les détails complets d'une commande.

```solidity
function getOrder(uint256 _orderId) external view returns (Order memory)
```

##### `getClientOrders(address _client)`

Retourne la liste des IDs de commandes d'un client.

```solidity
function getClientOrders(address _client) external view returns (uint256[] memory)
```

##### `getRestaurantOrders(address _restaurant)`

Retourne la liste des IDs de commandes d'un restaurant.

```solidity
function getRestaurantOrders(address _restaurant) external view returns (uint256[] memory)
```

##### `getDelivererOrders(address _deliverer)`

Retourne la liste des IDs de commandes d'un livreur.

```solidity
function getDelivererOrders(address _deliverer) external view returns (uint256[] memory)
```

##### `getTotalOrders()`

Retourne le nombre total de commandes créées.

```solidity
function getTotalOrders() external view returns (uint256)
```

---

#### Fonctions d'administration

##### `pause() / unpause()`

Mise en pause/activation du contrat en cas d'urgence.

```solidity
function pause() external onlyRole(DEFAULT_ADMIN_ROLE)
function unpause() external onlyRole(DEFAULT_ADMIN_ROLE)
```

##### `updatePlatformWallet(address payable newWallet)`

Met à jour l'adresse du wallet plateforme.

```solidity
function updatePlatformWallet(address payable newWallet) external onlyRole(DEFAULT_ADMIN_ROLE)
```

##### Configuration des oracles

```solidity
function setGPSOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE)
function setPriceOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE)
function setWeatherOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE)
```

---

### 2. DonePaymentSplitter.sol

**Contrat de répartition automatique des paiements** entre restaurant, livreur et plateforme.

#### Constantes de répartition

```solidity
uint256 public constant RESTAURANT_PERCENT = 70;  // 70% pour le restaurant
uint256 public constant DELIVERER_PERCENT = 20;   // 20% pour le livreur
uint256 public constant PLATFORM_PERCENT = 10;    // 10% pour la plateforme
```

#### Fonction principale

##### `splitPayment()`

Répartit le paiement reçu selon les pourcentages définis.

```solidity
function splitPayment(
    uint256 _orderId,
    address payable _restaurant,
    address payable _deliverer,
    address payable _platform
) external payable
```

**Paramètres :**
- `_orderId` : ID de la commande
- `_restaurant` : Adresse du restaurant (70%)
- `_deliverer` : Adresse du livreur (20%)
- `_platform` : Adresse de la plateforme (10%)

**Actions :**
- Calcule les montants pour chaque partie
- Ajoute les montants aux balances internes
- Émet l'événement `PaymentSplit`

**Événement émis :**
```solidity
event PaymentSplit(
    uint256 indexed orderId,
    address indexed restaurant,
    address indexed deliverer,
    address platform,
    uint256 restaurantAmount,
    uint256 delivererAmount,
    uint256 platformAmount,
    uint256 timestamp
);
```

---

##### `withdraw()`

Permet à chaque partie de retirer ses fonds accumulés.

```solidity
function withdraw() external nonReentrant
```

**Actions :**
- Vérifie que l'appelant a un solde > 0
- Transfère le solde complet
- Remet le solde à zéro

**Événement émis :** `Withdrawn(address indexed payee, uint256 amount)`

---

##### `getPendingBalance(address payee)`

Consulte le solde en attente d'un bénéficiaire.

```solidity
function getPendingBalance(address payee) external view returns (uint256)
```

---

### 3. DoneToken.sol

**Token ERC20 de fidélité** pour récompenser les clients.

#### Caractéristiques

- **Nom** : "DONE Token"
- **Symbole** : "DONE"
- **Décimales** : 18 (standard ERC20)
- **Type** : ERC20 standard avec mint/burn

#### Rôles

```solidity
MINTER_ROLE  // Peut créer de nouveaux tokens
```

#### Fonctions principales

##### `mint(address to, uint256 amount)`

Crée de nouveaux tokens DONE.

```solidity
function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE)
```

**Utilisation :** Appelé automatiquement par `DoneOrderManager` après livraison.

**Taux de récompense :** `tokensToMint = foodPrice / 10` (10% de la valeur de la commande)

---

##### `burn(uint256 amount)`

Le détenteur brûle ses propres tokens.

```solidity
function burn(uint256 amount) external
```

---

##### `burnFrom(address account, uint256 amount)`

Brûle des tokens d'un compte avec autorisation préalable.

```solidity
function burnFrom(address account, uint256 amount) external
```

**Utilisation :** Pour les promotions ou réductions utilisant les tokens.

---

##### `calculateReward(uint256 foodPrice)`

Calcule le nombre de tokens à distribuer pour un prix donné.

```solidity
function calculateReward(uint256 foodPrice) public pure returns (uint256)
```

**Formule :** `reward = foodPrice / 10`

---

### 4. DoneStaking.sol

**Contrat de staking** pour garantir la fiabilité des livreurs.

#### Constantes

```solidity
uint256 public constant MINIMUM_STAKE = 0.1 ether;  // Minimum requis : 0.1 ETH
```

#### Rôles

```solidity
PLATFORM_ROLE  // Peut slasher les livreurs en cas de faute
```

#### Fonctions principales

##### `stakeAsDeliverer()`

Un livreur effectue un stake pour pouvoir livrer.

```solidity
function stakeAsDeliverer() external payable
```

**Contrôles :**
- `msg.value >= MINIMUM_STAKE` (0.1 ETH minimum)
- Le livreur ne doit pas déjà être staké

**Actions :**
- Enregistre le montant staké
- Marque le livreur comme staké

**Événement émis :** `Staked(address indexed deliverer, uint256 amount)`

---

##### `unstake()`

Un livreur retire son stake (si aucune livraison active).

```solidity
function unstake() external nonReentrant
```

**Contrôles :**
- Le livreur doit être staké

**Actions :**
- Transfère le montant staké au livreur
- Remet les états à zéro

**Événement émis :** `Unstaked(address indexed deliverer, uint256 amount)`

---

##### `slash(address deliverer, uint256 amount)`

La plateforme confisque une partie du stake en cas de faute.

```solidity
function slash(address deliverer, uint256 amount)
    external
    onlyRole(PLATFORM_ROLE)
    nonReentrant
```

**Contrôles :**
- L'appelant doit avoir `PLATFORM_ROLE`
- Le livreur doit être staké
- `amount <= stakedAmount[deliverer]`

**Actions :**
- Réduit le stake du livreur
- Transfère le montant à la plateforme
- Si le stake tombe à 0, le livreur n'est plus considéré comme staké

**Événement émis :** `Slashed(address indexed deliverer, uint256 amount, address indexed platform)`

---

##### Fonctions de consultation

```solidity
function isStaked(address deliverer) external view returns (bool)
function getStakedAmount(address deliverer) external view returns (uint256)
```

---

## 🔮 Oracles (Sprint 6)

Les oracles permettent d'intégrer des données externes (prix, GPS, météo) dans les smart contracts de manière décentralisée et fiable.

### 4. DonePriceOracle.sol

**Oracle de prix** utilisant Chainlink Price Feed pour obtenir le prix MATIC/USD en temps réel.

#### Imports

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

#### Variables

```solidity
AggregatorV3Interface internal priceFeed;  // Chainlink Price Feed
uint8 public constant DECIMALS = 18;
uint256 public constant PRECISION = 1e18;
```

#### Constructeur

```solidity
constructor(address _priceFeedAddress)
```

**Paramètres :**
- `_priceFeedAddress` : Adresse du Chainlink Price Feed (Mumbai ou Mainnet)

#### Fonctions principales

##### `getLatestPrice()`

Récupère le prix MATIC/USD depuis Chainlink.

```solidity
function getLatestPrice() public view returns (int256, uint8, uint256)
```

**Retourne :**
- `price` : Prix MATIC/USD (int256)
- `decimals` : Nombre de décimales (uint8)
- `timestamp` : Timestamp de la donnée (uint256)

**Gas estimé :** ~30,000

---

##### `convertUSDtoMATIC(uint256 usdAmount)`

Convertit un montant USD en MATIC.

```solidity
function convertUSDtoMATIC(uint256 usdAmount) public returns (uint256)
```

**Formule :** `maticAmount = (usdAmount * 10^decimals) / price`

**Gas estimé :** ~35,000

---

##### `convertMATICtoUSD(uint256 maticAmount)`

Convertit un montant MATIC en USD.

```solidity
function convertMATICtoUSD(uint256 maticAmount) public returns (uint256)
```

**Formule :** `usdAmount = (maticAmount * price) / 10^decimals`

**Gas estimé :** ~35,000

---

##### `getPriceWithAge()`

Récupère le prix avec l'âge de la donnée.

```solidity
function getPriceWithAge() public view returns (int256, uint256)
```

**Retourne :** `(price, ageInSeconds)`

---

#### Événements

```solidity
event PriceUpdated(int256 price, uint256 timestamp);
event ConversionRequested(uint256 usdAmount, uint256 maticAmount);
```

---

### 5. DoneGPSOracle.sol

**Oracle GPS** pour vérification de livraison on-chain avec preuve cryptographique.

#### Imports

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

#### Rôles

```solidity
bytes32 public constant DELIVERER_ROLE = keccak256("DELIVERER_ROLE");
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
```

#### Structures

```solidity
struct GPSLocation {
    int256 latitude;
    int256 longitude;
    uint256 timestamp;
    address deliverer;
    bool verified;
}

struct DeliveryRoute {
    uint256 orderId;
    GPSLocation[] locations;
    uint256 totalDistance;
    uint256 startTime;
    uint256 endTime;
}
```

#### Constantes

```solidity
uint256 public constant DELIVERY_RADIUS = 100;  // 100 mètres
uint256 public constant EARTH_RADIUS = 6371000; // Rayon de la Terre en mètres
```

#### Fonctions principales

##### `updateLocation(uint256 orderId, int256 lat, int256 lng)`

Met à jour la position GPS du livreur.

```solidity
function updateLocation(
    uint256 orderId,
    int256 lat,
    int256 lng
) external onlyRole(DELIVERER_ROLE) nonReentrant
```

**Contrôles :**
- L'appelant doit avoir `DELIVERER_ROLE`
- La commande doit exister
- Les coordonnées doivent être valides (lat: -90 à 90, lng: -180 à 180)

**Actions :**
- Crée une nouvelle `GPSLocation`
- Met à jour `currentLocations[orderId]`
- Ajoute la position à `deliveryRoutes[orderId].locations`
- Calcule la distance totale

**Gas estimé :** ~80,000

**Événement :** `LocationUpdated(uint256 indexed orderId, int256 lat, int256 lng, uint256 timestamp)`

---

##### `verifyDelivery(uint256 orderId, int256 clientLat, int256 clientLng)`

Vérifie que la livraison a été effectuée (distance ≤ DELIVERY_RADIUS).

```solidity
function verifyDelivery(
    uint256 orderId,
    int256 clientLat,
    int256 clientLng
) external onlyRole(ORACLE_ROLE) returns (bool)
```

**Retourne :** `true` si la distance entre livreur et client ≤ 100 mètres

**Gas estimé :** ~50,000

**Événement :** `DeliveryVerified(uint256 indexed orderId, bool verified, uint256 distance)`

---

##### `calculateDistance(int256 lat1, int256 lng1, int256 lat2, int256 lng2)`

Calcule la distance entre deux points GPS (formule Haversine).

```solidity
function calculateDistance(
    int256 lat1,
    int256 lng1,
    int256 lat2,
    int256 lng2
) public pure returns (uint256)
```

**Retourne :** Distance en mètres (uint256)

**Gas estimé :** ~30,000

---

##### `getDeliveryRoute(uint256 orderId)`

Récupère l'historique complet du trajet de livraison.

```solidity
function getDeliveryRoute(uint256 orderId) external view returns (DeliveryRoute memory)
```

---

##### `setDeliveryRadius(uint256 newRadius)`

Modifie le rayon de livraison (onlyOwner).

```solidity
function setDeliveryRadius(uint256 newRadius) external onlyOwner
```

---

#### Événements

```solidity
event LocationUpdated(uint256 indexed orderId, int256 lat, int256 lng, uint256 timestamp);
event DeliveryVerified(uint256 indexed orderId, bool verified, uint256 distance);
event RouteCompleted(uint256 indexed orderId, uint256 totalDistance);
```

---

### 6. DoneWeatherOracle.sol

**Oracle météo** pour adapter les conditions de livraison et ajuster les frais.

#### Enum

```solidity
enum WeatherCondition {
    SUNNY,    // 0 - Ensoleillé
    CLOUDY,   // 1 - Nuageux
    RAINY,    // 2 - Pluvieux
    SNOWY,    // 3 - Neigeux
    STORM     // 4 - Tempête
}
```

#### Structure

```solidity
struct WeatherData {
    WeatherCondition condition;
    int256 temperature;
    uint256 timestamp;
    bool isExtreme;
}
```

#### Constantes

```solidity
uint256 public constant UPDATE_INTERVAL = 1 hours;
```

#### Multiplicateurs de frais

Par défaut dans le constructeur :
- `SUNNY` : 100% (1.0x)
- `CLOUDY` : 100% (1.0x)
- `RAINY` : 120% (1.2x)
- `SNOWY` : 150% (1.5x)
- `STORM` : 200% (2.0x)

#### Fonctions principales

##### `updateWeather(int256 lat, int256 lng, WeatherCondition condition, int256 temperature)`

Met à jour les données météo pour une localisation.

```solidity
function updateWeather(
    int256 lat,
    int256 lng,
    WeatherCondition condition,
    int256 temperature
) external onlyOwner
```

**Contrôles :**
- `UPDATE_INTERVAL` doit être respecté (1 heure minimum)
- Les coordonnées doivent être valides

**Actions :**
- Détermine si les conditions sont extrêmes (STORM, SNOWY, ou températures extrêmes)
- Stocke les données dans `weatherByLocation`

**Gas estimé :** ~50,000

**Événement :** `WeatherUpdated(bytes32 indexed locationHash, WeatherCondition condition, int256 temperature, bool isExtreme)`

---

##### `getWeather(int256 lat, int256 lng)`

Récupère les données météo pour une localisation.

```solidity
function getWeather(int256 lat, int256 lng) external view returns (
    WeatherCondition,
    int256,
    uint256,
    bool
)
```

**Retourne :** `(condition, temperature, timestamp, isExtreme)`

**Vérifie :** Que les données sont fraîches (< 6 heures)

**Gas estimé :** ~10,000

---

##### `adjustDeliveryFee(uint256 baseFee, WeatherCondition condition)`

Ajuste les frais de livraison selon les conditions météo.

```solidity
function adjustDeliveryFee(
    uint256 baseFee,
    WeatherCondition condition
) external view returns (uint256)
```

**Retourne :** `baseFee * multiplier / 10000`

**Gas estimé :** ~5,000

**Événement :** `DeliveryFeeAdjusted(uint256 baseFee, uint256 adjustedFee, WeatherCondition condition)`

---

##### `canDeliver(int256 lat, int256 lng)`

Vérifie si la livraison est possible selon les conditions météo.

```solidity
function canDeliver(int256 lat, int256 lng) external view returns (bool)
```

**Retourne :** `false` si conditions extrêmes (STORM) ou données manquantes

---

##### `setFeeMultiplier(WeatherCondition condition, uint256 multiplier)`

Modifie le multiplicateur de frais pour une condition (onlyOwner).

```solidity
function setFeeMultiplier(
    WeatherCondition condition,
    uint256 multiplier
) external onlyOwner
```

**Format :** `multiplier` en basis points (10000 = 100%, 12000 = 120%)

---

#### Événements

```solidity
event WeatherUpdated(bytes32 indexed locationHash, WeatherCondition condition, int256 temperature, bool isExtreme);
event DeliveryFeeAdjusted(uint256 baseFee, uint256 adjustedFee, WeatherCondition condition);
event ExtremeWeatherAlert(bytes32 indexed locationHash, WeatherCondition condition);
```

---

### 7. DoneArbitration.sol

**Système d'arbitrage décentralisé** par vote communautaire tokenisé (Sprint 6).

#### Imports

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../DoneToken.sol";
import "../DoneOrderManager.sol";
```

#### Enums

```solidity
enum Winner {
    NONE,        // 0 - Pas encore décidé
    CLIENT,      // 1 - Client gagne (remboursement)
    RESTAURANT,  // 2 - Restaurant gagne (paiement normal)
    DELIVERER    // 3 - Livreur gagne (si slashing contesté)
}

enum DisputeStatus {
    OPEN,        // 0 - Litige ouvert, en attente de votes
    VOTING,      // 1 - Phase de vote active
    RESOLVED     // 2 - Litige résolu
}
```

#### Rôles

```solidity
bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
```

#### Structure

```solidity
struct Dispute {
    uint256 orderId;
    address client;
    address restaurant;
    address deliverer;
    string reason;
    string evidenceIPFS;
    uint256 totalVotePower;
    Winner leadingWinner;
    DisputeStatus status;
    uint256 createdAt;
    uint256 resolvedAt;
}
```

#### Paramètres configurables

```solidity
uint256 public constant MIN_VOTING_POWER_REQUIRED = 1000 * 1e18; // 1000 DONE tokens
uint256 public constant VOTING_PERIOD = 48 hours;
```

#### Fonctions principales

##### `createDispute(uint256 orderId, string reason, string evidenceIPFS)`

Crée un nouveau litige pour une commande.

```solidity
function createDispute(
    uint256 orderId,
    string memory reason,
    string memory evidenceIPFS
) external nonReentrant returns (uint256)
```

**Contrôles :**
- La commande doit exister
- L'appelant doit être une partie prenante (client, restaurant ou livreur)
- La commande ne doit pas être déjà en litige

**Actions :**
- Crée un nouveau `Dispute`
- Incrémente `disputeCount`
- Met à jour le statut de la commande à `DISPUTED`
- Initialise la période de vote (48 heures)

**Retourne :** `disputeId` (uint256)

**Gas estimé :** ~150,000

**Événement :** `DisputeCreated(uint256 indexed disputeId, uint256 indexed orderId, address opener)`

---

##### `voteDispute(uint256 disputeId, Winner winner)`

Vote sur un litige avec pouvoir de vote basé sur les tokens DONE.

```solidity
function voteDispute(
    uint256 disputeId,
    Winner winner
) external nonReentrant
```

**Contrôles :**
- Le litige doit être en statut `VOTING`
- L'appelant ne doit pas avoir déjà voté
- `winner` doit être valide (CLIENT, RESTAURANT, ou DELIVERER)

**Actions :**
- Calcule le pouvoir de vote depuis la balance de tokens DONE
- Enregistre le vote
- Met à jour `leadingWinner` si nécessaire
- Incrémente `totalVotePower`

**Gas estimé :** ~80,000

**Événement :** `VoteCast(uint256 indexed disputeId, address indexed voter, Winner winner, uint256 votingPower)`

---

##### `resolveDispute(uint256 disputeId)`

Résout un litige après la période de vote (onlyRole(ARBITER_ROLE)).

```solidity
function resolveDispute(uint256 disputeId) external onlyRole(ARBITER_ROLE) nonReentrant
```

**Contrôles :**
- Le litige doit être en statut `VOTING`
- Le pouvoir de vote minimum doit être atteint (1000 DONE)
- Un gagnant clair doit être déterminé

**Actions :**
- Marque le litige comme résolu
- Transfère les fonds selon le gagnant :
  - **CLIENT** : Remboursement complet
  - **RESTAURANT** : Paiement normal
  - **DELIVERER** : Annulation slashing + paiement

**Gas estimé :** ~200,000

**Événement :** `DisputeResolved(uint256 indexed disputeId, Winner winner, uint256 amount)`

---

##### `getDispute(uint256 disputeId)`

Récupère les détails d'un litige.

```solidity
function getDispute(uint256 disputeId) external view returns (Dispute memory)
```

---

##### `getVoteDistribution(uint256 disputeId)`

Récupère la distribution des votes.

```solidity
function getVoteDistribution(uint256 disputeId) external view returns (
    uint256 clientVotes,
    uint256 restaurantVotes,
    uint256 delivererVotes
)
```

---

##### `getUserVotingPower(address user)`

Calcule le pouvoir de vote d'un utilisateur.

```solidity
function getUserVotingPower(address user) external view returns (uint256)
```

**Retourne :** Balance de tokens DONE de l'utilisateur (1 token = 1 vote)

---

#### Événements

```solidity
event DisputeCreated(uint256 indexed disputeId, uint256 indexed orderId, address opener);
event VoteCast(uint256 indexed disputeId, address indexed voter, Winner winner, uint256 votingPower);
event DisputeResolved(uint256 indexed disputeId, Winner winner, uint256 amount);
```

---

#### Workflow d'arbitrage

```
1. Création litige → OPEN
   ↓
2. Période de vote (48h) → VOTING
   ↓
3. Vote communautaire (token-weighted)
   ↓
4. Résolution par arbitre → RESOLVED
   ↓
5. Transfert fonds selon gagnant
```

---

## 🔌 Interfaces et bibliothèques

### IOrderManager.sol

Interface standardisée pour interagir avec `DoneOrderManager`.

**Définit :**
- Les structures `Order` et `OrderStatus`
- Les signatures de toutes les fonctions publiques
- Les événements émis

**Utilisation :** Pour les intégrations tierces et les tests.

---

### IPaymentSplitter.sol

Interface pour `DonePaymentSplitter`.

**Définit :**
- La fonction `splitPayment()`
- L'événement `PaymentSplit`

---

### OrderLib.sol

**Bibliothèque utilitaire** pour la gestion des commandes (optimisation gas).

#### Fonctions

##### `validateOrderAmount(uint256 foodPrice, uint256 deliveryFee)`

Valide que les montants sont corrects et non-nuls.

```solidity
function validateOrderAmount(
    uint256 foodPrice,
    uint256 deliveryFee
) internal pure
```

---

##### `calculateTotalAmount(uint256 foodPrice, uint256 deliveryFee, uint256 platformFeePercent)`

Calcule le montant total incluant la commission plateforme.

```solidity
function calculateTotalAmount(
    uint256 foodPrice,
    uint256 deliveryFee,
    uint256 platformFeePercent
) internal pure returns (uint256)
```

**Formule :** `total = foodPrice + deliveryFee + (foodPrice * platformFeePercent / 100)`

---

##### `validateStateTransition(OrderStatus currentStatus, OrderStatus newStatus)`

Vérifie qu'une transition d'état est valide selon le workflow.

```solidity
function validateStateTransition(
    OrderStatus currentStatus,
    OrderStatus newStatus
) internal pure
```

**Transitions valides :**
- `CREATED` → `PREPARING` ou `DISPUTED`
- `PREPARING` → `IN_DELIVERY` ou `DISPUTED`
- `IN_DELIVERY` → `DELIVERED` ou `DISPUTED`
- `ASSIGNED` → `IN_DELIVERY` (via `confirmPickup()`)
- `DISPUTED` → `DELIVERED` (via `resolveDispute()`)

---

##### `calculatePlatformFee(uint256 foodPrice, uint256 feePercent)`

Calcule la commission plateforme.

```solidity
function calculatePlatformFee(
    uint256 foodPrice,
    uint256 feePercent
) internal pure returns (uint256)
```

---

##### `isValidIPFSHash(string memory ipfsHash)`

Vérifie qu'un hash IPFS est valide (format CID).

```solidity
function isValidIPFSHash(string memory ipfsHash) internal pure returns (bool)
```

---

## 📢 Événements

### DoneOrderManager

| Événement | Paramètres | Description |
|-----------|------------|-------------|
| `OrderCreated` | `orderId`, `client`, `restaurant`, `totalAmount` | Commande créée |
| `PreparationConfirmed` | `orderId`, `restaurant` | Préparation confirmée |
| `DelivererAssigned` | `orderId`, `deliverer` | Livreur assigné |
| `PickupConfirmed` | `orderId`, `deliverer` | Récupération confirmée |
| `DeliveryConfirmed` | `orderId`, `client` | Livraison confirmée |
| `DisputeOpened` | `orderId`, `opener` | Litige ouvert |
| `DisputeResolved` | `orderId`, `winner`, `amount` | Litige résolu |

### DonePaymentSplitter

| Événement | Paramètres | Description |
|-----------|------------|-------------|
| `PaymentSplit` | `orderId`, `restaurant`, `deliverer`, `platform`, `restaurantAmount`, `delivererAmount`, `platformAmount`, `timestamp` | Paiement réparti |
| `Withdrawn` | `payee`, `amount` | Retrait effectué |

### DoneStaking

| Événement | Paramètres | Description |
|-----------|------------|-------------|
| `Staked` | `deliverer`, `amount` | Stake effectué |
| `Unstaked` | `deliverer`, `amount` | Stake retiré |
| `Slashed` | `deliverer`, `amount`, `platform` | Stake confisqué |

### DoneToken

Événements standards ERC20 :
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `Approval(address indexed owner, address indexed spender, uint256 value)`

---

## 🔒 Sécurité

### Mesures de sécurité implémentées

#### 1. ReentrancyGuard

Tous les contrats utilisent `ReentrancyGuard` d'OpenZeppelin pour protéger contre les attaques de réentrance.

**Contrats protégés :**
- `DoneOrderManager` : `createOrder()`, `confirmDelivery()`, `resolveDispute()`
- `DonePaymentSplitter` : `splitPayment()`, `withdraw()`
- `DoneStaking` : `stakeAsDeliverer()`, `unstake()`, `slash()`

---

#### 2. AccessControl

Gestion fine des permissions avec OpenZeppelin `AccessControl`.

**Rôles définis :**
- `DEFAULT_ADMIN_ROLE` : Administration complète
- `RESTAURANT_ROLE` : Confirmation de préparation
- `DELIVERER_ROLE` : Confirmation de récupération/livraison
- `PLATFORM_ROLE` : Assignation de livreurs, slashing
- `ARBITRATOR_ROLE` : Résolution de litiges
- `MINTER_ROLE` : Création de tokens DONE

---

#### 3. Pausable

Le contrat `DoneOrderManager` peut être mis en pause en cas d'urgence.

**Fonctions :**
- `pause()` : Met en pause (admin uniquement)
- `unpause()` : Reprend le fonctionnement (admin uniquement)

**Protection :** Toutes les fonctions critiques utilisent le modifier `whenNotPaused`.

---

#### 4. Validations

**Validations de montants :**
- Vérification que `msg.value` correspond au montant attendu
- Protection contre les overflows avec SafeMath (intégré Solidity 0.8+)
- Validation des adresses (non-nulles)

**Validations d'état :**
- Vérification des transitions d'état valides
- Protection contre les actions sur des commandes déjà terminées

---

#### 5. Escrow Pattern

Les fonds sont détenus en escrow dans le contrat jusqu'à livraison confirmée.

**Avantages :**
- Protection du client (paiement sécurisé)
- Protection du restaurant/livreur (fonds garantis)
- Résolution de litiges possible

---

## 🔄 Interactions entre contrats

### Flux de paiement

```
1. Client → createOrder() → DoneOrderManager
   └─> Fonds en escrow dans DoneOrderManager

2. Client → confirmDelivery() → DoneOrderManager
   └─> Appel interne → PaymentSplitter.splitPayment()
       ├─> 70% → Restaurant (balance)
       ├─> 20% → Livreur (balance)
       └─> 10% → Plateforme (balance)

3. Restaurant/Livreur/Plateforme → withdraw() → PaymentSplitter
   └─> Transfert des fonds
```

### Flux de récompenses

```
1. Client → confirmDelivery() → DoneOrderManager
   └─> Calcul : tokensToMint = foodPrice / 10
   └─> Appel interne → DoneToken.mint(client, tokensToMint)
```

### Flux de staking

```
1. Livreur → stakeAsDeliverer() → DoneStaking
   └─> Stake enregistré

2. Plateforme → assignDeliverer() → DoneOrderManager
   └─> Vérification : DoneStaking.isStaked(deliverer)

3. (En cas de faute) Plateforme → slash() → DoneStaking
   └─> Confiscation d'une partie du stake
```

---

## 💻 Exemples d'utilisation

### Exemple 1 : Créer une commande

```solidity
// Client crée une commande
uint256 foodPrice = 0.1 ether;      // 0.1 ETH de nourriture
uint256 deliveryFee = 0.001 ether;  // 0.001 ETH de livraison
uint256 platformFee = 0.01 ether;  // 10% = 0.01 ETH
uint256 totalAmount = 0.111 ether;  // Total à payer

uint256 orderId = orderManager.createOrder{value: totalAmount}(
    restaurantAddress,
    foodPrice,
    deliveryFee,
    "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // IPFS hash
);
```

### Exemple 2 : Workflow complet

```solidity
// 1. Restaurant confirme la préparation
orderManager.confirmPreparation(orderId);

// 2. Plateforme assigne un livreur
orderManager.assignDeliverer(orderId, delivererAddress);

// 3. Livreur confirme la récupération
orderManager.confirmPickup(orderId);

// 4. Client confirme la livraison
orderManager.confirmDelivery(orderId);
// → Déclenche automatiquement :
//    - Split de paiement (70/20/10)
//    - Mint de tokens DONE (10% de foodPrice)
```

### Exemple 3 : Ouvrir un litige

```solidity
// Client ouvre un litige
orderManager.openDispute(orderId);
// → Les fonds sont gelés jusqu'à résolution
```

### Exemple 4 : Résoudre un litige

```solidity
// Arbitre résout en faveur du client (100% remboursement)
orderManager.resolveDispute(
    orderId,
    clientAddress,
    100  // 100% de remboursement
);
```

### Exemple 5 : Staking d'un livreur

```solidity
// Livreur effectue un stake
stakingContract.stakeAsDeliverer{value: 0.1 ether}();
// → Minimum requis : 0.1 ETH
```

### Exemple 6 : Retirer les fonds du PaymentSplitter

```solidity
// Restaurant retire ses fonds accumulés
paymentSplitter.withdraw();
// → Transfère tous les fonds en attente
```

---

## 🚀 Déploiement

### Ordre de déploiement

1. **DoneToken** (aucune dépendance)
2. **DonePaymentSplitter** (aucune dépendance)
3. **DoneStaking** (aucune dépendance)
4. **DoneOrderManager** (dépend de tous les autres)

### Configuration post-déploiement

1. **Attribuer les rôles** :
   ```solidity
   orderManager.grantRole(RESTAURANT_ROLE, restaurantAddress);
   orderManager.grantRole(DELIVERER_ROLE, delivererAddress);
   orderManager.grantRole(ARBITRATOR_ROLE, arbitratorAddress);
   ```

2. **Configurer les autorisations** :
   ```solidity
   tokenContract.grantRole(MINTER_ROLE, orderManagerAddress);
   ```

3. **Configurer les oracles** (Sprint 6) :
   ```solidity
   // Configurer Chainlink Price Feed dans DonePriceOracle
   priceOracle = new DonePriceOracle(chainlinkPriceFeedAddress);
   
   // Configurer les oracles dans DoneOrderManager
   orderManager.setGPSOracle(gpsOracleAddress);
   orderManager.setPriceOracle(priceOracleAddress);
   orderManager.setWeatherOracle(weatherOracleAddress);
   orderManager.setArbitrationContract(arbitrationAddress);
   ```

4. **Configurer les rôles pour les oracles** :
   ```solidity
   gpsOracle.grantRole(DELIVERER_ROLE, delivererAddress);
   gpsOracle.grantRole(ORACLE_ROLE, backendServiceAddress);
   arbitration.grantRole(ARBITER_ROLE, arbitratorAddress);
   ```

### Variables d'environnement

```bash
PRIVATE_KEY=0x...                    # Clé privée du déployeur
POLYGON_RPC_URL=https://...          # URL RPC Polygon
ORDER_MANAGER_ADDRESS=0x...          # Adresse déployée
PAYMENT_SPLITTER_ADDRESS=0x...       # Adresse déployée
TOKEN_ADDRESS=0x...                  # Adresse déployée
STAKING_ADDRESS=0x...                # Adresse déployée

# Oracles (Sprint 6)
PRICE_ORACLE_ADDRESS=0x...          # Adresse DonePriceOracle
GPS_ORACLE_ADDRESS=0x...            # Adresse DoneGPSOracle
WEATHER_ORACLE_ADDRESS=0x...        # Adresse DoneWeatherOracle
ARBITRATION_ADDRESS=0x...           # Adresse DoneArbitration
CHAINLINK_PRICE_FEED_ADDRESS=0x...   # Adresse Chainlink Price Feed (Mumbai/Mainnet)
```

---

## 📊 Statistiques et limites

### Limites de gas

#### Contrats principaux

| Fonction | Gas estimé |
|----------|-----------|
| `createOrder()` | ~150,000 |
| `confirmPreparation()` | ~50,000 |
| `assignDeliverer()` | ~60,000 |
| `confirmPickup()` | ~50,000 |
| `confirmDelivery()` | ~200,000 |
| `openDispute()` | ~50,000 |
| `resolveDispute()` | ~100,000 |

#### Oracles (Sprint 6)

| Fonction | Gas estimé |
|----------|-----------|
| `DonePriceOracle.getLatestPrice()` | ~30,000 |
| `DonePriceOracle.convertUSDtoMATIC()` | ~35,000 |
| `DonePriceOracle.convertMATICtoUSD()` | ~35,000 |
| `DoneGPSOracle.updateLocation()` | ~80,000 |
| `DoneGPSOracle.verifyDelivery()` | ~50,000 |
| `DoneGPSOracle.calculateDistance()` | ~30,000 |
| `DoneWeatherOracle.updateWeather()` | ~50,000 |
| `DoneWeatherOracle.getWeather()` | ~10,000 |
| `DoneWeatherOracle.adjustDeliveryFee()` | ~5,000 |
| `DoneArbitration.createDispute()` | ~150,000 |
| `DoneArbitration.voteDispute()` | ~80,000 |
| `DoneArbitration.resolveDispute()` | ~200,000 |

### Limites de montants

- **Staking minimum** : 0.1 ETH
- **Commission plateforme** : 10% (fixe)
- **Répartition paiement** : 70% / 20% / 10% (fixe)
- **Taux de récompense tokens** : 10% de foodPrice (1 DONE / 10 ETH)

---

## 🔍 Vérification sur Polygonscan

Pour vérifier les contrats sur Polygonscan :

1. Allez sur [polygonscan.com](https://polygonscan.com)
2. Entrez l'adresse du contrat
3. Cliquez sur "Contract" → "Verify and Publish"
4. Uploadez le code source et les paramètres de compilation

---

## 📝 Notes importantes

- ⚠️ **Tous les montants sont en wei** (1 ETH = 10^18 wei)
- ⚠️ **Les adresses doivent être valides** (non-nulles)
- ⚠️ **Les transitions d'état sont strictes** (workflow défini)
- ⚠️ **Les rôles doivent être configurés** avant utilisation
- ⚠️ **Les oracles (Sprint 6) sont implémentés** et recommandés pour la production
- ⚠️ **Chainlink Price Feed** doit être configuré (Mumbai ou Mainnet)
- ⚠️ **Arbitrage décentralisé** utilise le pouvoir de vote basé sur les tokens DONE
- ⚠️ **GPS Oracle** utilise un stockage hybride (off-chain fréquent, on-chain critique)

---

## 🆘 Support technique

Pour toute question technique sur les smart contracts :

- **Documentation** : Voir ce fichier
- **Code source** : `contracts/contracts/`
- **Tests** : `contracts/test/`
- **Support** : support@donefood.io

---

**Dernière mise à jour** : 2024

