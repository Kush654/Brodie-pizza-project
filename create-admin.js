const User = require('./models/User');
const { initializeDatabase } = require('./config/database');

// Initialize the database
initializeDatabase();

// Create admin user
async function createAdminUser() {
  try {
    // Admin user data
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    };

    // Employee user data
    const employeeData = {
      name: 'Employee User',
      email: 'employee@example.com',
      password: 'password123',
      role: 'employee'
    };

    // Customer user data for testing
    const customerData = {
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'password123',
      phone: '555-123-4567',
      address: '123 Pizza St, Anytown, NY 12345',
      role: 'customer'
    };

    console.log('Creating admin user...');
    const adminUser = await User.create(adminData);
    console.log('Admin user created:', adminUser);

    console.log('Creating employee user...');
    const employeeUser = await User.create(employeeData);
    console.log('Employee user created:', employeeUser);

    console.log('Creating test customer...');
    const customerUser = await User.create(customerData);
    console.log('Test customer created:', customerUser);

    console.log('User creation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser(); 