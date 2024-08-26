const express = require('express');
const routes = express.Router();
const flutterwave = require('../../config/flutterwave');
const {payoutCard,Webhook,redirect,momo } = require('../../controller/flutter_controller');
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

  routes.post('/payoutCard', authenticateToken, payoutCard);
  routes.post('/webhook',authenticateToken, Webhook);
routes.get('/redirect', authenticateToken, redirect);
routes.post('/momo', authenticateToken, momo);

module.exports = routes;