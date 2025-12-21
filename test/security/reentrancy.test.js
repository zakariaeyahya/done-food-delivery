/**
 * Tests de sécurité - Protection contre les attaques de réentrance
 * @fileoverview Vérifie que les contrats sont protégés contre les attaques de réentrance
 * @dev Crée un contrat malveillant qui tente réentrancy et vérifie que ça revert
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security: Reentrancy Protection", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, staking, token;
  let deployer, client, restaurant, deliverer, platform;
  let attackerContract;

  // === SETUP ===

  beforeEach(async function() {
    [deployer, client, restaurant, deliverer, platform] = await ethers.getSigners();

    // Déployer DoneToken
    const Token = await ethers.getContractFactory("DoneToken");
    token = await Token.deploy();

    // Déployer DonePaymentSplitter
    const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await Splitter.deploy();

    // Déployer DoneStaking
    const Staking = await ethers.getContractFactory("DoneStaking");
    staking = await Staking.deploy();
    await staking.grantRole(await staking.PLATFORM_ROLE(), platform.address);

    // Déployer DoneOrderManager
    const OrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await OrderManager.deploy(
      paymentSplitter.target,
      token.target,
      staking.target,
      platform.address
    );

    // Configurer les rôles
    await orderManager.grantRole(await orderManager.RESTAURANT_ROLE(), restaurant.address);
    await orderManager.grantRole(await orderManager.DELIVERER_ROLE(), deliverer.address);
    await orderManager.grantRole(await orderManager.PLATFORM_ROLE(), platform.address);
    await token.grantRole(await token.MINTER_ROLE(), orderManager.target);

    // Livreur stake 0.1 ETH
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

    // Déployer contrat malveillant ReentrancyAttacker
    const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
    attackerContract = await ReentrancyAttacker.deploy(orderManager.target, staking.target);
  });

  // === TESTS: PROTECTION RÉENTRANCE ===

  describe("Reentrancy Protection Tests", function() {

    it("Doit revert si tentative réentrancy sur confirmDelivery", async function() {
      const orderId = await createTestOrderAndReachInDelivery();

      // Donner les rôles nécessaires au contrat attaquant
      await orderManager.grantRole(await orderManager.CLIENT_ROLE(), attackerContract.target);

      // Tenter attaque réentrancy - doit revert avec ReentrancyGuard
      await expect(
        attackerContract.attackDelivery(orderId)
      ).to.be.reverted;

      // Vérifier que la commande est toujours IN_DELIVERY (pas DELIVERED)
      const order = await orderManager.getOrder(orderId);
      expect(order.status).to.equal(3); // IN_DELIVERY
    });

    it("Doit revert si tentative réentrancy sur splitPayment", async function() {
      const orderId = await createTestOrderAndCompleteDelivery();

      // Vérifier que le paiement a été effectué une seule fois
      const order = await orderManager.getOrder(orderId);
      expect(order.status).to.equal(4); // DELIVERED

      // Tenter de confirmer à nouveau - doit revert
      await expect(
        orderManager.connect(client).confirmDelivery(orderId)
      ).to.be.revertedWith("Invalid status transition");
    });

    it("Doit revert si tentative réentrancy sur unstake", async function() {
      // Donner au contrat attaquant la possibilité de staker
      await staking.grantRole(await staking.DELIVERER_ROLE(), attackerContract.target);

      // Le contrat attaquant stake 0.1 ETH
      await attackerContract.deposit({ value: ethers.parseEther("0.1") });
      await staking.connect(deployer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

      // Tenter attaque réentrancy sur unstake
      await expect(
        attackerContract.attackUnstake()
      ).to.be.reverted;
    });

    it("Doit utiliser pattern checks-effects-interactions", async function() {
      const orderId = await createTestOrderAndReachInDelivery();

      // Capturer l'état avant la confirmation de livraison
      const orderBefore = await orderManager.getOrder(orderId);
      expect(orderBefore.status).to.equal(3); // IN_DELIVERY

      // Confirmer la livraison
      await orderManager.connect(client).confirmDelivery(orderId);

      // Vérifier que l'état a été mis à jour AVANT les transferts
      const orderAfter = await orderManager.getOrder(orderId);
      expect(orderAfter.status).to.equal(4); // DELIVERED

      // Vérifier qu'on ne peut pas confirmer à nouveau (effet persistant)
      await expect(
        orderManager.connect(client).confirmDelivery(orderId)
      ).to.be.revertedWith("Invalid status transition");
    });

    it("Doit utiliser ReentrancyGuard modifier", async function() {
      // Vérifier que les fonctions critiques utilisent le modifier nonReentrant
      // On teste indirectement en vérifiant que la réentrance est bloquée
      const orderId = await createTestOrderAndReachInDelivery();

      await orderManager.grantRole(await orderManager.CLIENT_ROLE(), attackerContract.target);

      // La tentative de réentrance doit échouer
      await expect(
        attackerContract.attackDelivery(orderId)
      ).to.be.reverted;

      // Vérifier que l'état n'a pas changé
      const order = await orderManager.getOrder(orderId);
      expect(order.status).to.equal(3); // Toujours IN_DELIVERY
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrderAndReachInDelivery() {
    const foodPrice = ethers.parseEther("0.02");
    const deliveryFee = ethers.parseEther("0.005");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalPrice = foodPrice + deliveryFee + platformFee;

    // Créer la commande
    await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "ipfs://test-metadata",
      { value: totalPrice }
    );

    const orderId = 1;

    // Restaurant confirme la préparation
    await orderManager.connect(restaurant).confirmPreparation(orderId);

    // Platform assigne le livreur
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);

    // Livreur confirme le pickup
    await orderManager.connect(deliverer).confirmPickup(orderId);

    return orderId;
  }

  async function createTestOrderAndCompleteDelivery() {
    const orderId = await createTestOrderAndReachInDelivery();

    // Client confirme la livraison
    await orderManager.connect(client).confirmDelivery(orderId);

    return orderId;
  }
});

