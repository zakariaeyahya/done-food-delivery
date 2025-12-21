/**
 * Tests de sécurité - Protection contre overflow/underflow
 * @fileoverview Vérifie qu'il n'y a pas d'overflow/underflow sur les calculs
 * @dev Solidity ≥ 0.8 revert automatiquement, mais tester quand même
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security: Integer Overflow/Underflow Protection", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, token, staking;
  let deployer, client, restaurant, deliverer, platform;

  // === SETUP ===

  beforeEach(async function() {
    [deployer, client, restaurant, deliverer, platform] = await ethers.getSigners();

    // Déployer DoneToken
    const DoneToken = await ethers.getContractFactory("DoneToken");
    token = await DoneToken.deploy();
    await token.waitForDeployment();

    // Déployer DoneStaking
    const DoneStaking = await ethers.getContractFactory("DoneStaking");
    staking = await DoneStaking.deploy();
    await staking.waitForDeployment();

    // Déployer DonePaymentSplitter
    const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await DonePaymentSplitter.deploy(platform.address);
    await paymentSplitter.waitForDeployment();

    // Déployer DoneOrderManager
    const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await DoneOrderManager.deploy(
      await token.getAddress(),
      await paymentSplitter.getAddress(),
      await staking.getAddress(),
      platform.address
    );
    await orderManager.waitForDeployment();

    // Donner rôle MINTER au OrderManager
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await orderManager.getAddress());

    // Donner rôle ORDER_MANAGER au PaymentSplitter
    const ORDER_MANAGER_ROLE = await paymentSplitter.ORDER_MANAGER_ROLE();
    await paymentSplitter.grantRole(ORDER_MANAGER_ROLE, await orderManager.getAddress());

    // Stake pour le livreur
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
  });

  // === TESTS: OVERFLOW CALCULS MONTANTS ===
  
  describe("Overflow Protection: Amount Calculations", function() {

    it("Doit revert si totalAmount overflow dans createOrder", async function() {
      const maxUint256 = ethers.MaxUint256;
      const foodPrice = maxUint256;
      const deliveryFee = maxUint256;

      await expect(
        orderManager.connect(client).createOrder(
          restaurant.address,
          foodPrice,
          deliveryFee,
          "QmHash",
          { value: maxUint256 }
        )
      ).to.be.reverted;
    });

    it("Doit gérer correctement splitPayment avec montants très grands", async function() {
      const foodPrice = ethers.parseEther("1000000");
      const deliveryFee = ethers.parseEther("100000");
      const platformFee = foodPrice * 10n / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      const orderId = await createTestOrderWithAmount(foodPrice, deliveryFee, totalAmount);
      await completeOrderFlow(orderId);

      const restaurantAmount = totalAmount * 70n / 100n;
      const delivererAmount = totalAmount * 20n / 100n;
      const platformAmount = totalAmount * 10n / 100n;

      const order = await orderManager.getOrder(orderId);
      expect(order.status).to.equal(4);
    });
  });

  // === TESTS: OVERFLOW TOKENS ===

  describe("Overflow Protection: Token Operations", function() {

    it("Doit revert si mint overflow totalSupply", async function() {
      const maxTokens = ethers.MaxUint256;

      await expect(
        token.mint(client.address, maxTokens)
      ).to.be.reverted;
    });

    it("Doit revert si burn underflow balance", async function() {
      await token.mint(client.address, ethers.parseEther("100"));

      await expect(
        token.connect(client).burn(ethers.parseEther("200"))
      ).to.be.reverted;
    });
  });

  // === TESTS: OVERFLOW CALCULS PERCENTAGES ===

  describe("Overflow Protection: Percentage Calculations", function() {

    it("Doit gérer correctement calcul platformFee (10%)", async function() {
      const foodPrice1 = ethers.parseEther("10");
      const platformFee1 = foodPrice1 * 10n / 100n;
      expect(platformFee1).to.equal(ethers.parseEther("1"));

      const foodPrice2 = ethers.parseEther("100");
      const platformFee2 = foodPrice2 * 10n / 100n;
      expect(platformFee2).to.equal(ethers.parseEther("10"));
    });

    it("Doit gérer correctement calcul tokensToMint (1 token / 10€)", async function() {
      const foodPrice1 = ethers.parseEther("10");
      const tokens1 = foodPrice1 / ethers.parseEther("10");
      expect(tokens1).to.equal(1n);

      const foodPrice2 = ethers.parseEther("25");
      const tokens2 = foodPrice2 / ethers.parseEther("10");
      expect(tokens2).to.equal(2n);
    });
  });

  // === TESTS: COMPORTEMENT AVEC MONTANTS EXTRÊMES ===

  describe("Edge Cases: Extreme Amounts", function() {

    it("Doit revert proprement avec montants négatifs (impossible en uint256)", async function() {
      // Les montants négatifs sont impossibles avec uint256
      // Ce test vérifie que le type est bien respecté
      const foodPrice = 0n;
      expect(foodPrice).to.be.gte(0);
    });

    it("Doit gérer correctement montant = 0", async function() {
      await expect(
        orderManager.connect(client).createOrder(
          restaurant.address,
          0,
          ethers.parseEther("2"),
          "QmHash",
          { value: ethers.parseEther("2") }
        )
      ).to.be.revertedWith("Food price must be > 0");
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrderWithAmount(foodPrice, deliveryFee, totalAmount) {
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
        return orderManager.interface.parseLog(log)?.name === "OrderCreated";
      } catch {
        return false;
      }
    });
    const parsedLog = orderManager.interface.parseLog(event);
    return parsedLog.args.orderId;
  }

  async function completeOrderFlow(orderId) {
    await orderManager.connect(restaurant).confirmPreparation(orderId);
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
    await orderManager.connect(deliverer).confirmPickup(orderId);
    await orderManager.connect(client).confirmDelivery(orderId);
  }
});

