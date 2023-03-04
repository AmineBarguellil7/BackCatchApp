var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../model/user');
const secretKey = process.env.JWT_SECRET_KEY || 'mysecretkey';
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup', async (req, res) => {
  const { fname, lname, birthdate, phone, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const user = new User({
    fname,
    lname,
    birthdate,
    phone,
    email,
    password: hashedPassword, // store the hashed password in the database
  });

  try {
    // Save the user to the database
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
////////////////////////////////////////////
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await mongoose.connection.collection('users').findOne({ email });

  // Check if user exists and password is correct
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
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

//////////////////////////
router.put('/update/:id', async (req, res) => {
  const { fname, lname, birthdate, phone } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID
    const user = await mongoose.connection.collection('users').findOne({ _id: userId });

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
    await mongoose.connection.collection('users').updateOne({ _id: userId }, { $set: user });

    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router;
