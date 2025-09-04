const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TIMEOUT = 10000;

// Test results
let passed = 0;
let failed = 0;

// Helper function to make requests
async function testEndpoint(method, endpoint, data = null, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   ${method.toUpperCase()} ${endpoint}`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    
    console.log(`   ✅ SUCCESS (${response.status})`);
    console.log(`   📊 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
    
    passed++;
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED (${error.response?.status || 'Network Error'})`);
    console.log(`   💥 Error: ${error.response?.data?.message || error.message}`);
    
    failed++;
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting BeamerShow API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  
  // Test API overview
  await testEndpoint('GET', '', null, 'API Overview');
  
  // Test Authentication
  await testEndpoint('POST', '/auth/register', {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    company: 'Test Corp',
    role: 'operator'
  }, 'User Registration');
  
  await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'TestPassword123!'
  }, 'User Login');
  
  // Test Slots
  await testEndpoint('GET', '/slots', null, 'Get All Slots');
  await testEndpoint('GET', '/slots/1', null, 'Get Slot by ID');
  
  // Test Sponsors
  await testEndpoint('GET', '/sponsors', null, 'Get All Sponsors');
  await testEndpoint('GET', '/sponsors/1', null, 'Get Sponsor by ID');
  
  // Test Blocks
  await testEndpoint('GET', '/blocks', null, 'Get All Blocks');
  await testEndpoint('GET', '/blocks/active', null, 'Get Active Block');
  
  // Test Analytics
  await testEndpoint('GET', '/analytics/overview', null, 'Get Analytics Overview');
  
  // Test AR
  await testEndpoint('GET', '/ar/models', null, 'Get AR Models');
  await testEndpoint('GET', '/ar/triggers', null, 'Get AR Triggers');
  
  // Test Bidding
  await testEndpoint('GET', '/bidding/active', null, 'Get Active Bids');
  
  // Test Sync
  await testEndpoint('GET', '/sync/status', null, 'Get Sync Status');
  
  // Test Devices
  await testEndpoint('GET', '/devices', null, 'Get All Devices');
  
  // Test Beamer
  await testEndpoint('GET', '/beamer/status', null, 'Get Beamer Status');
  
  // Test iPad
  await testEndpoint('GET', '/ipad/status', null, 'Get iPad Status');
  
  // Print results
  const total = passed + failed;
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n💡 Some tests failed. Make sure the backend server is running on port 5000.');
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Run tests
runTests().catch(console.error);
