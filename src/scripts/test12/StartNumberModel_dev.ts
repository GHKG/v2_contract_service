import  {mongoose} from './mongoDB'
import logger from './log4js'

const StartNumberSchema = new mongoose.Schema({
    start_number:{type: Number, required: true}
});

const ErrorTokenIdSchema = new mongoose.Schema({
    error_tokenIds:[
        {
          type: Number,
          required:true
        }
      ]
});

const SearchStartNumberModel = mongoose.model('TokenIdStartNumber_dev', StartNumberSchema);
const ErrorTokenIdModel = mongoose.model('ErrorTokenId_dev', ErrorTokenIdSchema);

export async function GetStartNumber(){

    try{
        let docs = await SearchStartNumberModel.find({
            start_number:{ $exists: true} 
        })
        
        if(docs.length === 0){
            const doc = new SearchStartNumberModel({
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

export async function UpdateStartNumber(newNum:number){

    try{
        let docs = await SearchStartNumberModel.find({
            start_number:{ $exists: true} 
        })

        if(docs.length > 0){
            docs[0].start_number = newNum
            await docs[0].save()
        }

    }catch(e:any){
        logger.error('error in GetStartNumber', e)
        throw e
    }
}

export async function RecordErrorTokenId(tokenId:number){

    try{
        let docs = await ErrorTokenIdModel.find({
            error_tokenIds:{ $exists: true} 
        })
        
        if(docs.length === 0){
            const doc = new ErrorTokenIdModel({
                error_tokenIds:[]
            })

            await doc.save()
            console.log("create error_tokenIds []")
        }else{
            console.log(`add ${tokenId} to error list`)
            await docs[0].error_tokenIds.push(tokenId)
            await docs[0].save()
        }

    }catch(e:any){
        logger.error('error in RecordErrorTokenId', e)
        throw e
    }
}