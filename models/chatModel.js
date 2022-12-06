const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema ({
  user_one: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  user_two : {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  messages: [{
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    },
    receiver: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    },
    text: {
      type: String
    },
    time: {
      type: Date,
      default: Date.now
    }
  }]

}, {timestamps: true})

module.exports = mongoose.model('Chat', chatSchema)
