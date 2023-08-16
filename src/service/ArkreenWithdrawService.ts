import { JSONRPCParams } from "json-rpc-2.0";
import { Contract} from "ethers";

import {provider} from '../utils/TransactionHelper'
import {jsonRpcResult, validateParams} from "../utils/Instrument";
import AddressValidateSchema, {AddressModel} from "../model/AddressModel";

import logger from '../config/log4js'
import config from "../config";

export class ArkreenWithdrawService{

    async getWithdrawNonce(params: JSONRPCParams) {

        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)
        const abi = [
            "function nonces(address) view returns (uint256)",
        ];
        try{
            let contract = new Contract(config['contract'].withdraw.address, abi, provider);
            let nonce = await contract.nonces(params.address)
            // console.log(nonce)
            return nonce.toString()

        }catch(error:any){
            logger.error("<<< error in getWithdrawNonce >>>\n", error)
            throw jsonRpcResult(error.code, error.message)
        }
    }


}