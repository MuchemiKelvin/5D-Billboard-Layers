# 5D Sponsor Wall - Testing Guide

## 📋 Table of Contents
1. [Testing Overview](#testing-overview)
2. [API Testing](#api-testing)
3. [Database Testing](#database-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Automated Testing](#automated-testing)
7. [Test Data Management](#test-data-management)
8. [Troubleshooting](#troubleshooting)

## 🧪 Testing Overview

The 5D Sponsor Wall Backend includes comprehensive testing capabilities to ensure system reliability, performance, and security.

### Current Test Status
- **Total Tests**: 67
- **Passing**: 60 (89.55%)
- **Failing**: 7 (10.45%)
- **Core Systems**: 100% success rate
- **Advanced Features**: 85-90% success rate

### Test Categories
1. **Core APIs** (100% success)
2. **Advanced APIs** (89% success)
3. **Device Management** (100% success)
4. **Analytics & Monitoring** (85% success)
5. **Performance Testing** (90% success)

## 🚀 API Testing

### Automated API Testing Script

The project includes a comprehensive PowerShell testing script (`final-test.ps1`) that tests all API endpoints.

#### Running API Tests
```powershell
# Navigate to backend directory
cd backend

# Run all API tests
powershell -ExecutionPolicy Bypass -File "final-test.ps1"

# Expected output:
# TEST RESULTS SUMMARY
# ====================
# Total Tests: 67
# Passed: 60
# Failed: 7
# Success Rate: 89.55%
```

#### Test Categories Covered

##### 1. Health & System (100% Success)
- Health Check
- API Overview
- System Status

##### 2. Authentication (100% Success)
- User Registration
- User Login
- Token Validation
- Password Reset

##### 3. Core Management (100% Success)
- Company Management
- Slot Management
- User Management
- Device Management

##### 4. Bidding System (95% Success)
- Place Bid
- Get Bids
- Bid History
- Bid Validation

##### 5. File Upload System (100% Success)
- File Upload
- File Management
- File Validation

##### 6. AR Content System (100% Success)
- AR Content Creation
- AR Content Retrieval
- AR Content Management

##### 7. Analytics System (90% Success)
- Event Tracking
- Analytics Retrieval
- Performance Metrics

##### 8. Advanced Features (85% Success)
- Multi-Device Sync
- Advanced Scheduling
- Interactive Content
- System Configuration

### Manual API Testing

#### Using curl
```bash
# Health check
curl http://localhost:3002/health

# Get all companies
curl http://localhost:3002/api/companies

# Place a bid
curl -X POST http://localhost:3002/api/bidding \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "SLOT-001",
    "companyId": "COMP-001",
    "userId": "USER-001",
    "amount": 150000,
    "bidderInfo": {
      "contactPerson": "John Doe",
      "phone": "+254700000000"
    }
  }'
```

#### Using PowerShell
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3002/health"

# Test companies endpoint
Invoke-RestMethod -Uri "http://localhost:3002/api/companies"

# Test bidding endpoint
$body = @{
    slotId = "SLOT-001"
    companyId = "COMP-001"
    userId = "USER-001"
    amount = 150000
    bidderInfo = @{
        contactPerson = "John Doe"
        phone = "+254700000000"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/bidding" -Method POST -Body $body -ContentType "application/json"
```

### API Response Validation

#### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2025-09-08T14:45:58.331Z"
}
```

#### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2025-09-08T14:45:58.331Z"
}
```

## 🗄️ Database Testing

### Database Connection Testing
```bash
# Test database connection
npx prisma db pull

# Check database schema
npx prisma studio

# Verify seeded data
npx prisma db seed
```

### Database Query Testing
```typescript
// Test database queries
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Test user creation
    const user = await prisma.user.create({
      data: {
        username: 'test_user',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'SPONSOR'
      }
    });
    console.log('User created:', user);

    // Test slot query
    const slots = await prisma.slot.findMany({
      where: { isActive: true },
      include: { company: true }
    });
    console.log('Active slots:', slots.length);

    // Test analytics query
    const analytics = await prisma.analytics.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log('Analytics events (24h):', analytics);

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
```

### Database Performance Testing
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM slots WHERE is_active = true;

-- Test index usage
EXPLAIN ANALYZE SELECT * FROM analytics WHERE event_type = 'SLOT_VIEW' AND timestamp > NOW() - INTERVAL '1 day';

-- Test join performance
EXPLAIN ANALYZE SELECT s.*, c.name FROM slots s LEFT JOIN companies c ON s.current_sponsor = c.id;
```

## ⚡ Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - get:
          url: "/health"
      - get:
          url: "/api/companies"
      - get:
          url: "/api/slots"
EOF

# Run load test
artillery run load-test.yml
```

### Memory and CPU Testing
```bash
# Monitor memory usage
pm2 monit

# Check system resources
htop
free -m
df -h

# Test memory leaks
node --inspect dist/server.js
```

### Response Time Testing
```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3002/health

# Create curl format file
cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

## 🔒 Security Testing

### Authentication Testing
```bash
# Test JWT token validation
curl -H "Authorization: Bearer invalid_token" http://localhost:3002/api/companies

# Test rate limiting
for i in {1..150}; do curl http://localhost:3002/api/companies; done

# Test SQL injection
curl "http://localhost:3002/api/companies?id=1'; DROP TABLE users; --"
```

### Input Validation Testing
```bash
# Test invalid email format
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "test"}'

# Test XSS prevention
curl -X POST http://localhost:3002/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>"}'
```

### File Upload Security Testing
```bash
# Test file type validation
curl -X POST http://localhost:3002/api/uploads \
  -F "file=@malicious.exe"

# Test file size limits
curl -X POST http://localhost:3002/api/uploads \
  -F "file=@large-file.zip"
```

## 🤖 Automated Testing

### Jest Unit Testing (Planned)
```typescript
// tests/auth.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Authentication', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'SPONSOR'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### Integration Testing
```typescript
// tests/integration.test.ts
describe('Bidding System Integration', () => {
  test('should place bid and update slot', async () => {
    // Create test data
    const company = await createTestCompany();
    const user = await createTestUser();
    const slot = await createTestSlot();

    // Place bid
    const bidResponse = await request(app)
      .post('/api/bidding')
      .send({
        slotId: slot.id,
        companyId: company.id,
        userId: user.id,
        amount: 150000
      });

    expect(bidResponse.status).toBe(201);

    // Verify slot update
    const slotResponse = await request(app)
      .get(`/api/slots/${slot.id}`);

    expect(slotResponse.body.data.currentSponsor).toBe(company.id);
  });
});
```

### End-to-End Testing
```typescript
// tests/e2e.test.ts
describe('Complete Sponsor Wall Flow', () => {
  test('should handle complete sponsor lifecycle', async () => {
    // 1. Register company
    const company = await registerCompany();
    
    // 2. Place bid
    const bid = await placeBid(company.id);
    
    // 3. Win auction
    await winAuction(bid.id);
    
    // 4. Update slot
    await updateSlot(bid.slotId, company.id);
    
    // 5. Track analytics
    await trackAnalytics(bid.slotId, company.id);
    
    // 6. Verify complete flow
    const finalSlot = await getSlot(bid.slotId);
    expect(finalSlot.currentSponsor).toBe(company.id);
  });
});
```

## 📊 Test Data Management

### Test Data Seeding
```bash
# Seed database with test data
npm run seed

# Custom seed for specific tests
npx ts-node scripts/seed-test-data.ts
```

### Test Data Cleanup
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.analytics.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.slot.updateMany({
    data: { currentSponsor: null }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Mock Data Generation
```typescript
// utils/test-data.ts
export const generateTestCompany = () => ({
  name: `Test Company ${Math.random().toString(36).substr(2, 9)}`,
  description: 'Test company description',
  logo: 'https://example.com/logo.png',
  website: 'https://testcompany.com',
  contactEmail: `test${Math.random()}@example.com`,
  contactPhone: '+254700000000'
});

export const generateTestBid = (slotId: string, companyId: string, userId: string) => ({
  slotId,
  companyId,
  userId,
  amount: Math.floor(Math.random() * 100000) + 50000,
  bidderInfo: {
    contactPerson: 'Test Person',
    phone: '+254700000000',
    notes: 'Test bid'
  }
});
```

## 🔧 Troubleshooting

### Common Test Failures

#### 1. Database Connection Issues
```bash
# Check database file permissions
ls -la prisma/dev.db

# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

#### 2. Port Already in Use
```bash
# Find process using port 3002
lsof -i :3002

# Kill process
kill -9 <PID>
```

#### 3. Authentication Failures
```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify user exists in database
npx prisma studio
```

#### 4. File Upload Issues
```bash
# Check upload directory
ls -la uploads/

# Fix permissions
chmod 755 uploads/
```

### Debug Mode Testing
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Test with verbose output
DEBUG=* npm run dev

# Test specific modules
DEBUG=prisma:* npm run dev
```

### Performance Debugging
```bash
# Monitor memory usage
node --inspect --max-old-space-size=4096 dist/server.js

# Profile CPU usage
node --prof dist/server.js

# Analyze heap dumps
node --inspect-brk dist/server.js
```

## 📋 Testing Checklist

### Pre-Testing Setup
- [ ] Database seeded with test data
- [ ] Environment variables configured
- [ ] Server running on correct port
- [ ] All dependencies installed
- [ ] Test data cleaned up

### API Testing
- [ ] Health check endpoint working
- [ ] Authentication endpoints tested
- [ ] Core CRUD operations tested
- [ ] Error handling validated
- [ ] Response format verified

### Performance Testing
- [ ] Response times under 200ms
- [ ] Memory usage stable
- [ ] No memory leaks detected
- [ ] Database queries optimized
- [ ] Rate limiting working

### Security Testing
- [ ] Authentication required for protected endpoints
- [ ] Input validation working
- [ ] SQL injection prevented
- [ ] XSS protection active
- [ ] File upload security validated

### Integration Testing
- [ ] End-to-end workflows tested
- [ ] Database transactions working
- [ ] External service integration tested
- [ ] Error recovery mechanisms tested
- [ ] Data consistency maintained

## 🔗 Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
