const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const User = require('../models/userModel')

// PAYMENT SESSION CREATION
const createCheckoutSession = async (req, res) => {
  const { total_amount }= req.body
  const payment = await stripe.paymentIntents.create({
    amount : (total_amount * 100),
    currency: 'usd'
  })
  if(!payment)
  {
    res.status(400).json({error : 'PAYMENT SESSION ERROR'})
  }
  res.status(200).json({clientSecrect : payment.client_secret})
}

// UPDAING USER STATUS
const updateUserStatus = async (req, res) => {
  const { userName } = req.body
  const currentUser = await User.findOneAndUpdate({name: userName}, {
    $set:{
      premium: true
    }
  })
  if(!currentUser)
  {
    return res.status(404).json({error: "No Such User Exists"})
  }
  res.status(200).json({success: 'USER BECOMES A PREMIUM MEMBER'})
}

module.exports = {
  createCheckoutSession,
  updateUserStatus
}
