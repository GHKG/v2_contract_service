
const axios = require('axios');
import { Contract, InfuraProvider, SigningKey, BaseWallet, computeAddress} from "ethers";
import {jsonRpcResult, callRpc} from "../../utils/Instrument";
import {getPermitSignature} from './UsdcHelper2'
import {getUnUsedCoupon, setCouponUsed} from './coupon'
import {getAirDropList, completeAirDrip, setLeftCount} from './airDropList'
import logger from "../test12/log4js";


const marketingServerUrl = "https://pre.api.arkreen.work/v1"

const provider = new InfuraProvider("maticmum","295cce92179b4be498665b1b16dfee34")

const payer = "0x2df522C2bF3E570caA22FBBd06d1A120B4Dc29a8"   //who pay for the gas
const payer_key = "0xf9288eb4632cb4ee9e2d2c71bce7e57f16b2cc8be697af77f5dbb3c71fd3bcc0"
const usdc_contract_address = "0x9C5653339E0B3A99262997FbB541E2562f3361C9"//erc20 address on maticmum
const miner_contract_address = "0x1F742C5f32C071A9925431cABb324352C6e99953"//new miner address 

const payer_signing_key = new SigningKey(payer_key)

// const airDropListFile = 'airdrop_list.xlsx'
// const couponListFile = 'coupon.xlsx'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function count_down(count , interval){

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    

    for(let i=count; i>0; i--){
        process.stdout.clearLine(-1)
        // console.log(i)
        process.stdout.cursorTo(0);
        process.stdout.write(`${i}`);
        await sleep(interval)
    }

    process.stdout.clearLine(-1)
    process.stdout.cursorTo(0);
}

async function getPowerPlants(owner:string){

    try {
        const response = await axios.post("https://dev.api.arkreen.work/v1", {
            jsonrpc: '2.0',
            method:"ms_queryAvailableActivityInfo",
            params:{
                "owner": owner
            },
            id: 1,
        });

        // console.log(response.data)
        return response.data.result[0]
    }catch(e:any){
        console.log(e)
        throw e
    }
}

// async function getPriceAuthorization(owner:string, plant){
//     try{
//         const response = await axios.post("https://dev.api.arkreen.work/v1", {
//             jsonrpc: '2.0',
//             method:"rms_requestPriceAuthorization",
//             params:{
//                 owner: owner,
//                 plantId: plant.plantId,
//                 price: plant.price,
//                 power: plant.power,
//                 currency: plant.currency
//             },
//             id: 1,
//         });

//         console.log(response.data.result)
//         return response.data.result

//     }catch(e:any){
//         console.log(e)
//     }
// }

async function getPriceAuthorizationByCoupon(owner:string, plant, usage:number, coupon:string) {
    try{
        const response = await axios.post("https://api.arkreen.com/v1", {
            jsonrpc: '2.0',
            method:"rms_requestPriceAuthorizationByCoupon",
            params:{
                owner: owner,
                plantId: plant.plantId,
                price: plant.price,
                power: plant.power,
                currency: plant.currency,
                usage:usage,
                coupon:coupon
            },
            id: 1,
        });

        console.log(response.data)
        return response.data.result

    }catch(e:any){
        console.log(e)
        throw e
    }
}

async function getPermitNonce(contract_address, owner){

    const abi = [
        "function permit(address,address,uint256,uint256,uint8,bytes32,bytes32) external",
        "function nonces(address) external view returns (uint256)"
    ]

    const usdc_contract = new Contract(contract_address, abi, provider);

    const payer_nonce = await usdc_contract.nonces(owner).catch(function(error) {
        console.log("get nonce error : ",error);
        throw new Error("get nonce error")
      });

    return payer_nonce
}

async function remoteMinerOnBoard(signingKey, miner_contract_address, receiver, miner, authSig, permitToPay){

    const abi = [
        "function AllMinersToken(address) view returns (uint256)",
        "function whiteListMiner(address) view returns (uint8)",
        "function UpdateMinerWhiteList(uint8 miner_type, address[] calldata miner_list) external",
        "function ownerOf(uint256 tokenId) public view returns (address)",
        "function RemoteMinerOnboard(address,address," + 
            "tuple(uint8 v,bytes32 r,bytes32 s)," + 
            "tuple(address token,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)) external"
    ];

    const wallet = new BaseWallet(signingKey, provider)
    const miner_contract = new Contract(miner_contract_address, abi, wallet);

    try{

        const estimatedGas = await miner_contract.RemoteMinerOnboard.estimateGas(receiver, miner, authSig, permitToPay)
        const feeData = await provider.getFeeData();

        const egas:BigInt = estimatedGas*BigInt(100 + 20)/BigInt(100)
        const gasPrice:BigInt = feeData.gasPrice!*BigInt(100 + 10)/BigInt(100)

        if(feeData.gasPrice != null){
            let res = await miner_contract.RemoteMinerOnboard(receiver, miner, authSig, permitToPay,
                { gasLimit: egas,
                  gasPrice: gasPrice}
            )
            await res.wait()
        }else{
            let res = await miner_contract.RemoteMinerOnboard(receiver, miner, authSig, permitToPay,
                {gasLimit: egas}
            )
            await res.wait()
        }
    }catch(e:any){
        console.log(e)
        throw e
    }
}

// async function activeRemoteMiner(owner, miner) {

//     try{
//         const response = await axios.post("https://api.arkreen.com/v1", {
//             jsonrpc: '2.0',
//             method:"rms_requestActivateMiner",
//             params:{
//                 owner: owner,
//                 miner: miner
//             },
//             id: 1,
//         });

//         console.log(response.data)
//         return response.data.result

//     }catch(e:any){
//         console.log(e)
//         throw e
//     }
// }

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
            id: 77,
        });

        console.log("ms_requestActivateMiner response: ",response.data)
        return response.data.result

    }catch(e:any){
        console.log(e)
        throw e
    }

}

async function requestPriceAuthorization(owner:string, activityId:string, coupon:string){

    try {
        const response = await axios.post(marketingServerUrl, {
            jsonrpc: '2.0',
            method:"ms_requestPriceAuthorization",
            params:{
                "owner": owner,
                "activityId":activityId,
                "coupon":coupon,
                "coupon_use":true
            },
            id: 88,
        });

        if(response.data.result){
            return response.data.result
        }else{
            console.log("call ms_requestPriceAuthorization response: ",response.data)
            return undefined
        }
        
    }catch(e:any){
        console.log("call ms_requestPriceAuthorization error",e)
        throw e
    }
}


async function airDrip(airDropObj){
    const receiver = airDropObj.address
    let leftToDrop = airDropObj.count
    const ariDropIndexLine =airDropObj.line

    let tryCount

    console.log("airdrop to : ", receiver)

    if(leftToDrop <= 0){
        await completeAirDrip(ariDropIndexLine)
        return
    }



    for( ; leftToDrop>0; ){

        console.log(`total left ${leftToDrop}`)

        const {coupon, line }= await getUnUsedCoupon()
        if(coupon === ''){
            console.log("not enough coupon")
            // throw new Error("not enough coupon")
            break
        }

        console.log("use coupon: ", coupon)

        let authorization;
        let payer_nonce;
        // let permitSig;
        let authPair;


        const activityId = "0xd0d9aef9f78986d0ca59a3b4623974a3491a7f18a3fdb65713ebb03dd66a69d0"
        try{
            console.log("requet price authorization...")
            authorization = await requestPriceAuthorization(receiver, activityId, coupon)
            console.log(`authorization is: `, authorization)
            if(!authorization){
                console.log("invalid authorization from marketing interface, exit!")
                return
            }
    
        }catch(e){
            console.log(e)
            throw e
        }


        // console.log(`sleep 5 seconds`)
        // await sleep(5000)
        // await count_down(5, 1000)


        for(tryCount = 0; tryCount < 3; tryCount++){

            try{
                payer_nonce = await getPermitNonce(usdc_contract_address, payer)
                console.log(`payer_nonce: `, payer_nonce)
                break
            }catch(e){
                console.log(e)
                console.log(`getPermitNonce failed ${tryCount + 1} `)
            }
        }
        if(tryCount >= 3){
            throw new Error("getPermitNonce after failed 3 times, quit")
        }


        try{

            const permitSig = await getPermitSignature(
                payer_signing_key ,
                miner_contract_address, 
                authorization.amount, 
                payer_nonce, 
                authorization.expiredTime,
                80001
            )

            const permitToPay = {
                token: usdc_contract_address,
                value: BigInt(authorization.amount), 
                deadline: BigInt(authorization.expiredTime), 
                v: permitSig.yParity + 27, 
                r: permitSig.r, 
                s: permitSig.s
            };

            const authSig = {
                v: parseInt(authorization.signature.v),
                r: authorization.signature.r,
                s: authorization.signature.s
            }

            // console.log("authSig: \n", authSig)
            // console.log("permitToPay: \n", permitToPay)

            authPair = {
                owner: authorization.owner,
                miner: authorization.address,
                authSig: authSig,
                permitToPay: permitToPay
            }

            console.log("authPair \n", authPair)

        }catch(e:any){
            console.log(e)
            throw e
        }

        console.log('remote miner on board')
    
        let count = 0;

        const timerId = setInterval(()=>{
            process.stdout.clearLine(-1)
            process.stdout.cursorTo(0);
            process.stdout.write(`time ${count}`);
            count++
        }, 1000)

        try{
            await remoteMinerOnBoard(payer_signing_key, miner_contract_address, authPair.owner, authPair.miner, authPair.authSig, authPair.permitToPay)
            console.log("\n on board success")
            clearInterval(timerId)
        }catch(e){
            console.log("\n remoteMinerOnBoard error: ",e)
            clearInterval(timerId)
            throw e
        }

        

        try{
            console.log('active remote miner')
            const success = await activeRemoteMiner(authPair.owner, authPair.miner)
            if(success){
                console.log(`airdrop success\n`)
                await setCouponUsed(line)
                leftToDrop--
                await setLeftCount(ariDropIndexLine, leftToDrop)
            }else{
                console.log(`acitve failed`)
                console.log(`owner: ${authPair.owner}`)
                console.log(`miner: ${authPair.miner}`)
                console.log(`use coupon: ${line}`)
                console.log('exit')
                process.exit(-1)
            }
        }catch(e:any){
            console.log(e)
            throw e
        }



        // console.log(`sleep 8 seconds`)
        // await sleep(8000)
        // await count_down(8, 1000)
    }

    // await setLeftCount(ariDropIndexLine, leftToDrop)

    if(leftToDrop === 0){
        await completeAirDrip(ariDropIndexLine)
    }

    return leftToDrop
}

async function main(){

    const airDropList = await getAirDropList()
    console.log("airDropList length: ",airDropList.length)

    for(let i=0; i<airDropList.length; i++){
        const left = await airDrip(airDropList[i])
        
        if(left > 0){
            console.log(`can not complete all task, end at owner: ${airDropList[i].address}, in line ${airDropList[i].line}, with left ${left}`)
            return
        }
    }

    console.log(`mission completed`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    