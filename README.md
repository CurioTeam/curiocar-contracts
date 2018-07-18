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
Mint tokens.
```
truffle exec scripts/deploy.js --type <tokensType> --start <startId> --end <endId> --network <netName>
```
##### tokensTypes - (cars id from 1 to 50). Without --type deploy all tokens.
```json
[
  "1", ... ,"50"
]
```
##### startId, endId (part number in car *_tokens.json file, from 0 to 17). Without --start/--end deploy all tokens.
```json
{
  "startId": 
  {
    "type": "Positive number"
  },
  "endId":
  {
     "type": "Positive number"
   }
}
```
## Addition
#### Geth node start
```
geth --testnet --syncmode "light" --rpc --rpcport 7545 --rpccorsdomain "*" --rpcvhosts "*" --maxpendpeers 30
```
For Mainnet: remove ```--testnet``` flag
