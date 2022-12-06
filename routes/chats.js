const express = require('express')
const router = express.Router()

const {
  deleteChat,
  getChat,
  sendChat,
  updateChat
} = require('../controllers/chatsControllers')
const requireAuth = require('../middleware/requireAuth')

// >>----------------USING THE AUTHENTICATION----------------<<
router.use(requireAuth)

// DELETE CHAT
router.patch('/delete', deleteChat)

// GET CHAT
router.post('/get', getChat)

// SEND CHAT
router.post('/send', sendChat)

// UPDATE CHAT
router.patch('/update', updateChat)

module.exports = router
