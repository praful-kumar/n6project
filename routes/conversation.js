const mongoose = require('mongoose');

const conSchema = mongoose.Schema({
    member1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    member2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    messages:[{
        auther:String,
        msgbody:String,
        msgTime:{
            type:String,
            default:new Date()
        }
    }]
})

module.exports = mongoose.model('msg', conSchema);