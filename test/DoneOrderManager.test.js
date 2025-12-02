// TODO: Importer expect depuis chai pour les assertions
// const { expect } = require("chai");

// TODO: Importer ethers depuis hardhat pour les interactions blockchain
// const { ethers } = require("hardhat");

/**
 * Tests pour le contrat DoneOrderManager
 * @notice Teste le workflow complet des commandes et la gestion des états
 * @dev Tests critiques: T1 (création), T2 (workflow), T4 (dispute)
 */
describe("DoneOrderManager", function() {

  // === VARIABLES GLOBALES ===
  // TODO: Déclarer les variables pour les contrats
  // let orderManager, paymentSplitter, token, staking;
  
  // TODO: Déclarer les variables pour les comptes
  // let deployer, client, restaurant, deliverer, platform, arbitrator;

  // === SETUP AVANT CHAQUE TEST ===
  // TODO: Implémenter beforeEach pour déployer les contrats et configurer les rôles
  // beforeEach(async function() {
  //   // TODO: Récupérer les signers depuis ethers
  //   [deployer, client, restaurant, deliverer, platform, arbitrator] = await ethers.getSigners();
  //
  //   // TODO: Déployer DoneToken
  //   const DoneToken = await ethers.getContractFactory("DoneToken");
  //   token = await DoneToken.deploy();
  //   await token.deployed();
  //
  //   // TODO: Déployer DonePaymentSplitter
  //   const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
  //   paymentSplitter = await DonePaymentSplitter.deploy();
  //   await paymentSplitter.deployed();
  //
  //   // TODO: Déployer DoneStaking
  //   const DoneStaking = await ethers.getContractFactory("DoneStaking");
  //   staking = await DoneStaking.deploy();
  //   await staking.deployed();
  //
  //   // TODO: Déployer DoneOrderManager avec les adresses des 3 contrats
  //   const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
  //   orderManager = await DoneOrderManager.deploy(
  //     paymentSplitter.address,
  //     token.address,
  //     staking.address
  //   );
  //   await orderManager.deployed();
  //
  //   // TODO: Configurer les rôles
  //   // Accorder MINTER_ROLE à OrderManager
  //   const MINTER_ROLE = await token.MINTER_ROLE();
  //   await token.grantRole(MINTER_ROLE, orderManager.address);
  //
  //   // Accorder RESTAURANT_ROLE à restaurant
  //   const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
  //   await orderManager.grantRole(RESTAURANT_ROLE, restaurant.address);
  //
  //   // Accorder DELIVERER_ROLE à deliverer
  //   const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
  //   await orderManager.grantRole(DELIVERER_ROLE, deliverer.address);
  //
  //   // Accorder ARBITRATOR_ROLE à arbitrator
  //   const ARBITRATOR_ROLE = await orderManager.ARBITRATOR_ROLE();
  //   await orderManager.grantRole(ARBITRATOR_ROLE, arbitrator.address);
  // });

  // === TESTS T1: CRÉATION DE COMMANDE ===
  describe("T1: Création de commande", function() {

    it("Doit créer une commande avec msg.value correct", async function() {
      // TODO: Calculer les montants
      // const foodPrice = ethers.utils.parseEther("10"); // 10 MATIC
      // const deliveryFee = ethers.utils.parseEther("2"); // 2 MATIC
      // const platformFee = foodPrice.mul(10).div(100); // 10% = 1 MATIC
      // const totalAmount = foodPrice.add(deliveryFee).add(platformFee); // 13 MATIC
      
      // TODO: Capturer la balance du contrat avant
      // const contractBalanceBefore = await ethers.provider.getBalance(orderManager.address);
      
      // TODO: Appeler createOrder avec msg.value = totalAmount
      // const tx = await orderManager.connect(client).createOrder(
      //   restaurant.address,
      //   foodPrice,
      //   deliveryFee,
      //   "QmTestHash",
      //   { value: totalAmount }
      // );
      // const receipt = await tx.wait();
      
      // TODO: Extraire l'orderId depuis l'event OrderCreated
      // const orderCreatedEvent = receipt.events.find(e => e.event === "OrderCreated");
      // const orderId = orderCreatedEvent.args.orderId;
      
      // TODO: Récupérer la commande créée
      // const order = await orderManager.getOrder(orderId);
      
      // TODO: Vérifier que orderId est retourné (non nul)
      // expect(orderId).to.not.equal(0);
      
      // TODO: Vérifier que order.status = CREATED (0)
      // expect(order.status).to.equal(0); // CREATED = 0
      
      // TODO: Vérifier que order.client = client.address
      // expect(order.client).to.equal(client.address);
      
      // TODO: Vérifier que order.restaurant = restaurant.address
      // expect(order.restaurant).to.equal(restaurant.address);
      
      // TODO: Vérifier que order.foodPrice = foodPrice
      // expect(order.foodPrice).to.equal(foodPrice);
      
      // TODO: Vérifier que order.deliveryFee = deliveryFee
      // expect(order.deliveryFee).to.equal(deliveryFee);
      
      // TODO: Vérifier que order.platformFee = platformFee
      // expect(order.platformFee).to.equal(platformFee);
      
      // TODO: Vérifier que les fonds sont bloqués dans le contrat
      // const contractBalanceAfter = await ethers.provider.getBalance(orderManager.address);
      // expect(contractBalanceAfter.sub(contractBalanceBefore)).to.equal(totalAmount);
      
      // TODO: Vérifier que l'event OrderCreated est émis avec les bons paramètres
      // expect(orderCreatedEvent.args.client).to.equal(client.address);
      // expect(orderCreatedEvent.args.restaurant).to.equal(restaurant.address);
      // expect(orderCreatedEvent.args.totalAmount).to.equal(totalAmount);
    });

    it("Doit revert si msg.value incorrect (trop bas)", async function() {
      // TODO: Calculer totalAmount
      // const foodPrice = ethers.utils.parseEther("10");
      // const deliveryFee = ethers.utils.parseEther("2");
      // const platformFee = foodPrice.mul(10).div(100);
      // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);
      
      // TODO: Appeler createOrder avec msg.value < totalAmount
      // await expect(
      //   orderManager.connect(client).createOrder(
      //     restaurant.address,
      //     foodPrice,
      //     deliveryFee,
      //     "QmTestHash",
      //     { value: totalAmount.sub(ethers.utils.parseEther("1")) } // Moins que le total
      //   )
      // ).to.be.revertedWith("OrderManager: Payment amount mismatch");
    });

    it("Doit revert si msg.value incorrect (trop haut)", async function() {
      // TODO: Calculer totalAmount
      // const foodPrice = ethers.utils.parseEther("10");
      // const deliveryFee = ethers.utils.parseEther("2");
      // const platformFee = foodPrice.mul(10).div(100);
      // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);
      
      // TODO: Appeler createOrder avec msg.value > totalAmount
      // await expect(
      //   orderManager.connect(client).createOrder(
      //     restaurant.address,
      //     foodPrice,
      //     deliveryFee,
      //     "QmTestHash",
      //     { value: totalAmount.add(ethers.utils.parseEther("1")) } // Plus que le total
      //   )
      // ).to.be.revertedWith("OrderManager: Payment amount mismatch");
    });

    it("Doit revert si restaurant n'a pas le rôle RESTAURANT_ROLE", async function() {
      // TODO: Créer une adresse sans rôle restaurant
      // const [randomAddress] = await ethers.getSigners();
      
      // TODO: Appeler createOrder avec une adresse sans rôle restaurant
      // await expect(
      //   orderManager.connect(client).createOrder(
      //     randomAddress.address,
      //     ethers.utils.parseEther("10"),
      //     ethers.utils.parseEther("2"),
      //     "QmTestHash",
      //     { value: ethers.utils.parseEther("13") }
      //   )
      // ).to.be.revertedWith("OrderManager: Restaurant must have RESTAURANT_ROLE");
    });

    it("Doit revert si foodPrice = 0", async function() {
      // TODO: Appeler createOrder avec foodPrice = 0
      // await expect(
      //   orderManager.connect(client).createOrder(
      //     restaurant.address,
      //     0, // foodPrice = 0
      //     ethers.utils.parseEther("2"),
      //     "QmTestHash",
      //     { value: ethers.utils.parseEther("2") }
      //   )
      // ).to.be.revertedWith("OrderManager: Food price must be greater than 0");
    });

    it("Doit revert si ipfsHash vide", async function() {
      // TODO: Appeler createOrder avec ipfsHash = ""
      // await expect(
      //   orderManager.connect(client).createOrder(
      //     restaurant.address,
      //     ethers.utils.parseEther("10"),
      //     ethers.utils.parseEther("2"),
      //     "", // ipfsHash vide
      //     { value: ethers.utils.parseEther("13") }
      //   )
      // ).to.be.revertedWith("OrderManager: IPFS hash cannot be empty");
    });
  });

  // === TESTS T2: WORKFLOW COMPLET ===
  describe("T2: Workflow complet", function() {

    it("Doit exécuter le workflow complet de bout en bout", async function() {
      // TODO: ÉTAPE 1: createOrder
      // Calculer les montants
      // const foodPrice = ethers.utils.parseEther("10");
      // const deliveryFee = ethers.utils.parseEther("2");
      // const platformFee = foodPrice.mul(10).div(100);
      // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);
      
      // Appeler createOrder par le client
      // const tx1 = await orderManager.connect(client).createOrder(
      //   restaurant.address,
      //   foodPrice,
      //   deliveryFee,
      //   "QmTestHash",
      //   { value: totalAmount }
      // );
      // const receipt1 = await tx1.wait();
      // const orderCreatedEvent = receipt1.events.find(e => e.event === "OrderCreated");
      // const orderId = orderCreatedEvent.args.orderId;
      
      // Vérifier status = CREATED
      // let order = await orderManager.getOrder(orderId);
      // expect(order.status).to.equal(0); // CREATED
      
      // TODO: ÉTAPE 2: confirmPreparation
      // Appeler confirmPreparation par le restaurant
      // const tx2 = await orderManager.connect(restaurant).confirmPreparation(orderId);
      // await tx2.wait();
      
      // Vérifier status = PREPARING
      // order = await orderManager.getOrder(orderId);
      // expect(order.status).to.equal(1); // PREPARING
      
      // TODO: ÉTAPE 3: Staking du livreur (prérequis)
      // Appeler stakeAsDeliverer avec 0.1 ETH
      // await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.utils.parseEther("0.1") });
      
      // Vérifier isStaked(deliverer) = true
      // expect(await staking.isStaked(deliverer.address)).to.equal(true);
      
      // TODO: ÉTAPE 4: assignDeliverer
      // Appeler assignDeliverer avec deliverer.address
      // const tx3 = await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
      // await tx3.wait();
      
      // Vérifier order.deliverer = deliverer.address
      // order = await orderManager.getOrder(orderId);
      // expect(order.deliverer).to.equal(deliverer.address);
      
      // Vérifier status = IN_DELIVERY
      // expect(order.status).to.equal(2); // IN_DELIVERY
      
      // TODO: ÉTAPE 5: confirmPickup
      // Appeler confirmPickup par le livreur
      // const tx4 = await orderManager.connect(deliverer).confirmPickup(orderId);
      // await tx4.wait();
      
      // Vérifier status reste IN_DELIVERY
      // order = await orderManager.getOrder(orderId);
      // expect(order.status).to.equal(2); // IN_DELIVERY
      
      // TODO: ÉTAPE 6: confirmDelivery
      // Capturer balances avant (restaurant, deliverer, platform)
      // const balanceRestaurantBefore = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererBefore = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformBefore = await ethers.provider.getBalance(platform.address);
      
      // Appeler confirmDelivery par le client
      // const tx5 = await orderManager.connect(client).confirmDelivery(orderId);
      // await tx5.wait();
      
      // Vérifier status = DELIVERED
      // order = await orderManager.getOrder(orderId);
      // expect(order.status).to.equal(3); // DELIVERED
      
      // Vérifier order.delivered = true
      // expect(order.delivered).to.equal(true);
      
      // TODO: ÉTAPE 7: Vérifier split automatique des paiements
      // Capturer balances après
      // const balanceRestaurantAfter = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererAfter = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformAfter = await ethers.provider.getBalance(platform.address);
      
      // Vérifier balance restaurant augmenté de 70%
      // const restaurantAmount = totalAmount.mul(70).div(100);
      // expect(balanceRestaurantAfter.sub(balanceRestaurantBefore)).to.equal(restaurantAmount);
      
      // Vérifier balance deliverer augmenté de 20%
      // const delivererAmount = totalAmount.mul(20).div(100);
      // expect(balanceDelivererAfter.sub(balanceDelivererBefore)).to.equal(delivererAmount);
      
      // Vérifier balance platform augmenté de 10%
      // const platformAmount = totalAmount.mul(10).div(100);
      // expect(balancePlatformAfter.sub(balancePlatformBefore)).to.equal(platformAmount);
      
      // TODO: ÉTAPE 8: Vérifier tokens DONE mintés pour le client
      // Calculer tokensToMint = (foodPrice / 10 ether) * 1 ether
      // const tokensToMint = foodPrice.div(ethers.utils.parseEther("10")).mul(ethers.utils.parseEther("1"));
      
      // Vérifier balanceOf(client) = tokensToMint
      // expect(await token.balanceOf(client.address)).to.equal(tokensToMint);
    });

    it("Doit revert si confirmPreparation appelé par non-restaurant", async function() {
      // TODO: createOrder
      // const foodPrice = ethers.utils.parseEther("10");
      // const deliveryFee = ethers.utils.parseEther("2");
      // const platformFee = foodPrice.mul(10).div(100);
      // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);
      // const tx = await orderManager.connect(client).createOrder(
      //   restaurant.address,
      //   foodPrice,
      //   deliveryFee,
      //   "QmTestHash",
      //   { value: totalAmount }
      // );
      // const receipt = await tx.wait();
      // const orderCreatedEvent = receipt.events.find(e => e.event === "OrderCreated");
      // const orderId = orderCreatedEvent.args.orderId;
      
      // TODO: Appeler confirmPreparation par une adresse tierce
      // await expect(
      //   orderManager.connect(client).confirmPreparation(orderId)
      // ).to.be.revertedWith("OrderManager: Only restaurant can confirm");
    });

    it("Doit revert si assignDeliverer avec livreur non-staké", async function() {
      // TODO: createOrder et confirmPreparation
      // ... (code similaire aux tests précédents)
      
      // TODO: Appeler assignDeliverer avec deliverer non-staké (sans avoir appelé stakeAsDeliverer)
      // await expect(
      //   orderManager.connect(platform).assignDeliverer(orderId, deliverer.address)
      // ).to.be.revertedWith("OrderManager: Deliverer must be staked");
    });

    it("Doit revert si confirmDelivery appelé par non-client", async function() {
      // TODO: Workflow jusqu'à IN_DELIVERY
      // ... (code similaire au test workflow complet)
      
      // TODO: Appeler confirmDelivery par une adresse tierce
      // await expect(
      //   orderManager.connect(restaurant).confirmDelivery(orderId)
      // ).to.be.revertedWith("OrderManager: Only client can confirm delivery");
    });
  });

  // === TESTS T4: DISPUTE ET GEL DES FONDS ===
  describe("T4: Dispute et gel des fonds", function() {

    it("Doit geler les fonds quand un litige est ouvert", async function() {
      // TODO: Workflow jusqu'à IN_DELIVERY
      // ... (code similaire au test workflow complet jusqu'à confirmPickup)
      
      // TODO: Appeler openDispute par le client
      // const tx = await orderManager.connect(client).openDispute(orderId);
      // await tx.wait();
      
      // TODO: Vérifier order.status = DISPUTED
      // const order = await orderManager.getOrder(orderId);
      // expect(order.status).to.equal(4); // DISPUTED
      
      // TODO: Vérifier order.disputed = true
      // expect(order.disputed).to.equal(true);
      
      // TODO: Tenter confirmDelivery → doit revert
      // await expect(
      //   orderManager.connect(client).confirmDelivery(orderId)
      // ).to.be.revertedWith("OrderManager: Cannot confirm disputed order");
      
      // TODO: Vérifier que les fonds restent bloqués dans le contrat
      // const contractBalance = await ethers.provider.getBalance(orderManager.address);
      // expect(contractBalance).to.equal(totalAmount);
    });

    it("Doit revert si openDispute appelé après livraison", async function() {
      // TODO: Workflow complet jusqu'à DELIVERED
      // ... (code similaire au test workflow complet)
      
      // TODO: Appeler openDispute après livraison
      // await expect(
      //   orderManager.connect(client).openDispute(orderId)
      // ).to.be.revertedWith("OrderManager: Cannot dispute delivered order");
    });

    it("Doit résoudre le litige en faveur du client", async function() {
      // TODO: Workflow jusqu'à IN_DELIVERY
      // ... (code similaire)
      
      // TODO: Appeler openDispute par le client
      // await orderManager.connect(client).openDispute(orderId);
      
      // TODO: Capturer balance client avant
      // const balanceClientBefore = await ethers.provider.getBalance(client.address);
      
      // TODO: Appeler resolveDispute par l'arbitrator avec winner = client, refundPercent = 100
      // const tx = await orderManager.connect(arbitrator).resolveDispute(
      //   orderId,
      //   client.address,
      //   100 // 100% de remboursement
      // );
      // await tx.wait();
      
      // TODO: Vérifier order.disputed = false
      // const order = await orderManager.getOrder(orderId);
      // expect(order.disputed).to.equal(false);
      
      // TODO: Vérifier balance client augmenté de 100% du totalAmount
      // const balanceClientAfter = await ethers.provider.getBalance(client.address);
      // expect(balanceClientAfter.sub(balanceClientBefore)).to.equal(totalAmount);
    });

    it("Doit résoudre le litige en faveur du restaurant (50%)", async function() {
      // TODO: Workflow jusqu'à IN_DELIVERY
      // TODO: Appeler openDispute
      // TODO: Appeler resolveDispute avec winner = restaurant, refundPercent = 50
      // TODO: Vérifier balance restaurant augmenté de 50% du totalAmount
    });

    it("Doit revert si resolveDispute appelé par non-arbitrator", async function() {
      // TODO: Workflow jusqu'à DISPUTED
      // TODO: Appeler resolveDispute par une adresse sans ARBITRATOR_ROLE
      // await expect(
      //   orderManager.connect(client).resolveDispute(orderId, client.address, 100)
      // ).to.be.revertedWith("OrderManager: Only arbitrator can resolve");
    });

    it("Doit revert si resolveDispute avec refundPercent > 100", async function() {
      // TODO: Workflow jusqu'à DISPUTED
      // TODO: Appeler resolveDispute avec refundPercent = 150
      // await expect(
      //   orderManager.connect(arbitrator).resolveDispute(orderId, client.address, 150)
      // ).to.be.revertedWith("OrderManager: Refund percent cannot exceed 100");
    });
  });
});

