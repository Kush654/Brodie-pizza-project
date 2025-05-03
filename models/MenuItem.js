import { getDbConnection } from '../config/database.js';

class MenuItem {
  // Get all menu items
  static async findAll(includeUnavailable = false) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      let query = 'SELECT * FROM menu_items';
      
      // Uncomment this when the available column is added
      // if (!includeUnavailable) {
      //   query += ' WHERE available = 1';
      // }
      
      query += ' ORDER BY category, name';
      
      db.all(query, (err, items) => {
        if (err) return reject(err);
        resolve(items);
      });
    });
  }

  // Get menu items by category
  static async findByCategory(category, includeUnavailable = false) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      let query = 'SELECT * FROM menu_items WHERE category = ?';
      
      // Uncomment this when the available column is added
      // if (!includeUnavailable) {
      //   query += ' AND available = 1';
      // }
      
      query += ' ORDER BY name';
      
      db.all(query, [category], (err, items) => {
        if (err) return reject(err);
        resolve(items);
      });
    });
  }

  // Get menu item by id
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
        if (err) return reject(err);
        resolve(item);
      });
    });
  }

  // Create a new menu item
  static async create(menuItemData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      const { name, description, price, image_url, category, available = true } = menuItemData;
      
      db.run(
        'INSERT INTO menu_items (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, image_url, category],
        function(err) {
          if (err) return reject(err);
          
          // Get the newly created menu item
          db.get('SELECT * FROM menu_items WHERE id = ?', [this.lastID], (err, item) => {
            if (err) return reject(err);
            resolve(item);
          });
        }
      );
    });
  }

  // Update menu item
  static async update(id, menuItemData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      const { name, description, price, image_url, category } = menuItemData;
      
      db.run(
        'UPDATE menu_items SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?',
        [name, description, price, image_url, category, id],
        function(err) {
          if (err) return reject(err);
          
          if (this.changes === 0) {
            return reject(new Error('Menu item not found'));
          }
          
          // Get the updated menu item
          db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
            if (err) return reject(err);
            resolve(item);
          });
        }
      );
    });
  }

  // Toggle menu item availability
  static async toggleAvailability(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDbConnection();
        
        // Get current item
        const item = await this.findById(id);
        if (!item) {
          return reject(new Error('Menu item not found'));
        }
        
        // For now, just return the item since we don't have the available column yet
        resolve(item);
        
        // Uncomment this when the available column is added
        // // Toggle availability
        // const newAvailability = item.available ? 0 : 1;
        // 
        // db.run(
        //   'UPDATE menu_items SET available = ? WHERE id = ?',
        //   [newAvailability, id],
        //   function(err) {
        //     if (err) return reject(err);
        //     
        //     // Get the updated menu item
        //     db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, updatedItem) => {
        //       if (err) return reject(err);
        //       resolve(updatedItem);
        //     });
        //   }
        // );
      } catch (err) {
        reject(err);
      }
    });
  }

  // Delete menu item
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run('DELETE FROM menu_items WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        
        if (this.changes === 0) {
          return reject(new Error('Menu item not found'));
        }
        
        resolve({ success: true });
      });
    });
  }

  // Get unique categories
  static async getCategories() {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.all('SELECT DISTINCT category FROM menu_items ORDER BY category', (err, categories) => {
        if (err) return reject(err);
        resolve(categories.map(cat => cat.category));
      });
    });
  }

  // Get allowed categories for menu items
  static getAllowedCategories() {
    return [
      'Pizza',
      'Pasta',
      'Salad',
      'Appetizer',
      'Dessert',
      'Beverage',
      'Side'
    ];
  }
}

export default MenuItem; 