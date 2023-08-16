import Schema, {Rules} from 'async-validator'

export class VerifyERC20PermitModel{
    owner!: string  
    value!: string
    deadline!: number
    sig!: string
}

const validateRules:Rules = {
    owner: [
        {type: 'string',required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'owner address should be 42 characters with prefix \'0x\' ' }
    ],

    value: [
        {type: 'string', required:true},
    ],

    deadline: [
        {type: 'integer', required:true, min:1, message: "deadline must be a integer and Greater than 0"},
    ],

    sig: [
        {type: 'string',required: true},
        {len: 132,  message: 'signature should be 132 characters with prefix \'0x\' ' }
    ],

}
const VerifyERC20PermitValidateSchema=new Schema(validateRules)
export default VerifyERC20PermitValidateSchema

