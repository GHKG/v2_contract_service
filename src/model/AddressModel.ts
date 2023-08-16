import Schema, {Rules} from 'async-validator'

export class AddressModel{
    address!: string
}

const validateRules:Rules = {
    address: [
        {type: 'string', required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'address should be 42 hex-characters with prefix \'0x\' ' }
    ],
}
const AddressValidateSchema=new Schema(validateRules)
export default AddressValidateSchema


