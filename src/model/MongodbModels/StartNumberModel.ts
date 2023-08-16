import config from "../../config";
import  {mongoose} from '../../config/db'
// import config from "../config/index"
import logger from '../../config/log4js'

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

let SearchStartNumberModel
let ErrorTokenIdModel

if(config["chain_type"] === "maticmum" && config["chain_id"] === 80001){
    SearchStartNumberModel = mongoose.model('TokenIdStartNumber_dev', StartNumberSchema);
    ErrorTokenIdModel = mongoose.model('ErrorTokenId_dev', ErrorTokenIdSchema);
}

if(config["chain_type"] === "matic" && config["chain_id"] === 137){
    SearchStartNumberModel = mongoose.model('TokenIdStartNumber', StartNumberSchema);
    ErrorTokenIdModel = mongoose.model('ErrorTokenId', ErrorTokenIdSchema);
}



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
            if(docs[0].error_tokenIds.includes(tokenId)){
                logger.info(`tokenId ${tokenId} already in error list`)
            }else{
                await docs[0].error_tokenIds.push(tokenId)
                await docs[0].save()
            }

        }

    }catch(e:any){
        logger.error('error in RecordErrorTokenId', e)
        throw e
    }
}