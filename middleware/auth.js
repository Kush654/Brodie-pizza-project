/**
 * Authentication and Role-Based Access Control Middleware
 * 
 * This module provides middleware functions for:
 * 1. Verifying if a user is authenticated
 * 2. Checking if a user has the required role (employee/admin)
 * 3. Making user information available throughout the application
 * 4. Handling API authentication requests
 */

/**
 * Middleware to verify if a user is logged in
 * If not authenticated, redirects to login page or returns a 401 error for API requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  // Return JSON error for API requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
  
  // Redirect to login page with return URL for web requests
  return res.redirect('/auth/login?redirect=' + req.originalUrl);
};

/**
 * Middleware to verify if a user has employee or admin role
 * If user doesn't have required role, shows access denied page or returns 403 error for API requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isEmployee = (req, res, next) => {
  console.log('isEmployee middleware check:');
  console.log('- Session exists:', !!req.session);
  console.log('- User in session:', !!req.session.user);
  if (req.session && req.session.user) {
    console.log('- User role:', req.session.user.role);
    console.log('- Is proper role:', ['employee', 'admin'].includes(req.session.user.role));
  }

  // Check if user has employee or admin role
  if (req.session && req.session.user && ['employee', 'admin'].includes(req.session.user.role)) {
    return next();
  }
  
  // Return JSON error for API requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Forbidden: Employee access required' });
  }
  
  // Show access denied page for web requests
  return res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page. Employee access required.'
  });
};

/**
 * Middleware to verify if a user has admin role
 * If user doesn't have admin role, shows access denied page or returns 403 error for API requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = (req, res, next) => {
  // Check if user has admin role
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  // Return JSON error for API requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  // Show access denied page for web requests
  return res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page. Admin access required.'
  });
};

/**
 * Middleware to add the current user to response locals
 * Makes user data available to all templates without passing it explicitly
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const setUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

/**
 * API authentication middleware
 * Checks if user is authenticated for API requests and returns appropriate error
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const apiAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Please log in' });
};

/**
 * API employee role check middleware
 * Verifies employee/admin role for API requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const apiEmployee = (req, res, next) => {
  if (req.session && req.session.user && ['employee', 'admin'].includes(req.session.user.role)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Employee access required' });
};

/**
 * API admin role check middleware
 * Verifies admin role for API requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const apiAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin access required' });
};

export {
  isAuthenticated,
  isEmployee,
  isAdmin,
  setUser,
  apiAuth,
  apiEmployee,
  apiAdmin
}; 