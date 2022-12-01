const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema ({
  user_id: {
    type: String,
    required: true
  },
  title: {
    type : String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  likes:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Comments'
  }]
}, {timestamps: true})

module.exports = mongoose.model('Posts', postSchema)
