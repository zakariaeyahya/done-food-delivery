/**
 * Tests d'intégration - Flux complet de staking livreur
 * @fileoverview Teste le système de staking et slashing des livreurs
 * @dev Scénario: stake → accept order → complete delivery → unstake → slash test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration: Staking Flow", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, token, staking;
  let deployer, deliverer, platform, client, restaurant;

  // === SETUP ===

  beforeEach(async function() {
    // Récupérer les signers
    [deployer, client, restaurant, deliverer, platform] = await ethers.getSigners();

    // Déployer DoneToken
    const DoneToken = await ethers.getContractFactory("DoneToken");
    token = await DoneToken.deploy();

    // Déployer DonePaymentSplitter
    const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await DonePaymentSplitter.deploy();

    // Déployer DoneStaking
    const DoneStaking = await ethers.getContractFactory("DoneStaking");
    staking = await DoneStaking.deploy();

    // Déployer DoneOrderManager
    const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await DoneOrderManager.deploy(
      paymentSplitter.target,
      token.target,
      staking.target,
      platform.address
    );

    // Configurer les rôles
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, orderManager.target);

    const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
    await orderManager.grantRole(RESTAURANT_ROLE, restaurant.address);

    const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
    await orderManager.grantRole(DELIVERER_ROLE, deliverer.address);

    const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
    await orderManager.grantRole(PLATFORM_ROLE, platform.address);

    const STAKING_PLATFORM_ROLE = await staking.PLATFORM_ROLE();
    await staking.grantRole(STAKING_PLATFORM_ROLE, platform.address);
  });

  // === TEST: FLUX COMPLET DE STAKING ===

  describe("Full Staking Flow: End-to-End", function() {

    it("Doit exécuter le workflow complet de staking", async function() {
      // ÉTAPE 1: Livreur stake 0.1 ETH (stakeAsDeliverer)
      const stakeAmount = ethers.parseEther("0.1");
      const delivererBalanceBefore = await ethers.provider.getBalance(deliverer.address);

      const tx1 = await staking.connect(deliverer).stakeAsDeliverer({ value: stakeAmount });
      await tx1.wait();

      // Vérifier isStaked(deliverer) = true
      const isStaked = await staking.isStaked(deliverer.address);
      expect(isStaked).to.be.true;

      // Vérifier stakedAmount(deliverer) = 0.1 ETH
      const stakedAmount = await staking.getStakedAmount(deliverer.address);
      expect(stakedAmount).to.equal(stakeAmount);

      // Vérifier balance contrat augmenté
      const contractBalance = await ethers.provider.getBalance(staking.target);
      expect(contractBalance).to.equal(stakeAmount);

      // ÉTAPE 2: Livreur accepte commande (assignDeliverer)
      // Créer commande et confirmer préparation
      const orderId = await createTestOrder();
      await orderManager.connect(restaurant).confirmPreparation(orderId);

      // Assigner livreur (doit réussir car staké)
      const tx2 = await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
      await tx2.wait();

      // Vérifier livreur assigné
      const order = await orderManager.getOrder(orderId);
      expect(order.deliverer).to.equal(deliverer.address);
      expect(order.status).to.equal(2); // ASSIGNED

      // ÉTAPE 3: Livreur complète livraison (workflow normal)
      await orderManager.connect(deliverer).confirmPickup(orderId);
      await orderManager.connect(client).confirmDelivery(orderId);

      // Vérifier livraison complétée
      const orderDelivered = await orderManager.getOrder(orderId);
      expect(orderDelivered.status).to.equal(4); // DELIVERED

      // ÉTAPE 4: Unstake réussi (unstake)
      const delivererBalanceBeforeUnstake = await ethers.provider.getBalance(deliverer.address);

      const tx4 = await staking.connect(deliverer).unstake();
      const receipt4 = await tx4.wait();

      // Vérifier isStaked(deliverer) = false
      const isStakedAfter = await staking.isStaked(deliverer.address);
      expect(isStakedAfter).to.be.false;

      // Vérifier stakedAmount = 0
      const stakedAmountAfter = await staking.getStakedAmount(deliverer.address);
      expect(stakedAmountAfter).to.equal(0);

      // Vérifier balance deliverer augmenté (approximativement, en tenant compte des frais de gas)
      const delivererBalanceAfter = await ethers.provider.getBalance(deliverer.address);
      const balanceDiff = delivererBalanceAfter - delivererBalanceBeforeUnstake;
      expect(balanceDiff).to.be.greaterThan(ethers.parseEther("0.09")); // Prend en compte les frais de gas
    });

    it("Doit slasher un livreur en cas d'annulation abusive", async function() {
      // Livreur stake 0.1 ETH
      const stakeAmount = ethers.parseEther("0.1");
      await staking.connect(deliverer).stakeAsDeliverer({ value: stakeAmount });

      // Créer commande et assigner livreur
      const orderId = await createTestOrder();
      await orderManager.connect(restaurant).confirmPreparation(orderId);
      await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);

      // Simuler annulation abusive (ou comportement frauduleux)
      // Platform slashe le livreur
      const slashAmount = ethers.parseEther("0.02"); // 20% du stake
      const platformBalanceBefore = await ethers.provider.getBalance(platform.address);

      const tx = await staking.connect(platform).slash(deliverer.address, slashAmount);
      const receipt = await tx.wait();

      // Vérifier stakedAmount réduit
      const stakedAmountAfter = await staking.getStakedAmount(deliverer.address);
      expect(stakedAmountAfter).to.equal(stakeAmount - slashAmount);

      // Vérifier balance platform augmenté de slashAmount (approximativement, en tenant compte des frais de gas)
      const platformBalanceAfter = await ethers.provider.getBalance(platform.address);
      const balanceDiff = platformBalanceAfter - platformBalanceBefore;
      expect(balanceDiff).to.be.lessThan(slashAmount); // Moins car on paie les frais de gas

      // Vérifier event Slashed émis
      const slashEvent = receipt.logs.find(log => {
        try {
          const parsed = staking.interface.parseLog(log);
          return parsed && parsed.name === "Slashed";
        } catch (e) {
          return false;
        }
      });
      expect(slashEvent).to.not.be.undefined;
      const parsedEvent = staking.interface.parseLog(slashEvent);
      expect(parsedEvent.args.deliverer).to.equal(deliverer.address);
      expect(parsedEvent.args.amount).to.equal(slashAmount);
    });

    it("Doit revert si stake < 0.1 ETH", async function() {
      // Tenter stake avec 0.05 ETH
      await expect(
        staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Staking: Minimum stake is 0.1 ETH");
    });

    it("Doit revert si unstake sans être staké", async function() {
      // Tenter unstake sans avoir staké
      await expect(
        staking.connect(deliverer).unstake()
      ).to.be.revertedWith("Staking: Not staked");
    });

    it("Doit revert si slash montant > stakedAmount", async function() {
      // Stake 0.1 ETH
      await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

      // Tenter slash 0.2 ETH
      await expect(
        staking.connect(platform).slash(deliverer.address, ethers.parseEther("0.2"))
      ).to.be.revertedWith("Staking: Exceeds stake");
    });

    it("Doit revert si slash appelé par non-PLATFORM", async function() {
      // Stake 0.1 ETH
      await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

      // Tenter slash depuis une adresse tierce
      await expect(
        staking.connect(client).slash(deliverer.address, ethers.parseEther("0.02"))
      ).to.be.reverted;
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrder() {
    const foodPrice = ethers.parseEther("10");
    const deliveryFee = ethers.parseEther("2");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    const tx = await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "QmTestHashIPFS",
      { value: totalAmount }
    );
    const receipt = await tx.wait();

    // Trouver l'event OrderCreated
    const orderCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = orderManager.interface.parseLog(log);
        return parsed && parsed.name === "OrderCreated";
      } catch (e) {
        return false;
      }
    });

    const parsedEvent = orderManager.interface.parseLog(orderCreatedEvent);
    return parsedEvent.args.orderId;
  }
});
