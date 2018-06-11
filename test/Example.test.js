// require("..");

require("./util.js");

// Contracts artifacts
// const Contract = artifacts.require("./Contract.sol");

// Contract module
contract("Contract", function(accounts) {
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  // Deployed contract instances
  let contract;

  // Deploy contracts
  const deploy = async () => {
    // contract = await Contract.new();
  };

  before(() => {});

  after(() => {});

  beforeEach(async () => {
    // Already deployed contract
    // contract = await Contract.deployed();
  });

  afterEach(async () => {});


  describe("Test suit for function..", function () {
    // beforeEach(deploy); // before(deploy);


//   it("should something do..", async function () {
        // ..
//    });

    // ..

  });

  // ..

});
