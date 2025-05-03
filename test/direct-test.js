// Direct test without using test-helpers
import * as chai from 'chai';
import chaiHttp from 'chai-http';
import stubApp from './stub-app.js';

// Configure chai
chai.use(chaiHttp);
const expect = chai.expect;

describe('Direct API Test', function() {
  it('should get the homepage', async function() {
    const res = await chai.request(stubApp).get('/');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message');
  });
  
  it('should get menu items', async function() {
    const res = await chai.request(stubApp).get('/menu');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.be.at.least(1);
  });
  
  it('should get a specific menu item', async function() {
    const res = await chai.request(stubApp).get('/menu/1');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('id', 1);
  });
  
  it('should return 404 for non-existent menu item', async function() {
    const res = await chai.request(stubApp).get('/menu/999');
    expect(res).to.have.status(404);
  });
  
  it('should register a new user', async function() {
    const res = await chai.request(stubApp)
      .post('/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!'
      });
      
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('user');
    expect(res.body.user).to.have.property('email', 'test@example.com');
  });
  
  it('should log in as admin', async function() {
    const res = await chai.request(stubApp)
      .post('/auth/login')
      .send({
        email: 'admin@pizzaplace.com',
        password: 'adminPassword123'
      });
      
    expect(res).to.have.status(200);
    expect(res.body.user).to.have.property('role', 'admin');
  });
}); 