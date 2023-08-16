import  {mongoose} from '../../config/db'

interface CallServiceWise{
  call_service:string,
  call_back_method: string
}

export  interface QueryCreateation extends CallServiceWise {
    query_time: number,
    interface_name: string,
    params_json_string:string,
    query_hash: string,
}

const QueryTransactionSchema = new mongoose.Schema({

    query_time: {type: Number, required: true},
    call_service: {type: String, required: true},
    interface_name: {type: String, required: true},
    params_json_string: {type: String, required: true},
    call_back_method: {type: String, required: true},
    query_hash: {type: String, required: true, minlength: 66, maxlength:66, unique: true},
    

    trans_hash: {type: String, minlength: 66, maxlength:66},
    sender_addr: {type: String,  minlength: 42, maxlength:42},
    contract_addr: {type: String,  minlength: 42, maxlength:42},
    chain_id: {type: Number},
    contract_function_name: {type: String},
    transaction_status:  {type: String, enum: ['init','send_error','pending', 'failed', 'confirmed']},
    transaction_error_message: {type: String},
    block_number:  {type: Number},
    status_query_count: {type: Number},

    notify_time:  {type: Number},
    notify_status:{type: Boolean, default: false},
    notify_count: {type: Number},
});

//create tables(collections)
export const AllTransactionModel = mongoose.model('AllTransaction', QueryTransactionSchema);
export const PendingTransactionModel = mongoose.model('PendingTransaction', QueryTransactionSchema);


async function add_record(Model, obj){
    const doc = new Model(obj)
    try{
        // await model.validate()
        await doc.save()
        return doc
    }catch(e:any){
        // console.log(e)
        console.error(`Failed to create document in ${Model.modelName}:`, e);
        throw e
    }

}

async function delete_record(Model, id){
    try {
        const doc = await Model.findByIdAndDelete(id);
        return doc;
      } catch (err) {
        console.error(`Failed to delete document in ${Model.modelName}:`, err);
        throw err;
      }
}

async function update_record(Model, id, data){
    try {
        const doc = await Model.findByIdAndUpdate(id, data, { new: true });
        // await doc.validate();
        return doc;
      } catch (err) {
        console.error(`Failed to update document in ${Model.modelName}:`, err);
        throw err;
      }
  
}

async function getById(Model, id){
    try {
        const doc = await Model.findById(id);
        return doc;
      } catch (err) {
        console.error(`Failed to get document by id from ${Model.modelName}:`, err);
        throw err;
      }
}

async function  getByQuery(Model , query) {
    try {
        const docs = await Model.find(query);
        return docs;
      } catch (err) {
        console.error(`Failed to get documents by query from ${Model.modelName}:`, err);
        throw err;
      }
}
export default  {add_record, delete_record, update_record, getById, getByQuery}



// mySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     age: { type: Number, min: 18 },
//     email: { type: String, index: true },
//     password: { type: String, required: true, select: false },
//     role: { type: String, enum: ['admin', 'user'], default: 'user' },
//     created: { type: Date, default: Date.now },
//     updated: { type: Date, default: Date.now },
// });
// 在这里，我们使用 const mySchema = new mongoose.Schema({...}) 来定义一个新的 Schema。

// 我们可以通过类型和选项定义每个属性，例如：

// type: 数据类型。支持的数据类型包括 String, Number, Date, Boolean, Buffer, Mixed 和 ObjectId 等。
// required: 属性是否必需。
// default: 默认值。
// index: 是否对属性创建索引。
// unique: 是否对属性创建唯一索引。
// min/max: 属性值的最小值或最大值。例如，min: 18 可以用于限制一个年龄值必须大于或等于 18。
// Schema 还支持许多其他选项，包括：

// validate: 自定义验证器函数，用于验证数据。
// get/set: 转换（get）和返转（set）属性的值。
// select: 是否选择属性。默认为 true，可使用 false 以禁止选择属性。
// trim: 是否修剪字符串属性的空格。
// uppercase/lowercase: 是否强制字符串属性的大小写。
// sparse: 空值是否允许为索引。
// validateBeforeSave: 文档保存之前是否进行验证。默认为 true。
// 除此之外，你还可以在 Schema 中定义虚拟属性、实例方法、静态方法和钩子函数，使用这些方法可以增加模型的灵活性和可复用性。