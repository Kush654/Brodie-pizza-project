import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// GET menu page
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let menuItems;
    
    if (category) {
      menuItems = await MenuItem.findByCategory(category);
    } else {
      menuItems = await MenuItem.findAll();
    }
    
    // Get all categories for filter
    const categories = await MenuItem.getCategories();
    
    res.render('menu/index', {
      title: 'Our Menu',
      menuItems,
      categories,
      activeCategory: category || 'All'
    });
  } catch (err) {
    console.error('Menu error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the menu'
    });
  }
});

// GET menu item details
router.get('/item/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const menuItem = await MenuItem.findById(itemId);
    
    if (!menuItem) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'The requested menu item does not exist'
      });
    }
    
    // Get items in the same category for recommendations
    const similarItems = await MenuItem.findByCategory(menuItem.category);
    
    // Filter out the current item and limit to 4 recommendations
    const recommendations = similarItems
      .filter(item => item.id !== menuItem.id)
      .slice(0, 4);
    
    res.render('menu/item', {
      title: menuItem.name,
      menuItem,
      recommendations
    });
  } catch (err) {
    console.error('Menu item error:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the menu item'
    });
  }
});

// API route to get menu items
router.get('/api/items', async (req, res) => {
  try {
    const category = req.query.category;
    let menuItems;
    
    if (category) {
      menuItems = await MenuItem.findByCategory(category);
    } else {
      menuItems = await MenuItem.findAll();
    }
    
    res.json(menuItems);
  } catch (err) {
    console.error('Menu API error:', err);
    res.status(500).json({ error: 'An error occurred while fetching menu items' });
  }
});

// API route to get menu item by ID
router.get('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const menuItem = await MenuItem.findById(itemId);
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (err) {
    console.error('Menu item API error:', err);
    res.status(500).json({ error: 'An error occurred while fetching the menu item' });
  }
});

// API route to get categories
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await MenuItem.getCategories();
    res.json(categories);
  } catch (err) {
    console.error('Categories API error:', err);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
});

export default router; 