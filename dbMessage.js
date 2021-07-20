import mongoose from 'mongoose';


const Whatsapp=mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    received:false,

})


export default mongoose.model('messages',Whatsapp);