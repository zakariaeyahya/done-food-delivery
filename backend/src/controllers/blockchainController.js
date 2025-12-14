const blockchainMetricsService = require('../services/blockchainMetricsService');

// GET /api/blockchain/dashboard
async function getDashboard(req, res) {
  try {
    const data = await blockchainMetricsService.getDashboard();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur dashboard blockchain:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/blockchain/network
async function getNetworkStats(req, res) {
  try {
    const stats = await blockchainMetricsService.getNetworkStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/blockchain/health
async function getHealth(req, res) {
  try {
    const health = await blockchainMetricsService.getSystemHealth();
    const statusCode = health.overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getDashboard,
  getNetworkStats,
  getHealth
};
