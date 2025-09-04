const { logger } = require('./src/utils/logger');

console.log('🧪 Testing BeamerShow Backend Setup...\n');

// Test 1: Check if .env file exists
try {
  require('dotenv').config();
  console.log('✅ .env file loaded');
} catch (error) {
  console.log('❌ .env file not found or invalid');
  console.log('Run: npm run setup:firebase');
  process.exit(1);
}

// Test 2: Check required environment variables
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\nRun: npm run setup:firebase');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Test 3: Test Firebase connection
async function testFirebase() {
  try {
    console.log('\n🔄 Testing Firebase connection...');
    
    // Initialize Firebase Admin
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('test').doc('connection-test').get();
    
    console.log('✅ Firebase connection successful!');
    console.log('✅ Firestore database accessible');
    
    // Test basic operations
    const testDoc = await db.collection('test').doc('connection-test').set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Firestore write operation successful');
    
    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
    console.log('✅ Firestore delete operation successful');
    
  } catch (error) {
    console.log('❌ Firebase connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\nPlease check your Firebase credentials and try again.');
    process.exit(1);
  }
}

// Test 4: Test server startup
async function testServer() {
  try {
    console.log('\n🔄 Testing server startup...');
    
    // Test if we can require the server modules
    require('./src/server');
    console.log('✅ Server modules loaded successfully');
    
  } catch (error) {
    console.log('❌ Server startup test failed:');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }
}

// Run all tests
async function runTests() {
  try {
    await testFirebase();
    await testServer();
    
    console.log('\n🎉 All tests passed! Your backend is ready to run.');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend: npm start');
    console.log('2. Test health endpoint: http://localhost:5000/health');
    console.log('3. Test API endpoint: http://localhost:5000/api');
    
  } catch (error) {
    console.log('\n❌ Tests failed. Please fix the issues above.');
    process.exit(1);
  }
}

runTests();
