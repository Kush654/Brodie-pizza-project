import bcrypt from 'bcrypt';
import { getDbConnection } from '../config/database.js';

class User {
  // Get user by id
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  // Get user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }

  // Create a new user
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const db = getDbConnection();
        const { name, email, phone, address, role = 'customer' } = userData;
        
        // Update the schema
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
            
            // Insert the user
            db.run(
              'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
              [name, email, hashedPassword, phone || '', address || '', role],
              function(err) {
                if (err) return reject(err);
                
                // Get the newly created user
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
                  if (err) return reject(err);
                  // Don't return the password
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

  // Update user details
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
              // Don't return the password
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

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDbConnection();
        
        // Get the current user to verify password
        const user = await this.findById(id);
        if (!user) {
          return reject(new Error('User not found'));
        }
        
        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return reject(new Error('Current password is incorrect'));
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the password
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

  // Get all users (admin function)
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all('SELECT id, name, email, role, phone, address, created_at FROM users', (err, users) => {
        if (err) return reject(err);
        resolve(users);
      });
    });
  }

  // Delete a user (admin function)
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

  // Verify password for login
  static async verifyPassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      // Don't return the password
      delete user.password;
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}

export default User; 