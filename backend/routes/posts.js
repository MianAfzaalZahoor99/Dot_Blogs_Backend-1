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

// REQUIRE AUTH FOR ALL POSTS ROUTES
router.use(requireAuth)

// CREATE A NEW POST
router.post('/', createPosts)

// GET ALL POSTS
router.get('/', getPosts)

// DELETE A POST
router.delete('/:id', deletePost)

// UPDATE A POST
router.patch('/:id', updatePost)

// LIKE A POST
router.patch('/likes/:id', likePost)

module.exports = router
