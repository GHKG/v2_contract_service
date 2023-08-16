import {XenonNacosClient} from "xenon-nacos-client"

import path from "path";

import dotenv from "dotenv";
let envFile=process.env.NODE_ENV
if(!envFile){
    envFile='../../.env'
}else{
    envFile="./.env."+ envFile
}
const envPath=path.join(__dirname,envFile)
console.log("envPath="+envPath)
dotenv.config({ path: envPath })

import logger from '../config/log4js'
import config from '../config/index'

async function main() {
    const bridgeConfig:any = {

        nacosInstances:{
        },

        env: "DEFAULT",
        serviceName: "contract-service",
        port: 8099,
    
        nacosServerList: "18.141.167.195:58848",
        nacosServerNamespace: "1f0f47a5-3375-457e-ad91-35b373bb3981",
        nacosServerSubscribeList: "device".split(","),
    
        nacosConfigNamespace: "1f0f47a5-3375-457e-ad91-35b373bb3981",
        nacosConfigDataIds: "contract-service-dev.yml,nodejs-global-dev.yml".split(",")
    
    }
    
    
    try{
        const options={
            logger:logger,
            config:bridgeConfig,
            serviceName:bridgeConfig['serviceName'],
            port:bridgeConfig['port'],
            nacosServerList:bridgeConfig['nacosServerList'],
            nacosServerNamespace:bridgeConfig['nacosServerNamespace'],
            nacosServerSubscribeList:bridgeConfig['nacosServerSubscribeList'],
            nacosConfigNamespace:bridgeConfig['nacosConfigNamespace'],
            nacosConfigDataIds:bridgeConfig['nacosConfigDataIds']
        }
        await XenonNacosClient.registerService(options)
        // logger.info("nacos connect success!")
    }catch (e){
        // logger.error(e)
        return Promise.reject(Error("nacos register error"));
    }

    // logger.info("config.params="+JSON.stringify(bridgeConfig))
    console.log(bridgeConfig)

    let waitfor = new Promise((resolve) =>{
        setTimeout(() => {

            console.log(bridgeConfig)
            const instancesRobin=bridgeConfig.nacosInstances["device"]
            console.log(instancesRobin)
            if(!instancesRobin){
                console.log("error")
                return null
            }
            const host= instancesRobin.pick()
            console.log(host)
            resolve(0)
        }, 15000);
    })

    await waitfor

    // const instancesRobin=bridgeConfig.nacosInstances["kms-service"]
    // console.log(instancesRobin)
    // if(!instancesRobin){
    //     console.log("error")
    //     return null
    // }
    // const host= instancesRobin.pick()
    // console.log(host)
}


main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    
      