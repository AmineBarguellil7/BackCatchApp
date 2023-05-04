var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors =  require('cors')




var messageRoutes = require("./routes/messageRoutes");

var eventRouter = require('./routes/events');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var facebookRouter = require('./routes/facebook');
var clubsRouter=require('./routes/clubs');
var paymentRouter=require('./routes/payment');
var payEventRouter=require('./routes/PaymentEvent')
var chatRouter = require('./routes/chatRoutes');
var mongoose = require('mongoose');
var config = require('./database/mongodb');

mongoose.connect(config.mongo.uri);

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/clubs',clubsRouter);
app.use('/auth/facebook', facebookRouter);
app.use('/api', paymentRouter);
app.use('/events',eventRouter);
app.use('/chat',chatRouter);
app.use('/payevent',payEventRouter);
app.use("/message", messageRoutes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});



const http = require('http').Server(app);
const io = require('socket.io')(http, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});










module.exports = app;
