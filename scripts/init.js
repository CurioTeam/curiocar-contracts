const CurioAuction = artifacts.require("./CurioAuction.sol"),
      Curio = artifacts.require("./Curio.sol");

const init = async function (accounts) {
  const ownerAccount = accounts[0],
        adminAccount = accounts[1];

  console.log("Init script start.");

  console.log("Accounts:");
  console.log(ownerAccount + " (owner)");
  console.log(adminAccount + " (admin)");

  let core = await Curio.deployed();
  console.log("Core address: " + Curio.address);

  let auction = await CurioAuction.deployed();
  console.log("Auction address: " + CurioAuction.address);

  console.log("Setting auction address..");
  await core.setAuctionAddress(CurioAuction.address, { from: ownerAccount });

  let auctionAddress = await core.auction();
  console.log("Auction address: " + auctionAddress);

  console.log("Setting core admin address..");
  await core.setAdmin(adminAccount, { from: ownerAccount });

  let coreAdmin = await core.adminAddress();
  console.log("Core admin address: " + coreAdmin);

  console.log("Unpausing core contract..");
  await core.unpause({ from: ownerAccount });

  let isCorePaused = await core.paused();
  console.log("Core paused: " + isCorePaused);

  console.log("Init script end.");
};

module.exports = function () {
  web3.eth.getAccounts(async (n, a) => await init(a));
};
