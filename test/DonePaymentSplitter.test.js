// TODO: Importer expect depuis chai pour les assertions
// const { expect } = require("chai");

// TODO: Importer ethers depuis hardhat pour les interactions blockchain
// const { ethers } = require("hardhat");

/**
 * Tests pour le contrat DonePaymentSplitter
 * @notice Vérifie que la répartition des paiements est correcte (70% restaurant, 20% livreur, 10% plateforme)
 * @dev Tests critiques: T3 (split automatique)
 */
describe("DonePaymentSplitter", function() {

  // === VARIABLES GLOBALES ===
  // TODO: Déclarer les variables pour le contrat
  // let paymentSplitter;
  
  // TODO: Déclarer les variables pour les comptes
  // let deployer, restaurant, deliverer, platform;

  // === SETUP AVANT CHAQUE TEST ===
  // TODO: Implémenter beforeEach pour déployer le contrat
  // beforeEach(async function() {
  //   // TODO: Récupérer les signers depuis ethers
  //   [deployer, restaurant, deliverer, platform] = await ethers.getSigners();
  //
  //   // TODO: Déployer DonePaymentSplitter
  //   const DonePaymentSplitter = await ethers.getContractFactory("DonePaymentSplitter");
  //   paymentSplitter = await DonePaymentSplitter.deploy();
  //   await paymentSplitter.deployed();
  // });

  // === TESTS T3: SPLIT DE PAIEMENT AUTOMATIQUE ===
  describe("T3: Split de paiement automatique", function() {

    it("Doit répartir 70% restaurant, 20% livreur, 10% plateforme", async function() {
      // TODO: Définir totalAmount = 100 ether
      // const totalAmount = ethers.utils.parseEther("100");
      // const orderId = 1;

      // TODO: Capturer balances avant
      // const balanceRestaurantBefore = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererBefore = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformBefore = await ethers.provider.getBalance(platform.address);

      // TODO: Appeler splitPayment avec msg.value = totalAmount
      // const tx = await paymentSplitter.splitPayment(
      //   orderId,
      //   restaurant.address,
      //   deliverer.address,
      //   platform.address,
      //   { value: totalAmount }
      // );
      // await tx.wait();

      // TODO: Capturer balances après
      // const balanceRestaurantAfter = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererAfter = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformAfter = await ethers.provider.getBalance(platform.address);

      // TODO: Vérifier restaurant reçoit 70 ether
      // const restaurantReceived = balanceRestaurantAfter.sub(balanceRestaurantBefore);
      // expect(restaurantReceived).to.equal(ethers.utils.parseEther("70"));

      // TODO: Vérifier deliverer reçoit 20 ether
      // const delivererReceived = balanceDelivererAfter.sub(balanceDelivererBefore);
      // expect(delivererReceived).to.equal(ethers.utils.parseEther("20"));

      // TODO: Vérifier platform reçoit 10 ether
      // const platformReceived = balancePlatformAfter.sub(balancePlatformBefore);
      // expect(platformReceived).to.equal(ethers.utils.parseEther("10"));

      // TODO: Vérifier event PaymentSplit émis avec bons paramètres
      // const receipt = await tx.wait();
      // const paymentSplitEvent = receipt.events.find(e => e.event === "PaymentSplit");
      // expect(paymentSplitEvent.args.orderId).to.equal(orderId);
      // expect(paymentSplitEvent.args.restaurant).to.equal(restaurant.address);
      // expect(paymentSplitEvent.args.deliverer).to.equal(deliverer.address);
      // expect(paymentSplitEvent.args.platform).to.equal(platform.address);
      // expect(paymentSplitEvent.args.restaurantAmount).to.equal(ethers.utils.parseEther("70"));
      // expect(paymentSplitEvent.args.delivererAmount).to.equal(ethers.utils.parseEther("20"));
      // expect(paymentSplitEvent.args.platformAmount).to.equal(ethers.utils.parseEther("10"));
    });

    it("Doit gérer correctement les arrondis avec montants impairs", async function() {
      // TODO: Définir totalAmount = 99 ether (montant impair)
      // const totalAmount = ethers.utils.parseEther("99");
      // const orderId = 2;

      // TODO: Capturer balances avant
      // const balanceRestaurantBefore = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererBefore = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformBefore = await ethers.provider.getBalance(platform.address);

      // TODO: Appeler splitPayment
      // const tx = await paymentSplitter.splitPayment(
      //   orderId,
      //   restaurant.address,
      //   deliverer.address,
      //   platform.address,
      //   { value: totalAmount }
      // );
      // await tx.wait();

      // TODO: Capturer balances après
      // const balanceRestaurantAfter = await ethers.provider.getBalance(restaurant.address);
      // const balanceDelivererAfter = await ethers.provider.getBalance(deliverer.address);
      // const balancePlatformAfter = await ethers.provider.getBalance(platform.address);

      // TODO: Calculer les montants reçus
      // const restaurantReceived = balanceRestaurantAfter.sub(balanceRestaurantBefore);
      // const delivererReceived = balanceDelivererAfter.sub(balanceDelivererBefore);
      // const platformReceived = balancePlatformAfter.sub(balancePlatformBefore);

      // TODO: Vérifier que totalAmount distribué = somme des 3 parts
      // const totalDistributed = restaurantReceived.add(delivererReceived).add(platformReceived);
      // expect(totalDistributed).to.equal(totalAmount);

      // TODO: Vérifier pas de fonds perdus (le contrat ne doit pas garder de fonds)
      // const contractBalance = await ethers.provider.getBalance(paymentSplitter.address);
      // expect(contractBalance).to.equal(0);
    });
  });

  // === TESTS D'ERREUR ===
  describe("Tests d'erreur", function() {

    it("Doit revert si msg.value = 0", async function() {
      // TODO: Appeler splitPayment avec msg.value = 0
      // await expect(
      //   paymentSplitter.splitPayment(
      //     1,
      //     restaurant.address,
      //     deliverer.address,
      //     platform.address,
      //     { value: 0 }
      //   )
      // ).to.be.revertedWith("PaymentSplitter: Amount must be greater than 0");
    });

    it("Doit revert si adresse restaurant est nulle", async function() {
      // TODO: Appeler splitPayment avec restaurant = address(0)
      // await expect(
      //   paymentSplitter.splitPayment(
      //     1,
      //     ethers.constants.AddressZero, // address(0)
      //     deliverer.address,
      //     platform.address,
      //     { value: ethers.utils.parseEther("100") }
      //   )
      // ).to.be.revertedWith("PaymentSplitter: Invalid restaurant address");
    });

    it("Doit revert si adresse deliverer est nulle", async function() {
      // TODO: Appeler splitPayment avec deliverer = address(0)
      // await expect(
      //   paymentSplitter.splitPayment(
      //     1,
      //     restaurant.address,
      //     ethers.constants.AddressZero, // address(0)
      //     platform.address,
      //     { value: ethers.utils.parseEther("100") }
      //   )
      // ).to.be.revertedWith("PaymentSplitter: Invalid deliverer address");
    });

    it("Doit revert si adresse platform est nulle", async function() {
      // TODO: Appeler splitPayment avec platform = address(0)
      // await expect(
      //   paymentSplitter.splitPayment(
      //     1,
      //     restaurant.address,
      //     deliverer.address,
      //     ethers.constants.AddressZero, // address(0)
      //     { value: ethers.utils.parseEther("100") }
      //   )
      // ).to.be.revertedWith("PaymentSplitter: Invalid platform address");
    });
  });

  // === TESTS DES CONSTANTES ===
  describe("Constantes de split", function() {

    it("Doit retourner RESTAURANT_PERCENT = 70", async function() {
      // TODO: Vérifier que RESTAURANT_PERCENT() retourne 70
      // expect(await paymentSplitter.RESTAURANT_PERCENT()).to.equal(70);
    });

    it("Doit retourner DELIVERER_PERCENT = 20", async function() {
      // TODO: Vérifier que DELIVERER_PERCENT() retourne 20
      // expect(await paymentSplitter.DELIVERER_PERCENT()).to.equal(20);
    });

    it("Doit retourner PLATFORM_PERCENT = 10", async function() {
      // TODO: Vérifier que PLATFORM_PERCENT() retourne 10
      // expect(await paymentSplitter.PLATFORM_PERCENT()).to.equal(10);
    });
  });
});

