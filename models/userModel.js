const bcrypt = require('bcrypt')
const validator = require('validator')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  premium: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  friends: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }],
  profilephoto: {
    data: Buffer,
    contentType: String
  },
  notifications: [{
    type: String
  }]
})

// STATIC SIGNUP METHOD
userSchema.statics.signup = async function (name, email, password) {
  // VALIDATION
  if(!name || !email || !password)
  {
    throw Error('ALL FIELDS MUST BE FILLED')
  }
  if (!validator.isEmail(email))
  {
    throw Error('EMAIL IS INVALID')
  }
  if(!validator.isStrongPassword(password))
  {
    throw Error('Password should have at least 7 characters(Uppercase, Lowercase and Any Character)')
  }

  const exists = await this.findOne({email})

  if (exists)
  {
    throw Error('EMAIL IS ALREADY IN USE')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({name, email, password: hash})

  return user
}

// STATIC LOGIN METHOD
userSchema.statics.login = async function (email, password) {
  // VALIDATION
  if(!email || !password)
  {
    throw Error('ALL FIELDS MUST BE FILLED')
  }

  const user = await this.findOne({email})

  if (!user)
  {
    throw Error('INCORRECT EMAIL')
  }

  const match = await bcrypt.compare(password, user.password)

  if (!match)
  {
    throw Error('INCORRECT PASSWORD')
  }

  return user
}

module.exports = mongoose.model('User', userSchema)
