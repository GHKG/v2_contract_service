import { JSONRPCParams } from "json-rpc-2.0";
import { createClient , ClientOptions} from 'urql';
import {jsonRpcResult, callRpc} from "../utils/Instrument";
import transaction_db, {AllTransactionModel} from '../model/MongodbModels/TransactionModel'
import {GetStartNumber, UpdateStartNumber} from '../model/MongodbModels/SearchNumberModel'
import { remoteMinerRpcService } from "../rpc/RemoteMinerRpcService";
import { standardMinerRpcService } from "../rpc/StandardMinerRpcService";
import {notaryRpcService} from '../rpc/NotaryRpcService'
import {getAddress} from 'ethers'

import logger from "../config/log4js";
import config from "../config";


export class TransactionReportService{
    
    //scan for report
    async scanTransactionForReport(params: JSONRPCParams){

        ////sync mode   
        // await _scanTransactionForReport()

        ////async mode
        try{
            _scanTransactionForReport().then(
                ()=>{logger.info("%%%%%%%%")}
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

export async function _scanTransactionForReport(){

    // console.log("1111111111111111111111")
    let unNotifiedRecords
    try{
        unNotifiedRecords = await transaction_db.getByQuery(AllTransactionModel, {
            $and: [
                { notify_status:{ $exists: true, $eq: false} },
                // { trans_hash: { $exists: true }},
                { transaction_status: { $in: ['confirmed', 'failed'] }}
            ]
        })
    }catch(e:any){
        throw jsonRpcResult(e.code, e.message)
    }

    logger.info(`in << _scanTransactionForReport>> got [ ${unNotifiedRecords.length} ] unnotified records in database`)

    unNotifiedRecords.forEach(query => {
        reportQueryResultToCaller(query)
    });

}

async function reportQueryResultToCaller(queryObj){
    // console.log("222222222222222222222222")
    let reportObj ={
        interface_name: queryObj.interface_name,
        call_params:JSON.parse(queryObj.params_json_string),
        trans_result: queryObj.transaction_status
    }

    if(queryObj.transaction_error_message){
        reportObj["failed_reason"] = queryObj.transaction_error_message
    }

    const rpc_url =  getRpcServiceUrl(queryObj.call_service)
    if(rpc_url === null){
        logger.error(`<<< Can not get ${queryObj.call_service} url >>>`)
        return
    }

    // const signObj = {
    //     "keyId": "key_notary",
    //     "hash": "444a3c8b234df1f8e1a167e8dabcba536f247fdc58cb9703a3df0979f3d66be0"
    // }

    console.log(`get [${queryObj.call_service}] url: ${rpc_url}`)
    try{
        const ret = await callRpc(rpc_url, queryObj.call_back_method, reportObj)
        queryObj.notify_status = true
        queryObj.notify_time = Date.now()
        queryObj.notify_count = queryObj.notify_count + 1

        logger.info(`${queryObj.call_back_method} callback returns: ${ret}`)
        // await queryObj.save()
    }catch(e:any){
        logger.error('<<< error in reportQueryResultToCaller >>>\n', e)
        queryObj.notify_time = Date.now()
        queryObj.notify_count = queryObj.notify_count + 1
        // await queryObj.save()
    }

    try{
        await queryObj.save()
    }catch(e:any){
        logger.error(`<<< write db error >>>\n`, e)
    }
    

}

function getRpcServiceUrl(serviceName:string){
    // kms-service,notary-service,remote-miner,standard-miner-manager

    // only for test
    // if(serviceName === "kms-service"){
    //     return "http://localhost:4001"
    // }
    //end

    if(serviceName === "remote-miner"){
        return "http://172.20.253.115:9812/v1"
    }

    return null

    // console.log("nacos instances: ",config.nacosInstances)

    // const instancesRobin=config.nacosInstances[serviceName]
    
    // if(!instancesRobin){
    //     return null
    // }
    // const host=instancesRobin.pick()

    // if(host){
    //     return "http://"+host.ip+":"+host.port+"/"+ "v1"
    // }else{
    //     return null
    // }
    
}

function getHost(serviceName:string){
    const instancesRobin=config.nacosInstances[serviceName]
    if(!instancesRobin){
        return null
    }
    const host=instancesRobin.pick()
    return host
}

async function do_minerOnboarded(owner:string, miner:string){
    let params = {
        "owner":getAddress(owner),
        "miner":getAddress(miner)
    }

    try{
        let ret:any = await remoteMinerRpcService.requestActivateMiner(params)
    }catch(e:any){
        logger.error("<<< error in query rms_requestActivateMiner >>>\n", e.code, e.message)
    }
}

async function do_standardMinerOnboarded(owner:string, miner:string){
    let params = {
        "ownerAddress":getAddress(owner),
        "minerAddress":getAddress(miner)
    }

    try{
        let ret:any = await standardMinerRpcService.requestActivateMiner(params)
    }catch(e:any){
        logger.info("<<< error in query sdm_activateMinerByNftMintEvent >>>\n", e.code, e.message)
    }
}

async function do_recrqquested(owner:any, tokenId:number){

    let params = {
        "owner":getAddress(owner),
        "tokenId": Number(tokenId)
    }

    try{
        let ret:any = await notaryRpcService.certifyRec(params)
        logger.info(ret)
    }catch(e:any){
        logger.error("<<< error in query rec_certifyRec >>>\n", e.code, e.message)
    }
}

async function handle_ArkreenMiner_events(){

    const client_options:ClientOptions = {
        url: config['the_graph_query_url_arkreen_miner'] ,
        exchanges: []
    }
    const client = createClient(client_options)

    let continueBlock = 0

    try{
        continueBlock = await GetStartNumber('Arkreen_miner')
    }catch(e:any){
        logger.error("<<< error in handle_ArkreenMiner_events when query database >>>\n", e)
        return
    }

    // logger.info("++++++++++++++++++++++++++++++++++++++++++++++++")
    // console.log("continue block ", continueBlock)

    // gameMinerOnboardeds(
    //     where:{blockNumber_gte: ${continueBlock}}
    //     orderBy: blockNumber, orderDirection:asc
    // ){
    //     id
    //     owner
    //     miners
    //     blockNumber
    // }


    const onBoardQuery = `
            query {

                standardMinerOnboardeds(
                    where:{blockNumber_gte: ${continueBlock}}
                    orderBy: blockNumber, orderDirection:asc
                ){
                    id
                    miner
                    owner
                    blockNumber
                }

                minerOnboardeds(
                    where:{blockNumber_gte: ${continueBlock}}
                    orderBy: blockNumber, orderDirection:asc
                ){
                    id
                    owner
                    miner
                    blockNumber
                }

                _meta {
                    block {
                        number
                    }
                }
            }
            `

    let data:any = undefined
    try{
        data = await client.query(onBoardQuery, undefined).toPromise()
        if(data.data.minerOnboardeds.length > 0){
            logger.info("ArkreenMiner : Event minerOnboardeds count:", data.data.minerOnboardeds.length)
        }
        if(data.data.standardMinerOnboardeds.length > 0){
            logger.info("ArkreenMiner : Event standardMinerOnboardeds count:", data.data.standardMinerOnboardeds.length)
        }
    }catch(e){
        logger.error("<<< query TheGraph error:>>> \n",JSON.stringify(e))
        return
    }

    data.data.minerOnboardeds.forEach((element: any )=> {
        do_minerOnboarded(element.owner, element.miner)
    });

    data.data.standardMinerOnboardeds.forEach((element: any )=> {
        do_standardMinerOnboarded(element.owner, element.miner)
    });

    // data.data.gameMinerOnboardeds.forEach((element: any) => {
    //     do_gameMinerOnboarded(element.owner)
    // });


    try{//sometime _meta is missing ,though query success
        data.data._meta
    }catch(e:any){
        logger.warn("<<< did not get _meta data >>>\n")
        logger.info(data)
        return
    }

    try{
        await UpdateStartNumber('Arkreen_miner', data.data._meta.block.number  + 1)
    }catch(e:any){
        logger.error("<<< error in handle_ArkreenMiner_events when write database >>>\n", e)
    }

}

async function handle_ArkreenRECIssuance_REC_status(){
    const client_options:ClientOptions = {
        url: config['the_graph_query_url_arkreen_rec_issuance'] ,
        exchanges: []
    }
    const client = createClient(client_options)
    let continueBlock = 0

    try{
        continueBlock = await GetStartNumber('Arkreen_rec_issuence')
    }catch(e:any){
        logger.error("<<< error in handle_ArkreenMiner_events when query database >>>\n", e)
        return
    }

    const recsQuery = `
    query {

        recs(
            orderBy: blockNum, orderDirection: asc,
            where: {_change_block: {number_gte: ${continueBlock}}, status: Pending}
        ){
            id
            tokenId
            status
            owner
            issuer
            blockNum
          }

        _meta {
            block {
                number
            }
        }
    }
    `

    let data:any = undefined
    try{
        data = await client.query(recsQuery, undefined).toPromise()
    }catch(e){
        logger.error("<<< query TheGraph error >>>\n",JSON.stringify(e))
        return
    }

    try{//sometime _meta is missing ,though query success
        data.data._meta
    }catch(e:any){
        logger.warn("did not get _meta data")
        logger.info(data)
        return
    }

    if(data.data.recs.length > 0){
        logger.info("ArkreenRECIssuance: found status pending count:", data.data.recs.length)
    }

    //logger.info("ArkreenRECIssuance: scan blocks range " + continueBlock + " <------> " + data.data._meta.block.number)

    if(data.data.recs.length > 0){
        data.data.recs.forEach((element:any )=> {
            do_recrqquested(element.owner, element.tokenId)
        });
        continueBlock = data.data.recs[0].blockNum
    }else{
        continueBlock = data.data._meta.block.number + 1
    }

    try{
        await UpdateStartNumber('Arkreen_rec_issuence', continueBlock)
    }catch(e:any){
        logger.error("<<< error in handle_ArkreenRECIssuance_events when write database >>>\n")
        logger.info(JSON.stringify(e))
    }

}