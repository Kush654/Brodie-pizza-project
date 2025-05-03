import express from 'express';
import Cart from '../models/Cart.js';
import MenuItem from '../models/MenuItem.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// GET cart page
router.get('/', async (req, res) => {
  try {
    // Get cart items from session
    const cartItems = req.session.cart || [];
    
    // Calculate total
    let total = 0;
    for (const item of cartItems) {
      total += item.price * item.quantity;
    }
    
    res.render('cart/index', { 
      title: 'Shopping Cart',
      cartItems,
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error('Cart error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while accessing your cart'
    });
  }
});

// POST add item to cart
router.post('/add', async (req, res) => {
  try {
    const { menuItemId, quantity = 1, notes = '' } = req.body;
    
    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId);
    
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if item is already in cart
    const existingItemIndex = req.session.cart.findIndex(item => item.id === menuItemId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      req.session.cart[existingItemIndex].quantity += parseInt(quantity);
      // Update special instructions if provided
      if (notes) {
        req.session.cart[existingItemIndex].specialInstructions = notes;
      }
    } else {
      // Add new item to cart
      req.session.cart.push({
        id: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image_url,
        quantity: parseInt(quantity),
        specialInstructions: notes
      });
    }
    
    res.json({
      success: true,
      cartCount: req.session.cart.reduce((total, item) => total + item.quantity, 0)
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// POST update cart item quantity (AJAX)
router.post('/update', (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    
    if (!req.session.cart) {
      return res.status(404).json({ success: false, message: 'Cart is empty' });
    }
    
    // Find the item in the cart
    const cartItem = req.session.cart.find(item => item.id === menuItemId);
    
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    
    if (parseInt(quantity) <= 0) {
      // Remove item if quantity is 0 or negative
      req.session.cart = req.session.cart.filter(item => item.id !== menuItemId);
    } else {
      // Update quantity
      cartItem.quantity = parseInt(quantity);
    }
    
    // Calculate new total
    const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    res.json({
      success: true,
      total,
      cartCount: req.session.cart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// POST save special instructions for an item
router.post('/instructions', (req, res) => {
  try {
    const { menuItemId, specialInstructions } = req.body;
    
    // Validate input
    if (!menuItemId) {
      req.flash('error', 'Invalid item');
      return res.redirect('/cart');
    }
    
    if (!req.session.cart) {
      req.flash('error', 'Cart is empty');
      return res.redirect('/cart');
    }
    
    // Find the item in the cart
    const cartItem = req.session.cart.find(item => item.id === menuItemId);
    
    if (!cartItem) {
      req.flash('error', 'Item not found in cart');
      return res.redirect('/cart');
    }
    
    // Update special instructions
    cartItem.specialInstructions = specialInstructions || '';
    
    req.flash('success', 'Special instructions updated');
    res.redirect('/cart');
  } catch (error) {
    console.error('Update special instructions error:', error);
    req.flash('error', 'Failed to update special instructions');
    res.redirect('/cart');
  }
});

// POST remove item from cart
router.post('/remove', (req, res) => {
  try {
    const { menuItemId } = req.body;
    
    if (!req.session.cart) {
      return res.status(404).json({ success: false, message: 'Cart is empty' });
    }
    
    // Remove item from cart
    req.session.cart = req.session.cart.filter(item => item.id !== menuItemId);
    
    // Calculate new total
    const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    res.json({
      success: true,
      total,
      cartCount: req.session.cart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
  }
});

// POST clear cart
router.post('/clear', (req, res) => {
  try {
    // Clear the cart
    req.session.cart = [];
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

// POST apply promo code
router.post('/promo', (req, res) => {
  const { promoCode } = req.body;
  
  // Just a mock implementation for now
  if (promoCode.toUpperCase() === 'PIZZA10') {
    req.session.promoDiscount = 10; // 10% discount
    req.flash('success', 'Promo code applied: 10% discount');
  } else {
    req.flash('error', 'Invalid promo code');
  }
  
  res.redirect('/cart');
});

// GET checkout page
router.get('/checkout', (req, res) => {
  // Get cart items and calculate total
  const cartItems = req.session.cart || [];
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  
  if (cartItems.length === 0) {
    return res.redirect('/cart');
  }
  
  // Check if user is logged in and pass user data to the view
  const user = req.session.user || null;
  
  res.render('cart/checkout', {
    title: 'Checkout',
    cartItems,
    total,
    user
  });
});

export default router; 