const axios = require('axios');
const { logger } = require('./src/utils/logger');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
const logTest = (testName, success, details = '') => {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
    if (details) console.log(`   ${details}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED`);
    if (details) console.log(`   ${details}`);
  }
  testResults.details.push({ name: testName, success, details });
};

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TEST_TIMEOUT
    };

    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Test Authentication APIs
const testAuthAPIs = async () => {
  console.log('\n🔐 Testing Authentication APIs...');
  
  // Test user registration
  const registerData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    company: 'Test Corp',
    role: 'operator'
  };
  
  const registerResult = await makeRequest('post', '/auth/register', registerData);
  logTest('User Registration', registerResult.success, 
    registerResult.success ? `User created with status ${registerResult.status}` : registerResult.error?.message || 'Failed');

  // Test user login
  const loginData = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  };
  
  const loginResult = await makeRequest('post', '/auth/login', loginData);
  logTest('User Login', loginResult.success,
    loginResult.success ? `Login successful with status ${loginResult.status}` : loginResult.error?.message || 'Failed');

  return loginResult.success ? loginResult.data?.data?.token : null;
};

// Test Slots APIs
const testSlotsAPIs = async (authToken) => {
  console.log('\n🎯 Testing Slots APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get all slots
  const getAllSlotsResult = await makeRequest('get', '/slots', null, headers);
  logTest('Get All Slots', getAllSlotsResult.success,
    getAllSlotsResult.success ? `Retrieved ${getAllSlotsResult.data?.data?.length || 0} slots` : getAllSlotsResult.error?.message || 'Failed');

  // Test get slot by ID
  const getSlotByIdResult = await makeRequest('get', '/slots/1', null, headers);
  logTest('Get Slot by ID', getSlotByIdResult.success,
    getSlotByIdResult.success ? `Slot retrieved with status ${getSlotByIdResult.status}` : getSlotByIdResult.error?.message || 'Failed');

  // Test create new slot
  const newSlotData = {
    slotNumber: 25,
    sponsorId: 'sponsor-1',
    slotType: 'premium',
    duration: 30,
    isActive: true
  };
  
  const createSlotResult = await makeRequest('post', '/slots', newSlotData, headers);
  logTest('Create New Slot', createSlotResult.success,
    createSlotResult.success ? `Slot created with status ${createSlotResult.status}` : createSlotResult.error?.message || 'Failed');

  // Test update slot
  const updateSlotData = { duration: 45 };
  const updateSlotResult = await makeRequest('put', '/slots/1', updateSlotData, headers);
  logTest('Update Slot', updateSlotResult.success,
    updateSlotResult.success ? `Slot updated with status ${updateSlotResult.status}` : updateSlotResult.error?.message || 'Failed');
};

// Test Sponsors APIs
const testSponsorsAPIs = async (authToken) => {
  console.log('\n🏢 Testing Sponsors APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get all sponsors
  const getAllSponsorsResult = await makeRequest('get', '/sponsors', null, headers);
  logTest('Get All Sponsors', getAllSponsorsResult.success,
    getAllSponsorsResult.success ? `Retrieved ${getAllSponsorsResult.data?.data?.length || 0} sponsors` : getAllSponsorsResult.error?.message || 'Failed');

  // Test get sponsor by ID
  const getSponsorByIdResult = await makeRequest('get', '/sponsors/1', null, headers);
  logTest('Get Sponsor by ID', getSponsorByIdResult.success,
    getSponsorByIdResult.success ? `Sponsor retrieved with status ${getSponsorByIdResult.status}` : getSponsorByIdResult.error?.message || 'Failed');

  // Test create new sponsor
  const newSponsorData = {
    name: 'Test Sponsor',
    company: 'Test Company Ltd',
    category: 'premium',
    tier: 'gold',
    isActive: true
  };
  
  const createSponsorResult = await makeRequest('post', '/sponsors', newSponsorData, headers);
  logTest('Create New Sponsor', createSponsorResult.success,
    createSponsorResult.success ? `Sponsor created with status ${createSponsorResult.status}` : createSponsorResult.error?.message || 'Failed');
};

// Test Blocks APIs
const testBlocksAPIs = async (authToken) => {
  console.log('\n📅 Testing Blocks APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get all blocks
  const getAllBlocksResult = await makeRequest('get', '/blocks', null, headers);
  logTest('Get All Blocks', getAllBlocksResult.success,
    getAllBlocksResult.success ? `Retrieved ${getAllBlocksResult.data?.data?.length || 0} blocks` : getAllBlocksResult.error?.message || 'Failed');

  // Test get active block
  const getActiveBlockResult = await makeRequest('get', '/blocks/active', null, headers);
  logTest('Get Active Block', getActiveBlockResult.success,
    getActiveBlockResult.success ? `Active block retrieved with status ${getActiveBlockResult.status}` : getActiveBlockResult.error?.message || 'Failed');

  // Test create new block
  const newBlockData = {
    blockNumber: 4,
    startTime: '21:00',
    endTime: '01:00',
    isActive: false,
    totalSlots: 24
  };
  
  const createBlockResult = await makeRequest('post', '/blocks', newBlockData, headers);
  logTest('Create New Block', createBlockResult.success,
    createBlockResult.success ? `Block created with status ${createBlockResult.status}` : createBlockResult.error?.message || 'Failed');
};

// Test Analytics APIs
const testAnalyticsAPIs = async (authToken) => {
  console.log('\n📊 Testing Analytics APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get analytics overview
  const getAnalyticsResult = await makeRequest('get', '/analytics/overview', null, headers);
  logTest('Get Analytics Overview', getAnalyticsResult.success,
    getAnalyticsResult.success ? `Analytics retrieved with status ${getAnalyticsResult.status}` : getAnalyticsResult.error?.message || 'Failed');

  // Test log event
  const eventData = {
    eventType: 'slot_view',
    slotId: '1',
    sponsorId: '1',
    deviceType: 'beamer',
    timestamp: new Date().toISOString()
  };
  
  const logEventResult = await makeRequest('post', '/analytics/events', eventData, headers);
  logTest('Log Analytics Event', logEventResult.success,
    logEventResult.success ? `Event logged with status ${logEventResult.status}` : logEventResult.error?.message || 'Failed');
};

// Test AR APIs
const testARAPIs = async (authToken) => {
  console.log('\n🕶️ Testing AR APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get AR models
  const getARModelsResult = await makeRequest('get', '/ar/models', null, headers);
  logTest('Get AR Models', getARModelsResult.success,
    getARModelsResult.success ? `AR models retrieved with status ${getARModelsResult.status}` : getARModelsResult.error?.message || 'Failed');

  // Test get AR triggers
  const getARTriggersResult = await makeRequest('get', '/ar/triggers', null, headers);
  logTest('Get AR Triggers', getARTriggersResult.success,
    getARTriggersResult.success ? `AR triggers retrieved with status ${getARTriggersResult.status}` : getARTriggersResult.error?.message || 'Failed');
};

// Test Bidding APIs
const testBiddingAPIs = async (authToken) => {
  console.log('\n💰 Testing Bidding APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get active bids
  const getActiveBidsResult = await makeRequest('get', '/bidding/active', null, headers);
  logTest('Get Active Bids', getActiveBidsResult.success,
    getActiveBidsResult.success ? `Active bids retrieved with status ${getActiveBidsResult.status}` : getActiveBidsResult.error?.message || 'Failed');

  // Test place bid
  const bidData = {
    slotId: '1',
    amount: 150.00,
    currency: 'USD',
    duration: 30
  };
  
  const placeBidResult = await makeRequest('post', '/bidding/place', bidData, headers);
  logTest('Place Bid', placeBidResult.success,
    placeBidResult.success ? `Bid placed with status ${placeBidResult.status}` : placeBidResult.error?.message || 'Failed');
};

// Test Sync APIs
const testSyncAPIs = async (authToken) => {
  console.log('\n🔄 Testing Sync APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get sync status
  const getSyncStatusResult = await makeRequest('get', '/sync/status', null, headers);
  logTest('Get Sync Status', getSyncStatusResult.success,
    getSyncStatusResult.success ? `Sync status retrieved with status ${getSyncStatusResult.status}` : getSyncStatusResult.error?.message || 'Failed');

  // Test request sync
  const syncData = {
    deviceId: 'test-device-1',
    deviceType: 'ipad',
    lastSync: new Date().toISOString()
  };
  
  const requestSyncResult = await makeRequest('post', '/sync/request', syncData, headers);
  logTest('Request Sync', requestSyncResult.success,
    requestSyncResult.success ? `Sync requested with status ${requestSyncResult.status}` : requestSyncResult.error?.message || 'Failed');
};

// Test Device APIs
const testDeviceAPIs = async (authToken) => {
  console.log('\n📱 Testing Device APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get all devices
  const getAllDevicesResult = await makeRequest('get', '/devices', null, headers);
  logTest('Get All Devices', getAllDevicesResult.success,
    getAllDevicesResult.success ? `Devices retrieved with status ${getAllDevicesResult.status}` : getAllDevicesResult.error?.message || 'Failed');

  // Test register device
  const deviceData = {
    deviceId: 'test-device-2',
    deviceType: 'beamer',
    location: 'main-hall',
    capabilities: ['projection', 'sync']
  };
  
  const registerDeviceResult = await makeRequest('post', '/devices/register', deviceData, headers);
  logTest('Register Device', registerDeviceResult.success,
    registerDeviceResult.success ? `Device registered with status ${registerDeviceResult.status}` : registerDeviceResult.error?.message || 'Failed');
};

// Test Beamer APIs
const testBeamerAPIs = async (authToken) => {
  console.log('\n🎥 Testing Beamer APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get beamer status
  const getBeamerStatusResult = await makeRequest('get', '/beamer/status', null, headers);
  logTest('Get Beamer Status', getBeamerStatusResult.success,
    getBeamerStatusResult.success ? `Beamer status retrieved with status ${getBeamerStatusResult.status}` : getBeamerStatusResult.error?.message || 'Failed');

  // Test get current projection
  const getCurrentProjectionResult = await makeRequest('get', '/beamer/projection/current', null, headers);
  logTest('Get Current Projection', getCurrentProjectionResult.success,
    getCurrentProjectionResult.success ? `Current projection retrieved with status ${getCurrentProjectionResult.status}` : getCurrentProjectionResult.error?.message || 'Failed');
};

// Test iPad APIs
const testIPadAPIs = async (authToken) => {
  console.log('\n📱 Testing iPad APIs...');
  
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  // Test get iPad status
  const getIPadStatusResult = await makeRequest('get', '/ipad/status', null, headers);
  logTest('Get iPad Status', getIPadStatusResult.success,
    getIPadStatusResult.success ? `iPad status retrieved with status ${getIPadStatusResult.status}` : getIPadStatusResult.error?.message || 'Failed');

  // Test get walking billboard content
  const getBillboardContentResult = await makeRequest('get', '/ipad/billboard/content', null, headers);
  logTest('Get Billboard Content', getBillboardContentResult.success,
    getBillboardContentResult.success ? `Billboard content retrieved with status ${getBillboardContentResult.status}` : getBillboardContentResult.error?.message || 'Failed');
};

// Test API Overview
const testAPIOverview = async () => {
  console.log('\n📋 Testing API Overview...');
  
  const overviewResult = await makeRequest('get', '');
  logTest('API Overview', overviewResult.success,
    overviewResult.success ? `API overview retrieved with status ${overviewResult.status}` : overviewResult.error?.message || 'Failed');
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting BeamerShow API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_TIMEOUT}ms`);
  
  try {
    // Test API overview first
    await testAPIOverview();
    
    // Test authentication and get token
    const authToken = await testAuthAPIs();
    
    // Test all other APIs with authentication
    await testSlotsAPIs(authToken);
    await testSponsorsAPIs(authToken);
    await testBlocksAPIs(authToken);
    await testAnalyticsAPIs(authToken);
    await testARAPIs(authToken);
    await testBiddingAPIs(authToken);
    await testSyncAPIs(authToken);
    await testDeviceAPIs(authToken);
    await testBeamerAPIs(authToken);
    await testIPadAPIs(authToken);
    
    // Print final results
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.total}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.details
        .filter(test => !test.success)
        .forEach(test => console.log(`   - ${test.name}: ${test.details}`));
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults,
  makeRequest
};
