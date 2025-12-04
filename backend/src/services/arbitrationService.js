/**
 * Service Arbitration - Gestion système arbitrage décentralisé
 * @fileoverview Gère les litiges avec vote communautaire tokenisé
 * @see backend/src/services/README_SPRINT6.md pour documentation complète
 */

// TODO: Importer dépendances
// const { ethers } = require('ethers');
// const DoneArbitration = require('../../../contracts/artifacts/DoneArbitration.json');
// const DoneToken = require('../../../contracts/artifacts/DoneToken.json');
// const Dispute = require('../models/Dispute');
// const Order = require('../models/Order');
// const io = require('../socket'); // Socket.io instance

// === CONFIGURATION ===

// TODO: Variables d'environnement
// const ARBITRATION_ADDRESS = process.env.ARBITRATION_CONTRACT_ADDRESS;
// const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
// const RPC_URL = process.env.RPC_URL;
// const VOTING_PERIOD = 48 * 60 * 60; // 48 heures en secondes
// const MIN_VOTING_POWER = ethers.parseEther('1000'); // 1000 DONE tokens minimum
// const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY; // Wallet backend
// const ARBITER_PRIVATE_KEY = process.env.ARBITER_PRIVATE_KEY; // Wallet arbitre

// TODO: Initialiser provider et contrats
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const arbitration = new ethers.Contract(
//   ARBITRATION_ADDRESS,
//   DoneArbitration.abi,
//   provider
// );
// const doneToken = new ethers.Contract(
//   TOKEN_ADDRESS,
//   DoneToken.abi,
//   provider
// );

// === MÉTRIQUES DE PERFORMANCE ===

// TODO: Variables pour métriques
// let totalDisputes = 0;
// let resolvedDisputes = 0;
// let averageResolutionTime = 0;
// let totalVotes = 0;
// let averageVotingPower = 0;

/**
 * 1. Crée un nouveau litige pour une commande
 * @param {number} orderId - ID de la commande
 * @param {string} reason - Raison du litige
 * @param {string} evidenceIPFS - Hash IPFS des preuves
 * @param {string} userAddress - Adresse de l'utilisateur créant le litige
 * @returns {Promise<Object>} { disputeId, orderId, txHash, votingDeadline, creationTime }
 * @dev Métriques: totalDisputes, averageCreationTime
 */
// TODO: Implémenter createDispute(orderId, reason, evidenceIPFS, userAddress)
// async function createDispute(orderId, reason, evidenceIPFS, userAddress) {
//   const startTime = Date.now();
//   totalDisputes++;
//   
//   ESSAYER:
//     // 1. Vérifier que la commande existe
//     const order = await Order.findOne({ orderId });
//     SI !order:
//       throw new Error('Order not found');
//     
//     // 2. Vérifier que l'utilisateur est partie prenante
//     const isStakeholder =
//       order.client.toLowerCase() === userAddress.toLowerCase() ||
//       order.restaurant.toLowerCase() === userAddress.toLowerCase() ||
//       order.deliverer?.toLowerCase() === userAddress.toLowerCase();
//     
//     SI !isStakeholder:
//       throw new Error('User not authorized to create dispute');
//     
//     // 3. Vérifier que la commande est disputable
//     const disputableStatuses = ['IN_DELIVERY', 'DELIVERED'];
//     SI !disputableStatuses.includes(order.status):
//       throw new Error('Order cannot be disputed at this stage');
//     
//     // 4. Upload evidence vers IPFS si fichiers fournis
//     let finalEvidenceIPFS = evidenceIPFS;
//     SI !finalEvidenceIPFS:
//       // TODO: Upload via ipfsService si nécessaire
//       finalEvidenceIPFS = 'QmDefaultEvidence...';
//     
//     // 5. Créer dispute on-chain
//     const wallet = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
//     const arbitrationWithSigner = arbitration.connect(wallet);
//     
//     const tx = await arbitrationWithSigner.createDispute(
//       orderId,
//       reason,
//       finalEvidenceIPFS
//     );
//     
//     console.log(`📝 Dispute creation transaction: ${tx.hash}`);
//     
//     const receipt = await tx.wait();
//     
//     // 6. Parser event pour récupérer disputeId
//     const event = receipt.logs.find(log =>
//       log.topics[0] === ethers.id('DisputeCreated(uint256,uint256,address,string)')
//     );
//     const disputeId = parseInt(event.topics[1], 16);
//     
//     console.log(`✓ Dispute created on-chain: #${disputeId} (block ${receipt.blockNumber})`);
//     
//     // 7. Créer dispute dans MongoDB (off-chain)
//     const dispute = new Dispute({
//       disputeId,
//       orderId,
//       client: order.client,
//       restaurant: order.restaurant,
//       deliverer: order.deliverer,
//       reason,
//       evidenceIPFS: finalEvidenceIPFS,
//       status: 'VOTING',
//       createdAt: new Date(),
//       votingDeadline: new Date(Date.now() + VOTING_PERIOD * 1000),
//       votes: {
//         CLIENT: 0,
//         RESTAURANT: 0,
//         DELIVERER: 0
//       }
//     });
//     
//     await dispute.save();
//     
//     // 8. Mettre à jour order status
//     order.status = 'DISPUTED';
//     order.disputeId = disputeId;
//     await order.save();
//     
//     // MESURE LATENCE
//     const creationTime = Date.now() - startTime;
//     console.log(`✓ Dispute creation completed in ${creationTime}ms`);
//     
//     // 9. Notifier les parties prenantes via Socket.io
//     io.to(`order_${orderId}`).emit('disputeCreated', {
//       disputeId,
//       orderId,
//       reason,
//       votingDeadline: dispute.votingDeadline
//     });
//     
//     RETOURNER {
//       disputeId,
//       orderId,
//       txHash: tx.hash,
//       votingDeadline: dispute.votingDeadline,
//       creationTime: `${creationTime}ms`
//     };
//   CATCH error:
//     console.error('❌ createDispute ERROR:', error.message);
//     throw error;
// }

/**
 * 2. Enregistre un vote pour un litige
 * @param {number} disputeId - ID du litige
 * @param {string} winner - Gagnant choisi (CLIENT, RESTAURANT, ou DELIVERER)
 * @param {string} voterAddress - Adresse du votant
 * @returns {Promise<Object>} { success, disputeId, vote, votingPower, leadingWinner, txHash }
 * @dev Métriques: totalVotes, averageVotingPower
 */
// TODO: Implémenter voteDispute(disputeId, winner, voterAddress)
// async function voteDispute(disputeId, winner, voterAddress) {
//   totalVotes++;
//   
//   ESSAYER:
//     // 1. Vérifier que le litige existe
//     const dispute = await Dispute.findOne({ disputeId });
//     SI !dispute:
//       throw new Error('Dispute not found');
//     
//     // 2. Vérifier que le litige est en phase de vote
//     SI dispute.status !== 'VOTING':
//       throw new Error('Dispute is not in voting phase');
//     
//     // 3. Vérifier que l'utilisateur n'a pas déjà voté
//     const hasVoted = await arbitration.hasVoted(disputeId, voterAddress);
//     SI hasVoted:
//       throw new Error('User has already voted');
//     
//     // 4. Calculer pouvoir de vote (balance tokens DONE)
//     const votingPower = await doneToken.balanceOf(voterAddress);
//     
//     SI votingPower.toString() === '0':
//       throw new Error('No voting power (0 DONE tokens)');
//     
//     console.log(`📊 Voting power: ${ethers.formatEther(votingPower)} DONE`);
//     
//     // 5. Valider le choix du gagnant
//     const validWinners = ['CLIENT', 'RESTAURANT', 'DELIVERER'];
//     SI !validWinners.includes(winner):
//       throw new Error('Invalid winner choice');
//     
//     // 6. Enregistrer vote on-chain
//     const wallet = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
//     const arbitrationWithSigner = arbitration.connect(wallet);
//     
//     // Convertir winner en enum (1=CLIENT, 2=RESTAURANT, 3=DELIVERER)
//     const winnerEnum = validWinners.indexOf(winner) + 1;
//     
//     const tx = await arbitrationWithSigner.voteDispute(disputeId, winnerEnum);
//     console.log(`📝 Vote transaction: ${tx.hash}`);
//     
//     const receipt = await tx.wait();
//     console.log(`✓ Vote recorded on-chain (block ${receipt.blockNumber})`);
//     
//     // 7. Mettre à jour MongoDB
//     dispute.votes[winner] += parseFloat(ethers.formatEther(votingPower));
//     dispute.totalVotePower += parseFloat(ethers.formatEther(votingPower));
//     
//     // Calculer le gagnant actuel
//     const maxVotes = Math.max(
//       dispute.votes.CLIENT,
//       dispute.votes.RESTAURANT,
//       dispute.votes.DELIVERER
//     );
//     
//     SI dispute.votes.CLIENT === maxVotes:
//       dispute.leadingWinner = 'CLIENT';
//     SINON SI dispute.votes.RESTAURANT === maxVotes:
//       dispute.leadingWinner = 'RESTAURANT';
//     SINON SI dispute.votes.DELIVERER === maxVotes:
//       dispute.leadingWinner = 'DELIVERER';
//     
//     await dispute.save();
//     
//     // 8. Notifier via Socket.io
//     io.to(`dispute_${disputeId}`).emit('voteCast', {
//       disputeId,
//       voter: voterAddress,
//       winner,
//       votingPower: ethers.formatEther(votingPower),
//       leadingWinner: dispute.leadingWinner,
//       voteDistribution: dispute.votes
//     });
//     
//     RETOURNER {
//       success: true,
//       disputeId,
//       vote: winner,
//       votingPower: ethers.formatEther(votingPower) + ' DONE',
//       leadingWinner: dispute.leadingWinner,
//       txHash: tx.hash
//     };
//   CATCH error:
//     console.error('❌ voteDispute ERROR:', error.message);
//     throw error;
// }

/**
 * 3. Résout un litige après la période de vote
 * @param {number} disputeId - ID du litige
 * @returns {Promise<Object>} { disputeId, winner, totalVotePower, voteDistribution, txHash, resolutionTime }
 * @dev Métriques: totalResolved, resolutionRate, averageResolutionTime
 * @dev Cron Job: Toutes les heures (résolution automatique)
 * @dev Performance cible: Resolution Rate >80%, Avg Time <48h
 */
// TODO: Implémenter resolveDispute(disputeId)
// async function resolveDispute(disputeId) {
//   const startTime = Date.now();
//   
//   ESSAYER:
//     // 1. Vérifier que le litige existe
//     const dispute = await Dispute.findOne({ disputeId });
//     SI !dispute:
//       throw new Error('Dispute not found');
//     
//     // 2. Vérifier que le litige est en phase de vote
//     SI dispute.status !== 'VOTING':
//       throw new Error('Dispute already resolved');
//     
//     // 3. Vérifier que la période de vote est terminée
//     SI new Date() < dispute.votingDeadline:
//       throw new Error('Voting period not ended yet');
//     
//     // 4. Vérifier qu'il y a assez de votes (minimum 1000 DONE)
//     SI dispute.totalVotePower < 1000:
//       throw new Error('Not enough voting power (minimum 1000 DONE required)');
//     
//     // 5. Vérifier qu'il y a un gagnant clair
//     SI !dispute.leadingWinner:
//       throw new Error('No clear winner');
//     
//     console.log(`🏆 Resolving dispute #${disputeId} - Winner: ${dispute.leadingWinner}`);
//     
//     // 6. Résoudre on-chain
//     const wallet = new ethers.Wallet(ARBITER_PRIVATE_KEY, provider);
//     const arbitrationWithSigner = arbitration.connect(wallet);
//     
//     const tx = await arbitrationWithSigner.resolveDispute(disputeId);
//     console.log(`📝 Resolution transaction: ${tx.hash}`);
//     
//     const receipt = await tx.wait();
//     console.log(`✓ Dispute resolved on-chain (block ${receipt.blockNumber})`);
//     
//     // 7. Mettre à jour MongoDB
//     dispute.status = 'RESOLVED';
//     dispute.resolvedAt = new Date();
//     dispute.winner = dispute.leadingWinner;
//     await dispute.save();
//     
//     // 8. Mettre à jour order status
//     const order = await Order.findOne({ orderId: dispute.orderId });
//     SI order:
//       order.status = 'RESOLVED';
//       order.disputeWinner = dispute.leadingWinner;
//       await order.save();
//     
//     resolvedDisputes++;
//     
//     // MESURE TEMPS DE RÉSOLUTION
//     const resolutionTime = Date.now() - startTime;
//     const totalDisputeTime = dispute.resolvedAt - dispute.createdAt;
//     averageResolutionTime = (averageResolutionTime + totalDisputeTime) / 2;
//     
//     console.log(`✓ Dispute resolved in ${resolutionTime}ms (total: ${totalDisputeTime / 1000 / 60 / 60}h)`);
//     
//     // 9. Notifier les parties prenantes
//     io.to(`dispute_${disputeId}`).emit('disputeResolved', {
//       disputeId,
//       winner: dispute.leadingWinner,
//       totalVotePower: dispute.totalVotePower,
//       voteDistribution: dispute.votes
//     });
//     
//     RETOURNER {
//       disputeId,
//       winner: dispute.leadingWinner,
//       totalVotePower: dispute.totalVotePower,
//       voteDistribution: dispute.votes,
//       txHash: tx.hash,
//       resolutionTime: `${resolutionTime}ms`
//     };
//   CATCH error:
//     console.error('❌ resolveDispute ERROR:', error.message);
//     throw error;
// }

/**
 * 4. Récupère les détails d'un litige
 * @param {number} disputeId - ID du litige
 * @returns {Promise<Object>} Détails complets du litige
 */
// TODO: Implémenter getDispute(disputeId)
// async function getDispute(disputeId) {
//   ESSAYER:
//     // 1. Récupérer depuis MongoDB (plus rapide)
//     const dispute = await Dispute.findOne({ disputeId }).lean();
//     
//     SI dispute:
//       RETOURNER dispute;
//     
//     // 2. Fallback: récupérer depuis blockchain
//     const disputeOnChain = await arbitration.getDispute(disputeId);
//     
//     RETOURNER {
//       disputeId: parseInt(disputeOnChain.orderId),
//       orderId: parseInt(disputeOnChain.orderId),
//       client: disputeOnChain.client,
//       restaurant: disputeOnChain.restaurant,
//       deliverer: disputeOnChain.deliverer,
//       reason: disputeOnChain.reason,
//       evidenceIPFS: disputeOnChain.evidenceIPFS,
//       status: ['OPEN', 'VOTING', 'RESOLVED'][disputeOnChain.status],
//       leadingWinner: ['NONE', 'CLIENT', 'RESTAURANT', 'DELIVERER'][disputeOnChain.leadingWinner],
//       totalVotePower: ethers.formatEther(disputeOnChain.totalVotePower),
//       createdAt: new Date(parseInt(disputeOnChain.createdAt) * 1000),
//       resolvedAt: disputeOnChain.resolvedAt > 0 ?
//         new Date(parseInt(disputeOnChain.resolvedAt) * 1000) : null
//     };
//   CATCH error:
//     console.error('❌ getDispute ERROR:', error.message);
//     throw error;
// }

/**
 * 5. Calcule le pouvoir de vote d'un utilisateur
 * @param {string} address - Adresse de l'utilisateur
 * @returns {Promise<Object>} { address, votingPower, formattedPower, canVote }
 */
// TODO: Implémenter getVotingPower(address)
// async function getVotingPower(address) {
//   ESSAYER:
//     // Récupérer balance DONE tokens
//     const balance = await doneToken.balanceOf(address);
//     const votingPower = parseFloat(ethers.formatEther(balance));
//     
//     RETOURNER {
//       address,
//       votingPower: votingPower,
//       formattedPower: votingPower + ' DONE',
//       canVote: votingPower > 0
//     };
//   CATCH error:
//     console.error('❌ getVotingPower ERROR:', error.message);
//     throw error;
// }

/**
 * 6. Récupère la distribution des votes pour un litige
 * @param {number} disputeId - ID du litige
 * @returns {Promise<Object>} { disputeId, votes, percentages, totalVotePower, leadingWinner }
 */
// TODO: Implémenter getDisputeVotes(disputeId)
// async function getDisputeVotes(disputeId) {
//   ESSAYER:
//     // 1. Récupérer distribution depuis contrat
//     const voteDistribution = await arbitration.getVoteDistribution(disputeId);
//     
//     const clientVotes = parseFloat(ethers.formatEther(voteDistribution.clientVotes));
//     const restaurantVotes = parseFloat(ethers.formatEther(voteDistribution.restaurantVotes));
//     const delivererVotes = parseFloat(ethers.formatEther(voteDistribution.delivererVotes));
//     const totalVotes = clientVotes + restaurantVotes + delivererVotes;
//     
//     // 2. Calculer pourcentages
//     RETOURNER {
//       disputeId,
//       votes: {
//         CLIENT: clientVotes,
//         RESTAURANT: restaurantVotes,
//         DELIVERER: delivererVotes
//       },
//       percentages: {
//         CLIENT: totalVotes > 0 ? (clientVotes / totalVotes * 100).toFixed(2) + '%' : '0%',
//         RESTAURANT: totalVotes > 0 ? (restaurantVotes / totalVotes * 100).toFixed(2) + '%' : '0%',
//         DELIVERER: totalVotes > 0 ? (delivererVotes / totalVotes * 100).toFixed(2) + '%' : '0%'
//       },
//       totalVotePower: totalVotes + ' DONE',
//       leadingWinner: clientVotes > restaurantVotes && clientVotes > delivererVotes ? 'CLIENT' :
//                      restaurantVotes > delivererVotes ? 'RESTAURANT' : 'DELIVERER'
//     };
//   CATCH error:
//     console.error('❌ getDisputeVotes ERROR:', error.message);
//     throw error;
// }

/**
 * 7. Récupère métriques de performance arbitrage
 * @returns {Object} Métriques complètes
 */
// TODO: Implémenter getArbitrationMetrics()
// function getArbitrationMetrics() {
//   const resolutionRate = totalDisputes > 0
//     ? ((resolvedDisputes / totalDisputes) * 100).toFixed(2)
//     : 0;
//   
//   RETOURNER {
//     totalDisputes,
//     resolvedDisputes,
//     resolutionRate: `${resolutionRate}%`,
//     averageResolutionTime: `${(averageResolutionTime / 1000 / 60 / 60).toFixed(2)}h`,
//     totalVotes,
//     averageVotingPower: `${averageVotingPower.toFixed(2)} DONE`
//   };
// }

// TODO: Exporter toutes les fonctions
// module.exports = {
//   createDispute,
//   voteDispute,
//   resolveDispute,
//   getDispute,
//   getVotingPower,
//   getDisputeVotes,
//   getArbitrationMetrics
// };

