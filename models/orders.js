const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  placedOn: {
    type: Date,
    default: Date.now,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  payments: {
    method: {
      type: String,
      required: true,
      enum: ['Paypal', 'Credit Card', 'Bank Transfer'], // Example payment methods
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
      trim: true
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
