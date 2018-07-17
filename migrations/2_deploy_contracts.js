const CurioAuction = artifacts.require("./CurioAuction.sol"),
      Curio = artifacts.require("./Curio.sol");

const auctionFee = 500, // 5% auction fee (from 0 to 10 000)
      auctionPriceLimit ='6000000000000000000'; // initial auction price limit (3000$ for 1 ETH = 500$)

module.exports = function(deployer, network, accounts) {
  const ownerAccount = accounts[0];

  deployer.deploy(Curio, { from: ownerAccount })
    .then(() => deployer.deploy(CurioAuction, Curio.address, auctionFee, auctionPriceLimit, { from: ownerAccount }));
};
