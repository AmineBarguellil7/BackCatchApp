var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Club=new Schema({
    name: {
      type: String,
      required: true
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
    created_at: { type: Date, default: Date.now }
  });


  module.exports = mongoose.model('clubs', Club);