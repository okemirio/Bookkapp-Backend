const express = require('express');
const routes =express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { LogReg, Log} = require('../../controller/login_controller.js');
const UserModel = require('../../models/user.js');



// Authentication middleware
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
  // Define user schema and model


routes.post('/register', LogReg)
  
  // Login route
routes.post('/login', Log)

  module.exports = routes;