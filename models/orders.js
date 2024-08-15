const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true },
  payment: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  total: { type: Number, required: true }, // Add total field

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
