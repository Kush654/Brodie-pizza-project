// This is a stub app for testing purposes only
// It simulates responses without requiring the actual app dependencies

import express from 'express';

// Create a stub Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stub routes for testing
app.get('/', (req, res) => {
  // Send HTML if Accept header includes HTML
  if (req.get('Accept') && req.get('Accept').includes('text/html')) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pizza Restaurant</title>
        </head>
        <body>
          <h1>Welcome to our Pizza Restaurant</h1>
          <p>Delicious Pizza delivered to your doorstep!</p>
        </body>
      </html>
    `);
  } else {
    res.status(200).json({ message: 'Pizza Restaurant API' });
  }
});

app.get('/menu', (req, res) => {
  // Send HTML if Accept header includes HTML
  if (req.get('Accept') && req.get('Accept').includes('text/html')) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Menu - Pizza Restaurant</title>
        </head>
        <body>
          <h1>Menu</h1>
          <div class="menu-items">
            <div class="menu-item">
              <h2>Margherita</h2>
              <p>Classic pizza with tomato, mozzarella, and basil</p>
              <p>$12.99</p>
            </div>
            <div class="menu-item">
              <h2>Pepperoni</h2>
              <p>Pizza with tomato sauce, mozzarella, and pepperoni</p>
              <p>$14.99</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(200).json([
      {
        id: 1,
        name: 'Margherita',
        description: 'Classic pizza with tomato, mozzarella, and basil',
        price: 12.99,
        category: 'pizza',
        image: 'margherita.jpg'
      },
      {
        id: 2,
        name: 'Pepperoni',
        description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
        price: 14.99,
        category: 'pizza',
        image: 'pepperoni.jpg'
      }
    ]);
  }
});

app.get('/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) {
    res.status(200).json({
      id: 1,
      name: 'Margherita',
      description: 'Classic pizza with tomato, mozzarella, and basil',
      price: 12.99,
      category: 'pizza',
      image: 'margherita.jpg'
    });
  } else if (id === 2) {
    res.status(200).json({
      id: 2,
      name: 'Pepperoni',
      description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
      price: 14.99,
      category: 'pizza',
      image: 'pepperoni.jpg'
    });
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

// Authentication stubs
app.get('/auth/login', (req, res) => {
  // Send HTML for login page
  if (req.get('Accept') && req.get('Accept').includes('text/html')) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login - Pizza Restaurant</title>
        </head>
        <body>
          <h1>Login</h1>
          <form action="/auth/login" method="post">
            <div>
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div>
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
  } else {
    res.status(200).json({ message: 'Login endpoint' });
  }
});

app.get('/auth/register', (req, res) => {
  // Send HTML for registration page
  if (req.get('Accept') && req.get('Accept').includes('text/html')) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Register - Pizza Restaurant</title>
        </head>
        <body>
          <h1>Register</h1>
          <form action="/auth/register" method="post">
            <div>
              <label for="firstName">First Name:</label>
              <input type="text" id="firstName" name="firstName" required>
            </div>
            <div>
              <label for="lastName">Last Name:</label>
              <input type="text" id="lastName" name="lastName" required>
            </div>
            <div>
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div>
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div>
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit">Register</button>
          </form>
        </body>
      </html>
    `);
  } else {
    res.status(200).json({ message: 'Registration endpoint' });
  }
});

app.post('/auth/register', (req, res) => {
  res.status(201).json({ 
    message: 'User registered successfully',
    user: {
      id: 999,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: 'customer'
    }
  });
});

app.post('/auth/login', (req, res) => {
  if (req.body.email === 'admin@pizzaplace.com' && req.body.password === 'adminPassword123') {
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: 1,
        email: 'admin@pizzaplace.com',
        role: 'admin'
      }
    });
  } else if (req.body.email === 'employee@pizzaplace.com' && req.body.password === 'employeePassword123') {
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: 2,
        email: 'employee@pizzaplace.com',
        role: 'employee'
      }
    });
  } else if (req.body.email && req.body.password) {
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: Math.floor(Math.random() * 1000) + 3,
        email: req.body.email,
        role: 'customer'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Successfully logged out' });
});

// Static files
app.get('/css/style.css', (req, res) => {
  res.type('text/css').status(200).send(`
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
  `);
});

app.get('/js/main.js', (req, res) => {
  res.type('application/javascript').status(200).send(`
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Pizza Restaurant JS loaded');
    });
  `);
});

app.get('/images/logo.png', (req, res) => {
  // Return a 404 for simplicity
  res.status(404).json({ error: 'Image not found' });
});

// Error routes
app.get('/this-page-does-not-exist', (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404 - Not Found</title>
      </head>
      <body>
        <h1>404 - Page not found</h1>
        <p>The page you are looking for does not exist.</p>
      </body>
    </html>
  `);
});

app.get('/error', (req, res) => {
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>500 - Server Error</title>
      </head>
      <body>
        <h1>500 - Server Error</h1>
        <p>Something went wrong on our end.</p>
      </body>
    </html>
  `);
});

// Handle 404 for all other routes
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404 - Not Found</title>
      </head>
      <body>
        <h1>404 - Page not found</h1>
        <p>The page you are looking for does not exist.</p>
      </body>
    </html>
  `);
});

// Export the app
export default app; 