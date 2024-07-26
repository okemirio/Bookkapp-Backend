const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product');

const addCart =  async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;
    
    try {
      // Find the product by productId
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Find the cart item based on userId and productId
      let cartItem = await Cart.findOne({ userId: userId, productId: product._id });
      console.log(cartItem)
      if (cartItem) {
        // If cart item exists, increment its quantity
        cartItem.quantity++;
        await cartItem.save();
        return res.json({ message: 'Product quantity updated in cart' });
      } else {
        // If cart item doesn't exist, create a new cart item with quantity 1
        const newCartItem = new Cart({ userId: userId, productId: product._id, quantity: 1 });
        const cart = await newCartItem.save();
        console.log('cart item', cart);
        return res.json({ message: 'Product added to cart' });
      }
    } catch (err) {
      console.error('Error adding to cart:', err.message);
      res.status(500).json({ error: 'Failed to add to cart' });
    }
  }
const deleteCart =async (req, res) => {
    const { productId } = req.params; // Extract productId from URL params
  
    try {
      // Find and delete the cart item with matching productId
      const result = await Cart.findOneAndDelete({ productId });
  
      // If result is null, item not found in cart
      if (!result) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
  
      // Product successfully removed from cart
      return res.status(200).json({ message: 'Product removed from cart' });
    } catch (err) {
      console.error('Error removing from cart:', err.message);
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }
  }
  
const emptyCart =async (req, res) => {
    const userId = req.user._id; // Get current user's ID from authentication token
  
    try {
      // Remove all items from the cart for the current user
      const deleteResult = await Cart.deleteMany({ userId: userId });
  
      console.log(deleteResult)
  
      if (!deleteResult) {
        return res.status(500).json({ error: 'Failed to remove cart items' });
      }
  
      return res.status(200).json({ message: 'All items removed successfully from cart' });
    } catch (err) {
      console.error('Error removing cart items:', err.message);
      return res.status(500).json({ error: 'Failed to remove cart items' });
    }
  }
  
  const getCart = async (req, res) => {
    const userId = req.user.userId;
    console.log(userId)
    try {
        // Find all cart items for the user
        const cartItems = await Cart.find({ userId: userId }).populate('productId');
        console.log(cartItems)
        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is empty' });
        }
        
        // Send cart items with product details
        res.json({ cart: cartItems });
    } catch (err) {
        console.error('Error fetching cart:', err.message);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

  module.exports = {
    addCart,
    deleteCart,
    emptyCart,
    getCart,
  }