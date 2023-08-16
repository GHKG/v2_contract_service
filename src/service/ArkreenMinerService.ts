import { JSONRPCParams } from "json-rpc-2.0";
import { Contract,  TransactionResponse, ContractMethodArgs} from "ethers";
import {jsonRpcResult, getGasPrice, validateParams, getGasOptionObject, validateCallService} from "../utils/Instrument";
import { RpcCode } from "../utils/RpcCode";
import { kmsSigner } from "../utils/kmsSigner";

import RegistMinerListValidateSchema, { RegistMinerListModel } from "../model/RegistMinerListModel"
import AddressValidateSchema, {AddressModel} from "../model/AddressModel";
import {provider} from '../utils/TransactionHelper'
import {SendTransactionFrame} from '../utils/SendTransactionFrame'
import logger from '../config/log4js'
import config from "../config";


async function call_contract_func_UpdateMinerWhiteList(params:RegistMinerListModel):Promise<TransactionResponse>{

    const wallet  = new kmsSigner(
        config['kmsAccount'].miner_registry.account,
        config['kmsAccount'].miner_registry.id, 
        provider)
    const abi = [
        "function UpdateMinerWhiteList(uint8 miner_type, address[] calldata miner_list) external",
    ]
    const contract = new Contract(config['contract'].miner.address, abi, wallet)

    const argArray:ContractMethodArgs<any[]> = [
        params.miner_type,
        params.miners
    ]
    //send transaction to node
    const estimatedGas = await contract.UpdateMinerWhiteList.estimateGas(...argArray)
    const gasPrice = await getGasPrice(provider, config['chain_type'])
    const gasObj = getGasOptionObject(estimatedGas, 20, gasPrice, 20)
    return await contract.UpdateMinerWhiteList(...argArray, gasObj )

}



export class ArkreenMinerService{
    async registrRemoteMinerList(params: JSONRPCParams){

        logger.info(params);
        validateParams<RegistMinerListModel>(RegistMinerListValidateSchema, params)
        validateCallService(params.call_service, config["nacosServerSubscribeList"])

        if(params.miner_type !== 3){
            throw jsonRpcResult(RpcCode.INVALID_PARAMS,"invalid miner type")
        }

        //bind params
        const func_core = call_contract_func_UpdateMinerWhiteList.bind(null, params);

        try{
            return await SendTransactionFrame(
                params,
                config['kmsAccount'].miner_registry.account,
                config['contract'].miner.address, 
                this.registrRemoteMinerList.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }
    }

    async registerStandardMinerList(params: JSONRPCParams){
        logger.info(params)
        validateParams<RegistMinerListModel>(RegistMinerListValidateSchema, params)
        validateCallService(params.call_service, config["nacosServerSubscribeList"])

        if(params.miner_type !== 2){   
            throw jsonRpcResult(RpcCode.INVALID_PARAMS,"invalid miner type")
        }

        const func_core = call_contract_func_UpdateMinerWhiteList.bind(null, params);

        try{
            return await SendTransactionFrame(
                params,
                config['kmsAccount'].miner_registry.account,
                config['contract'].miner.address, 
                this.registerStandardMinerList.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }
    }

    async getRemoteMinerStatus(params: JSONRPCParams) {
        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)

        const abi =[
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
                }
          ]

        let contract = new Contract(config['contract'].miner.address, abi, provider);

        try {
            let ret = await contract.GetMinerInfo(params.address)
            console.log(ret[1][2])
            return Number(ret[1][2])
        } catch (error:any) {
            logger.error("error in getRemoteMinerStatus", error)
            throw jsonRpcResult(error.code, error.message)
        }
    }


    async getWhiteListData(params: JSONRPCParams) {
        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)

        const abi = [
            "function whiteListMiner(address) view returns (uint8)"
        ];

        let contract = new Contract(config['contract'].miner.address, abi, provider);

        try{
            let minerType = await contract.whiteListMiner(params.address)
            return Number(minerType);
        }catch(e:any){
            logger.error("<<< error in getWhiteListData >>>\n", e)
            throw jsonRpcResult(e.code, e.message)
        }

    }

    async getMinerOwner(params: JSONRPCParams) {

        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)

        const abi =[
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
                }
          ]

        let contract = new Contract(config['contract'].miner.address, abi, provider);

        try {
            let ret = await contract.GetMinerInfo(params.address)
            return ret[0]

        } catch (error:any) {
            logger.error("<<< error in getMinerOwner >>>\n", error)
            if(error.message.substring("ERC721: invalid token ID")){
                return ""
            }else{
                throw jsonRpcResult(error.code, "fail to fetch info")
            }
        }
    }

    async getMinerNftTokenIdByAddress(params: JSONRPCParams){
        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)

        const abi = [
            "function AllMinersToken(address) view returns (uint256)",
        ];

        let contract = new Contract(config['contract'].miner.address, abi, provider);

        try{
            let tokenId = await contract.AllMinersToken(params.address)
            return tokenId.toString()
        }catch(e:any){
            logger.error("<<< error in getMinerNftTokenIdByAddress >>>\n", e)
            throw jsonRpcResult(e.code, e.message)
        }


    }
}

