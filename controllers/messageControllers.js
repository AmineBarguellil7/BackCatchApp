const asyncHandler = require("express-async-handler");
const Message = require("../model/messageModel");
const User = require("../model/user");
const Chat = require("../model/chatModel");

//////get messages c///////////////
const allMessages = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "fname profilePic email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });
///////////////send message controller////////////
  
  module.exports = { allMessages };
