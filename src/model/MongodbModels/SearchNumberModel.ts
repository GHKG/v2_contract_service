import  {mongoose} from '../../config/db'
import logger from '../../config/log4js';

const SearchNumberSchema = new mongoose.Schema({
    contract_name:{type: String, required: true, enum: ['Arkreen_miner', 'Arkreen_rec_issuence']},
    start_number:{type: Number, required: true}
});


export const SearchStartNumberModel = mongoose.model('BlockSearchNumber', SearchNumberSchema);

export async function GetStartNumber(contract_name: string){

    try{
        let docs = await SearchStartNumberModel.find({
            contract_name:{ $exists: true, $eq: contract_name} 
        })
        
        if(docs.length === 0){
            const doc = new SearchStartNumberModel({
                contract_name:contract_name,
                start_number:0
            })

            await doc.save()
            return 0
        }else{
            return docs[0].start_number
        }

    }catch(e:any){
        logger.error('error in GetStartNumber', e)
        throw e
    }
}

export async function UpdateStartNumber(contract_name: string, newNum:number){

    try{
        let docs = await SearchStartNumberModel.find({
            contract_name:{ $exists: true, $eq: contract_name} 
        })

        if(docs.length > 0){
            docs[0].start_number = newNum
            docs[0].save()
        }

    }catch(e:any){
        logger.error('error in GetStartNumber', e)
        throw e
    }
}