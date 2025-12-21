/**
 * Tests d'intégration - Flux complet de litige
 * @fileoverview Teste le workflow complet d'un litige avec arbitrage décentralisé
 * @dev Scénario: openDispute → funds frozen → arbitrators vote → resolveDispute → funds released
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration: Dispute Flow", function() {

  // === VARIABLES GLOBALES ===

  let orderManager, paymentSplitter, token, staking, arbitration;

  let deployer, client, restaurant, deliverer, platform, arbitrator, voter1, voter2;

  // === SETUP AVANT CHAQUE TEST ===

  beforeEach(async function() {
    // Récupérer les signers depuis ethers
    [deployer, client, restaurant, deliverer, platform, arbitrator, voter1, voter2] = await ethers.getSigners();

    // Déployer DoneToken
    const DoneToken = await ethers.getContractFactory("DoneToken");
    token = await DoneToken.deploy();
    await token.waitForDeployment();

    // Déployer DonePaymentSplitter
    const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
    paymentSplitter = await DonePaymentSplitter.deploy();
    await paymentSplitter.waitForDeployment();

    // Déployer DoneStaking
    const DoneStaking = await ethers.getContractFactory("DoneStaking");
    staking = await DoneStaking.deploy();
    await staking.waitForDeployment();

    // Déployer DoneOrderManager avec toutes les adresses
    const DoneOrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await DoneOrderManager.deploy(
      await paymentSplitter.getAddress(),
      await token.getAddress(),
      await staking.getAddress()
    );
    await orderManager.waitForDeployment();

    // Déployer DoneArbitration
    const DoneArbitration = await ethers.getContractFactory("DoneArbitration");
    arbitration = await DoneArbitration.deploy(
      await token.getAddress(),
      await orderManager.getAddress()
    );
    await arbitration.waitForDeployment();

    // Configurer les rôles
    // Accorder MINTER_ROLE à OrderManager
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await orderManager.getAddress());

    // Accorder RESTAURANT_ROLE à restaurant
    const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
    await orderManager.grantRole(RESTAURANT_ROLE, restaurant.address);

    // Accorder DELIVERER_ROLE à deliverer
    const DELIVERER_ROLE = await orderManager.DELIVERER_ROLE();
    await orderManager.grantRole(DELIVERER_ROLE, deliverer.address);

    // Accorder PLATFORM_ROLE à platform
    const PLATFORM_ROLE = await orderManager.PLATFORM_ROLE();
    await orderManager.grantRole(PLATFORM_ROLE, platform.address);

    // Accorder ARBITRATOR_ROLE à arbitrator dans DoneArbitration
    const ARBITRATOR_ROLE = await arbitration.ARBITRATOR_ROLE();
    await arbitration.grantRole(ARBITRATOR_ROLE, arbitrator.address);
  });

  // === TEST: FLUX COMPLET DE LITIGE ===

  describe("Full Dispute Flow: End-to-End", function() {

    it("Doit exécuter le workflow complet de litige", async function() {
      // ÉTAPE 1: Créer commande et workflow jusqu'à IN_DELIVERY
      const orderId = await createTestOrderAndReachInDelivery();

      // Capturer balances avant litige
      const contractBalanceBefore = await ethers.provider.getBalance(await orderManager.getAddress());
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      // ÉTAPE 2: Client ouvre litige (openDispute)
      const tx1 = await orderManager.connect(client).openDispute(
        orderId,
        "Commande non reçue",
        "QmEvidenceHash"
      );
      const receipt1 = await tx1.wait();

      // Vérifier statut = DISPUTED
      const order1 = await orderManager.getOrder(orderId);
      expect(order1.status).to.equal(4); // DISPUTED = 4
      expect(order1.disputed).to.be.true;

      // Vérifier event DisputeOpened émis
      const disputeEvent = receipt1.logs.find(log => {
        try {
          const parsed = orderManager.interface.parseLog(log);
          return parsed && parsed.name === "DisputeOpened";
        } catch {
          return false;
        }
      });
      expect(disputeEvent).to.not.be.undefined;

      // ÉTAPE 3: Vérifier fonds gelés (frozen)
      // Vérifier que confirmDelivery revert si litige ouvert
      await expect(
        orderManager.connect(client).confirmDelivery(orderId)
      ).to.be.revertedWith("Order is disputed");

      // Vérifier que les fonds restent bloqués dans le contrat
      const contractBalanceAfter = await ethers.provider.getBalance(await orderManager.getAddress());
      expect(contractBalanceAfter).to.equal(contractBalanceBefore);

      // ÉTAPE 4: Créer dispute dans DoneArbitration
      const disputeTx = await arbitration.connect(client).createDispute(
        orderId,
        "Commande non reçue",
        "QmEvidenceHash"
      );
      const disputeReceipt = await disputeTx.wait();

      // Extraire disputeId depuis event DisputeCreated
      const disputeCreatedEvent = disputeReceipt.logs.find(log => {
        try {
          const parsed = arbitration.interface.parseLog(log);
          return parsed && parsed.name === "DisputeCreated";
        } catch {
          return false;
        }
      });
      const disputeId = arbitration.interface.parseLog(disputeCreatedEvent).args.disputeId;

      // Vérifier dispute créé
      const dispute = await arbitration.getDispute(disputeId);
      expect(dispute.orderId).to.equal(orderId);
      expect(dispute.status).to.equal(1); // VOTING = 1

      // ÉTAPE 5: Arbitres votent (voteDispute)
      // Mint tokens DONE aux votants pour avoir voting power
      await token.mint(voter1.address, ethers.parseEther("1000")); // 1000 DONE
      await token.mint(voter2.address, ethers.parseEther("500"));  // 500 DONE

      // Voter pour CLIENT (1)
      const vote1Tx = await arbitration.connect(voter1).voteDispute(disputeId, 1); // CLIENT
      await vote1Tx.wait();

      // Voter pour RESTAURANT (2)
      const vote2Tx = await arbitration.connect(voter2).voteDispute(disputeId, 2); // RESTAURANT
      await vote2Tx.wait();

      // Vérifier distribution des votes
      const voteDistribution = await arbitration.getVoteDistribution(disputeId);
      expect(voteDistribution.clientVotes).to.equal(ethers.parseEther("1000"));
      expect(voteDistribution.restaurantVotes).to.equal(ethers.parseEther("500"));

      // Vérifier leadingWinner = CLIENT
      const disputeAfterVote = await arbitration.getDispute(disputeId);
      expect(disputeAfterVote.leadingWinner).to.equal(1); // CLIENT = 1

      // ÉTAPE 6: Résoudre litige (resolveDispute)
      // Attendre fin période de vote (ou simuler)
      const resolveTx = await arbitration.connect(arbitrator).resolveDispute(disputeId);
      const resolveReceipt = await resolveTx.wait();

      // Vérifier dispute résolu
      const disputeResolved = await arbitration.getDispute(disputeId);
      expect(disputeResolved.status).to.equal(2); // RESOLVED = 2

      // Vérifier event DisputeResolved émis
      const resolvedEvent = resolveReceipt.logs.find(log => {
        try {
          const parsed = arbitration.interface.parseLog(log);
          return parsed && parsed.name === "DisputeResolved";
        } catch {
          return false;
        }
      });
      expect(resolvedEvent).to.not.be.undefined;
      const parsedResolvedEvent = arbitration.interface.parseLog(resolvedEvent);
      expect(parsedResolvedEvent.args.disputeId).to.equal(disputeId);
      expect(parsedResolvedEvent.args.winner).to.equal(1); // CLIENT

      // ÉTAPE 7: Vérifier fonds libérés au gagnant (CLIENT)
      // Vérifier balance client augmenté (remboursement 100%)
      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      const refundAmount = contractBalanceBefore; // 100% du totalAmount
      expect(clientBalanceAfter - clientBalanceBefore).to.be.greaterThan(0);

      // Vérifier que les fonds sont retirés du contrat
      const contractBalanceFinal = await ethers.provider.getBalance(await orderManager.getAddress());
      expect(contractBalanceFinal).to.equal(0n);
    });

    it("Doit résoudre litige en faveur du restaurant", async function() {
      // Créer commande, ouvrir litige
      const orderId = await createTestOrderAndReachInDelivery();
      await orderManager.connect(client).openDispute(orderId, "Raison", "QmHash");

      // Capturer balance restaurant avant
      const restaurantBalanceBefore = await ethers.provider.getBalance(restaurant.address);
      const contractBalanceBefore = await ethers.provider.getBalance(await orderManager.getAddress());

      // Créer dispute dans arbitration
      const disputeTx = await arbitration.connect(client).createDispute(orderId, "Raison", "QmHash");
      const disputeId = await extractDisputeId(disputeTx);

      // Voter majoritairement pour RESTAURANT
      await token.mint(voter1.address, ethers.parseEther("2000"));
      await arbitration.connect(voter1).voteDispute(disputeId, 2); // RESTAURANT

      // Résoudre litige
      await arbitration.connect(arbitrator).resolveDispute(disputeId);

      // Vérifier restaurant reçoit 70% (paiement normal)
      const restaurantBalanceAfter = await ethers.provider.getBalance(restaurant.address);
      const expectedAmount = contractBalanceBefore * 70n / 100n;
      expect(restaurantBalanceAfter - restaurantBalanceBefore).to.be.greaterThan(0);
    });

    it("Doit revert si openDispute appelé après livraison", async function() {
      // Workflow complet jusqu'à DELIVERED
      const orderId = await createTestOrderAndCompleteDelivery();

      // Tenter ouvrir litige
      await expect(
        orderManager.connect(client).openDispute(orderId, "Raison", "QmHash")
      ).to.be.revertedWith("Cannot dispute delivered order");
    });

    it("Doit revert si resolveDispute appelé par non-arbitrator", async function() {
      // Créer dispute
      const disputeId = await createTestDispute();

      // Tenter résoudre depuis une adresse tierce
      await expect(
        arbitration.connect(client).resolveDispute(disputeId)
      ).to.be.reverted;
    });
  });

  // === HELPER FUNCTIONS ===

  async function createTestOrderAndReachInDelivery() {
    // Calculer les montants
    const foodPrice = ethers.parseEther("10");
    const deliveryFee = ethers.parseEther("2");
    const platformFee = foodPrice * 10n / 100n;
    const totalAmount = foodPrice + deliveryFee + platformFee;

    // Créer commande
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
        const parsed = orderManager.interface.parseLog(log);
        return parsed && parsed.name === "OrderCreated";
      } catch {
        return false;
      }
    });
    const orderId = orderManager.interface.parseLog(event).args.orderId;

    // Confirmer préparation
    await orderManager.connect(restaurant).confirmPreparation(orderId);

    // Livreur stake
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

    // Assigner livreur
    await orderManager.connect(platform).assignDeliverer(orderId, deliverer.address);

    // Confirmer pickup
    await orderManager.connect(deliverer).confirmPickup(orderId);

    return orderId;
  }

  async function createTestOrderAndCompleteDelivery() {
    const orderId = await createTestOrderAndReachInDelivery();

    // Confirmer livraison
    await orderManager.connect(client).confirmDelivery(orderId);

    return orderId;
  }

  async function extractDisputeId(tx) {
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = arbitration.interface.parseLog(log);
        return parsed && parsed.name === "DisputeCreated";
      } catch {
        return false;
      }
    });
    return arbitration.interface.parseLog(event).args.disputeId;
  }

  async function createTestDispute() {
    // Créer commande jusqu'à IN_DELIVERY
    const orderId = await createTestOrderAndReachInDelivery();

    // Ouvrir litige
    await orderManager.connect(client).openDispute(orderId, "Raison", "QmHash");

    // Créer dispute dans arbitration
    const disputeTx = await arbitration.connect(client).createDispute(orderId, "Raison", "QmHash");
    const disputeId = await extractDisputeId(disputeTx);

    return disputeId;
  }
});
