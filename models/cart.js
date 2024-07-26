const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model if using authentication
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
