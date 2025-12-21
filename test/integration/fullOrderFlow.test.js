/**
 * Tests d'intégration - Flux complet de commande
 * @fileoverview Teste le workflow complet d'une commande du début à la fin
 * @dev Scénario: createOrder → confirmPreparation → assignDeliverer → confirmPickup → confirmDelivery → splitPayment → mintTokens
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Tests d'intégration - Flux complet de commande
 * @notice Teste le workflow complet de bout en bout
 */
describe("Integration: Full Order Flow", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, token, staking, priceOracle, gpsOracle, arbitration;

  let deployer, client, restaurant, deliverer, platform, arbitrator;

  // === SETUP AVANT CHAQUE TEST ===

  beforeEach(async function() {
    [deployer, client, restaurant, deliverer, platform, arbitrator] = await ethers.getSigners();

    const DoneToken = await ethers.getContractFactory("DoneToken");
    token = await DoneToken.deploy();
    await token.waitForDeployment();

    const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await DonePaymentSplitter.deploy();
    await paymentSplitter.waitForDeployment();

    const DoneStaking = await ethers.getContractFactory("DoneStaking");
    staking = await DoneStaking.deploy();
    await staking.waitForDeployment();

    const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await DoneOrderManager.deploy(
      await paymentSplitter.getAddress(),
      await token.getAddress(),
      await staking.getAddress()
    );
    await orderManager.waitForDeployment();

    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await orderManager.getAddress());

    const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
    await orderManager.grantRole(RESTAURANT_ROLE, restaurant.address);

    const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
    await orderManager.grantRole(DELIVERER_ROLE, deliverer.address);

    const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
    await orderManager.grantRole(PLATFORM_ROLE, platform.address);
  });

  // === TEST: FLUX COMPLET DE BOUT EN BOUT ===
  
  describe("Full Order Flow: End-to-End", function() {

    it("Doit exécuter le workflow complet de bout en bout", async function() {
      // ÉTAPE 1: Client crée commande (createOrder)
      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");
      const platformFee = foodPrice * 10n / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      const clientBalanceBefore = await ethers.provider.getBalance(client.address);
      const contractBalanceBefore = await ethers.provider.getBalance(await orderManager.getAddress());

      const tx1 = await orderManager.connect(client).createOrder(
        restaurant.address,
        foodPrice,
        deliveryFee,
        "QmTestHashIPFS",
        { value: totalAmount }
      );
      const receipt1 = await tx1.wait();

      const orderCreatedEvent = receipt1.logs.find(log => {
        try {
          return orderManager.interface.parseLog(log).name === "OrderCreated";
        } catch (e) {
          return false;
        }
      });
      const orderId = orderManager.interface.parseLog(orderCreatedEvent).args.orderId;

      const order1 = await orderManager.getOrder(orderId);
      expect(order1.status).to.equal(0);
      expect(order1.client).to.equal(client.address);
      expect(order1.restaurant).to.equal(restaurant.address);

      const contractBalanceAfter = await ethers.provider.getBalance(await orderManager.getAddress());
      expect(contractBalanceAfter - contractBalanceBefore).to.equal(totalAmount);

      // ÉTAPE 2: Restaurant confirme préparation (confirmPreparation)
      const tx2 = await orderManager.connect(restaurant).confirmPreparation(orderId);
      const receipt2 = await tx2.wait();

      const order2 = await orderManager.getOrder(orderId);
      expect(order2.status).to.equal(1);

      const prepEvent = receipt2.logs.find(log => {
        try {
          return orderManager.interface.parseLog(log).name === "PreparationConfirmed";
        } catch (e) {
          return false;
        }
      });
      expect(orderManager.interface.parseLog(prepEvent).args.orderId).to.equal(orderId);

      // ÉTAPE 3: Livreur stake 0.1 ETH (prérequis pour être assigné)
      const stakeAmount = ethers.parseEther("0.1");
      const tx3 = await staking.connect(deliverer).stakeAsDeliverer({ value: stakeAmount });
      await tx3.wait();

      const isStaked = await staking.isStaked(deliverer.address);
      expect(isStaked).to.be.true;

      // ÉTAPE 4: Assigner livreur (assignDeliverer)
      const tx4 = await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
      const receipt4 = await tx4.wait();

      const order4 = await orderManager.getOrder(orderId);
      expect(order4.deliverer).to.equal(deliverer.address);
      expect(order4.status).to.equal(2);

      const assignEvent = receipt4.logs.find(log => {
        try {
          return orderManager.interface.parseLog(log).name === "DelivererAssigned";
        } catch (e) {
          return false;
        }
      });
      const assignEventArgs = orderManager.interface.parseLog(assignEvent).args;
      expect(assignEventArgs.orderId).to.equal(orderId);
      expect(assignEventArgs.deliverer).to.equal(deliverer.address);

      // ÉTAPE 5: Livreur confirme pickup (confirmPickup)
      const tx5 = await orderManager.connect(deliverer).confirmPickup(orderId);
      const receipt5 = await tx5.wait();

      const pickupEvent = receipt5.logs.find(log => {
        try {
          return orderManager.interface.parseLog(log).name === "PickupConfirmed";
        } catch (e) {
          return false;
        }
      });
      expect(orderManager.interface.parseLog(pickupEvent).args.orderId).to.equal(orderId);

      const order5 = await orderManager.getOrder(orderId);
      expect(order5.status).to.equal(2);

      // ÉTAPE 6: Client confirme livraison (confirmDelivery)
      const restaurantBalanceBefore = await ethers.provider.getBalance(restaurant.address);
      const delivererBalanceBefore = await ethers.provider.getBalance(deliverer.address);
      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
      const clientTokenBalanceBefore = await token.balanceOf(client.address);

      const tx6 = await orderManager.connect(client).confirmDelivery(orderId);
      const receipt6 = await tx6.wait();

      const order6 = await orderManager.getOrder(orderId);
      expect(order6.status).to.equal(3);
      expect(order6.delivered).to.be.true;

      const deliveryEvent = receipt6.logs.find(log => {
        try {
          return orderManager.interface.parseLog(log).name === "DeliveryConfirmed";
        } catch (e) {
          return false;
        }
      });
      expect(orderManager.interface.parseLog(deliveryEvent).args.orderId).to.equal(orderId);

      // ÉTAPE 7: Vérifier split automatique des paiements (70/20/10)
      const restaurantAmount = totalAmount * 70n / 100n;
      const delivererAmount = totalAmount * 20n / 100n;
      const platformAmount = totalAmount * 10n / 100n;

      const restaurantBalanceAfter = await ethers.provider.getBalance(restaurant.address);
      expect(restaurantBalanceAfter - restaurantBalanceBefore).to.equal(restaurantAmount);

      const delivererBalanceAfter = await ethers.provider.getBalance(deliverer.address);
      expect(delivererBalanceAfter - delivererBalanceBefore).to.equal(delivererAmount);

      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformAmount);

      const splitEvent = receipt6.logs.find(log => {
        try {
          return paymentSplitter.interface.parseLog(log).name === "PaymentSplit";
        } catch (e) {
          return false;
        }
      });
      const splitEventArgs = paymentSplitter.interface.parseLog(splitEvent).args;
      expect(splitEventArgs.orderId).to.equal(orderId);
      expect(splitEventArgs.restaurantAmount).to.equal(restaurantAmount);
      expect(splitEventArgs.delivererAmount).to.equal(delivererAmount);
      expect(splitEventArgs.platformAmount).to.equal(platformAmount);

      // ÉTAPE 8: Vérifier tokens DONE mintés pour le client
      const tokensToMint = foodPrice / ethers.parseEther("10");

      const clientTokenBalanceAfter = await token.balanceOf(client.address);
      expect(clientTokenBalanceAfter - clientTokenBalanceBefore).to.equal(tokensToMint);

      const mintEvent = receipt6.logs.find(log => {
        try {
          return token.interface.parseLog(log).name === "TokensMinted";
        } catch (e) {
          return false;
        }
      });
      const mintEventArgs = token.interface.parseLog(mintEvent).args;
      expect(mintEventArgs.to).to.equal(client.address);
      expect(mintEventArgs.amount).to.equal(tokensToMint);
    });

    it("Doit revert si confirmPreparation appelé par non-restaurant", async function() {
      const orderId = await createTestOrder();

      await expect(
        orderManager.connect(client).confirmPreparation(orderId)
      ).to.be.revertedWith("Only restaurant can confirm");
    });

    it("Doit revert si assignDeliverer avec livreur non-staké", async function() {
      const orderId = await createTestOrder();
      await orderManager.connect(restaurant).confirmPreparation(orderId);

      await expect(
        orderManager.connect(platform).assignDeliverer(orderId, deliverer.address)
      ).to.be.revertedWith("Deliverer not staked");
    });

    it("Doit revert si confirmDelivery appelé par non-client", async function() {
      const orderId = await createTestOrder();
      await orderManager.connect(restaurant).confirmPreparation(orderId);
      await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
      await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);

      await expect(
        orderManager.connect(restaurant).confirmDelivery(orderId)
      ).to.be.revertedWith("Only client can confirm delivery");
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrder() {
    const foodPrice = ethers.parseEther("10");
    const deliveryFee = ethers.parseEther("2");
    const platformFee = foodPrice * 10n / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    const tx = await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "QmTestHash",
      { value: totalAmount }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        return orderManager.interface.parseLog(log).name === "OrderCreated";
      } catch (e) {
        return false;
      }
    });
    return orderManager.interface.parseLog(event).args.orderId;
  }
});

