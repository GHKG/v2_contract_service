import Schema, {Rules} from 'async-validator'

export class RecectArecModel{
    tokenId!: number

    call_service!: string
    call_back_method!: string

}

const validateRules:Rules = {

    tokenId: {
        type: 'integer', required: true
    },
    call_service: [
        {type: 'string', required: true}
    ],
    call_back_method: [
        {type: 'string', required: true}
    ],
}
const RejectArecValidateSchema=new Schema(validateRules)
export default RejectArecValidateSchema

