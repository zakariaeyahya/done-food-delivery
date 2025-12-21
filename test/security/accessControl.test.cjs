/**
 * Tests de sécurité - Contrôle d'accès
 * @fileoverview Vérifie que seuls les bons rôles peuvent appeler les fonctions sensibles
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security: Access Control", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, staking, arbitration, token, paymentSplitter;
  let deployer, client, restaurant, deliverer, platform, arbitrator, unauthorized;

  // === SETUP ===

  beforeEach(async function() {
    this.timeout(60000);

    [deployer, client, restaurant, deliverer, platform, arbitrator, unauthorized] = await ethers.getSigners();

    // Deploy DoneToken
    const Token = await ethers.getContractFactory("DoneToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy DonePaymentSplitter
    const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await Splitter.deploy();
    await paymentSplitter.waitForDeployment();

    // Deploy DoneStaking
    const Staking = await ethers.getContractFactory("DoneStaking");
    staking = await Staking.deploy();
    await staking.waitForDeployment();
    await staking.grantRole(await staking.PLATFORM_ROLE(), platform.address);

    // Deploy DoneOrderManager
    const OrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await OrderManager.deploy(
      paymentSplitter.target,
      token.target,
      staking.target,
      platform.address
    );
    await orderManager.waitForDeployment();

    // Deploy DoneArbitration
    const Arbitration = await ethers.getContractFactory("DoneArbitration");
    arbitration = await Arbitration.deploy(token.target, platform.address);
    await arbitration.waitForDeployment();

    // Grant roles
    await orderManager.grantRole(await orderManager.RESTAURANT_ROLE(), restaurant.address);
    await orderManager.grantRole(await orderManager.DELIVERER_ROLE(), deliverer.address);
    await orderManager.grantRole(await orderManager.PLATFORM_ROLE(), platform.address);
    await orderManager.grantRole(await orderManager.ARBITRATOR_ROLE(), arbitrator.address);

    await token.grantRole(await token.MINTER_ROLE(), orderManager.target);

    await arbitration.grantRole(await arbitration.ARBITER_ROLE(), arbitrator.address);

    // Deliverer stakes
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
  });

  // === TESTS: CONTRÔLE D'ACCÈS ORDERMANAGER ===

  describe("DoneOrderManager Access Control", function() {

    it("Doit revert si confirmPreparation appelé par non-restaurant", async function() {
      const orderId = await createTestOrder();

      await expect(
        orderManager.connect(client).confirmPreparation(orderId)
      ).to.be.reverted;

      await expect(
        orderManager.connect(unauthorized).confirmPreparation(orderId)
      ).to.be.reverted;
    });

    it("Doit revert si assignDeliverer appelé par non-PLATFORM", async function() {
      const orderId = await createTestOrder();
      await orderManager.connect(restaurant).confirmPreparation(orderId);

      await expect(
        orderManager.connect(client).assignDeliverer(orderId, deliverer.address)
      ).to.be.reverted;
    });

    it("Doit revert si confirmDelivery appelé par non-client", async function() {
      const orderId = await createTestOrderAndReachInDelivery();

      await expect(
        orderManager.connect(restaurant).confirmDelivery(orderId)
      ).to.be.revertedWith("Not client");
    });

    it("Doit revert si resolveDispute appelé par non-arbitrator", async function() {
      const orderId = await createTestOrderAndReachInDelivery();
      await orderManager.connect(client).openDispute(orderId);

      await expect(
        orderManager.connect(client).resolveDispute(orderId, client.address, 100)
      ).to.be.reverted;
    });
  });

  // === TESTS: CONTRÔLE D'ACCÈS STAKING ===

  describe("DoneStaking Access Control", function() {

    it("Doit revert si slash appelé par non-PLATFORM", async function() {
      await expect(
        staking.connect(client).slash(deliverer.address, ethers.parseEther("0.02"))
      ).to.be.reverted;
    });
  });

  // === TESTS: CONTRÔLE D'ACCÈS ARBITRATION ===

  describe("DoneArbitration Access Control", function() {

    it("Doit revert si resolveDisputeManual appelé par non-ARBITER", async function() {
      const disputeId = await createTestDispute();

      await expect(
        arbitration.connect(client).resolveDisputeManual(disputeId, 1)
      ).to.be.reverted;
    });

    it("Doit permettre seulement parties prenantes de créer dispute", async function() {
      const orderId = await createTestOrderAndReachInDelivery();

      await expect(
        orderManager.connect(unauthorized).openDispute(orderId)
      ).to.be.revertedWith("Not allowed");
    });
  });

  // === TESTS: CONTRÔLE D'ACCÈS TOKEN ===

  describe("DoneToken Access Control", function() {

    it("Doit revert si mint appelé par non-MINTER", async function() {
      await expect(
        token.connect(client).mint(client.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrder() {
    const foodPrice = ethers.parseEther("0.02");
    const deliveryFee = ethers.parseEther("0.005");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    const tx = await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "ipfs://test",
      { value: totalAmount }
    );

    await tx.wait();
    return 1;
  }

  async function createTestOrderAndReachInDelivery() {
    const orderId = await createTestOrder();

    await orderManager.connect(restaurant).confirmPreparation(orderId);
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
    await orderManager.connect(deliverer).confirmPickup(orderId);

    return orderId;
  }

  async function createTestDispute() {
    const orderId = await createTestOrderAndReachInDelivery();

    const foodPrice = ethers.parseEther("0.02");
    const deliveryFee = ethers.parseEther("0.005");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    const tx = await arbitration.connect(client).createDispute(
      orderId,
      client.address,
      restaurant.address,
      deliverer.address,
      "Test dispute",
      "ipfs://evidence",
      { value: totalAmount }
    );

    await tx.wait();
    return 1;
  }
});

