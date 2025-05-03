import * as chai from 'chai';

const expect = chai.expect;

describe('Simple Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).to.equal(2);
  });
  
  it('should check string equality', () => {
    expect('pizza').to.equal('pizza');
  });
  
  it('should verify object properties', () => {
    const pizza = { 
      name: 'Margherita', 
      price: 12.99 
    };
    
    expect(pizza).to.have.property('name').that.equals('Margherita');
    expect(pizza).to.have.property('price').that.equals(12.99);
  });
}); 