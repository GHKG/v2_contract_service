import { JSONRPCParams } from "json-rpc-2.0";
import { Contract, TransactionResponse, ContractMethodArgs} from "ethers";
import {jsonRpcResult, getGasPrice, validateParams, getGasOptionObject, validateCallService} from "../utils/Instrument";
import { kmsSigner } from "../utils/kmsSigner";
import CertifyArecValidateSchema, { CertifyArecModel } from "../model/CertifyArecModel";
import TokenIdValidateSchema, {TokenIdModel} from "../model/TokenIdModel"

import {provider} from '../utils/TransactionHelper'
import {SendTransactionFrame} from '../utils/SendTransactionFrame'

import logger from '../config/log4js'
import config from "../config";


async function call_contract_func_certifyRECRequest(params:CertifyArecModel):Promise<TransactionResponse>{
    
    const wallet  = new kmsSigner(
        config['kmsAccount'].rec_issuing.account,
        config['kmsAccount'].rec_issuing.id, 
        provider)
    const abi = [
        "function certifyRECRequest(uint256 tokenID, string memory serialNumber) external",
    ]
    const contract = new Contract(config['contract'].rec_issuance.address, abi, wallet)
    const argArray:ContractMethodArgs<any[]> = [
        params.tokenId,
        params.serialNumber,
    ]
    // const estimatedGas = await contract.certifyRECRequest.estimateGas(...argArray)

    // let gasObj = {gasLimit: estimatedGas*BigInt(120)/BigInt(100)}
    // let gasPrice = await getGasPrice(provider, config['chain_type'])
    // if(gasPrice !== null){
    //     console.log("get gas price value: ", gasPrice)
    //     gasObj['gasPrice'] = BigInt(gasPrice)*BigInt(120)/BigInt(100)
    // }

    // return await contract.certifyRECRequest(...argArray, gasObj )

    const estimatedGas = await contract.certifyRECRequest.estimateGas(...argArray)
    const gasPrice = await getGasPrice(provider, config['chain_type'])
    const gasObj = getGasOptionObject(estimatedGas, 20, gasPrice, 20)
    return await contract.certifyRECRequest(...argArray, gasObj )

}

async function call_contract_func_rejectRECRequest(params:TokenIdModel):Promise<TransactionResponse>{

    const wallet  = new kmsSigner(
        config['kmsAccount'].rec_issuing.account,
        config['kmsAccount'].rec_issuing.id,  
        provider)
    const abi = [
        "function rejectRECRequest(uint256 tokenID) external",
    ]
    const contract = new Contract(config['contract'].rec_issuance.address, abi, wallet)
    const argArray:ContractMethodArgs<any[]> = [
        params.tokenId,
    ]

    // const estimatedGas = await contract.rejectRECRequest.estimateGas(...argArray)

    // let gasObj = {gasLimit: estimatedGas*BigInt(120)/BigInt(100)}
    // let gasPrice = await getGasPrice(provider, config['chain_type'])
    // if(gasPrice !== null){
    //     console.log("get gas price value: ", gasPrice)
    //     gasObj['gasPrice'] = BigInt(gasPrice)*BigInt(120)/BigInt(100)
    // }

    // return await contract.rejectRECRequest(...argArray, gasObj )
    const estimatedGas = await contract.rejectRECRequest.estimateGas(...argArray)
    const gasPrice = await getGasPrice(provider, config['chain_type'])
    const gasObj = getGasOptionObject(estimatedGas, 20, gasPrice, 20)
    return await contract.rejectRECRequest(...argArray, gasObj )
}

export class ArkreenARECIssuenceService{
    async certifyArec(params: JSONRPCParams){

        logger.info(params);
        validateParams<CertifyArecModel>(CertifyArecValidateSchema, params)
        validateCallService(params.call_service, config["nacosServerSubscribeList"])
     
        const func_core = call_contract_func_certifyRECRequest.bind(null, params);   //bind params

        try{
            return await SendTransactionFrame(
                params, 
                config['kmsAccount'].rec_issuing.account,
                config['contract'].rec_issuance.address,
                this.certifyArec.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }

    }


    async rejectArec(params: JSONRPCParams){

        logger.info(params);
        validateParams<TokenIdModel>(TokenIdValidateSchema, params)
        validateCallService(params.call_service, config["nacosServerSubscribeList"])

        const func_core = call_contract_func_rejectRECRequest.bind(null, params);  //bind params

        try{
            return await SendTransactionFrame(
                params, 
                config['kmsAccount'].rec_issuing.account,
                config['contract'].rec_issuance.address,
                this.rejectArec.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }

    }


    async getArecNft(params: JSONRPCParams) {

        logger.info(params)
        validateParams<TokenIdModel>(TokenIdValidateSchema, params)

        let abi =  [
            {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "getRECData",
            "outputs": [
              {
                "components": [
                  {
                    "internalType": "address",
                    "name": "issuer",
                    "type": "address"
                  },
                  {
                    "internalType": "string",
                    "name": "serialNumber",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "minter",
                    "type": "address"
                  },
                  {
                    "internalType": "uint32",
                    "name": "startTime",
                    "type": "uint32"
                  },
                  {
                    "internalType": "uint32",
                    "name": "endTime",
                    "type": "uint32"
                  },
                  {
                    "internalType": "uint128",
                    "name": "amountREC",
                    "type": "uint128"
                  },
                  {
                    "internalType": "uint8",
                    "name": "status",
                    "type": "uint8"
                  },
                  {
                    "internalType": "string",
                    "name": "cID",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "region",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "url",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "memo",
                    "type": "string"
                  },
                  {
                    "internalType": "uint16",
                    "name": "idAsset",
                    "type": "uint16"
                  }
                ],
                "internalType": "struct RECData",
                "name": "",
                "type": "tuple"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ]

        let contract = new Contract(config['contract'].rec_issuance.address, abi, provider);

        try{
            let nft_obj_array = await contract.getRECData(params.tokenId)

            let nft_obj = {
                issuer: nft_obj_array[0],
                serialNumber: nft_obj_array[1],
                minter:nft_obj_array[2],
                startTime:Number(nft_obj_array[3]),
                endTime:Number(nft_obj_array[4]),
                amountREC:Number(nft_obj_array[5]),
                status:Number(nft_obj_array[6]),
                cID:nft_obj_array[7],
                region: nft_obj_array[8],
                url:nft_obj_array[9],
                memo:nft_obj_array[10],
                idAsset:Number(nft_obj_array[11])
            }

            return nft_obj
        }catch(e:any){
            logger.error("<<< error in getArecNft >>>\n", e)
            throw jsonRpcResult(e.code, e.message)
        }

    }
}



