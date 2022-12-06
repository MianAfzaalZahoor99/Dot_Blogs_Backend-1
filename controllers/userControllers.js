const { google } = require('googleapis')
const bcrypt = require('bcrypt')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const validator = require('validator')

const User = require('../models/userModel')

// SETTTIN THE CLIENT KEY FOR MAILING THE RESET PASSWORD LINK
const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
OAuth2_client.setCredentials({ refresh_token : process.env.REFRESH_TOKEN })

// CREATING JSON WEB TOKEN USED IN LOGIN & SIGNUP
const createToken = _id => {
  return jwt.sign({_id}, process.env.SECRET_KEY, {expiresIn: '1d'})
}

// CHANGE NAME
const changeName = async (req, res) => {
  const { userID, userName } = req.body
  try {
    const userUpdate = await User.findByIdAndUpdate({_id: userID}, {
      $set: {
        name : userName
      }
    })
    if(!userUpdate)
    {
      res.status(400).json({error: 'USER DOES NOT EXIST'})
    }
    res.status(200).json({name: userName})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  const { userID, userPassword } = req.body
  try {
    if(!validator.isStrongPassword(userPassword))
    {
      res.status(400).json({error: 'Password should have at least 7 characters(Uppercase, Lowercase and Any Character)'})
    }
    else{
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(userPassword, salt)
      const userUpdate = await User.findByIdAndUpdate({_id: userID}, {
        $set: {
          password : hash
        }
      })
      if(!userUpdate)
      {
        res.status(400).json({error: 'USER DOES NOT EXIST'})
      }
      res.status(200).json({success: 'PASSWORD CHANGED'})
    }
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// GET FRIEND INFORMATION
const getFriends = async (req, res) => {
  const { userName } = req.body
  const friend = await User.find({name : userName})
  if (friend.length === 0) {
    res.status(400).json({error: 'THIS ACCOUNT DOES NOT EXISTS'})
  }else {
    res.status(200).json(friend)
  }
}

// GET USER FRIENDS
const getFriendsDetail = async (req, res) => {
  const { email } = req.body
  const selfUser = await User.findOne({email : email}).sort({createAt: -1})
  if (!selfUser) {
    res.status(400).json({error: 'THIS ACCOUNT DOES NOT EXISTS'})
  }else {
    res.status(200).json({friends: selfUser.friends})
  }
}

// GET USER NAME
const getName = async (req, res) => {
  const { commentUser } = req.body
  try{
    const newUser = await User.findById({_id : commentUser})
    if (!newUser) {
      res.status(400).json({error: 'USER DOES NOT EXISTS'})
    }
    res.status(200).json({name: newUser.name})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// GET NOTIFICATIONS
const getNotifications = async (req, res) => {
  const userNow = await User.findOneAndUpdate({name : req.body.userName}, {
    $set: {
      notifications: []
    }
  })
  if (!userNow)
  {
    res.status(400).json({error : 'USER NOT FOUND'})
  }
  res.status(200).json({notifications: userNow.notifications})
}

// GET PROFILE PICTURE
const getProfilePicture = async (req, res) => {
  const { id } = req.params
  try{
    const userSelected = await User.findById({_id : id})
    if (!userSelected)
    {
      res.status(400).json({error: 'USER NOT FOUND'})
    }
    res.status(200).json({profilePicture : userSelected.profilephoto})
  }catch(error) {
    res.status(400).json({error: error.message})
  }
}

// GET USER ID
const getUser = async (req, res) => {
  const { email } = req.body
  try{
    const user = await User.findOne({email})
    if (!user) {
      res.status(400).json({error: 'USER DOES NOT EXISTS'})
    }
    res.status(200).json({id: user._id})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try{
    const user = await User.login(email, password)
    // GENERATING JWT TOKEN
    const token = createToken(user._id)
    res.status(200).json({name: user.name, email, token, friends: user.friends})
  } catch(error) {
    res.status(400).json({error: error.message})
  }
}

// REMOVE FRIEND
const removeFriends = async (req, res) => {
  const { friendID, email } = req.body
  try {
    let mainUser = await User.findOne({email: email})
    if (!mainUser) {
      res.status(400).json({error: 'USER DOES NOT EXISTS'})
    }
    if (!mainUser.friends.includes(friendID))
    {
      res.status(200).json({message: 'USER IS NOT IN YOUR FRIEND LIST', friends: mainUser.friends})
    }
    else{
      await User.findOneAndUpdate({_id: mainUser._id}, {
        $pull: {
          friends: friendID
        }
      })
      const friend = await User.findById({_id: friendID})
      if (!friend) {
        res.status(400).json({error: 'USER DOES NOT EXISTS'})
      }
      await User.findOneAndUpdate({_id: friendID}, {
        $pull: {
          friends: mainUser._id
        }
      })
      mainUser = await User.findOne({email: email})
      res.status(200).json({friends: mainUser.friends})
    }
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// REMOVE PROFILE PICTURE
const removeProfilePicture = async(req, res) => {
  const { id } = req.params
  try {
    const userUpdate = await User.findByIdAndUpdate({_id: id}, {
      $set: {
        profilephoto : null
      }
    })
    if(!userUpdate)
    {
      res.status(400).json({error: 'USER DOES NOT EXIST'})
    }
    res.status(200).json({success: 'PICTURE REMOVED'})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { userToken, userID, userPassword } = req.body
  const findUser = await User.findById({_id : userID})
  if(!findUser)
  {
    res.status(400).json({error: 'USER NOT FOUND'})
  }
  try {
    const payload = jwt.verify(userToken, process.env.SECRET_KEY)
    if(!payload)
    {
      res.status(400).json({error: 'SESSION EXPIRED. RESET PASSWORD AGAIN.'})
    }
    else{
      if(!validator.isStrongPassword(userPassword))
      {
        res.status(400).json({error: 'Password should have at least 7 characters(Uppercase, Lowercase and Any Character)'})
      }
      else{
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(userPassword, salt)
        const userUpdate = await User.findByIdAndUpdate({_id: userID}, {
          $set: {
            password : hash
          }
        })
        if(!userUpdate)
        {
          res.status(400).json({error: 'USER DOES NOT EXIST'})
        }
        res.status(200).json({success: 'PASSWORD CHANGED'})
      }
    }
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// RESET PASSWORD LINK
const resetPasswordLink = async (req, res) => {
  const { email } = req.body
  const findUser = await User.findOne({email: email})
  if (!findUser)
  {
    res.status(400).json({error:'USER NOT FOUND'})
  }

  // GENERATING ONE TIME LINK
  const payload = {
    email : findUser.email,
    id: findUser._id
  }
  const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '30m'})
  const linkReset = `http://localhost:3000/resetpassword/${findUser._id}/${token}`

  // SENDING LINK TO USER EMAIL
  const accessToken = await OAuth2_client.getAccessToken()
  console.log('HERE ABOVE : ', accessToken)

  // CREATING EMAIL TRANSPOTER
  const mailTransporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_ADMIN,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken
    }
  })

  // GENERATING THE EMAIL
  const message = {
    from: process.env.EMAIL_ADMIN,
    to: findUser.email,
    subject: 'Reset your password for Dot Blogs Account',
    text: `Hello ${findUser.name},\n\nFollow this link to reset your Dot Blogs Application password for your ${findUser.email} account.\n\n${linkReset}\n\nIf you didn't ask to reset your password, you can ignore this email.\n\nThanks,\n\nYour Dot Blogs team`
  }

  // SENDING MAIL
  mailTransporter.sendMail(message, (error) => {
    if(error)
    {
      res.status(400).json({error:error.message})
    }
    else{
      res.status(200).json({success:'MAIL SENT'})
    }
  })
}

// ADD FRIEND
const setFriends = async (req, res) => {
  const { friendID, email } = req.body
  try {
    let mainUser = await User.findOne({email: email})
    if (!mainUser) {
      res.status(400).json({error: 'USER DOES NOT EXISTS'})
    }
    if (mainUser.friends.includes(friendID))
    {
      res.status(200).json({message: 'USER ALREADY ADDED AS A FRIEND', friends: mainUser.friends})
    }
    else{
      await User.findOneAndUpdate({_id: mainUser._id}, {
        $push: {
          friends: friendID
        }
      })
      const friend = await User.findById({_id: friendID})
      if (!friend) {
        res.status(400).json({error: 'USER DOES NOT EXISTS'})
      }
      await User.findOneAndUpdate({_id: friendID}, {
        $push: {
          friends: mainUser._id
        }
      })
      mainUser = await User.findOne({email: email})
      await User.findOneAndUpdate({_id: friendID}, {
        $push: {
          notifications : `${mainUser.name} has added you as a friend`
        }
      })

      res.status(200).json({friends: mainUser.friends})
    }
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// SET PROFILE PICTURE
const setProfilePicture = async (req, res) => {
  const { userID } = req.body
  try {
    const userUpdate = await User.findByIdAndUpdate({_id: userID}, {
      $set: {
        profilephoto : {
          data: fs.readFileSync('uploads/profile/' + req.file.originalname),
          contentType: 'image/png'
        }
      }
    })
    if(!userUpdate)
    {
      res.status(400).json({error: 'USER DOES NOT EXIST'})
    }
    res.status(200).json({success: 'PICTURE UPDATED'})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// SIGN UP USER
const signupUser = async (req, res) => {
  const { name, email, password } = req.body
  try {
    const user = await User.signup(name, email, password)
    // GENERATING JWT TOKEN
    const token = createToken(user._id)
    res.status(200).json({name : user.name, email: user.email, token, friends: user.friends})
  } catch(error) {
    res.status(400).json({error: error.message})
  }
}

// GET USER STATUS
const userStatus = async (req, res) => {
  const {userName} = req.body
  const userSelected = await User.findOne({name : userName})
  if (!userSelected)
  {
    res.status(400).json({error:'USER NOT FOUND'})
  }
  res.status(200).json({status: userSelected.premium})
}

module.exports = {
  changeName,
  changePassword,
  getFriends,
  getFriendsDetail,
  getName,
  getNotifications,
  getProfilePicture,
  getUser,
  loginUser,
  removeFriends,
  removeProfilePicture,
  resetPassword,
  resetPasswordLink,
  setFriends,
  setProfilePicture,
  signupUser,
  userStatus
}
