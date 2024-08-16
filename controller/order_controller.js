const mongoose = require('mongoose');
const Order = require('../models/orders'); // Ensure the path matches your project structure

// Handler for adding a new order
const addOrder = async (req, res) => {
  const {
    name, number, email, payment, address1, address2,
    city, state, country, pincode, total, // Add total here
  } = req.body;

  // Validate request data
  if (!name || !number || !email || !payment || !address1 ||
      !address2 || !city || !state || !country || !pincode || !total) { // Validate total
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create new order object
  const newOrder = new Order({
    name,
    number,
    email,
    payment,
    address1,
    address2,
    city,
    state,
    country,
    pincode,
    total, // Store the total from the request
    date: new Date(),
    status: 'Pending'
  });

  try {

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error('Failed to place order:', error);
    res.status(500).json({ message: 'Failed to place order', error });
  }
};

// Handler for retrieving an order by ID
const getOrder = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  try {
    // Find the order by ID
    const order = await Order.findById(id);
    console.log('THIS IS THE ORDER'+ order)
    console.log(id)

    if (!order) {
          return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Failed to retrieve order:', error);
    res.status(500).json({ message: 'Failed to retrieve order', error });
  }
};
const getAllOrder = async (req, res) => {
  try {
    // Find all orders
    const orders = await Order.find();
    console.log('THIS IS THE ORDERS', orders);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.json(orders);
  } catch (error) {
    console.error('Failed to retrieve orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders', error });
  }
};



// Export the functions to be used in other parts of the application
module.exports = {
  addOrder,
  getOrder,
  getAllOrder
};
