const NodeCache = require('node-cache');
const ipfsService = require('./ipfsService');
const axios = require('axios');
const { getIPFSGateway } = require('../config/ipfs');

/**
 * IPFS Cache Service - Local cache for IPFS files
 * 
 * Responsibilities:
 * - In-memory cache of frequently accessed IPFS files
 * - Reduce dependency on IPFS gateways
 * - Configurable TTL for automatic expiration
 * - Manual cache invalidation if needed
 * 
 * Usage:
 * const ipfsCacheService = require('./services/ipfsCacheService');
 * const imageBuffer = await ipfsCacheService.getFile('QmHash...');
 */

class IPFSCacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour TTL
      checkperiod: 600 // Check every 10 minutes
    });

    // Performance metrics
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
    // 1. Check cache
    let file = this.cache.get(ipfsHash);

    if (file) {
      // Cache HIT
      this.metrics.hits++;
      console.log(`✓ Cache HIT: ${ipfsHash}`);
      return file;
    }

    // Cache MISS
    this.metrics.misses++;
    console.log(`⚠️  Cache MISS: ${ipfsHash}, fetching from IPFS...`);

    // 2. Fetch from IPFS
    const fetchStart = Date.now();
    try {
      // Try to get as JSON first (for JSON files)
      try {
        file = await ipfsService.getJSON(ipfsHash);
      } catch (jsonError) {
        // If not JSON, try to get as image/binary
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

      console.log(`✓ IPFS fetch: ${fetchTime}ms`);

      // 3. Store in cache
      this.cache.set(ipfsHash, file);

      return file;
    } catch (error) {
      console.error(`❌ IPFS fetch failed for ${ipfsHash}:`, error.message);
      throw error;
    }
  }

  /**
   * Invalidate cache entry
   * @param {string} ipfsHash - IPFS hash to invalidate
   */
  invalidate(ipfsHash) {
    this.cache.del(ipfsHash);
    console.log(`🗑️  Cache invalidated: ${ipfsHash}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.flushAll();
    console.log('🗑️  Cache cleared');
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
