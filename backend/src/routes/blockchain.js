const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// Routes publiques pour la demo (pas besoin d'auth pour simplifier)
router.get('/dashboard', blockchainController.getDashboard);
router.get('/network', blockchainController.getNetworkStats);
router.get('/health', blockchainController.getHealth);

module.exports = router;
