
const axios = require('axios');
import { Contract, InfuraProvider, SigningKey, BaseWallet, computeAddress} from "ethers";
import {jsonRpcResult, callRpc} from "../../utils/Instrument";
import {getPermitSignature} from './UsdcHelper'
import {getUnUsedCoupon, setCouponUsed} from './coupon'
import {getAirDropList, completeAirDrip, setLeftCount} from './airDropList'
import logger from "../test12/log4js";


const provider = new InfuraProvider("matic","68a2de3671204e8c91871ee8d0c927f3")

const payer = "0x2df522C2bF3E570caA22FBBd06d1A120B4Dc29a8"   //who pay for the gas
const payer_key = "0xf9288eb4632cb4ee9e2d2c71bce7e57f16b2cc8be697af77f5dbb3c71fd3bcc0"
const usdc_contract_address = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"//erc20 address on matic
const miner_contract_address = "0xbf8eF5D950F78eF8edBB8674a48cDACa675831Ae"//new miner address 

const payer_signing_key = new SigningKey(payer_key)

// const airDropListFile = 'airdrop_list.xlsx'
// const couponListFile = 'coupon.xlsx'

async function getPowerPlants(owner:string){

    try {
        const response = await axios.post("https://api.arkreen.com/v1", {
            jsonrpc: '2.0',
            method:"rms_getPowerPlants",
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

async function activeRemoteMiner(owner, miner) {

    try{
        const response = await axios.post("https://api.arkreen.com/v1", {
            jsonrpc: '2.0',
            method:"rms_requestActivateMiner",
            params:{
                owner: owner,
                miner: miner
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

async function airDrip(airDropObj){
    const receiver = airDropObj.address
    let leftToDrop = airDropObj.count
    const ariDropIndexLine =airDropObj.line

    let authPair

    console.log("airdrop to : ", receiver)

    if(leftToDrop <= 0){
        await completeAirDrip(ariDropIndexLine)
        return
    }

    for( ; leftToDrop>0; ){

        const {coupon, line }= await getUnUsedCoupon()
        if(coupon === ''){
            console.log("not enough coupon")
            // throw new Error("not enough coupon")
            break
        }

        console.log("use coupon: ", coupon)

        try{
            const pp = await getPowerPlants(receiver)
            // console.log("get power plant: ", pp)
            if(pp === undefined){
                console.log("can not get power plant")
                throw new Error("can not get power plant")
            }
            
            const authorization = await getPriceAuthorizationByCoupon(receiver, pp, 2, coupon)
            // console.log("authorization: ",authorization)
            if(authorization === undefined){
                console.log("get authorization error,exit!")
            }

            // process.exit()


            const payer_nonce = await getPermitNonce(usdc_contract_address, payer)
            const permitSig = await getPermitSignature(
                payer_signing_key ,
                miner_contract_address, 
                authorization.amount, 
                payer_nonce, 
                authorization.expiredTime
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


        try{
            console.log('remote miner on board')
            await remoteMinerOnBoard(payer_signing_key, miner_contract_address, authPair.owner, authPair.miner, authPair.authSig, authPair.permitToPay)
            console.log('active remote miner')
            const resCode = await activeRemoteMiner(authPair.owner, authPair.miner)
            if(resCode === 200){
                console.log(`airdrop success\n`)
                await setCouponUsed(line)
                leftToDrop--
                await setLeftCount(ariDropIndexLine, leftToDrop)
            }
        }catch(e:any){
            console.log(e)
            throw e
        }
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
}

main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    