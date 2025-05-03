import { expect, chaiRequest, app, loginUser } from '../test-helpers.js';

describe('Cart Integration', () => {
  let agent;
  let userCredentials;
  let testMenuItem;
  
  before(async function() {
    // Set up test user
    userCredentials = {
      email: `cart-test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    try {
      // Register the test user
      await chaiRequest(app)
        .post('/auth/register')
        .send({
          firstName: 'Cart',
          lastName: 'Test',
          email: userCredentials.email,
          password: userCredentials.password,
          phone: '555-987-6543'
        });
      
      // Get a test menu item
      const menuRes = await chaiRequest(app)
        .get('/menu');
      
      if (menuRes.body.length === 0) {
        this.skip();
      }
      
      testMenuItem = menuRes.body[0];
    } catch (error) {
      this.skip();
    }
    
    // Create an agent for persistent cookie sessions
    agent = chaiRequest.agent(app);
  });
  
  beforeEach(async function() {
    // Login before each test
    try {
      await agent
        .post('/auth/login')
        .send(userCredentials);
      
      // Clear the cart before each test
      await agent
        .delete('/cart');
    } catch (error) {
      this.skip();
    }
  });
  
  describe('Cart Operations', () => {
    it('should add an item to the cart', async () => {
      const res = await agent
        .post('/cart/add')
        .send({
          menuItemId: testMenuItem.id,
          quantity: 2
        });
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message').that.includes('added');
      expect(res.body).to.have.property('cart');
      expect(res.body.cart.items).to.be.an('array').with.lengthOf(1);
      expect(res.body.cart.items[0].menuItemId).to.equal(testMenuItem.id);
      expect(res.body.cart.items[0].quantity).to.equal(2);
    });
    
    it('should update item quantity in the cart', async () => {
      // First add an item
      await agent
        .post('/cart/add')
        .send({
          menuItemId: testMenuItem.id,
          quantity: 1
        });
      
      // Then update its quantity
      const res = await agent
        .put(`/cart/update/${testMenuItem.id}`)
        .send({
          quantity: 3
        });
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message').that.includes('updated');
      expect(res.body).to.have.property('cart');
      expect(res.body.cart.items[0].quantity).to.equal(3);
    });
    
    it('should remove an item from the cart', async () => {
      // First add an item
      await agent
        .post('/cart/add')
        .send({
          menuItemId: testMenuItem.id,
          quantity: 1
        });
      
      // Then remove it
      const res = await agent
        .delete(`/cart/remove/${testMenuItem.id}`);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message').that.includes('removed');
      expect(res.body).to.have.property('cart');
      expect(res.body.cart.items).to.be.an('array').with.lengthOf(0);
    });
    
    it('should clear the entire cart', async () => {
      // First add multiple items
      await agent
        .post('/cart/add')
        .send({
          menuItemId: testMenuItem.id,
          quantity: 2
        });
      
      // Get another menu item if available
      const menuRes = await chaiRequest(app)
        .get('/menu');
      
      if (menuRes.body.length > 1) {
        await agent
          .post('/cart/add')
          .send({
            menuItemId: menuRes.body[1].id,
            quantity: 1
          });
      }
      
      // Then clear the cart
      const res = await agent
        .delete('/cart');
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message').that.includes('cleared');
      expect(res.body).to.have.property('cart');
      expect(res.body.cart.items).to.be.an('array').with.lengthOf(0);
    });
  });
  
  describe('Cart to Order', () => {
    it('should create an order from the cart', async () => {
      // Add items to cart
      await agent
        .post('/cart/add')
        .send({
          menuItemId: testMenuItem.id,
          quantity: 2
        });
      
      // Convert cart to order
      const orderRes = await agent
        .post('/orders')
        .send({
          deliveryAddress: '123 Test St, Testville, TX 12345',
          paymentMethod: 'credit_card',
          cardNumber: '4111111111111111', // Test card number
          cardExpiry: '12/25',
          cardCVC: '123'
        });
      
      expect(orderRes).to.have.status(201);
      expect(orderRes.body).to.have.property('orderId');
      expect(orderRes.body).to.have.property('message').that.includes('created');
      
      // Cart should be empty after order creation
      const cartRes = await agent
        .get('/cart');
      
      expect(cartRes.body.items).to.be.an('array').with.lengthOf(0);
    });
  });
}); 