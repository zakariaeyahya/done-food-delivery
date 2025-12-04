/**
 * Service blockchain pour les interactions Web3
 * @fileoverview Gère toutes les interactions avec les smart contracts (DoneOrderManager, DoneStaking)
 * @see contracts/README.md pour les détails des contrats
 */

import { ethers } from 'ethers';

// Configuration
const ORDER_MANAGER_ADDRESS = import.meta.env.VITE_ORDER_MANAGER_ADDRESS;
const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
const DELIVERER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('DELIVERER_ROLE'));

// Variables globales
let provider = null;
let signer = null;
let orderManagerContract = null;
let stakingContract = null;

// TODO: Importer les ABIs des contrats
// import DoneOrderManagerABI from '../../../contracts/artifacts/DoneOrderManager.json';
// import DoneStakingABI from '../../../contracts/artifacts/DoneStaking.json';

/**
 * Initialiser le provider et le signer
 * @returns {Object} { provider, signer }
 */
// TODO: Implémenter getProvider()
// function getProvider() {
//   SI !window.ethereum:
//     throw new Error('MetaMask is not installed');
//   
//   SI !provider:
//     provider = new ethers.BrowserProvider(window.ethereum);
//   
//   RETOURNER provider;
// }

/**
 * Obtenir le signer (wallet connecté)
 * @returns {Promise<Object>} Signer
 */
// TODO: Implémenter getSigner()
// async function getSigner() {
//   SI !signer:
//     const provider = getProvider();
//     signer = await provider.getSigner();
//   
//   RETOURNER signer;
// }

/**
 * 1. Connexion au wallet MetaMask
 * @returns {Promise<Object>} { address, signer }
 * 
 * @example
 * const { address } = await connectWallet();
 */
// TODO: Implémenter connectWallet()
// async function connectWallet() {
//   ESSAYER:
//     SI !window.ethereum:
//       throw new Error('MetaMask is not installed. Please install MetaMask.');
//     
//     // Demander connexion
//     await window.ethereum.request({ method: 'eth_requestAccounts' });
//     
//     const provider = getProvider();
//     signer = await provider.getSigner();
//     const address = await signer.getAddress();
//     
//     // Vérifier réseau (Polygon Mumbai)
//     const network = await provider.getNetwork();
//     SI network.chainId !== 80001n: // Mumbai testnet
//       throw new Error('Please switch to Polygon Mumbai testnet');
//     
//     RETOURNER { address, signer };
//   CATCH error:
//     console.error('Error connecting wallet:', error);
//     throw new Error(`Failed to connect wallet: ${error.message}`);
// }

/**
 * 2. Vérifier si une adresse a le rôle DELIVERER_ROLE
 * @param {string} address - Adresse à vérifier
 * @returns {Promise<boolean>} true si a le rôle
 * 
 * @example
 * const hasRole = await hasRole(DELIVERER_ROLE, '0x...');
 */
// TODO: Implémenter hasRole(role, address)
// async function hasRole(role, address) {
//   ESSAYER:
//     SI !address:
//       throw new Error('Address is required');
//     
//     const provider = getProvider();
//     SI !orderManagerContract:
//       orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI.abi, provider);
//     
//     const hasRoleResult = await orderManagerContract.hasRole(role, address);
//     RETOURNER hasRoleResult;
//   CATCH error:
//     console.error('Error checking role:', error);
//     throw new Error(`Failed to check role: ${error.message}`);
// }

/**
 * 3. Vérifier si une adresse est stakée
 * @param {string} address - Adresse du livreur
 * @returns {Promise<boolean>} true si staké
 * 
 * @example
 * const isStaked = await isStaked('0x...');
 */
// TODO: Implémenter isStaked(address)
// async function isStaked(address) {
//   ESSAYER:
//     SI !address:
//       throw new Error('Address is required');
//     
//     const provider = getProvider();
//     SI !stakingContract:
//       stakingContract = new ethers.Contract(STAKING_ADDRESS, DoneStakingABI.abi, provider);
//     
//     const isStakedResult = await stakingContract.isStaked(address);
//     RETOURNER isStakedResult;
//   CATCH error:
//     console.error('Error checking staking:', error);
//     throw new Error(`Failed to check staking: ${error.message}`);
// }

/**
 * 4. Récupérer les informations de staking
 * @param {string} address - Adresse du livreur
 * @returns {Promise<Object>} { amount, isStaked }
 * 
 * @example
 * const stakeInfo = await getStakeInfo('0x...');
 */
// TODO: Implémenter getStakeInfo(address)
// async function getStakeInfo(address) {
//   ESSAYER:
//     SI !address:
//       throw new Error('Address is required');
//     
//     const provider = getProvider();
//     SI !stakingContract:
//       stakingContract = new ethers.Contract(STAKING_ADDRESS, DoneStakingABI.abi, provider);
//     
//     // Appeler stakes(address) qui retourne (amount, isStaked)
//     const stakeData = await stakingContract.stakes(address);
//     
//     RETOURNER {
//       amount: parseFloat(ethers.formatEther(stakeData[0])), // Convertir wei en MATIC
//       isStaked: stakeData[1]
//     };
//   CATCH error:
//     console.error('Error getting stake info:', error);
//     throw new Error(`Failed to get stake info: ${error.message}`);
// }

/**
 * 5. Effectuer le staking (minimum 0.1 MATIC)
 * @param {number|string} amount - Montant à staker en MATIC
 * @returns {Promise<Object>} { txHash, receipt }
 * 
 * @example
 * const { txHash } = await stake('0.1');
 */
// TODO: Implémenter stake(amount)
// async function stake(amount) {
//   ESSAYER:
//     SI !signer:
//       signer = await getSigner();
//     
//     // Valider montant minimum
//     const amountWei = ethers.parseEther(amount.toString());
//     const minStake = ethers.parseEther('0.1');
//     SI amountWei < minStake:
//       throw new Error('Minimum stake is 0.1 MATIC');
//     
//     SI !stakingContract:
//       stakingContract = new ethers.Contract(STAKING_ADDRESS, DoneStakingABI.abi, signer);
//     
//     // Appeler stakeAsDeliverer() avec value
//     const tx = await stakingContract.stakeAsDeliverer({ value: amountWei });
//     
//     // Attendre confirmation
//     const receipt = await tx.wait();
//     
//     RETOURNER { txHash: receipt.hash, receipt };
//   CATCH error:
//     console.error('Error staking:', error);
//     throw new Error(`Failed to stake: ${error.message}`);
// }

/**
 * 6. Retirer le staking
 * @returns {Promise<Object>} { txHash, amount }
 * 
 * @example
 * const { txHash, amount } = await unstake();
 */
// TODO: Implémenter unstake()
// async function unstake() {
//   ESSAYER:
//     SI !signer:
//       signer = await getSigner();
//     
//     const address = await signer.getAddress();
//     
//     // Récupérer montant staké avant unstake
//     const stakeInfo = await getStakeInfo(address);
//     const amount = stakeInfo.amount;
//     
//     SI !stakingContract:
//       stakingContract = new ethers.Contract(STAKING_ADDRESS, DoneStakingABI.abi, signer);
//     
//     // Appeler unstake()
//     const tx = await stakingContract.unstake();
//     
//     // Attendre confirmation
//     const receipt = await tx.wait();
//     
//     RETOURNER { txHash: receipt.hash, amount };
//   CATCH error:
//     console.error('Error unstaking:', error);
//     throw new Error(`Failed to unstake: ${error.message}`);
// }

/**
 * 7. Accepter une commande on-chain
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} { txHash, receipt }
 * 
 * @example
 * const { txHash } = await acceptOrderOnChain(123);
 */
// TODO: Implémenter acceptOrderOnChain(orderId)
// async function acceptOrderOnChain(orderId) {
//   ESSAYER:
//     SI !orderId:
//       throw new Error('Order ID is required');
//     
//     SI !signer:
//       signer = await getSigner();
//     
//     SI !orderManagerContract:
//       orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI.abi, signer);
//     
//     // Appeler assignDeliverer(orderId)
//     const tx = await orderManagerContract.assignDeliverer(orderId);
//     
//     // Attendre confirmation
//     const receipt = await tx.wait();
//     
//     RETOURNER { txHash: receipt.hash, receipt };
//   CATCH error:
//     console.error('Error accepting order on-chain:', error);
//     throw new Error(`Failed to accept order on-chain: ${error.message}`);
// }

/**
 * 8. Confirmer la récupération (pickup) on-chain
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} { txHash, receipt }
 * 
 * @example
 * const { txHash } = await confirmPickupOnChain(123);
 */
// TODO: Implémenter confirmPickupOnChain(orderId)
// async function confirmPickupOnChain(orderId) {
//   ESSAYER:
//     SI !orderId:
//       throw new Error('Order ID is required');
//     
//     SI !signer:
//       signer = await getSigner();
//     
//     SI !orderManagerContract:
//       orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI.abi, signer);
//     
//     // Appeler confirmPickup(orderId)
//     const tx = await orderManagerContract.confirmPickup(orderId);
//     
//     // Attendre confirmation
//     const receipt = await tx.wait();
//     
//     RETOURNER { txHash: receipt.hash, receipt };
//   CATCH error:
//     console.error('Error confirming pickup on-chain:', error);
//     throw new Error(`Failed to confirm pickup on-chain: ${error.message}`);
// }

/**
 * 9. Confirmer la livraison (delivery) on-chain
 * @param {number} orderId - ID de la commande
 * @returns {Promise<Object>} { txHash, earnings }
 * 
 * @example
 * const { txHash, earnings } = await confirmDeliveryOnChain(123);
 */
// TODO: Implémenter confirmDeliveryOnChain(orderId)
// async function confirmDeliveryOnChain(orderId) {
//   ESSAYER:
//     SI !orderId:
//       throw new Error('Order ID is required');
//     
//     SI !signer:
//       signer = await getSigner();
//     
//     SI !orderManagerContract:
//       orderManagerContract = new ethers.Contract(ORDER_MANAGER_ADDRESS, DoneOrderManagerABI.abi, signer);
//     
//     // Appeler confirmDelivery(orderId)
//     const tx = await orderManagerContract.confirmDelivery(orderId);
//     
//     // Attendre confirmation
//     const receipt = await tx.wait();
//     
//     // Parser les events PaymentSplit pour récupérer earnings (20%)
//     const signerAddress = await signer.getAddress();
//     const earnings = await getEarningsEvents(signerAddress, orderId);
//     
//     RETOURNER { txHash: receipt.hash, earnings };
//   CATCH error:
//     console.error('Error confirming delivery on-chain:', error);
//     throw new Error(`Failed to confirm delivery on-chain: ${error.message}`);
// }

/**
 * 10. Récupérer l'historique des slashing events
 * @param {string} address - Adresse du livreur
 * @returns {Promise<Array>} Array d'events avec { orderId, amount, reason, txHash, blockNumber, timestamp }
 * 
 * @example
 * const slashingEvents = await getSlashingEvents('0x...');
 */
// TODO: Implémenter getSlashingEvents(address)
// async function getSlashingEvents(address) {
//   ESSAYER:
//     SI !address:
//       throw new Error('Address is required');
//     
//     const provider = getProvider();
//     SI !stakingContract:
//       stakingContract = new ethers.Contract(STAKING_ADDRESS, DoneStakingABI.abi, provider);
//     
//     // Filtrer events Slashed où deliverer = address
//     const filter = stakingContract.filters.Slashed(address);
//     const events = await stakingContract.queryFilter(filter);
//     
//     // Parser les events
//     const parsedEvents = events.map(event => ({
//       orderId: Number(event.args.orderId || 0),
//       amount: parseFloat(ethers.formatEther(event.args.amount)),
//       reason: event.args.reason || 'Unknown',
//       txHash: event.transactionHash,
//       blockNumber: event.blockNumber,
//       timestamp: null // TODO: Récupérer timestamp depuis block
//     }));
//     
//     RETOURNER parsedEvents;
//   CATCH error:
//     console.error('Error getting slashing events:', error);
//     throw new Error(`Failed to get slashing events: ${error.message}`);
// }

/**
 * 11. Récupérer les events PaymentSplit pour un livreur
 * @param {string} address - Adresse du livreur
 * @param {number} orderId - ID de la commande (optionnel, pour filtrer)
 * @returns {Promise<Object>} { events[], totalEarnings }
 * 
 * @example
 * const { events, totalEarnings } = await getEarningsEvents('0x...');
 */
// TODO: Implémenter getEarningsEvents(address, orderId)
// async function getEarningsEvents(address, orderId = null) {
//   ESSAYER:
//     SI !address:
//       throw new Error('Address is required');
//     
//     const provider = getProvider();
//     // TODO: Importer PaymentSplitter address et ABI
//     const PAYMENT_SPLITTER_ADDRESS = import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS;
//     // import DonePaymentSplitterABI from '../../../contracts/artifacts/DonePaymentSplitter.json';
//     const paymentSplitterContract = new ethers.Contract(PAYMENT_SPLITTER_ADDRESS, DonePaymentSplitterABI.abi, provider);
//     
//     // Filtrer events PaymentSplit où deliverer = address
//     const filter = paymentSplitterContract.filters.PaymentSplit(null, null, address);
//     const events = await paymentSplitterContract.queryFilter(filter);
//     
//     // Filtrer par orderId si fourni
//     let filteredEvents = events;
//     SI orderId !== null:
//       filteredEvents = events.filter(e => Number(e.args.orderId) === orderId);
//     
//     // Parser les events
//     const parsedEvents = filteredEvents.map(event => ({
//       orderId: Number(event.args.orderId),
//       delivererAmount: parseFloat(ethers.formatEther(event.args.delivererAmount)), // 20%
//       restaurantAmount: parseFloat(ethers.formatEther(event.args.restaurantAmount)), // 70%
//       platformAmount: parseFloat(ethers.formatEther(event.args.platformAmount)), // 10%
//       txHash: event.transactionHash,
//       blockNumber: event.blockNumber,
//       timestamp: event.args.timestamp || null
//     }));
//     
//     // Calculer total earnings
//     const totalEarnings = parsedEvents.reduce((sum, e) => sum + e.delivererAmount, 0);
//     
//     RETOURNER { events: parsedEvents, totalEarnings };
//   CATCH error:
//     console.error('Error getting earnings events:', error);
//     throw new Error(`Failed to get earnings events: ${error.message}`);
// }

// Exports
// TODO: Exporter toutes les fonctions
// export {
//   connectWallet,
//   hasRole,
//   isStaked,
//   getStakeInfo,
//   stake,
//   unstake,
//   acceptOrderOnChain,
//   confirmPickupOnChain,
//   confirmDeliveryOnChain,
//   getSlashingEvents,
//   getEarningsEvents,
//   DELIVERER_ROLE
// };

