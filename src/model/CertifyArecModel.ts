import Schema, {Rules} from 'async-validator'

export class CertifyArecModel{
    tokenId!: number
    serialNumber!: string

    call_service!: string
    call_back_method!: string
}

const validateRules:Rules = {
    serialNumber: [
        {type: 'string', required: true}
    ],
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
const CertifyArecValidateSchema=new Schema(validateRules)
export default CertifyArecValidateSchema


