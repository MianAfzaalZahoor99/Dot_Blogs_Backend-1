const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema ({
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Comments', commentSchema)
