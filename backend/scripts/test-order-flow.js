/**
 * Test Script - Complete Order Flow on Blockchain
 *
 * Tests the full order lifecycle:
 * 1. Create Order (Client)
 * 2. Confirm Preparation (Restaurant)
 * 3. Assign Deliverer (Platform)
 * 4. Confirm Pickup (Deliverer)
 * 5. Confirm Delivery (Client)
 *
 * Usage: node scripts/test-order-flow.js
 */

require('dotenv').config();
const { ethers } = require('ethers');
const mongoose = require('mongoose');

// Configuration
const RPC_URL = process.env.AMOY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ORDER_MANAGER_ADDRESS = process.env.ORDER_MANAGER_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

// Minimal ABI for DoneOrderManager
const ORDER_MANAGER_ABI = [
  "function createOrder(address restaurant, uint256 foodPrice, uint256 deliveryFee, string memory ipfsHash) external payable returns (uint256)",
  "function confirmPreparation(uint256 orderId) external",
  "function assignDeliverer(uint256 orderId, address deliverer) external",
  "function confirmPickup(uint256 orderId) external",
  "function confirmDelivery(uint256 orderId) external",
  "function getOrder(uint256 orderId) external view returns (tuple(uint256 id, address client, address restaurant, address deliverer, uint256 foodPrice, uint256 deliveryFee, uint256 platformFee, uint256 totalAmount, uint8 status, string ipfsHash, uint256 createdAt, bool disputed, bool delivered))",
  "function orderCount() external view returns (uint256)",
  "event OrderCreated(uint256 indexed orderId, address indexed client, address indexed restaurant, uint256 totalAmount)"
];

const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];

// Status enum (matches contract)
const OrderStatus = {
  0: 'CREATED',
  1: 'PREPARING',
  2: 'ASSIGNED',
  3: 'IN_DELIVERY',
  4: 'DELIVERED',
  5: 'DISPUTED',
  6: 'REFUNDED',
  7: 'CANCELLED'
};

async function main() {
  console.log('='.repeat(60));
  console.log('TEST: Complete Order Flow on Polygon Amoy');
  console.log('='.repeat(60));

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('\n[Config]');
  console.log('  RPC:', RPC_URL);
  console.log('  Wallet:', wallet.address);
  console.log('  OrderManager:', ORDER_MANAGER_ADDRESS);

  // Check wallet balance
  const balance = await provider.getBalance(wallet.address);
  console.log('  Balance:', ethers.formatEther(balance), 'MATIC');

  if (balance < ethers.parseEther('0.01')) {
    console.error('\n ERROR: Insufficient MATIC balance. Need at least 0.01 MATIC for gas.');
    process.exit(1);
  }

  // Connect to contracts
  const orderManager = new ethers.Contract(ORDER_MANAGER_ADDRESS, ORDER_MANAGER_ABI, wallet);
  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

  // Get current order count
  let orderCount;
  try {
    orderCount = await orderManager.orderCount();
    console.log('  Current order count:', orderCount.toString());
  } catch (e) {
    console.log('  Could not get order count:', e.message);
    orderCount = 0n;
  }

  // Test addresses (using same wallet for simplicity - in production these would be different)
  const clientAddress = wallet.address;
  const restaurantAddress = wallet.address; // Same wallet acts as restaurant
  const delivererAddress = wallet.address;  // Same wallet acts as deliverer

  console.log('\n[Test Addresses]');
  console.log('  Client:', clientAddress);
  console.log('  Restaurant:', restaurantAddress);
  console.log('  Deliverer:', delivererAddress);

  // Order parameters
  const foodPrice = ethers.parseEther('0.001');      // 0.001 MATIC
  const deliveryFee = ethers.parseEther('0.0005');   // 0.0005 MATIC
  const platformFee = (foodPrice * 10n) / 100n;      // 10% of food price
  const totalAmount = foodPrice + deliveryFee + platformFee;
  const ipfsHash = 'QmTestHash123456789';

  console.log('\n[Order Parameters]');
  console.log('  Food Price:', ethers.formatEther(foodPrice), 'MATIC');
  console.log('  Delivery Fee:', ethers.formatEther(deliveryFee), 'MATIC');
  console.log('  Platform Fee:', ethers.formatEther(platformFee), 'MATIC');
  console.log('  Total Amount:', ethers.formatEther(totalAmount), 'MATIC');

  // Get token balance before
  const tokenBalanceBefore = await token.balanceOf(clientAddress);
  console.log('  DONE Tokens Before:', ethers.formatEther(tokenBalanceBefore));

  let orderId;

  // ============================================
  // STEP 1: Create Order
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 1: Create Order');
  console.log('='.repeat(60));

  try {
    console.log('  Sending createOrder transaction...');
    const tx1 = await orderManager.createOrder(
      restaurantAddress,
      foodPrice,
      deliveryFee,
      ipfsHash,
      { value: totalAmount }
    );
    console.log('  TX Hash:', tx1.hash);

    const receipt1 = await tx1.wait();
    console.log('  Block:', receipt1.blockNumber);
    console.log('  Gas Used:', receipt1.gasUsed.toString());

    // Parse OrderCreated event to get orderId
    for (const log of receipt1.logs) {
      try {
        const parsed = orderManager.interface.parseLog(log);
        if (parsed && parsed.name === 'OrderCreated') {
          orderId = parsed.args.orderId;
          console.log('   Order Created! ID:', orderId.toString());
        }
      } catch (e) {}
    }

    if (!orderId) {
      console.error('   Could not find OrderCreated event');
      process.exit(1);
    }
  } catch (error) {
    console.error('   Error creating order:', error.reason || error.message);
    process.exit(1);
  }

  // Check order status
  await checkOrderStatus(orderManager, orderId);

  // ============================================
  // STEP 2: Confirm Preparation (Restaurant)
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Confirm Preparation (Restaurant)');
  console.log('='.repeat(60));

  try {
    console.log('  Sending confirmPreparation transaction...');
    const tx2 = await orderManager.confirmPreparation(orderId);
    console.log('  TX Hash:', tx2.hash);

    const receipt2 = await tx2.wait();
    console.log('  Block:', receipt2.blockNumber);
    console.log('   Preparation Confirmed!');
  } catch (error) {
    console.error('   Error confirming preparation:', error.reason || error.message);
    process.exit(1);
  }

  await checkOrderStatus(orderManager, orderId);

  // ============================================
  // STEP 3: Assign Deliverer (Platform)
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3: Assign Deliverer (Platform)');
  console.log('='.repeat(60));

  try {
    console.log('  Sending assignDeliverer transaction...');
    const tx3 = await orderManager.assignDeliverer(orderId, delivererAddress);
    console.log('  TX Hash:', tx3.hash);

    const receipt3 = await tx3.wait();
    console.log('  Block:', receipt3.blockNumber);
    console.log('   Deliverer Assigned!');
  } catch (error) {
    console.error('   Error assigning deliverer:', error.reason || error.message);
    process.exit(1);
  }

  await checkOrderStatus(orderManager, orderId);

  // ============================================
  // STEP 4: Confirm Pickup (Deliverer)
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 4: Confirm Pickup (Deliverer)');
  console.log('='.repeat(60));

  try {
    console.log('  Sending confirmPickup transaction...');
    const tx4 = await orderManager.confirmPickup(orderId);
    console.log('  TX Hash:', tx4.hash);

    const receipt4 = await tx4.wait();
    console.log('  Block:', receipt4.blockNumber);
    console.log('   Pickup Confirmed!');
  } catch (error) {
    console.error('   Error confirming pickup:', error.reason || error.message);
    process.exit(1);
  }

  await checkOrderStatus(orderManager, orderId);

  // ============================================
  // STEP 5: Confirm Delivery (Client)
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 5: Confirm Delivery (Client)');
  console.log('='.repeat(60));

  try {
    console.log('  Sending confirmDelivery transaction...');
    const tx5 = await orderManager.confirmDelivery(orderId);
    console.log('  TX Hash:', tx5.hash);

    const receipt5 = await tx5.wait();
    console.log('  Block:', receipt5.blockNumber);
    console.log('   Delivery Confirmed!');
  } catch (error) {
    console.error('   Error confirming delivery:', error.reason || error.message);
    process.exit(1);
  }

  await checkOrderStatus(orderManager, orderId);

  // ============================================
  // FINAL: Check Token Rewards
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('FINAL: Token Rewards');
  console.log('='.repeat(60));

  const tokenBalanceAfter = await token.balanceOf(clientAddress);
  const tokensEarned = tokenBalanceAfter - tokenBalanceBefore;

  console.log('  DONE Tokens Before:', ethers.formatEther(tokenBalanceBefore));
  console.log('  DONE Tokens After:', ethers.formatEther(tokenBalanceAfter));
  console.log('  Tokens Earned:', ethers.formatEther(tokensEarned));

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE - SUMMARY');
  console.log('='.repeat(60));
  console.log('  Order ID:', orderId.toString());
  console.log('  Final Status: DELIVERED');
  console.log('  Tokens Earned:', ethers.formatEther(tokensEarned), 'DONE');
  console.log('\n  View on Polygonscan:');
  console.log('  https://amoy.polygonscan.com/address/' + ORDER_MANAGER_ADDRESS);
  console.log('='.repeat(60));

  process.exit(0);
}

async function checkOrderStatus(orderManager, orderId) {
  try {
    const order = await orderManager.getOrder(orderId);
    console.log('  [Status Check]');
    console.log('    Order ID:', order.id.toString());
    console.log('    Status:', OrderStatus[order.status] || order.status);
    console.log('    Client:', order.client);
    console.log('    Restaurant:', order.restaurant);
    console.log('    Deliverer:', order.deliverer || 'Not assigned');
    console.log('    Delivered:', order.delivered);
  } catch (error) {
    console.log('  [Status Check] Could not fetch order:', error.message);
  }
}

// Run the test
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
