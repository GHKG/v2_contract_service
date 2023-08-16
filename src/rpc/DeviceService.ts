import {JsonRpcClient} from "arkreen-jsonrpc-client";
import {JsonrpcMethod} from "../utils/constant";
import {JsonrpcResponse} from "arkreen-jsonrpc-client/dist/models";
import {jsonRpcResult} from "../utils/Instrument";
import {RpcCode} from "../utils/RpcCode";

import config from "../config";
import logger from "../config/log4js";

import {kmsRpcService} from './KMSRpcService'

class DeviceService{
    jsonRpcClient!:JsonRpcClient
    constructor() {
        const options={
            serviceName:'device',
            url:'http://localhost:9502',
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

    async transferMiner(param:any){

       const response:JsonrpcResponse= await this.jsonRpcClient.request(JsonrpcMethod.device.transferMiner,param)
        if(!response.error)
        {
            return response.result
        }
        else{
            logger.info('device service calling got error, the method is '+ JsonrpcMethod.device.transferMiner, ', the error is ' + response.error.message)
            throw jsonRpcResult(RpcCode.INTERNAL_ERROR, "device service calling got error, the error is " + response.error.message)
        }
    }
}

export const deviceService:DeviceService =new DeviceService()