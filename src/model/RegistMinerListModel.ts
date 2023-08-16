import Schema, {Rules} from 'async-validator'



export class RegistMinerListModel{
    miner_type!: number
    miners!: string[]

    call_service!: string
    call_back_method!: string
}

const validateRules:Rules = {
    miners: [
        {type: 'array',required: true}
    ],
    miner_type: {
        type: 'number', required: true
    },
    call_service: [
        {type: 'string', required: true}
    ],
    call_back_method: [
        {type: 'string', required: true}
    ],
}
const RegistMinerListValidateSchema=new Schema(validateRules)
export default RegistMinerListValidateSchema


