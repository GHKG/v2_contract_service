import {JSONRPCParams, JSONRPCServer} from "json-rpc-2.0";

import {DemoService} from '../service/_DemoService'
import {ArkreenNotaryService} from '../service/ArkreenNotaryService'
import {ArkreenMinerService} from '../service/ArkreenMinerService'
import { ArkreenARECIssuenceService } from "../service/ArkreenARECIssuenceService"
import { ArkreenWithdrawService } from "../service/ArkreenWithdrawService";
import {TheGraphQueryService} from '../service/TheGraphQueryService'
import { CommonTaskService } from "../service/CommonTaskService";
import { ArkreenTokenService } from "../service/ArkreenTokenService";
import { ActiveMinerService} from "../service/ActiveMinerService";
import { TransactionService } from "../service/TransactionService";
import { TransactionReportService } from "../service/TransactionReportService";

//声明各个服务对象
const demoService: DemoService = new DemoService()
const arkreenNotaryService: ArkreenNotaryService = new ArkreenNotaryService()
const arkreenMinerService: ArkreenMinerService = new ArkreenMinerService()
const arkreenARECIssuenceService: ArkreenARECIssuenceService = new ArkreenARECIssuenceService()
const arkreenWithdrawService: ArkreenWithdrawService = new ArkreenWithdrawService()
const commonTaskService: CommonTaskService = new CommonTaskService()
const theGraphQueryService: TheGraphQueryService = new TheGraphQueryService()
const arkreenTokenService: ArkreenTokenService = new ArkreenTokenService()
const activeMinerService:ActiveMinerService = new ActiveMinerService()
const transactionService:TransactionService = new TransactionService()
const transactionReportService:TransactionReportService = new TransactionReportService()

//将对象注册到jsonrpc中
function initMethods(jsonrpcServer: JSONRPCServer) {
    ///////////////
    //Demo Service
    ///////////////
    jsonrpcServer.addMethod("getAccount", (serverParams) => {
        return demoService.getAccount(<JSONRPCParams>serverParams);
    });
    

    ////////////////////////
    //ArkreenNotary Service
    ///////////////////////
    jsonrpcServer.addMethod("cs_notarizeNetworkState", (serverParams) => {
        return arkreenNotaryService.notarizeNetworkState(<JSONRPCParams>serverParams);
    });

    //////////////////////
    //ArkreenMiner Service
    //////////////////////
    jsonrpcServer.addMethod("cs_registerRemoteMinerList", (serverParams) => {
        return arkreenMinerService.registrRemoteMinerList(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_registerStandardMinerList", (serverParams) => {
        return arkreenMinerService.registerStandardMinerList(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getRemoteMinerStatus", (serverParams) => {
        return arkreenMinerService.getRemoteMinerStatus(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getWhiteList", (serverParams) => {
        return arkreenMinerService.getWhiteListData(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getMinerOwner", (serverParams) => {
        return arkreenMinerService.getMinerOwner(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getMinerNftTokenIdByAddress", (serverParams) => {
        return arkreenMinerService.getMinerNftTokenIdByAddress(<JSONRPCParams>serverParams);
    });



    //////////////////////////////
    //ArkreenARECIssuence Service
    /////////////////////////////
    jsonrpcServer.addMethod("cs_certifyArec", (serverParams) => {
        return arkreenARECIssuenceService.certifyArec(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_rejectArec", (serverParams) => {
        return arkreenARECIssuenceService.rejectArec(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getArecNft", (serverParams) => {
        return arkreenARECIssuenceService.getArecNft(<JSONRPCParams>serverParams);
    });

    //////////////////////////////
    //ArkreenWithdraw Service
    /////////////////////////////
    jsonrpcServer.addMethod("cs_getNonceByAddress", (serverParams) => {
        return arkreenWithdrawService.getWithdrawNonce(<JSONRPCParams>serverParams);
    });

    ///////////////////////
    //ArkreenToken Service
    //////////////////////
    jsonrpcServer.addMethod("cs_getERC20PermitNonce", (serverParams) => {
        return arkreenTokenService.getPermitNonce(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_verifyERC20PermitSignature", (serverParams) => {
        return arkreenTokenService.verifyERC20PermitSignature(<JSONRPCParams>serverParams);
    });

    ///////////////////////
    //GraphQuery Service
    ///////////////////////
    jsonrpcServer.addMethod("cs_taskQueryEvents", (serverParams) => {
        return theGraphQueryService.theGraphQueryEvents(<JSONRPCParams>serverParams);
    });

    /////////////////////
    //CommonTask Service
    ////////////////////
    jsonrpcServer.addMethod("cs_getQueryRecordByHash", (serverParams) => {
        return commonTaskService.getQueryRecordByHash(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_requestWithdrawAuthorization", (serverParams) => {
        return commonTaskService.requestWithdrawAuthorization(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_requestNftMintAuthorization", (serverParams) => {
        return commonTaskService.requestNftMintAuthorization(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_requestStandardMinerNftMintAuthorization", (serverParams) => {
        return commonTaskService.requestStandardMinerNftMintAuthorization(<JSONRPCParams>serverParams);
    });
    
    jsonrpcServer.addMethod("cs_getErc20Decimal", (serverParams) => {
        return commonTaskService.getERC20Decimal(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getPriceAuthorization", (serverParams) => {
        return commonTaskService.getPriceAuthorization(<JSONRPCParams>serverParams);
    });

    jsonrpcServer.addMethod("cs_getMaticPrice", (serverParams) => {
        return commonTaskService.getMaticPrice(<JSONRPCParams>serverParams);
    });

    ///////////////////////
    //TransactionReport Service
    //////////////////////
    jsonrpcServer.addMethod("cs_transactionReport", (serverParams) => {
        return transactionReportService.scanTransactionForReport(<JSONRPCParams>serverParams);
    });

    /////////////////////
    //Transaction Service
    ////////////////////
    jsonrpcServer.addMethod("cs_processPendingTransaction", (serverParams) => {
        return transactionService.processPendingTransaction(<JSONRPCParams>serverParams);
    });

    /////////////////////
    //ActiveMiner Service
    ////////////////////
    jsonrpcServer.addMethod("cs_activeMiner", (serverParams) => {
        return activeMinerService.activeRemoteMiner(<JSONRPCParams>serverParams);
    });

    /////////////////////
    //TEST  function in CommonTaskService
    ////////////////////
    jsonrpcServer.addMethod("cs_TEST", (serverParams) => {
        return commonTaskService.TEST(<JSONRPCParams>serverParams);
    });


}
export default initMethods

