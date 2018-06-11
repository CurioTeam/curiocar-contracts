require("babel-polyfill");

const SolidityEvent = require('web3/lib/web3/event.js');

// this web3 is injected:
web3.BigNumber.config({ EXPONENTIAL_AT: 100 });

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    })
  );

const expectThrow = async promise => {
  try {
    await promise;
  } catch (err) {
    const outOfGas = err.message.includes("out of gas");
    const invalidOpcode = err.message.includes("invalid opcode");
    const revert = err.message.includes("revert");
    assert(
      outOfGas || invalidOpcode || revert,
      "Expected throw, got `" + err + "` instead"
    );
    return;
  }
  assert.fail("Expected throw not received");
};

const mineOneBlock = async () => {
  await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_mine",
    params: [],
    id: 0
  });
};

const mineNBlocks = async n => {
  for (let i = 0; i < n; i++) {
    await mineOneBlock();
  }
};

const getBalance = async addr => {
  const res = await promisify(cb => web3.eth.getBalance(addr, cb));
  return new web3.BigNumber(res);
};

const getGasPrice = () => {
  return promisify(web3.eth.getGasPrice);
};

const forwardEVMTime = async seconds => {
  await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [seconds],
    id: 0
  });
  await mineOneBlock();
};

let lastBalance;

// First call stores the balance sum, second call prints the difference
const measureGas = async accounts => {
  let balanceSum = new web3.BigNumber(0);
  // only checks the first 8 accounts
  for (let i = 0; i <= 7; i++) {
    balanceSum = balanceSum.add(await getBalance(accounts[i]));
  }
  // first run of this function
  if (!lastBalance) {
    lastBalance = balanceSum;
  } else {
    // diff and inform the difference
    console.log(
      "Gas spent on test suite:",
      lastBalance.sub(balanceSum).toString()
    );
    lastBalance = null;
  }
};

const decodeLogs = function (logs, contract, address) {
  return logs.map(log => {
    const event = new SolidityEvent(null, contract.events[log.topics[0]], address);
    return event.decode(log);
  })
};

module.exports = {
  forwardEVMTime,
  expectThrow,
  mineOneBlock,
  mineNBlocks,
  getBalance,
  getGasPrice,
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  measureGas,
  decodeLogs
};
