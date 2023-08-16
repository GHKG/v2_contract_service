import { JSONRPCParams } from "json-rpc-2.0";
import { Contract,recoverAddress} from "ethers";

import {jsonRpcResult,getERC20PermitDigest, validateParams} from "../utils/Instrument";
import {provider} from '../utils/TransactionHelper'

import AddressValidateSchema, {AddressModel} from "../model/AddressModel";
import VerifyERC20PermitValidateSchema, {VerifyERC20PermitModel} from "../model/VerifyERC20PermitModel";

import logger from '../config/log4js'
import config from "../config";


export class ArkreenTokenService{

    async getPermitNonce(params: JSONRPCParams) {

        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)
        const abi = [
            "function nonces(address) view returns (uint256)",
        ];
        let contract = new Contract(config['contract'].erc20_token.address, abi, provider);

        try {
            let nonce = await contract.nonces(params.address)
            return nonce.toString()

        } catch (error:any) {
            logger.error("<<< error in getERC20PermitNonce >>>\n", error)
            throw jsonRpcResult(error.code, error.message)
        }
    }


    async verifyERC20PermitSignature(params:JSONRPCParams) {

        logger.info(params)
        validateParams<VerifyERC20PermitModel>(VerifyERC20PermitValidateSchema, params)
        
        let owner_nonce

        try{
            let ret = await this.getPermitNonce({"address": params.owner})
            owner_nonce= parseInt(ret)
            logger.info("Get owner nonce: ", owner_nonce)
        }catch(e:any){
            logger.error("<<< error in verifyERC20PermitSignature >>>\n", e)
            throw e
        }

        let contract_addr = config['contract'].erc20_token.address
        let domain_name = config['contract'].erc20_token.name 
        let version = config['contract'].erc20_token.version
        let spender = config['contract'].rec_issuance.address

        const sig = '0x' + params.sig.substring(4) + params.sig.substring(2,4)
        const digest = getERC20PermitDigest(
            params.owner,
            spender,
            BigInt(params.value),
            BigInt(owner_nonce),
            BigInt(params.deadline),

            domain_name,
            version,
            contract_addr,
            config['chain_id']
        )

        let recoverAddr = recoverAddress(digest, sig)
        if(recoverAddr.toLowerCase() == params.owner.toLowerCase()){
            return "true"
        }else{
            return "false"
        }
    }
}