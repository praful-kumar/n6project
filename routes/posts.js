const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  },
  containt:String,
  media:{
      type:String,
      default:''
  },
  reacts:[],
  comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'comment'
  }]
})

module.exports = mongoose.model('post', postSchema);