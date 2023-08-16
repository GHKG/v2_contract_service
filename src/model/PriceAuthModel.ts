import Schema, {Rules} from 'async-validator'

export class PriceAuthModel{
    owner!: string
    miner!: string    
    currency!: string
    price!: string
    deadline!: number
}

const validateRules:Rules = {
    owner: [
        {type: 'string',required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'owner address should be 42 characters with prefix \'0x\' ' }
    ],
    miner: [
        {type: 'string',required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$',message: 'miner address should be 42 characters with prefix \'0x\' ' }
    ],
    currency: [
        {type: 'string',required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$' ,message: 'currency address should be 42 characters with prefix \'0x\' ' }
    ],
    price: [
        {type: 'string', required:true, min:1, message: "price must be a hex string"},
    ],
    deadline: [
        {type: 'integer', required:true, min:1, message: "deadline must be a integer and Greater than 0"},
    ]

}
const PriceAuthValidateSchema=new Schema(validateRules)
export default PriceAuthValidateSchema

