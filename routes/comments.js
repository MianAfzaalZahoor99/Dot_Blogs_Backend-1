const express = require('express')
const router = express.Router()

const {
  commentDelete,
  editComment,
  postComment,
} = require('../controllers/commentControllers')
const requireAuth = require('../middleware/requireAuth')

// >>----------------USING THE AUTHENTICATION----------------<<
router.use(requireAuth)

// DELETE A COMMENT
router.post('/delete/:id', commentDelete)

// EDIT A COMMENT
router.patch('/edit/:id', editComment)

// POST A COMMENT
router.post('/post/:id', postComment)

module.exports = router
