import {JsonRpcClient} from "arkreen-jsonrpc-client";

import config from "../config";
import logger from "../config/log4js";
import {JsonrpcMethod} from "../utils/constant";
import {JsonrpcResponse} from "arkreen-jsonrpc-client/dist/models";
import {jsonRpcResult} from "../utils/Instrument";
import {RpcCode} from "../utils/RpcCode";


class KMSRpcService{
    jsonRpcClient!:JsonRpcClient
    constructor() {
        const options={
            serviceName:'kms-service',
            url:'http://localhost:4001',         
            path:'v1',
            getHost:(serviceName:string)=>{
                const instancesRobin=config.nacosInstances[serviceName]
                if(!instancesRobin){
                    return null
                }
                const host=instancesRobin.pick()
                return host
            },
            logger:logger,
            config:config
        }
        this.jsonRpcClient=  new JsonRpcClient(options)
    }

    async signByKeyId(param:any){
       const response:JsonrpcResponse= await this.jsonRpcClient.request(JsonrpcMethod.kms.signByKeyId,param)
        if(!response.error)
        {
            return response.result
        }
        else{
            logger.info('Contract service calling got error, the method is '+ JsonrpcMethod.kms.signByKeyId, ', the error is ' + response.error.message)
            throw jsonRpcResult(RpcCode.INTERNAL_ERROR, "Contract service calling got error, the error is " + response.error.message)
        }
    }
}



export const kmsRpcService:KMSRpcService =new KMSRpcService()
