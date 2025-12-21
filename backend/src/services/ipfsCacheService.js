const NodeCache = require('node-cache');
const ipfsService = require('./ipfsService');
const axios = require('axios');
const { getIPFSGateway } = require('../config/ipfs');

/**
 * IPFS Cache Service - Local cache for IPFS files
 */

class IPFSCacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600,
      checkperiod: 600
    });

    this.metrics = {
      hits: 0,
      misses: 0,
      totalFetchTime: 0
    };
  }

  /**
   * Get file from cache or IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<Buffer|Object>} File content (Buffer for images, Object for JSON)
   */
  async getFile(ipfsHash) {
    let file = this.cache.get(ipfsHash);

    if (file) {
      this.metrics.hits++;
      return file;
    }

    this.metrics.misses++;

    const fetchStart = Date.now();
    try {
      try {
        file = await ipfsService.getJSON(ipfsHash);
      } catch (jsonError) {
        if (jsonError.message && jsonError.message.includes('Invalid IPFS')) {
          throw jsonError;
        }

        const gateway = getIPFSGateway();
        const url = gateway + ipfsHash;
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        file = Buffer.from(response.data);
      }

      const fetchTime = Date.now() - fetchStart;
      this.metrics.totalFetchTime += fetchTime;

      this.cache.set(ipfsHash, file);

      return file;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidate cache entry
   * @param {string} ipfsHash - IPFS hash to invalidate
   */
  invalidate(ipfsHash) {
    this.cache.del(ipfsHash);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.flushAll();
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests * 100).toFixed(2) : 0;
    const avgFetchTime = this.metrics.misses > 0 ? (this.metrics.totalFetchTime / this.metrics.misses).toFixed(2) : 0;

    return {
      cacheHits: this.metrics.hits,
      cacheMisses: this.metrics.misses,
      totalRequests: totalRequests,
      hitRate: `${hitRate}%`,
      averageFetchTime: `${avgFetchTime}ms`,
      cacheSize: this.cache.keys().length
    };
  }
}

module.exports = new IPFSCacheService();
