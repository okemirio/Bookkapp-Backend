const express = require("express");
const axios = require("axios");
const Flutterwave = require("flutterwave-node-v3"); // Ensure this is installed
const routes = express.Router();
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

// Helper function to handle API requests
const makeFlutterwaveRequest = async (url, method, payload) => {
  try {
    const response = await axios({
      method,
      url,
      data: payload,
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during Flutterwave request:", error);
    throw new Error(error.response?.data?.message || "Internal Server Error");
  }
};

// Payment route
const payoutCard = async (req, res) => {
  const {
    amount, email, card_number, cvv, expiry_month,
    expiry_year, fullname, phone_number, redirect_url
  } = req.body;

  const payload = {
    card_number, cvv, expiry_month, expiry_year,
    currency: "NGN", amount, redirect_url, fullname,
    email, phone_number, tx_ref: "MC-" + Date.now(),
  };

  try {
    const data = await makeFlutterwaveRequest(
      'https://api.flutterwave.com/v3/charges?type=card',
      'post',
      payload
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create payment link
const CreateLink = async (req, res) => {
  const { tx_ref, amount, currency, redirect_url, customer, customizations } = req.body;

  const payload = {
    tx_ref, amount, currency, redirect_url, customer, customizations
  };

  try {
    const data = await makeFlutterwaveRequest(
      'https://api.flutterwave.com/v3/payments',
      'post',
      payload
    );
    if (data.status === 'success') {
      res.status(200).json({ link: data.data.link });
    } else {
      res.status(500).json({ error: data.message || 'Error creating payment link' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Webhook route
const Webhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    console.log(`Webhook received: tx_ref=${tx_ref}, status=${status}`);
    res.status(200).send("Webhook received");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// Redirect route
const redirect = (req, res) => {
  try {
    const { tx_ref, status } = req.query;
    console.log(`Redirect received: tx_ref=${tx_ref}, status=${status}`);
    if (status === "successful") {
      res.send("<h1>Payment Successful</h1>");
    } else {
      res.send("<h1>Payment Failed</h1>");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// Create payment
const CreatePayment = async (req, res) => {
  const { amount, email, name, phone_number } = req.body;

  const paymentDetails = {
    tx_ref: `tx_${Date.now()}`,
    amount,
    currency: "NGN",
    redirect_url: "https://bookkapp-backend.vercel.app/flutterwave/payment-callback",
    customer: { email, name, phone_number },
    customizations: { title: "Your Payment Title" },
    configurations: { session_duration: 10, max_retry_attempt: 5 },
  };

  try {
    const data = await makeFlutterwaveRequest(
      "https://api.flutterwave.com/v3/charges?type=mobilemoneyghana",
      'post',
      paymentDetails
    );
    if (data.status === "success") {
      res.status(200).json({ link: data.data.link });
    } else {
      res.status(500).json({ error: data.message || "Error creating payment link" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Payment callback
const PayCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;

  if (status === "successful") {
    try {
      const data = await makeFlutterwaveRequest(
        `https://api.flutterwave.com/v3/charges/verify_by_id/${transaction_id}`,
        'get'
      );
      if (data.data.status === "successful") {
        // Confirm the transaction in your database or perform other actions
        res.send("<h1>Payment Successful</h1>");
      } else {
        res.send("<h1>Payment Failed</h1>");
      }
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("<h1>Payment Failed</h1>");
  }
};

// Handle charge response for account-based payments
const handleChargeResponse = async (req, res) => {
  try {
    const { tx_ref, amount, account_bank, account_number, currency, email, phone_number, fullname } = req.body;

    const payload = {
      tx_ref, amount, account_bank, account_number, currency,
      email, phone_number, fullname
    };

    const data = await makeFlutterwaveRequest(
      'https://api.flutterwave.com/v3/charges?type=account',
      'post',
      payload
    );

    if (data.status === 'success') {
      res.status(200).json(data.data);
    } else {
      res.status(500).json({ error: data.message || 'Error initiating charge' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  payoutCard,
  Webhook,
  redirect,
  CreateLink,
  CreatePayment,
  PayCallback,
  handleChargeResponse
};

