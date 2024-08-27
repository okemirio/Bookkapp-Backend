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
    currency: "ZMW",
    amount,
    redirect_url, // Use the provided redirect URL
    fullname,
    email,
    phone_number,
    enckey: process.env.ENCRYPTION_KEY,
    tx_ref: "MC-" + Date.now(), // Ensure this is unique per transaction
  };

  try {
    const response = await flw.Charge.card(payload);
    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
};

const momo = async (req, res) => {
  const { amount, email, phone_number, fullname, order_id, redirect_url } =
    req.body;

  const payload = {
    tx_ref: "MC-" + Date.now(),
    amount,
    currency: "ZMW",
    email,
    phone_number,
    fullname,
    order_id,
    redirect_url, // Use the provided redirect URL
  };

  try {
    const response = await flw.MobileMoney.zambia(payload);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error during mobile money payment:", error);
    res.status(500).json({ error: "Mobile money payment failed" });
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
    tx_ref: `tx_${Date.now()}`, // Unique transaction reference
    amount,
    currency: "NGN",
    redirect_url: "https://yourdomain.com/payment-callback", // URL to redirect after payment
    customer: {
      email,
      name,
      phone_number,
    },
    customizations: {
      title: "Your Payment Title",
    },
    configurations: {
      session_duration: 10, // Session timeout in minutes
      max_retry_attempt: 5, // Max retries
    },
  };

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/charges?type=mobilemoneyghana",
      paymentDetails,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      const paymentLink = response.data.data.link;
      res.status(200).json({ link: paymentLink });
    } else {
      res.status(500).json({ error: "Error creating payment link" });
    }
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Error creating payment link" });
  }
};

const PayCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;

  if (status === "successful") {
    try {
      // Verify the transaction with Flutterwave
      const verificationResponse = await axios.get(
        `https://api.flutterwave.com/v3/charges/verify_by_id/${transaction_id}`,
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
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

module.exports = {
  payoutCard,
  Webhook,
  redirect,
  momo,
  CreatePayment,
  PayCallback,
};
