
import { Contract, InfuraProvider, SigningKey, BaseWallet, computeAddress} from "ethers";
const axios = require('axios');
import {getPermitSignature} from './UsdcHelper2'



const payer = "0x2df522C2bF3E570caA22FBBd06d1A120B4Dc29a8"   //who pay for the gas
const payer_key = "0xf9288eb4632cb4ee9e2d2c71bce7e57f16b2cc8be697af77f5dbb3c71fd3bcc0"
const usdc_contract_address = "0x9C5653339E0B3A99262997FbB541E2562f3361C9"//erc20 address on maticmum
const miner_contract_address = "0x682e01f8ecc0524085F51CC7dFB54fDB8729ac22"//new miner address 

const provider = new InfuraProvider("maticmum","68a2de3671204e8c91871ee8d0c927f3")
const payer_signing_key = new SigningKey(payer_key)

const marketingServerUrl = "https://dev.api.arkreen.work/v1"

async function queryAvailableActivityInfo(owner:string){

    try {
        const response = await axios.post(marketingServerUrl, {
            jsonrpc: '2.0',
            method:"ms_queryAvailableActivityInfo",
            params:{
                "owner": owner
            },
            id: 1,
        });

        console.log(response.data)
        return response.data.result[0]
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
            id: 1,
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

        console.log(response.data)
        return response.data.result

    }catch(e:any){
        console.log(e)
        throw e
    }

}


async function main(){

    const owner = "0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49"
    const coupon = "0xea77c1865025318413b1C8fd64A090d73b20C8c2eeB0C344a98E7C661Dbf7d80"


    let authorization;
    let payer_nonce;
    let permitSig;
    let authPair;


    // const pp = await queryAvailableActivityInfo(owner)
    // console.log(pp)

    // const activityId = pp.activityId
    const activityId = "0xdfd3efb6b01fea1c1ef02f6a9787741b620b139bcaa3a756f03b98f91c431473"
    try{
        authorization = await requestPriceAuthorization(owner, activityId, coupon)
        console.log(`authorization is: `, authorization)
        if(!authorization){
            console.log("invalid authorization from marketing interface, exit!")
            return
        }

    }catch(e){
        console.log(e)
        throw e
    }


    try{
        payer_nonce = await getPermitNonce(usdc_contract_address, payer)
        console.log(`payer_nonce: `, payer_nonce)
    }catch(e){
        console.log(e)
        throw e
    }


    permitSig = await getPermitSignature(
        payer_signing_key ,
        miner_contract_address, 
        authorization.amount, 
        payer_nonce, 
        authorization.expiredTime,
        80001
    )

    console.log(`permitSig is: `, permitSig)

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

    console.log("authSig: \n", authSig)
    console.log("permitToPay: \n", permitToPay)

    authPair = {
        owner: authorization.owner,
        miner: authorization.address,
        authSig: authSig,
        permitToPay: permitToPay
    }

    console.log("authPair \n", authPair)


    try{
        console.log('remote miner on board')
        await remoteMinerOnBoard(payer_signing_key, miner_contract_address, authPair.owner, authPair.miner, authPair.authSig, authPair.permitToPay)
    }catch(e:any){
        console.log(e)
        throw e
    }

    try{
        console.log('active remote miner')
        const success = await activeRemoteMiner(authPair.owner, authPair.miner)
        if(success){
            console.log(`airdrop success\n`)
            // await setCouponUsed(line)
            // leftToDrop--
            // await setLeftCount(ariDropIndexLine, leftToDrop)
        }else{
            console.log(`active miner failed`)
        }
    }catch(e){
        console.log(e)
    }


}


main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
    });
    