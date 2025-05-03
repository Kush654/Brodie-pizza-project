import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { isAuthenticated, isEmployee, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user can access an order
const canAccessOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/orders');
    }
    
    // Allow access if user is the order owner, an employee, or admin
    if (req.session.user.id === order.user_id || 
        req.session.user.role === 'employee' || 
        req.session.user.role === 'admin') {
      req.order = order; // Attach order to request
      return next();
    }
    
    req.flash('error', 'You are not authorized to view this order');
    res.redirect('/orders');
  } catch (error) {
    console.error('Order access check error:', error);
    req.flash('error', 'An error occurred');
    res.redirect('/orders');
  }
};

// GET user's orders
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.session.user.id);
    
    res.render('orders/index', {
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    req.flash('error', 'Failed to load orders');
    res.redirect('/');
  }
});

// POST create a new order
router.post('/create', async (req, res) => {
  try {
    const orderData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      deliveryInstructions: req.body.deliveryInstructions,
      paymentMethod: req.body.paymentMethod
    };
    
    const order = await Order.createFromCart(req, orderData);
    
    // Redirect to order confirmation
    res.redirect(`/orders/${order.id}/confirmation`);
  } catch (error) {
    console.error('Create order error:', error);
    req.flash('error', 'Failed to create order: ' + error.message);
    res.redirect('/cart/checkout');
  }
});

// GET order confirmation
router.get('/:id/confirmation', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/');
    }
    
    res.render('orders/confirmation', {
      order
    });
  } catch (error) {
    console.error('Order confirmation error:', error);
    req.flash('error', 'Failed to load order confirmation');
    res.redirect('/');
  }
});

// GET order details
router.get('/:id', isAuthenticated, canAccessOrder, (req, res) => {
  res.render('orders/details', {
    order: req.order
  });
});

// Employee routes

// GET all orders (employees only)
router.get('/manage/all', isEmployee, async (req, res) => {
  try {
    const orders = await Order.findAll();
    
    res.render('orders/manage', {
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    req.flash('error', 'Failed to load orders');
    res.redirect('/employee/dashboard');
  }
});

// GET orders by status (employees only)
router.get('/manage/status/:status', isEmployee, async (req, res) => {
  try {
    const status = req.params.status;
    const orders = await Order.findByStatus(status);
    
    res.render('orders/manage', {
      orders,
      currentStatus: status
    });
  } catch (error) {
    console.error('Get orders by status error:', error);
    req.flash('error', 'Failed to load orders');
    res.redirect('/employee/dashboard');
  }
});

// POST update order status (employees only)
router.post('/:id/update-status', isEmployee, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    await Order.updateStatus(orderId, status);
    
    req.flash('success', 'Order status updated');
    res.redirect('/orders/manage/all');
  } catch (error) {
    console.error('Update order status error:', error);
    req.flash('error', 'Failed to update order status');
    res.redirect('/orders/manage/all');
  }
});

// POST cancel order
router.post('/:id/cancel', isAuthenticated, canAccessOrder, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Only allow cancellation if the order is still pending
    if (req.order.status !== 'pending') {
      req.flash('error', 'Only pending orders can be cancelled');
      return res.redirect(`/orders/${orderId}`);
    }
    
    await Order.cancel(orderId);
    
    req.flash('success', 'Order cancelled successfully');
    res.redirect('/orders');
  } catch (error) {
    console.error('Cancel order error:', error);
    req.flash('error', 'Failed to cancel order');
    res.redirect(`/orders/${req.params.id}`);
  }
});

export default router; 