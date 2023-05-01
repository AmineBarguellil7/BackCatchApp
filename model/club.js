var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Club=new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    address: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    logo: {
      type: String,
    },
    domain: { type: String},
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }],
    events: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'events'
    }],
    statistics: {
      membersCount: {
        type: Number,
        default: 0
      },
      budget: {
        type: Number,
        default: 0
      }
    },
    contact: {
      email: {
        type: String,
      },
      phone: {
        type: String,
      }
    },
    socialLinks: {
      facebook: {
        type: String
      },
      twitter: {
        type: String
      },
      instagram: {
        type: String
      }
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    created_at: { type: Date, default: Date.now },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }],
    likeCount: {
      type: Number,
      default: 0
    },
    dislikeCount: {
      type: Number,
      default: 0
    },
    dislikes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }]   
  });


  module.exports = mongoose.model('clubs', Club);