const mongoose = require('mongoose')

const Comments = require('../models/commentModel')
const Posts = require('../models/postModel')
const User = require('../models/userModel')

// CREATE A NEW POST
const createPosts = async (req, res) => {
  const {title, description} = req.body
  let emptyFileds = []
  if(!title)
  {
    emptyFileds.push('title')
  }
  if(!description)
  {
    emptyFileds.push('description')
  }
  if (emptyFileds.length > 0) {
    return res.status(400).json({error: 'PLEASE FILL IN ALL THE DETAILS', emptyFileds})
  }
  try {
    const user_id = req.user._id
    const post = await Posts.create({user_id, title, description})
    res.status(200).json(post)
  } catch(error){
    res.status(400).json({error: error.message})
  }
}

// DELETE A POST
const deletePost = async (req, res) => {
  const {id} = req.params
  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Post Exists"})
  }
  const post = await Posts.findOneAndDelete({_id: id})
  if (!post)
  {
    return res.status(400).json({error: "No Such Post Exists"})
  }
  post.comments.forEach(comment => {
    deleteComments(comment)
  })
  res.status(200).json(post)
}
const deleteComments = async comment => {
  await Comments.findByIdAndDelete({_id: comment})
}

// GET ALL POSTS
const getPosts = async (req, res) => {
  const posts = await Posts.find().sort({createdAt: -1}).populate({path: 'comments'}).sort({createdAt: -1})
  res.status(200).json(posts)
}

// GET POSTS FOR GUEST
const guestPosts = async (req, res) => {
  const posts = await Posts.find().sort({createdAt: -1}).populate({path: 'comments'}).sort({createdAt: -1})
  res.status(200).json(posts)
}

// LIKE A POST
const likePost = async (req, res) => {
  const {id} = req.params
  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Post Exists"})
  }
  const post = await Posts.findById({_id: id})
  if (!post)
  {
    return res.status(400).json({error: "No Such Post Exists"})
  }
  const likeUsers = post.likes
  if(likeUsers.includes(req.body.likes))
  {
    await Posts.findOneAndUpdate({_id: id}, {
      $pull: {
        likes:req.body.likes
      }
    })
    if (likeUsers.indexOf(req.body.likes) > -1) {
      likeUsers.splice(likeUsers.indexOf(req.body.likes), 1);
    }
  }
  else
  {
    await Posts.findOneAndUpdate({_id: id}, {
      $push: {
        likes:req.body.likes
      }
    })
    likeUsers.push(req.body.likes)
    if (post.user_id !== req.body.likes)
    {
      const currentUser = await User.findOne({_id : req.body.likes})
      await User.findOneAndUpdate({_id: post.user_id}, {
        $push: {
          notifications : `${currentUser.name} has liked your post "${post.title}"`
        }
      })
    }
  }
  res.status(200).json({totalLikes : likeUsers})
}

// UPDATE A POST
const updatePost = async (req, res) => {
  const {id} = req.params
  if(!mongoose.Types.ObjectId.isValid(id))
  {
    return res.status(404).json({error: "No Such Post Exists"})
  }
  const post = await Posts.findOneAndUpdate({_id: id}, {...req.body})
  if (!post)
  {
    return res.status(400).json({error: "No Such Post Exists"})
  }
  const updatedPost = await Posts.findOne({_id: id})
  res.status(200).json(updatedPost)
}

module.exports = {
  createPosts,
  deletePost,
  getPosts,
  guestPosts,
  likePost,
  updatePost
}
