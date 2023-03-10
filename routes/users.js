var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../model/user');
const crypto = require('crypto');

const secretKey = process.env.JWT_SECRET_KEY || 'mysecretkey';
/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);

  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/////////////////////////////////////////////////////////////////////////////////////signup////////////////
router.post('/signup', async (req, res) => {
  const { fname, lname, birthdate, phone, email, password } = req.body;
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomCode = "";
  for (let i = 0; i < 25; i++) {
    randomCode += characters[Math.floor(Math.random() * characters.length)];
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user with email verification token
  const user = new User({
    fname,
    lname,
    birthdate,
    phone,
    email,
    password: hashedPassword,
    verificationToken: crypto.randomBytes(20).toString('hex'),
    
  });

  try {
    // Save the user to the database
    await user.save();

    // Send verification email
    const mailOptions = {
      from: 'hkyosri@gmail.com',
      to: user.email,
      subject: 'Verify your email address',
      text: `Please click on this link to verify your email address: http://localhost:3000/users/verify-email/${user.verificationToken}`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
////////////////////////////////////////////signin//////////////////////////////
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await mongoose.connection.collection('users').findOne({ email });

  // Check if user exists and password is correct
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  ////////////////ckeck if verified///////////
  if (user.isActivated==false){
    return res.status(401).json({ message: 'please verify your email to verify your account' });
  }
  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

  // Send response with token
  res.json({ token });
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
//////////////////////////////////////get by id/////////////////////////////////////
router.get('/:id',  async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error getting user', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//////////////////////////update//////////////////////////
router.put('/update/:id', verifyToken, async (req, res) => {
  const { fname, lname, birthdate, phone } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID
    const user = await User.findOne({ _id: userId });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.fname = fname || user.fname;
    user.lname = lname || user.lname;
    user.birthdate = birthdate || user.birthdate;
    user.phone = phone || user.phone;

    // Save updated user to database
    await user.save();

    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  ///////////////////////////
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const userId = req.params.id;
      const deletedUser = await User.findOneAndDelete({ _id: userId });
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'User deleted' });
    } catch (err) {
      console.error('Error deleting user', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


//////////////////////update password////////////////////
router.put('/:id', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID
    const user = await User.findOne({ _id: userId });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password matches with stored password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedNewPassword;

    // Save updated user to database
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Error updating password', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hkyosri@gmail.com',
    pass: 'ujglsqtoifiomukc'
  }
});

//////////////////////////////////is verified email
router.get('/verify-email/:verificationToken', async (req, res) => {
  const token = req.params.verificationToken;

  try {
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }

    // Update user's isVerified flag
    user.isActivated = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email address verified' });
  } catch (err) {
    console.error('Error verifying email address', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
////////////forget password///////////
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // generate a new random password
    const newPassword = Math.random().toString(36).slice(-8);

    // update the user's password with the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // send the new password to the user's email
    const mailOptions = {
      from: "hkyosri@gmail.com",
      to: email,
      subject: 'Your New Password',
      text: `Dear user, note that after your request to recover password your new one will be
      Password : ${newPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Password updated and email sent successfully' });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;
