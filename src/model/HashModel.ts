import Schema, {Rules} from 'async-validator'

export class HashModel{
    query_hash!: string
    trans_hash?: string
}

const validateRules:Rules = {

    query_hash: [
        { type: 'string', required: true},
        { len:66,pattern: '^0[xX][0-9a-fA-F]{64}$', message: 'query hash length should be 66 characters with perfix \'0x\' '}
    ],

    trans_hash: [
        { type: 'string', required: false},
        { len:66,pattern: '^0[xX][0-9a-fA-F]{64}$' , message: 'transaction hash length should be 66 hex-characters with perfix \'0x\' '}
    ],
  
}
const HashValidateSchema=new Schema(validateRules)
export default HashValidateSchema


