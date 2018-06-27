const CurioAuction = artifacts.require("./CurioAuction.sol"),
      Curio = artifacts.require("./Curio.sol");

const auctionFee = 500; // 5% auction fee (from 0 to 10 000)

module.exports = function(deployer, network, accounts) {
  const deployerAccount = accounts[0];

  deployer.deploy(Curio, { from: deployerAccount })
    .then(() => deployer.deploy(CurioAuction, Curio.address, auctionFee, { from: deployerAccount }));
};
