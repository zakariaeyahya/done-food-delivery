const { ethers } = require("ethers");
require("dotenv").config();

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

  initializeEndpoints() {
    const endpoints = [];

    if (process.env.AMOY_RPC_URL) {
      endpoints.push(process.env.AMOY_RPC_URL);
    } else if (process.env.MUMBAI_RPC_URL) {
      endpoints.push(process.env.MUMBAI_RPC_URL);
    }

    if (process.env.ALCHEMY_API_KEY) {
      const network = process.env.NETWORK === 'mainnet' ? 'polygon' : 'polygon-amoy';
      endpoints.push(`https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    }

    if (process.env.INFURA_API_KEY) {
      const network = process.env.NETWORK === 'mainnet' ? 'polygon-mainnet' : 'polygon-amoy';
      endpoints.push(`https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`);
    }

    if (endpoints.length === 0) {
      endpoints.push('https://rpc-amoy.polygon.technology');
    }

    this.rpcEndpoints = endpoints;
  }

  initProvider() {
    if (this.rpcEndpoints.length === 0) {
      throw new Error("No RPC endpoints configured");
    }

    const endpoint = this.rpcEndpoints[this.currentEndpointIndex];
    this.provider = new ethers.JsonRpcProvider(endpoint);

    this.provider.getBlockNumber().catch((error) => {
      this.switchToNextEndpoint();
    });
  }

  switchToNextEndpoint() {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.rpcEndpoints.length;
    const newEndpoint = this.rpcEndpoints[this.currentEndpointIndex];
    this.initProvider();
  }

  async executeWithRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const start = Date.now();
        const result = await operation(this.provider);
        const latency = Date.now() - start;

        const endpoint = this.rpcEndpoints[this.currentEndpointIndex];

        if (!this.performanceMetrics[endpoint]) {
          this.performanceMetrics[endpoint] = { count: 0, totalLatency: 0, failures: 0 };
        }
        this.performanceMetrics[endpoint].count++;
        this.performanceMetrics[endpoint].totalLatency += latency;

        return result;
      } catch (error) {
        const endpoint = this.rpcEndpoints[this.currentEndpointIndex];
        if (this.performanceMetrics[endpoint]) {
          this.performanceMetrics[endpoint].failures++;
        }

        if (i < maxRetries - 1) {
          this.switchToNextEndpoint();
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        } else {
          throw new Error("All RPC endpoints failed");
        }
      }
    }
  }

  getProvider() {
    return this.provider;
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.provider.getBlockNumber();
      } catch (error) {
        this.switchToNextEndpoint();
      }
    }, 5 * 60 * 1000);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

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
