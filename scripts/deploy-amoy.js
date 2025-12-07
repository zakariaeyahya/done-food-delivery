const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1) Deploy DONE token
  const Token = await ethers.getContractFactory("DoneToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("DoneToken:", token.target);

  // 2) Deploy Staking
  const Staking = await ethers.getContractFactory("DoneStaking");
  const staking = await Staking.deploy();
  await staking.waitForDeployment();
  console.log("DoneStaking:", staking.target);

  // 3) Deploy Payment Splitter
  const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
  const splitter = await Splitter.deploy();
  await splitter.waitForDeployment();
  console.log("DonePaymentSplitter:", splitter.target);

  // 4) Deploy DoneOrderManager
  const OrderManager = await ethers.getContractFactory("DoneOrderManager");
  const manager = await OrderManager.deploy(
    splitter.target,
    token.target,
    staking.target,
    deployer.address
  );

  await manager.waitForDeployment();
  console.log("DoneOrderManager:", manager.target);

  // 5) save addresses
  const data = {
    DoneToken: token.target,
    DoneStaking: staking.target,
    DonePaymentSplitter: splitter.target,
    DoneOrderManager: manager.target,
    Network: "polygon-amoy"
  };

  fs.writeFileSync("contracts-amoy.json", JSON.stringify(data, null, 2));
  console.log("contracts-amoy.json saved!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
