const mongoose = require('mongoose');
const UserModel = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register User
const LogReg = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({ username, password: hashedPassword, email });
    await newUser.save();

    return res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error saving user:', err.message);
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

// Login User
const Log = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

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
    const userId = req.user.userId;

    const user = await UserModel.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    return res.json({ accessToken: newAccessToken, expiresIn: 1800 });
  } catch (err) {
    console.error('Error refreshing access token:', err.message);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Send Password Reset Link
const sendPasswordResetCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email with reset code
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Code',
      html: `
        <p>You requested a password reset</p>
        <p>Your reset code is <b>${resetCode}</b></p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Failed to send reset email' });
      } else {
        return res.status(200).json({ message: 'Password reset code sent successfully' });
      }
    });
  } catch (err) {
    console.error('Error sending password reset code:', err.message);
    return res.status(500).json({ message: 'Failed to send reset code' });
  }
};


// Reset Password
const resetPassword =  async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({
      email,
      resetCode: code,
      resetCodeExpiration: { $gt: Date.now() } // Ensure code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully', success: true });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

module.exports = {
  LogReg,
  Log,
  getUserInfo,
  refreshAccessToken,
  resetPassword,
  sendPasswordResetCode
};
