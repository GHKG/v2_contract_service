import Schema, {Rules} from 'async-validator'

export class DemoModel {
    address!: string
    length!: number
    miners!: string[]
    call_service!: string
    call_back_method!: string
}

const validateRules: Rules = {
    address: [
        {type: 'string', required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'owner address should be 42 characters with prefix \'0x\' ' }
    ],
    length:[
        {type: 'integer', required: true},
        {type: 'integer', required:true, min:1, message: "length must be a integer and Greater than 0"},
    ],
    miners:[
        {type: 'array', required: true}
    ],
    call_service: [
        {type: 'string', required: true}
    ],
    call_back_method: [
        {type: 'string', required: true}
    ],
}
const DemoValidateSchema = new Schema(validateRules)
export default DemoValidateSchema


