const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DONE — Integration Test", function () {
  let client, restaurant, deliverer, platform;
  let orderManager, token, staking, splitter;

  beforeEach(async () => {
    [_, client, restaurant, deliverer, platform] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("DoneToken");
    token = await Token.deploy();

    const Staking = await ethers.getContractFactory("DoneStaking");
    staking = await Staking.deploy();
    await staking.grantRole(await staking.PLATFORM_ROLE(), platform.address);

    const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
    splitter = await Splitter.deploy();

    const OrderManager = await ethers.getContractFactory("DoneOrderManager");
    orderManager = await OrderManager.deploy(
      splitter.target,
      token.target,
      staking.target,
      platform.address
    );

    await orderManager.grantRole(await orderManager.RESTAURANT_ROLE(), restaurant.address);
    await orderManager.grantRole(await orderManager.DELIVERER_ROLE(), deliverer.address);

    await token.grantRole(await token.MINTER_ROLE(), orderManager.target);

    await staking.connect(deliverer).stakeAsDeliverer({ value: ethers.parseEther("0.1") });
  });

  it("Should execute complete order flow + token reward + splitPayment", async () => {
    const food = ethers.parseEther("1");
    const delivery = ethers.parseEther("0.1");
    const total = food + delivery + (food * 10n) / 100n;

    await orderManager.connect(client).createOrder(
      restaurant.address, food, delivery, "ipfs://test", { value: total }
    );

    await orderManager.connect(restaurant).confirmPreparation(1);
    await orderManager.grantRole(await orderManager.PLATFORM_ROLE(), platform.address);
    await orderManager.connect(platform).assignDeliverer(1, deliverer.address);
    await orderManager.connect(deliverer).confirmPickup(1);
    await orderManager.connect(client).confirmDelivery(1);

    expect(await splitter.balances(restaurant.address)).to.equal(total * 70n / 100n);
    expect(await token.balanceOf(client.address)).to.be.gt(0);
  });
});
