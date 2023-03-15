var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({

    fname: {
        type: String,
        
      },
      lname: {
        type: String,
        
      },
      birthdate: {
        type: Date,
       
      },
      phone: {
        type: Number,
       
      },
      email: {
        type: String,
        
        unique: true,
      },
      password: {
        type: String
       
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isActivated: {
        type: Boolean,
        default: false,
      },
      verificationToken: 
        {type:String},
      isBanned: {
        type:Boolean,
        default:false
      },
      profilePic: {
        type: String
      },
      provider:{
        type: String
      }

      
});

module.exports = mongoose.model('users', User);