const express = require('express')
const router = express.Router()

const {
  createPosts,
  deletePost,
  getPosts,
  guestPosts,
  likePost,
  updatePost
} = require('../controllers/postControllers')
const requireAuth = require('../middleware/requireAuth')

// FETCH POSTS FOR GUESTS
router.get('/guest', guestPosts)

// >>----------------USING THE AUTHENTICATION----------------<<
router.use(requireAuth)

// CREATE A NEW POST
router.post('/', createPosts)

// DELETE A POST
router.delete('/:id', deletePost)

// GET ALL POSTS
router.get('/', getPosts)

// LIKE A POST
router.patch('/likes/:id', likePost)

// UPDATE A POST
router.patch('/:id', updatePost)

module.exports = router
