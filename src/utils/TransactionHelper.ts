import { JSONRPCParams } from "json-rpc-2.0";
import { ethers, InfuraProvider, TransactionResponse, TransactionReceipt} from "ethers";
import {sortObject} from "./Instrument"
import db, {AllTransactionModel, PendingTransactionModel} from '../model/MongodbModels/TransactionModel'

import config from "../config";
import logger from '../config/log4js'

export const provider = new InfuraProvider(config['chain_type'], config['provider_key'])

export async function beforeSendTransaction(params: JSONRPCParams, funcName:string, qtRecord:Object){

    let new_doc_in_all;
    let new_doc_in_pending;

    const params_ordered_string = JSON.stringify(sortObject(params))
    const query_id = params.call_service +"&&"+ params_ordered_string +"&&"+ funcName

    qtRecord['query_time'] = Date.now()
    qtRecord['call_service'] = params.call_service
    qtRecord['interface_name'] = funcName
    qtRecord['params_json_string'] = params_ordered_string
    qtRecord['call_back_method'] = params.call_back_method
    qtRecord['query_hash'] = ethers.keccak256(Buffer.from(query_id, 'utf-8'))
    qtRecord['transaction_status'] = "init"

    qtRecord['notify_status'] = false
    qtRecord['notify_count'] = 0

    try{
        new_doc_in_pending = await db.add_record(PendingTransactionModel, qtRecord)
        new_doc_in_all = await db.add_record(AllTransactionModel,qtRecord)
    }catch(e:any){
        logger.error("<<< add record error >>>\n", e)
        throw e
    }

    return {
        in_all:new_doc_in_all, 
        in_pending: new_doc_in_pending
    }
}

export async function updateRecordStatusSendError(qtRecord:Object, docs:{in_all,in_pending}) {
    qtRecord['transaction_status'] = 'send_error'
    try{
        await db.update_record(PendingTransactionModel,docs.in_pending._id, qtRecord)
        await db.update_record(AllTransactionModel, docs.in_all._id, qtRecord)
    }catch(e:any){
        logger.error("<<< update db error >>>\n", e)
    }

    
}

export async function updateSendSuccessButPending(qtRecord:Object, docs, response) {
    qtRecord['trans_hash'] = response.hash
    qtRecord['sender_addr'] = response.from
    qtRecord['contract_addr'] = response.to
    // qtRecord['chain_id'] = response.chainId
    // qtRecord['contract_function_name'] = contract_function
    qtRecord['transaction_status'] = 'pending'

    try{
        //update pending transaction record
        await db.update_record(PendingTransactionModel,docs.in_pending._id, qtRecord)
        await db.update_record(AllTransactionModel, docs.in_all._id, qtRecord)
        
    }catch(e:any){
        logger.error("update record error :", e)
    }
}

// export async function waitForTransactionReceipt( qtRecord:Object, doc, timeout:number, transactionHash) {
    
//     const receipt = await provider.waitForTransaction(transactionHash, 1, timeout*1000)//wait for X miliseconds
    
//     if(receipt == null){
//         return {
//             result: "accept",
//             message: "query accepted, transaction pending, network error",
//             transaction_hash: transactionHash
//         }
//     }else{
//         if(receipt.status === 1){
//             qtRecord['transaction_status'] = 'confirmed'
//             qtRecord['block_number'] = receipt.blockNumber
//             qtRecord['status_query_count'] = 0
    
//             try{
//                 await db.update_record(AllTransactionModel, doc._id, qtRecord)
//             }catch(e:any){
//                 logger.error("update record error :", e)
//             }

//             return {
//                 result: "success",
//                 message: "transaction execute success",
//                 transaction_hash: receipt.hash
//             }
//         }

//         if(receipt.status === 0){
//             qtRecord['transaction_status'] = 'failed'
//             qtRecord['block_number'] = receipt.blockNumber
//             qtRecord['status_query_count'] = 0
    
//             try{
//                 await db.update_record(AllTransactionModel, doc._id, qtRecord)
//             }catch(e:any){
//                 logger.error("update record error :", e)
//             }

//             return {
//                 result: "failed",
//                 message: "transaction execute failed",
//                 transaction_hash: receipt.hash
//             }
//         }

//     }   
// }

export async function updateByReceiptAndGenerateResponse(qtRecord:Object, docs, response:TransactionResponse, receipt:TransactionReceipt|null){
    let res = {
        code: 0,
        message:"",
        query_hash:qtRecord['query_hash'],
        transaction_hash:response.hash
    }

    if(receipt == null){

        res.code = 6
        res.message = "query accepted, transaction pending, network error"

    }else{

        if(receipt.status === 1){
            qtRecord['transaction_status'] = 'confirmed'
            qtRecord['block_number'] = receipt.blockNumber
            qtRecord['status_query_count'] = 0
            qtRecord['notify_status'] = true
            qtRecord['notify_count'] = 0

            try{
                await db.update_record(AllTransactionModel, docs.in_all._id, qtRecord)
                await db.delete_record(PendingTransactionModel, docs.in_pending._id)
            }catch(e:any){
                logger.error("update record error :", e)
            }

            res.code = 1
            res.message = "transaction execute success"
        }

        if(receipt.status === 0){
            qtRecord['transaction_status'] = 'failed'
            qtRecord['block_number'] = receipt.blockNumber
            qtRecord['status_query_count'] = 0
            qtRecord['notify_status'] = true
            qtRecord['notify_count'] = 0

            try{
                await db.update_record(AllTransactionModel, docs.in_all._id, qtRecord)
                await db.delete_record(PendingTransactionModel, docs.in_pending._id)
            }catch(e:any){
                logger.error("update record error :", e)
            }

            res.code = 5
            res.message = "transaction execute failed"
        }
    }
    
    return res
}