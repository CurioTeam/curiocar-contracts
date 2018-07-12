// Activate verbose mode by setting env var `export DEBUG=cur`
const debug = require("debug")("cur");

const util = require("./util.js");

const Curio = artifacts.require("./CurioTest.sol");
const CurioAuction = artifacts.require("./CurioAuction.sol");

contract("Curio", function(accounts) {
  // before(() => util.measureGas(accounts));
  // after(() => util.measureGas(accounts));

  const eq = assert.equal.bind(assert);

  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const owner = accounts[4];
  // const gasPrice = 1e11;

  let coreC;

  const logEvents = [];
  const pastEvents = [];

  async function deployContract() {
    debug("deploying contract");

    coreC = await Curio.new();

    // set original owner
    await coreC.setOwner(owner);

    const auctionContract = await CurioAuction.new(coreC.address, 100);
    await coreC.setAuctionAddress(auctionContract.address, { from: owner });

    await coreC.unpause({ from: owner });

    const eventsWatch = coreC.allEvents();
    eventsWatch.watch((err, res) => {
      if (err) return;
      pastEvents.push(res);
      debug(">>", res.event, res.args);
    });
    logEvents.push(eventsWatch);
  }

  after(function() {
    logEvents.forEach(ev => ev.stopWatching());
  });

  describe("Initial state", function() {
    before(deployContract);

    it("should own contract", async function() {
      const adminAddress = await coreC.adminAddress();
      eq(adminAddress, admin);

      const supply = await coreC.totalSupply();
      eq(supply.toNumber(), 0);
    });
  });

  describe("NonFungible, EIP-721", async function() {
    let tokenA, tokenB, tokenC, tokenD;
    before(deployContract);

    it("create a few tokens", async function() {
      await coreC.mintTokens("test", 10);

      tokenA = 0;
      tokenB = 1;
      tokenC = 2;
      tokenD = 3;

      eq((await coreC.totalSupply()).toNumber(), 10);
    });

    it("approve + transferFrom + ownerOf", async function() {
      await coreC.approve(user1, tokenC);

      eq(await coreC.ownerOf(tokenC), admin);

      await coreC.transferFrom(admin, user1, tokenC, { from: user1 });

      eq(await coreC.ownerOf(tokenC), user1);
    });

    it("balanceOf", async function() {
      eq(await coreC.balanceOf(admin), 9);
      eq(await coreC.balanceOf(user1), 1);
      eq(await coreC.balanceOf(user2), 0);
    });

    it("tokensOfOwner", async function() {
      const adminTokens = await coreC.tokensOfOwner(admin);
      eq(adminTokens[0].toNumber(), tokenA);
      eq(adminTokens[1].toNumber(), tokenB);
      eq(adminTokens[2].toNumber(), tokenD);

      const user1Tokens = await coreC.tokensOfOwner(user1);
      eq(user1Tokens[0].toNumber(), tokenC);
    });
  });

  describe("Roles: Owner + Admin", async function() {
    it("admin try to appoint another admin, but cant", async function() {
      // that is the case because we override OZ ownable function
      await util.expectThrow(coreC.setAdmin(user2));
    });

    it("owner can appoint another admin", async function() {
      // Set user1 as admin
      await coreC.setAdmin(user1, { from: owner });
    });

    it("new admin can do things, old admin cant anymore", async function() {
      await util.expectThrow(coreC.mintTokens("test", 1, { from: admin }));

      await coreC.mintTokens("test", 1, { from: user1 });
    });

    it("owner can appoint another owner", async function() {
      await util.expectThrow(coreC.setOwner(user2, { from: admin }));

      // Set user2 as owner
      await coreC.setOwner(user2, { from: owner });
    });

    it("old owner cant do anything since they were replaced", async function() {
      // owner = user2
      await util.expectThrow(coreC.setOwner(user3, { from: owner }));

      await coreC.setOwner(owner, { from: user2 });
    });

    it("owner can drain funds", async function() {
      await coreC.fundMe({ value: web3.toWei(0.05, "ether") });

      const ownerBalance1 = web3.eth.getBalance(owner);
      debug("owner balance was", ownerBalance1);

      await coreC.withdrawBalance({ from: owner });

      const ownerBalance2 = web3.eth.getBalance(owner);
      debug("owner balance is ", ownerBalance2);
      assert(ownerBalance2.gt(ownerBalance1));
    });
  });

  describe("Contract Upgrade", async function() {
    before(async function redeployContract() {
      await deployContract();

      await coreC.mintTokens("test name - tokens 0-3", 4, { from: admin });
      await coreC.mintTokens("test name - tokens 4-5", 2, { from: admin });

      const supply = await coreC.totalSupply();
      eq(supply.toNumber(), 6);

      await coreC.transfer(user1, 4);
    });

    it("user2 fails to pause contract - not owner or admin", async function() {
      await util.expectThrow(coreC.pause({ from: user2 }));
    });

    it("admin can pause the contract, but can't unpause", async function() {
      await coreC.pause({ from: admin });

      const isPaused = await coreC.paused();
      eq(isPaused, true);

      await util.expectThrow(coreC.unpause({ from: admin }));
    });

    it("functions that alter state (transfer) can't execute while paused", async function() {
      await util.expectThrow(coreC.transfer(user2, 5));

      await util.expectThrow(coreC.transfer(admin, 4, { from: user1 }));
    });

    it("can read state of tokens while paused", async function() {
      const supply = await coreC.totalSupply();
      eq(supply.toNumber(), 6);

      const token0 = await coreC.getToken(0);
      eq(token0, "test name - tokens 0-3");
    });

    it("owner can unpause the contract", async function() {
      await coreC.unpause({ from: owner });

      const isPaused = await coreC.paused();
      eq(isPaused, false);
    });

    it("set new contract address", async function() {
      const coreC2 = await Curio.new();

      await util.expectThrow(coreC.setNewAddress(coreC2.address));

      await coreC.pause({ from: owner });

      // owner can appoint a new admin even while paused
      await coreC.setAdmin(owner, { from: owner });

      await coreC.setNewAddress(coreC2.address, { from: owner });

      const newAddress = await coreC.newContractAddress();
      eq(newAddress, coreC2.address);

      // cannot unpause if new contract address is set
      await util.expectThrow(coreC.unpause({ from: owner }));
    });
  });

  describe("Auction wrapper", async function() {
    let auction;

    const tokenId1 = 0,
          tokenId2 = 1,
          tokenId3 = 2;

    before(async function() {
      await deployContract();

      auction = await CurioAuction.new(coreC.address, 0);

      await coreC.mintTokens("test", 3, { from: admin });
      await coreC.transfer(user1, tokenId2, { from: admin });
      await coreC.transfer(user1, tokenId3, { from: admin });
    });

    it("non-owner should fail to set auction address", async function() {
      await util.expectThrow(coreC.setAuctionAddress(auction.address, { from: user1 }));

      await util.expectThrow(coreC.setAuctionAddress(auction.address, { from: admin }));
    });

    it("owner should be able to set auction addresses", async function() {
      await coreC.setAuctionAddress(auction.address, { from: owner });

      const auctionAddress = await coreC.auction();
      eq(auctionAddress, auction.address);
    });


    it("should fail to create auction if not token owner", async function() {
      await util.expectThrow(
        coreC.createAuction(tokenId1, 100, 200, 60, { from: user1 })
      );
    });

    it("should be able to create auction", async function() {
      await coreC.createAuction(tokenId1, 100, 200, 60, { from: admin });

      const token1Owner = await coreC.ownerOf(tokenId1);
      eq(token1Owner, auction.address);
    });

    it("should be able to bid on sale auction", async function() {
      const adminBal1 = await web3.eth.getBalance(admin);

      await auction.bid(tokenId1, { from: user1, value: 200 });

      const adminBal2 = await web3.eth.getBalance(admin);
      const token1Owner = await coreC.ownerOf(tokenId1);
      eq(token1Owner, user1);
      assert(adminBal2.gt(adminBal1));

      // Transfer the token back to admin for the rest of the tests
      await coreC.transfer(admin, tokenId1, { from: user1 });
    });

    it("should be able to cancel an auction", async function() {
      await coreC.createAuction(tokenId1, 100, 200, 60, { from: admin });

      await auction.cancelAuction(tokenId1, { from: admin });

      const token1Owner = await coreC.ownerOf(tokenId1);
      eq(token1Owner, admin);
    });
  });

  describe("Free tokens", async function(){
    beforeEach(async function(){
      await deployContract();
    });

    it("should fail to create free token if not admin", async function(){
      await util.expectThrow(coreC.createFreeToken("free token name", user2, { from: user1 }));
    });

    it("should be able to create free token and transfer it", async function() {
      eq(await coreC.releaseCreatedCount(), 0);

      await coreC.createFreeToken("free token name", user1, { from: admin });

      const releaseCreatedCount = await coreC.releaseCreatedCount();
      eq(releaseCreatedCount, 1);

      const tokenOwner = await coreC.ownerOf(0);
      eq(tokenOwner, user1);

      const token0 = await coreC.getToken(0);
      eq(token0, "free token name");
    });


    it("should be able to create only 900 tokens", async function() {
      for(let i = 0; i < 900; i++){
        await coreC.createFreeToken(`free token #${ i }`, user1, { from: admin });

        const tokenOwner = await coreC.ownerOf(i);
        eq(tokenOwner, user1);

        const token = await coreC.getToken(i);
        eq(token, `free token #${ i }`);
      }

      await util.expectThrow(coreC.createFreeToken("free token ID 900", user1, { from: admin }));
    });
  });

  describe("Release tokens auction", async function(){
    let auction;

    const tokenId1 = 0,
          tokenId2 = 1;

    before(async function() {
      await deployContract();

      auction = await CurioAuction.new(coreC.address, 0);

      await coreC.setAuctionAddress(auction.address, { from: owner });
    });

    it("should fail to create release token auction if not admin", async function() {
      await util.expectThrow(coreC.createReleaseTokenAuction("test name", 100, 0, 60, { from: user1 }));
    });

    it("should be able to create release token auction", async function() {
      eq(await coreC.releaseCreatedCount(), 0);

      await coreC.createReleaseTokenAuction("test name", 100, 0, 60, { from: admin });

      const auction1 = await auction.getAuction(tokenId1);
      eq(auction1[0], coreC.address);
      assert(auction1[1].eq(100));
      assert(auction1[2].eq(0));
      assert(auction1[3].eq(60));

      const releaseCreatedCount = await coreC.releaseCreatedCount();
      eq(releaseCreatedCount, 1);
    });

    it("should be able to bid on release token auction", async function() {
      await auction.bid(tokenId1, { from: user1, value: 100 });

      const token1Owner = await coreC.ownerOf(tokenId1);
      eq(token1Owner, user1);
    });
  });

  describe("Auction withdrawals", function(){
    beforeEach(async function() {
      await deployContract();

      auction = await CurioAuction.new(coreC.address, 1000);

      await coreC.setAuctionAddress(auction.address, { from: owner });

      // Get some Ether into auction
      await coreC.mintTokens("test name", 2, { from: admin });
      await coreC.createAuction(0, 100000, 200000, 100, { from: admin });
      await auction.bid(0, { from: user1, value: 200000 });
    });

    it("should fail to withdraw as non-admin", async function() {
      util.expectThrow(auction.withdrawBalance({ from: user1 }));
    });

    it("should be able to withdraw as admin", async function() {
      const auctionBal1 = web3.eth.getBalance(auction.address);
      const coreBal1 = web3.eth.getBalance(coreC.address);

      await auction.withdrawBalance({ from: admin });

      const auctionBal2 = web3.eth.getBalance(auction.address);
      const coreBal2 = web3.eth.getBalance(coreC.address);

      assert(
        coreBal1
          .add(auctionBal1)
          .eq(coreBal2)
      );
      assert(auctionBal2.eq(0));
    });

    it("should fail to withdraw via core as non-admin", async function() {
      util.expectThrow(coreC.withdrawAuctionBalance({ from: user1 }));
    });

    it("should be able to withdraw via core as admin", async function() {
      const auctionBal1 = web3.eth.getBalance(auction.address);
      const coreBal1 = web3.eth.getBalance(coreC.address);

      await coreC.withdrawAuctionBalance({ from: admin });

      const auctionBal2 = web3.eth.getBalance(auction.address);
      const coreBal2 = web3.eth.getBalance(coreC.address);

      assert(
        coreBal1
          .add(auctionBal1)
          .eq(coreBal2)
      );
      assert(auctionBal2.eq(0));
    });
  });
});
