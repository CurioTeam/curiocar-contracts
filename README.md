# Smart-contracts for NFT cars
With using [Truffle framework](http://truffleframework.com/). 
## Install
```
$ npm i -g truffle
$ npm i
```
## Deploy
#### 1. Compile contracts
Compile .sol files to bin format.
```
truffle compile --network <netName>
```
##### netNames
```json
[
  "development",
  "ropstenInfura",
  "ropstenNode",
  "mainnetInfura",
  "mainnetNode"
]
```
#### 2. Deploy contracts
Push compiled contracts to Ethereum blockchain.
```
truffle migrate --network <netName> --reset
```
#### 3. Init contracts
Set admin account, link and unpause them. Configuration in init.js script.
```
truffle exec scripts/init.js --network <netName>
```
#### 4. Deploy tokens
Will be add in future.
## Addition
#### Geth node start
```
geth --testnet --syncmode "light" --rpc --rpcport 7545 --rpccorsdomain "*" --rpcvhosts "*" --maxpeers 300
```
For Mainnet: remove ```--testnet``` flag
