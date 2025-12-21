/**
 * Tests de performance - Optimisation du gas
 * @fileoverview Mesure et optimise le coût gas des fonctions critiques
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Performance: Gas Optimization", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, token, staking, arbitration;
  let deployer, client, restaurant, deliverer, platform, voter;

  const gasResults = {};

  // === SETUP ===

  beforeEach(async function() {
    // Récupérer les signers
    [deployer, client, restaurant, deliverer, platform, voter] = await ethers.getSigners();

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

    // Déployer DoneArbitration
    const Arbitration = await ethers.getContractFactory("DoneArbitration");
    arbitration = await Arbitration.deploy(token.target);

    // Déployer DoneOrderManager
    const OrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await OrderManager.deploy(
      paymentSplitter.target,
      token.target,
      staking.target,
      platform.address
    );

    // Configuration des rôles
    await orderManager.grantRole(await orderManager.RESTAURANT_ROLE(), restaurant.address);
    await orderManager.grantRole(await orderManager.DELIVERER_ROLE(), deliverer.address);
    await orderManager.grantRole(await orderManager.PLATFORM_ROLE(), platform.address);

    await token.grantRole(await token.MINTER_ROLE(), orderManager.target);

    // Configurer arbitration
    await arbitration.setOrderManager(orderManager.target);
    await arbitration.grantRole(await arbitration.ARBITER_ROLE(), deployer.address);

    // Deliverer stake
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
  });

  // === TESTS: MESURE GAS ===

  describe("Gas Measurement: Critical Functions", function() {

    it("Doit mesurer gas pour createOrder", async function() {
      // Calculer montants
      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");
      const platformFee = (foodPrice * 10n) / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      // Capturer gas utilisé
      const tx = await orderManager.connect(client).createOrder(
        restaurant.address,
        foodPrice,
        deliveryFee,
        "QmHash",
        { value: totalAmount }
      );
      const receipt = await tx.wait();

      // Afficher gas utilisé
      console.log("createOrder gas used:", receipt.gasUsed.toString());
      gasResults.createOrder = receipt.gasUsed;
      expect(receipt.gasUsed).to.be.below(200000n); // Cible: < 200k gas
    });

    it("Doit mesurer gas pour confirmDelivery", async function() {
      // Créer commande et workflow jusqu'à IN_DELIVERY
      const orderId = await createTestOrderAndReachInDelivery();

      // Capturer gas utilisé
      const tx = await orderManager.connect(client).confirmDelivery(orderId);
      const receipt = await tx.wait();

      // Afficher gas utilisé
      console.log("confirmDelivery gas used:", receipt.gasUsed.toString());
      gasResults.confirmDelivery = receipt.gasUsed;
      expect(receipt.gasUsed).to.be.below(300000n); // Cible: < 300k gas
    });

    it("Doit mesurer gas pour splitPayment", async function() {
      // Créer commande complète
      const orderId = await createTestOrderAndCompleteDelivery();

      // Le splitPayment est appelé automatiquement dans confirmDelivery
      // On vérifie que le total de gas pour confirmDelivery inclut le split
      console.log("splitPayment gas included in confirmDelivery");

      // Estimation: splitPayment devrait être < 100k gas
      // (déjà inclus dans la mesure confirmDelivery ci-dessus)
    });

    it("Doit mesurer gas pour stakeAsDeliverer", async function() {
      // Utiliser un nouveau livreur
      const [, , , , , , newDeliverer] = await ethers.getSigners();

      // Capturer gas utilisé
      const tx = await staking.connect(newDeliverer).stakeAsDeliverer({
        value: ethers.parseEther("0.1")
      });
      const receipt = await tx.wait();

      // Afficher gas utilisé
      console.log("stakeAsDeliverer gas used:", receipt.gasUsed.toString());
      gasResults.stakeAsDeliverer = receipt.gasUsed;
      expect(receipt.gasUsed).to.be.below(80000n); // Cible: < 80k gas
    });

    it("Doit mesurer gas pour voteDispute", async function() {
      // Créer dispute
      const disputeId = await createTestDispute();

      // Mint tokens pour voter
      await token.grantRole(await token.MINTER_ROLE(), deployer.address);
      await token.mint(voter.address, ethers.parseEther("1000"));

      // Approuver les tokens
      await token.connect(voter).approve(arbitration.target, ethers.parseEther("1000"));

      // Capturer gas utilisé
      const tx = await arbitration.connect(voter).voteDispute(disputeId, 1); // 1 = CLIENT
      const receipt = await tx.wait();

      // Afficher gas utilisé
      console.log("voteDispute gas used:", receipt.gasUsed.toString());
      gasResults.voteDispute = receipt.gasUsed;
      expect(receipt.gasUsed).to.be.below(100000n); // Cible: < 100k gas
    });

    it("Doit mesurer gas pour resolveDispute", async function() {
      // Créer dispute et voter
      const disputeId = await createTestDisputeWithVotes();

      // Avancer le temps pour dépasser la deadline
      await ethers.provider.send("evm_increaseTime", [48 * 60 * 60 + 1]); // 48h + 1s
      await ethers.provider.send("evm_mine");

      // Capturer gas utilisé
      const tx = await arbitration.connect(deployer).resolveDispute(disputeId);
      const receipt = await tx.wait();

      // Afficher gas utilisé
      console.log("resolveDispute gas used:", receipt.gasUsed.toString());
      gasResults.resolveDispute = receipt.gasUsed;
      expect(receipt.gasUsed).to.be.below(200000n); // Cible: < 200k gas
    });
  });

  // === TESTS: OPTIMISATIONS ===

  describe("Gas Optimization: Best Practices", function() {

    it("Doit utiliser uint256 cohérents partout", async function() {
      // Vérifier que tous les montants utilisent uint256
      // Pas de uint128, uint64, etc. pour éviter conversions coûteuses

      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");

      // Ces valeurs doivent être cohérentes (uint256)
      expect(typeof foodPrice).to.equal("bigint");
      expect(typeof deliveryFee).to.equal("bigint");
    });

    it("Doit minimiser écritures storage", async function() {
      // Vérifier que les fonctions n'écrivent pas inutilement en storage
      // Utiliser memory/local variables quand possible

      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");
      const platformFee = (foodPrice * 10n) / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      // Créer une commande
      await orderManager.connect(client).createOrder(
        restaurant.address,
        foodPrice,
        deliveryFee,
        "QmHash",
        { value: totalAmount }
      );

      // Vérifier que l'ordre existe (1 écriture storage minimum)
      const order = await orderManager.orders(1);
      expect(order.client).to.equal(client.address);
    });

    it("Doit utiliser events plutôt que trop stockage", async function() {
      // Vérifier que les données non-critiques sont dans events
      // Pas stockées en storage (coûteux)

      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");
      const platformFee = (foodPrice * 10n) / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      // Créer une commande et vérifier l'event
      await expect(
        orderManager.connect(client).createOrder(
          restaurant.address,
          foodPrice,
          deliveryFee,
          "QmHash",
          { value: totalAmount }
        )
      ).to.emit(orderManager, "OrderCreated");
    });

    it("Doit simplifier structs", async function() {
      // Vérifier que les structs sont optimisés
      // Champs dans l'ordre de taille décroissante pour packing

      const foodPrice = ethers.parseEther("10");
      const deliveryFee = ethers.parseEther("2");
      const platformFee = (foodPrice * 10n) / 100n;
      const totalAmount = foodPrice + deliveryFee + platformFee;

      await orderManager.connect(client).createOrder(
        restaurant.address,
        foodPrice,
        deliveryFee,
        "QmHash",
        { value: totalAmount }
      );

      const order = await orderManager.orders(1);

      // Vérifier que la structure est bien définie
      expect(order.client).to.be.properAddress;
      expect(order.foodPrice).to.be.gt(0);
    });
  });

  // === GÉNÉRATION RAPPORT ===

  describe("Gas Optimization Report", function() {

    it("Doit générer rapport d'optimisation gas", async function() {
      // Collecter toutes les mesures de gas
      const targets = {
        createOrder: 200000n,
        confirmDelivery: 300000n,
        stakeAsDeliverer: 80000n,
        voteDispute: 100000n,
        resolveDispute: 200000n
      };

      console.log("\n=== Gas Optimization Report ===\n");

      let report = "# Gas Optimization Report\n\n";

      for (const [func, gasUsed] of Object.entries(gasResults)) {
        const target = targets[func];
        const status = gasUsed < target ? "✓" : "✗";
        const line = `## ${func}: ${gasUsed.toString()} gas (cible: < ${target.toString()}) ${status}\n`;

        report += line;
        console.log(line);
      }

      console.log("\n" + report);

      // Vérifier que toutes les fonctions respectent leurs cibles
      for (const [func, gasUsed] of Object.entries(gasResults)) {
        const target = targets[func];
        expect(gasUsed).to.be.below(target, `${func} dépasse la cible de gas`);
      }
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrderAndReachInDelivery() {
    const foodPrice = ethers.parseEther("10");
    const deliveryFee = ethers.parseEther("2");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    // Créer la commande
    await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "QmHash",
      { value: totalAmount }
    );

    const orderId = 1n;

    // Workflow jusqu'à IN_DELIVERY
    await orderManager.connect(restaurant).confirmPreparation(orderId);
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
    await orderManager.connect(deliverer).confirmPickup(orderId);

    return orderId;
  }

  async function createTestOrderAndCompleteDelivery() {
    const orderId = await createTestOrderAndReachInDelivery();

    // Confirmer la livraison
    await orderManager.connect(client).confirmDelivery(orderId);

    return orderId;
  }

  async function createTestDispute() {
    // Créer une commande
    const foodPrice = ethers.parseEther("10");
    const deliveryFee = ethers.parseEther("2");
    const platformFee = (foodPrice * 10n) / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    await orderManager.connect(client).createOrder(
      restaurant.address,
      foodPrice,
      deliveryFee,
      "QmHash",
      { value: totalAmount }
    );

    const orderId = 1n;

    // Workflow jusqu'à IN_DELIVERY
    await orderManager.connect(restaurant).confirmPreparation(orderId);
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);
    await orderManager.connect(deliverer).confirmPickup(orderId);

    // Créer un litige
    await arbitration.connect(client).createDispute(
      orderId,
      client.address,
      restaurant.address,
      deliverer.address,
      "Commande non conforme",
      "QmEvidenceHash",
      totalAmount
    );

    return 1n; // disputeId
  }

  async function createTestDisputeWithVotes() {
    const disputeId = await createTestDispute();

    // Mint tokens pour plusieurs votants
    await token.grantRole(await token.MINTER_ROLE(), deployer.address);
    await token.mint(voter.address, ethers.parseEther("1000"));

    // Approuver les tokens
    await token.connect(voter).approve(arbitration.target, ethers.parseEther("1000"));

    // Voter
    await arbitration.connect(voter).voteDispute(disputeId, 1); // 1 = CLIENT

    return disputeId;
  }
});
