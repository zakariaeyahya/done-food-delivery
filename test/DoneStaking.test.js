const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoneStaking — Unit Tests", function () {
  let staking, owner, deliverer, platform;

  beforeEach(async () => {
    [owner, deliverer, platform] = await ethers.getSigners();
    const Staking = await ethers.getContractFactory("DoneStaking");
    staking = await Staking.deploy();
    await staking.grantRole(await staking.PLATFORM_ROLE(), platform.address);
  });

  it("Should reject stake < 0.1 ETH", async () => {
    await expect(
      staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Staking: Minimum stake is 0.1 ETH");
  });

  it("Should accept valid staking", async () => {
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
    expect(await staking.isStaked(deliverer.address)).to.equal(true);
  });

  it("Should slash correctly", async () => {
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

    await staking.connect(platform).slash(deliverer.address, ethers.parseEther("0.05"));

    expect(await staking.getStakedAmount(deliverer.address))
      .to.equal(ethers.parseEther("0.05"));
  });

  it("Should unstake correctly", async () => {
    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });

    await expect(staking.connect(deliverer).unstake())
      .to.emit(staking, "Unstaked");
  });
});
