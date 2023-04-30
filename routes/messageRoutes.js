const express = require("express");
const Event=require('../model/event');
const mongoose = require('mongoose');
const User = require('../model/user');
const Club = require('../model/club');
const Message = require("../model/messageModel");

const Chat = require("../model/chatModel");





const {
  allMessages,
 
} = require("../controllers/messageControllers");

const router = express.Router();

router.route("/:chatId").get(allMessages);
router.post("/:id", async (req, res) => {
    const { content, chatId } = req.body;
    const Id = req.params.id;
    const user = await User.findOne({ _id: Id });
  
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    var newMessage = {
      sender: user._id,
      content: content,
      chat: chatId,
    };
  
    try {
      var message = await Message.create(newMessage);
  
      message = await message.populate("sender", "fname profilePic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "fname profilePic email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

module.exports = router;
