const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open database connection
const db = new sqlite3.Database(path.join(__dirname, 'data', 'pizza.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Check if users table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error('Error checking tables:', err.message);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('Users table does not exist!');
    db.close();
    return;
  }
  
  console.log('Users table exists');
  
  // Get users table schema
  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (err) {
      console.error('Error getting table schema:', err.message);
      db.close();
      return;
    }
    
    console.log('Users table schema:');
    console.log(rows);
    
    // Check user records
    db.all('SELECT * FROM users', (err, users) => {
      if (err) {
        console.error('Error querying users:', err.message);
        db.close();
        return;
      }
      
      console.log(`Found ${users.length} users in database:`);
      console.log(users);
      
      // Close the database connection
      db.close();
    });
  });
}); 