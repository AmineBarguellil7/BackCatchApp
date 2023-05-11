const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String,
      required: true,
      unique: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, 
      ref: "users" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    organizer:{ type: mongoose.Schema.Types.ObjectId, ref: "clubs" }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
