const { getContractInstance, getProvider, getWallet } = require("../config/blockchain");
const { ethers } = require("ethers");
const EventEmitter = require("events");

/**
 * Service d'abstraction des interactions avec les smart contracts
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
    if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {
      let mockOrderId;
      try {
        const Order = require("../models/Order");
        const lastOrder = await Order.findOne().sort({ orderId: -1 }).limit(1);
        const lastOrderId = lastOrder ? lastOrder.orderId : 0;
        mockOrderId = Math.max(lastOrderId + 1, 100000);
      } catch (error) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        mockOrderId = parseInt(`${timestamp}${random}`.slice(-10)) || Math.floor(Math.random() * 1000000) + 100000;
      }

      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

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

    const foodPrice = ethers.parseEther(params.foodPrice.toString());
    const deliveryFee = ethers.parseEther(params.deliveryFee.toString());

    const platformFee = (foodPrice * BigInt(10)) / BigInt(100);

    const totalAmount = foodPrice + deliveryFee + platformFee;

    const clientWallet = new ethers.Wallet(params.clientPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(clientWallet);

    const tx = await orderManagerWithSigner.createOrder(
      params.restaurantAddress,
      foodPrice,
      deliveryFee,
      params.ipfsHash,
      { value: totalAmount }
    );

    const receipt = await tx.wait();

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

    blockchainEvents.emit("OrderCreated", {
      orderId,
      client: params.clientAddress,
      restaurant: params.restaurantAddress,
      totalAmount: totalAmount.toString()
    });

    return {
      orderId,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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
    const isMockMode = process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true';

    if (isMockMode) {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000;

      blockchainEvents.emit("PreparationConfirmed", { orderId, restaurant: restaurantAddress });

      return {
        txHash: mockTxHash,
        blockNumber: mockBlockNumber
      };
    }

    if (!restaurantPrivateKey) {
      throw new Error("restaurantPrivateKey is required in production mode");
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();

    const restaurantWallet = new ethers.Wallet(restaurantPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(restaurantWallet);

    const tx = await orderManagerWithSigner.confirmPreparation(orderId);

    const receipt = await tx.wait();

    blockchainEvents.emit("PreparationConfirmed", { orderId, restaurant: restaurantAddress });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000;
      blockchainEvents.emit("PreparationConfirmed", { orderId, restaurant: restaurantAddress });
      return {
        txHash: mockTxHash,
        blockNumber: mockBlockNumber
      };
    }
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
    // En mode DEMO, simuler la transaction
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("DelivererAssigned", { orderId, deliverer: delivererAddress });
      return {
        txHash: mockTxHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000
      };
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();

    const platformWallet = new ethers.Wallet(platformPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(platformWallet);

    const tx = await orderManagerWithSigner.assignDeliverer(orderId, delivererAddress);

    const receipt = await tx.wait();

    blockchainEvents.emit("DelivererAssigned", { orderId, deliverer: delivererAddress });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("DelivererAssigned", { orderId, deliverer: delivererAddress });
      return { txHash: mockTxHash, blockNumber: 12345678 };
    }
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
    // En mode DEMO, simuler la transaction
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("PickupConfirmed", { orderId, deliverer: delivererAddress });
      return {
        txHash: mockTxHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000
      };
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();

    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(delivererWallet);

    const tx = await orderManagerWithSigner.confirmPickup(orderId);

    const receipt = await tx.wait();

    blockchainEvents.emit("PickupConfirmed", { orderId, deliverer: delivererAddress });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("PickupConfirmed", { orderId, deliverer: delivererAddress });
      return { txHash: mockTxHash, blockNumber: 12345678 };
    }
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
    // En mode DEMO, simuler la transaction
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockTokensEarned = "1000000000000000000"; // 1 DONE token simulé
      blockchainEvents.emit("DeliveryConfirmed", {
        orderId,
        client: clientAddress,
        tokensEarned: mockTokensEarned
      });
      return {
        txHash: mockTxHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        tokensEarned: mockTokensEarned
      };
    }

    const orderManager = getContractInstance("orderManager");
    const token = getContractInstance("token");
    const provider = getProvider();

    const clientWallet = new ethers.Wallet(clientPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(clientWallet);

    const balanceBefore = await token.balanceOf(clientAddress);

    const tx = await orderManagerWithSigner.confirmDelivery(orderId);

    const receipt = await tx.wait();

    const balanceAfter = await token.balanceOf(clientAddress);
    const tokensEarned = balanceAfter - balanceBefore;

    blockchainEvents.emit("DeliveryConfirmed", {
      orderId,
      client: clientAddress,
      tokensEarned: tokensEarned.toString()
    });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokensEarned: tokensEarned.toString()
    };
  } catch (error) {
    if (process.env.DEMO_MODE === 'true' || process.env.ALLOW_MOCK_BLOCKCHAIN === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("DeliveryConfirmed", { orderId, client: clientAddress, tokensEarned: "0" });
      return { txHash: mockTxHash, blockNumber: 12345678, tokensEarned: "0" };
    }
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
    if (process.env.ALLOW_MOCK_BLOCKCHAIN === 'true' || process.env.DEMO_MODE === 'true') {
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      blockchainEvents.emit("DisputeOpened", { orderId, opener: openerAddress });
      return {
        txHash: mockTxHash,
        blockNumber: 12345679
      };
    }

    const orderManager = getContractInstance("orderManager");
    const provider = getProvider();

    const openerWallet = new ethers.Wallet(openerPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(openerWallet);

    const tx = await orderManagerWithSigner.openDispute(orderId);

    const receipt = await tx.wait();

    blockchainEvents.emit("DisputeOpened", { orderId, opener: openerAddress });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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

    const arbitratorWallet = new ethers.Wallet(arbitratorPrivateKey, provider);

    const orderManagerWithSigner = orderManager.connect(arbitratorWallet);

    const tx = await orderManagerWithSigner.resolveDispute(
      orderId,
      winner,
      refundPercent
    );

    const receipt = await tx.wait();

    blockchainEvents.emit("DisputeResolved", { orderId, winner, refundPercent });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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

    const order = await orderManager.getOrder(orderId);

    return {
      id: Number(order.id),
      client: order.client,
      restaurant: order.restaurant,
      deliverer: order.deliverer,
      foodPrice: order.foodPrice.toString(),
      deliveryFee: order.deliveryFee.toString(),
      platformFee: order.platformFee.toString(),
      totalAmount: order.totalAmount.toString(),
      status: Number(order.status),
      ipfsHash: order.ipfsHash,
      createdAt: new Date(Number(order.createdAt) * 1000),
      disputed: order.disputed,
      delivered: order.delivered
    };
  } catch (error) {
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

    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);

    const stakingWithSigner = staking.connect(delivererWallet);

    const amountWei = typeof amount === 'string' ? ethers.parseEther(amount) : BigInt(amount);

    const tx = await stakingWithSigner.stakeAsDeliverer({ value: amountWei });

    const receipt = await tx.wait();

    blockchainEvents.emit("Staked", { deliverer: delivererAddress, amount: amountWei.toString() });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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

    const delivererWallet = new ethers.Wallet(delivererPrivateKey, provider);

    const stakingWithSigner = staking.connect(delivererWallet);

    const tx = await stakingWithSigner.unstake();

    const receipt = await tx.wait();

    blockchainEvents.emit("Unstaked", { deliverer: delivererAddress });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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

    const staked = await staking.isStaked(delivererAddress);

    return staked;
  } catch (error) {
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

    const balanceWei = await token.balanceOf(userAddress);

    const balanceEther = ethers.formatEther(balanceWei);

    return balanceEther;
  } catch (error) {
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

    const tokenWithSigner = token.connect(wallet);

    const amountWei = typeof amount === 'string' ? ethers.parseEther(amount) : BigInt(amount);

    const tx = await tokenWithSigner.mint(userAddress, amountWei);

    const receipt = await tx.wait();

    blockchainEvents.emit("TokensMinted", { user: userAddress, amount: amountWei.toString() });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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
    const token = getContractInstance("token");

    const wallet = getWallet();
    const tokenWithSigner = token.connect(wallet);

    const amountWei = typeof amount === 'string' ? BigInt(amount) : amount;

    const tx = await tokenWithSigner.burn(userAddress, amountWei);

    const receipt = await tx.wait();

    blockchainEvents.emit("TokensBurned", {
      user: userAddress,
      amount: amountWei.toString(),
      txHash: tx.hash
    });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
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

    orderManager.on("OrderCreated", (orderId, client, restaurant, totalAmount, event) => {
      blockchainEvents.emit("OrderCreated", {
        orderId: Number(orderId),
        client,
        restaurant,
        totalAmount: totalAmount.toString()
      });
    });

    orderManager.on("PreparationConfirmed", (orderId, restaurant, event) => {
      blockchainEvents.emit("PreparationConfirmed", {
        orderId: Number(orderId),
        restaurant
      });
    });

    orderManager.on("DelivererAssigned", (orderId, deliverer, event) => {
      blockchainEvents.emit("DelivererAssigned", {
        orderId: Number(orderId),
        deliverer
      });
    });

    orderManager.on("PickupConfirmed", (orderId, deliverer, event) => {
      blockchainEvents.emit("PickupConfirmed", {
        orderId: Number(orderId),
        deliverer
      });
    });

    orderManager.on("DeliveryConfirmed", (orderId, client, event) => {
      blockchainEvents.emit("DeliveryConfirmed", {
        orderId: Number(orderId),
        client
      });
    });

    orderManager.on("DisputeOpened", (orderId, opener, event) => {
      blockchainEvents.emit("DisputeOpened", {
        orderId: Number(orderId),
        opener
      });
    });

    orderManager.on("DisputeResolved", (orderId, winner, amount, event) => {
      blockchainEvents.emit("DisputeResolved", {
        orderId: Number(orderId),
        winner,
        amount: amount.toString()
      });
    });

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

    try {
      const tokenABI = token.interface;
      const transferFragment = tokenABI.getEvent("Transfer");

      if (transferFragment) {
        token.on("Transfer", (from, to, amount, event) => {
          if (from === ethers.ZeroAddress) {
            blockchainEvents.emit("TokensMinted", {
              to,
              amount: amount.toString()
            });
          }
        });
      }
    } catch (transferError) {
    }

    const provider = getProvider();
    if (provider && provider.on) {
      provider.on('error', (error) => {
        if (error && error.code === 'UNKNOWN_ERROR' &&
            error.error && error.error.message === 'filter not found') {
          return;
        }
      });
    }

    const wrapEventListener = (contract, eventName, handler) => {
      try {
        contract.on(eventName, handler);
      } catch (error) {
        if (error && error.code === 'UNKNOWN_ERROR' &&
            error.error && error.error.message === 'filter not found') {
          return;
        }
        throw error;
      }
    };
  } catch (error) {
    if (error && error.code === 'UNKNOWN_ERROR' &&
        error.error && error.error.message === 'filter not found') {
      return;
    }
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

    const balanceWei = await paymentSplitter.getPendingBalance(payeeAddress);

    return balanceWei.toString();
  } catch (error) {
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

    const balanceBefore = await paymentSplitter.getPendingBalance(payeeAddress);

    if (balanceBefore === BigInt(0)) {
      throw new Error("No balance to withdraw");
    }

    const payeeWallet = new ethers.Wallet(payeePrivateKey, provider);

    const paymentSplitterWithSigner = paymentSplitter.connect(payeeWallet);

    const tx = await paymentSplitterWithSigner.withdraw();

    const receipt = await tx.wait();

    blockchainEvents.emit("Withdrawn", {
      payee: payeeAddress,
      amount: balanceBefore.toString()
    });

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount: balanceBefore.toString()
    };
  } catch (error) {
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

/**
 * Vérifie si une adresse a le rôle RESTAURANT_ROLE
 * @param {string} address - Adresse à vérifier
 * @returns {Promise<boolean>} True si l'adresse a le rôle
 */
async function hasRestaurantRole(address) {
  try {
    const orderManager = getContractInstance("orderManager");

    // Récupérer le RESTAURANT_ROLE depuis le contrat
    const RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
    console.log('[hasRestaurantRole] RESTAURANT_ROLE:', RESTAURANT_ROLE);

    const hasRole = await orderManager.hasRole(RESTAURANT_ROLE, address);
    console.log(`[hasRestaurantRole] ${address} has role:`, hasRole);

    return hasRole;
  } catch (error) {
    console.error('[hasRestaurantRole] Error:', error.message);
    // Fallback: calculer le hash manuellement
    try {
      const orderManager = getContractInstance("orderManager");
      const RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));
      return await orderManager.hasRole(RESTAURANT_ROLE, address);
    } catch (fallbackError) {
      console.error('[hasRestaurantRole] Fallback error:', fallbackError.message);
      return false;
    }
  }
}

/**
 * Accorde le rôle RESTAURANT_ROLE à une adresse
 * @param {string} restaurantAddress - Adresse du restaurant
 * @returns {Promise<Object>} { txHash, blockNumber, success }
 */
async function grantRestaurantRole(restaurantAddress) {
  try {
    const orderManager = getContractInstance("orderManager");
    const wallet = getWallet();

    // Récupérer le RESTAURANT_ROLE depuis le contrat
    let RESTAURANT_ROLE;
    try {
      RESTAURANT_ROLE = await orderManager.RESTAURANT_ROLE();
    } catch (e) {
      // Fallback: calculer le hash manuellement
      RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));
    }
    console.log('[grantRestaurantRole] RESTAURANT_ROLE:', RESTAURANT_ROLE);

    // Vérifier si le restaurant a déjà le rôle
    const alreadyHasRole = await orderManager.hasRole(RESTAURANT_ROLE, restaurantAddress);
    if (alreadyHasRole) {
      console.log(`[grantRestaurantRole] ${restaurantAddress} already has RESTAURANT_ROLE`);
      return { success: true, alreadyHadRole: true };
    }

    console.log(`[grantRestaurantRole] Granting RESTAURANT_ROLE to ${restaurantAddress}...`);

    const orderManagerWithSigner = orderManager.connect(wallet);
    const tx = await orderManagerWithSigner.grantRole(RESTAURANT_ROLE, restaurantAddress);
    const receipt = await tx.wait();

    console.log(`[grantRestaurantRole] Success! TxHash: ${tx.hash}`);

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      success: true
    };
  } catch (error) {
    console.error('[grantRestaurantRole] Error:', error.message);
    throw error;
  }
}

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
  getBlockchainEvents,
  hasRestaurantRole,
  grantRestaurantRole
};
