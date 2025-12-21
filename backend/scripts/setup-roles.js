/**
 * Setup Roles Script
 *
 * Grants necessary roles to the backend wallet for testing:
 * - RESTAURANT_ROLE
 * - DELIVERER_ROLE
 * - PLATFORM_ROLE
 *
 * Usage: node scripts/setup-roles.js
 */

require('dotenv').config();
const { ethers } = require('ethers');

// Configuration
const RPC_URL = process.env.AMOY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ORDER_MANAGER_ADDRESS = process.env.ORDER_MANAGER_ADDRESS;
const STAKING_ADDRESS = process.env.STAKING_ADDRESS;

// Role hashes (keccak256)
const ROLES = {
  DEFAULT_ADMIN_ROLE: ethers.ZeroHash,
  RESTAURANT_ROLE: ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE")),
  DELIVERER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("DELIVERER_ROLE")),
  PLATFORM_ROLE: ethers.keccak256(ethers.toUtf8Bytes("PLATFORM_ROLE")),
  ARBITRATOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes("ARBITRATOR_ROLE"))
};

// Minimal ABI for AccessControl
const ACCESS_CONTROL_ABI = [
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)"
];

// Staking ABI
const STAKING_ABI = [
  "function stakeAsDeliverer() external payable",
  "function isStaked(address deliverer) external view returns (bool)",
  "function stakedAmount(address) external view returns (uint256)",
  "function MINIMUM_STAKE() external view returns (uint256)"
];

async function main() {
  console.log('='.repeat(60));
  console.log('SETUP: Grant Roles for Testing');
  console.log('='.repeat(60));

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('\n[Config]');
  console.log('  Wallet:', wallet.address);
  console.log('  OrderManager:', ORDER_MANAGER_ADDRESS);
  console.log('  Staking:', STAKING_ADDRESS);

  // Check wallet balance
  const balance = await provider.getBalance(wallet.address);
  console.log('  Balance:', ethers.formatEther(balance), 'MATIC');

  // Connect to contracts
  const orderManager = new ethers.Contract(ORDER_MANAGER_ADDRESS, ACCESS_CONTROL_ABI, wallet);
  const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, wallet);

  // ============================================
  // Check current roles
  // ============================================
  console.log('\n[Current Roles]');

  for (const [roleName, roleHash] of Object.entries(ROLES)) {
    try {
      const hasRole = await orderManager.hasRole(roleHash, wallet.address);
      console.log(`  ${roleName}: ${hasRole ? ' Yes' : ' No'}`);
    } catch (e) {
      console.log(`  ${roleName}: Error - ${e.message}`);
    }
  }

  // ============================================
  // Check if admin
  // ============================================
  console.log('\n[Admin Check]');

  const isAdmin = await orderManager.hasRole(ROLES.DEFAULT_ADMIN_ROLE, wallet.address);
  console.log('  Is Admin:', isAdmin ? ' Yes' : ' No');

  if (!isAdmin) {
    console.log('\n  WARNING: Wallet is not admin. Cannot grant roles.');
    console.log('  The deployer wallet should be admin. Check if PRIVATE_KEY is correct.');
    process.exit(1);
  }

  // ============================================
  // Grant RESTAURANT_ROLE
  // ============================================
  console.log('\n[Granting RESTAURANT_ROLE]');

  const hasRestaurantRole = await orderManager.hasRole(ROLES.RESTAURANT_ROLE, wallet.address);
  if (hasRestaurantRole) {
    console.log('  Already has RESTAURANT_ROLE ');
  } else {
    try {
      console.log('  Sending grantRole transaction...');
      const tx = await orderManager.grantRole(ROLES.RESTAURANT_ROLE, wallet.address);
      console.log('  TX Hash:', tx.hash);
      await tx.wait();
      console.log('   RESTAURANT_ROLE granted!');
    } catch (error) {
      console.error('   Error:', error.reason || error.message);
    }
  }

  // ============================================
  // Grant PLATFORM_ROLE
  // ============================================
  console.log('\n[Granting PLATFORM_ROLE]');

  const hasPlatformRole = await orderManager.hasRole(ROLES.PLATFORM_ROLE, wallet.address);
  if (hasPlatformRole) {
    console.log('  Already has PLATFORM_ROLE ');
  } else {
    try {
      console.log('  Sending grantRole transaction...');
      const tx = await orderManager.grantRole(ROLES.PLATFORM_ROLE, wallet.address);
      console.log('  TX Hash:', tx.hash);
      await tx.wait();
      console.log('   PLATFORM_ROLE granted!');
    } catch (error) {
      console.error('   Error:', error.reason || error.message);
    }
  }

  // ============================================
  // Stake as Deliverer
  // ============================================
  console.log('\n[Staking as Deliverer]');

  try {
    const isStaked = await staking.isStaked(wallet.address);
    if (isStaked) {
      const stakedAmount = await staking.stakedAmount(wallet.address);
      console.log('  Already staked:', ethers.formatEther(stakedAmount), 'MATIC ');
    } else {
      // Get minimum stake amount
      let minStake;
      try {
        minStake = await staking.MINIMUM_STAKE();
      } catch (e) {
        minStake = ethers.parseEther('0.1'); // Default 0.1 MATIC
      }
      console.log('  Minimum stake:', ethers.formatEther(minStake), 'MATIC');

      console.log('  Sending stakeAsDeliverer transaction...');
      const tx = await staking.stakeAsDeliverer({ value: minStake });
      console.log('  TX Hash:', tx.hash);
      await tx.wait();
      console.log('   Staked as deliverer!');
    }
  } catch (error) {
    console.error('   Error staking:', error.reason || error.message);
  }

  // ============================================
  // Final Role Check
  // ============================================
  console.log('\n[Final Roles]');

  for (const [roleName, roleHash] of Object.entries(ROLES)) {
    try {
      const hasRole = await orderManager.hasRole(roleHash, wallet.address);
      console.log(`  ${roleName}: ${hasRole ? ' Yes' : ' No'}`);
    } catch (e) {
      console.log(`  ${roleName}: Error`);
    }
  }

  // Check staking status
  try {
    const isStaked = await staking.isStaked(wallet.address);
    console.log(`  DELIVERER (Staked): ${isStaked ? ' Yes' : ' No'}`);
  } catch (e) {
    console.log('  DELIVERER (Staked): Error');
  }

  console.log('\n' + '='.repeat(60));
  console.log('SETUP COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNow run: node scripts/test-order-flow.js');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
