const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const products = require('./models/product');
const Cart = require('./models/cart'); 
const Order = require('./models/orders');
const cors = require('cors')
const UserModel = require('./models/user');
const authRoutes =require('./routes/auth/index');
const cartsRoutes = require('./routes/carts/carts');
const productsRoutes = require('./routes/products/products');
const OrdersRoutes = require('./routes/orders/orders');



// Enable CORS for cross-origin requests
const corsOptions = {
  origin: 'http://localhost:3000'
 }

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 5000;
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());  

// MongoDB Atlas connection URI from environment variables
const mongoURI = process.env.MONGO_URI;

console.log(mongoURI)
// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    
  });



// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use("/auth", authRoutes)
app.use("/carts", cartsRoutes)
app.use("/products", productsRoutes)
app.use("/orders", OrdersRoutes)


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

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.send('This is the dashboard');
});






 


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
