# BeamerShow 24-Slot System - API Documentation

## 🚀 Overview

The BeamerShow API provides comprehensive endpoints for managing a 24-slot rotating advertisement system with AR/AI/Hologram capabilities. This RESTful API supports real-time synchronization, content management, analytics, and live bidding.

**Base URL**: `http://localhost:5000/api`  
**Version**: 2.0.0  
**Authentication**: JWT Bearer Token  
**Rate Limiting**: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth)

## 🔐 Authentication

### JWT Token Format
```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- **Access Token**: 24 hours (configurable)
- **Refresh Token**: 7 days (configurable)

## 📋 API Endpoints

### 1. API Overview
**GET** `/api` - Get complete API documentation and endpoint list

**Response Example:**
```json
{
  "name": "BeamerShow 24-Slot System API",
  "version": "2.0.0",
  "description": "Complete API for managing 24-slot rotating advertisement system with AR/AI/Hologram capabilities",
  "baseUrl": "/api",
  "endpoints": { ... }
}
```

---

### 2. Authentication

#### User Registration
**POST** `/api/auth/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "company": "TechCorp",
  "role": "operator"
}
```

#### User Login
**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "operator"
    }
  }
}
```

---

### 3. Slots Management

#### Get All Slots
**GET** `/api/slots`

**Query Parameters:**
- `status` - Filter by slot status
- `type` - Filter by slot type
- `active` - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "slot-1",
      "slotNumber": 1,
      "slotType": "regular",
      "status": "active",
      "sponsor": {
        "id": "sponsor-1",
        "name": "TechCorp"
      },
      "layers": {
        "layer-1-static": { "isActive": true, "content": "logo.png" },
        "layer-2-hologram": { "isActive": false, "content": null },
        "layer-3-ar": { "isActive": false, "content": null }
      }
    }
  ]
}
```

#### Create New Slot
**POST** `/api/slots` *(Requires Authentication)*
```json
{
  "slotNumber": 25,
  "slotType": "premium",
  "sponsorId": "sponsor-1",
  "layers": {
    "layer-1-static": { "isActive": true, "content": "new-logo.png" }
  }
}
```

---

### 4. Sponsor Management

#### Get All Sponsors
**GET** `/api/sponsors`

**Query Parameters:**
- `category` - Filter by sponsor category
- `tier` - Filter by sponsor tier
- `active` - Filter by active status

#### Create New Sponsor
**POST** `/api/sponsors` *(Requires Authentication)*
```json
{
  "name": "NewBrand",
  "company": "NewBrand Corp",
  "category": "technology",
  "tier": "premium",
  "description": "Innovative tech solutions"
}
```

#### Upload Sponsor Assets
**POST** `/api/sponsors/:id/assets` *(Requires Authentication)*
```multipart/form-data
logo: [file],
hologramVideo: [file],
arModel: [file]
```

---

### 5. Block Management

#### Get All Blocks
**GET** `/api/blocks`

**Query Parameters:**
- `status` - Filter by block status
- `active` - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Morning Block",
      "startTime": "06:00",
      "endTime": "10:00",
      "duration": 4,
      "isActive": true,
      "currentSlotIndex": 0,
      "totalSlots": 6,
      "status": "active"
    }
  ]
}
```

#### Create New Block
**POST** `/api/blocks` *(Requires Authentication)*
```json
{
  "name": "Night Block",
  "startTime": "22:00",
  "endTime": "02:00",
  "duration": 4,
  "autoRotate": true,
  "rotationInterval": 30
}
```

#### Activate Block
**POST** `/api/blocks/:id/activate` *(Requires Authentication)*

#### Rotate Slots in Block
**POST** `/api/blocks/:id/rotate` *(Requires Authentication)*
```json
{
  "direction": "next" // or "previous"
}
```

---

### 6. AR Content Management

#### Get All AR Content
**GET** `/api/ar`

**Query Parameters:**
- `slotId` - Filter by slot ID
- `triggerType` - Filter by trigger type (qr, nfc, manual)
- `category` - Filter by content category
- `active` - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Product Showcase AR",
      "modelType": "gltf",
      "modelUrl": "/uploads/ar-models/product-showcase.gltf",
      "triggerType": "qr",
      "triggerId": "qr-001",
      "slotId": "15",
      "isActive": true,
      "settings": {
        "scale": 1.0,
        "animations": ["idle", "interact"],
        "interactions": ["tap", "swipe", "rotate"]
      }
    }
  ]
}
```

#### Create AR Content
**POST** `/api/ar` *(Requires Authentication)*
```json
{
  "name": "New AR Experience",
  "description": "Interactive 3D showcase",
  "modelType": "glb",
  "triggerType": "qr",
  "slotId": "10",
  "isActive": true,
  "settings": {
    "scale": 1.2,
    "animations": ["intro", "loop"],
    "interactions": ["gaze", "gesture"]
  }
}
```

#### Activate AR Content
**POST** `/api/ar/:id/activate`
```json
{
  "deviceId": "device-123",
  "deviceType": "mobile",
  "location": "main-hall"
}
```

#### Process AR Scan/Trigger
**POST** `/api/ar/scan`
```json
{
  "triggerId": "qr-001",
  "triggerType": "qr",
  "deviceId": "device-123",
  "deviceType": "mobile"
}
```

---

### 7. Live Bidding System

#### Get All Active Bids
**GET** `/api/bidding`

**Query Parameters:**
- `slotId` - Filter by slot ID
- `status` - Filter by bid status
- `type` - Filter by bid type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "slotId": "8",
      "slotNumber": 8,
      "sponsorName": "TechCorp",
      "bidAmount": 1500.00,
      "currency": "USD",
      "bidStatus": "active",
      "currentHighestBid": 1500.00,
      "totalBids": 3,
      "endTime": "2024-01-01T14:00:00Z"
    }
  ]
}
```

#### Place New Bid
**POST** `/api/bidding` *(Requires Authentication)*
```json
{
  "slotId": "8",
  "bidAmount": 1600.00,
  "currency": "USD",
  "bidType": "premium",
  "autoExtend": true,
  "extendThreshold": 5
}
```

#### Get Active Bidding Sessions
**GET** `/api/bidding/active`

**Response includes time remaining and expiration warnings:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "timeRemaining": 1800000,
      "timeRemainingFormatted": "30m 0s",
      "isExpiringSoon": false
    }
  ]
}
```

#### Get Bidding History
**GET** `/api/bidding/history`

**Query Parameters:**
- `slotId` - Filter by slot ID
- `sponsorId` - Filter by sponsor ID
- `limit` - Limit results (default: 50)

---

### 8. Analytics & Reporting

#### Get Analytics Overview
**GET** `/api/analytics/overview` *(Requires Authentication)*

**Query Parameters:**
- `period` - Time period (24h, 7d, 30d, 1y)

#### Get Slot Performance Analytics
**GET** `/api/analytics/slots/performance` *(Requires Authentication)*

#### Get Sponsor Performance Analytics
**GET** `/api/analytics/sponsors/performance` *(Requires Authentication)*

#### Get Real-time Analytics
**GET** `/api/analytics/realtime` *(Requires Authentication)*

#### Export Analytics Data
**POST** `/api/analytics/export` *(Requires Authentication)*
```json
{
  "format": "csv", // or "json"
  "period": "7d",
  "metrics": ["views", "scans", "ar_activations"]
}
```

---

### 9. Device Synchronization

#### Get Sync Status
**GET** `/api/sync/status` *(Requires Authentication)*

#### Get Connected Devices
**GET** `/api/sync/devices` *(Requires Authentication)*

#### Force Sync to Device
**POST** `/api/sync/device/:deviceId/sync` *(Requires Authentication)*

#### Broadcast Message to All Devices
**POST** `/api/sync/broadcast` *(Requires Authentication)*
```json
{
  "message": "System maintenance in 5 minutes",
  "type": "warning",
  "priority": "high"
}
```

---

### 10. System Management

#### Get System Status
**GET** `/api/system/status`

#### Get System Health
**GET** `/api/system/health`

#### Get System Configuration
**GET** `/api/system/config` *(Requires Authentication)*

#### Update System Configuration
**PUT** `/api/system/config` *(Requires Admin)*
```json
{
  "slotRotationInterval": 20000,
  "arRotationTimesPerDay": 6,
  "autoRotationEnabled": true
}
```

---

## 📡 WebSocket Events

### Client to Server Events

#### Device Registration
```javascript
socket.emit('register_device', {
  deviceId: 'device-123',
  deviceType: 'tablet',
  location: 'main-hall',
  capabilities: ['ar', 'hologram', 'qr_scan']
});
```

#### Slot View Tracking
```javascript
socket.emit('slot_view', {
  slotId: 'slot-1',
  deviceId: 'device-123',
  timestamp: new Date().toISOString()
});
```

#### AR Content Activation
```javascript
socket.emit('ar_activation', {
  contentId: 'ar-1',
  deviceId: 'device-123',
  activationTime: new Date().toISOString()
});
```

#### Bid Placement
```javascript
socket.emit('bid_place', {
  slotId: 'slot-8',
  bidAmount: 1600.00,
  currency: 'USD',
  sponsorId: 'sponsor-1'
});
```

### Server to Client Events

#### System Status Updates
```javascript
socket.on('system_status', (data) => {
  console.log('System status:', data);
});
```

#### Slot Updates
```javascript
socket.on('slot_update', (data) => {
  console.log('Slot updated:', data);
});
```

#### AR Content Triggers
```javascript
socket.on('ar_trigger', (data) => {
  console.log('AR content triggered:', data);
});
```

#### Bid Updates
```javascript
socket.on('bid_update', (data) => {
  console.log('Bid updated:', data);
});
```

#### Emergency Broadcasts
```javascript
socket.on('emergency_broadcast', (data) => {
  console.log('Emergency message:', data);
});
```

---

## 🔧 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error

---

## 📊 Rate Limiting

### Limits by Endpoint Type
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Uploads**: 10 requests per 15 minutes
- **Socket Connections**: 50 connections per 15 minutes

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:5000/api/slots
```

### Test WebSocket Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Register device
  socket.emit('register_device', {
    deviceId: 'test-device',
    deviceType: 'tablet'
  });
});
```

---

## 📚 SDKs & Libraries

### JavaScript/Node.js
```bash
npm install axios socket.io-client
```

### Python
```bash
pip install requests websocket-client
```

### cURL Examples
```bash
# Get all slots
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/slots"

# Create new sponsor
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"NewSponsor","company":"NewCorp"}' \
  "http://localhost:5000/api/sponsors"
```

---

## 🔐 Security

### Best Practices
1. **Always use HTTPS in production**
2. **Store JWT tokens securely**
3. **Implement proper CORS policies**
4. **Validate all input data**
5. **Use rate limiting**
6. **Monitor API usage**

### CORS Configuration
```javascript
// Frontend configuration
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Include credentials for authenticated requests
fetch(`${API_BASE_URL}/slots`, {
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📈 Performance

### Optimization Tips
1. **Use pagination for large datasets**
2. **Implement caching strategies**
3. **Use WebSocket for real-time updates**
4. **Optimize database queries**
5. **Monitor response times**

### Pagination Example
```bash
GET /api/slots?page=1&limit=10&sort=slotNumber&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🆘 Support

### Getting Help
1. **Check the health endpoint**: `/health`
2. **Review server logs** in `./logs` directory
3. **Check API documentation**: `/api`
4. **Monitor rate limiting** headers
5. **Verify authentication** token validity

### Common Issues
- **401 Unauthorized**: Check JWT token and expiration
- **429 Too Many Requests**: Wait for rate limit reset
- **500 Internal Server Error**: Check server logs
- **WebSocket Connection Failed**: Verify CORS and Socket.IO configuration

---

## 🔄 Changelog

### Version 2.0.0
- Complete API implementation
- 24-slot management system
- Real-time WebSocket support
- AR content management
- Live bidding system
- Comprehensive analytics
- Device synchronization
- Role-based access control

---

This API documentation covers all major endpoints and features of the BeamerShow 24-Slot System. For additional information, refer to the main README.md file or create an issue in the project repository.
