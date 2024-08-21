// Import required modules
const mongoose = require('mongoose');
const Product = require('../models/product');
const { check, validationResult } = require('express-validator');

// Add a new product to the database
const addProduct = [
    // Validation rules
    check('name').notEmpty().withMessage('Name is required'),
    check('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    check('category').notEmpty().withMessage('Category is required'),
    check('brand').notEmpty().withMessage('Brand is required'),
    check('image').notEmpty().withMessage('Image URL is required'),

    // Controller logic
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, price, category, brand, image, ratings } = req.body;

        try {
            // Create a new product instance
            const newProduct = new Product({
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
    }
];

// Delete a product by ID
const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;

    try {
        // Attempt to find and delete the product by ID
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        return res.status(500).json({ message: 'Failed to delete product' });
    }
};

// Update a product by ID
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, category, brand, image, ratings } = req.body;

        // Find the product by ID and update it with new data
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, description, price, category, brand, image, ratings },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Get all products with pagination
const getAllProducts = async (req, res) => {
    // Default values for pagination
    const { page = 1, limit = 10 } = req.query;

    try {
        // Find all products, limit the number of results, and skip according to the page number
        const productsList = await Product.find({})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Count the total number of products
        const count = await Product.countDocuments();

        // Return products along with pagination info
        return res.json({
            products: productsList,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error retrieving products:', err.message);
        return res.status(500).json({ message: 'Failed to retrieve products' });
    }
};

// Get a single product by ID
const getProducts = async (req, res) => {
    try {
        const { name } = req.query; // Extract the product name from the query parameters

        // Search for a product by name (case-insensitive)
        const product = await Product.findOne({ 
            name: { $regex: name, $options: "i" } 
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
    
// Export all functions to use in routes
module.exports = {
    addProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    getProducts,
};
