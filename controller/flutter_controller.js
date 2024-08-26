const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Flutterwave = require('flutterwave-node-v3'); // Ensure this is installed
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401); // Unauthorized if no token
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden if token is invalid
    req.user = user;
    next();
  });
};

// Payment route
const payoutCard = async (req, res) => {
  const { amount, email, card_number, cvv, expiry_month, expiry_year, fullname, phone_number, redirect_url } = req.body;

  const payload = {
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    currency: "ZMW",
    amount,
    redirect_url, // Use the provided redirect URL
    fullname,
    email,
    phone_number,
    enckey: process.env.ENCRYPTION_KEY,
    tx_ref: "MC-" + Date.now() // Ensure this is unique per transaction
  };

  try {
    const response = await flw.Charge.card(payload);
    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
};

const momo = async (req, res) => {
  const { amount, email, phone_number, fullname, order_id, redirect_url } = req.body;

  const payload = {
    tx_ref: "MC-" + Date.now(),
    amount,
    currency: "ZMW",
    email,
    phone_number,
    fullname,
    order_id,
    redirect_url // Use the provided redirect URL
  };

  try {
    const response = await flw.MobileMoney.zambia(payload);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error during mobile money payment:', error);
    res.status(500).json({ error: 'Mobile money payment failed' });
  }
};

// Webhook route
const Webhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    // Log the webhook data for verification/debugging
    console.log(`Webhook received: tx_ref=${tx_ref}, status=${status}`);

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
  payoutCard,
  Webhook,
  redirect,
  momo,
};
