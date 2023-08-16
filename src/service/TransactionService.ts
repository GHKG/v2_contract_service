// import { DbDataSource } from "../config/db";
import logger from '../config/log4js'
import { JSONRPCParams } from "json-rpc-2.0";
import { Contract, InfuraProvider,  ethers } from "ethers";
import {jsonRpcResult, validate} from "../utils/Instrument";
import { ValidateError } from "async-validator";

import { ObjectId } from 'typeorm';
import config from '../config';
import { kmsSigner } from '../utils/kmsSigner';
import CertifyArecValidateSchema, { CertifyArecModel } from '../model/CertifyArecModel';
import NotaryNetworkStateValidateSchema, { NotaryNetworkStateModel } from '../model/NotaryNetworkStateModel';
import { AllTransactionModel, PendingTransactionModel } from '../model/MongodbModels/TransactionModel';
import RegistMinerListValidateSchema, { RegistMinerListModel } from '../model/RegistMinerListModel';
import RejectArecValidateSchema, { RecectArecModel } from '../model/RejectArecModel';


// import addressValidateSchema, { AddressModel } from "../model/AddressModel";
// import listValidateSchema, { ListModel } from "../model/ListModel";
// import { Account } from "../entity/Account";

// const repository = DbDataSource.getRepository('')

const provider = new InfuraProvider(config['chain_type'], config['provider_key'])


// var schedule = require('node-schedule');

var gas_mul_limit = 100;
var gas_mul_price = 100;
const gas_mul_base = 100;



export class TransactionService{
    async processPendingTransaction(params: JSONRPCParams){
        ////sync mode
        await _processPendingTransaction()

        ////async mode
        try{
            _processPendingTransaction().then(
                ()=>{logger.info("&&&&&&&&")}
            ).catch(
                (e)=>{logger.error(e)}
            );
            // await queryEvents()
            return {'success': true}
        }catch(e:any){
            throw jsonRpcResult(e.code, e.message)
        }
    }
}

function getInfuraProviderFromENV(): ethers.InfuraProvider {
    let provider_app_key = config['provider_key']
    let chain_type = config['chain_type']

    return new ethers.InfuraProvider(chain_type, provider_app_key)
}



/**
 *  This function used to send transaction to node using the data from DB
 * 
 * @param queryHash : queryHash of current list; used to process current list, as: delete/modify....
 * @param funName : the function name of current transaction, used to know which transaction to send to node;
 * @param params_json_string : all the params data of current transaction, json format
 */

async function sendTran2Node(queryHash:string,funName:string,params_json_string:string) {
    let jsondata =  JSON.parse(params_json_string);
    // logger.info(jsondata);
    switch (funName) {
        case "registrRemoteMinerList":
            await registrRemoteMinerList(jsondata,queryHash);
            break;
        case "registerStandardMinerList":
            await registerStandardMinerList(jsondata,queryHash);
            break;
        case "certifyArec":
            await certifyArec(jsondata,queryHash);
            break;
        case "rejectArec":
            await rejectArec(jsondata,queryHash);
            break;
        case "notarizeNetworkState":
            await notarizeNetworkState(jsondata,queryHash);
            break;
        default:
            break;
    }
}

/**
 * 
 * @param _id :objectid of current list; used to process current list, as: delete/modify....
 * @param transHash : transaction hash of current trans, used to query result from node
 * @param requestId : hash of params of current transaction, be different from anyothers;
 *                     used to find the list in trans'DB
 */

async function queryTranFromNode(_id:ObjectId,transHash:string,requestId:string) {
    try {
        let ret = await provider.getTransactionReceipt(transHash);
        
        if(ret){
            
            logger.info(" get transaction receipt ok" );
            await updataDb(AllTransactionModel,ret,requestId,"confirmed");
            await deleteDb(PendingTransactionModel,requestId);

        }else{
            logger.info(" get transaction receipt failed" );
            logger.info(ret);
            
        }
    } catch (error) {
        logger.info("get transactionReceipt failed , err = "+error);
        
    }
    
}

/**
 *  get total num of lists in the PendingTransactionModel DB.
 *  if no lists in the PendingTransactionModel DB, has no need to process anything.
 * @returns return the total number of the lists
 */
async function getUnfinishtransNum():Promise<Number> {
    // const mongoose = require("mongoose");
    // const MyModel = new tranModel();
    // const filter = { 'tranctionStatus': "pending" }
    // const all = await PendingTransactionModel.find(filter)
    const num =  await PendingTransactionModel.find().count();
    logger.info("items length = %d \n", num);
    return num;
}

async function queryListFromAllTransactionByqueryHash(queryhash:string):Promise<any> {
    let data =  await AllTransactionModel.findOne({query_hash:queryhash});
    return data;
}

async function saveAllTransactionFromPending(queryhash:string) {
    let data =  await PendingTransactionModel.findOne({query_hash:queryhash});
    let model = new AllTransactionModel();
    // model = JSON.parse(data.toString());
    model.call_service = data.call_service;
    model.interface_name = data.interface_name;
    model.params_json_string = data.params_json_string;
    model.query_hash = data.query_hash;
    model.trans_hash = data.trans_hash;
    model.sender_addr = data.sender_addr;
    model.contract_addr = data.contract_addr;
    model.chain_id = data.chain_id;
    model.contract_function_name = data.contract_function_name;
    model.transaction_status = data.transaction_status;
    model.block_number = data.block_number;
    model.query_time = data.query_time;
    model.chain_id = data.chain_id;
    await model.save();
}

/**
 *  if the PendingTransactionModel DB is non-empty, process the first transaction;
 *  all the transactions are from three accounts, need to handle separately,
 *  process the first transaction of each account.
 */
export async function _processPendingTransaction() {
    try {
        let data = await PendingTransactionModel.findOne({sender_addr:config['kmsAccount'].miner_registry.account}).sort({ _id: 1 });
        let data1 = await PendingTransactionModel.findOne({sender_addr:config['kmsAccount'].rec_issuing.account}).sort({ _id: 1 });
        let data2 = await PendingTransactionModel.findOne({sender_addr:config['kmsAccount'].notary.account}).sort({ _id: 1 });
        var temp = [data,data1,data2];
        for (let index = 0; index < temp.length; index++) {
            const element = temp[index];
            if(element){
                logger.info(element);
                let transHash  = element.trans_hash;
                if(transHash == undefined){
                    logger.info("transHash = undefined \n");
                    if(!element.params_json_string  || !element.sender_addr  || !element.contract_addr   || !element.interface_name){
                        let currId = element?._id;
                        logger.info("currId =  "+  currId);
                        await PendingTransactionModel.deleteOne({_id:currId});
                    }else{
                        // logger.info(" begin to resend transaction \n");
                        // await sendTran2Node(element.query_hash,element.interface_name,element.params_json_string);
                        if(element.transaction_status !== "init"){
                            logger.info(" begin to resend transaction \n");
                            await sendTran2Node(element.query_hash,element.interface_name,element.params_json_string);
                        }
                    }
                }else{
                    logger.info("transHash = %s " ,transHash);
                    queryTranFromNode(element._id,element.trans_hash,element.query_hash);
                }
            }else{
                logger.info(" no item find in temp[%d]",index);
            }
        }
        // if(transactionHash.length)
    } catch (error) {
        logger.info("error = "+error);
    }
    
    
}



/**
 * 
 * @param params transaction params, readed from PendingTransactionModel DB;
 * @param query_hash hash of transaction params, used to find the list from DB;
 * @returns 
 */

async function registrRemoteMinerList(params: JSONRPCParams,query_hash:string){
    logger.info(params)
    let res;
    const queryInfo=<RegistMinerListModel>params;

    const validateResult:ValidateError[]= validate<RegistMinerListModel>(RegistMinerListValidateSchema,queryInfo)

    if(validateResult.length > 0){
        return;
    }

    let provider = getInfuraProviderFromENV()

    let miner_registry_account = config['kmsAccount'].miner_registry.account
    let miner_manager_key_id =config['kmsAccount'].miner_registry.id

    const wallet = new kmsSigner(miner_registry_account,miner_manager_key_id, provider)
    const abi =[
        "function UpdateMinerWhiteList(uint8 miner_type, address[] calldata miner_list) external",
    ];

    let miner_contract_address = config['contract'].miner.address

    const contract = new Contract(miner_contract_address, abi, wallet);


    try {
        const estimatedGas = await contract.UpdateMinerWhiteList.estimateGas(queryInfo.miner_type, queryInfo.miners)
        const feeData = await provider.getFeeData();
        if(feeData.gasPrice != null){
            res = await contract.UpdateMinerWhiteList(queryInfo.miner_type, queryInfo.miners,
                { gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100),
                  gasPrice: feeData.gasPrice*BigInt(gas_mul_price)/BigInt(100)}
            )
        }else{
            res = await contract.UpdateMinerWhiteList(queryInfo.miner_type, queryInfo.miners,
                {gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100)}
            )
        }
        await contractResProcess(res,query_hash);
    } catch (error:any) {
        await contractErrorProcess(error,query_hash);
    }
}

/**
 * 
 * @param params transaction params, readed from PendingTransactionModel DB;
 * @param query_hash hash of transaction params, used to find the list from DB;
 * @returns 
 */
async function registerStandardMinerList(params: JSONRPCParams,query_hash:string){
    logger.info(params)
    let res;
    const queryInfo=<RegistMinerListModel>params;

    const validateResult:ValidateError[]= validate<RegistMinerListModel>(RegistMinerListValidateSchema,queryInfo)

    if(validateResult.length > 0){
        return;
    }

    let provider = getInfuraProviderFromENV()

    let miner_registry_account = config['kmsAccount'].miner_registry.account
    let miner_manager_key_id =config['kmsAccount'].miner_registry.id

    const wallet = new kmsSigner(miner_registry_account,miner_manager_key_id, provider)
    const iface = [
        "function UpdateMinerWhiteList(uint8 miner_type, address[] calldata miner_list) external",
    ];

    let miner_contract_address = config['contract'].miner.address

    const contract = new Contract(miner_contract_address, iface, wallet);


    try {

        const estimatedGas = await contract.UpdateMinerWhiteList.estimateGas(queryInfo.miner_type, queryInfo.miners)
        const feeData = await provider.getFeeData();

        if(feeData.gasPrice != null){
             res = await contract.UpdateMinerWhiteList(queryInfo.miner_type, queryInfo.miners,
                { gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100),
                  gasPrice: feeData.gasPrice*BigInt(gas_mul_price)/BigInt(100)}
            )
        }else{
            res = await contract.UpdateMinerWhiteList(queryInfo.miner_type, queryInfo.miners,
                {gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100)}
            )
        }
        logger.info(res);
        await contractResProcess(res,query_hash);
        
    } catch (error:any) {
        await contractErrorProcess(error,query_hash);
    }
}

/**
 * 
 * @param params transaction params, readed from PendingTransactionModel DB;
 * @param query_hash hash of transaction params, used to find the list from DB;
 * @returns 
 */
async function certifyArec(params: JSONRPCParams,query_hash:string){
    logger.info(params)
    var res;
    const queryInfo=<CertifyArecModel>params;

    const validateResult:ValidateError[]= validate<CertifyArecModel>(CertifyArecValidateSchema,queryInfo)

    if(validateResult.length > 0){
        return;
    }

    let provider = getInfuraProviderFromENV()

    let rec_issuing_account = config['kmsAccount'].rec_issuing.account
    let rec_issuing_key_id = config['kmsAccount'].rec_issuing.id

    const wallet = new kmsSigner(rec_issuing_account,rec_issuing_key_id ,provider)
    const iface = [
        "function certifyRECRequest(uint256 tokenID, string memory serialNumber) external",
    ];

    let rec_issuance_contract_address =config['contract'].rec_issuance.address

    const contract = new Contract(rec_issuance_contract_address, iface, wallet);

    try {
        const estimatedGas = await contract.certifyRECRequest.estimateGas(BigInt(queryInfo.tokenId), queryInfo.serialNumber)
        const feeData = await provider.getFeeData();

        if(feeData.gasPrice != null){
            res = await contract.certifyRECRequest(BigInt(queryInfo.tokenId), queryInfo.serialNumber,
                    { gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100),
                      gasPrice: feeData.gasPrice*BigInt(gas_mul_price)/BigInt(100) }
            )
        }else{
            res = await contract.certifyRECRequest(BigInt(queryInfo.tokenId), queryInfo.serialNumber,
                    {gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100)}
            )
        }

        await contractResProcess(res,query_hash);

    } catch (error:any) {
        await contractErrorProcess(error,query_hash);
    }


}
/**
 * 
 * @param params transaction params, readed from PendingTransactionModel DB;
 * @param query_hash hash of transaction params, used to find the list from DB;
 * @returns 
 */
async function rejectArec(params: JSONRPCParams,query_hash:string){
    logger.info(params)
    var res;
    const queryInfo=<RecectArecModel>params;

    const validateResult:ValidateError[]= validate<RecectArecModel>(RejectArecValidateSchema,queryInfo)

    if(validateResult.length > 0){
        return;
    }

    let provider = getInfuraProviderFromENV()

    let rec_issuing_account = config['kmsAccount'].rec_issuing.account
    let rec_issuing_key_id = config['kmsAccount'].rec_issuing.id

    const wallet = new kmsSigner(rec_issuing_account,rec_issuing_key_id ,provider)
    const iface = [
        "function rejectRECRequest(uint256 tokenID) external",
    ];

    let rec_issuance_contract_address =config['contract'].rec_issuance.address

    const contract = new Contract(rec_issuance_contract_address, iface, wallet);

    try {
        const estimatedGas = await contract.rejectRECRequest.estimateGas(BigInt(queryInfo.tokenId))
        const feeData = await provider.getFeeData();

        if(feeData.gasPrice != null){

            res = await contract.rejectRECRequest(BigInt(queryInfo.tokenId),
                { gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100),
                  gasPrice: feeData.gasPrice*BigInt(gas_mul_price)/BigInt(100)}
            )
        }else{
            res = await contract.rejectRECRequest(BigInt(queryInfo.tokenId),
                {gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100)}
            )
        }

        await contractResProcess(res,query_hash);

    } catch (error:any) {
        await contractErrorProcess(error,query_hash);
    }


}


/**
 * 
 * @param params transaction params, readed from PendingTransactionModel DB;
 * @param query_hash hash of transaction params, used to find the list from DB;
 * @returns 
 */
async function notarizeNetworkState(params: JSONRPCParams,query_hash:string){
    logger.info(params)
    var res;
    const queryInfo=<NotaryNetworkStateModel>params;
    // logger.info("queryInfo =  " + queryInfo);
    const validateResult:ValidateError[]= validate<NotaryNetworkStateModel>(NotaryNetworkStateValidateSchema,queryInfo)

    if(validateResult.length > 0){
        logger.info(" validate failed : %s \n  ",validateResult[0].message );
        return;
    }

    let provider = getInfuraProviderFromENV()

    let notary_account = config['kmsAccount'].notary.account
    let notary_data_key_id =config['kmsAccount'].notary.id

    const wallet = new kmsSigner(notary_account, notary_data_key_id, provider)
    const iface = [
        "function saveData(string calldata blockHash, string calldata cid,uint256 blockHeight,uint256 totalPowerGeneration,uint256 circulatingSupply) public returns (bool)",
    ];

    let notary_contract_address = config['contract'].notary.address

    const contract = new Contract(notary_contract_address, iface, wallet);

    let fail_count = 0;

        try {
            fail_count += 1
            const estimatedGas = await contract.saveData.estimateGas(
                queryInfo.blockHash,
                queryInfo.cid,
                BigInt(queryInfo.blockHeight),
                BigInt(queryInfo.totalPowerGeneration),
                BigInt(queryInfo.circulatingSupply)
            )

            const feeData = await provider.getFeeData();
            if(feeData.gasPrice != null){
                res = await contract.saveData(
                    queryInfo.blockHash,
                    queryInfo.cid,
                    BigInt(queryInfo.blockHeight),
                    BigInt(queryInfo.totalPowerGeneration),
                    BigInt(queryInfo.circulatingSupply),
                    { gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100),
                        gasPrice: feeData.gasPrice*BigInt(gas_mul_price)/BigInt(100) }
                )
            }else{
                res = await contract.saveData(
                    queryInfo.blockHash,
                    queryInfo.cid,
                    BigInt(queryInfo.blockHeight),
                    BigInt(queryInfo.totalPowerGeneration),
                    BigInt(queryInfo.circulatingSupply),
                    {gasLimit: estimatedGas*BigInt(gas_mul_limit)/BigInt(100)}
                )
            }

            await contractResProcess(res,query_hash);
        } catch (error:any) {
            await contractErrorProcess(error,query_hash);
            
        }

}

async function contractResProcess(res:any,queryHash:string) {
    gas_mul_limit = gas_mul_base;
    gas_mul_price = gas_mul_base;
    logger.info('transactionHash = ' + res.hash);
    await updataDb(PendingTransactionModel,res,queryHash,"pending");
    var data = await queryListFromAllTransactionByqueryHash(queryHash);
    if(data){
        logger.info("find list data in the AllTransaction");
        await updataDb(AllTransactionModel,res,queryHash,"pending");
    }else{
        logger.info("didn't find list data in the AllTransaction");
        await saveAllTransactionFromPending(queryHash);
    }
}


async function contractErrorProcess(e:any,queryHash:string) {
    // logger.info(error)
    logger.info(e);

    switch (e.code) {
        case 'INSUFFICIENT_FUNDS':
            logger.info("error code : INSUFFICIENT_FUNDS");
            logger.info(e.info.error.message);
            gas_mul_limit = gas_mul_base;
            gas_mul_price = gas_mul_base;
            break;
        case 'UNKNOWN_ERROR':
            logger.info("error code : UNKNOWN_ERROR");
            logger.info(e.error.message);
            var re = /intrinsic gas too low/gi; 
            if (e.error.message.search(re) == -1 ) { 
                logger.info("Does not contain 'intrinsic gas too low' " ); 
                gas_mul_limit = gas_mul_base;
                gas_mul_price = gas_mul_base;
            } else { 
                logger.info("Contains 'intrinsic gas too low'" ); 
                gas_mul_limit += 10;
                gas_mul_price += 10;
            }
            break;
        case 'ENOTFOUND':
            logger.info("error code : ENOTFOUND");
            gas_mul_limit = gas_mul_base;
            gas_mul_price = gas_mul_base;
            break;
        case 'CALL_EXCEPTION':
            logger.info("error code : CALL_EXCEPTION");
            gas_mul_limit = gas_mul_base;
            gas_mul_price = gas_mul_base;
            await updataDb(PendingTransactionModel,e,queryHash,"failed");
            var data = await queryListFromAllTransactionByqueryHash(queryHash);
            if(data){
                logger.info("find list data in the AllTransaction");
                await updataDb(AllTransactionModel,e,queryHash,"failed");
            }else{
                logger.info("didn't find list data in the AllTransaction");
                await saveAllTransactionFromPending(queryHash);
            }
            await deleteDb(PendingTransactionModel,queryHash);
            
            break;
        default:
            gas_mul_limit = gas_mul_base;
            gas_mul_price = gas_mul_base;
            break;
    }
    
}


async function updataDb(model:any,res:any,queryHash:string, trans_status:string|undefined) {
    var updataData = {}
    
    if(res.hash){
        updataData["trans_hash"] = res.hash;
    }
    if(res.from){
        updataData["sender_addr"] = res.from;
    }
    if(res.to){
        updataData["contract_addr"] = res.to;
    }
    if(res.blockNumber){
        updataData["block_number"] = Number(res.blockNumber);
    }
    if(res.chainId){
        updataData["chain_id"] = Number(res.chainId);
    }
    if(res.reason){
        updataData["transaction_error_message"] = res.reason;
    }
    if(trans_status){
        updataData["transaction_status"] = trans_status;
    }
    let data =  await model.findOneAndUpdate({
        query_hash: queryHash
    }, {
        $set: updataData
    });
    if(!data){
        logger.info('未查找到相关数据')
    }else{
        logger.info('修改数据成功')
    }
}

async function deleteDb(model:any,queryHash:string) {

    let data =  await model.deleteOne({query_hash:queryHash});
    if(!data){
        logger.info('未查找到相关数据')
    }else{
        logger.info('删除数据成功')
    }
}



