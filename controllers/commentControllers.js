const Comments = require('../models/commentModel')
const Posts = require('../models/postModel')
const mongoose = require('mongoose')
const User = require('../models/userModel.js')

// POST A COMMENT
const postComment = async (req, res) => {
  const {id} = req.params
  const { userID, comment} = req.body
  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Post Exists"})
  }
  try{
    const commentID = await Comments.create({user_id: userID, description: comment})
    const post = await Posts.findById({_id: id})
    if (!post)
    {
      return res.status(400).json({error: "No Such Post Exists"})
    }
    const updated = await Posts.findOneAndUpdate({_id: id}, {
      $push: {
        comments: commentID._id
      }
    })
    if (updated.user_id !== userID)
    {
      const currentUser = await User.findOne({_id : userID})
      await User.findOneAndUpdate({_id: updated.user_id}, {
        $push: {
          notifications: `${currentUser.name} has commented on your post "${updated.title}"`
        }
      })
    }
    const commentLog = await Posts.findById({_id: id}).populate({path: 'comments'}).sort({createdAt: -1})
    res.status(200).json({commentsReturned: commentLog.comments})
  }catch(error) {
    res.status(400).json({error: error.message})
  }
}

// DELETE A COMMENT
const commentDelete = async (req, res) => {
  const { id } = req.params
  const { userID, getComment } = req.body

  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Comment Exists"})
  }
  const deletedComment = await Comments.findOneAndDelete({_id: getComment._id})
  if (!deletedComment)
  {
    return res.status(400).json({error: "No Such Comment Exists"})
  }
  deletePostComment(id, getComment._id, userID)
  const commentLog = await Posts.findById({_id: id}).populate({path: 'comments'}).sort({createdAt: -1})
  res.status(200).json({commentsReturned: commentLog.comments})
}

// DELETE COMMENT FROM THE POST
const deletePostComment = async (id, comment, userID) => {
  const updated = await Posts.findOneAndUpdate({_id: id}, {
    $pull: {
      comments:comment
    }
  })
  if (updated.user_id !== userID)
  {
    const currentUser = await User.findOne({_id : userID})
    await User.findOneAndUpdate({_id: updated.user_id}, {
      $push: {
        notifications: `${currentUser.name} has deleted a comment from your post "${updated.title}"`
      }
    })
  }
}

// EDIT A COMMENT
const editComment = async (req, res) => {
  const { id } = req.params
  const { comment_id, newDescription, userID } = req.body
  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Comment Exists"})
  }
  const updatedComment = await Comments.findOneAndUpdate({_id: comment_id}, {
    $set: {
      description: newDescription
    }
  })
  if (!updatedComment)
  {
    return res.status(400).json({error: "No Such Comment Exists"})
  }
  const commentLog = await Posts.findById({_id: id}).populate({path: 'comments'}).sort({createdAt: -1})
  if (commentLog.user_id !== userID)
  {
    const currentUser = await User.findOne({_id : userID})
    await User.findOneAndUpdate({_id: commentLog.user_id}, {
      $push: {
        notifications: `${currentUser.name} has updated a comment on your post "${commentLog.title}"`
      }
    })
  }
  res.status(200).json({commentsReturned: commentLog.comments})
}

module.exports = {
  commentDelete,
  editComment,
  postComment
}
