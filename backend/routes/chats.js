const express = require('express')
const router = express.Router()
const {
  deleteChat,
  getChat,
  sendChat,
  updateChat
} = require('../controllers/chatsControllers')

const requireAuth = require('../middleware/requireAuth')

// REQUIRE AUTH FOR ALL POSTS ROUTES
router.use(requireAuth)

// SEND CHAT
router.post('/send', sendChat)

// GET CHAT
router.post('/get', getChat)

// DELETE CHAT
router.patch('/delete', deleteChat)

// UPDATE CHAT
router.patch('/update', updateChat)

module.exports = router
