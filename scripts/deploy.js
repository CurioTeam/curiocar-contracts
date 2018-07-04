const argv = require('minimist')(process.argv);
const util = require('./utils/util');

const Curio = artifacts.require("./Curio.sol");

const durationDefault = '60'; // 1 min (! no edit)

const tokenTypes = [
  'sell'
];

let adminAccount, core;

const deploy = async function (tokensType, startId, endId) {
  console.log(`Deploying ${ tokensType } tokens..`);

  const tokens = require(`./data/${ tokensType }_tokens.json`);

  for (let token of tokens) {
    if ((startId !== null && parseInt(token.id) < startId) || (endId !== null && parseInt(token.id) > endId)) {
      continue;
    }

    console.log(`Token #${ token.id }..`);

    let params = {
      name: token.name,
      start: token.start ? web3.toWei(token.start, 'ether') : '0',
      end: token.end ? web3.toWei(token.end, 'ether') : '0',
      duration: token.duration ? token.duration : durationDefault
    };

    if (token.price) {
      params.start = web3.toWei(token.price, 'ether');
      params.end = web3.toWei(token.price, 'ether');
    }

    console.log(params);

    let tx = await core.createReleaseTokenAuction(
      params.name,
      params.start,
      params.end,
      params.duration,
      {
        from: adminAccount
      });

    util.printTxInfo(tx);
  }

  console.log(`Deploying ${ tokensType } tokens end.`);
};

module.exports = function () {
  web3.eth.getAccounts(async (n, accounts) => {
    adminAccount = accounts[1];

    let type = argv.hasOwnProperty('type') ? argv.type : null,
        start = argv.hasOwnProperty('start') ? parseInt(argv.start) : null,
        end = argv.hasOwnProperty('end') ? parseInt(argv.end) : null;

    if (type !== null && !tokenTypes.includes(type)) {
      console.log('Incorrect param -type!');
      console.log('Must be one of this:');
      console.log(tokenTypes);
      return false;
    }

    if ((start !== null && start < 0) || (end !== null && end < 0)) {
      console.log('Incorrect param -start/-end!');
      return false;
    }

    console.log("Accounts:");
    console.log(adminAccount + " (admin)");

    core = await Curio.deployed();
    console.log("Core address: " + Curio.address);

    console.log('Arguments:');
    console.log(`TokenType: ${ type }, StartId: ${ start }, EndId: ${ end }`);

    console.log("Deploy script start.");

    if (type) { // deploy selected tokens
      await deploy(type, start, end);
    } else { // deploy all tokens
      for (let item of tokenTypes) {
        await deploy(item, start, end);
      }
    }

    console.log("Deploy script end.");
  });
};
