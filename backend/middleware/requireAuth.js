const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {
  // VERIFY USER
  const { authorization } = req.headers

  if(!authorization) {
    res.status(401).json({erorr: 'USER NOT REGISTERED'})
  }

  const token = authorization.split(' ')[1]
  try{
    const { _id } = jwt.verify(token, process.env.SECRET_KEY)

    req.user = await User.findOne({_id}).select('_id')
    next()
  } catch(error) {
    res.status(400).json({error: 'NOT A VALID USER'})
  }
}

module.exports = requireAuth
