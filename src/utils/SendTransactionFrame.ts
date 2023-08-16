import {TransactionResponse,TransactionReceipt} from "ethers";
import {jsonRpcResult} from "../utils/Instrument";
import { RpcCode } from "../utils/RpcCode";

import {provider ,beforeSendTransaction, updateRecordStatusSendError,updateSendSuccessButPending,
    updateByReceiptAndGenerateResponse} from '../utils/TransactionHelper'

import logger from '../config/log4js'
import { config } from "dotenv";


export async function SendTransactionFrame(params, from:string, to:string, methodName:string, func_core:() => Promise<TransactionResponse>, timeout:number) {
    
    let new_docs:{in_all, in_pending}
    let response:TransactionResponse;
    let receipt:TransactionReceipt|null;
    let queryTransactionRecord = {}

    queryTransactionRecord['sender_addr'] = from
    queryTransactionRecord['contract_addr'] = to


    try{
        new_docs = await beforeSendTransaction(params, methodName, queryTransactionRecord)
    }catch(e:any){

        logger.error("<<< error in beforeSendTransaction >>>\n", e)

        if(e.code === 11000){
            throw jsonRpcResult(RpcCode.BUSINESS_MONGODB_DUPLICATE_KEY)
        }else{
            throw jsonRpcResult(RpcCode.BUSINESS_MONGODB_ADD_RECORD_FAILED)
        }
    }

    //// for test only
    // await updateRecordStatusSendError(queryTransactionRecord, new_docs)
    // return {
    //     code: 2,
    //     message: "query accepted but send failed, a notify will come in the future",
    //     queryHash: queryTransactionRecord['query_hash']
    // }
    //// end test
    
    try{
        response = await func_core()
    }catch(e:any){
        // send transaction failed
        logger.error("<<< send transaction error >>>\n", e)

        await updateRecordStatusSendError(queryTransactionRecord, new_docs)
        return {
            code: 2,
            message: "query accepted but send failed, a notify will come in the future",
            queryHash: queryTransactionRecord['query_hash']
        }
    }


    
    try{   
        //record transaction information to data base  is very import,
        await updateSendSuccessButPending(queryTransactionRecord, new_docs, response)
    }catch(e:any){ 
        //write local data base or exit()
        logger.error('<<< Error in write transaction infomation to db >>>\n')
    }


    try{
        // wait for transaction receipt
        receipt = await provider.waitForTransaction(response.hash, 1, timeout*1000)//wait for X miliseconds
    }catch(e:any){
        // await updateSendSuccessButPending(queryTransactionRecord, new_docs, response, abi[0])
        if(e.code === "TIMEOUT"){
            return {
                code: 3,
                message: "query accepted, transaction pending, wait timeout",
                queryHash: queryTransactionRecord['query_hash'],
                transaction_hash: response.hash
            }
        }else{
            //code guard
            return{
                code: 4,
                message: "query accepted, transaction pending, wait erro",
                queryHash: queryTransactionRecord['query_hash'],
                transaction_hash: response.hash
            }
        }
    }

    return await updateByReceiptAndGenerateResponse(queryTransactionRecord, new_docs, response, receipt)

}