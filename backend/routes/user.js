const express = require('express')
const multer = require('multer')
const router = express.Router()

// IMPORTING CONTROLLER FUNCTIONS
const {
  changeName,
  changePassword,
  loginUser,
  resetPasswordLink,
  resetPassword,
  setProfilePicture,
  signupUser,
  getFriendsDetail,
  getNotifications,
  getName,
  getProfilePicture,
  getUser,
  setFriends,
  getFriends,
  removeFriends,
  userStatus,
  removeProfilePicture
} = require('../controllers/userControllers')

const requireAuth = require('../middleware/requireAuth')

// USER LOGIN REQUEST
router.post('/login', loginUser)

// USER SIGNUP REQUEST
router.post('/signup', signupUser)

// GET USER NAME
router.post('/name', getName)

// RESET PASSWORD LINK
router.post('/resetpassword', resetPasswordLink)

// RESET PASSWORD
router.patch('/resetpassword', resetPassword)

// USER STATUS
router.post('/userstatus', userStatus)

// USING THE AUTHENTICATION
router.use(requireAuth)

// CHANGE PASSWORD
router.patch('/changepassword', changePassword)

// GET NOTIFICATIONS
router.post('/notifications', getNotifications)

// SET PROFILE IMAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profile')
  },
  filename: async (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})
router.patch('/setpicture', upload.single('profileImage'), setProfilePicture)

// GET PROFILE PICTURE
router.get('/getpicture/:id', getProfilePicture)

// REMOVE PROFILE PICTURE
router.get('/removepicture/:id', removeProfilePicture)

// CHANGE NAME
router.patch('/changename', changeName)

// GET ALL FRIENDS
router.post('/allfriends', getFriendsDetail)

// GET USER ID
router.post('/details', getUser)

// FIND FRIENDS
router.post('/getfriends', getFriends)

// SET FRIENDS
router.patch('/setfriends', setFriends)

// REMOVE FRIENDS
router.patch('/removefriends', removeFriends)

module.exports = router
