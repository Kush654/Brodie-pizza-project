// This is a minimal script to help diagnose issues with the test setup
import { initHelpers } from './test-helpers.js';

// Run a very simple test to verify the testing infrastructure
async function runSimpleTest() {
  try {
    console.log('Initializing test helpers...');
    const { expect } = await initHelpers();
    
    console.log('Running a basic test...');
    // This should always pass
    expect(1).to.equal(1);
    
    console.log('Basic test passed! The testing infrastructure is working.');
    
    // Exit with success code
    process.exit(0);
  } catch (error) {
    console.error('Test setup failed with error:', error);
    // Exit with error code
    process.exit(1);
  }
}

runSimpleTest(); 