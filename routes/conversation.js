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
        msgTime:String
    }]
})

module.exports = mongoose.model('msg', conSchema);