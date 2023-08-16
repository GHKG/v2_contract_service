import { InfuraProvider , AbiCoder, Interface} from "ethers";
const createCsvWriter = require("csv-writer").createObjectCsvWriter
// const fs = require('fs');
// const csv = require('csv-parser');

const provider = new InfuraProvider("matic","68a2de3671204e8c91871ee8d0c927f3")
// const provider = new InfuraProvider("matic","295cce92179b4be498665b1b16dfee34")

let results:any[] = [];
let remoteTx:any[]= [];


const csvtojson = require('csvtojson');

async function main() {
    const data = await csvtojson().fromFile('./2.csv');
    for(const item of data) {
      if(item.Method === 'Remote Miner Onboard' && item.Status === '') {
          results.push(item);
      }
    }
    console.log('total hash:', results.length);


    for(let i=0; i<results.length; i++){

        console.log("count: ", i)

        try{
            const response = await provider.getTransaction(results[i].Txhash)
            // console.log(receipt)
            // console.log(response)

            const abi = new Interface([
                {
                  "inputs": [],
                  "stateMutability": "nonpayable",
                  "type": "constructor"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": false,
                      "internalType": "address",
                      "name": "previousAdmin",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "address",
                      "name": "newAdmin",
                      "type": "address"
                    }
                  ],
                  "name": "AdminChanged",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "approved",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "Approval",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "operator",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "bool",
                      "name": "approved",
                      "type": "bool"
                    }
                  ],
                  "name": "ApprovalForAll",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "beacon",
                      "type": "address"
                    }
                  ],
                  "name": "BeaconUpgraded",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "GameMinerAirdropped",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "address[]",
                      "name": "miners",
                      "type": "address[]"
                    }
                  ],
                  "name": "GameMinerOnboarded",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": false,
                      "internalType": "uint8",
                      "name": "version",
                      "type": "uint8"
                    }
                  ],
                  "name": "Initialized",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "miner",
                      "type": "address"
                    }
                  ],
                  "name": "MinerOnboarded",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "previousOwner",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "newOwner",
                      "type": "address"
                    }
                  ],
                  "name": "OwnershipTransferred",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "from",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "to",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "Transfer",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "implementation",
                      "type": "address"
                    }
                  ],
                  "name": "Upgraded",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": false,
                      "internalType": "address[]",
                      "name": "owners",
                      "type": "address[]"
                    },
                    {
                      "indexed": false,
                      "internalType": "address[]",
                      "name": "miners",
                      "type": "address[]"
                    }
                  ],
                  "name": "VitualMinersInBatch",
                  "type": "event"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address[]",
                      "name": "receivers",
                      "type": "address[]"
                    },
                    {
                      "internalType": "address[]",
                      "name": "miners",
                      "type": "address[]"
                    }
                  ],
                  "name": "AirdropMiners",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "name": "AllManagers",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "name": "AllManufactures",
                  "outputs": [
                    {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "name": "AllMinerInfo",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "mAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "enum MinerType",
                      "name": "mType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "enum MinerStatus",
                      "name": "mStatus",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint32",
                      "name": "timestamp",
                      "type": "uint32"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "name": "AllMinersToken",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "newMinerCap",
                      "type": "uint256"
                    }
                  ],
                  "name": "ChangeAirdropCap",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "DOMAIN_SEPARATOR",
                  "outputs": [
                    {
                      "internalType": "bytes32",
                      "name": "",
                      "type": "bytes32"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "DURATION_ACTIVATE",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "GAME_MINER_TYPEHASH",
                  "outputs": [
                    {
                      "internalType": "bytes32",
                      "name": "",
                      "type": "bytes32"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "miner",
                      "type": "address"
                    },
                    {
                      "internalType": "bool",
                      "name": "bAirDrop",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "deadline",
                      "type": "uint256"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint8",
                          "name": "v",
                          "type": "uint8"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "r",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "s",
                          "type": "bytes32"
                        }
                      ],
                      "internalType": "struct Sig",
                      "name": "permitGameMiner",
                      "type": "tuple"
                    }
                  ],
                  "name": "GameMinerOnboard",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "addrMiner",
                      "type": "address"
                    }
                  ],
                  "name": "GetMinerInfo",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "mAddress",
                          "type": "address"
                        },
                        {
                          "internalType": "enum MinerType",
                          "name": "mType",
                          "type": "uint8"
                        },
                        {
                          "internalType": "enum MinerStatus",
                          "name": "mStatus",
                          "type": "uint8"
                        },
                        {
                          "internalType": "uint32",
                          "name": "timestamp",
                          "type": "uint32"
                        }
                      ],
                      "internalType": "struct Miner",
                      "name": "miner",
                      "type": "tuple"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    }
                  ],
                  "name": "GetMinersAddr",
                  "outputs": [
                    {
                      "internalType": "address[]",
                      "name": "minersAddr",
                      "type": "address[]"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "GetPendingGameNumber",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "INIT_CAP_AIRDROP",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address[]",
                      "name": "manufactures",
                      "type": "address[]"
                    },
                    {
                      "internalType": "bool",
                      "name": "yesOrNo",
                      "type": "bool"
                    }
                  ],
                  "name": "ManageManufactures",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "NAME",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "receiver",
                      "type": "address"
                    },
                    {
                      "internalType": "address[]",
                      "name": "miners",
                      "type": "address[]"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "token",
                          "type": "address"
                        },
                        {
                          "internalType": "uint256",
                          "name": "value",
                          "type": "uint256"
                        },
                        {
                          "internalType": "uint256",
                          "name": "deadline",
                          "type": "uint256"
                        },
                        {
                          "internalType": "uint8",
                          "name": "v",
                          "type": "uint8"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "r",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "s",
                          "type": "bytes32"
                        }
                      ],
                      "internalType": "struct Signature",
                      "name": "permitToPay",
                      "type": "tuple"
                    }
                  ],
                  "name": "OrderMiners",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "REMOTE_MINER_TYPEHASH",
                  "outputs": [
                    {
                      "internalType": "bytes32",
                      "name": "",
                      "type": "bytes32"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "miner",
                      "type": "address"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint8",
                          "name": "v",
                          "type": "uint8"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "r",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "s",
                          "type": "bytes32"
                        }
                      ],
                      "internalType": "struct Sig",
                      "name": "permitMiner",
                      "type": "tuple"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "token",
                          "type": "address"
                        },
                        {
                          "internalType": "uint256",
                          "name": "value",
                          "type": "uint256"
                        },
                        {
                          "internalType": "uint256",
                          "name": "deadline",
                          "type": "uint256"
                        },
                        {
                          "internalType": "uint8",
                          "name": "v",
                          "type": "uint8"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "r",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes32",
                          "name": "s",
                          "type": "bytes32"
                        }
                      ],
                      "internalType": "struct Signature",
                      "name": "permitToPay",
                      "type": "tuple"
                    }
                  ],
                  "name": "RemoteMinerOnboard",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "SYMBOL",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "minerID",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum MinerStatus",
                      "name": "minerStatus",
                      "type": "uint8"
                    }
                  ],
                  "name": "SetMinersStatus",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint8",
                      "name": "typeMiner",
                      "type": "uint8"
                    },
                    {
                      "internalType": "address[]",
                      "name": "addressMiners",
                      "type": "address[]"
                    }
                  ],
                  "name": "UpdateMinerWhiteList",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address[]",
                      "name": "owners",
                      "type": "address[]"
                    },
                    {
                      "internalType": "address[]",
                      "name": "miners",
                      "type": "address[]"
                    }
                  ],
                  "name": "VirtualMinerOnboardInBatch",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "to",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "approve",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    }
                  ],
                  "name": "balanceOf",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "baseURI",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "capGameMinerAirdrop",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "counterGameMinerAirdrop",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "getApproved",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    }
                  ],
                  "name": "getGamingMiners",
                  "outputs": [
                    {
                      "internalType": "address[]",
                      "name": "",
                      "type": "address[]"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "indexGameMinerWithdraw",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "_tokenAKRE",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "_minerManager",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "_minerAuthority",
                      "type": "address"
                    }
                  ],
                  "name": "initialize",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "operator",
                      "type": "address"
                    }
                  ],
                  "name": "isApprovedForAll",
                  "outputs": [
                    {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    }
                  ],
                  "name": "isOwner",
                  "outputs": [
                    {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "name",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "owner",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "ownerOf",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "_tokenAKRE",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "_minerManager",
                      "type": "address"
                    }
                  ],
                  "name": "postUpdate",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "proxiableUUID",
                  "outputs": [
                    {
                      "internalType": "bytes32",
                      "name": "",
                      "type": "bytes32"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "renounceOwnership",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "from",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "to",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "safeTransferFrom",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "from",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "to",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bytes",
                      "name": "data",
                      "type": "bytes"
                    }
                  ],
                  "name": "safeTransferFrom",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "operator",
                      "type": "address"
                    },
                    {
                      "internalType": "bool",
                      "name": "approved",
                      "type": "bool"
                    }
                  ],
                  "name": "setApprovalForAll",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "string",
                      "name": "newBaseURI",
                      "type": "string"
                    }
                  ],
                  "name": "setBaseURI",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "timeLaunch",
                      "type": "uint256"
                    }
                  ],
                  "name": "setLaunchTime",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "managerType",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address",
                      "name": "managerAddress",
                      "type": "address"
                    }
                  ],
                  "name": "setManager",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "bytes4",
                      "name": "interfaceId",
                      "type": "bytes4"
                    }
                  ],
                  "name": "supportsInterface",
                  "outputs": [
                    {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "symbol",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "timestampFormalLaunch",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "tokenAKRE",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "index",
                      "type": "uint256"
                    }
                  ],
                  "name": "tokenByIndex",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "index",
                      "type": "uint256"
                    }
                  ],
                  "name": "tokenOfOwnerByIndex",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "tokenURI",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "totalGameMiner",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "totalSupply",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "from",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "to",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "tokenId",
                      "type": "uint256"
                    }
                  ],
                  "name": "transferFrom",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "newOwner",
                      "type": "address"
                    }
                  ],
                  "name": "transferOwnership",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "newImplementation",
                      "type": "address"
                    }
                  ],
                  "name": "upgradeTo",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "newImplementation",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes",
                      "name": "data",
                      "type": "bytes"
                    }
                  ],
                  "name": "upgradeToAndCall",
                  "outputs": [],
                  "stateMutability": "payable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "name": "whiteListMiner",
                  "outputs": [
                    {
                      "internalType": "uint8",
                      "name": "",
                      "type": "uint8"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    }
                  ],
                  "name": "withdraw",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                }
              ])

             const dataDecode =  abi.decodeFunctionData(abi.getFunction('RemoteMinerOnboard')!, response!.data)
            // const decodedData = AbiCoder.defaultAbiCoder().decode(abi, receipt!.data.slice(10))
            
            // if(BigInt(dataDecode[3][1]) !== BigInt(100000000000000000000) && BigInt(dataDecode[3][1]) !== BigInt(1000000000000000000000)){

                const record = {

                    blockNum: response?.blockNumber,
                    tokenAddr: dataDecode[3][0],
                    tokenCount: dataDecode[3][1],
                    owner: dataDecode[0],
                    miner: dataDecode[1]
    
                }
    
                remoteTx.push(record)
                console.log(record)
            // }
            
        }catch(e:any){
            console.log(e)
        }

    }

    console.log(remoteTx)

    const csvWriter = createCsvWriter({
        path: "out.csv",
        header: [
          { id: "blockNum", title: "BlockNumber" },
          { id: "tokenAddr", title: "TokenAddr" },
          { id: "tokenCount", title: "TokenCount" },
          { id: "owner", title: "Owner" },
          { id: "miner", title: "Miner" },
        ],
      });

      try{
        await csvWriter.writeRecords(remoteTx)
      }catch(e:any){
        console.log(e)
      }
      

}

main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    