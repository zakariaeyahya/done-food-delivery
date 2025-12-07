const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoneToken — Unit Tests", function () {
  let token, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("DoneToken");
    token = await Token.deploy();
  });

  it("Should mint only for MINTER_ROLE", async () => {
    await token.mint(user.address, 100);

    expect(await token.balanceOf(user.address)).to.equal(100);
  });

  it("Should reject mint from unauthorized user", async () => {
    await expect(
      token.connect(user).mint(user.address, 100)
    ).to.be.reverted;
  });

  it("Should burn tokens correctly", async () => {
    await token.mint(user.address, 200);

    await token.connect(user).burn(50);

    expect(await token.balanceOf(user.address)).to.equal(150);
  });

  it("Should calculate reward correctly", async () => {
    const reward = await token.calculateReward(ethers.parseEther("1"));
    expect(reward).to.equal(ethers.parseEther("0.1"));
  });
});
