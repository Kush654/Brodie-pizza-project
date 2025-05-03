/**
 * User Model
 * 
 * Handles all user-related database operations including:
 * - User authentication (registration, login)
 * - Profile management (update, change password)
 * - User retrieval and deletion
 * 
 * Uses bcrypt for secure password hashing and verification.
 */

import bcrypt from 'bcrypt';
import { getDbConnection } from '../config/database.js';

class User {
  /**
   * Find a user by their ID
   * 
   * @param {number} id - The user ID to search for
   * @returns {Promise<Object|null>} User object if found, null otherwise
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * Find a user by their email address
   * Used primarily for authentication and password reset
   * 
   * @param {string} email - The email address to search for
   * @returns {Promise<Object|null>} User object if found, null otherwise
   */
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * Create a new user in the database
   * Automatically hashes the password for security
   * 
   * @param {Object} userData - User data including name, email, password, etc.
   * @returns {Promise<Object>} The newly created user (without password)
   */
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Hash the password with bcrypt for secure storage
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const db = getDbConnection();
        const { name, email, phone, address, role = 'customer' } = userData;
        
        // Ensure the users table exists with the required schema
        db.run(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            role TEXT CHECK(role IN ('customer', 'employee', 'admin')) DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          (err) => {
            if (err) return reject(err);
            
            // Insert the new user with hashed password
            db.run(
              'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
              [name, email, hashedPassword, phone || '', address || '', role],
              function(err) {
                if (err) return reject(err);
                
                // Retrieve the newly created user
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
                  if (err) return reject(err);
                  // Remove password from result for security
                  delete user.password;
                  resolve(user);
                });
              }
            );
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Update a user's profile information
   * 
   * @param {number} id - User ID to update
   * @param {Object} userData - Updated user data (name, email, phone, address)
   * @returns {Promise<Object>} The updated user object
   */
  static async update(id, userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDbConnection();
        const { name, email, phone, address } = userData;
        
        db.run(
          'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, email, phone, address, id],
          function(err) {
            if (err) return reject(err);
            
            if (this.changes === 0) {
              return reject(new Error('User not found'));
            }
            
            // Get the updated user
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
              if (err) return reject(err);
              // Remove password from result for security
              delete user.password;
              resolve(user);
            });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Change a user's password
   * Verifies the current password before allowing the change
   * 
   * @param {number} id - User ID
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<Object>} Success status object
   */
  static async changePassword(id, currentPassword, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDbConnection();
        
        // Get the current user to verify password
        const user = await this.findById(id);
        if (!user) {
          return reject(new Error('User not found'));
        }
        
        // Verify current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return reject(new Error('Current password is incorrect'));
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the password in the database
        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, id],
          function(err) {
            if (err) return reject(err);
            resolve({ success: true });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get all users (admin function)
   * Excludes password fields for security
   * 
   * @returns {Promise<Array>} Array of all user objects
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all('SELECT id, name, email, role, phone, address, created_at FROM users', (err, users) => {
        if (err) return reject(err);
        resolve(users);
      });
    });
  }

  /**
   * Delete a user by ID (admin function)
   * 
   * @param {number} id - User ID to delete
   * @returns {Promise<Object>} Success status object
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        
        if (this.changes === 0) {
          return reject(new Error('User not found'));
        }
        
        resolve({ success: true });
      });
    });
  }

  /**
   * Verify user password for login
   * Handles password comparison with bcrypt and returns user if valid
   * 
   * @param {string} email - User's email address
   * @param {string} password - Password to verify
   * @returns {Promise<Object>} Success status and user object if valid
   */
  static async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Compare submitted password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      // Remove password from result for security
      delete user.password;
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}

export default User; 