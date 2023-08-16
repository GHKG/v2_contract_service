import Schema, {Rules} from 'async-validator'

export class TokenIdModel{
    tokenId!: number
}

const validateRules:Rules = {

    tokenId: {
        type: 'integer', required: true
    },
}
const TokenIdValidateSchema=new Schema(validateRules)
export default TokenIdValidateSchema


