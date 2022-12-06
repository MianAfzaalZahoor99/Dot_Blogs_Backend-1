const express = require('express')
const multer = require('multer')

const router = express.Router()

// IMPORTING CONTROLLER FUNCTIONS
const {
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
} = require('../controllers/userControllers')
const requireAuth = require('../middleware/requireAuth')

// USER LOGIN REQUEST
router.post('/login', loginUser)

// GET USER NAME
router.post('/name', getName)

// RESET PASSWORD LINK
router.post('/resetpassword', resetPasswordLink)

// RESET PASSWORD
router.patch('/resetpassword', resetPassword)

// USER SIGNUP REQUEST
router.post('/signup', signupUser)

// USER STATUS
router.post('/userstatus', userStatus)

// >>----------------USING THE AUTHENTICATION----------------<<
router.use(requireAuth)

// CHANGE NAME
router.patch('/changename', changeName)

// CHANGE PASSWORD
router.patch('/changepassword', changePassword)

// FIND FRIENDS
router.post('/getfriends', getFriends)

// GET ALL FRIENDS
router.post('/allfriends', getFriendsDetail)

// GET NOTIFICATIONS
router.post('/notifications', getNotifications)

// GET PROFILE PICTURE
router.get('/getpicture/:id', getProfilePicture)

// GET USER ID
router.post('/details', getUser)

// REMOVE FRIENDS
router.patch('/removefriends', removeFriends)

// REMOVE PROFILE PICTURE
router.get('/removepicture/:id', removeProfilePicture)

// SET FRIENDS
router.patch('/setfriends', setFriends)

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

module.exports = router
