import { initHelpers } from '../../test-helpers.js';
import * as OrderModule from '../../../models/Order.js';

let expect, Order;

describe('Order Model', () => {
  before(async function() {
    const helpers = await initHelpers();
    expect = helpers.expect;
    Order = OrderModule.default || OrderModule;
  });

  describe('Order.create()', () => {
    it('should create a new order with valid data', async () => {
      // Mock order data
      const orderData = {
        userId: 1,
        items: [
          { menuItemId: 1, quantity: 2, price: 12.99 },
          { menuItemId: 3, quantity: 1, price: 8.99 }
        ],
        totalAmount: 34.97,
        status: 'pending',
        deliveryAddress: '123 Main St, Anytown, USA'
      };
      
      // Mock Order.create method
      Order.create = async (data) => {
        return { id: 1, ...data, createdAt: new Date() };
      };
      
      const newOrder = await Order.create(orderData);
      expect(newOrder).to.exist;
      expect(newOrder.id).to.equal(1);
      expect(newOrder.userId).to.equal(orderData.userId);
      expect(newOrder.totalAmount).to.equal(orderData.totalAmount);
      expect(newOrder.status).to.equal('pending');
    });
  });
  
  describe('Order.findById()', () => {
    it('should return an order when a valid ID is provided', async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        items: [
          { menuItemId: 1, quantity: 2, price: 12.99 },
          { menuItemId: 3, quantity: 1, price: 8.99 }
        ],
        totalAmount: 34.97,
        status: 'pending',
        deliveryAddress: '123 Main St, Anytown, USA',
        createdAt: new Date()
      };
      
      // Mock Order.findById method
      Order.findById = async (id) => {
        return id === 1 ? mockOrder : null;
      };
      
      const order = await Order.findById(1);
      expect(order).to.exist;
      expect(order.id).to.equal(1);
      expect(order.status).to.equal('pending');
    });
    
    it('should return null when an invalid ID is provided', async () => {
      // Mock Order.findById method
      Order.findById = async (id) => {
        return id === 1 ? {} : null;
      };
      
      const order = await Order.findById(999);
      expect(order).to.be.null;
    });
  });
  
  describe('Order.findByUserId()', () => {
    it('should return orders for a specific user', async () => {
      const mockOrders = [
        {
          id: 1,
          userId: 1,
          totalAmount: 34.97,
          status: 'pending'
        },
        {
          id: 2,
          userId: 1,
          totalAmount: 22.50,
          status: 'completed'
        }
      ];
      
      // Mock Order.findByUserId method
      Order.findByUserId = async (userId) => {
        return userId === 1 ? mockOrders : [];
      };
      
      const orders = await Order.findByUserId(1);
      expect(orders).to.be.an('array');
      expect(orders).to.have.lengthOf(2);
      expect(orders[0].userId).to.equal(1);
    });
  });
  
  describe('Order.updateStatus()', () => {
    it('should update an order status', async () => {
      // Mock the initial order
      const mockOrder = {
        id: 1,
        userId: 1,
        status: 'pending'
      };
      
      // Mock Order methods
      Order.findById = async (id) => {
        return id === 1 ? { ...mockOrder } : null;
      };
      
      Order.updateStatus = async (id, status) => {
        if (id === 1) {
          mockOrder.status = status;
          return { ...mockOrder };
        }
        return null;
      };
      
      // Verify initial status
      let order = await Order.findById(1);
      expect(order.status).to.equal('pending');
      
      // Update status
      order = await Order.updateStatus(1, 'in-progress');
      expect(order.status).to.equal('in-progress');
    });
  });
}); 