const { ethers } = require("hardhat");
const contracts = require("../contracts-amoy.json");

async function main() {
  console.log("Configuration des rôles pour 1 seule adresse...");

  // TON adresse (celle du .env)
  const admin = "PRIVATE_KEY";

  const manager = await ethers.getContractAt("DoneOrderManager", contracts.DoneOrderManager);
  const staking = await ethers.getContractAt("DoneStaking", contracts.DoneStaking);
  const token   = await ethers.getContractAt("DoneToken", contracts.DoneToken);

  console.log(" Adresse utilisée pour TOUS les rôles :", admin);

  //Donner TOUS les rôles à cette adresse
  await manager.grantRole(await manager.RESTAURANT_ROLE(), admin);
  await manager.grantRole(await manager.DELIVERER_ROLE(), admin);
  await manager.grantRole(await manager.ARBITRATOR_ROLE(), admin);
  await manager.grantRole(await manager.PLATFORM_ROLE(), admin);

  await staking.grantRole(await staking.PLATFORM_ROLE(), admin);

  // Mint du token → DoneOrderManager doit minter
  await token.grantRole(await token.MINTER_ROLE(), contracts.DoneOrderManager);

  console.log("Tous les rôles ont été attribués à :", admin);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
