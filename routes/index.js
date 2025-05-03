import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Home page
router.get('/', async (req, res) => {
  try {
    // Get featured menu items (e.g., first 4 available items)
    const featuredItems = await MenuItem.findAll();
    const limitedItems = featuredItems.slice(0, 4);
    
    res.render('index', {
      title: 'Welcome to Pizza Restaurant',
      featuredItems: limitedItems
    });
  } catch (err) {
    console.error('Home page error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the home page'
    });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us'
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us'
  });
});

// Privacy policy
router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Privacy Policy'
  });
});

// Terms of service
router.get('/terms', (req, res) => {
  res.render('terms', {
    title: 'Terms of Service'
  });
});

export default router; 