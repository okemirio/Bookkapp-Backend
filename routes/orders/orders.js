const express = require('express');
const routes =express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.sendStatus(401); // Unauthorized
    }
  
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  };

routes.post('/Orders/', authenticateToken, async (req, res) => {
    const { placedOn, customer, payments } = req.body;
  
    // Validate all fields
    if (!customer.name || !customer.number || !customer.email || !customer.address || !payments.method || !payments.totalPrice || !payments.status) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const newOrder = new Order({
        placedOn: Date.now(), // You are overwriting placedOn, no need to extract it from req.body
        customer,
        payments,
      });
  
      await newOrder.save();
      res.status(200).send({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
      console.error('Error placing order:', err.message);
      res.status(500).json({ message: 'Failed to place order' });
    }
  });

  module.exports = routes;

// Start the server