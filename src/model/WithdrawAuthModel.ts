import Schema, {Rules} from 'async-validator'

export class WithdrawAuthModel{
    recipient!: string
    value!: string
    nonce!: number
}

const validateRules:Rules = {
    nonce: [
        {type: 'number', required: true}
    ],
    value: {
        type: 'string', required: true
    },

    recipient:[
        {type: 'string', required: true},
        {len: 42, message: 'address should be 42 characters with prefix \'0x\' '}
    ],
}
const WithdrawValidateSchema=new Schema(validateRules)
export default WithdrawValidateSchema


