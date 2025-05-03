import express from 'express';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import EmployeeSchedule from '../models/EmployeeSchedule.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    // Get employee users
    const users = await User.findAll();
    
    // Filter by role
    const employees = users.filter(user => ['employee', 'admin'].includes(user.role));
    const customers = users.filter(user => user.role === 'customer');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      employees,
      customers,
      employeeCount: employees.length,
      customerCount: customers.length,
      user: req.session.user
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the admin dashboard'
    });
  }
});

// User management
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.render('admin/users', {
      title: 'User Management',
      users,
      user: req.session.user
    });
  } catch (err) {
    console.error('User management error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the user management page'
    });
  }
});

// New employee form
router.get('/users/new-employee', isAdmin, (req, res) => {
  res.render('admin/employee-form', {
    title: 'Create Employee Account',
    user: null,
    formAction: '/admin/users/new-employee'
  });
});

// Create employee
router.post('/users/new-employee', isAdmin, async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, address, role } = req.body;
    
    // Validate input
    if (!name || !email || !password || !role) {
      return res.render('admin/employee-form', {
        title: 'Create Employee Account',
        user: req.body,
        formAction: '/admin/users/new-employee',
        error: 'Name, email, password, and role are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.render('admin/employee-form', {
        title: 'Create Employee Account',
        user: req.body,
        formAction: '/admin/users/new-employee',
        error: 'Passwords do not match'
      });
    }
    
    // Check for valid role
    if (!['employee', 'admin'].includes(role)) {
      return res.render('admin/employee-form', {
        title: 'Create Employee Account',
        user: req.body,
        formAction: '/admin/users/new-employee',
        error: 'Invalid role'
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.render('admin/employee-form', {
        title: 'Create Employee Account',
        user: req.body,
        formAction: '/admin/users/new-employee',
        error: 'Email is already in use'
      });
    }
    
    // Create user
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      role
    };
    
    await User.create(userData);
    
    // Redirect to user management with success message
    res.redirect('/admin/users?success=Employee account created successfully');
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while creating the employee account'
    });
  }
});

// Edit user form
router.get('/users/:id/edit', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.render('admin/user-form', {
      title: 'Edit User',
      user,
      formAction: `/admin/users/${userId}/edit`
    });
  } catch (err) {
    console.error('Edit user form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the edit user form'
    });
  }
});

// Update user
router.post('/users/:id/edit', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, role } = req.body;
    
    // Validate input
    if (!name || !email || !role) {
      const user = await User.findById(userId);
      return res.render('admin/user-form', {
        title: 'Edit User',
        user: { id: userId, ...req.body },
        formAction: `/admin/users/${userId}/edit`,
        error: 'Name, email, and role are required'
      });
    }
    
    // Get existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }
    
    // Update user
    const userData = {
      name,
      email,
      phone: phone || '',
      address: address || '',
      role
    };
    
    await User.update(userId, userData);
    
    // Redirect to user management with success message
    res.redirect('/admin/users?success=User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating the user'
    });
  }
});

// Delete user
router.post('/users/:id/delete', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Don't allow deleting yourself
    if (userId === req.session.user.id.toString()) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'You cannot delete your own account'
      });
    }
    
    await User.delete(userId);
    
    // Redirect to user management with success message
    res.redirect('/admin/users?success=User deleted successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while deleting the user'
    });
  }
});

// Schedule management
router.get('/schedules', isAdmin, async (req, res) => {
  try {
    // Get all employees
    const employees = await User.findAll();
    const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
    
    // Get all schedules
    const schedules = await EmployeeSchedule.findAll();
    
    res.render('admin/schedules', {
      title: 'Schedule Management',
      employees: filteredEmployees,
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

// Add schedule form
router.get('/schedules/add', isAdmin, async (req, res) => {
  try {
    // Get all employees
    const employees = await User.findAll();
    const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    res.render('admin/schedule-form', {
      title: 'Add Schedule',
      employees: filteredEmployees,
      days,
      schedule: null,
      formAction: '/admin/schedules/add'
    });
  } catch (err) {
    console.error('Add schedule form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the add schedule form'
    });
  }
});

// Add schedule
router.post('/schedules/add', isAdmin, async (req, res) => {
  try {
    const { user_id, day_of_week, start_time, end_time } = req.body;
    
    // Validate input
    if (!user_id || !day_of_week || !start_time || !end_time) {
      const employees = await User.findAll();
      const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      return res.render('admin/schedule-form', {
        title: 'Add Schedule',
        employees: filteredEmployees,
        days,
        schedule: req.body,
        formAction: '/admin/schedules/add',
        error: 'All fields are required'
      });
    }
    
    // Create schedule
    const scheduleData = {
      user_id,
      day_of_week,
      start_time,
      end_time
    };
    
    await EmployeeSchedule.create(scheduleData);
    
    // Redirect to schedule management with success message
    res.redirect('/admin/schedules?success=Schedule added successfully');
  } catch (err) {
    console.error('Add schedule error:', err);
    
    // Handle validation errors
    if (err.message.includes('Invalid day') || err.message.includes('Times must be') || err.message.includes('Start time must be')) {
      const employees = await User.findAll();
      const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      return res.render('admin/schedule-form', {
        title: 'Add Schedule',
        employees: filteredEmployees,
        days,
        schedule: req.body,
        formAction: '/admin/schedules/add',
        error: err.message
      });
    }
    
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while adding the schedule'
    });
  }
});

// Edit schedule form
router.get('/schedules/:id/edit', isAdmin, async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    // Get all employees
    const employees = await User.findAll();
    const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Get the schedule
    const db = require('../config/database').getDbConnection();
    const schedule = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_schedules WHERE id = ?', [scheduleId], (err, schedule) => {
        if (err) return reject(err);
        resolve(schedule);
      });
    });
    
    if (!schedule) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Schedule not found'
      });
    }
    
    res.render('admin/schedule-form', {
      title: 'Edit Schedule',
      employees: filteredEmployees,
      days,
      schedule,
      formAction: `/admin/schedules/${scheduleId}/edit`
    });
  } catch (err) {
    console.error('Edit schedule form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the edit schedule form'
    });
  }
});

// Update schedule
router.post('/schedules/:id/edit', isAdmin, async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { day_of_week, start_time, end_time } = req.body;
    
    // Validate input
    if (!day_of_week || !start_time || !end_time) {
      const employees = await User.findAll();
      const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      return res.render('admin/schedule-form', {
        title: 'Edit Schedule',
        employees: filteredEmployees,
        days,
        schedule: { id: scheduleId, ...req.body },
        formAction: `/admin/schedules/${scheduleId}/edit`,
        error: 'All fields are required'
      });
    }
    
    // Update schedule
    const scheduleData = {
      day_of_week,
      start_time,
      end_time
    };
    
    await EmployeeSchedule.update(scheduleId, scheduleData);
    
    // Redirect to schedule management with success message
    res.redirect('/admin/schedules?success=Schedule updated successfully');
  } catch (err) {
    console.error('Update schedule error:', err);
    
    // Handle validation errors
    if (err.message.includes('Invalid day') || err.message.includes('Times must be') || err.message.includes('Start time must be')) {
      const employees = await User.findAll();
      const filteredEmployees = employees.filter(user => ['employee', 'admin'].includes(user.role));
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      return res.render('admin/schedule-form', {
        title: 'Edit Schedule',
        employees: filteredEmployees,
        days,
        schedule: { id: req.params.id, ...req.body },
        formAction: `/admin/schedules/${req.params.id}/edit`,
        error: err.message
      });
    }
    
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating the schedule'
    });
  }
});

// Delete schedule
router.post('/schedules/:id/delete', isAdmin, async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    await EmployeeSchedule.delete(scheduleId);
    
    // Redirect to schedule management with success message
    res.redirect('/admin/schedules?success=Schedule deleted successfully');
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while deleting the schedule'
    });
  }
});

// Menu management
router.get('/menu', isAdmin, async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    const categories = await MenuItem.getCategories();
    
    res.render('admin/menu', {
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

// Add menu item form
router.get('/menu/add', isAdmin, (req, res) => {
  res.render('admin/menu-form', {
    title: 'Add Menu Item',
    menuItem: null,
    formAction: '/admin/menu/add',
    categories: MenuItem.getAllowedCategories(),
    user: req.session.user
  });
});

// Create menu item
router.post('/menu/add', isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    
    // Validate input
    if (!name || !price || !category) {
      return res.render('admin/menu-form', {
        title: 'Add Menu Item',
        menuItem: req.body,
        formAction: '/admin/menu/add',
        categories: MenuItem.getAllowedCategories(),
        error: 'Name, price, and category are required'
      });
    }
    
    // Create menu item
    const menuItemData = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: image || `/images/${category.toLowerCase()}-placeholder.svg`
    };
    
    await MenuItem.create(menuItemData);
    
    // Redirect to menu management with success message
    res.redirect('/admin/menu?success=Menu item created successfully');
  } catch (err) {
    console.error('Create menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while creating the menu item'
    });
  }
});

// Edit menu item form
router.get('/menu/:id/edit', isAdmin, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    const menuItem = await MenuItem.findById(menuItemId);
    
    if (!menuItem) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Menu item not found'
      });
    }
    
    res.render('admin/menu-form', {
      title: 'Edit Menu Item',
      menuItem,
      formAction: `/admin/menu/${menuItemId}/edit`,
      categories: MenuItem.getAllowedCategories(),
      user: req.session.user
    });
  } catch (err) {
    console.error('Edit menu item form error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the edit menu item form'
    });
  }
});

// Update menu item
router.post('/menu/:id/edit', isAdmin, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    const { name, description, price, category, image } = req.body;
    
    // Validate input
    if (!name || !price || !category) {
      return res.render('admin/menu-form', {
        title: 'Edit Menu Item',
        menuItem: { id: menuItemId, ...req.body },
        formAction: `/admin/menu/${menuItemId}/edit`,
        categories: MenuItem.getAllowedCategories(),
        error: 'Name, price, and category are required'
      });
    }
    
    // Get existing menu item
    const existingMenuItem = await MenuItem.findById(menuItemId);
    if (!existingMenuItem) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Menu item not found'
      });
    }
    
    // Update menu item
    const menuItemData = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: image || existingMenuItem.image
    };
    
    await MenuItem.update(menuItemId, menuItemData);
    
    // Redirect to menu management with success message
    res.redirect('/admin/menu?success=Menu item updated successfully');
  } catch (err) {
    console.error('Update menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while updating the menu item'
    });
  }
});

// Delete menu item
router.post('/menu/:id/delete', isAdmin, async (req, res) => {
  try {
    const menuItemId = req.params.id;
    
    await MenuItem.delete(menuItemId);
    
    // Redirect to menu management with success message
    res.redirect('/admin/menu?success=Menu item deleted successfully');
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while deleting the menu item'
    });
  }
});

export default router; 