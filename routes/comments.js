const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    postid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    },
    userid:{type:mongoose.Schema.Types.ObjectId,
    ref:'user'},

    reacts:[],
    
    comment:String

})
module.exports = mongoose.model('comment', commentSchema);