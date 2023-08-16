import {JsonRpcClient} from "arkreen-jsonrpc-client";
import {JsonrpcMethod} from "../utils/constant";
import {JsonrpcResponse} from "arkreen-jsonrpc-client/dist/models";
import {jsonRpcResult} from "../utils/Instrument";
import {RpcCode} from "../utils/RpcCode";

import config from "../config";
import logger from "../config/log4js";

class RemoteMinerRpcService{
    jsonRpcClient!:JsonRpcClient
    constructor() {
        const options={
            serviceName:'remote-miner',
            // url:'http://localhost:4001/v1',
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

    async requestActivateMiner(param:any){
       const response:JsonrpcResponse= await this.jsonRpcClient.request(JsonrpcMethod.remoteMiner.requestActivateMiner,param)
        if(!response.error)
        {
            return response.result
        }
        else{
            logger.info('remote miner service calling got error, the method is '+ JsonrpcMethod.remoteMiner.requestActivateMiner, ', the error is ' + response.error.message)
            throw jsonRpcResult(RpcCode.INTERNAL_ERROR, "Contract service calling got error, the error is " + response.error.message)
        }
    }
}

export const remoteMinerRpcService:RemoteMinerRpcService =new RemoteMinerRpcService()