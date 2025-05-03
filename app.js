/**
 * Main Application Entry Point
 * 
 * This file sets up the Express application, configures middleware,
 * initializes the database, and defines routes for the pizza restaurant website.
 */

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import { initializeDatabase } from './config/database.js';
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import employeeRoutes from './routes/employee.js';
import adminRoutes from './routes/admin.js';

// Get dirname equivalent in ES modules (ES modules don't have __dirname by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from app.env file
dotenv.config({ path: path.join(__dirname, 'app.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Application Middleware Setup
 */
// Enable CORS for API requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: true }));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * View Engine Configuration
 */
// Set up EJS as the view engine for HTML templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Session Configuration
 * 
 * Sessions are used to maintain user state across HTTP requests
 * This enables user authentication and shopping cart persistence
 */
app.use(session({
  secret: process.env.SESSION_SECRET || 'pizza-secret-key', // Secret used to sign the session ID cookie
  resave: true, // Forces the session to be saved back to the session store
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved
  cookie: {
    secure: false, // Set to true only in production with HTTPS
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 hours session expiration
  }
}));

// Initialize flash messages for user notifications
app.use(flash());

/**
 * Custom Middleware for Global Variables
 * 
 * Makes the user object and flash messages available to all templates
 * This allows for consistent UI elements like the navigation bar
 */
app.use((req, res, next) => {
  console.log('Setting res.locals.user:', req.session.user);
  res.locals.user = req.session.user || null;
  res.locals.flash = {
    success: req.flash('success') || [],
    error: req.flash('error') || []
  };
  next();
});

/**
 * Database Initialization
 * 
 * Sets up database tables if they don't exist and seeds initial data
 */
initializeDatabase();

/**
 * Application Routes
 * 
 * Maps URL paths to their respective route handlers
 */
app.use('/', indexRoutes);         // Home page and static pages
app.use('/auth', authRoutes);      // Authentication (login/register)
app.use('/menu', menuRoutes);      // Menu items display
app.use('/cart', cartRoutes);      // Shopping cart functionality
app.use('/orders', ordersRoutes);  // Order processing and history
app.use('/employee', employeeRoutes); // Employee dashboard
app.use('/admin', adminRoutes);    // Admin dashboard

/**
 * Error Handling
 */
// 404 handler for non-existent routes
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.' 
  });
});

// 500 handler for server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Server Error',
    message: 'Something went wrong on our end.' 
  });
});

/**
 * Start the Server
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app; // Export for testing purposes 