require('dotenv').config()

// ALL THE REQUIRED MODULES
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()

// IMPORTING ROUTES
const userRouter = require('./routes/user')
const postRouter = require('./routes/posts')
const commentRouter = require('./routes/comments')
const chatRouter = require('./routes/chats')
const paymentRouter = require('./routes/payment')

// CHECKING CONNECTION
const http = require('http').createServer(app)
const socketIO = require('socket.io')(http, {
  cors: {
    origin: process.env.CLIENT_POST
  }
})

app.use(express.json())
app.use(cors())

// PAYMENT REQUIREMENTS
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// SETTING THE SOCKET
let users = []
socketIO.on('connection', (socket) => {

  socket.on('joinRoom', (data) => {
    socket.join(data)
  })

  socket.on('newUser', (data) => {
    users.push(data)
    users = [... new Set(users)]
    socketIO.emit('userStatus', users);
  })

  socket.on('sendMessage', (data) => {
    socketIO.to(data.room).emit('messageReceived', data.chats)
  })

  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit('userStatus', users);
    socket.disconnect();
  })
})

// CONNECTION TO DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // http.listen(process.env.PORT_NUMBER)
  })
  .catch(error => console.log('COULD NOT CONNECT TO DATABASE'))

// ALL MENTIONED ROUTES
app.use('/user', userRouter)
app.use('/posts', postRouter)
app.use('/comments', commentRouter)
app.use('/chat', chatRouter)
app.use('/payment', paymentRouter)
