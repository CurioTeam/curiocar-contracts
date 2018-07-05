const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config/env');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gasPrice: '100000000000'
    },
    ropstenInfura: {
      provider: function() {
        return new HDWalletProvider(
          config.get('ropstenMnemonic'),
          `https://ropsten.infura.io/${ config.get('infuraApiKey') }`, 0, 10);
      },
      network_id: 3,
      gas: config.get('ropstenGasLimit'),
      gasPrice: config.get('ropstenGasPrice')
    },
    mainnetInfura: {
      provider: function() {
        return new HDWalletProvider(
          config.get('mainnetMnemonic'),
          `https://mainnet.infura.io/${ config.get('infuraApiKey') }`, 0, 10);
      },
      network_id: 1,
      gas: config.get('mainnetGasLimit'),
      gasPrice: config.get('mainnetGasPrice')
    },
    ropstenNode: {
      provider: function() {
        return new HDWalletProvider(
          config.get('ropstenMnemonic'),
          'http://127.0.0.1:7545/', 0, 10);
      },
      network_id: '3',
      gas: config.get('ropstenGasLimit'),
      gasPrice: config.get('ropstenGasPrice')
    },
    mainnetNode: {
      provider: function() {
        return new HDWalletProvider(
          config.get('mainnetMnemonic'),
          'http://127.0.0.1:7545/', 0, 10);
      },
      network_id: '1',
      gas: config.get('mainnetGasLimit'),
      gasPrice: config.get('mainnetGasPrice')
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  mocha: {
    useColors: true
  }
};
