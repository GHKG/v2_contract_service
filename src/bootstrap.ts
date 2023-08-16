
import {XenonNacosClient} from "xenon-nacos-client"

import path from "path";

import dotenv from "dotenv";
let envFile=process.env.NODE_ENV
if(!envFile){
    envFile='../.env'
}else{
    envFile="./.env."+ envFile
}
const envPath=path.join(__dirname,envFile)
console.log("envPath="+envPath)
dotenv.config({ path: envPath })

import logger from './config/log4js'
import config from './config/index'
// import {XenonNacosClient} from "xenon-nacos-client"

// const bridgeConfig:any = {

//     env: process.env.NODE_ENV as string,
//     serviceName: process.env.APPLICATION_NAME as string,
//     port: parseInt(process.env.SERVER_PORT as string),

//     nacosServerList: process.env.NACOS_SERVER_LIST as string,
//     nacosServerNamespace: process.env.NACOS_SERVICE_NAMESPACE as string,
//     nacosServerSubscribeList: (process.env.NACOS_SERVICE_SUBSRIBELIST as string).split(","),

//     nacosConfigNamespace: process.env.NACOS_CONFIG_NAMESPACE as string,
//     nacosConfigDataIds: (process.env.NACOS_CONFIG_DATAIDS as string).split(",")

// }
config['env']=process.env.NODE_ENV as string
config['serviceName']=process.env.APPLICATION_NAME as string
config['port']=parseInt(process.env.SERVER_PORT as string)

config['nacosServerList']=process.env.NACOS_SERVER_LIST as string
config['nacosServerNamespace']=process.env.NACOS_SERVICE_NAMESPACE as string
config['nacosServerSubscribeList']=(process.env.NACOS_SERVICE_SUBSRIBELIST as string).split(",")

config['nacosConfigNamespace']=process.env.NACOS_CONFIG_NAMESPACE as string
config['nacosConfigDataIds']=(process.env.NACOS_CONFIG_DATAIDS as string).split(",")

async function bootstrapInit(){
    // 启动nacos
    try{
        const options={
            logger:logger,
            config:config,
            serviceName:config['serviceName'],
            port:config['port'],
            nacosServerList:config['nacosServerList'],
            nacosServerNamespace:config['nacosServerNamespace'],
            nacosServerSubscribeList:config['nacosServerSubscribeList'],
            nacosConfigNamespace:config['nacosConfigNamespace'],
            nacosConfigDataIds:config['nacosConfigDataIds']
        }

        await XenonNacosClient.registerService(options)
        logger.info("nacos connect success!")
    }catch (e){
        logger.error(e)
        return Promise.reject(Error("nacos register error"));
    }

    // logger.info("config.params="+JSON.stringify(bridgeConfig))

    // let waitfor = new Promise((resolve) =>{
    //     setTimeout(() => {
    //         console.log(config)
    //         resolve(0)
    //     }, 15000);
    // })

    // await waitfor


    //启动数据库
    try {
        const {connect} = await import('./config/db')
        await connect()
        logger.info("mongodb connect success!")
    }catch (e){
        logger.error("mongodb connect error="+e)
        return Promise.reject(Error("mongodb connect error"));
    }
}


bootstrapInit().then(async ()=>{
    logger.info('start web server...')
    import('./app')
        .then(async (myModule) => {
            logger.info('web server start success')
        }).catch(e=>{
            logger.info(e)
            logger.info('web server start fail ')
        });
}).catch((error) => logger.error('bootstrapInit start fail %s ',error))
