const blockchainService = require("../services/blockchainService");

/**
 * Controller for managing HTTP requests related to DONE Tokens
 * @notice Manages operations on DONE tokens (burn, use-discount, rate)
 * @dev Integrates blockchainService for interactions with DoneToken.sol
 */

/**
 * Gets DONE token conversion rate
 * @dev Returns conversion rates for promotions
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function getTokenRate(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        rate: {
          "1 DONE": "0.10 EUR",
          "10 DONE": "1.00 EUR",
          "100 DONE": "10.00 EUR"
        },
        mintingRate: "1 DONE per 10 EUR spent"
      }
    });
  } catch (error) {
    console.error("Error getting token rate:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get token rate",
      details: error.message
    });
  }
}

/**
 * Burns DONE tokens for a promotion/discount
 * @dev Uses blockchainService to burn tokens on-chain
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function burnTokens(req, res) {
  try {
    const { amount, orderId, discountAmount } = req.body;
    const userAddress = req.userAddress || req.body.userAddress;
    const userPrivateKey = req.body.userPrivateKey;
    
    if (!userAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userAddress is required (from auth or body)"
      });
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "amount must be a positive number"
      });
    }
    
    if (!userPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userPrivateKey is required to sign the burn transaction"
      });
    }
    
    // Utiliser blockchainService pour brûler les tokens
    const result = await blockchainService.burnTokens(
      userAddress,
      amount.toString(),
      userPrivateKey
    );
    
    // Calculer le discount appliqué (1 DONE = 0.10 EUR)
    const calculatedDiscount = (parseFloat(amount) * 0.10).toFixed(2);
    const appliedDiscount = discountAmount || calculatedDiscount;
    
    // Récupérer la nouvelle balance
    const newBalance = await blockchainService.getTokenBalance(userAddress);
    
    return res.status(200).json({
      success: true,
      data: {
        txHash: result.txHash,
        burned: `${amount} DONE`,
        discountApplied: appliedDiscount,
        newBalance: `${newBalance} DONE`,
        blockNumber: result.blockNumber
      }
    });
  } catch (error) {
    console.error("Error burning tokens:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to burn tokens",
      details: error.message
    });
  }
}

/**
 * Uses DONE tokens to get a discount on an order
 * @dev Uses blockchainService to burn tokens and calculate discount
 * 
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 */
async function useDiscount(req, res) {
  try {
    const { tokensToUse, orderId } = req.body;
    const userAddress = req.userAddress || req.body.userAddress;
    const userPrivateKey = req.body.userPrivateKey;
    
    if (!userAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userAddress is required (from auth or body)"
      });
    }
    
    if (!tokensToUse || isNaN(parseFloat(tokensToUse)) || parseFloat(tokensToUse) <= 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "tokensToUse must be a positive number"
      });
    }
    
    if (!userPrivateKey) {
      return res.status(400).json({
        error: "Bad Request",
        message: "userPrivateKey is required to sign the burn transaction"
      });
    }
    
    // Vérifier que l'utilisateur a assez de tokens
    const balance = await blockchainService.getTokenBalance(userAddress);
    if (parseFloat(balance) < parseFloat(tokensToUse)) {
      return res.status(400).json({
        error: "Bad Request",
        message: `Insufficient balance: ${balance} DONE < ${tokensToUse} DONE`
      });
    }
    
    // Calculer le montant de la réduction (1 DONE = 0.10 EUR)
    const discountAmount = (parseFloat(tokensToUse) * 0.10).toFixed(2);
    
    // Brûler les tokens via blockchainService
    const burnResult = await blockchainService.burnTokens(
      userAddress,
      tokensToUse.toString(),
      userPrivateKey
    );
    
    // Récupérer la nouvelle balance
    const newBalance = await blockchainService.getTokenBalance(userAddress);
    
    return res.status(200).json({
      success: true,
      data: {
        tokensUsed: `${tokensToUse} DONE`,
        discountAmount: discountAmount,
        txHash: burnResult.txHash,
        newBalance: `${newBalance} DONE`,
        blockNumber: burnResult.blockNumber
      }
    });
  } catch (error) {
    console.error("Error using discount:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to use discount",
      details: error.message
    });
  }
}

module.exports = {
  getTokenRate,
  burnTokens,
  useDiscount
};

