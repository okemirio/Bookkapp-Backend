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
  const payload = {
    card_number: "5531886652142950",
    cvv: "564",
    expiry_month: "09",
    expiry_year: "21",
    currency: "ZMW",
    amount: "100",
    redirect_url: "https://www.google.com",
    fullname: "Gift Banda",
    email: "bandagift42@gmail.com",
    phone_number: "0977560054",
    enckey: process.env.ENCRYPTION_KEY,
    tx_ref: "MC-32444ee--4eerye4euee3rerds4423e43e" // Ensure this is unique per transaction
  };

  try {
    const response = await flw.Charge.card(payload);

    if (response.meta.authorization.mode === 'pin') {
      const payloadWithPin = {
        ...payload,
        authorization: {
          mode: "pin",
          fields: ["pin"],
          pin: 3310
        }
      };
      const reCallCharge = await flw.Charge.card(payloadWithPin);
      const callValidate = await flw.Charge.validate({
        otp: "12345",
        flw_ref: reCallCharge.data.flw_ref
      });
    
      console.log(callValidate);
    }

    if (response.meta.authorization.mode === 'redirect') {
      const url = response.meta.authorization.redirect;
      return res.redirect(url); // Use res.redirect to redirect the user
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error during payout:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

const momo = async (req, res) => {
  const payload = {
    tx_ref: "MC-15852113s09v5050e8",
    amount: "1500",
    currency: "ZMW",
    email: "bandagift42@gmail.com",
    phone_number: "0977560054",
    fullname: "Gift Banda",
    order_id: "URF_MMGH_1585323540079_5981535" // Unique identifier for momo transaction
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
