const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const LogReg = async (req, res) => {
  const { username, password, email } = req.body;

  // Check if all fields are provided
  if (!username || !password || !email) {
      if (!username) {
          return res.status(400).json({ message: 'Username is required' });
      }
      if (!password) {
          return res.status(400).json({ message: 'Password is required' });
      }
      if (!email) {
          return res.status(400).json({ message: 'Email is required' });
      }
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

  // Validate required fields
  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
      // Check if the user exists
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate Access Token
      const accessToken = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '30m' } // 30 minutes
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' } // 7 days
      );

      // Save the refresh token in the user's document
      user.refreshToken = refreshToken;
      await user.save();

      // Send response with tokens
      return res.json({ 
          accessToken, 
          refreshToken, 
          expiresIn: 1800, 
          message: 'Login successful' 
      });
  } catch (err) {
      console.error('Error logging in user:', err.message);
      return res.status(500).json({ message: 'Failed to login user' });
  }
};


// Get User Info
const getUserInfo = async (req, res) => {
  try {
    console.log('Fetching user info...');

    // Access user ID from req.user
    const userId = req.user.userId; // Ensure req.user has userId

    // Find the user by ID in MongoDB
    const user = await UserModel.findById(userId).select('username email'); // Select only the fields you need

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User info retrieved successfully');
    return res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error('Error retrieving user info:', err.message);
    return res.status(500).json({ message: 'Error retrieving user info' });
  }
};

// Refresh Token Endpoint
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Generate a new access token
      const newAccessToken = jwt.sign(
          { userId: decoded.userId, email: decoded.email },
          process.env.JWT_SECRET,
          { expiresIn: '30m' } // 30 minutes
      );

      return res.json({ accessToken: newAccessToken, expiresIn: 1800 });
  } catch (err) {
      console.error('Error refreshing access token:', err.message);
      return res.status(403).json({ message: 'Invalid refresh token' });
  }
};



module.exports = {
  LogReg,
  Log,
  getUserInfo,
  refreshAccessToken, // Add this to exports
};
