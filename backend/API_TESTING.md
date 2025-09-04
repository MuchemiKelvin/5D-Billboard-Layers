# 🧪 BeamerShow API Testing Guide

This guide explains how to test all the APIs in the BeamerShow 24-Slot System.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### 2. Run API Tests
```bash
# Run all API tests (Node.js)
npm run test:apis

# Run PowerShell tests (Windows)
npm run test:ps

# Run bash tests (Linux/Mac)
npm run test:curl

# Or run the test scripts directly
node simple-test.js
powershell -ExecutionPolicy Bypass -File test-apis.ps1
bash curl-tests.sh
```

## 📋 Available Test Scripts

### 1. `simple-test.js` - Node.js Testing
A simple Node.js script that tests all API endpoints from the command line.

**Features:**
- Tests all major API endpoints
- Shows success/failure for each test
- Displays response data
- Provides summary statistics

**Usage:**
```bash
node simple-test.js
npm run test:apis
```

### 2. `test-apis.js` - Comprehensive Testing
A more detailed test script with better error handling and detailed logging.

**Features:**
- Comprehensive endpoint testing
- Authentication token handling
- Detailed error reporting
- Mock data validation

**Usage:**
```bash
node test-apis.js
```

### 3. `test-apis.ps1` - PowerShell Testing (Windows)
A PowerShell script for testing APIs on Windows systems.

**Features:**
- Native Windows PowerShell support
- Colored output for better readability
- Error handling with try-catch
- JSON response formatting

**Usage:**
```bash
npm run test:ps
powershell -ExecutionPolicy Bypass -File test-apis.ps1
```

### 4. `curl-tests.sh` - Bash Testing (Linux/Mac)
A bash script using curl for testing APIs on Unix-like systems.

**Features:**
- Uses standard curl commands
- Colored terminal output
- HTTP status code checking
- Response body truncation

**Usage:**
```bash
npm run test:curl
bash curl-tests.sh
```

## 🔍 What Gets Tested

### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Core Management APIs
- `GET /api/slots` - Get all slots
- `GET /api/slots/:id` - Get slot by ID
- `GET /api/sponsors` - Get all sponsors
- `GET /api/sponsors/:id` - Get sponsor by ID
- `GET /api/blocks` - Get all time blocks
- `GET /api/blocks/active` - Get active block

### Feature APIs
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/ar/models` - AR models
- `GET /api/ar/triggers` - AR triggers
- `GET /api/bidding/active` - Active bids
- `GET /api/sync/status` - Sync status
- `GET /api/devices` - All devices
- `GET /api/beamer/status` - Beamer status
- `GET /api/ipad/status` - iPad status

## 🛠️ Testing Configuration

### Environment Variables
The tests use these default settings:
- **Base URL**: `http://localhost:5000/api`
- **Timeout**: 10 seconds
- **Headers**: `Content-Type: application/json`

### Customizing Tests
You can modify the test configuration in the test files:

```javascript
// In simple-test.js
const BASE_URL = 'http://localhost:5000/api';  // Change this
const TIMEOUT = 10000;                         // Change this
```

## 📊 Understanding Test Results

### Success Response
```
🔍 Testing: Get All Slots
   GET /slots
   ✅ SUCCESS (200)
   📊 Response: {"success":true,"data":[...]}...
```

### Failure Response
```
🔍 Testing: Get All Slots
   GET /slots
   ❌ FAILED (500)
   💥 Error: Internal server error
```

### Final Summary
```
📊 Test Results:
✅ Passed: 15
❌ Failed: 2
📊 Total: 17
📈 Success Rate: 88.2%
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Server Not Running
```
❌ FAILED (Network Error)
💥 Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution**: Start the backend server with `npm start`

#### 2. Port Already in Use
```
❌ FAILED (Network Error)
💥 Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution**: Check if another process is using port 5000

#### 3. Database Connection Issues
```
❌ FAILED (500)
💥 Error: Database connection failed
```
**Solution**: The system runs in mock mode, so this shouldn't happen

### Debug Mode
To see more detailed information, you can modify the test scripts to log additional details:

```javascript
// Add this to see full responses
console.log('Full Response:', JSON.stringify(response.data, null, 2));
```

## 🎯 Testing Specific Endpoints

### Test Individual Endpoints
You can modify the test scripts to test only specific endpoints:

```javascript
// Test only authentication
async function testOnlyAuth() {
  await testEndpoint('POST', '/auth/register', {...}, 'User Registration');
  await testEndpoint('POST', '/auth/login', {...}, 'User Login');
}
```

### Test with Authentication
To test protected endpoints, you'll need to:

1. First run the authentication tests
2. Copy the returned JWT token
3. Add it to the test headers:

```javascript
const token = 'your-jwt-token-here';
const config = {
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};
```

## 📱 Browser Testing

For manual testing in a browser, you can:

1. Open `http://localhost:5000/api` to see the API overview
2. Use browser developer tools to make requests
3. Use tools like Postman or Insomnia for more advanced testing

## 🚨 Important Notes

- **Mock Mode**: The system runs entirely in mock mode without a database
- **No Persistence**: Data changes are not saved between server restarts
- **Test Data**: All responses contain mock data for development purposes
- **Rate Limiting**: Some endpoints may have rate limiting enabled

## 🔄 Continuous Testing

For development, you can run tests automatically:

```bash
# Watch mode (restart tests when files change)
nodemon simple-test.js

# Run tests after server changes
npm run dev & npm run test:apis
```

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Quick Setup](./QUICK_SETUP.md) - Backend setup guide
- [Server Configuration](./src/server.js) - Main server file

---

**Happy Testing! 🎉**

If you encounter any issues, check the server logs and ensure all dependencies are installed correctly.
