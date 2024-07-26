const express = require('express');
const routes =express.Router();
const products = require('../../models/product');
const jwt = require('jsonwebtoken');


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

routes.post('/products/add', authenticateToken, async (req, res) => {
    const { name, description, price, category, brand, image, ratings } = req.body;
  
    // Validate required fields
    if (!name || !description || !price || !category || !brand || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Create a new product instance
      const newProduct = new products({
        name,
        description,
        price,
        category,
        brand,
        image,
        ratings: ratings || 0  // Default ratings to 0 if not provided
      });
  
      // Save the product to the database
      await newProduct.save();
  
      return res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (err) {
      console.error('Error adding product:', err.message);
      return res.status(500).json({ message: 'Failed to add product' });
    }
  });
  // Delete route for products
  routes.delete('/products/:id', authenticateToken, async (req, res) => {
    const { id: productId } = req.params; // Extract productId from req.params
  
    try {
      // Attempt to find and delete the product by ID
      const product = await products.findByIdAndDelete(productId);
  
      // If product is not found, return 404
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Product successfully deleted
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error deleting product:', err.message);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  });
  
  //update Route
  routes.put('/products/:productId', authenticateToken, async (req, res) => {
  
    try{
      const { productId } = req.params; // Extract productId from URL params
      const { name, description, price, category, brand, image, ratings } = req.body;
      
       const updatedProduct = await products.findByIdAndUpdate(
        productId,
        { name, description, price, category, brand, image, ratings },
        { new: true }
      );
   if (!updatedProduct) {
    return res.status(404).send.json({ message: "product not found" });
   }
   return res.status(200).json({ message: updatedProduct});
  
    }catch(err) {
      res.status(400).json({ error: err.message });
    }
  });
  // READ 
  // GET all products
  routes.get('/products', authenticateToken, async (req, res) => {
    try {
      const productsList = await products.find({});
      console.log(productsList);
      return res.json(productsList);
    } catch (err) {
      console.error('Error retrieving products:', err.message);
      return res.status(500).json({ message: 'Failed to retrieve products' });
    }
  });
  
  
  // Get product by id
  routes.get('/products/:id', authenticateToken, async (req, res) => {
    try {
      const { id: productId } = req.params; // Extract productId from URL params
      const product = await products.findById(productId); // Use findById with _id
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  
  module.exports = routes;