const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonePaymentSplitter — Unit Tests", function () {
  let splitter, owner, restaurant, deliverer, platform;

  beforeEach(async () => {
    [owner, restaurant, deliverer, platform] = await ethers.getSigners();

    const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
    splitter = await Splitter.deploy();
  });

  it("Should split 70/20/10 correctly", async () => {
    const amount = ethers.parseEther("1");

    await expect(
      splitter.splitPayment(
        1,
        restaurant.address,
        deliverer.address,
        platform.address,
        { value: amount }
      )
    ).to.emit(splitter, "PaymentSplit");

    expect(await splitter.balances(restaurant.address))
      .to.equal(ethers.parseEther("0.7"));

    expect(await splitter.balances(deliverer.address))
      .to.equal(ethers.parseEther("0.2"));

    expect(await splitter.balances(platform.address))
      .to.equal(ethers.parseEther("0.1"));
  });

  it("Should revert if amount = 0", async () => {
    await expect(
      splitter.splitPayment(1, restaurant.address, deliverer.address, platform.address, { value: 0 })
    ).to.be.revertedWith("PaymentSplitter: Amount must be greater than 0");
  });

  it("Should allow withdraw", async () => {
    const amount = ethers.parseEther("1");

    await splitter.splitPayment(
      1,
      restaurant.address,
      deliverer.address,
      platform.address,
      { value: amount }
    );

    const before = await ethers.provider.getBalance(restaurant.address);

    const tx = await splitter.connect(restaurant).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.fee;

    const after = await ethers.provider.getBalance(restaurant.address);

    expect(after).to.be.gt(before);
  });
});
