const express = require('express')
const router = express.Router()
const {
  commentDelete,
  editComment,
  postComment,
} = require('../controllers/commentControllers')

const requireAuth = require('../middleware/requireAuth')

// REQUIRE AUTH FOR ALL POSTS ROUTES
router.use(requireAuth)

// POST A COMMENT
router.post('/post/:id', postComment)

// DELETE A COMMENT
router.post('/delete/:id', commentDelete)

// EDIT A COMMENT
router.patch('/edit/:id', editComment)

module.exports = router
