const express = require('express');
const routes = express.Router();
const Product = require('../../models/product');
const {
    addProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    getProducts,
} = require('../../controller/product_controller');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

routes.post('/products/add', authenticateToken, addProduct);
routes.delete('/products/:id', authenticateToken, deleteProduct);
routes.put('/products/:productId', authenticateToken, updateProduct);
routes.get('/products', authenticateToken, getAllProducts);
routes.get('/products/search/:searchTerm', authenticateToken, getProducts)

module.exports = routes;
