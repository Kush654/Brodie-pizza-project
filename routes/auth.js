import express from 'express';
import User from '../models/User.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// GET login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to homepage
  if (req.session.user) {
    return res.redirect('/');
  }
  
  const redirect = req.query.redirect || '/';
  res.render('auth/login', { 
    title: 'Login',
    redirect,
    error: req.query.error || null
  });
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const redirect = req.body.redirect || '/';
    
    // Validate input
    if (!email || !password) {
      return res.redirect('/auth/login?error=Please provide both email and password&redirect=' + redirect);
    }
    
    // Attempt login
    const result = await User.verifyPassword(email, password);
    
    if (!result.success) {
      return res.redirect('/auth/login?error=Invalid email or password&redirect=' + redirect);
    }
    
    // Set user in session
    req.session.user = result.user;
    
    // Redirect based on role
    if (['employee', 'admin'].includes(result.user.role)) {
      return res.redirect('/employee/dashboard');
    }
    
    res.redirect(redirect);
  } catch (err) {
    console.error('Login error:', err);
    res.redirect('/auth/login?error=An error occurred during login');
  }
});

// GET register page
router.get('/register', (req, res) => {
  // If already logged in, redirect to homepage
  if (req.session.user) {
    return res.redirect('/');
  }
  
  res.render('auth/register', { 
    title: 'Create Account',
    error: req.query.error || null
  });
});

// POST register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, address } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.redirect('/auth/register?error=Please provide name, email, and password');
    }
    
    if (password !== confirmPassword) {
      return res.redirect('/auth/register?error=Passwords do not match');
    }
    
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.redirect('/auth/register?error=Email is already in use');
    }
    
    // Create user
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      role: 'customer' // Default role for self-registration
    };
    
    const user = await User.create(userData);
    
    // Set user in session
    req.session.user = user;
    
    // Redirect to homepage
    res.redirect('/');
  } catch (err) {
    console.error('Registration error:', err);
    res.redirect('/auth/register?error=An error occurred during registration');
  }
});

// GET logout
router.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    
    // Redirect to homepage
    res.redirect('/');
  });
});

// GET profile page
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('auth/profile', { 
    title: 'My Profile',
    user: req.session.user
  });
});

// POST update profile
router.post('/profile', isAuthenticated, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.session.user.id;
    
    // Validate input
    if (!name || !email) {
      return res.render('auth/profile', { 
        title: 'My Profile',
        user: req.session.user,
        error: 'Name and email are required'
      });
    }
    
    // Update user
    const userData = {
      name,
      email,
      phone: phone || '',
      address: address || ''
    };
    
    const updatedUser = await User.update(userId, userData);
    
    // Update session
    req.session.user = updatedUser;
    
    // Render profile with success message
    res.render('auth/profile', { 
      title: 'My Profile',
      user: updatedUser,
      success: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.render('auth/profile', { 
      title: 'My Profile',
      user: req.session.user,
      error: 'An error occurred while updating your profile'
    });
  }
});

// GET change password page
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('auth/change-password', { 
    title: 'Change Password'
  });
});

// POST change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('auth/change-password', { 
        title: 'Change Password',
        error: 'All fields are required'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.render('auth/change-password', { 
        title: 'Change Password',
        error: 'New passwords do not match'
      });
    }
    
    // Change password
    await User.changePassword(userId, currentPassword, newPassword);
    
    // Render change password page with success message
    res.render('auth/change-password', { 
      title: 'Change Password',
      success: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.render('auth/change-password', { 
      title: 'Change Password',
      error: err.message || 'An error occurred while changing your password'
    });
  }
});

export default router; 