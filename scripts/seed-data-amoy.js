// scripts/seed-data-amoy.js
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("SEED AMOY — Initialisation...");

  // Charger les contrats déployés
  const contracts = JSON.parse(fs.readFileSync("./contracts-amoy.json"));
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

  // Charger ton wallet Amoy (MetaMask)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Using wallet:", wallet.address);

  // Récupérer instances des contrats
  const orderManager = await ethers.getContractAt(
    "DoneOrderManager",
    contracts.DoneOrderManager,
    wallet
  );

  const token = await ethers.getContractAt(
    "DoneToken",
    contracts.DoneToken,
    wallet
  );

  const staking = await ethers.getContractAt(
    "DoneStaking",
    contracts.DoneStaking,
    wallet
  );

  console.log("Contracts loaded from contracts-amoy.json");

  // ADRESSES TEST
  const admin = wallet.address;
  const restaurant = wallet.address;   // tu es aussi restaurant
  const deliverer = wallet.address;    // tu es livreur
  const client1 = wallet.address;      // tu es client1
  const client2 = wallet.address;      // tu es client2

  // STAKING LIVREUR
  console.log("\n Staking deliverer...");
  try {
    const stakeTx = await staking.stakeAsDeliverer({
      value: ethers.parseEther("0.1"),
    });
    await stakeTx.wait();
    console.log("Deliverer staked");
  } catch (e) {
    console.log("Already staked — skipping");
  }

  // Prix pour test
  const food = ethers.parseEther("0.02");
  const delivery = ethers.parseEther("0.005");
  const platformFee = food / 10n;
  const total = food + delivery + platformFee;

  
  // ORDER #1 — CREATED
  
  console.log("\nCreating Order #1 (CREATED)...");
  const tx1 = await orderManager.createOrder(
    restaurant,
    food,
    delivery,
    "ipfs://order1",
    { value: total }
  );
  await tx1.wait();
  console.log("✔ Order #1 created");

  
  // ORDER #2 — PREPARING
  
  console.log("\n Creating Order #2 (PREPARING)...");
  const tx2 = await orderManager.createOrder(
    restaurant,
    food,
    delivery,
    "ipfs://order2",
    { value: total }
  );
  await tx2.wait();
  await orderManager.confirmPreparation(2);
  console.log(" Order #2 in PREPARING");

  // ORDER #3 — COMPLETELY DELIVERED
  
  console.log("\nCreating Order #3 workflow...");
  const tx3 = await orderManager.createOrder(
    restaurant,
    food,
    delivery,
    "ipfs://order3",
    { value: total }
  );
  await tx3.wait();

  await orderManager.confirmPreparation(3);
  await orderManager.assignDeliverer(3, deliverer);
  await orderManager.confirmPickup(3);
  await orderManager.confirmDelivery(3);

  console.log("Order #3 delivered (split + reward done)");

  // Lire infos Order #3
  const o3 = await orderManager.getOrder(3);
  console.log("\nOrder #3 status:", o3.status.toString());
  console.log("   delivered:", o3.delivered);

  // Vérifier tokens DONE
  const reward = await token.balanceOf(client1);
  console.log("DONE tokens:", reward.toString());

  console.log("\n SEED AMOY TERMINÉ !");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
