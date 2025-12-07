const arbitrationService = require("../services/arbitrationService");

/**
 * Controller for managing HTTP requests related to Arbitration
 * @notice Manages decentralized arbitration system with community voting
 * @dev Integrates arbitrationService
 */

/**
 * Votes on a dispute (decentralized arbitration)
 * @dev Uses arbitrationService to record vote with real voting power
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function voteDispute(req, res) {
  try {
    const disputeId = req.params.id || req.orderId;
    const { winner } = req.body;
    const userAddress = req.userAddress || req.body.voterAddress;
    
    if (!disputeId || isNaN(parseInt(disputeId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid disputeId is required"
      });
    }
    
    if (!winner || !['CLIENT', 'RESTAURANT', 'DELIVERER'].includes(winner)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "winner must be one of: CLIENT, RESTAURANT, DELIVERER"
      });
    }
    
    if (!userAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userAddress is required (from auth or body)"
      });
    }
    
    // Utiliser arbitrationService pour enregistrer le vote
    const result = await arbitrationService.voteDispute(
      parseInt(disputeId),
      winner,
      userAddress
    );
    
    return res.status(200).json({
      success: true,
      data: {
        txHash: result.txHash,
        disputeId: parseInt(disputeId),
        vote: {
          voter: userAddress,
          winner: result.vote,
          votingPower: result.votingPower,
          timestamp: new Date().toISOString()
        },
        leadingWinner: result.leadingWinner
      }
    });
  } catch (error) {
    console.error("Error voting on dispute:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to vote on dispute",
      details: error.message
    });
  }
}

/**
 * Gets all votes for a dispute
 * @dev Uses arbitrationService to get real vote distribution
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDisputeVotes(req, res) {
  try {
    const disputeId = req.params.id || req.orderId;
    
    if (!disputeId || isNaN(parseInt(disputeId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid disputeId is required"
      });
    }
    
    // Utiliser arbitrationService pour obtenir la distribution des votes
    const votes = await arbitrationService.getDisputeVotes(parseInt(disputeId));
    
    return res.status(200).json({
      success: true,
      data: {
        disputeId: parseInt(disputeId),
        votes: {
          CLIENT: {
            count: votes.votes.CLIENT,
            totalPower: votes.votes.CLIENT + " DONE",
            percentage: votes.percentages.CLIENT
          },
          RESTAURANT: {
            count: votes.votes.RESTAURANT,
            totalPower: votes.votes.RESTAURANT + " DONE",
            percentage: votes.percentages.RESTAURANT
          },
          DELIVERER: {
            count: votes.votes.DELIVERER,
            totalPower: votes.votes.DELIVERER + " DONE",
            percentage: votes.percentages.DELIVERER
          }
        },
        totalVotePower: votes.totalVotePower,
        leading: votes.leadingWinner
      }
    });
  } catch (error) {
    console.error("Error getting dispute votes:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get dispute votes",
      details: error.message
    });
  }
}

/**
 * Automatically resolves a dispute after voting
 * @dev Uses arbitrationService to resolve dispute with blockchain transaction
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function resolveDispute(req, res) {
  try {
    const disputeId = req.params.disputeId || req.params.id || req.orderId;
    
    if (!disputeId || isNaN(parseInt(disputeId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid disputeId is required"
      });
    }
    
    // Utiliser arbitrationService pour résoudre le litige
    const result = await arbitrationService.resolveDispute(parseInt(disputeId));
    
    return res.status(200).json({
      success: true,
      data: {
        txHash: result.txHash,
        disputeId: parseInt(disputeId),
        winner: result.winner,
        resolution: "automatic",
        totalVotePower: result.totalVotePower,
        voteDistribution: result.voteDistribution,
        resolutionTime: result.resolutionTime
      }
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve dispute",
      details: error.message
    });
  }
}

/**
 * Creates a new dispute
 * @dev Uses arbitrationService to create dispute
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function createDispute(req, res) {
  try {
    const { orderId, reason, evidenceIPFS } = req.body;
    const userAddress = req.userAddress || req.body.userAddress;
    
    if (!orderId || isNaN(parseInt(orderId))) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid orderId is required"
      });
    }
    
    if (!userAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userAddress is required (from auth or body)"
      });
    }
    
    const result = await arbitrationService.createDispute(
      parseInt(orderId),
      reason || "No reason provided",
      evidenceIPFS || null,
      userAddress
    );
    
    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create dispute",
      details: error.message
    });
  }
}

/**
 * Gets dispute details
 * @dev Uses arbitrationService to get dispute
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getDispute(req, res) {
  try {
    const disputeId = parseInt(req.params.disputeId || req.params.id || req.orderId);
    
    if (!disputeId || isNaN(disputeId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Valid disputeId is required"
      });
    }
    
    const dispute = await arbitrationService.getDispute(disputeId);
    
    return res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    console.error("Error getting dispute:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get dispute",
      details: error.message
    });
  }
}

/**
 * Gets arbitration performance metrics
 * @dev Uses arbitrationService to get metrics
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getArbitrationMetrics(req, res) {
  try {
    const metrics = arbitrationService.getArbitrationMetrics();
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Error getting arbitration metrics:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get arbitration metrics",
      details: error.message
    });
  }
}

module.exports = {
  createDispute,
  voteDispute,
  getDisputeVotes,
  resolveDispute,
  getDispute,
  getArbitrationMetrics
};

