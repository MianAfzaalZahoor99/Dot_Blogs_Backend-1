const Chat = require('../models/chatModel')

const mongoose = require('mongoose')

// SEND USER CHAT
const sendChat = async (req, res) => {
  const { userID, friendID, userMessage } = req.body
  let messageDetails = null
  if(!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(friendID))
  {
    return res.status(404).json({error: "No Such User Exists"})
  }
  const userChat = await Chat.findOneAndUpdate({user_one: userID, user_two: friendID}, {
    $push: {
      messages: {
        sender: userID,
        receiver: friendID,
        text: userMessage
      }
    }
  })
  if (!userChat)
  {
    const againChat = await Chat.findOneAndUpdate({user_one: friendID, user_two: userID}, {
      $push: {
        messages: {
          sender: userID,
          receiver: friendID,
          text: userMessage
        }
      }
    })
    if (!againChat)
    {
      const messageDetail = {
        sender: userID,
        receiver: friendID,
        text: userMessage
      }
      const newChat = await Chat.create({user_one: userID, user_two: friendID, messages: messageDetail})
      messageDetails = newChat
      if(!newChat)
      {
        res.status(400).json({error: 'CANNOT CREATE NEW CHAT'})
      }
      else{
        messageDetails = await Chat.findOne({user_one: userID, user_two: friendID})
      }
    }
    else{
      messageDetails = await Chat.findOne({user_one: friendID, user_two: userID})
    }
  }
  else{
    messageDetails = await Chat.findOne({user_one: userID, user_two: friendID})
  }
  res.status(200).json({messageReturned: messageDetails.messages[messageDetails.messages.length-1]})
}

// GET FRIENDS CHAT
const getChat = async (req, res) => {
  const { userID, friendID } = req.body
  const userChat = await Chat.findOne({user_one: userID, user_two: friendID})
  if(!userChat)
  {
    const friendChat = await Chat.findOne({user_one: friendID, user_two: userID})
    if(!friendChat)
    {
      res.status(200).json({chat: []})
    }
    else{
      res.status(200).json({chat: friendChat.messages})
    }
  }else{
    res.status(200).json({chat: userChat.messages})
  }
}

// DELETE USER CHAT
const deleteChat = async (req, res) => {
  const { userID, friendID, messageDel } = req.body
  const userChat = await Chat.findOneAndUpdate({user_one: userID, user_two: friendID}, {
    $pull: {
      messages: messageDel
    }
  })
  if(!userChat)
  {
    const friendChat = await Chat.findOneAndUpdate({user_one: friendID, user_two: userID}, {
      $pull: {
        messages: messageDel
      }
    })
    if(!friendChat)
    {
      res.status(400).json({error: 'Chat does not exists'})
    }
    else{
      res.status(200).json({success: 'Message Deleted'})
    }
  }
  else{
    const sendChat = await Chat.findOne({user_one: userID, user_two: friendID})
    res.status(200).json({returnedMessages: sendChat.messages})
  }
}

// UPDATE CHAT
const updateChat = async (req, res) => {
  const { userID, friendID, messageID, messageNew } = req.body
  const userChat = await Chat.findOne({user_one: userID, user_two: friendID})
  if (!userChat)
  {
    const friendChat = await Chat.findOne({user_one: friendID, user_two: userID})
    if (!friendChat)
    {
      res.status(400).json({error: 'No chat found'})
    }
    else{
      const index = friendChat.messages.findIndex((obj => obj._id.toString() == messageID))
      friendChat.messages[index].text = messageNew
      await Chat.findOneAndUpdate({user_one: friendID, user_two: userID}, {
        $set: {
          messages: friendChat.messages
        }
      })
    }
  }
  else{
    const index = userChat.messages.findIndex((obj => obj._id.toString() == messageID))
    userChat.messages[index].text = messageNew
    await Chat.findOneAndUpdate({user_one: userID, user_two: friendID}, {
      $set: {
        messages: userChat.messages
      }
    })
  }
  res.status(200).json({success: 'Message Updated'})
}

module.exports = {
  deleteChat,
  getChat,
  sendChat,
  updateChat
}
