const express = require("express");
const User = require('../model/user');
const Message = require("../model/messageModel");

const Chat = require("../model/chatModel");





const {
  allMessages,
 
} = require("../controllers/messageControllers");

const router = express.Router();
/////////////////affiche lmsget l9dom "lfonction fl controller"///////
router.route("/:chatId").get(allMessages);




///////////////tb3ath msg//////////
router.post("/:id/:chatId", async (req, res) => {
    const chatId=req.params.chatId;
    const { content } = req.body;
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
      //message = await message.populate("sender", "fname profilePic");
      //message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "fname profilePic email",
      });
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

module.exports = router;
