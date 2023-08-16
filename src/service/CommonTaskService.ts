import { JSONRPCParams } from "json-rpc-2.0";
import { Contract} from "ethers";
const axios = require('axios');

import {jsonRpcResult,getWithdrawDigest, getMinerNFTDigest, 
    getStandardMinerNFTDigest, getPriceAuthorizationDigest, validateParams} from "../utils/Instrument";
import {provider} from '../utils/TransactionHelper'

import db, {AllTransactionModel} from '../model/MongodbModels/TransactionModel'
import HashValidateSchema, { HashModel } from "../model/HashModel";
import AddressValidateSchema, {AddressModel} from "../model/AddressModel";
import WithdrawValidateSchema , {WithdrawAuthModel} from "../model/WithdrawAuthModel"
import NftMintValidateSchema, {NftMintAuthModel} from "../model/NftMintAuthModel";
import PriceAuthValidateSchema, {PriceAuthModel} from "../model/PriceAuthModel";

import {kmsRpcService} from '../rpc/KMSRpcService'
import logger from "../config/log4js";
import config from "../config";


export class CommonTaskService{

    async TEST(params:JSONRPCParams){
        console.log("nacos instances: ",config.nacosInstances)
        return{
            res:config.nacosInstances
        }
    }

    async getQueryRecordByHash(params: JSONRPCParams){
        logger.info(params);
        validateParams<HashModel>(HashValidateSchema, params)

        let db_query_obj = {}

        if(params.trans_hash){
            db_query_obj = {trans_hash:{ $exists: true, $eq: params.trans_hash}}
        }else{
            db_query_obj = {query_hash:{ $exists: true, $eq: params.query_hash}}
        }

        try{
            const targetRecord = await db.getByQuery(AllTransactionModel, db_query_obj)

            if(targetRecord.length === 1){
                return {
                    code:1,
                    message:"record found",
                    record: targetRecord[0]
                }
            }else if(targetRecord.length === 0){
                return {
                    code:0,
                    message: "record not found"
                }
            }else{
                return{
                    code: -1,
                    message: "more than one records are found, maybe something is wrong",
                }
            }

        }catch(e:any){

            return {
                code: -2,
                message: "look up error or db error",
                error:e
            }
        }

    }

    async requestWithdrawAuthorization(params: JSONRPCParams){
        logger.info(params)
        validateParams<WithdrawAuthModel>(WithdrawValidateSchema, params)

        let contract_addr = config['contract'].withdraw.address
        let domain_name =  config['contract'].withdraw.name
        let version = config['contract'].withdraw.version

        let digest = getWithdrawDigest(
            params.recipient,
            BigInt(params.value),
            BigInt(params.nonce),
            contract_addr,
            domain_name,
            version,
            config['chain_id']
        )

        try{
            let sig:any = await kmsRpcService.signByKeyId({ 
                keyId: config['kmsAccount'].reward_withdraw.id, 
                hash: digest.slice(2)})
            
            return {
                recipient: params.recipient,
                value: params.value,
                nonce: params.nonce,
                signature: {
                    r: sig.r,
                    s: sig.s,
                    v: sig.recid + 27
                },
                digest:digest,
            }
        }catch(error:any){
            logger.error("<<< error in requestWithdrawAuthorization >>>\n", error)
            throw error
        }
    }

    async requestNftMintAuthorization(params: JSONRPCParams){

        logger.info(params)
        validateParams<NftMintAuthModel>(NftMintValidateSchema, params)

        let contract_addr = config['contract'].miner.address
        let domain_name = config['contract'].miner.name
        let version = config['contract'].miner.version


        let digest = getMinerNFTDigest(
            params.ownerAddress,
            params.minerAddress,
            false,
            BigInt(params.deadline),
            contract_addr,
            domain_name,
            version,
            config['chain_id']
        )

        try{
            let sig:any = await kmsRpcService.signByKeyId({ 
                keyId: config['kmsAccount'].miner_registry.id, 
                hash: digest.slice(2)})
            
            return {
                recipient: params.ownerAddress,
                minerAddress:params.minerAddress,
                deadline: params.deadline,
                signature: {
                    r: sig.r,
                    s: sig.s,
                    v: sig.recid + 27
                },
                digest:digest
            }
        }catch(error:any){
            logger.error("<<< error in requestNftMintAuthorization >>>\n", error)
            throw error
        }

    }


    async requestStandardMinerNftMintAuthorization(params: JSONRPCParams){
        logger.info(params)
        validateParams<NftMintAuthModel>(NftMintValidateSchema, params)

        let contract_addr = config['contract'].miner.address
        let domain_name = config['contract'].miner.name
        let version = config['contract'].miner.version

        let digest = getStandardMinerNFTDigest(
            params.ownerAddress,
            params.minerAddress,
            BigInt(params.deadline),
            contract_addr,
            domain_name,
            version,
            config['chain_id']
        )

        try{
            let sig:any = await kmsRpcService.signByKeyId({ 
                keyId: config['kmsAccount'].miner_registry.id, 
                hash: digest.slice(2)})

            let ret = {
                ownerAddress:params.ownerAddress,
                minerAddress:params.minerAddress,
                deadline : params.deadline,
                signature : {
                    r: sig.r,
                    s: sig.s,
                    v: sig.recid + 27
                },
                digest:digest
            }
            return ret
        }catch(error:any){
            logger.error("<<< error in requestStandardMinerNftMintAuthorization >>>\n", error)
            throw error
        }
    }

    async getERC20Decimal(params: JSONRPCParams){
        logger.info(params)
        validateParams<AddressModel>(AddressValidateSchema, params)

        const abi = [
            "function decimals() external view returns(uint8)",
        ];
        let contract = new Contract(params.address, abi, provider);

        try{
            let decimal = await contract.decimals()
            return decimal.toString()
        }catch(error:any){
            logger.error("<<< error in getERC20Decimal >>>\n", error)
            throw jsonRpcResult(error.code, error.message)
        }
    }

    async getPriceAuthorization(params: JSONRPCParams){

        logger.info(params)
        validateParams<PriceAuthModel>(PriceAuthValidateSchema, params)

        let contract_addr = config['contract'].miner.address
        let domain_name = config['contract'].miner.name
        let version = config['contract'].miner.version

        console.log(`*******   price is ${BigInt(params.price)}`)

        let digest = getPriceAuthorizationDigest(
            params.owner,
            params.miner,
            params.currency,
            BigInt(params.price),
            BigInt(params.deadline),

            domain_name,
            version,
            contract_addr,
            config['chain_id']
        )

        try{
            let sig:any = await kmsRpcService.signByKeyId({ 
                keyId: config['kmsAccount'].miner_registry.id, 
                hash: digest.slice(2)})

            let ret = {
                ownerAddress:params.owner,
                minerAddress:params.miner,
                currencyAddress:params.currency,
                price: params.price,
                deadline : params.deadline,
                signature : {
                    r: sig.r,
                    s: sig.s,
                    v: sig.recid + 27
                },
                digest:digest
            }
            return ret

        }catch(error:any){
            logger.info("<<< error in getPriceAuthorization >>>\n", error)
            throw jsonRpcResult(error.code, error.message)
        }

    }

    async getMaticPrice(params:JSONRPCParams){

        const url = "https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=DP59DP1UHEJ4Q4XX4R82M4ZX6KBZ9M676R"
        try{
            const response = await axios.get(url)
            return response.data.result.maticusd
        }catch(error:any){
            logger.info("error in getMaticPrice\n", error)
            throw jsonRpcResult(error.code, error.message)
        }
    }



}
