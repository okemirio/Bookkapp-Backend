const Flutterwave = require('flutterwave-node-v3'); // Import the Flutterwave SDK
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY); // Initialize Flutterwave with your keys
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

// Payment routes
const payoutCard = async (req, res) => {
  const payload = {
    card_number: "5531886652142950",
    cvv: "564",
    expiry_month: "09",
    expiry_year: "21",
    currency: "ZMW",
    amount: "100",
    redirect_url: "https://www.google.com", // Replace with your redirect URL
    fullname: "Gift Banda",
    email: "bandagift42@gmail.com",
    phone_number: "0977560054",
    enckey: process.env.ENCRYPTION_KEY,
    tx_ref: "MC-32444ee--4eerye4euee3rerds4423e43e"
  };

  try {
    const response = await flw.Charge.card(payload);
    console.log(response);

    if (response.meta.authorization.mode === 'pin') {
      let payload2 = { ...payload };
      payload2.authorization = {
        mode: "pin",
        fields: ["pin"],
        pin: 3310
      };
      const reCallCharge = await flw.Charge.card(payload2);
      const callValidate = await flw.Charge.validate({
        otp: "12345",
        flw_ref: reCallCharge.data.flw_ref
      });
      // console.log(callValidate); // Uncomment for debugging
    }

    if (response.meta.authorization.mode === 'redirect') {
      const url = response.meta.authorization.redirect;
      open(url);
    }

    res.status(200).json(response);
  } catch (error) {
    console.log('Card payment error:', error);
    res.status(500).json({ error: 'Card payment failed' });
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
    open(response.meta.authorization.redirect);
    res.status(200).json(response);
  } catch (error) {
    console.log('Mobile money payment error:', error);
    res.status(500).json({ error: 'Mobile money payment failed' });
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
  payoutCard,
  Webhook,
  redirect,
  momo,
};
