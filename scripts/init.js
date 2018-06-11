const util = require('./utils/util');

const init = async function (accounts) {
  const deployerAccount = accounts[0];

  console.log("Init script start.");

  console.log("Accounts:");
  console.log(deployerAccount + " (deployer)");

  console.log("Init script end.");
};

module.exports = function () {
  web3.eth.getAccounts(async (n, a) => await init(a));
};
