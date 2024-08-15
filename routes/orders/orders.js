const express = require('express');
const routes = express.Router();
const jwt = require('jsonwebtoken');
const { addOrder, getOrder,getAllOrder } = require('../../controller/order_controller');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token required for authentication' }); // Unauthorized
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' }); // Forbidden
    }
    req.user = user; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  });
};

// Handle checkout form submission
routes.post('/checkout', authenticateToken, addOrder);

// Get order details
routes.get('/orders/:id', authenticateToken, getOrder);

routes.get('/orders', authenticateToken, getAllOrder);

module.exports = routes; // Export the router to be used in the main app file
