const blockchainMetricsService = require('../services/blockchainMetricsService');

// GET /api/blockchain/dashboard
async function getDashboard(req, res) {
  try {
    const data = await blockchainMetricsService.getDashboard();
    res.json({ success: true, data });
  } catch (error) {
        res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/blockchain/network
async function getNetworkStats(req, res) {
  try {
    const stats = await blockchainMetricsService.getNetworkStats();
    const data = {
      ...stats,
      connected: stats?.isConnected ? 1 : 0,
    };
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/blockchain/health
async function getHealth(req, res) {
  try {
    const health = await blockchainMetricsService.getSystemHealth();
    const overall = health?.overall || 'unknown';
    const overallCode =
      overall === 'healthy' ? 1 :
      overall === 'degraded' ? 0.5 :
      0;

    res.status(200).json({
      success: true,
      data: {
        ...health,
        overall,
        overallCode,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getDashboard,
  getNetworkStats,
  getHealth
};
