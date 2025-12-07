const { ethers } = require("ethers");
require("dotenv").config();

/**
 * RPC Service - Automatic failover between multiple Polygon RPC endpoints
 * 
 * Responsibilities:
 * - Manage multiple RPC endpoints (Polygon Mumbai/Mainnet)
 * - Automatic failover if an endpoint fails
 * - Retry logic with exponential backoff
 * - Periodic health check of endpoints
 * 
 * Usage:
 * const rpcService = require('./services/rpcService');
 * const provider = rpcService.getProvider();
 * const blockNumber = await rpcService.executeWithRetry(async (provider) => {
 *   return await provider.getBlockNumber();
 * });
 */

class RPCService {
  constructor() {
    this.rpcEndpoints = [];
    this.currentEndpointIndex = 0;
    this.provider = null;
    this.performanceMetrics = {};
    this.healthCheckInterval = null;
    
    this.initializeEndpoints();
    this.initProvider();
    this.startHealthCheck();
  }

  /**
   * Initialize RPC endpoints from environment variables
   */
  initializeEndpoints() {
    const endpoints = [];

    // Primary: AMOY_RPC_URL or MUMBAI_RPC_URL
    if (process.env.AMOY_RPC_URL) {
      endpoints.push(process.env.AMOY_RPC_URL);
    } else if (process.env.MUMBAI_RPC_URL) {
      endpoints.push(process.env.MUMBAI_RPC_URL);
    }

    // Fallback 1: Alchemy
    if (process.env.ALCHEMY_API_KEY) {
      const network = process.env.NETWORK === 'mainnet' ? 'polygon' : 'polygon-amoy';
      endpoints.push(`https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    }

    // Fallback 2: Infura
    if (process.env.INFURA_API_KEY) {
      const network = process.env.NETWORK === 'mainnet' ? 'polygon-mainnet' : 'polygon-amoy';
      endpoints.push(`https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`);
    }

    // Fallback 3: Public RPC
    if (endpoints.length === 0) {
      endpoints.push('https://rpc-amoy.polygon.technology');
    }

    this.rpcEndpoints = endpoints;
    console.log(`✅ Initialized ${endpoints.length} RPC endpoints`);
  }

  /**
   * Initialize provider with current endpoint
   */
  initProvider() {
    if (this.rpcEndpoints.length === 0) {
      throw new Error("No RPC endpoints configured");
    }

    const endpoint = this.rpcEndpoints[this.currentEndpointIndex];
    this.provider = new ethers.JsonRpcProvider(endpoint);
    
    console.log(`📡 Using RPC endpoint: ${endpoint}`);

    // Initial health check
    this.provider.getBlockNumber().catch((error) => {
      console.error(`❌ RPC endpoint ${endpoint} failed:`, error.message);
      this.switchToNextEndpoint();
    });
  }

  /**
   * Switch to next RPC endpoint
   */
  switchToNextEndpoint() {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.rpcEndpoints.length;
    const newEndpoint = this.rpcEndpoints[this.currentEndpointIndex];
    console.log(`⚠️  Switching to RPC endpoint: ${newEndpoint}`);
    this.initProvider();
  }

  /**
   * Execute operation with retry logic
   * @param {Function} operation - Async function that takes provider as parameter
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const start = Date.now();
        const result = await operation(this.provider);
        const latency = Date.now() - start;

        const endpoint = this.rpcEndpoints[this.currentEndpointIndex];
        console.log(`✓ RPC response: ${latency}ms (${endpoint})`);

        // Store metrics
        if (!this.performanceMetrics[endpoint]) {
          this.performanceMetrics[endpoint] = { count: 0, totalLatency: 0, failures: 0 };
        }
        this.performanceMetrics[endpoint].count++;
        this.performanceMetrics[endpoint].totalLatency += latency;

        return result;
      } catch (error) {
        console.error(`❌ Attempt ${i + 1} failed:`, error.message);

        const endpoint = this.rpcEndpoints[this.currentEndpointIndex];
        if (this.performanceMetrics[endpoint]) {
          this.performanceMetrics[endpoint].failures++;
        }

        if (i < maxRetries - 1) {
          this.switchToNextEndpoint();
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
        } else {
          throw new Error("All RPC endpoints failed");
        }
      }
    }
  }

  /**
   * Get current provider
   * @returns {Object} Ethers.js provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Start periodic health check
   */
  startHealthCheck() {
    // Health check every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.provider.getBlockNumber();
      } catch (error) {
        console.error("Health check failed, switching endpoint:", error.message);
        this.switchToNextEndpoint();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop health check
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics per endpoint
   */
  getPerformanceMetrics() {
    const metrics = {};
    for (const [endpoint, data] of Object.entries(this.performanceMetrics)) {
      metrics[endpoint] = {
        averageLatency: data.count > 0 ? (data.totalLatency / data.count).toFixed(2) + 'ms' : 'N/A',
        totalRequests: data.count,
        failures: data.failures,
        successRate: data.count > 0 ? ((1 - data.failures / data.count) * 100).toFixed(2) + '%' : 'N/A'
      };
    }
    return metrics;
  }
}

module.exports = new RPCService();
