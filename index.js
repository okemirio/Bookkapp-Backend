const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // Required for serving static files
const UserModel = require("./models/user");
const products = require("./models/product");
const Cart = require("./models/cart");
const Order = require("./models/orders");
const authRoutes = require("./routes/auth/index");
const cartsRoutes = require("./routes/carts/carts");
const productsRoutes = require("./routes/products/products");
const OrdersRoutes = require("./routes/orders/orders");
const FlutterWaveRoutes = require("./routes/flutterwave/index");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // Use the environment variable for the port

// Enable CORS for cross-origin requests
const corsOptions = {
  origin: ["http://localhost:3000", "https://bookstore-alpha-silk.vercel.app"], // Allow both local and deployed frontend
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build'))); // Adjust path as needed

// MongoDB Atlas connection URI from environment variables
const mongoURI = process.env.MONGO_URI;

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

// API routes
app.use("/auth", authRoutes);
app.use("/carts", cartsRoutes);
app.use("/products", productsRoutes);
app.use("/orders", OrdersRoutes);
app.use("/flutterwave", FlutterWaveRoutes);

// Serve the React app for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html')); // Adjust path as needed
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the app for Vercel
module.exports = app;
