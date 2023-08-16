
const axios = require('axios');
import {getAddress} from 'ethers'

const owner = "0xb207AE3Fb4C20a74C5448285FE2166A4eba60FeB"
const miner = "0x244a8015947499414B4D6B75e1bD5a53b00C151c"

// owner: 0xb207AE3Fb4C20a74C5448285FE2166A4eba60FeB
// miner: 0x244a8015947499414B4D6B75e1bD5a53b00C151c

const marketingServerUrl = "https://pre.api.arkreen.work/v1"

async function activeRemoteMiner(owner, miner) {

    console.log(`*** active miner:${miner} for owner:${owner} from ${marketingServerUrl}`)

    try{
        const response = await axios.post(marketingServerUrl, {
            jsonrpc: '2.0',
            method:"ms_requestActivateMiner",
            params:{
                owner: owner,
                address: miner
            },
            id: 5,
        });

        console.log(response)
        return response.data

    }catch(e:any){
        console.log(e)
        throw e
    }

}


(async function(){
    try{

        const result = await activeRemoteMiner(getAddress(owner), getAddress(miner))
        console.log(result)
    }catch(e:any){
        console.log(e)
    }
})()

