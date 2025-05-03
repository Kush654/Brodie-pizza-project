import { getDbConnection } from '../config/database.js';

class Cart {
  /**
   * Get a user's cart from the session
   * @param {Object} req - Express request object
   * @returns {Array} Cart items array
   */
  static getCart(req) {
    if (!req.session.cart) {
      req.session.cart = [];
    }
    return req.session.cart;
  }

  /**
   * Get the total price of all items in the cart
   * @param {Object} req - Express request object
   * @returns {Number} Total price
   */
  static getTotal(req) {
    const cart = this.getCart(req);
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Add an item to the cart
   * @param {Object} req - Express request object
   * @param {Number} menuItemId - Menu item ID
   * @param {Number} quantity - Quantity to add
   * @param {String} specialInstructions - Special instructions for the item
   * @returns {Promise<Array>} Updated cart
   */
  static async addItem(req, menuItemId, quantity = 1, specialInstructions = '') {
    try {
      // Get the menu item from the database
      const menuItem = await this.getMenuItemById(menuItemId);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }

      const cart = this.getCart(req);
      
      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(item => item.menuItemId === parseInt(menuItemId));
      
      if (existingItemIndex !== -1) {
        // Update existing item
        cart[existingItemIndex].quantity += parseInt(quantity);
        cart[existingItemIndex].specialInstructions = specialInstructions || cart[existingItemIndex].specialInstructions;
      } else {
        // Add new item to cart
        cart.push({
          menuItemId: parseInt(menuItemId),
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          image: menuItem.image_url || menuItem.image,
          quantity: parseInt(quantity),
          specialInstructions
        });
      }
      
      req.session.cart = cart;
      return cart;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  /**
   * Update an item's quantity in the cart
   * @param {Object} req - Express request object
   * @param {Number} menuItemId - Menu item ID
   * @param {Number} quantity - New quantity
   * @returns {Array} Updated cart
   */
  static updateItemQuantity(req, menuItemId, quantity) {
    const cart = this.getCart(req);
    
    const itemIndex = cart.findIndex(item => item.menuItemId === menuItemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart[itemIndex].quantity = quantity;
    }
    
    req.session.cart = cart;
    return cart;
  }

  /**
   * Update an item's special instructions
   * @param {Object} req - Express request object
   * @param {Number} menuItemId - Menu item ID
   * @param {String} specialInstructions - Special instructions
   * @returns {Array} Updated cart
   */
  static updateSpecialInstructions(req, menuItemId, specialInstructions) {
    const cart = this.getCart(req);
    
    const itemIndex = cart.findIndex(item => item.menuItemId === menuItemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    cart[itemIndex].specialInstructions = specialInstructions;
    
    req.session.cart = cart;
    return cart;
  }

  /**
   * Remove an item from the cart
   * @param {Object} req - Express request object
   * @param {Number} menuItemId - Menu item ID
   * @returns {Array} Updated cart
   */
  static removeItem(req, menuItemId) {
    const cart = this.getCart(req);
    
    const itemIndex = cart.findIndex(item => item.menuItemId === menuItemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    cart.splice(itemIndex, 1);
    
    req.session.cart = cart;
    return cart;
  }

  /**
   * Clear the entire cart
   * @param {Object} req - Express request object
   */
  static clearCart(req) {
    req.session.cart = [];
    return [];
  }

  /**
   * Get a menu item by ID from the database
   * @param {Number} id - Menu item ID
   * @returns {Promise<Object>} Menu item
   */
  static async getMenuItemById(id) {
    return new Promise((resolve, reject) => {
      try {
        const db = getDbConnection();
        const sql = 'SELECT * FROM menu_items WHERE id = ?';
        
        db.get(sql, [id], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      } catch (error) {
        console.error('Error fetching menu item:', error);
        reject(error);
      }
    });
  }

  /**
   * Convert cart to order items format for database insertion
   * @param {Array} cart - Cart items
   * @returns {Array} Order items for database
   */
  static convertCartToOrderItems(cart) {
    return cart.map(item => ({
      menu_item_id: item.menuItemId || item.id,
      quantity: item.quantity,
      price: item.price,
      special_instructions: item.specialInstructions || ''
    }));
  }
}

export default Cart; 