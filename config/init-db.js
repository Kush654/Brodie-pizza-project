// Database initialization script
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const menuItems = require('../data/menu-seed');

// Load environment variables
dotenv.config();

console.log('Initializing database...');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create or connect to database
const dbPath = path.join(__dirname, '..', 'data', 'pizza.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
    process.exit(1);
  }
  console.log(`SQLite database connected at ${dbPath}`);
});

// Run all statements in a single transaction
db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT CHECK(role IN ('customer', 'employee', 'admin')) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
    else console.log('Users table created or already exists');
  });
  
  // Create menu_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      available INTEGER DEFAULT 1,
      is_vegetarian INTEGER DEFAULT 0,
      is_gluten_free INTEGER DEFAULT 0,
      ingredients TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating menu_items table:', err.message);
    else console.log('Menu items table created or already exists');
  });
  
  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')) DEFAULT 'pending',
      total_price REAL NOT NULL,
      delivery_address TEXT,
      contact_phone TEXT,
      customer_name TEXT,
      customer_email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating orders table:', err.message);
    else console.log('Orders table created or already exists');
  });
  
  // Create order_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      special_instructions TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
  `, (err) => {
    if (err) console.error('Error creating order_items table:', err.message);
    else console.log('Order items table created or already exists');
  });
  
  db.run('COMMIT', (err) => {
    if (err) console.error('Error committing transaction:', err.message);
    else console.log('Database schema created successfully');
  });

  // Check if menu_items table is empty and seed if needed
  db.get('SELECT COUNT(*) as count FROM menu_items', [], (err, row) => {
    if (err) {
      console.error('Error checking menu items count:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding menu items...');
      // Prepare the statement for inserting menu items
      const stmt = db.prepare(`
        INSERT INTO menu_items 
        (name, category, description, price, image_url, is_vegetarian, is_gluten_free, ingredients) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const item of menuItems) {
        stmt.run(
          item.name,
          item.category,
          item.description,
          item.price,
          item.image || null,
          item.isVegetarian ? 1 : 0,
          item.isGlutenFree ? 1 : 0,
          JSON.stringify(item.ingredients || [])
        );
      }
      
      stmt.finalize(() => {
        console.log('Menu items seeded successfully');
        db.close(() => {
          console.log('Database initialization complete');
        });
      });
    } else {
      console.log('Menu items already seeded, skipping seed process');
      db.close(() => {
        console.log('Database initialization complete');
      });
    }
  });
}); 