const { ethers } = require('ethers');
const Order = require('../models/Order');

const provider = new ethers.JsonRpcProvider(
  process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'
);

const CONTRACTS = {
  OrderManager: process.env.ORDER_MANAGER_ADDRESS,
  PaymentSplitter: process.env.PAYMENT_SPLITTER_ADDRESS,
  Token: process.env.TOKEN_ADDRESS,
  Staking: process.env.STAKING_ADDRESS
};

/**
 * Convertir wei en POL (18 decimales)
 * @param {string|bigint|number} weiValue - Valeur en wei
 * @param {number} decimals - Nombre de decimales pour l'affichage (defaut: 5)
 * @returns {string} Valeur en POL
 */
function weiToPol(weiValue, decimals = 5) {
  if (!weiValue) return '0.00000';
  try {
    const polValue = Number(weiValue) / 1e18;
    return polValue.toFixed(decimals);
  } catch (error) {
    return '0.00000';
  }
}

/**
 * Convertir Gwei en POL
 * @param {number} gweiValue - Valeur en Gwei
 * @param {number} gasUsed - Gas utilise
 * @returns {string} Cout en POL
 */
function gasCostInPol(gweiValue, gasUsed) {
  if (!gweiValue || !gasUsed) return '0.00000';
  const costWei = gweiValue * 1e9 * gasUsed;
  return weiToPol(costWei);
}

class BlockchainMetricsService {

  async getNetworkStats() {
    try {
      const [blockNumber, feeData, network] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        provider.getNetwork()
      ]);

      const block = await provider.getBlock(blockNumber);
      const timeSinceBlock = Math.floor(Date.now() / 1000) - block.timestamp;

      return {
        blockNumber,
        chainId: Number(network.chainId),
        networkName: 'Polygon Amoy',
        gasPrice: {
          gwei: Number(feeData.gasPrice) / 1e9,
          wei: feeData.gasPrice.toString()
        },
        lastBlockTime: block.timestamp,
        timeSinceLastBlock: timeSinceBlock,
        isConnected: true,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async getSystemHealth() {
    const health = {
      blockchain: { status: 'unknown' },
      contracts: {},
      overall: 'unknown'
    };

    try {
      const start = Date.now();
      await provider.getBlockNumber();
      health.blockchain = {
        status: 'connected',
        latency: Date.now() - start
      };
    } catch (error) {
      health.blockchain = { status: 'disconnected' };
    }

    for (const [name, address] of Object.entries(CONTRACTS)) {
      if (!address) {
        health.contracts[name] = { status: 'not_configured' };
        continue;
      }
      try {
        const code = await provider.getCode(address);
        health.contracts[name] = {
          status: code !== '0x' ? 'deployed' : 'not_deployed',
          address: address
        };
      } catch (error) {
        health.contracts[name] = { status: 'error' };
      }
    }

    const allOk = health.blockchain.status === 'connected' &&
      Object.values(health.contracts).every(c =>
        c.status === 'deployed' || c.status === 'not_configured'
      );

    health.overall = allOk ? 'healthy' : 'degraded';
    health.timestamp = Date.now();

    return health;
  }

  async getSimpleMetrics() {
    const network = await this.getNetworkStats();
    const health = await this.getSystemHealth();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const totalOrders = await Order.countDocuments();
      const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
      const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
      const disputedOrders = await Order.countDocuments({ status: 'DISPUTED' });

      const successRate = totalOrders > 0
        ? ((deliveredOrders / totalOrders) * 100).toFixed(1)
        : 0;

      const volumeAggregation = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalVolumeWei: { $sum: '$totalAmount' },
            totalFoodWei: { $sum: '$foodPrice' },
            totalDeliveryWei: { $sum: '$deliveryFee' },
            totalPlatformWei: { $sum: '$platformFee' }
          }
        }
      ]);

      const volumeData = volumeAggregation[0] || {
        totalVolumeWei: 0,
        totalFoodWei: 0,
        totalDeliveryWei: 0,
        totalPlatformWei: 0
      };

      const totalVolumePol = Number(volumeData.totalVolumeWei) / 1e18;
      const restaurantsPol = (Number(volumeData.totalFoodWei) / 1e18) * 0.70;
      const deliverersPol = Number(volumeData.totalDeliveryWei) / 1e18;
      const platformPol = Number(volumeData.totalPlatformWei) / 1e18;

      const currentGasPrice = network.gasPrice?.gwei || 30;
      const avgGasUsed = 150000;
      const estimatedGasCost = gasCostInPol(currentGasPrice, avgGasUsed * totalOrders);

      return {
        network,
        health,
        transactions: {
          total: totalOrders,
          today: todayOrders,
          successRate: parseFloat(successRate)
        },
        latency: {
          average: 2.5,
          min: 1.0,
          max: 10.0,
          p95: 5.0
        },
        gas: {
          averageUsed: avgGasUsed,
          totalSpent: estimatedGasCost,
          priceGwei: currentGasPrice
        },
        volume: {
          totalPol: totalVolumePol.toFixed(5),
          ordersProcessed: deliveredOrders,
          paymentsplit: {
            restaurants: restaurantsPol.toFixed(5),
            deliverers: deliverersPol.toFixed(5),
            platform: platformPol.toFixed(5)
          }
        },
        generatedAt: Date.now()
      };
    } catch (error) {
      return {
        network,
        health,
        transactions: { total: 0, today: 0, successRate: 0 },
        latency: { average: 0, min: 0, max: 0, p95: 0 },
        gas: { averageUsed: 0, totalSpent: '0.00000', priceGwei: network.gasPrice?.gwei || 0 },
        volume: {
          totalPol: '0.00000',
          ordersProcessed: 0,
          paymentsplit: { restaurants: '0.00000', deliverers: '0.00000', platform: '0.00000' }
        },
        generatedAt: Date.now()
      };
    }
  }

  async getDashboard() {
    return await this.getSimpleMetrics();
  }
}

module.exports = new BlockchainMetricsService();
