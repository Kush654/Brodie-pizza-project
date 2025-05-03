// Updated test helpers for ES Modules with Chai v5
import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import stubApp from './stub-app.js';

// Get current file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure chai for Chai v5
chai.use(chaiHttp);

// Export the app directly
const app = stubApp;

// Export chai request directly - in Chai v5, we use chaiHttp directly as a function
const chaiRequest = chaiHttp;

// Initialize helpers
export async function initHelpers() {
  return {
    expect,
    chaiRequest,
    app,
    loginUser,
    loginAdmin,
    loginEmployee,
    connectToDatabase
  };
}

// Helper to create a test user session
export async function loginUser(credentials) {
  return chaiHttp(app)
    .post('/auth/login')
    .send(credentials);
}

// Helper to create a test admin session
export async function loginAdmin(credentials) {
  const res = await chaiHttp(app)
    .post('/auth/login')
    .send(credentials);
  
  if (!res.body.user || res.body.user.role !== 'admin') {
    throw new Error('User is not an admin');
  }
  
  return res;
}

// Helper to create a test employee session
export async function loginEmployee(credentials) {
  const res = await chaiHttp(app)
    .post('/auth/login')
    .send(credentials);
  
  if (!res.body.user || res.body.user.role !== 'employee') {
    throw new Error('User is not an employee');
  }
  
  return res;
}

// Helper for database connection before tests - stub version
export async function connectToDatabase() {
  // This is a stub function that does nothing in test mode
  return Promise.resolve();
}

// Export items directly
export { expect, app, chaiRequest }; 