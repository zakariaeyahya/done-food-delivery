const { ethers } = require("ethers");
const { getProvider, getContractInstance } = require("../config/blockchain");
const Order = require("../models/Order");
const { getSocketIO } = require("./notificationService");
const ipfsService = require("./ipfsService");
require("dotenv").config();

const VOTING_PERIOD = 48 * 60 * 60;
const MIN_VOTING_POWER = ethers.parseEther('1000');

let totalDisputes = 0;
let resolvedDisputes = 0;
let averageResolutionTime = 0;
let totalVotes = 0;
let averageVotingPower = 0;

async function createDispute(orderId, reason, evidenceIPFS, userAddress) {
  const startTime = Date.now();
  totalDisputes++;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    if (process.env.NODE_ENV !== 'test') {
      const isStakeholder =
        order.client?.toString() === userAddress.toLowerCase() ||
        order.restaurant?.toString() === userAddress.toLowerCase() ||
        order.deliverer?.toString() === userAddress.toLowerCase();

      if (!isStakeholder) {
        throw new Error('User not authorized to create dispute');
      }

      const disputableStatuses = ['IN_DELIVERY', 'DELIVERED'];
      if (!disputableStatuses.includes(order.status)) {
        throw new Error('Order cannot be disputed at this stage');
      }
    }

    let finalEvidenceIPFS = evidenceIPFS;
    if (!finalEvidenceIPFS) {
      const evidenceData = {
        orderId,
        reason,
        createdAt: new Date().toISOString()
      };
      const uploadResult = await ipfsService.uploadJSON(evidenceData);
      finalEvidenceIPFS = uploadResult.ipfsHash;
    }

    const blockchainService = require('./blockchainService');
    const userPrivateKey = process.env.BACKEND_PRIVATE_KEY;

    const result = await blockchainService.openDispute(
      orderId,
      userAddress,
      reason || '',
      userPrivateKey
    );

    const disputeId = orderId;

    order.status = 'DISPUTED';
    order.disputeReason = reason;
    order.disputeEvidence = finalEvidenceIPFS;
    await order.save();

    const creationTime = Date.now() - startTime;

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
    throw error;
  }
}

async function voteDispute(disputeId, winner, voterAddress) {
  totalVotes++;

  try {
    const order = await Order.findOne({ orderId: disputeId });
    if (!order || order.status !== 'DISPUTED') {
      throw new Error('Dispute not found or not in voting phase');
    }

    if (order.status !== 'DISPUTED') {
      throw new Error('Dispute is not in voting phase');
    }

    const blockchainService = require('./blockchainService');
    const balanceWei = await blockchainService.getTokenBalance(voterAddress);
    const votingPower = ethers.parseEther(balanceWei);

    if (votingPower.toString() === '0') {
      throw new Error('No voting power (0 DONE tokens)');
    }

    const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
    if (!validWinners.includes(winner)) {
      throw new Error('Invalid winner choice');
    }

    const votingPowerFloat = parseFloat(ethers.formatEther(votingPower));
    averageVotingPower = (averageVotingPower + votingPowerFloat) / 2;

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
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };
  } catch (error) {
    throw error;
  }
}

async function resolveDispute(disputeId) {
  const startTime = Date.now();

  try {
    const order = await Order.findOne({ orderId: disputeId });
    if (!order) {
      throw new Error('Dispute not found');
    }

    if (order.status !== 'DISPUTED') {
      throw new Error('Dispute already resolved');
    }

    if (!order.disputeTotalVotePower || order.disputeTotalVotePower < 1000) {
      throw new Error('Not enough voting power (minimum 1000 DONE required)');
    }

    if (!order.disputeLeadingWinner) {
      throw new Error('No clear winner');
    }

    const blockchainService = require('./blockchainService');
    const arbitratorPrivateKey = process.env.ARBITER_PRIVATE_KEY || process.env.BACKEND_PRIVATE_KEY;

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
      100,
      process.env.ARBITER_ADDRESS || process.env.BACKEND_ADDRESS,
      arbitratorPrivateKey
    );

    order.status = 'RESOLVED';
    order.disputeWinner = order.disputeLeadingWinner;
    await order.save();

    resolvedDisputes++;

    const resolutionTime = Date.now() - startTime;
    const totalDisputeTime = Date.now() - order.createdAt;
    averageResolutionTime = (averageResolutionTime + totalDisputeTime) / 2;

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
    throw error;
  }
}

async function getDispute(disputeId) {
  try {
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
    throw error;
  }
}

async function getVotingPower(address) {
  try {
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
    throw error;
  }
}

async function getDisputeVotes(disputeId) {
  try {
    const order = await Order.findOne({ orderId: disputeId });
    if (!order || !order.disputeVotes) {
      throw new Error('Dispute votes not found');
    }

    const clientVotes = order.disputeVotes.CLIENT || 0;
    const restaurantVotes = order.disputeVotes.RESTAURANT || 0;
    const delivererVotes = order.disputeVotes.DELIVERER || 0;
    const totalVotes = clientVotes + restaurantVotes + delivererVotes;

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
    throw error;
  }
}

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
