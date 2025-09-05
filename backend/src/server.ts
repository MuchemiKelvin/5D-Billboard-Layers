import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes and middleware
import apiRoutes from './routes/api';
import slotRoutes from './routes/slots';
import companyRoutes from './routes/companies';
// import sponsorRoutes from './routes/sponsors';
// import syncRoutes from './routes/sync';
// import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
// import blockRoutes from './routes/blocks';
// import arRoutes from './routes/ar';
import biddingRoutes from './routes/bidding';
import uploadRoutes from './routes/uploads';
import arContentRoutes from './routes/ar-content';
import deviceRoutes from './routes/devices';
import analyticsRoutes from './routes/analytics';
import { connectDatabase } from './lib/database';
import { setupSocketHandlers } from './socket/handlers';
import { logger } from './utils/logger';
// import { errorHandler } from './middleware/errorHandler';
// import { rateLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server and Socket.IO server
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
// app.use(rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req, res, next) => {
  (logger as any).logRequest(req, res, next);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { checkDatabaseHealth } = await import('./lib/database');
    const dbHealth = await checkDatabaseHealth();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/companies', companyRoutes);
// app.use('/api/sponsors', sponsorRoutes); // Temporarily disabled due to route configuration issues
// app.use('/api/sync', syncRoutes);
// app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/blocks', blockRoutes);
// app.use('/api/ar', arRoutes);
app.use('/api/bidding', biddingRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/ar-content', arContentRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/analytics', analyticsRoutes);
// app.use('/api/beamer', require('./routes/beamer'));
// app.use('/api/ipad', require('./routes/ipad'));

// API Tester endpoint
app.get('/api-tester', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BeamerShow API Tester</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 1400px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 15px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .header p { font-size: 1.2em; opacity: 0.9; }
            .config-section { 
                background: #f8f9fa; 
                padding: 30px; 
                border-bottom: 1px solid #e9ecef; 
            }
            .config-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                align-items: end; 
            }
            .form-group { display: flex; flex-direction: column; }
            .form-group label { 
                font-weight: 600; 
                margin-bottom: 5px; 
                color: #495057; 
            }
            .form-group input { 
                padding: 12px; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                font-size: 14px; 
                transition: border-color 0.3s;
            }
            .form-group input:focus { 
                outline: none; 
                border-color: #667eea; 
            }
            .btn { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 8px; 
                cursor: pointer; 
                font-weight: 600; 
                font-size: 14px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); 
            }
            .test-section { padding: 30px; }
            .test-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
            }
            .test-card { 
                background: #f8f9fa; 
                border-radius: 12px; 
                padding: 25px; 
                border: 2px solid #e9ecef;
                transition: all 0.3s;
            }
            .test-card:hover { 
                border-color: #667eea; 
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .test-card h3 { 
                color: #495057; 
                margin-bottom: 10px; 
                font-size: 1.3em; 
            }
            .test-card p { 
                color: #6c757d; 
                margin-bottom: 20px; 
                line-height: 1.5; 
            }
            .response-area { 
                margin-top: 15px; 
                min-height: 60px; 
                background: white; 
                border: 1px solid #e9ecef; 
                border-radius: 8px; 
                padding: 15px; 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                overflow-x: auto;
            }
            .success { 
                background: #d4edda; 
                border-color: #c3e6cb; 
                color: #155724; 
            }
            .error { 
                background: #f8d7da; 
                border-color: #f5c6cb; 
                color: #721c24; 
            }
            .summary { 
                background: #e9ecef; 
                padding: 30px; 
                margin-top: 30px; 
                border-radius: 12px; 
            }
            .summary-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                gap: 20px; 
            }
            .summary-item { 
                text-align: center; 
                padding: 20px; 
                border-radius: 8px; 
                color: white; 
                font-weight: 600; 
            }
            .summary-item.total { background: #6c757d; }
            .summary-item.passed { background: #28a745; }
            .summary-item.failed { background: #dc3545; }
            .summary-item.rate { background: #17a2b8; }
            .back-link { 
                text-align: center; 
                padding: 20px; 
                background: #f8f9fa; 
            }
            .back-link a { 
                color: #667eea; 
                text-decoration: none; 
                font-weight: 600; 
            }
            .back-link a:hover { text-decoration: underline; }
            .loading { 
                display: inline-block; 
                width: 20px; 
                height: 20px; 
                border: 3px solid #f3f3f3; 
                border-top: 3px solid #667eea; 
                border-radius: 50%; 
                animation: spin 1s linear infinite; 
            }
            @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧪 BeamerShow API Tester</h1>
                <p>Test all endpoints of the 24-Slot System (AR/AI/Hologram)</p>
            </div>

            <div class="config-section">
                <div class="config-grid">
                    <div class="form-group">
                        <label for="baseUrl">Base URL:</label>
                        <input type="text" id="baseUrl" value="http://localhost:${PORT}/api" placeholder="Enter base URL">
                    </div>
                    <div class="form-group">
                        <label for="timeout">Timeout (ms):</label>
                        <input type="number" id="timeout" value="10000" min="1000" max="60000">
                    </div>
                    <div class="form-group">
                        <label for="authToken">Auth Token (optional):</label>
                        <input type="text" id="authToken" placeholder="Enter JWT token for authenticated endpoints">
                    </div>
                    <div class="form-group">
                        <button class="btn" onclick="runAllTests()">🚀 Run All Tests</button>
                    </div>
                </div>
            </div>

            <div class="test-section">
                <div class="test-grid">
                    <!-- Core System Tests -->
                    <div class="test-card">
                        <h3>❤️ Health Check</h3>
                        <p>Test server health and basic connectivity</p>
                        <button class="btn" onclick="testHealth()">Test Health</button>
                        <div class="response-area" id="health-response"></div>
                    </div>

                    <div class="test-card">
                        <h3>📋 API Overview</h3>
                        <p>Test API documentation and endpoint listing</p>
                        <button class="btn" onclick="testApiOverview()">Test API</button>
                        <div class="response-area" id="api-response"></div>
                    </div>

                    <!-- Authentication Tests -->
                    <div class="test-card">
                        <h3>🔐 Authentication</h3>
                        <p>Test user registration and login endpoints</p>
                        <button class="btn" onclick="testAuth()">Test Auth</button>
                        <div class="response-area" id="auth-response"></div>
                    </div>

                    <!-- Companies Tests -->
                    <div class="test-card">
                        <h3>🏢 Companies</h3>
                        <p>Test company CRUD operations and management</p>
                        <button class="btn" onclick="testCompanies()">Test Companies</button>
                        <div class="response-area" id="companies-response"></div>
                    </div>

                    <!-- Slots Tests -->
                    <div class="test-card">
                        <h3>🎯 Slot Management</h3>
                        <p>Test slot CRUD operations and scheduling</p>
                        <button class="btn" onclick="testSlots()">Test Slots</button>
                        <div class="response-area" id="slots-response"></div>
                    </div>

                    <!-- Bidding Tests -->
                    <div class="test-card">
                        <h3>💰 Live Bidding</h3>
                        <p>Test live bidding system and bid management</p>
                        <button class="btn" onclick="testBidding()">Test Bidding</button>
                        <div class="response-area" id="bidding-response"></div>
                    </div>

                    <!-- File Upload Tests -->
                    <div class="test-card">
                        <h3>📁 File Upload</h3>
                        <p>Test file upload system for sponsor assets</p>
                        <button class="btn" onclick="testFileUpload()">Test Upload</button>
                        <div class="response-area" id="upload-response"></div>
                    </div>

                    <!-- AR Content Tests -->
                    <div class="test-card">
                        <h3>🥽 AR Content</h3>
                        <p>Test AR content management and hologram effects</p>
                        <button class="btn" onclick="testARContent()">Test AR</button>
                        <div class="response-area" id="ar-response"></div>
                    </div>

                    <!-- Device Management Tests -->
                    <div class="test-card">
                        <h3>📱 Device Management</h3>
                        <p>Test device registration and status monitoring</p>
                        <button class="btn" onclick="testDevices()">Test Devices</button>
                        <div class="response-area" id="devices-response"></div>
                    </div>

                    <!-- Analytics Tests -->
                    <div class="test-card">
                        <h3>📊 Analytics</h3>
                        <p>Test analytics tracking and performance metrics</p>
                        <button class="btn" onclick="testAnalytics()">Test Analytics</button>
                        <div class="response-area" id="analytics-response"></div>
                    </div>
                </div>
            </div>

            <div class="summary">
                <h3 style="text-align: center; margin-bottom: 20px; color: #495057;">Test Results Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item total">
                        <div>Total Tests</div>
                        <div id="total-tests">0</div>
                    </div>
                    <div class="summary-item passed">
                        <div>Passed</div>
                        <div id="passed-tests">0</div>
                    </div>
                    <div class="summary-item failed">
                        <div>Failed</div>
                        <div id="failed-tests">0</div>
                    </div>
                    <div class="summary-item rate">
                        <div>Success Rate</div>
                        <div id="success-rate">0%</div>
                    </div>
                </div>
            </div>

            <div class="back-link">
                <a href="/">← Back to Main Page</a>
            </div>
        </div>

        <script>
            let testResults = { total: 0, passed: 0, failed: 0 };
what i            let testData = { companyId: null, slotId: null, userId: null };

            async function makeRequest(method, endpoint, data = null) {
                const baseUrl = document.getElementById('baseUrl').value;
                const timeout = parseInt(document.getElementById('timeout').value);
                const authToken = document.getElementById('authToken').value;

                const config = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(timeout)
                };

                if (authToken) {
                    config.headers['Authorization'] = \`Bearer \${authToken}\`;
                }

                if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                    config.body = JSON.stringify(data);
                }

                try {
                    const response = await fetch(\`\${baseUrl}\${endpoint}\`, config);
                    const responseData = await response.text();
                    
                    let parsedData;
                    try {
                        parsedData = JSON.parse(responseData);
                    } catch {
                        parsedData = responseData;
                    }

                    return {
                        success: response.ok,
                        status: response.status,
                        data: parsedData
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }

            function updateResponse(elementId, result, testName = '') {
                const element = document.getElementById(elementId);
                element.className = 'response-area ' + (result.success ? 'success' : 'error');
                
                if (result.success) {
                    element.innerHTML = \`<strong>✅ \${testName} Success (\${result.status})</strong><br><pre>\${JSON.stringify(result.data, null, 2)}</pre>\`;
                } else {
                    element.innerHTML = \`<strong>❌ \${testName} Error</strong><br><pre>\${result.error || JSON.stringify(result.data, null, 2)}</pre>\`;
                }
            }

            function updateSummary() {
                document.getElementById('total-tests').textContent = testResults.total;
                document.getElementById('passed-tests').textContent = testResults.passed;
                document.getElementById('failed-tests').textContent = testResults.failed;
                const rate = testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0;
                document.getElementById('success-rate').textContent = rate + '%';
            }

            function recordResult(success) {
                testResults.total++;
                if (success) testResults.passed++;
                else testResults.failed++;
                updateSummary();
            }

            async function testHealth() {
                const response = document.getElementById('health-response');
                response.innerHTML = '<div class="loading"></div> Testing health...';

                const result = await makeRequest('GET', '/health');
                updateResponse('health-response', result, 'Health Check');
                recordResult(result.success);
            }

            async function testApiOverview() {
                const response = document.getElementById('api-response');
                response.innerHTML = '<div class="loading"></div> Testing API overview...';

                const result = await makeRequest('GET', '');
                updateResponse('api-response', result, 'API Overview');
                recordResult(result.success);
            }

            async function testAuth() {
                const response = document.getElementById('auth-response');
                response.innerHTML = '<div class="loading"></div> Testing authentication...';

                // Test registration with unique timestamp
                const timestamp = Date.now();
                const registerResult = await makeRequest('POST', '/auth/register', {
                    username: \`testuser\${timestamp}\`,
                    email: \`test\${timestamp}@example.com\`,
                    password: 'TestPassword123!',
                    role: 'SPONSOR'
                });

                if (registerResult.success && registerResult.data.user) {
                    testData.userId = registerResult.data.user.id;
                }

                // Test login
                const loginResult = await makeRequest('POST', '/auth/login', {
                    username: \`testuser\${timestamp}\`,
                    password: 'TestPassword123!'
                });

                if (loginResult.success && loginResult.data.token) {
                    document.getElementById('authToken').value = loginResult.data.token;
                }

                updateResponse('auth-response', registerResult, 'Authentication');
                recordResult(registerResult.success);
            }

            async function testCompanies() {
                const response = document.getElementById('companies-response');
                response.innerHTML = '<div class="loading"></div> Testing companies...';

                // Test get all companies
                const getResult = await makeRequest('GET', '/companies');
                if (getResult.success && getResult.data.companies && getResult.data.companies.length > 0) {
                    testData.companyId = getResult.data.companies[0].id;
                }

                // Test create company
                const timestamp = Date.now();
                const createResult = await makeRequest('POST', '/companies', {
                    name: \`Test Company \${timestamp} Ltd\`,
                    category: 'Technology',
                    subcategory: 'Software Development',
                    tier: 'PREMIUM',
                    website: \`https://testcompany\${timestamp}.com\`,
                    description: 'A test company created for API testing purposes',
                    industry: 'Information Technology',
                    founded: 2020,
                    headquarters: 'Nairobi, Kenya',
                    employeeCount: '50-100',
                    revenue: 'KES 10M - 50M',
                    auctionEligible: true,
                    maxBidAmount: 1000000
                });

                if (createResult.success && createResult.data.id) {
                    testData.companyId = createResult.data.id;
                }

                updateResponse('companies-response', getResult, 'Companies');
                recordResult(getResult.success);
            }

            async function testSlots() {
                const response = document.getElementById('slots-response');
                response.innerHTML = '<div class="loading"></div> Testing slots...';

                // Test get all slots
                const getResult = await makeRequest('GET', '/slots');
                if (getResult.success && getResult.data.slots && getResult.data.slots.length > 0) {
                    // Find an available slot
                    const availableSlot = getResult.data.slots.find(slot => 
                        slot.status === 'AVAILABLE' || slot.status === 'AUCTION_ACTIVE'
                    );
                    if (availableSlot) {
                        testData.slotId = availableSlot.id;
                    }
                }

                // Test update slot
                if (testData.slotId) {
                    const updateResult = await makeRequest('PUT', \`/slots/\${testData.slotId}\`, {
                        reservePrice: 75000,
                        description: 'Updated test slot via API'
                    });
                }

                updateResponse('slots-response', getResult, 'Slots');
                recordResult(getResult.success);
            }

            async function testBidding() {
                const response = document.getElementById('bidding-response');
                response.innerHTML = '<div class="loading"></div> Testing bidding...';

                // Test get all bids
                const getBidsResult = await makeRequest('GET', '/bidding');
                
                // Test get active bids
                const getActiveResult = await makeRequest('GET', '/bidding/active');

                // Test place bid if we have required data
                let placeBidResult = null;
                if (testData.slotId && testData.companyId && testData.userId) {
                    // Get current bid amount and add 10000
                    const slotResult = await makeRequest('GET', \`/slots/\${testData.slotId}\`);
                    let bidAmount = 100000; // Default amount
                    if (slotResult.success && slotResult.data.currentBid) {
                        bidAmount = slotResult.data.currentBid + 10000;
                    }

                    placeBidResult = await makeRequest('POST', '/bidding', {
                        slotId: testData.slotId,
                        companyId: testData.companyId,
                        userId: testData.userId,
                        amount: bidAmount,
                        bidderInfo: {
                            contactPerson: 'John Doe',
                            phone: '+254700000000',
                            notes: 'Test bid for API validation'
                        }
                    });
                }

                updateResponse('bidding-response', getActiveResult, 'Bidding');
                recordResult(getActiveResult.success);
            }

            async function testFileUpload() {
                const response = document.getElementById('upload-response');
                response.innerHTML = '<div class="loading"></div> Testing file upload...';

                // Test list uploaded files
                const listResult = await makeRequest('GET', '/uploads/files');

                updateResponse('upload-response', listResult, 'File Upload');
                recordResult(listResult.success);
            }

            async function testARContent() {
                const response = document.getElementById('ar-response');
                response.innerHTML = '<div class="loading"></div> Testing AR content...';

                // Test get all AR content
                const getResult = await makeRequest('GET', '/ar-content');

                // Test create AR content if we have a slot
                let createResult = null;
                if (testData.slotId) {
                    createResult = await makeRequest('POST', '/ar-content', {
                        slotId: testData.slotId,
                        title: 'Test AR Content',
                        description: 'Test AR content for API validation',
                        contentType: 'LOGO_HOLOGRAM',
                        contentData: {
                            color: '#00ff00',
                            intensity: 0.8,
                            duration: 5000
                        }
                    });
                }

                updateResponse('ar-response', getResult, 'AR Content');
                recordResult(getResult.success);
            }

            async function testDevices() {
                const response = document.getElementById('devices-response');
                response.innerHTML = '<div class="loading"></div> Testing devices...';

                // Test get all devices
                const getResult = await makeRequest('GET', '/devices');

                // Test create device
                const timestamp = Date.now();
                const createResult = await makeRequest('POST', '/devices', {
                    deviceId: \`TEST-DEVICE-\${timestamp}\`,
                    deviceType: 'BEAMER',
                    name: 'Test Beamer Device',
                    status: 'ONLINE',
                    location: {
                        latitude: -1.2921,
                        longitude: 36.8219,
                        address: 'Nairobi, Kenya'
                    },
                    config: {
                        resolution: '1920x1080',
                        brightness: 80,
                        contrast: 70
                    }
                });

                updateResponse('devices-response', getResult, 'Devices');
                recordResult(getResult.success);
            }

            async function testAnalytics() {
                const response = document.getElementById('analytics-response');
                response.innerHTML = '<div class="loading"></div> Testing analytics...';

                // Test get analytics overview
                const overviewResult = await makeRequest('GET', '/analytics/overview');

                // Test get analytics events
                const eventsResult = await makeRequest('GET', '/analytics/events');

                // Test track analytics event
                const trackResult = await makeRequest('POST', '/analytics/track', {
                    eventType: 'SLOT_VIEW',
                    slotId: testData.slotId || 'SLOT-001',
                    companyId: testData.companyId || 'COMP-001',
                    metadata: {
                        duration: 30,
                        interaction: 'hover'
                    },
                    deviceInfo: {
                        device: 'desktop',
                        browser: 'chrome'
                    }
                });

                updateResponse('analytics-response', overviewResult, 'Analytics');
                recordResult(overviewResult.success);
            }

            async function runAllTests() {
                testResults = { total: 0, passed: 0, failed: 0 };
                testData = { companyId: null, slotId: null, userId: null };
                updateSummary();

                console.log('🚀 Starting comprehensive API test suite...');

                await testHealth();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testApiOverview();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testAuth();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testCompanies();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testSlots();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testBidding();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testFileUpload();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testARContent();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testDevices();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await testAnalytics();

                console.log('✅ All tests completed!');
                console.log(\`Results: \${testResults.passed}/\${testResults.total} passed (\${Math.round((testResults.passed / testResults.total) * 100)}%)\`);
            }
        </script>
    </body>
    </html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Setup Socket.IO handlers
    setupSocketHandlers(io);

    // Start server
    server.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`BeamerShow Backend Server running on port ${PORT}`);
      logger.info(`Socket.IO server initialized`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API Tester: http://localhost:${PORT}/api-tester`);
      logger.info(`Test all your APIs at: http://localhost:${PORT}/api-tester`);
      logger.info('Database info:');
      logger.info('Database connected successfully');
      logger.info('Database connection test passed');
    });

  } catch (error) {
    logger.error('Error occurred', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  const { disconnectDatabase } = await import('./lib/database');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  const { disconnectDatabase } = await import('./lib/database');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();
