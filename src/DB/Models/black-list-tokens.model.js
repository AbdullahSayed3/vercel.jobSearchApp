import mongoose from "mongoose";

const blackListTokensSchema = new mongoose.Schema({
    tokenId:{type:String , required:true , unique:true},
    expireDate :{type:Date, required:true,index: { expires: 0 } }
},{timestamps:true}
)

const BlackListTokens = mongoose.models.BlackListTokens || mongoose.model('BlackListTokens', blackListTokensSchema)

export default BlackListTokens