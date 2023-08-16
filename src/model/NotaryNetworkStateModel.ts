import Schema, {Rules} from 'async-validator'

export class NotaryNetworkStateModel{
    blockHash!: string
    cid!: string
    blockHeight!: number
    totalPowerGeneration!: string
    circulatingSupply!: string

    call_service!: string
    call_back_method!: string
}

const validateRules:Rules = {

    blockHash: [
        {type: 'string', required: true}
    ],
    cid: [
        {type: 'string', required: true}
    ],
    blockHeight: [
        {type: 'integer', required: true}
    ],
    totalPowerGeneration: [
        {type: 'string', required: true}
    ],
    circulatingSupply: [
        {type: 'string', required: true}
    ],

    call_service: [
        {type: 'string', required: true}
    ],
    call_back_method: [
        {type: 'string', required: true}
    ],

}
const NotaryNetworkStateValidateSchema=new Schema(validateRules)
export default NotaryNetworkStateValidateSchema


