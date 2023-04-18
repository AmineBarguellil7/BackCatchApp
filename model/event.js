const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Event = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  numPlaces: {
    type: Number,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clubs',
    required:true
  },
  img:{
    type:String,
    required:true
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
});

module.exports = mongoose.model('events', Event);

