import { JSONRPCParams } from "json-rpc-2.0";
import { Contract, TransactionResponse, ContractMethodArgs} from "ethers";
import {jsonRpcResult, getGasPrice, validateParams, getGasOptionObject, validateCallService} from "../utils/Instrument";
import { RpcCode } from "../utils/RpcCode";
import {toBigInt_18} from "../utils/Instrument";
import { kmsSigner } from "../utils/kmsSigner";

import NotaryNetworkStateValidateSchema, {NotaryNetworkStateModel} from '../model/NotaryNetworkStateModel';
import {provider} from '../utils/TransactionHelper'
import {SendTransactionFrame} from '../utils/SendTransactionFrame'
import logger from '../config/log4js'
import config from "../config";


async function call_contract_func_saveData(params:NotaryNetworkStateModel):Promise<TransactionResponse>{

    const wallet = new kmsSigner(
        config['kmsAccount'].notary.account,
        config['kmsAccount'].notary.id,
        provider)
    const abi = [
        "function saveData(string calldata blockHash, string calldata cid,uint256 blockHeight,uint256 totalPowerGeneration,uint256 circulatingSupply) public returns (bool)"
    ]
    const contract = new Contract(config['contract'].notary.address, abi, wallet)
    const argArray:ContractMethodArgs<any[]> = [
        params.blockHash,
        params.cid,
        BigInt(params.blockHeight),
        BigInt(params.totalPowerGeneration),
        BigInt(params.circulatingSupply)
    ]

    const estimatedGas = await contract.saveData.estimateGas(...argArray)
    logger.info('estimatedGas is :', estimatedGas)
    const gasPrice = await getGasPrice(provider, config['chain_type'])
    logger.info(`gasPrice is ${gasPrice} in ${config['chain_type']}`)
    const gasObj = getGasOptionObject(estimatedGas, 20, gasPrice, 10)
    return await contract.saveData(...argArray, gasObj )    
}

export class ArkreenNotaryService{

    async notarizeNetworkState(params: JSONRPCParams){

        logger.info(params);
        validateParams<NotaryNetworkStateModel>(NotaryNetworkStateValidateSchema, params)
        validateCallService(params.call_service, config["nacosServerSubscribeList"])

        const totalPowerGeneration = toBigInt_18(params.totalPowerGeneration)
        const circulatingSupply = toBigInt_18(params.circulatingSupply)
    
        if(!totalPowerGeneration || !circulatingSupply){
            throw jsonRpcResult(RpcCode.INVALID_PARAMS)
        }

        params.totalPowerGeneration = totalPowerGeneration.toString()
        params.circulatingSupply = circulatingSupply.toString()

        const func_core = call_contract_func_saveData.bind(null, params); //bind params
        try{
            return await SendTransactionFrame(
                params,
                config['kmsAccount'].notary.account,
                config['contract'].notary.address, 
                this.notarizeNetworkState.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }

    }
}
