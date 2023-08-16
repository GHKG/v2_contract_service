import Schema, {Rules} from 'async-validator'

export class NftMintAuthModel{
    ownerAddress!: string
    minerAddress!: string
    deadline!: number
}

const validateRules:Rules = {
    deadline: [
        {type: 'number', required: true}
    ],
    
    ownerAddress:[
        {type: 'string', required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'owner address should be 42 hex-characters with prefix \'0x\' ' }
    ],

    minerAddress:[
        {type: 'string', required: true},
        {len: 42, pattern: '^0[xX][0-9a-fA-F]{40}$', message: 'miner address should be 42 hex-characters with prefix \'0x\' ' }
    ],
}
const NftMintValidateSchema=new Schema(validateRules)
export default NftMintValidateSchema


