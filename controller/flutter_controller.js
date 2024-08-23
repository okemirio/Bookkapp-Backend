const express = require('express');
const routes = express.Router();
const axios = require('axios'); // Use axios for API calls if not using an SDK
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user;
    next();
  });
};

// Payment route
const payout = async (req, res) => {
  try {
    const { amount, email, phone_number } = req.body;

    // Prepare payment data
    const paymentData = {
      tx_ref: `tx_${Date.now()}`,  // Unique transaction reference
      amount,
      currency: 'USD',
      email,
      phone_number,
      redirect_url: 'https://yourdomain.com/payment-confirmation'  // URL to redirect after payment
    };

    // Call Flutterwave charge API
    const response = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=mobilemoneyuganda',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data); // Send response back to client
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Webhook route
const Webhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
  
    // Handle status update logic (e.g., log or update database)
    console.log(`Webhook received: tx_ref=${tx_ref}, status=${status}`);
  
    // Verify the webhook request if necessary
    // Example: Verify the signature to ensure it’s from Flutterwave
  
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Redirect route
const redirect = (req, res) => {
  try {
    const { tx_ref, status } = req.query;
  
    // Handle redirect status update
    console.log(`Redirect received: tx_ref=${tx_ref}, status=${status}`);
  
    if (status === 'successful') {
      res.send('<h1>Payment Successful</h1>');
    } else {
      res.send('<h1>Payment Failed</h1>');
    }
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports = {
  payout,
  Webhook,
  redirect,
};

