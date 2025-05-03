import * as chai from 'chai';
import request from 'supertest';
import stubApp from './stub-app.js';

const { expect } = chai;

describe('Basic API Tests', function() {
  describe('GET /', function() {
    it('should get the homepage', async function() {
      try {
        const res = await request(stubApp).get('/');
        expect(res.status).to.equal(200);
      } catch (err) {
        console.error('Error in homepage test:', err);
        throw err;
      }
    });
  });
  
  describe('GET /menu', function() {
    it('should return a list of menu items', async function() {
      try {
        const res = await request(stubApp).get('/menu');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
      } catch (err) {
        console.error('Error in menu test:', err);
        throw err;
      }
    });
  });
}); 