
const axios = require('axios');
import { Contract, InfuraProvider, getAddress} from "ethers";

import logger from './log4js'
import { GetStartNumber, UpdateStartNumber , RecordErrorTokenId} from "./StartNumberModel_dev";

var CronJob = require( 'cron').CronJob;

const provider = new InfuraProvider("maticmum","0ab4ce267db54906802cb43b24e5b0f7")
const contractAddress = "0x682e01f8ecc0524085F51CC7dFB54fDB8729ac22"
const remoteMinerServiceUri = "https://dev.api.arkreen.work/v1"

const abi = [
    "function AllMinersToken(address) view returns (uint256)",
    "function whiteListMiner(address) view returns (uint8)",
    "function UpdateMinerWhiteList(uint8 miner_type, address[] calldata miner_list) external",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function RemoteMinerOnboard(address,address," + 
        "tuple(uint8 v,bytes32 r,bytes32 s)," + 
        "tuple(address token,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)) external",
    "function totalSupply() view returns (uint256)",
    "function AllMinerInfo(uint256 tokenId) view returns (tuple(address,uint8 ,uint8 , uint32))",
];

const minerContract = new Contract(contractAddress, abi, provider)


async function sleep(ms:number){
    return new Promise(resolve=>setTimeout(resolve, ms))
}

async function getMinerTotalCount(){

    try{
        const totalCount = await minerContract.totalSupply()
        // console.log(totalCount)
        return totalCount
    }catch(e:any){
        logger.error(e)
        throw e
    }

}

async function getMinerByAddress(miner) {

    try{
        const response = await axios.post(remoteMinerServiceUri, {
            jsonrpc: '2.0',
            method:"net_getMinerByAddress",
            params:{
                address:miner
            },
            id: 1,
        });

        // console.log(response.data)
        if(response.data.result){
            return response.data.result.ownerAddress
        }else if(response.data.error.code === 3005){
            return ""
        }else{
            logger.error(response.data.error)
            return undefined
        }

    }catch(e:any){
        logger.error(e)
        throw e
    }


}

async function getMinerByID(tokenId:number){

    try{
        const minerInfo = await minerContract.AllMinerInfo(tokenId)
        // console.log(minerInfo)
        return minerInfo
    }catch(e:any){
        logger.error(e)
        throw e
    }
}

async function getMinerOwner(tokenId){
    
    try{
        const owner = await minerContract.ownerOf(tokenId)
        logger.info(`owner of tokenID ${tokenId}: ${owner}`)
        return owner
    }catch(e:any){
        logger.error(e)
        throw e
    }
}

async function activeRemoteMiner(owner, miner) {

    try{
        const response = await axios.post(remoteMinerServiceUri, {
            jsonrpc: '2.0',
            method:"rms_requestActivateMiner",
            params:{
                owner: owner,
                miner: miner
            },
            id: 1,
        });

        logger.info(response.data)
        return response.data

    }catch(e:any){
        logger.error(e)
        throw e
    }

}


export async function activeMiner(){
    let startNum
    let totalCount

    try{
        startNum = await GetStartNumber()
        totalCount = await getMinerTotalCount()

        logger.info(`startNum:${startNum} ------ totalCount:${totalCount}`)

        if(startNum > totalCount){
            logger.info(`startNum is ahead of totalCount , exit!`)
            return
        }
    }catch(e:any){
        logger.error("get start number or total count error : ", e)
        return
    }

    let miner
    let owner
    let tokenId

    const upperLimit = (totalCount > startNum+10)? startNum+10 : totalCount

    for(tokenId = startNum; tokenId <= upperLimit; tokenId++){
        logger.info(`------> get miner by tokenId: ${tokenId}`)

        //get token info from chain
        try{
            const minerInfo =  await getMinerByID(tokenId)
            logger.info(`get miner `,minerInfo[0])
            miner = minerInfo[0]
        }catch(e:any){
            logger.error(`[[error in get miner info by ID]]`)
            logger.error(e)
            await UpdateStartNumber(tokenId)
            return
        }

        //check miner info from core net
        logger.info(`------> check miner info form core net`)
        try{
            owner = await getMinerByAddress(miner)
            console.log(owner)
            logger.info(`get owner from core net [${owner}]`)
            if(owner === undefined){
                logger.error(`internel error, exit!`)
                await UpdateStartNumber(tokenId)
                return
            }

            if(typeof owner  === 'string' && owner !== ''){
                logger.info(`already activated ,owner is ${owner}\n\n`)
                await UpdateStartNumber(tokenId + 1)
                continue   
            }

        }catch(e:any){
            logger.error(`[[error in call net_getMinerByAddress]]`)
            logger.error(e)
            await UpdateStartNumber(tokenId)
            return
        }


        //find owner of target tokenId from chain
        logger.info(`------> find owner of target tokenId from chain`)
        try{

            owner = await getMinerOwner(tokenId)
            if(owner === ''){
                logger.info(`no owner found to tokenId ${tokenId}`)
                await UpdateStartNumber(tokenId)
                return
            }

        }catch(e:any){
            logger.error(`[[error in get miner owner]]`)
            logger.error(e)
            await UpdateStartNumber(tokenId)
            return
        }


        // finally, try do miner on board for 3 times 

        let count
        console.log(`active  miner in core net\n`)
        console.log(`owner: ${owner}`)
        console.log(`miner: ${miner}`)

        logger.info(`------> try to active miner ${miner} for owner ${owner}`)

        for(count=3; count > 0; count--){

            try{
                const res = await activeRemoteMiner(getAddress(owner), getAddress(miner))
                if(res.result && res.result === 200 ){
                    logger.info(`active  miner success`)
                    await UpdateStartNumber(tokenId)
                    break
                }else{
                    logger.info(`active  miner failed, count ${count}`)
                    await sleep(1000*5)
                }
            }catch(e:any){
                console.log("active catch error:")
                logger.error(e)
            }
        }

        if(count === 0){
            logger.error(`may be some thing wrong  with miner ${miner} in core net`)
            await RecordErrorTokenId(tokenId)
        }
    }
}





(async function(){
    // start mongoodb
    try {
        const dbModel=await import('./mongoDB')
        await  dbModel.connect()
        logger.info("mongodb connect success!")
    }catch (e){
        logger.error("mongodb connect error="+e)
        return Promise.reject(Error("mongodb connect error"));
    }

    let job = new CronJob(
        // '0-59/15 * * * * *',
        '*/1 * * * *',
        activeMiner,
        null,
        true,
        null,
        null,
        false
    )
    

})()