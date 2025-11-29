# Dossier test/

Ce dossier contient tous les tests unitaires pour les smart contracts. Les tests sont écrits en JavaScript/TypeScript et utilisent Hardhat avec Chai et Mocha.

## Structure

```
test/
├── DoneOrderManager.test.js
├── DonePaymentSplitter.test.js
├── DoneToken.test.js
└── DoneStaking.test.js
```

## Fichiers de Tests

### DoneOrderManager.test.js

**Rôle** : Tester tout le workflow des commandes et la gestion des états. C'est le test le plus critique car il prouve que le coeur métier fonctionne.

**Structure du fichier** :

```javascript
// 1. Imports et configuration
const { expect } = require("chai");
const { ethers } = require("hardhat");

// 2. describe() principal
describe("DoneOrderManager", function() {

  // 3. Variables globales et setup
  let orderManager, paymentSplitter, token, staking;
  let deployer, client, restaurant, deliverer, platform, arbitrator;

  beforeEach(async function() {
    // Déployer tous les contrats
    // Configurer les rôles
    // Préparer les comptes de test
  });

  // 4. Tests T1 : Création commande avec paiement

  // 5. Tests T2 : Workflow complet

  // 6. Tests T4 : Dispute et gel des fonds
});
```

**Tests couverts** :

**T1 : Création de commande avec paiement correct**

Pseudo-code :
```javascript
describe("T1: Création de commande", function() {

  it("Doit créer une commande avec msg.value correct", async function() {
    // Calculer foodPrice, deliveryFee, platformFee (10%), totalAmount
    // Appeler createOrder avec msg.value = totalAmount
    // Vérifier que orderId est retourné
    // Vérifier que order.status = CREATED
    // Vérifier que order.client = client.address
    // Vérifier que order.restaurant = restaurant.address
    // Vérifier que order.foodPrice, deliveryFee, platformFee corrects
    // Vérifier que les fonds sont bloqués dans le contrat (balance increased)
    // Vérifier que l'event OrderCreated est émis avec bons paramètres
  });

  it("Doit revert si msg.value incorrect (trop bas)", async function() {
    // Calculer totalAmount
    // Appeler createOrder avec msg.value < totalAmount
    // expect(tx).to.be.revertedWith("Incorrect payment amount")
  });

  it("Doit revert si msg.value incorrect (trop haut)", async function() {
    // Calculer totalAmount
    // Appeler createOrder avec msg.value > totalAmount
    // expect(tx).to.be.revertedWith("Incorrect payment amount")
  });

  it("Doit revert si restaurant n'a pas le rôle RESTAURANT_ROLE", async function() {
    // Appeler createOrder avec une adresse sans rôle restaurant
    // expect(tx).to.be.revertedWith("Address is not a restaurant")
  });

  it("Doit revert si foodPrice = 0", async function() {
    // Appeler createOrder avec foodPrice = 0
    // expect(tx).to.be.revertedWith("Food price must be > 0")
  });

  it("Doit revert si ipfsHash vide", async function() {
    // Appeler createOrder avec ipfsHash = ""
    // expect(tx).to.be.revertedWith("IPFS hash required")
  });
});
```

**T2 : Workflow complet (CREATED → DELIVERED)**

Pseudo-code :
```javascript
describe("T2: Workflow complet", function() {

  it("Doit exécuter le workflow complet de bout en bout", async function() {

    // ÉTAPE 1: createOrder
    // Appeler createOrder par le client
    // Vérifier status = CREATED
    // Vérifier event OrderCreated émis
    // Capturer orderId

    // ÉTAPE 2: confirmPreparation
    // Appeler confirmPreparation par le restaurant
    // Vérifier status = PREPARING
    // Vérifier event PreparationConfirmed émis

    // ÉTAPE 3: Staking du livreur (prérequis)
    // Appeler stakeAsDeliverer avec 0.1 ETH
    // Vérifier isStaked(deliverer) = true

    // ÉTAPE 4: assignDeliverer
    // Appeler assignDeliverer avec deliverer.address
    // Vérifier order.deliverer = deliverer.address
    // Vérifier status = IN_DELIVERY
    // Vérifier event DelivererAssigned émis

    // ÉTAPE 5: confirmPickup
    // Appeler confirmPickup par le livreur
    // Vérifier event PickupConfirmed émis
    // Vérifier status reste IN_DELIVERY

    // ÉTAPE 6: confirmDelivery
    // Capturer balances avant (restaurant, deliverer, platform)
    // Appeler confirmDelivery par le client
    // Vérifier status = DELIVERED
    // Vérifier order.delivered = true
    // Vérifier event DeliveryConfirmed émis

    // ÉTAPE 7: Vérifier split automatique des paiements
    // Vérifier balance restaurant augmenté de 70%
    // Vérifier balance deliverer augmenté de 20%
    // Vérifier balance platform augmenté de 10%

    // ÉTAPE 8: Vérifier tokens DONE mintés pour le client
    // Vérifier balanceOf(client) = (foodPrice / 10 ether) * 1 ether
  });

  it("Doit revert si confirmPreparation appelé par non-restaurant", async function() {
    // createOrder
    // Appeler confirmPreparation par une adresse tierce
    // expect(tx).to.be.revertedWith("Only restaurant can confirm")
  });

  it("Doit revert si assignDeliverer avec livreur non-staké", async function() {
    // createOrder
    // confirmPreparation
    // Appeler assignDeliverer avec deliverer non-staké
    // expect(tx).to.be.revertedWith("Deliverer not staked")
  });

  it("Doit revert si confirmDelivery appelé par non-client", async function() {
    // Workflow jusqu'à IN_DELIVERY
    // Appeler confirmDelivery par une adresse tierce
    // expect(tx).to.be.revertedWith("Only client can confirm delivery")
  });
});
```

**T4 : Dispute et gel des fonds**

Pseudo-code :
```javascript
describe("T4: Dispute et gel des fonds", function() {

  it("Doit geler les fonds quand un litige est ouvert", async function() {
    // Workflow jusqu'à IN_DELIVERY

    // Appeler openDispute par le client
    // Vérifier order.status = DISPUTED
    // Vérifier order.disputed = true
    // Vérifier event DisputeOpened émis

    // Tenter confirmDelivery → doit revert
    // expect(tx).to.be.revertedWith("Order is disputed")

    // Vérifier que les fonds restent bloqués dans le contrat
    // Vérifier balance contrat = totalAmount
  });

  it("Doit revert si openDispute appelé après livraison", async function() {
    // Workflow complet jusqu'à DELIVERED
    // Appeler openDispute
    // expect(tx).to.be.revertedWith("Cannot dispute delivered order")
  });

  it("Doit résoudre le litige en faveur du client", async function() {
    // Workflow jusqu'à IN_DELIVERY
    // Appeler openDispute par le client

    // Capturer balance client avant
    // Appeler resolveDispute par l'arbitrator avec winner = client, refundPercent = 100
    // Vérifier order.disputed = false
    // Vérifier event DisputeResolved émis
    // Vérifier balance client augmenté de 100% du totalAmount
  });

  it("Doit résoudre le litige en faveur du restaurant (50%)", async function() {
    // Workflow jusqu'à IN_DELIVERY
    // Appeler openDispute

    // Appeler resolveDispute avec winner = restaurant, refundPercent = 50
    // Vérifier balance restaurant augmenté de 50% du totalAmount
  });

  it("Doit revert si resolveDispute appelé par non-arbitrator", async function() {
    // Workflow jusqu'à DISPUTED
    // Appeler resolveDispute par une adresse sans ARBITRATOR_ROLE
    // expect(tx).to.be.revertedWith("Only arbitrator can resolve")
  });

  it("Doit revert si resolveDispute avec refundPercent > 100", async function() {
    // Workflow jusqu'à DISPUTED
    // Appeler resolveDispute avec refundPercent = 150
    // expect(tx).to.be.revertedWith("Invalid refund percent")
  });
});
```

**Points critiques testés** :
- Gestion des rôles et permissions (AccessControl)
- Transitions d'états valides (CREATED → PREPARING → IN_DELIVERY → DELIVERED)
- Blocage et libération des fonds (escrow pattern)
- Émission des événements à chaque étape
- Split automatique des paiements (70/20/10)
- Mint automatique des tokens DONE
- Gel des fonds lors d'un litige

---

### DonePaymentSplitter.test.js

**Rôle** : Vérifier que la répartition des paiements est correcte (70% restaurant, 20% livreur, 10% plateforme).

**Structure du fichier** :

```javascript
describe("DonePaymentSplitter", function() {

  let paymentSplitter;
  let restaurant, deliverer, platform;

  beforeEach(async function() {
    // Déployer DonePaymentSplitter
    // Préparer les comptes de test
  });

  // Tests T3 : Split paiement automatique

  // Tests d'erreur
});
```

**Tests couverts** :

**T3 : Split de paiement automatique**

Pseudo-code :
```javascript
describe("T3: Split de paiement automatique", function() {

  it("Doit répartir 70% restaurant, 20% livreur, 10% plateforme", async function() {
    // Définir totalAmount = 100 ether

    // Capturer balances avant
    const balanceRestaurantBefore = await restaurant.getBalance()
    const balanceDelivererBefore = await deliverer.getBalance()
    const balancePlatformBefore = await platform.getBalance()

    // Appeler splitPayment avec msg.value = totalAmount
    // splitPayment(orderId, restaurant.address, deliverer.address, platform.address, {value: totalAmount})

    // Capturer balances après
    const balanceRestaurantAfter = await restaurant.getBalance()
    const balanceDelivererAfter = await deliverer.getBalance()
    const balancePlatformAfter = await platform.getBalance()

    // Vérifier restaurant reçoit 70 ether
    expect(balanceRestaurantAfter - balanceRestaurantBefore).to.equal(70 ether)

    // Vérifier deliverer reçoit 20 ether
    expect(balanceDelivererAfter - balanceDelivererBefore).to.equal(20 ether)

    // Vérifier platform reçoit 10 ether
    expect(balancePlatformAfter - balancePlatformBefore).to.equal(10 ether)

    // Vérifier event PaymentSplit émis avec bons paramètres
  });

  it("Doit gérer correctement les arrondis avec montants impairs", async function() {
    // Définir totalAmount = 99 ether
    // Appeler splitPayment
    // Vérifier que totalAmount distribué = somme des 3 parts
    // Vérifier pas de fonds perdus
  });
});

describe("Tests d'erreur", function() {

  it("Doit revert si msg.value = 0", async function() {
    // Appeler splitPayment avec msg.value = 0
    // expect(tx).to.be.revertedWith("Amount must be > 0")
  });

  it("Doit revert si adresse restaurant est nulle", async function() {
    // Appeler splitPayment avec restaurant = address(0)
    // expect(tx).to.be.revertedWith("Invalid restaurant address")
  });

  it("Doit revert si adresse deliverer est nulle", async function() {
    // Appeler splitPayment avec deliverer = address(0)
    // expect(tx).to.be.revertedWith("Invalid deliverer address")
  });

  it("Doit revert si adresse platform est nulle", async function() {
    // Appeler splitPayment avec platform = address(0)
    // expect(tx).to.be.revertedWith("Invalid platform address")
  });
});
```

**Points critiques testés** :
- Calculs mathématiques corrects (70/20/10)
- Transferts de fonds sécurisés (low-level call)
- Émission de l'événement PaymentSplit avec tous les détails
- Gestion des arrondis
- Protection contre les adresses nulles

---

### DoneToken.test.js

**Rôle** : Tester le token ERC20 de fidélité (mint, burn, récompenses).

**Structure du fichier** :

```javascript
describe("DoneToken", function() {

  let token;
  let owner, client, orderManager;

  beforeEach(async function() {
    // Déployer DoneToken
    // Configurer les rôles (MINTER_ROLE)
  });

  // Tests Standard ERC20

  // Tests Fonctions spécifiques (mint, burn)

  // Tests T6 : Distribution de récompenses
});
```

**Tests couverts** :

**Standard ERC20**

Pseudo-code :
```javascript
describe("Standard ERC20", function() {

  it("Doit avoir le bon name, symbol, decimals", async function() {
    expect(await token.name()).to.equal("DONE Token")
    expect(await token.symbol()).to.equal("DONE")
    expect(await token.decimals()).to.equal(18)
  });

  it("Doit permettre les transferts entre adresses", async function() {
    // Mint 100 tokens au client
    // Transférer 50 tokens du client vers une autre adresse
    // Vérifier balances correctes
  });

  it("Doit gérer les approvals et allowances", async function() {
    // Approve une adresse pour dépenser X tokens
    // Vérifier allowance
    // TransferFrom
  });
});
```

**Fonctions spécifiques (mint, burn)**

Pseudo-code :
```javascript
describe("Fonctions mint et burn", function() {

  it("Doit permettre au MINTER de mint des tokens", async function() {
    // Donner MINTER_ROLE à orderManager
    // Appeler mint(client.address, 100 ether) depuis orderManager
    // Vérifier balanceOf(client) = 100 ether
    // Vérifier totalSupply augmenté de 100 ether
  });

  it("Doit revert si mint appelé par non-MINTER", async function() {
    // Appeler mint depuis une adresse sans MINTER_ROLE
    // expect(tx).to.be.revertedWith("Only minter can mint")
  });

  it("Doit permettre de burn des tokens", async function() {
    // Mint 100 tokens au client
    // Appeler burn(50 ether) depuis le client
    // Vérifier balanceOf(client) = 50 ether
    // Vérifier totalSupply réduit de 50 ether
  });

  it("Doit revert si burn montant > balance", async function() {
    // Mint 50 tokens au client
    // Appeler burn(100 ether)
    // expect(tx).to.be.revertedWith("Insufficient balance")
  });
});
```

**T6 : Distribution de récompenses tokens**

Pseudo-code :
```javascript
describe("T6: Distribution de récompenses", function() {

  it("Doit mint 1 DONE token par 10€ dépensés", async function() {
    // Simuler une commande avec foodPrice = 100€ (converti en wei)
    // Calculer tokensToMint = (foodPrice / 10 ether) * 1 ether
    // Mint tokensToMint au client
    // Vérifier balanceOf(client) = 10 ether (10 tokens)
  });

  it("Doit mint correctement pour 25€ dépensés", async function() {
    // foodPrice = 25€
    // tokensToMint = 2.5 tokens
    // Vérifier balanceOf(client) = 2.5 ether
  });
});
```

**Points critiques testés** :
- Conformité au standard ERC20 (transferts, approvals)
- Contrôle d'accès pour mint (MINTER_ROLE)
- Burn fonctionnel
- Calculs de récompenses corrects (1 token / 10€)
- Mise à jour du totalSupply

---

### DoneStaking.test.js

**Rôle** : Tester le système de staking et slashing des livreurs.

**Structure du fichier** :

```javascript
describe("DoneStaking", function() {

  let staking;
  let owner, deliverer, platform;

  beforeEach(async function() {
    // Déployer DoneStaking
    // Configurer les rôles
  });

  // Tests T5 : Staking et slashing livreur
});
```

**Tests couverts** :

**T5 : Staking et slashing livreur**

Pseudo-code :
```javascript
describe("T5: Staking et slashing", function() {

  it("Doit permettre de stake 0.1 ETH minimum", async function() {
    // Appeler stakeAsDeliverer avec msg.value = 0.1 ether
    // Vérifier isStaked(deliverer) = true
    // Vérifier stakedAmount(deliverer) = 0.1 ether
    // Vérifier balance du contrat augmenté de 0.1 ether
  });

  it("Doit revert si stake < 0.1 ETH", async function() {
    // Appeler stakeAsDeliverer avec msg.value = 0.05 ether
    // expect(tx).to.be.revertedWith("Minimum stake is 0.1 ETH")
  });

  it("Doit permettre de stake plus que le minimum", async function() {
    // Appeler stakeAsDeliverer avec msg.value = 0.5 ether
    // Vérifier isStaked(deliverer) = true
    // Vérifier stakedAmount(deliverer) = 0.5 ether
  });

  it("Doit permettre d'unstake si pas de livraison active", async function() {
    // Stake 0.1 ether
    // Capturer balance deliverer avant
    // Appeler unstake
    // Vérifier isStaked(deliverer) = false
    // Vérifier balance deliverer augmenté de 0.1 ether
  });

  it("Doit revert unstake si le livreur n'est pas staké", async function() {
    // Appeler unstake sans avoir staké
    // expect(tx).to.be.revertedWith("Not staked")
  });

  it("Doit permettre à la PLATFORM de slasher un livreur", async function() {
    // Stake 0.1 ether
    // Appeler slash(deliverer, 0.02 ether) depuis platform
    // Vérifier stakedAmount(deliverer) = 0.08 ether
    // Vérifier balance platform augmenté de 0.02 ether
  });

  it("Doit revert si slash montant > stakedAmount", async function() {
    // Stake 0.1 ether
    // Appeler slash(deliverer, 0.2 ether)
    // expect(tx).to.be.revertedWith("Cannot slash more than staked")
  });

  it("Doit revert si slash appelé par non-PLATFORM", async function() {
    // Stake 0.1 ether
    // Appeler slash depuis une adresse sans PLATFORM_ROLE
    // expect(tx).to.be.revertedWith("Only platform can slash")
  });

  it("Doit retourner isStaked correctement", async function() {
    // Vérifier isStaked(deliverer) = false au départ
    // Stake 0.1 ether
    // Vérifier isStaked(deliverer) = true
    // Unstake
    // Vérifier isStaked(deliverer) = false
  });
});
```

**Points critiques testés** :
- Montant minimum de staking (0.1 ETH)
- Protection contre le slashing abusif (montant limité au stake)
- Gestion des retraits (unstake)
- Permissions (PLATFORM_ROLE pour slash)
- État isStaked correct

---

## Exécution des Tests

```bash
# Exécuter tous les tests
npx hardhat test

# Exécuter un fichier de test spécifique
npx hardhat test test/DoneOrderManager.test.js

# Tests avec couverture de code
npx hardhat coverage

# Tests avec affichage détaillé du gas
REPORT_GAS=true npx hardhat test
```

## Objectifs de Test

- Couverture : 100% des fonctions critiques
- Tous les tests doivent passer avant déploiement
- Tests d'intégration : Workflow complet testé (CREATED → DELIVERED)
- Tests de sécurité : Reentrancy, overflow, access control
- Tests d'erreur : Tous les cas de revert testés

## Structure Standard d'un Test

Chaque fichier de test suit cette structure :

```javascript
// 1. Imports
const { expect } = require("chai");
const { ethers } = require("hardhat");

// 2. describe() principal
describe("ContractName", function() {

  // 3. Variables globales
  let contract, otherContracts;
  let deployer, user1, user2;

  // 4. Setup avant chaque test
  beforeEach(async function() {
    // Déployer les contrats
    // Configurer les rôles
    // Préparer les comptes de test
  });

  // 5. Tests unitaires groupés
  describe("Fonction A", function() {
    it("Cas nominal", async function() { ... });
    it("Cas d'erreur 1", async function() { ... });
    it("Cas d'erreur 2", async function() { ... });
  });

  // 6. Tests d'intégration
  describe("Workflow complet", function() {
    it("Scénario end-to-end", async function() { ... });
  });

  // 7. Cleanup si nécessaire
  afterEach(async function() { ... });
});
```

## Bonnes Pratiques

- Utiliser des noms de tests descriptifs et en français
- Tester un seul comportement par test
- Utiliser expect() pour toutes les vérifications
- Capturer les balances/états AVANT et APRÈS les actions
- Vérifier les événements émis avec les bons paramètres
- Tester les cas d'erreur (revert) autant que les cas de succès
- Utiliser beforeEach pour un setup propre et isolé
