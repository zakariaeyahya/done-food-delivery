const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ORACLE SYSTEM — Full Integration Test", function () {

    let owner, client, restaurant, deliverer, platform;
    let mockPriceFeed, priceOracle, gpsOracle, weatherOracle;
    let token, staking, splitter, orderManager;

    before(async () => {
        [owner, client, restaurant, deliverer, platform] = await ethers.getSigners();
    });

    // 1) MOCK PRICE FEED + PRICE ORACLE
    before(async () => {
        const Mock = await ethers.getContractFactory("MockV3Aggregator");
        mockPriceFeed = await Mock.deploy(8, 100000000); // 1 MATIC = 1 USD
        await mockPriceFeed.waitForDeployment();

        const PriceOracle = await ethers.getContractFactory("DonePriceOracle");
        priceOracle = await PriceOracle.deploy(await mockPriceFeed.getAddress());
        await priceOracle.waitForDeployment();
    });

    // 2) GPS ORACLE
    
    before(async () => {
        const GPS = await ethers.getContractFactory("DoneGPSOracle");
        gpsOracle = await GPS.deploy();
        await gpsOracle.waitForDeployment();

        // Donner les rôles nécessaires
        await gpsOracle.grantRole(await gpsOracle.DELIVERER_ROLE(), owner.address);
        await gpsOracle.grantRole(await gpsOracle.ORACLE_ROLE(), owner.address);
    });


    // 3) WEATHER ORACLE
    before(async () => {
        const Weather = await ethers.getContractFactory("DoneWeatherOracle");
        weatherOracle = await Weather.deploy();
        await weatherOracle.waitForDeployment();
    });

    // 4) TOKEN + STAKING + SPLITTER
    before(async () => {
        const Token = await ethers.getContractFactory("DoneToken");
        token = await Token.deploy();
        await token.waitForDeployment();

        const Staking = await ethers.getContractFactory("DoneStaking");
        staking = await Staking.deploy(token);
        await staking.waitForDeployment();

        const Splitter = await ethers.getContractFactory("DonePaymentSplitter");
        splitter = await Splitter.deploy();
        await splitter.waitForDeployment();
    });

    // 5) ORDER MANAGER
    before(async () => {
        const OrderManager = await ethers.getContractFactory("DoneOrderManager");

        orderManager = await OrderManager.deploy(
            await splitter.getAddress(),
            await token.getAddress(),
            await staking.getAddress(),
            platform.address
        );
        await orderManager.waitForDeployment();

        // give roles
        await orderManager.grantRole(await orderManager.RESTAURANT_ROLE(), restaurant.address);
        await orderManager.grantRole(await orderManager.DELIVERER_ROLE(), deliverer.address);

        // set oracles
        await orderManager.setPriceOracle(await priceOracle.getAddress());
        await orderManager.setGPSOracle(await gpsOracle.getAddress());
        await orderManager.setWeatherOracle(await weatherOracle.getAddress());
    });

    // TESTS
    it("1) Price Oracle converts USD → MATIC correctly", async () => {
        const usdAmount = ethers.parseEther("10");

        // appel en lecture, sans envoyer de transaction
        const result = await priceOracle.convertUSDtoMATIC.staticCall(usdAmount);

        expect(result).to.equal(usdAmount); // Mock : 1 USD = 1 MATIC
    });


    it("2) Weather Oracle adjusts fee", async () => {
        const lat = 10, lng = 20;
        await weatherOracle.updateWeather(lat, lng, 2, 1500); // Rainy = +20%

        const adjusted = await orderManager.calculateDynamicDeliveryFee(10000, lat, lng);
        expect(adjusted).to.equal(12000);
    });

    it("3) GPS Oracle validates location", async () => {
        await gpsOracle.updateLocation(1, 40000000, -74000000);

        const ok = await gpsOracle.verifyDelivery(1, 40000010, -74000010);
        expect(ok).to.equal(true);
    });

    it("4) OrderManager allows order creation", async () => {
        const food = 10000;
        const deliv = 2000;
        const platformFee = food / 10;

        const tx = await orderManager.connect(client).createOrder(
            restaurant.address,
            food,
            deliv,
            "ipfs://abc",
            { value: food + deliv + platformFee }
        );

        const receipt = await tx.wait();
        expect(receipt.status).to.equal(1);
    });

});
