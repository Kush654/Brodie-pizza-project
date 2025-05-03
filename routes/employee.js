import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import EmployeeSchedule from '../models/EmployeeSchedule.js';
import { isEmployee, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Test route to debug session
router.get('/test-session', (req, res) => {
  return res.json({
    sessionExists: !!req.session,
    userExists: !!req.session.user,
    userData: req.session.user,
    isEmployee: req.session.user && ['employee', 'admin'].includes(req.session.user.role)
  });
});

// Employee dashboard
router.get('/dashboard', isEmployee, async (req, res) => {
  try {
    // Log authentication info for debugging
    console.log('Dashboard route - Session user:', req.session.user);
    console.log('Dashboard route - Locals user:', res.locals.user);
    
    // Get pending and in-progress orders
    const pendingOrders = await Order.findByStatus('pending');
    const inProgressOrders = await Order.findByStatus('preparing');
    
    // Ensure we have the user object from session
    const user = req.session.user;
    
    if (!user) {
      console.error('No user found in session!');
      return res.redirect('/auth/login?redirect=/employee/dashboard');
    }
    
    res.render('employee/dashboard', {
      title: 'Employee Dashboard',
      pendingOrders,
      inProgressOrders,
      user: user // Explicitly pass user to ensure it's available in the template
    });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the dashboard'
    });
  }
});

// Order management page
router.get('/orders', isEmployee, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const orders = await Order.findByStatus(status);
    
    res.render('employee/orders', {
      title: 'Order Management',
      orders,
      activeStatus: status,
      user: req.session.user
    });
  } catch (err) {
    console.error('Employee orders error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading orders'
    });
  }
});

// Order details
router.get('/orders/:id', isEmployee, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Order not found'
      });
    }
    
    res.render('employee/order-details', {
      title: `Order #${order.id}`,
      order,
      user: req.session.user
    });
  } catch (err) {
    console.error('Employee order details error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the order details'
    });
  }
});

// Update order status
router.post('/orders/:id/status', isEmployee, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Invalid status'
      });
    }
    
    // Update order status
    await Order.updateStatus(orderId, status);
    
    // Redirect back to order details
    res.redirect(`/employee/orders/${orderId}?success=Status updated successfully`);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating the order status'
    });
  }
});

// Menu management page
router.get('/menu', isEmployee, async (req, res) => {
  try {
    // Get all menu items, including unavailable ones
    const menuItems = await MenuItem.findAll(true);
    const categories = await MenuItem.getCategories();
    
    res.render('employee/menu', {
      title: 'Menu Management',
      menuItems,
      categories,
      user: req.session.user
    });
  } catch (err) {
    console.error('Menu management error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the menu management page'
    });
  }
});

// Toggle menu item availability
router.post('/menu/:id/toggle-availability', isEmployee, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Toggle availability
    await MenuItem.toggleAvailability(itemId);
    
    // Redirect back to menu management
    res.redirect('/employee/menu?success=Item availability updated');
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating item availability'
    });
  }
});

// Add menu item form
router.get('/menu/add', isEmployee, async (req, res) => {
  try {
    const categories = await MenuItem.getCategories();
    
    res.render('employee/menu-form', {
      title: 'Add Menu Item',
      categories,
      item: null,
      formAction: '/employee/menu/add',
      user: req.session.user
    });
  } catch (err) {
    console.error('Add menu item form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the add item form'
    });
  }
});

// Add menu item submission
router.post('/menu/add', isEmployee, async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    let { image_url } = req.body;
    
    // Validate input
    if (!name || !price || !category) {
      const categories = await MenuItem.getCategories();
      return res.render('employee/menu-form', {
        title: 'Add Menu Item',
        categories,
        item: req.body,
        formAction: '/employee/menu/add',
        error: 'Name, price, and category are required'
      });
    }
    
    // Set default image if not provided
    if (!image_url) {
      image_url = '/images/default-pizza.jpg';
    }
    
    // Create menu item
    const menuItemData = {
      name,
      description: description || '',
      price: parseFloat(price),
      image_url,
      category,
      available: available === 'on' || available === true
    };
    
    await MenuItem.create(menuItemData);
    
    // Redirect back to menu management
    res.redirect('/employee/menu?success=Item added successfully');
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while adding the menu item'
    });
  }
});

// Edit menu item form
router.get('/menu/:id/edit', isEmployee, async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await MenuItem.findById(itemId);
    
    if (!item) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Menu item not found'
      });
    }
    
    const categories = await MenuItem.getCategories();
    
    res.render('employee/menu-form', {
      title: 'Edit Menu Item',
      categories,
      item,
      formAction: `/employee/menu/${itemId}/edit`,
      user: req.session.user
    });
  } catch (err) {
    console.error('Edit menu item form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the edit item form'
    });
  }
});

// Edit menu item submission
router.post('/menu/:id/edit', isEmployee, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, description, price, image_url, category, available } = req.body;
    
    // Validate input
    if (!name || !price || !category) {
      const categories = await MenuItem.getCategories();
      return res.render('employee/menu-form', {
        title: 'Edit Menu Item',
        categories,
        item: { id: itemId, ...req.body },
        formAction: `/employee/menu/${itemId}/edit`,
        error: 'Name, price, and category are required'
      });
    }
    
    // Update menu item
    const menuItemData = {
      name,
      description: description || '',
      price: parseFloat(price),
      image_url: image_url || '/images/default-pizza.jpg',
      category,
      available: available === 'on' || available === true
    };
    
    await MenuItem.update(itemId, menuItemData);
    
    // Redirect back to menu management
    res.redirect('/employee/menu?success=Item updated successfully');
  } catch (err) {
    console.error('Edit menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating the menu item'
    });
  }
});

// Employee schedule
router.get('/schedule', isEmployee, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const schedule = await EmployeeSchedule.getCurrentWeekSchedule(userId);
    
    res.render('employee/schedule', {
      title: 'My Schedule',
      schedule
    });
  } catch (err) {
    console.error('Employee schedule error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading your schedule'
    });
  }
});

// Employee schedule management (admin only)
router.get('/schedules', isAdmin, async (req, res) => {
  try {
    const schedules = await EmployeeSchedule.findAll();
    
    res.render('employee/schedule-management', {
      title: 'Schedule Management',
      schedules
    });
  } catch (err) {
    console.error('Schedule management error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the schedule management page'
    });
  }
});

// Debug route to check authentication status
router.get('/debug-auth', (req, res) => {
  // Check session
  const sessionExists = !!req.session;
  const userExists = !!req.session.user;
  const userRole = userExists ? req.session.user.role : 'none';
  const isEmployeeUser = userExists && ['employee', 'admin'].includes(req.session.user.role);
  
  // Check locals
  const localsUserExists = !!res.locals.user;
  const localsUserRole = localsUserExists ? res.locals.user.role : 'none';
  
  return res.json({
    session: {
      exists: sessionExists,
      userExists,
      userRole,
      isEmployee: isEmployeeUser
    },
    locals: {
      userExists: localsUserExists,
      userRole: localsUserRole
    }
  });
});

export default router; 