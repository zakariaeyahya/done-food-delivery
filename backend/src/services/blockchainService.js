const { getContractInstance, getProvider, getWallet } = require("../config/blockchain");
const { ethers } = require("ethers");
const EventEmitter = require("events");

/**
 * Service d'abstraction des interactions avec les smart contracts
 * @notice Fournit une couche d'abstraction pour toutes les opérations blockchain
 * @dev Utilise les instances de contrats configurées dans blockchain.js
 */
const blockchainEvents = new EventEmitter();

/**
 * Crée une nouvelle commande sur la blockchain
 * @param {Object} params - Paramètres de la commande
 * @param {string} params.restaurantAddress - Adresse du restaurant
 * @param {string} params.foodPrice - Prix des plats en wei (string ou BigNumber)
 * @param {string} params.deliveryFee - Frais de livraison en wei
 * @param {string} params.ipfsHash - Hash IPFS des détails
 * @param {string} params.clientAddress - Adresse du client
 * @param {string} params.clientPrivateKey - Clé privée du client (pour signer)
 * @returns {Promise<Object>} { orderId, txHash, blockNumber }
 */
async function createOrder(params) {
  try {
    // En mode test, toujours utiliser des données mock pour éviter les problèmes de fonds/blockchain
    if (process.env.NODE_ENV === 'test' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.NODE_ENV === 'development') {
      // Générer un orderId unique en trouvant le prochain disponible
      let mockOrderId;
      try {
        const Order = require("../models/Order");
        // Trouver le dernier orderId utilisé
        const lastOrder = await Order.findOne().sort({ orderId: -1 }).limit(1);
        const lastOrderId = lastOrder ? lastOrder.orderId : 0;
        // Utiliser le suivant (au moins 100000 pour éviter les conflits avec le seed)
        mockOrderId = Math.max(lastOrderId + 1, 100000);
      } catch (error) {
        // Si erreur (DB non disponible), utiliser un timestamp-based ID
        console.warn("Could not query database for last orderId, using timestamp-based ID:", error.message);
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        mockOrderId = parseInt(`${timestamp}${random}`.slice(-10)) || Math.floor(Math.random() * 1000000) + 100000;
      }
      
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      console.log('⚠️  Using mock blockchain (test/dev mode):', { orderId: mockOrderId, txHash: mockTxHash });

      blockchainEvents.emit("OrderCreated", {
        orderId: mockOrderId,
        client: params.clientAddress,
        restaurant: params.restaurantAddress,
        totalAmount: ethers.parseEther(params.foodPrice.toString()).toString()
      });

      return {
        orderId: mockOrderId,
        txHash: mockTxHash,
        blockNumber: 12345678
      };
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Convertir les montants en BigNumber si nécessaire
    const foodPrice = ethers.parseEther(params.foodPrice.toString());
    const deliveryFee = ethers.parseEther(params.deliveryFee.toString());
    
    // Calculer platformFee = (foodPrice * 10) / 100
    const platformFee = (foodPrice * BigInt(10)) / BigInt(100);
    
    // Calculer totalAmount = foodPrice + deliveryFee + platformFee
    const totalAmount = foodPrice + deliveryFee + platformFee;
    
    // Créer un wallet signer depuis la clé privée du client
    const clientWallet = new ethers.Wallet(params.clientPrivateKey, provider);
    
    // Connecter le contrat au wallet du client
    const orderManagerWithSigner = orderManager.connect(clientWallet);
    
    // Appeler createOrder avec msg.value = totalAmount
    const tx = await orderManagerWithSigner.createOrder(
      params.restaurantAddress,
      foodPrice,
      deliveryFee,
      params.ipfsHash,
      { value: totalAmount }
    );
    
    // Attendre la confirmation de la transaction
    const receipt = await tx.wait();
    
    // Parser les events pour récupérer orderId depuis OrderCreated
    const orderCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = orderManager.interface.parseLog(log);
        return parsed && parsed.name === "OrderCreated";
      } catch {
        return false;
      }
    });
    
    let orderId;
    if (orderCreatedEvent) {
      const parsed = orderManager.interface.parseLog(orderCreatedEvent);
      orderId = Number(parsed.args.orderId);
    } else {
      // Fallback: chercher dans tous les logs
      for (const log of receipt.logs) {
        try {
          const parsed = orderManager.interface.parseLog(log);
          if (parsed && parsed.name === "OrderCreated") {
            orderId = Number(parsed.args.orderId);
            break;
          }
        } catch {}
      }
    }
    
    if (!orderId) {
      throw new Error("OrderCreated event not found in transaction receipt");
    }
    
    // Émettre l'event via EventEmitter pour WebSocket
    blockchainEvents.emit("OrderCreated", {
      orderId,
      client: params.clientAddress,
      restaurant: params.restaurantAddress,
      totalAmount: totalAmount.toString()
    });
    
    // Retourner les résultats
    return {
      orderId,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error creating order on blockchain:", error);
    throw error;
  }
}

/**
 * Confirme la préparation de la commande (restaurant)
 * @param {number} orderId - ID de la commande
 * @param {string} restaurantAddress - Adresse du restaurant
 * @param {string} restaurantPrivateKey - Clé privée du restaurant
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function confirmPreparation(orderId, restaurantAddress, restaurantPrivateKey) {
  try {
    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée du restaurant
    const restaurantWallet = new ethers.Wallet(restaurantPrivateKey, provider);
    
    // Connecter le contrat au wallet du restaurant
    const orderManagerWithSigner = orderManager.connect(restaurantWallet);
    
    // Appeler confirmPreparation
    const tx = await orderManagerWithSigner.confirmPreparation(orderId);
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("PreparationConfirmed", { orderId, restaurant: restaurantAddress });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error confirming preparation:", error);
    throw error;
  }
}

/**
 * Assigne un livreur à la commande
 * @param {number} orderId - ID de la commande
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} platformPrivateKey - Clé privée de la plateforme (pour assigner)
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function assignDeliverer(orderId, delivererAddress, platformPrivateKey) {
  try {
    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée de la plateforme
    const platformWallet = new ethers.Wallet(platformPrivateKey, provider);
    
    // Connecter le contrat au wallet de la plateforme
    const orderManagerWithSigner = orderManager.connect(platformWallet);
    
    // Appeler assignDeliverer
    const tx = await orderManagerWithSigner.assignDeliverer(orderId, delivererAddress);
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("DelivererAssigned", { orderId, deliverer: delivererAddress });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error assigning deliverer:", error);
    throw error;
  }
}

/**
 * Confirme la récupération de la commande (livreur)
 * @param {number} orderId - ID de la commande
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function confirmPickup(orderId, delivererAddress, delivererPrivateKey) {
  try {
    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée du livreur
    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // Connecter le contrat au wallet du livreur
    const orderManagerWithSigner = orderManager.connect(delivererWallet);
    
    // Appeler confirmPickup
    const tx = await orderManagerWithSigner.confirmPickup(orderId);
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("PickupConfirmed", { orderId, deliverer: delivererAddress });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error confirming pickup:", error);
    throw error;
  }
}

/**
 * Confirme la livraison et déclenche le split automatique + mint tokens
 * @param {number} orderId - ID de la commande
 * @param {string} clientAddress - Adresse du client
 * @param {string} clientPrivateKey - Clé privée du client
 * @returns {Promise<Object>} { txHash, blockNumber, tokensEarned }
 */
async function confirmDelivery(orderId, clientAddress, clientPrivateKey) {
  try {
    const orderManager = getContractInstance("orderManager");
    const token = getContractInstance("token");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée du client
    const clientWallet = new ethers.Wallet(clientPrivateKey, provider);
    
    // Connecter le contrat au wallet du client
    const orderManagerWithSigner = orderManager.connect(clientWallet);
    
    // Récupérer la balance de tokens avant (pour calculer les tokens gagnés)
    const balanceBefore = await token.balanceOf(clientAddress);
    
    // Appeler confirmDelivery (déclenche automatiquement split et mint dans le contrat)
    const tx = await orderManagerWithSigner.confirmDelivery(orderId);
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Récupérer la balance de tokens après
    const balanceAfter = await token.balanceOf(clientAddress);
    const tokensEarned = balanceAfter - balanceBefore;
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("DeliveryConfirmed", { 
      orderId, 
      client: clientAddress,
      tokensEarned: tokensEarned.toString()
    });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokensEarned: tokensEarned.toString()
    };
  } catch (error) {
    console.error("Error confirming delivery:", error);
    throw error;
  }
}

/**
 * Ouvre un litige sur une commande
 * @param {number} orderId - ID de la commande
 * @param {string} openerAddress - Adresse de celui qui ouvre le litige
 * @param {string} reason - Raison du litige
 * @param {string} openerPrivateKey - Clé privée
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function openDispute(orderId, openerAddress, reason, openerPrivateKey) {
  try {
    // En mode test, retourner des données mock
    if (process.env.NODE_ENV === 'test' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      console.log('⚠️  Using mock blockchain for openDispute (test mode):', { orderId, txHash: mockTxHash });
      blockchainEvents.emit("DisputeOpened", { orderId, opener: openerAddress });
      return {
        txHash: mockTxHash,
        blockNumber: 12345679
      };
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Créer un wallet signer
    const openerWallet = new ethers.Wallet(openerPrivateKey, provider);
    
    // Connecter le contrat au wallet
    const orderManagerWithSigner = orderManager.connect(openerWallet);
    
    // Appeler openDispute
    const tx = await orderManagerWithSigner.openDispute(orderId, reason || "");
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("DisputeOpened", { orderId, opener: openerAddress });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error opening dispute:", error);
    throw error;
  }
}

/**
 * Résout un litige (arbitrator uniquement)
 * @param {number} orderId - ID de la commande
 * @param {string} winner - Adresse du gagnant (client/restaurant/deliverer)
 * @param {number} refundPercent - Pourcentage de remboursement (0-100)
 * @param {string} arbitratorAddress - Adresse de l'arbitre
 * @param {string} arbitratorPrivateKey - Clé privée de l'arbitre
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function resolveDispute(orderId, winner, refundPercent, arbitratorAddress, arbitratorPrivateKey) {
  try {
    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée de l'arbitre
    const arbitratorWallet = new ethers.Wallet(arbitratorPrivateKey, provider);
    
    // Connecter le contrat au wallet de l'arbitre
    const orderManagerWithSigner = orderManager.connect(arbitratorWallet);
    
    // Appeler resolveDispute
    const tx = await orderManagerWithSigner.resolveDispute(
      orderId, 
      winner, 
      refundPercent
    );
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("DisputeResolved", { orderId, winner, refundPercent });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error resolving dispute:", error);
    throw error;
  }
}

/**
 * Récupère les détails d'une commande depuis la blockchain (view function)
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} Structure Order complète depuis la blockchain
 */
async function getOrder(orderId) {
  try {
    const orderManager = getContractInstance("orderManager");
    
    // Appeler la fonction view getOrder(orderId)
    const order = await orderManager.getOrder(orderId);
    
    // Convertir la structure en objet JavaScript lisible
    return {
      id: Number(order.id),
      client: order.client,
      restaurant: order.restaurant,
      deliverer: order.deliverer,
      foodPrice: order.foodPrice.toString(),
      deliveryFee: order.deliveryFee.toString(),
      platformFee: order.platformFee.toString(),
      totalAmount: order.totalAmount.toString(),
      status: Number(order.status), // 0=CREATED, 1=PREPARING, 2=ASSIGNED, 3=IN_DELIVERY, 4=DELIVERED, 5=DISPUTED
      ipfsHash: order.ipfsHash,
      createdAt: new Date(Number(order.createdAt) * 1000), // Convertir timestamp
      disputed: order.disputed,
      delivered: order.delivered
    };
  } catch (error) {
    console.error("Error getting order from blockchain:", error);
    throw error;
  }
}

/**
 * Stake un livreur (dépôt de garantie)
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} amount - Montant à staker en wei
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function stakeDeliverer(delivererAddress, amount, delivererPrivateKey) {
  try {
    const staking = getContractInstance("staking");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée du livreur
    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // Connecter le contrat au wallet du livreur
    const stakingWithSigner = staking.connect(delivererWallet);
    
    // Convertir amount en BigNumber si nécessaire
    const amountWei = typeof amount === 'string' ? ethers.parseEther(amount) : BigInt(amount);
    
    // Appeler stakeAsDeliverer avec msg.value = amount
    const tx = await stakingWithSigner.stakeAsDeliverer({ value: amountWei });
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("Staked", { deliverer: delivererAddress, amount: amountWei.toString() });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error staking deliverer:", error);
    throw error;
  }
}

/**
 * Retire le stake d'un livreur
 * @param {string} delivererAddress - Adresse du livreur
 * @param {string} delivererPrivateKey - Clé privée du livreur
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function unstake(delivererAddress, delivererPrivateKey) {
  try {
    const staking = getContractInstance("staking");
    const provider = getProvider();
    
    // Créer un wallet signer depuis la clé privée du livreur
    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);
    
    // Connecter le contrat au wallet du livreur
    const stakingWithSigner = staking.connect(delivererWallet);
    
    // Appeler unstake
    const tx = await stakingWithSigner.unstake();
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("Unstaked", { deliverer: delivererAddress });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error unstaking deliverer:", error);
    throw error;
  }
}

/**
 * Vérifie si un livreur est staké (view function)
 * @param {string} delivererAddress - Adresse du livreur
 * @returns {Promise<boolean>} True si le livreur est staké
 */
async function isStaked(delivererAddress) {
  try {
    const staking = getContractInstance("staking");
    
    // Appeler la fonction view isStaked(delivererAddress)
    const staked = await staking.isStaked(delivererAddress);
    
    // Retourner le résultat
    return staked;
  } catch (error) {
    console.error("Error checking staking status:", error);
    throw error;
  }
}

/**
 * Récupère le solde de tokens DONE d'un utilisateur (view function)
 * @param {string} userAddress - Adresse de l'utilisateur
 * @returns {Promise<string>} Balance en ether (format lisible)
 */
async function getTokenBalance(userAddress) {
  try {
    const token = getContractInstance("token");
    
    // Appeler la fonction view balanceOf(userAddress)
    const balanceWei = await token.balanceOf(userAddress);
    
    // Convertir de wei en ether (format lisible) - ethers v6
    const balanceEther = ethers.formatEther(balanceWei);
    
    // Retourner la balance en ether
    return balanceEther;
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
}

/**
 * Mint des tokens DONE pour un utilisateur
 * @param {string} userAddress - Adresse de l'utilisateur
 * @param {string} amount - Montant à mint en wei
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function mintTokens(userAddress, amount) {
  try {
    const token = getContractInstance("token");
    const wallet = getWallet();
    
    // Utiliser le wallet backend (qui a MINTER_ROLE)
    const tokenWithSigner = token.connect(wallet);
    
    // Convertir amount en BigNumber si nécessaire
    const amountWei = typeof amount === 'string' ? ethers.parseEther(amount) : BigInt(amount);
    
    // Appeler mint(userAddress, amount)
    const tx = await tokenWithSigner.mint(userAddress, amountWei);
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("TokensMinted", { user: userAddress, amount: amountWei.toString() });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
}

/**
 * Burn des tokens DONE d'un utilisateur
 * @param {string} userAddress - Adresse de l'utilisateur
 * @param {string} amount - Montant à burn en wei
 * @returns {Promise<Object>} { txHash, blockNumber }
 */
async function burnTokens(userAddress, amount) {
  try {
    // Récupérer l'instance du contrat Token
    const token = getContractInstance("token");

    // Utiliser le wallet backend (qui a BURNER_ROLE)
    const wallet = getWallet();
    const tokenWithSigner = token.connect(wallet);

    // Convertir amount en BigNumber si nécessaire
    const amountWei = typeof amount === 'string' ? BigInt(amount) : amount;

    // Appeler burn(userAddress, amount)
    const tx = await tokenWithSigner.burn(userAddress, amountWei);

    // Attendre la confirmation
    const receipt = await tx.wait();

    // Émettre l'event via EventEmitter
    blockchainEvents.emit("TokensBurned", {
      user: userAddress,
      amount: amountWei.toString(),
      txHash: tx.hash
    });

    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    // Logger l'erreur
    console.error("Error burning tokens:", error);
    throw error;
  }
}

/**
 * Écoute les events blockchain et les émet via EventEmitter pour WebSocket
 * @returns {Promise<void>}
 */
async function listenEvents() {
  try {
    const orderManager = getContractInstance("orderManager");
    const paymentSplitter = getContractInstance("paymentSplitter");
    const token = getContractInstance("token");
    
    // S'abonner à l'event OrderCreated
    orderManager.on("OrderCreated", (orderId, client, restaurant, totalAmount, event) => {
      blockchainEvents.emit("OrderCreated", {
        orderId: Number(orderId),
        client,
        restaurant,
        totalAmount: totalAmount.toString()
      });
    });
    
    // S'abonner à l'event PreparationConfirmed
    orderManager.on("PreparationConfirmed", (orderId, restaurant, event) => {
      blockchainEvents.emit("PreparationConfirmed", {
        orderId: Number(orderId),
        restaurant
      });
    });
    
    // S'abonner à l'event DelivererAssigned
    orderManager.on("DelivererAssigned", (orderId, deliverer, event) => {
      blockchainEvents.emit("DelivererAssigned", {
        orderId: Number(orderId),
        deliverer
      });
    });
    
    // S'abonner à l'event PickupConfirmed
    orderManager.on("PickupConfirmed", (orderId, deliverer, event) => {
      blockchainEvents.emit("PickupConfirmed", {
        orderId: Number(orderId),
        deliverer
      });
    });
    
    // S'abonner à l'event DeliveryConfirmed
    orderManager.on("DeliveryConfirmed", (orderId, client, event) => {
      blockchainEvents.emit("DeliveryConfirmed", {
        orderId: Number(orderId),
        client
      });
    });
    
    // S'abonner à l'event DisputeOpened
    orderManager.on("DisputeOpened", (orderId, opener, event) => {
      blockchainEvents.emit("DisputeOpened", {
        orderId: Number(orderId),
        opener
      });
    });
    
    // S'abonner à l'event DisputeResolved
    orderManager.on("DisputeResolved", (orderId, winner, amount, event) => {
      blockchainEvents.emit("DisputeResolved", {
        orderId: Number(orderId),
        winner,
        amount: amount.toString()
      });
    });
    
    // S'abonner à l'event PaymentSplit
    paymentSplitter.on("PaymentSplit", (orderId, restaurant, deliverer, platform, restaurantAmount, delivererAmount, platformAmount, event) => {
      blockchainEvents.emit("PaymentSplit", {
        orderId: Number(orderId),
        restaurant,
        deliverer,
        platform,
        restaurantAmount: restaurantAmount.toString(),
        delivererAmount: delivererAmount.toString(),
        platformAmount: platformAmount.toString()
      });
    });
    
    // S'abonner à l'event Transfer (pour détecter les mints)
    // Vérifier si l'événement Transfer existe dans l'ABI avant de s'abonner
    try {
      const tokenABI = token.interface;
      const transferFragment = tokenABI.getEvent("Transfer");
      
      if (transferFragment) {
        token.on("Transfer", (from, to, amount, event) => {
          // Si from = address(0), c'est un mint
          if (from === ethers.ZeroAddress) {
            blockchainEvents.emit("TokensMinted", {
              to,
              amount: amount.toString()
            });
          }
        });
        console.log("✅ Transfer event listener started");
      } else {
        console.warn("⚠️  Transfer event not found in token ABI, skipping Transfer listener");
      }
    } catch (transferError) {
      console.warn("⚠️  Could not set up Transfer event listener:", transferError.message);
      // Ne pas faire échouer l'initialisation si Transfer n'est pas disponible
    }
    
    // Gérer silencieusement les erreurs "filter not found" des listeners d'événements
    // Ces erreurs sont non-critiques et surviennent avec certains providers RPC
    const provider = getProvider();
    if (provider && provider.on) {
      provider.on('error', (error) => {
        // Filtrer silencieusement les erreurs "filter not found"
        if (error && error.code === 'UNKNOWN_ERROR' && 
            error.error && error.error.message === 'filter not found') {
          // Erreur non-critique, ne pas logger
          return;
        }
        // Logger les autres erreurs
        console.error("⚠️  Provider error:", error.message || error);
      });
    }
    
    // Intercepter les erreurs au niveau des contrats eux-mêmes
    // Wrapper les listeners pour capturer les erreurs de filtres
    const wrapEventListener = (contract, eventName, handler) => {
      try {
        contract.on(eventName, handler);
      } catch (error) {
        // Si l'erreur est "filter not found", l'ignorer silencieusement
        if (error && error.code === 'UNKNOWN_ERROR' && 
            error.error && error.error.message === 'filter not found') {
          return;
        }
        throw error;
      }
    };
    
    // Logger que l'écoute des events est démarrée
    console.log("✅ Blockchain events listener started");
    console.log("ℹ️  Note: Some RPC providers may not support persistent event filters.");
    console.log("   Filter errors are handled silently and won't affect server operation.");
  } catch (error) {
    // Vérifier si c'est une erreur "filter not found"
    if (error && error.code === 'UNKNOWN_ERROR' && 
        error.error && error.error.message === 'filter not found') {
      // Erreur non-critique, continuer sans arrêter
      console.warn("⚠️  Event filters not supported by RPC provider. Continuing without real-time events.");
      return;
    }
    
    console.error("Error starting event listener:", error);
    // Ne pas faire crasher le serveur si l'écoute des événements échoue
    console.warn("⚠️  Continuing without event listeners. Some real-time features may not work.");
  }
}

/**
 * Récupère le solde en attente d'un payee depuis PaymentSplitter
 * @param {string} payeeAddress - Adresse du payee (restaurant, deliverer, platform)
 * @returns {Promise<string>} Balance en wei (format string)
 */
async function getPendingBalance(payeeAddress) {
  try {
    const paymentSplitter = getContractInstance("paymentSplitter");
    
    // Appeler la fonction view getPendingBalance(payeeAddress)
    const balanceWei = await paymentSplitter.getPendingBalance(payeeAddress);
    
    // Retourner la balance en wei
    return balanceWei.toString();
  } catch (error) {
    console.error("Error getting pending balance:", error);
    throw error;
  }
}

/**
 * Retire les fonds depuis PaymentSplitter
 * @param {string} payeeAddress - Adresse du payee
 * @param {string} payeePrivateKey - Clé privée du payee
 * @returns {Promise<Object>} { txHash, blockNumber, amount }
 */
async function withdraw(payeeAddress, payeePrivateKey) {
  try {
    const paymentSplitter = getContractInstance("paymentSplitter");
    const provider = getProvider();
    
    // Récupérer le solde avant withdrawal
    const balanceBefore = await paymentSplitter.getPendingBalance(payeeAddress);
    
    if (balanceBefore === BigInt(0)) {
      throw new Error("No balance to withdraw");
    }
    
    // Créer un wallet signer depuis la clé privée du payee
    const payeeWallet = new ethers.Wallet(payeePrivateKey, provider);
    
    // Connecter le contrat au wallet du payee
    const paymentSplitterWithSigner = paymentSplitter.connect(payeeWallet);
    
    // Appeler withdraw()
    const tx = await paymentSplitterWithSigner.withdraw();
    
    // Attendre la confirmation
    const receipt = await tx.wait();
    
    // Émettre l'event via EventEmitter
    blockchainEvents.emit("Withdrawn", { 
      payee: payeeAddress, 
      amount: balanceBefore.toString() 
    });
    
    // Retourner les résultats
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount: balanceBefore.toString()
    };
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
}

/**
 * Récupère l'EventEmitter pour les events blockchain
 * @returns {EventEmitter} Instance EventEmitter
 */
function getBlockchainEvents() {
  return blockchainEvents;
}

// Exporter toutes les fonctions
module.exports = {
  createOrder,
  confirmPreparation,
  assignDeliverer,
  confirmPickup,
  confirmDelivery,
  openDispute,
  resolveDispute,
  getOrder,
  stakeDeliverer,
  unstake,
  isStaked,
  getTokenBalance,
  mintTokens,
  burnTokens,
  listenEvents,
  getPendingBalance,
  withdraw,
  getBlockchainEvents
};
