const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const products = require("./models/product");
const Cart = require("./models/cart");
const Order = require("./models/orders");
const cors = require("cors");
const UserModel = require("./models/user");
const authRoutes = require("./routes/auth/index");
const cartsRoutes = require("./routes/carts/carts");
const productsRoutes = require("./routes/products/products");
const OrdersRoutes = require("./routes/orders/orders");

// Enable CORS for cross-origin requests
const corsOptions = {
  origin: "http://localhost:3000",
};

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 'https://bookstore-alpha-silk.vercel.app';
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB Atlas connection URI from environment variables
const mongoURI = process.env.MONGO_URI || "your_fallback_mongo_uri";


console.log(mongoURI);
// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.use("/auth", authRoutes);
app.use("/carts", cartsRoutes);
app.use("/products", productsRoutes);
app.use("/orders", OrdersRoutes);

app.get('/dashboard', (req, res) => {
  res.send('This is the dashboard');
});
app.get('/', (req, res) => {
  res.send('This is the LOGIN');

});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
