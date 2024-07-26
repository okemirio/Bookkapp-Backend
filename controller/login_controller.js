const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const LogReg = async (req, res) => {
    const { username, password, email } = req.body;
  
    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }
  
    try {
      // Check if the email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user instance with the hashed password
      const newUser = new UserModel({ username, password: hashedPassword, email });
  
      // Save the user to the database
      await newUser.save();
  
      return res.json({ message: 'Registration successful' });
    } catch (err) {
      console.error('Error saving user:', err.message);
      return res.status(500).json({ message: 'Failed to register user' });
    }
  }

const Log = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`Login attempt for email: ${email}`);
    
    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    
    
    console.log('Login successful, token generated');
    return res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    return res.status(500).json({ message: 'Failed to login user' });
  }
}


  module.exports ={
   LogReg,
   Log
  }