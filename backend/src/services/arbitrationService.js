const { ethers } = require("ethers");
const { getProvider, getContractInstance } = require("../config/blockchain");
const Order = require("../models/Order");
const { getSocketIO } = require("./notificationService");
const ipfsService = require("./ipfsService");
require("dotenv").config();

/**
 * Arbitration Service - Decentralized dispute management system
 * 
 * Manages disputes with tokenized community voting
 */

// Configuration
const VOTING_PERIOD = 48 * 60 * 60; // 48 hours in seconds
const MIN_VOTING_POWER = ethers.parseEther('1000'); // 1000 DONE tokens minimum

// Performance metrics
let totalDisputes = 0;
let resolvedDisputes = 0;
let averageResolutionTime = 0;
let totalVotes = 0;
let averageVotingPower = 0;

/**
 * Create a new dispute for an order
 * @param {number} orderId - Order ID
 * @param {string} reason - Dispute reason
 * @param {string} evidenceIPFS - IPFS hash of evidence
 * @param {string} userAddress - Address of user creating dispute
 * @returns {Promise<Object>} { disputeId, orderId, txHash, votingDeadline, creationTime }
 */
async function createDispute(orderId, reason, evidenceIPFS, userAddress) {
  const startTime = Date.now();
  totalDisputes++;
  
  try {
    // 1. Verify order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }
    
    // 2. Verify user is stakeholder
    const isStakeholder =
      order.client?.toString() === userAddress.toLowerCase() ||
      order.restaurant?.toString() === userAddress.toLowerCase() ||
      order.deliverer?.toString() === userAddress.toLowerCase();
    
    if (!isStakeholder) {
      throw new Error('User not authorized to create dispute');
    }
    
    // 3. Verify order is disputable
    const disputableStatuses = ['IN_DELIVERY', 'DELIVERED'];
    if (!disputableStatuses.includes(order.status)) {
      throw new Error('Order cannot be disputed at this stage');
    }
    
    // 4. Upload evidence to IPFS if files provided
    let finalEvidenceIPFS = evidenceIPFS;
    if (!finalEvidenceIPFS) {
      // Create default evidence JSON
      const evidenceData = {
        orderId,
        reason,
        createdAt: new Date().toISOString()
      };
      const uploadResult = await ipfsService.uploadJSON(evidenceData);
      finalEvidenceIPFS = uploadResult.ipfsHash;
    }
    
    // 5. Create dispute on-chain (using blockchainService)
    const blockchainService = require('./blockchainService');
    const userPrivateKey = process.env.BACKEND_PRIVATE_KEY; // In production, get from user
    
    const result = await blockchainService.openDispute(
      orderId,
      userAddress,
      reason || '',
      userPrivateKey
    );
    
    console.log(`📝 Dispute creation transaction: ${result.txHash}`);
    
    // 6. Parse dispute ID from transaction (if available)
    // Note: In a real implementation, we'd parse the DisputeOpened event
    const disputeId = orderId; // Use orderId as disputeId for now
    
    console.log(`✓ Dispute created on-chain: #${disputeId} (block ${result.blockNumber})`);
    
    // 7. Update order in MongoDB (off-chain)
    order.status = 'DISPUTED';
    order.disputeReason = reason;
    order.disputeEvidence = finalEvidenceIPFS;
    await order.save();
    
    // Measure latency
    const creationTime = Date.now() - startTime;
    console.log(`✓ Dispute creation completed in ${creationTime}ms`);
    
    // 8. Notify stakeholders via Socket.io
    const io = getSocketIO();
    if (io) {
      io.to(`order_${orderId}`).emit('disputeCreated', {
        disputeId,
        orderId,
        reason,
        votingDeadline: new Date(Date.now() + VOTING_PERIOD * 1000)
      });
    }
    
    return {
      disputeId,
      orderId,
      txHash: result.txHash,
      votingDeadline: new Date(Date.now() + VOTING_PERIOD * 1000),
      creationTime: `${creationTime}ms`
    };
  } catch (error) {
    console.error('❌ createDispute ERROR:', error.message);
    throw error;
  }
}

/**
 * Record a vote for a dispute
 * @param {number} disputeId - Dispute ID
 * @param {string} winner - Chosen winner (CLIENT, RESTAURANT, or DELIVERER)
 * @param {string} voterAddress - Voter address
 * @returns {Promise<Object>} { success, disputeId, vote, votingPower, leadingWinner, txHash }
 */
async function voteDispute(disputeId, winner, voterAddress) {
  totalVotes++;
  
  try {
    // 1. Verify dispute exists
    const order = await Order.findOne({ orderId: disputeId });
    if (!order || order.status !== 'DISPUTED') {
      throw new Error('Dispute not found or not in voting phase');
    }
    
    // 2. Verify dispute is in voting phase
    if (order.status !== 'DISPUTED') {
      throw new Error('Dispute is not in voting phase');
    }
    
    // 3. Calculate voting power (DONE token balance)
    const blockchainService = require('./blockchainService');
    const balanceWei = await blockchainService.getTokenBalance(voterAddress);
    const votingPower = ethers.parseEther(balanceWei);
    
    if (votingPower.toString() === '0') {
      throw new Error('No voting power (0 DONE tokens)');
    }
    
    console.log(`📊 Voting power: ${ethers.formatEther(votingPower)} DONE`);
    
    // 4. Validate winner choice
    const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
    if (!validWinners.includes(winner)) {
      throw new Error('Invalid winner choice');
    }
    
    // 5. Record vote on-chain (if arbitration contract exists)
    // Note: In a real implementation, we'd call an arbitration contract
    // For now, we'll just update MongoDB
    const votingPowerFloat = parseFloat(ethers.formatEther(votingPower));
    averageVotingPower = (averageVotingPower + votingPowerFloat) / 2;
    
    // 6. Update MongoDB with vote
    // Note: In a real implementation, we'd have a separate Dispute model
    // For now, we'll store votes in the order document
    if (!order.disputeVotes) {
      order.disputeVotes = {
        CLIENT: 0,
        RESTAURANT: 0,
        DELIVERER: 0
      };
    }
    
    order.disputeVotes[winner] += votingPowerFloat;
    if (!order.disputeTotalVotePower) {
      order.disputeTotalVotePower = 0;
    }
    order.disputeTotalVotePower += votingPowerFloat;
    
    // Calculate leading winner
    const maxVotes = Math.max(
      order.disputeVotes.CLIENT,
      order.disputeVotes.RESTAURANT,
      order.disputeVotes.DELIVERER
    );
    
    if (order.disputeVotes.CLIENT === maxVotes) {
      order.disputeLeadingWinner = 'CLIENT';
    } else if (order.disputeVotes.RESTAURANT === maxVotes) {
      order.disputeLeadingWinner = 'RESTAURANT';
    } else if (order.disputeVotes.DELIVERER === maxVotes) {
      order.disputeLeadingWinner = 'DELIVERER';
    }
    
    await order.save();
    
    // 7. Notify via Socket.io
    const io = getSocketIO();
    if (io) {
      io.to(`dispute_${disputeId}`).emit('voteCast', {
        disputeId,
        voter: voterAddress,
        winner,
        votingPower: ethers.formatEther(votingPower),
        leadingWinner: order.disputeLeadingWinner,
        voteDistribution: order.disputeVotes
      });
    }
    
    return {
      success: true,
      disputeId,
      vote: winner,
      votingPower: ethers.formatEther(votingPower) + ' DONE',
      leadingWinner: order.disputeLeadingWinner,
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000000' // Placeholder
    };
  } catch (error) {
    console.error('❌ voteDispute ERROR:', error.message);
    throw error;
  }
}

/**
 * Resolve dispute after voting period
 * @param {number} disputeId - Dispute ID
 * @returns {Promise<Object>} { disputeId, winner, totalVotePower, voteDistribution, txHash, resolutionTime }
 */
async function resolveDispute(disputeId) {
  const startTime = Date.now();
  
  try {
    // 1. Verify dispute exists
    const order = await Order.findOne({ orderId: disputeId });
    if (!order) {
      throw new Error('Dispute not found');
    }
    
    // 2. Verify dispute is in voting phase
    if (order.status !== 'DISPUTED') {
      throw new Error('Dispute already resolved');
    }
    
    // 3. Verify voting period is ended
    // Note: In a real implementation, we'd check votingDeadline
    // For now, we'll assume it's called after the voting period
    
    // 4. Verify there are enough votes (minimum 1000 DONE)
    if (!order.disputeTotalVotePower || order.disputeTotalVotePower < 1000) {
      throw new Error('Not enough voting power (minimum 1000 DONE required)');
    }
    
    // 5. Verify there is a clear winner
    if (!order.disputeLeadingWinner) {
      throw new Error('No clear winner');
    }
    
    console.log(`🏆 Resolving dispute #${disputeId} - Winner: ${order.disputeLeadingWinner}`);
    
    // 6. Resolve on-chain (using blockchainService)
    const blockchainService = require('./blockchainService');
    const arbitratorPrivateKey = process.env.ARBITER_PRIVATE_KEY || process.env.BACKEND_PRIVATE_KEY;
    
    // Map winner to address
    let winnerAddress;
    if (order.disputeLeadingWinner === 'CLIENT') {
      winnerAddress = order.client;
    } else if (order.disputeLeadingWinner === 'RESTAURANT') {
      winnerAddress = order.restaurant;
    } else {
      winnerAddress = order.deliverer;
    }
    
    const result = await blockchainService.resolveDispute(
      disputeId,
      winnerAddress,
      100, // 100% refund to winner
      process.env.ARBITER_ADDRESS || process.env.BACKEND_ADDRESS,
      arbitratorPrivateKey
    );
    
    console.log(`📝 Resolution transaction: ${result.txHash}`);
    
    // 7. Update MongoDB
    order.status = 'RESOLVED';
    order.disputeWinner = order.disputeLeadingWinner;
    await order.save();
    
    resolvedDisputes++;
    
    // Measure resolution time
    const resolutionTime = Date.now() - startTime;
    const totalDisputeTime = Date.now() - order.createdAt;
    averageResolutionTime = (averageResolutionTime + totalDisputeTime) / 2;
    
    console.log(`✓ Dispute resolved in ${resolutionTime}ms (total: ${totalDisputeTime / 1000 / 60 / 60}h)`);
    
    // 8. Notify stakeholders
    const io = getSocketIO();
    if (io) {
      io.to(`dispute_${disputeId}`).emit('disputeResolved', {
        disputeId,
        winner: order.disputeLeadingWinner,
        totalVotePower: order.disputeTotalVotePower,
        voteDistribution: order.disputeVotes
      });
    }
    
    return {
      disputeId,
      winner: order.disputeLeadingWinner,
      totalVotePower: order.disputeTotalVotePower,
      voteDistribution: order.disputeVotes,
      txHash: result.txHash,
      resolutionTime: `${resolutionTime}ms`
    };
  } catch (error) {
    console.error('❌ resolveDispute ERROR:', error.message);
    throw error;
  }
}

/**
 * Get dispute details
 * @param {number} disputeId - Dispute ID
 * @returns {Promise<Object>} Complete dispute details
 */
async function getDispute(disputeId) {
  try {
    // 1. Get from MongoDB (faster)
    const order = await Order.findOne({ orderId: disputeId }).lean();
    
    if (order && order.status === 'DISPUTED') {
      return {
        disputeId,
        orderId: order.orderId,
        client: order.client,
        restaurant: order.restaurant,
        deliverer: order.deliverer,
        reason: order.disputeReason,
        evidenceIPFS: order.disputeEvidence,
        status: order.status,
        leadingWinner: order.disputeLeadingWinner,
        totalVotePower: order.disputeTotalVotePower || 0,
        votes: order.disputeVotes || { CLIENT: 0, RESTAURANT: 0, DELIVERER: 0 },
        createdAt: order.createdAt,
        resolvedAt: order.status === 'RESOLVED' ? order.updatedAt : null
      };
    }
    
    throw new Error('Dispute not found');
  } catch (error) {
    console.error('❌ getDispute ERROR:', error.message);
    throw error;
  }
}

/**
 * Calculate user voting power
 * @param {string} address - User address
 * @returns {Promise<Object>} { address, votingPower, formattedPower, canVote }
 */
async function getVotingPower(address) {
  try {
    // Get DONE token balance
    const blockchainService = require('./blockchainService');
    const balance = await blockchainService.getTokenBalance(address);
    const votingPower = parseFloat(balance);
    
    return {
      address,
      votingPower: votingPower,
      formattedPower: votingPower + ' DONE',
      canVote: votingPower > 0
    };
  } catch (error) {
    console.error('❌ getVotingPower ERROR:', error.message);
    throw error;
  }
}

/**
 * Get vote distribution for a dispute
 * @param {number} disputeId - Dispute ID
 * @returns {Promise<Object>} { disputeId, votes, percentages, totalVotePower, leadingWinner }
 */
async function getDisputeVotes(disputeId) {
  try {
    // 1. Get distribution from MongoDB
    const order = await Order.findOne({ orderId: disputeId });
    if (!order || !order.disputeVotes) {
      throw new Error('Dispute votes not found');
    }
    
    const clientVotes = order.disputeVotes.CLIENT || 0;
    const restaurantVotes = order.disputeVotes.RESTAURANT || 0;
    const delivererVotes = order.disputeVotes.DELIVERER || 0;
    const totalVotes = clientVotes + restaurantVotes + delivererVotes;
    
    // 2. Calculate percentages
    return {
      disputeId,
      votes: {
        CLIENT: clientVotes,
        RESTAURANT: restaurantVotes,
        DELIVERER: delivererVotes
      },
      percentages: {
        CLIENT: totalVotes > 0 ? (clientVotes / totalVotes * 100).toFixed(2) + '%' : '0%',
        RESTAURANT: totalVotes > 0 ? (restaurantVotes / totalVotes * 100).toFixed(2) + '%' : '0%',
        DELIVERER: totalVotes > 0 ? (delivererVotes / totalVotes * 100).toFixed(2) + '%' : '0%'
      },
      totalVotePower: totalVotes + ' DONE',
      leadingWinner: order.disputeLeadingWinner || 'NONE'
    };
  } catch (error) {
    console.error('❌ getDisputeVotes ERROR:', error.message);
    throw error;
  }
}

/**
 * Get arbitration performance metrics
 * @returns {Object} Complete metrics
 */
function getArbitrationMetrics() {
  const resolutionRate = totalDisputes > 0
    ? ((resolvedDisputes / totalDisputes) * 100).toFixed(2)
    : 0;
  
  return {
    totalDisputes,
    resolvedDisputes,
    resolutionRate: `${resolutionRate}%`,
    averageResolutionTime: `${(averageResolutionTime / 1000 / 60 / 60).toFixed(2)}h`,
    totalVotes,
    averageVotingPower: `${averageVotingPower.toFixed(2)} DONE`
  };
}

module.exports = {
  createDispute,
  voteDispute,
  resolveDispute,
  getDispute,
  getVotingPower,
  getDisputeVotes,
  getArbitrationMetrics
};
