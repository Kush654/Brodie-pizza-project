import { getDbConnection } from '../config/database.js';
import Cart from './Cart.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Order {
  /**
   * Get all orders
   * @returns {Promise<Array>} All orders
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        const sql = `
          SELECT o.*, 
                 u.name as user_name, 
                 u.email as user_email 
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
        `;
        
        db.all(sql, [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } catch (error) {
        console.error('Error finding all orders:', error);
        reject(error);
      }
    });
  }

  /**
   * Get orders by user ID
   * @param {Number} userId - User ID
   * @returns {Promise<Array>} User's orders
   */
  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        const sql = `
          SELECT * FROM orders 
          WHERE user_id = ? 
          ORDER BY created_at DESC
        `;
        
        db.all(sql, [userId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } catch (error) {
        console.error('Error finding orders by user ID:', error);
        reject(error);
      }
    });
  }

  /**
   * Get order by ID with order items
   * @param {Number} id - Order ID
   * @returns {Promise<Object>} Order with items
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        
        // Get the order
        const orderSql = `
          SELECT o.*, 
                 u.name as user_name, 
                 u.email as user_email 
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          WHERE o.id = ?
        `;
        
        db.get(orderSql, [id], (err, order) => {
          if (err) return reject(err);
          if (!order) return resolve(null);
          
          // Get the order items
          const itemsSql = `
            SELECT oi.*, 
                   mi.name, 
                   mi.category, 
                   mi.description, 
                   mi.image_url as image
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = ?
          `;
          
          db.all(itemsSql, [id], (err, items) => {
            if (err) return reject(err);
            
            order.items = items || [];
            resolve(order);
          });
        });
      } catch (error) {
        console.error('Error finding order by ID:', error);
        reject(error);
      }
    });
  }

  /**
   * Create a new order from cart
   * @param {Object} req - Express request object
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  static async createFromCart(req, orderData) {
    return new Promise(async (resolve, reject) => {
      try {
        const cart = Cart.getCart(req);
        const total = Cart.getTotal(req);
        
        if (!cart || cart.length === 0) {
          return reject(new Error('Cart is empty'));
        }
        
        // Construct the delivery address
        const address = `${orderData.address}, ${orderData.city}, ${orderData.state} ${orderData.zip}`;
        
        const db = getDbConnection();
        
        // Create the order
        const orderSql = `
          INSERT INTO orders 
          (user_id, status, total_price, delivery_address, contact_phone) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const userId = req.session.user ? req.session.user.id : null;
        
        db.run(orderSql, [userId, 'pending', total, address, orderData.phone], async function(err) {
          if (err) return reject(err);
          
          const orderId = this.lastID;
          
          // Insert order items
          const orderItems = Cart.convertCartToOrderItems(cart);
          const itemSql = `
            INSERT INTO order_items 
            (order_id, menu_item_id, quantity, price, special_instructions) 
            VALUES (?, ?, ?, ?, ?)
          `;
          
          try {
            for (const item of orderItems) {
              await new Promise((resolve, reject) => {
                db.run(itemSql, [
                  orderId,
                  item.menu_item_id,
                  item.quantity,
                  item.price,
                  item.special_instructions || ''
                ], function(err) {
                  if (err) return reject(err);
                  resolve();
                });
              });
            }
            
            // Clear the cart after successful order
            Cart.clearCart(req);
            
            // Get the created order with items
            const order = await Order.findById(orderId);
            resolve(order);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error creating order from cart:', error);
        reject(error);
      }
    });
  }

  /**
   * Update order status
   * @param {Number} id - Order ID
   * @param {String} status - New status
   * @returns {Promise<Object>} Updated order
   */
  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      try {
        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return reject(new Error('Invalid status'));
        }
        
        const db = getDbConnection();
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        
        db.run(sql, [status, id], async function(err) {
          if (err) return reject(err);
          
          // Check if order was updated
          if (this.changes === 0) {
            return reject(new Error('Order not found'));
          }
          
          const order = await Order.findById(id);
          resolve(order);
        });
      } catch (error) {
        console.error('Error updating order status:', error);
        reject(error);
      }
    });
  }

  /**
   * Get orders by status
   * @param {String} status - Order status
   * @returns {Promise<Array>} Orders with the specified status
   */
  static async findByStatus(status) {
    return new Promise((resolve, reject) => {
      try {
        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return reject(new Error('Invalid status'));
        }
        
        const db = getDbConnection();
        const sql = `
          SELECT o.*, 
                 u.name as user_name, 
                 u.email as user_email 
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          WHERE o.status = ?
          ORDER BY o.created_at DESC
        `;
        
        db.all(sql, [status], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } catch (error) {
        console.error('Error finding orders by status:', error);
        reject(error);
      }
    });
  }

  /**
   * Cancel an order
   * @param {Number} id - Order ID
   * @returns {Promise<Object>} Cancelled order
   */
  static async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }
}

export default Order; 