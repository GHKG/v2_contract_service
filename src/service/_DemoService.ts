import { JSONRPCParams } from "json-rpc-2.0";
import { Contract, Numeric, TransactionResponse, ContractMethodArgs, Wallet} from "ethers";
import { ValidateError } from "async-validator";
// import {jsonRpcResult} from "../utils/Instrument";
import { RpcCode } from "../utils/RpcCode";
import {validate, jsonRpcResult, getGasPrice, getGasOptionObject, validateCallService} from "../utils/Instrument";
import { kmsSigner } from "../utils/kmsSigner";
import DemoValidateSchema, { DemoModel } from "../model/DemoModel";
import {provider} from '../utils/TransactionHelper'
import {SendTransactionFrame} from '../utils/SendTransactionFrame'
import logger from '../config/log4js'
import config from '../config'

// const provider = new InfuraProvider(config['chain_type'], config['provider_key'])

async function call_contract_func_saveData3(params:DemoModel):Promise<TransactionResponse>{

    // const wallet = new Wallet(config['private_key'], provider)
    const wallet  = new kmsSigner("0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49","key_save_data", provider)
    const abi = [
        "function saveData3(uint256 _data1, string memory _data2, address[] calldata _data3) external"
    ]
    const contract = new Contract("0xd31DA85aB1514eb4f0CBccc652B031aaDC176421", abi, wallet)
    // const contract = new Contract("0x8Ec9e32303B2c5AdEd5FAa32BeC613727b716bdD", abi, wallet)


    const argArray:ContractMethodArgs<any[]> = [
        params.length,
        params.address,
        params.miners
    ]

    const estimatedGas = await contract.saveData3.estimateGas(...argArray)
    const gasPrice = await getGasPrice(provider, config['chain_type'])
    const gasObj = getGasOptionObject(estimatedGas, 20, gasPrice, 20)

    return await contract.saveData3(...argArray, gasObj )
    
}

export class DemoService{
    async getAccount(params: JSONRPCParams){

        logger.info(params);

        const query_info = <DemoModel>params
        const validateResult: ValidateError[] = validate<DemoModel>(DemoValidateSchema, query_info)
        if (validateResult.length > 0) {
            throw jsonRpcResult(RpcCode.INVALID_PARAMS, validateResult[0].message)
        }

        validateCallService(params.call_service, config["nacosServerSubscribeList"])
        //bind params
        const func_core = call_contract_func_saveData3.bind(null, params);

        try{
            return await SendTransactionFrame(
                params,
                "0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49",
                "0xd31DA85aB1514eb4f0CBccc652B031aaDC176421", 
                this.getAccount.name, 
                func_core, 
                15) 
        }catch(e:any){
            throw e
        }

    }
}



