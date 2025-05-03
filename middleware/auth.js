/**
 * Authentication and role-based access control middleware
 */

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  // If API request, return JSON error
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
  
  // Otherwise redirect to login page
  return res.redirect('/auth/login?redirect=' + req.originalUrl);
};

// Check if user has employee role
const isEmployee = (req, res, next) => {
  if (req.session && req.session.user && ['employee', 'admin'].includes(req.session.user.role)) {
    return next();
  }
  
  // If API request, return JSON error
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Forbidden: Employee access required' });
  }
  
  // Otherwise render error page
  return res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page. Employee access required.'
  });
};

// Check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  // If API request, return JSON error
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  // Otherwise render error page
  return res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page. Admin access required.'
  });
};

// Add user to locals if authenticated
const setUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

// Check if user is authenticated for AJAX requests
const apiAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Please log in' });
};

// Check if user has employee role for AJAX requests
const apiEmployee = (req, res, next) => {
  if (req.session && req.session.user && ['employee', 'admin'].includes(req.session.user.role)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Employee access required' });
};

// Check if user has admin role for AJAX requests
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