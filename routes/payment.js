const express = require('express')
const router = express.Router()

const {
  createCheckoutSession,
  updateUserStatus
} = require('../controllers/paymentControllers')
const requireAuth = require('../middleware/requireAuth')

// >>----------------USING THE AUTHENTICATION----------------<<
router.use(requireAuth)

// PAYMENT SESSION CREATION
router.post('/create-checkout-session', createCheckoutSession)

// UPDAING USER STATUS
router.post('/update-user', updateUserStatus)

module.exports = router
