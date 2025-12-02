// TODO: Importer les configurations blockchain
// const { getContractInstance, getProvider, getWallet } = require("../config/blockchain");

// TODO: Importer ethers pour les conversions et validations
// const { ethers } = require("ethers");

// TODO: Importer EventEmitter pour les notifications temps réel
// const EventEmitter = require("events");

/**
 * Service d'abstraction des interactions avec les smart contracts
 * @notice Fournit une couche d'abstraction pour toutes les opérations blockchain
 * @dev Utilise les instances de contrats configurées dans blockchain.js
 */
// TODO: Créer un EventEmitter pour les events blockchain
// const blockchainEvents = new EventEmitter();

/**
 * Crée une nouvelle commande sur la blockchain
 * @dev TODO: Implémenter la fonction createOrder
 * 
 * Étapes:
 * 1. Récupérer l'instance du contrat OrderManager
 * 2. Calculer platformFee = (foodPrice * 10) / 100
 * 3. Calculer totalAmount = foodPrice + deliveryFee + platformFee
 * 4. Connecter le wallet du client
 * 5. Appeler createOrder avec msg.value = totalAmount
 * 6. Attendre la confirmation de la transaction
 * 7. Parser les events pour récupérer orderId depuis OrderCreated
 * 8. Retourner orderId, txHash, blockNumber
 * 
 * @param {Object} params - Paramètres de la commande
 * @param {string} params.restaurantAddress - Adresse du restaurant
 * @param {string} params.foodPrice - Prix des plats en wei (BigNumber ou string)
 * @param {string} params.deliveryFee - Frais de livraison en wei
 * @param {string} params.ipfsHash - Hash IPFS des détails
 * @param {string} params.clientAddress - Adresse du client (pour connecter le wallet)
 * @param {string} params.clientPrivateKey - Clé privée du client (pour signer)
 * @returns {Promise<Object>} { orderId, txHash, blockNumber }
 */
async function createOrder(params) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Convertir les montants en BigNumber si nécessaire
    // const foodPrice = ethers.BigNumber.from(params.foodPrice);
    // const deliveryFee = ethers.BigNumber.from(params.deliveryFee);
    
    // TODO: Calculer platformFee = (foodPrice * 10) / 100
    // const platformFee = foodPrice.mul(10).div(100);
    
    // TODO: Calculer totalAmount = foodPrice + deliveryFee + platformFee
    // const totalAmount = foodPrice.add(deliveryFee).add(platformFee);
    
    // TODO: Créer un wallet signer depuis la clé privée du client
    // const provider = getProvider();
    // const clientWallet = new ethers.Wallet(params.clientPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du client
    // const orderManagerWithSigner = orderManager.connect(clientWallet);
    
    // TODO: Appeler createOrder avec msg.value = totalAmount
    // const tx = await orderManagerWithSigner.createOrder(
    //   params.restaurantAddress,
    //   foodPrice,
    //   deliveryFee,
    //   params.ipfsHash,
    //   { value: totalAmount }
    // );
    
    // TODO: Attendre la confirmation de la transaction
    // const receipt = await tx.wait();
    
    // TODO: Parser les events pour récupérer orderId depuis OrderCreated
    // const orderCreatedEvent = receipt.events.find(e => e.event === "OrderCreated");
    // const orderId = orderCreatedEvent.args.orderId.toNumber();
    
    // TODO: Émettre l'event via EventEmitter pour WebSocket
    // blockchainEvents.emit("OrderCreated", {
    //   orderId,
    //   client: params.clientAddress,
    //   restaurant: params.restaurantAddress,
    //   totalAmount: totalAmount.toString()
    // });
    
    // TODO: Retourner les résultats
    // return {
    //   orderId,
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error creating order on blockchain:", error);
    // throw error;
  }
}

/**
 * Confirme la préparation de la commande (restaurant)
 * @dev TODO: Implémenter la fonction confirmPreparation
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} restaurantAddress - Adresse du restaurant
 * @param {string} restaurantPrivateKey - Clé privée du restaurant
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function confirmPreparation(orderId, restaurantAddress, restaurantPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer depuis la clé privée du restaurant
    // const provider = getProvider();
    // const restaurantWallet = new ethers.Wallet(restaurantPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du restaurant
    // const orderManagerWithSigner = orderManager.connect(restaurantWallet);
    
    // TODO: Appeler confirmPreparation
    // const tx = await orderManagerWithSigner.confirmPreparation(orderId);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("PreparationConfirmed", { orderId, restaurant: restaurantAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error confirming preparation:", error);
    // throw error;
  }
}

/**
 * Assigne un livreur à la commande
 * @dev TODO: Implémenter la fonction assignDeliverer
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} platformPrivateKey - Clé privée de la plateforme (pour assigner)
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function assignDeliverer(orderId, delivererAddress, platformPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer depuis la clé privée de la plateforme
    // const provider = getProvider();
    // const platformWallet = new ethers.Wallet(platformPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet de la plateforme
    // const orderManagerWithSigner = orderManager.connect(platformWallet);
    
    // TODO: Appeler assignDeliverer
    // const tx = await orderManagerWithSigner.assignDeliverer(orderId, delivererAddress);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("DelivererAssigned", { orderId, deliverer: delivererAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error assigning deliverer:", error);
    // throw error;
  }
}

/**
 * Confirme la récupération de la commande (livreur)
 * @dev TODO: Implémenter la fonction confirmPickup
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function confirmPickup(orderId, delivererAddress, delivererPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer depuis la clé privée du livreur
    // const provider = getProvider();
    // const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du livreur
    // const orderManagerWithSigner = orderManager.connect(delivererWallet);
    
    // TODO: Appeler confirmPickup
    // const tx = await orderManagerWithSigner.confirmPickup(orderId);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("PickupConfirmed", { orderId, deliverer: delivererAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error confirming pickup:", error);
    // throw error;
  }
}

/**
 * Confirme la livraison et déclenche le split automatique + mint tokens
 * @dev TODO: Implémenter la fonction confirmDelivery
 * 
 * Étapes:
 * 1. Connecter wallet client
 * 2. Appeler confirmDelivery (déclenche automatiquement payment split et mint tokens dans le contrat)
 * 3. Parser les events pour récupérer tokensEarned
 * 4. Retourner txHash, blockNumber, tokensEarned
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} clientAddress - Adresse du client
 * @param {string} clientPrivateKey - Clé privée du client
 * @returns {Promise<Object>} { txHash, blockNumber, tokensEarned }
 */
async function confirmDelivery(orderId, clientAddress, clientPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer depuis la clé privée du client
    // const provider = getProvider();
    // const clientWallet = new ethers.Wallet(clientPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du client
    // const orderManagerWithSigner = orderManager.connect(clientWallet);
    
    // TODO: Appeler confirmDelivery (déclenche automatiquement split et mint dans le contrat)
    // const tx = await orderManagerWithSigner.confirmDelivery(orderId);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Parser les events pour récupérer tokensEarned (si event émis)
    // Note: Les tokens sont minés automatiquement dans le contrat, vérifier via event Transfer du token
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("DeliveryConfirmed", { orderId, client: clientAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber,
    //   tokensEarned: tokensEarned || "0" // Calculer depuis foodPrice si nécessaire
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error confirming delivery:", error);
    // throw error;
  }
}

/**
 * Ouvre un litige sur une commande
 * @dev TODO: Implémenter la fonction openDispute
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} openerAddress - Adresse de celui qui ouvre le litige (client/restaurant/deliverer)
 * @param {string} openerPrivateKey - Clé privée
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function openDispute(orderId, openerAddress, openerPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer
    // const provider = getProvider();
    // const openerWallet = new ethers.Wallet(openerPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet
    // const orderManagerWithSigner = orderManager.connect(openerWallet);
    
    // TODO: Appeler openDispute
    // const tx = await orderManagerWithSigner.openDispute(orderId);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("DisputeOpened", { orderId, opener: openerAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error opening dispute:", error);
    // throw error;
  }
}

/**
 * Résout un litige (arbitrator uniquement)
 * @dev TODO: Implémenter la fonction resolveDispute
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} winner - Adresse du gagnant (client/restaurant/deliverer)
 * @param {number} refundPercent - Pourcentage de remboursement (0-100)
 * @param {string} arbitratorAddress - Adresse de l'arbitre
 * @param {string} arbitratorPrivateKey - Clé privée de l'arbitre
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function resolveDispute(orderId, winner, refundPercent, arbitratorAddress, arbitratorPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Créer un wallet signer depuis la clé privée de l'arbitre
    // const provider = getProvider();
    // const arbitratorWallet = new ethers.Wallet(arbitratorPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet de l'arbitre
    // const orderManagerWithSigner = orderManager.connect(arbitratorWallet);
    
    // TODO: Appeler resolveDispute
    // const tx = await orderManagerWithSigner.resolveDispute(orderId, winner, refundPercent);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("DisputeResolved", { orderId, winner, refundPercent });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error resolving dispute:", error);
    // throw error;
  }
}

/**
 * Récupère les détails d'une commande depuis la blockchain (view function)
 * @dev TODO: Implémenter la fonction getOrder
 * 
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} Structure Order complète depuis la blockchain
 */
async function getOrder(orderId) {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: Appeler la fonction view orders(orderId)
    // const order = await orderManager.orders(orderId);
    
    // TODO: Convertir la structure en objet JavaScript lisible
    // return {
    //   id: order.id.toNumber(),
    //   client: order.client,
    //   restaurant: order.restaurant,
    //   deliverer: order.deliverer,
    //   foodPrice: order.foodPrice.toString(),
    //   deliveryFee: order.deliveryFee.toString(),
    //   platformFee: order.platformFee.toString(),
    //   totalAmount: order.totalAmount.toString(),
    //   status: order.status, // 0=CREATED, 1=PREPARING, 2=IN_DELIVERY, 3=DELIVERED, 4=DISPUTED
    //   ipfsHash: order.ipfsHash,
    //   createdAt: new Date(order.createdAt.toNumber() * 1000), // Convertir timestamp
    //   disputed: order.disputed,
    //   delivered: order.delivered
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting order from blockchain:", error);
    // throw error;
  }
}

/**
 * Stake un livreur (dépôt de garantie)
 * @dev TODO: Implémenter la fonction stakeDeliverer
 * 
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} amount - Montant à staker en wei
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function stakeDeliverer(delivererAddress, amount, delivererPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat Staking
    // const staking = getContractInstance("staking");
    
    // TODO: Créer un wallet signer depuis la clé privée du livreur
    // const provider = getProvider();
    // const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du livreur
    // const stakingWithSigner = staking.connect(delivererWallet);
    
    // TODO: Appeler stakeAsDeliverer avec msg.value = amount
    // const tx = await stakingWithSigner.stakeAsDeliverer({ value: amount });
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("Staked", { deliverer: delivererAddress, amount });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error staking deliverer:", error);
    // throw error;
  }
}

/**
 * Retire le stake d'un livreur
 * @dev TODO: Implémenter la fonction unstake
 * 
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function unstake(delivererAddress, delivererPrivateKey) {
  try {
    // TODO: Récupérer l'instance du contrat Staking
    // const staking = getContractInstance("staking");
    
    // TODO: Créer un wallet signer depuis la clé privée du livreur
    // const provider = getProvider();
    // const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // TODO: Connecter le contrat au wallet du livreur
    // const stakingWithSigner = staking.connect(delivererWallet);
    
    // TODO: Appeler unstake
    // const tx = await stakingWithSigner.unstake();
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("Unstaked", { deliverer: delivererAddress });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error unstaking deliverer:", error);
    // throw error;
  }
}

/**
 * Vérifie si un livreur est staké (view function)
 * @dev TODO: Implémenter la fonction isStaked
 * 
 * @param {string} delivererAddress - Adresse du livreur
 * @returns {Promise<boolean>} True si le livreur est staké
 */
async function isStaked(delivererAddress) {
  try {
    // TODO: Récupérer l'instance du contrat Staking
    // const staking = getContractInstance("staking");
    
    // TODO: Appeler la fonction view isStaked(delivererAddress)
    // const staked = await staking.isStaked(delivererAddress);
    
    // TODO: Retourner le résultat
    // return staked;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error checking staking status:", error);
    // throw error;
  }
}

/**
 * Récupère le solde de tokens DONE d'un utilisateur (view function)
 * @dev TODO: Implémenter la fonction getTokenBalance
 * 
 * @param {string} userAddress - Adresse de l'utilisateur
 * @returns {Promise<string>} Balance en ether (format lisible)
 */
async function getTokenBalance(userAddress) {
  try {
    // TODO: Récupérer l'instance du contrat Token
    // const token = getContractInstance("token");
    
    // TODO: Appeler la fonction view balanceOf(userAddress)
    // const balanceWei = await token.balanceOf(userAddress);
    
    // TODO: Convertir de wei en ether (format lisible)
    // const balanceEther = ethers.utils.formatEther(balanceWei);
    
    // TODO: Retourner la balance en ether
    // return balanceEther;
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error getting token balance:", error);
    // throw error;
  }
}

/**
 * Mint des tokens DONE pour un utilisateur
 * @dev TODO: Implémenter la fonction mintTokens
 * 
 * Note: Cette fonction doit être appelée par le backend qui a le rôle MINTER_ROLE
 * 
 * @param {string} userAddress - Adresse de l'utilisateur
 * @param {string} amount - Montant à mint en wei
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function mintTokens(userAddress, amount) {
  try {
    // TODO: Récupérer l'instance du contrat Token
    // const token = getContractInstance("token");
    
    // TODO: Utiliser le wallet backend (qui a MINTER_ROLE)
    // const wallet = getWallet();
    // const tokenWithSigner = token.connect(wallet);
    
    // TODO: Appeler mint(userAddress, amount)
    // const tx = await tokenWithSigner.mint(userAddress, amount);
    
    // TODO: Attendre la confirmation
    // const receipt = await tx.wait();
    
    // TODO: Émettre l'event via EventEmitter
    // blockchainEvents.emit("TokensMinted", { user: userAddress, amount });
    
    // TODO: Retourner les résultats
    // return {
    //   txHash: tx.hash,
    //   blockNumber: receipt.blockNumber
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error minting tokens:", error);
    // throw error;
  }
}

/**
 * Écoute les events blockchain et les émet via EventEmitter pour WebSocket
 * @dev TODO: Implémenter la fonction listenEvents
 * 
 * Events à écouter:
 * - OrderCreated, PreparationConfirmed, DelivererAssigned
 * - PickupConfirmed, DeliveryConfirmed, DisputeOpened, DisputeResolved
 * - PaymentSplit (depuis PaymentSplitter)
 * - Transfer (depuis Token pour mint)
 * 
 * @returns {Promise<void>}
 */
async function listenEvents() {
  try {
    // TODO: Récupérer l'instance du contrat OrderManager
    // const orderManager = getContractInstance("orderManager");
    
    // TODO: S'abonner à l'event OrderCreated
    // orderManager.on("OrderCreated", (orderId, client, restaurant, totalAmount, event) => {
    //   blockchainEvents.emit("OrderCreated", {
    //     orderId: orderId.toNumber(),
    //     client,
    //     restaurant,
    //     totalAmount: totalAmount.toString()
    //   });
    // });
    
    // TODO: S'abonner à l'event PreparationConfirmed
    // orderManager.on("PreparationConfirmed", (orderId, restaurant, event) => {
    //   blockchainEvents.emit("PreparationConfirmed", {
    //     orderId: orderId.toNumber(),
    //     restaurant
    //   });
    // });
    
    // TODO: S'abonner à l'event DelivererAssigned
    // orderManager.on("DelivererAssigned", (orderId, deliverer, event) => {
    //   blockchainEvents.emit("DelivererAssigned", {
    //     orderId: orderId.toNumber(),
    //     deliverer
    //   });
    // });
    
    // TODO: S'abonner à l'event PickupConfirmed
    // orderManager.on("PickupConfirmed", (orderId, deliverer, event) => {
    //   blockchainEvents.emit("PickupConfirmed", {
    //     orderId: orderId.toNumber(),
    //     deliverer
    //   });
    // });
    
    // TODO: S'abonner à l'event DeliveryConfirmed
    // orderManager.on("DeliveryConfirmed", (orderId, client, event) => {
    //   blockchainEvents.emit("DeliveryConfirmed", {
    //     orderId: orderId.toNumber(),
    //     client
    //   });
    // });
    
    // TODO: S'abonner à l'event DisputeOpened
    // orderManager.on("DisputeOpened", (orderId, opener, event) => {
    //   blockchainEvents.emit("DisputeOpened", {
    //     orderId: orderId.toNumber(),
    //     opener
    //   });
    // });
    
    // TODO: S'abonner à l'event DisputeResolved
    // orderManager.on("DisputeResolved", (orderId, winner, amount, event) => {
    //   blockchainEvents.emit("DisputeResolved", {
    //     orderId: orderId.toNumber(),
    //     winner,
    //     amount: amount.toString()
    //   });
    // });
    
    // TODO: Récupérer l'instance du contrat PaymentSplitter
    // const paymentSplitter = getContractInstance("paymentSplitter");
    
    // TODO: S'abonner à l'event PaymentSplit
    // paymentSplitter.on("PaymentSplit", (orderId, restaurant, deliverer, platform, restaurantAmount, delivererAmount, platformAmount, event) => {
    //   blockchainEvents.emit("PaymentSplit", {
    //     orderId: orderId.toNumber(),
    //     restaurant,
    //     deliverer,
    //     platform,
    //     restaurantAmount: restaurantAmount.toString(),
    //     delivererAmount: delivererAmount.toString(),
    //     platformAmount: platformAmount.toString()
    //   });
    // });
    
    // TODO: Récupérer l'instance du contrat Token
    // const token = getContractInstance("token");
    
    // TODO: S'abonner à l'event Transfer (pour détecter les mints)
    // token.on("Transfer", (from, to, amount, event) => {
    //   // Si from = address(0), c'est un mint
    //   if (from === ethers.constants.AddressZero) {
    //     blockchainEvents.emit("TokensMinted", {
    //       to,
    //       amount: amount.toString()
    //     });
    //   }
    // });
    
    // TODO: Logger que l'écoute des events est démarrée
    // console.log("Blockchain events listener started");
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error starting event listener:", error);
    // throw error;
  }
}

/**
 * Récupère l'EventEmitter pour les events blockchain
 * @dev TODO: Retourner blockchainEvents
 * @returns {EventEmitter} Instance EventEmitter
 */
function getBlockchainEvents() {
  // TODO: return blockchainEvents;
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   createOrder,
//   confirmPreparation,
//   assignDeliverer,
//   confirmPickup,
//   confirmDelivery,
//   openDispute,
//   resolveDispute,
//   getOrder,
//   stakeDeliverer,
//   unstake,
//   isStaked,
//   getTokenBalance,
//   mintTokens,
//   listenEvents,
//   getBlockchainEvents
// };

