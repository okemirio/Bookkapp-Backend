const mongoose = require('mongoose');
const Product = require('../models/product');


const addProduct = async (req, res) => {
    const { name, description, price, category, brand, image, ratings } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !brand || !image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

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
};

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

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, category, brand, image, ratings } = req.body;

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

const getAllProducts = async (req, res) => {
    try {
        const productsList = await Product.find({});
        console.log(productsList);
        return res.json(productsList);
    } catch (err) {
        console.error('Error retrieving products:', err.message);
        return res.status(500).json({ message: 'Failed to retrieve products' });
    }
};

const getProducts = async (req, res) => {
    try {
        const { searchTerm } = req.params;

        // Check if searchTerm is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(searchTerm)) {
            const product = await Product.findById(searchTerm);

            if (product) {
                // Return the product if found
                return res.json({ products: [product] });
            } else {
                // Return an error if the product is not found
                return res.status(404).json({ error: 'Product not found' });
            }
        } else {
            // Perform a text-based search if searchTerm is not a valid ObjectId
            const products = await Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            });

            if (products.length > 0) {
                // Return the list of products found
                return res.json({ products });
            } else {
                // Return a message if no products are found
                return res.status(404).json({ error: 'No products found' });
            }
        }
    } catch (err) {
        console.error('Error searching products:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    addProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    getProducts,
};
