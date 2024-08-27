const express = require("express");
const axios = require("axios");
const routes = express.Router();
const Flutterwave = require("flutterwave-node-v3"); // Ensure this is installed
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

// Payment route
const payoutCard = async (req, res) => {
  const {
    amount,
    email,
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    fullname,
    phone_number,
    redirect_url,
  } = req.body;

  const payload = {
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    currency: "NGN", // Set to the correct currency
    amount,
    redirect_url,
    fullname,
    email,
    phone_number,
    tx_ref: "MC-" + Date.now(),
  };

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=card',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during card payment:", error);
    res.status(500).json({ error: "Card payment failed" });
  }
};

// create payment link
const CreateLink = async (req, res) => {
  const { tx_ref, amount, currency, redirect_url, customer, customizations } = req.body;

  const payload = {
    tx_ref,
    amount,
    currency,
    redirect_url,
    customer,
    customizations
  };

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      res.status(200).json({ link: response.data.data.link });
    } else {
      res.status(500).json({ error: response.data.message || 'Error creating payment link' });
    }
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Error creating payment link' });
  }
};

// Webhook route
const Webhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    // Log the webhook data for verification/debugging
    console.log(`Webhook received: tx_ref=${tx_ref}, status=${status}`);

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
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
    console.error("Redirect error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const CreatePayment = async (req, res) => {
  const { amount, email, name, phone_number } = req.body;

  const paymentDetails = {
    tx_ref: `tx_${Date.now()}`,
    amount,
    currency: "NGN",
    redirect_url: "https://bookkapp-backend.vercel.app/flutterwave/payment-callback",
    customer: {
      email,
      name,
      phone_number,
    },
    customizations: {
      title: "Your Payment Title",
    },
    configurations: {
      session_duration: 10,
      max_retry_attempt: 5,
    },
  };

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/charges?type=mobilemoneyghana",
      paymentDetails,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      const paymentLink = response.data.data.link;
      res.status(200).json({ link: paymentLink });
    } else {
      console.error("Error response:", response.data);
      res.status(500).json({ error: response.data.message || "Error creating payment link" });
    }
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: err.response?.data?.message || "Error creating payment link" });
  }
};



const PayCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;

  if (status === "successful") {
    try {
      const verificationResponse = await axios.get(
        `https://api.flutterwave.com/v3/charges/verify_by_id/${transaction_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      const transactionData = verificationResponse.data.data;

      if (transactionData.status === "successful") {
        // Confirm the transaction in your database or perform other actions
        res.send("<h1>Payment Successful</h1>");
      } else {
        res.send("<h1>Payment Failed</h1>");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("<h1>Payment Failed</h1>");
  }
};

const handleChargeResponse = async (req, res) => {
  try {
    // Extract necessary details from the request
    const { tx_ref, amount, account_bank, account_number, currency, email, phone_number, fullname } = req.body;

    // Set up the payload
    const payload = {
      tx_ref,
      amount,
      account_bank,
      account_number,
      currency,
      email,
      phone_number,
      fullname
    };

    // Make the request to Flutterwave
    const response = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=account',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle the response
    if (response.data.status === 'success') {
      const { data } = response.data;
      // Process the successful response, e.g., saving details to the database
      res.status(200).json(data);
    } else {
      res.status(500).json({ error: response.data.message || 'Error initiating charge' });
    }
  } catch (error) {
    console.error('Error handling charge response:', error);
    res.status(500).json({ error: 'Error handling charge response' });
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
