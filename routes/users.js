var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../model/user");

const secretKey = process.env.JWT_SECRET_KEY || "mysecretkey";
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

router.post("/signup", async (req, res) => {
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
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
////////////////////////////////////////////
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await mongoose.connection.collection("users").findOne({ email });

  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" });

  // Send response with token
  res.json( {token} );
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
router.put("/update/:id", verifyToken, async (req, res) => {
  const { fname, lname,email, birthdate, phone } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID
    const user = await User.findOne({ _id: userId });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    user.fname = fname || user.fname;
    user.lname = lname || user.lname;
    user.email = email || user.email;
    user.birthdate = birthdate || user.birthdate;
    user.phone = phone || user.phone;

    // Save updated user to database
    await user.save();

    res.json({ message: "User updated" });
  } catch (err) {
    console.error("Error updating user", err);
    res.status(500).json({ message: "Internal server error" });
  }
  ///////////////////////////
  router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
      const userId = req.params.id;
      const deletedUser = await User.findOneAndDelete({ _id: userId });

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted" });
    } catch (err) {
      console.error("Error deleting user", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});


router.put('/:id', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  const userId = req.params.id;
  console.log(oldPassword);
  console.log(newPassword);
  

  try {
    // Find user by ID
    const user = await User.findOne({ _id: userId });

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password matches with stored password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    console.log("oldPassword:", oldPassword);
    console.log("user.password:", user.password);
    console.log("isOldPasswordCorrect:", isOldPasswordCorrect);
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

module.exports = router;
