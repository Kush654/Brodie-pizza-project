/**
 * Database Configuration Module
 * 
 * Handles database setup, initialization, and provides query utilities.
 * Supports both MySQL and SQLite databases depending on configuration.
 * SQLite is used as a fallback if MySQL is not configured.
 */

import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import menuItems from '../data/menu-seed.js';

// Convert ESM file URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection variables
const useMySQL = process.env.DB_TYPE === 'mysql';
let db;
let pool;

/**
 * Initializes the database connection based on configuration
 * If MySQL is specified in environment variables, connects to MySQL
 * Otherwise, falls back to SQLite database
 */
const initializeDatabase = async () => {
  if (useMySQL) {
    try {
      // Create MySQL connection pool for efficient connection management
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      console.log('MySQL database connected');
      
      // Initialize MySQL tables
      await initializeMySQLTables();
    } catch (error) {
      console.error('Error connecting to MySQL:', error);
      process.exit(1);
    }
  } else {
    // Use SQLite as fallback
    const dbPath = path.join(__dirname, '..', 'data', 'pizza.db');
    
    // Ensure data directory exists before creating database
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Connect to SQLite database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
      }
      console.log('SQLite database connected');
      
      // Initialize SQLite tables
      initializeSQLiteTables();
    });
  }
};

/**
 * Creates MySQL database tables if they don't exist
 * Seeds initial menu items if the menu_items table is empty
 */
const initializeMySQLTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table for authentication and user management
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'employee', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create menu_items table to store product catalog
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255),
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_gluten_free BOOLEAN DEFAULT FALSE,
        ingredients JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table to track customer orders
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        status ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
        total_price DECIMAL(10, 2) NOT NULL,
        delivery_address TEXT,
        contact_phone VARCHAR(20),
        customer_name VARCHAR(100),
        customer_email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create order_items table for items within each order
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        special_instructions TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `);
    
    // Seed menu items if table is empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    if (rows[0].count === 0) {
      for (const item of menuItems) {
        await connection.execute(
          'INSERT INTO menu_items (name, category, description, price, image, is_vegetarian, is_gluten_free, ingredients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.name,
            item.category,
            item.description,
            item.price,
            item.image,
            item.isVegetarian ? 1 : 0,
            item.isGlutenFree ? 1 : 0,
            JSON.stringify(item.ingredients)
          ]
        );
      }
      console.log('Menu items seeded successfully');
    }
    
    connection.release();
  } catch (error) {
    console.error('Error initializing MySQL tables:', error);
  }
};

/**
 * Creates SQLite database tables if they don't exist
 * Seeds initial menu items if the menu_items table is empty
 */
const initializeSQLiteTables = () => {
  // Run all statements in a single transaction for better performance and consistency
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Create users table for authentication and user management
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('customer', 'employee', 'admin')) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create menu_items table to store product catalog
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        is_vegetarian INTEGER DEFAULT 0,
        is_gluten_free INTEGER DEFAULT 0,
        ingredients TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table to track customer orders
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
    `);
    
    // Create order_items table for items within each order
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
    `);
    
    db.run('COMMIT');
    
    // Check if menu_items table is empty and seed if needed
    db.get('SELECT COUNT(*) as count FROM menu_items', [], (err, row) => {
      if (err) {
        console.error('Error checking menu items count:', err.message);
        return;
      }
      
      if (row.count === 0) {
        // Prepare the statement for inserting menu items
        const stmt = db.prepare(`
          INSERT INTO menu_items 
          (name, category, description, price, image, is_vegetarian, is_gluten_free, ingredients) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const item of menuItems) {
          stmt.run(
            item.name,
            item.category,
            item.description,
            item.price,
            item.image,
            item.isVegetarian ? 1 : 0,
            item.isGlutenFree ? 1 : 0,
            JSON.stringify(item.ingredients)
          );
        }
        
        stmt.finalize();
        console.log('Menu items seeded successfully');
      }
    });
  });
};

// Query functions for MySQL
const queryMySQL = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('MySQL query error:', error);
    throw error;
  }
};

// Query function for SQLite
const querySQLite = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQLite query error:', err.message);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// Run a query on the appropriate database
const query = async (sql, params = []) => {
  if (useMySQL) {
    return queryMySQL(sql, params);
  } else {
    return querySQLite(sql, params);
  }
};

// Get the database connection object
const getDbConnection = () => {
  if (!db && !pool) {
    console.error('Database not initialized');
    throw new Error('Database not initialized');
  }
  
  return useMySQL ? pool : db;
};

export { 
  initializeDatabase, 
  getDbConnection, 
  query 
}; 