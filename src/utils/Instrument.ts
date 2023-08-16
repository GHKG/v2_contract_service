import {createJSONRPCErrorResponse, JSONRPCErrorResponse, JSONRPCParams} from "json-rpc-2.0";
import {keccak256, AbiCoder, toUtf8Bytes, solidityPacked} from "ethers"
import Schema, {ValidateError} from "async-validator";
const assert = require('assert');
import Any = jasmine.Any;
import { RpcCode } from "../utils/RpcCode";

// import config from '../config'

const axios = require('axios');
// import axios, { AxiosError } from 'axios';

export  function validate<T>(validateSchema:Schema,model:T):ValidateError[]{
    let validateError:ValidateError[]=[]
    validateSchema.validate(<Any>model, (errors, fields) => {
        if (errors) {
            validateError= errors
        }else{
            validateError=[]
        }
    })
    return validateError
}


export function  jsonRpcResult(rpcCode: any,message:string=''):JSONRPCErrorResponse {
    return createJSONRPCErrorResponse(0, rpcCode.code, message||rpcCode.message)
}


export async function getGasOptionObject(estimatedGas:bigint, gasLimit_extra_percent:number, gasPrice:bigint|null, gasPrice_extra_perent:number){
    const L = gasLimit_extra_percent
    const P = gasPrice_extra_perent
    assert.ok(L >= 0 && L <= 50, `Expected gasLimit amplification to be within range ${0} - ${50} percents`);
    assert.ok(P >= 0 && P <= 50, `Expected gasPrice amplification to be within range ${0} - ${50} percents`);

    let gasObj = {gasLimit: estimatedGas*BigInt(100 + L)/BigInt(100)}
    if(gasPrice !== null){
        gasObj['gasPrice'] = gasPrice*BigInt(100 + P)/BigInt(100)
    }

    return gasObj
}

// 对象排序函数，按照属性名的字典序升序排序
export function sortObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(sortObject);
    }
  
    const keys = Object.keys(obj).sort();
    const result: any = {};
    keys.forEach(key => {
      result[key] = sortObject(obj[key]);
    });
    return result;
}

export function toBigInt_18(numStr: string): BigInt|undefined{

  if(numStr.length === 0){
      return undefined
  }

  let indexOfPoint = numStr.indexOf('.')
  // console.log(indexOfPoint)
  if(indexOfPoint === -1){
      return BigInt(numStr+'0'.repeat(18))
  }else{
      let lengthOfDecimal = numStr.length - indexOfPoint - 1
      if(lengthOfDecimal > 18){
          return undefined
      }
      let fullDecimal = numStr + "0".repeat(18-lengthOfDecimal)
      let retDecimal = fullDecimal.substring(0, indexOfPoint) + fullDecimal.substring(indexOfPoint+1)
      return BigInt(retDecimal)
  }

}




export async function getFeeDataFromGastracker(network:string){

    const url_mainnet = 'https://gasstation-mainnet.matic.network/'
    const url_testnet = 'https://gasstation-mumbai.matic.today'

    let url = ""
    if(network == "matic"){
        url = url_mainnet
    }

    if(network === "maticmum"){
        url = url_testnet
    }

    try{
      const response = await axios.get(url)
      return response
    }catch(e:any){
      console.log("gas tracker error: \n", e)
      throw e
    }

}

export async function getGasPrice(provider, network){
    let gasPrice = BigInt(0)
    let feeData = await provider.getFeeData();
    if(feeData.gasPrice === null){
        try{
            const resopnse = await getFeeDataFromGastracker(network)
            gasPrice = BigInt(resopnse.fast)*BigInt(10**9)
        }catch(e:any){
            console.log("can not get fee data, use default in ethers")
            return null
        }
    }else{
        gasPrice = feeData.gasPrice
    }

    return gasPrice
}



export function getDomainSeparator(name: string, version: string, contractAddress: string, chainId:number) {
    //const chainId = hre.network.config.chainId
    // console.log('*chainid: ', chainId)
    // console.log('*name: ', name)
    // console.log('*version: ', version)
    // console.log('*address: ', contractAddress)

      //   return utils.keccak256(
  //     utils.defaultAbiCoder.encode(
  //         ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
  //         [
  //           utils.keccak256(utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
  //           utils.keccak256(utils.toUtf8Bytes(name)),
  //           //utils.keccak256(utils.toUtf8Bytes('1')),
  //           utils.keccak256(utils.toUtf8Bytes(version)),
  //           chainId,
  //           contractAddress
  //         ]
  //     )
  // )

    const abiEncoder = AbiCoder.defaultAbiCoder()
    return keccak256(
        abiEncoder.encode(
            ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
            [
              keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
              keccak256(toUtf8Bytes(name)),
              keccak256(toUtf8Bytes(version)),
              chainId,
              contractAddress
            ]
        )
    )
}

export function getDomainSeparator2(name: string, version: string, contractAddress: string, chainId:number) {

}



export function getWithdrawDigest(
    receiver: string,
    value: bigint,
    nonce: bigint,

    contractAddr: string,
    domainName: string,
    version: string,
    chainId: number

): string {

    //let version = process.env.WITHDRAW_CONTRACT_VERSION as string

    const DOMAIN_SEPARATOR = getDomainSeparator(domainName, version, contractAddr, chainId)

    const REWARD_TYPEHASH = keccak256(
        toUtf8Bytes('Reward(address receiver,uint256 value,uint256 nonce)')
    )
    const abiEncoder = AbiCoder.defaultAbiCoder()
    
    return keccak256(
        solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
              '0x19',
              '0x01',
              DOMAIN_SEPARATOR,
              keccak256(
                abiEncoder.encode(
                  ['bytes32', 'address', 'uint256', 'uint256'],
                  [REWARD_TYPEHASH, receiver, value, nonce]
                )
              )
            ]
        )
    )
}


export function getMinerNFTDigest(

    owner: string,
    miner: string,
    bAirDrop: boolean,
    deadline: bigint,

    contractAddr: string,
    domainName: string,
    version: string,
    chainId: number

): string {

    const DOMAIN_SEPARATOR = getDomainSeparator(domainName,version, contractAddr, chainId)
    const MINER_NFT_TYPEHASH = keccak256(
        toUtf8Bytes('GameMinerOnboard(address owner,address miners,bool bAirDrop,uint256 deadline)')
    )
    const abiEncoder = AbiCoder.defaultAbiCoder()

    return keccak256(
        solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
            '0x19',
            '0x01',
            DOMAIN_SEPARATOR,
            keccak256(
                abiEncoder.encode(
                ['bytes32', 'address', 'address', 'bool', 'uint256'],
                [MINER_NFT_TYPEHASH, owner, miner, bAirDrop, deadline]
                )
            )
            ]
        )
    )
}



export function getStandardMinerNFTDigest(

    owner: string,
    miner: string,
    deadline: bigint,
  
    contractAddr: string,
    domainName: string,
    version: string,
    chainId: number
  
): string {
  
    const DOMAIN_SEPARATOR = getDomainSeparator(domainName,version, contractAddr, chainId)
    const STANDARD_MINER_NFT_TYPEHASH = keccak256(
        toUtf8Bytes('StandardMinerOnboard(address owner,address miner,uint256 deadline)')
    )
    const abiEncoder = AbiCoder.defaultAbiCoder()
    return keccak256(
        solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
              '0x19',
              '0x01',
              DOMAIN_SEPARATOR,
              keccak256(
                abiEncoder.encode(
                  ['bytes32', 'address', 'address', 'uint256'],
                  [STANDARD_MINER_NFT_TYPEHASH, owner, miner, deadline]
                )
              )
            ]
        )
    )
}


export function getPriceAuthorizationDigest(
    owner: string,
    miner: string,
    token: string,
    price: bigint,
    deadline: bigint,
  
    domainName: string,
    version: string,
    contractAddr: string,
    chainId: number
): string {
  
    const DOMAIN_SEPARATOR = getDomainSeparator(domainName,version, contractAddr, chainId)
    const REMOTE_REGISTER_TYPEHASH = keccak256(
        toUtf8Bytes('RemoteMinerOnboard(address owner,address miners,address token,uint256 price,uint256 deadline)')
    )
    const abiEncoder = AbiCoder.defaultAbiCoder()

    var types = ['bytes32', 'address', 'address', 'address', 'uint256', 'uint256'];
    var values = [REMOTE_REGISTER_TYPEHASH, owner, miner, token, price, deadline];
    var data = keccak256(abiEncoder.encode(types, values));
    var packTypes = ['bytes1', 'bytes1', 'bytes32', 'bytes32'];
    var packValues = ['0x19', '0x01', DOMAIN_SEPARATOR, data];
    var digest = keccak256(solidityPacked(packTypes, packValues));
    return digest;
}

export function getERC20PermitDigest(
    owner: string,
    spender: string,
    value: bigint,
    nonce: bigint,
    deadline: bigint,
  
    domainName: string,
    version: string,
    contractAddr: string,
    chainId: number
): string {
    
    const DOMAIN_SEPARATOR = getDomainSeparator(domainName,version, contractAddr, chainId)
    const PERMIT_TYPEHASH = keccak256(
        toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
    )
    const abiEncoder = AbiCoder.defaultAbiCoder()
  
    return keccak256(
        solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
            '0x19',
            '0x01',
            DOMAIN_SEPARATOR,
            keccak256(
                abiEncoder.encode(
                ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
                [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
                )
            )
            ]
        )
    )
}

export function validateParams<T>(schema:Schema,params: JSONRPCParams){

    const validateResult: ValidateError[] = validate<T>(schema, params as T)
    if (validateResult.length > 0) {
        throw jsonRpcResult(RpcCode.INVALID_PARAMS, validateResult[0].message)
    }

}

export function validateCallService(serviceName:string, validServices:string[]){

    // if(!validServices.includes(serviceName)){
    //     throw jsonRpcResult(RpcCode.BUSINESS_INVALID_CALL_SERVICE_NAME)
    // }
}


export async function callRpc(url: string, method: string, params:Object){

    try {
        const response = await axios.post(url, {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        })
  
        if (response.data.result) {
            return response.data.result;
        } else if(response.data.error){
            throw response.data.error
        }
    } catch (error:any) {
    //   if (axios.isAxiosError(error)) {
    //     const axiosError = error as AxiosError<RpcResponse<T>>;
    //     if (axiosError.response?.data?.error) {
    //       throw new Error(axiosError.response.data.error.message);
    //     }
    //   }
        throw error
    }
  }
  