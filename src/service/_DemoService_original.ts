// import { DbDataSource } from "../config/db";
import { JSONRPCParams } from "json-rpc-2.0";
import { ethers, Block, InfuraProvider, Contract,ContractMethodArgs, Wallet, TransactionReceipt} from "ethers";
// import moment from 'moment';
import { ValidateError } from "async-validator";

import {jsonRpcResult} from "../utils/Instrument";
import { RpcCode } from "../utils/RpcCode";
import {validate} from "../utils/Instrument";
import {sortObject} from "../utils/Instrument"
import { kmsSigner } from "../utils/kmsSigner";

import DemoValidateSchema, { DemoModel } from "../model/DemoModel";
import db, {AllTransactionModel, PendingTransactionModel, QueryCreateation} from '../model/MongodbModels/TransactionModel'

import config from "../config";
import logger from '../config/log4js'


const provider = new InfuraProvider(config['chain_type'], config['provider_key'])

// console.log("current block high: ", await provider.getBlockNumber())

export class DemoService {

    async getAccount(params: JSONRPCParams) {

        logger.info(params);
        const time_now = Date.now()
        const query_info = <DemoModel>params
        let new_doc;
        let response;
        let receipt;
        let queryTransactionRecord = {}

        const validateResult: ValidateError[] = validate<DemoModel>(DemoValidateSchema, query_info)
        if (validateResult.length > 0) {
            throw jsonRpcResult(RpcCode.INVALID_PARAMS, validateResult[0].message)
        }

        const params_ordered_string = JSON.stringify(sortObject(params))
        const query_id = query_info.call_service +"&&"+ params_ordered_string +"&&"+ this.getAccount.name

        // const query_create_obj:QueryCreateation = {
        //         query_time: time_now,
        //         call_service: query_info.call_service,
        //         interface_name: this.getAccount.name,
        //         params_json_string: params_ordered_string,
        //         query_hash: ethers.keccak256(Buffer.from(query_id, 'utf-8'))
        // }

        queryTransactionRecord['query_time'] = time_now
        queryTransactionRecord['call_service'] = query_info.call_service
        queryTransactionRecord['interface_name'] = this.getAccount.name
        queryTransactionRecord['params_json_string'] = params_ordered_string
        queryTransactionRecord['query_hash'] = ethers.keccak256(Buffer.from(query_id, 'utf-8'))

        // console.log(queryTransactionRecord)

        try{
            new_doc = await db.add_record(AllTransactionModel,queryTransactionRecord)
            // console.log("new doc", new_doc!._id)
        }catch(e:any){
            // if(e.code === 11000){
            //     throw jsonRpcResult(RpcCode.BUSINESS_DUPLICATE_KEY)
            // }
            logger.error("add_record to all error : ", e)
            throw jsonRpcResult(e.code, e.message)
        }

        // const wallet = new Wallet(config['private_key'], provider)
        const wallet  = new kmsSigner("0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49","key_save_data", provider)
        const abi = [
            // "function readData1() view external",
            "function saveData1(uint256 data)",
        ]
        const contract = new Contract("0x8Ec9e32303B2c5AdEd5FAa32BeC613727b716bdD", abi, wallet)
        try{
            //send transaction

            const argArray:ContractMethodArgs<any[]> = [
                query_info.length
            ]
            const estimatedGas = await contract.saveData1.estimateGas(...argArray)
            const feeData = await provider.getFeeData();

            response = await contract.saveData1(...argArray,{ 
                gasLimit: estimatedGas*BigInt(120)/BigInt(100),
                gasPrice: feeData.gasPrice!*BigInt(120)/BigInt(100)}
            )

            // console.log(response)

            queryTransactionRecord['trans_hash'] = response.hash
            queryTransactionRecord['sender_addr'] = response.from
            queryTransactionRecord['contract_addr'] = response.to
            queryTransactionRecord['chain_id'] = response.chain_id
            queryTransactionRecord['contract_function_name'] = abi[0]
            queryTransactionRecord['transaction_status'] = 'pending'

        }catch(e:any){
            //send transaction failed
            queryTransactionRecord['transaction_status'] = 'send_error'
            try{
                await db.update_record(AllTransactionModel, new_doc._id, queryTransactionRecord)
                await db.add_record(PendingTransactionModel, queryTransactionRecord)
            }catch(e:any){
                // throw jsonRpcResult(RpcCode.BUSINESS_UPDATE_FAILED)
                logger.error("write db error :", e)
            }

            //return error information to caller
            throw jsonRpcResult(RpcCode.BUSINESS_SEND_TRANSACTION_FAILED)
        }


        try{
            //update pending transaction record
            await db.update_record(AllTransactionModel, new_doc._id, queryTransactionRecord)
        }catch(e:any){
            logger.error("write db error :", e)
        }


        try{
            //wait for transaction confirmed
            receipt = await provider.waitForTransaction(response.hash, 1, 15000)//wait for X seconds
            if(receipt && (receipt.status === 1 || receipt.blockHash !== null || receipt.blockNumber !== null)){
                queryTransactionRecord['transaction_status'] = 'confirmed'
                queryTransactionRecord['block_number'] = receipt.blockNumber
                queryTransactionRecord['status_query_count'] = 0

                try{
                    await db.update_record(AllTransactionModel, new_doc._id, queryTransactionRecord)
                }catch(e:any){
                    logger.error("update db error :", e)
                }

                return {
                    result: "success",
                    transaction_hash: receipt.hash
                }

            }else{
                 
            }
            
        }catch(e:any){
            if(e.code === "TIMEOUT"){
                queryTransactionRecord['transaction_status'] = 'pending'
                try{
                    //update and add
                    await db.update_record(AllTransactionModel, new_doc._id, queryTransactionRecord)
                    await db.add_record(PendingTransactionModel, queryTransactionRecord)
                }catch(e:any){
                    logger.error("update db error :", e)
                }

                return {
                    result: "pending",
                    transaction_hash: response.hash
                }
            }
        }
                
        // return {
        //     call_function_name: this.getAccount.name,
        //     query_receive_time: moment(time_now).format('YYYY-MM-DD HH:mm:ss') + `[${time_now}]`,
        //     call_from_service: query_info.call_service,
        //     params_json_string: params_ordered_string,
        //     query_hash: ethers.keccak256(Buffer.from(query_id, 'utf-8')),
        //     original_params:params
        // }
    }

}


// export class ArkreenNotaryService{

//     async notarizeNetworkState(params: JSONRPCParams){
//         logger.info(params);

//         const query_info = <NotaryNetworkStateModel>params
//         const validateResult: ValidateError[] = validate<NotaryNetworkStateModel>(NotaryNetworkStateValidateSchema, query_info)
//         if (validateResult.length > 0) {
//             throw jsonRpcResult(RpcCode.INVALID_PARAMS, validateResult[0].message)
//         }


//         let new_docs:{in_all, in_pending}
//         let response:TransactionResponse;
//         let receipt:TransactionReceipt|null;
//         let queryTransactionRecord = {}

//         try{
//             new_docs = await beforeSendTransaction(params, this.notarizeNetworkState.name, queryTransactionRecord)
//         }catch(e:any){

//             logger.error("{{{error in beforeSendTransaction}}} \n", e)

//             if(e.code === 11000){
//                 throw jsonRpcResult(RpcCode.BUSINESS_MONGODB_DUPLICATE_KEY)
//             }else{
//                 throw jsonRpcResult(RpcCode.BUSINESS_MONGODB_ADD_RECORD_FAILED)
//             }
//         }

//         // // const wallet = new Wallet(config['private_key'], provider)
//         // const wallet  = new kmsSigner("0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49","key_save_data", provider)
//         // const abi = [
//         //     "function saveData1(uint256 data)",
//         // ]
//         // const contract = new Contract("0x8Ec9e32303B2c5AdEd5FAa32BeC613727b716bdD", abi, wallet)

//         try{
//             //send transaction to node
//             // const estimatedGas = await contract.saveData1.estimateGas(8)
//             // const feeData = await provider.getFeeData();
    
//             // response = await contract.saveData1(8,{ 
//             //     gasLimit: estimatedGas*BigInt(120)/BigInt(100),
//             //     gasPrice: feeData.gasPrice!*BigInt(120)/BigInt(100)}
//             // )

//             response = await call_contract_func_notary()
//         }catch(e:any){
//             // send transaction failed
//             await updateRecordStatusSendError(queryTransactionRecord, new_docs)
//             return {
//                 code: 2,
//                 message: "query accepted but send failed, a notify wiil come in the future"
//             }
//         }


//         //record transaction information to data base  is very import,
//         try{
//             await updateSendSuccessButPending(queryTransactionRecord, new_docs, response)
//         }catch(e:any){
//             //write local data base or exit()
//         }


//         try{
//             // wait for transaction receipt
//             receipt = await provider.waitForTransaction(response.hash, 1, 15*1000)//wait for X miliseconds
//         }catch(e:any){
//             // await updateSendSuccessButPending(queryTransactionRecord, new_docs, response, abi[0])
//             if(e.code === "TIMEOUT"){
//                 return {
//                     code: 3,
//                     message: "query accepted, transaction pending, wait timeout",
//                     transaction_hash: response.hash
//                 }
//             }else{
//                 //code guard
//                 return{
//                     code: 4,
//                     message: "query accepted, transaction pending, wait erro",
//                     transaction_hash: response.hash
//                 }
//             }
//         }


//         return await updateByReceiptAndGenerateResponse(queryTransactionRecord, new_docs, response, receipt)



//     }
// }

