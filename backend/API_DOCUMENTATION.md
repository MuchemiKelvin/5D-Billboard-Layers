# 5D Sponsor Wall - Backend API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Core APIs](#core-apis)
4. [Advanced APIs](#advanced-apis)
5. [Device Management APIs](#device-management-apis)
6. [Analytics & Monitoring APIs](#analytics--monitoring-apis)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## 🌟 Overview

The 5D Sponsor Wall Backend provides a comprehensive REST API for managing sponsor displays, bidding systems, device synchronization, and analytics. Built with Node.js, Express, TypeScript, and Prisma ORM.

**Base URL**: `http://localhost:3002` (Development)
**API Version**: v1
**Content Type**: `application/json`

## 🔐 Base URL & Authentication

### Base URL
```
http://localhost:3002/api
```

### Authentication
Most endpoints require authentication via JWT tokens:
```http
Authorization: Bearer <jwt_token>
```

## 🏗️ Core APIs

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-08T14:45:58.331Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

### 2. Authentication

#### Register User
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "username": "sponsor_user",
  "email": "user@example.com",
  "password": "secure_password",
  "role": "SPONSOR"
}
```

#### Login User
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "USER-001",
      "username": "sponsor_user",
      "email": "user@example.com",
      "role": "SPONSOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Companies Management

#### Get All Companies
```http
GET /api/companies
```

#### Get Company by ID
```http
GET /api/companies/:id
```

#### Create Company
```http
POST /api/companies
```
**Request Body:**
```json
{
  "name": "TechCorp Solutions",
  "description": "Leading technology solutions provider",
  "logo": "https://example.com/logo.png",
  "website": "https://techcorp.com",
  "contactEmail": "contact@techcorp.com",
  "contactPhone": "+254700000000"
}
```

### 4. Slots Management

#### Get All Slots
```http
GET /api/slots
```

#### Get Slot by ID
```http
GET /api/slots/:id
```

#### Update Slot
```http
PUT /api/slots/:id
```
**Request Body:**
```json
{
  "currentSponsor": "COMP-001",
  "slotType": "PREMIUM",
  "isActive": true
}
```

### 5. Bidding System

#### Place Bid
```http
POST /api/bidding
```
**Request Body:**
```json
{
  "slotId": "SLOT-001",
  "companyId": "COMP-001",
  "userId": "USER-001",
  "amount": 150000,
  "bidderInfo": {
    "contactPerson": "John Doe",
    "phone": "+254700000000",
    "notes": "Premium slot bid"
  }
}
```

#### Get Bids for Slot
```http
GET /api/bidding/slot/:slotId
```

#### Get User Bids
```http
GET /api/bidding/user/:userId
```

## 🚀 Advanced APIs

### 6. Multi-Device Sync System

#### Register Device
```http
POST /api/sync/device/register
```
**Request Body:**
```json
{
  "deviceId": "BEAMER-001",
  "deviceType": "BEAMER",
  "name": "Main Projector Display",
  "location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Nairobi, Kenya"
  },
  "capabilities": {
    "resolution": "1920x1080",
    "brightness": 80
  }
}
```

#### Sync Device State
```http
POST /api/sync/device/:deviceId/sync
```
**Request Body:**
```json
{
  "state": {
    "currentSlot": "SLOT-001",
    "rotationSpeed": 30,
    "isActive": true
  }
}
```

#### Broadcast to All Devices
```http
POST /api/sync/device/broadcast
```
**Request Body:**
```json
{
  "message": "System maintenance in 5 minutes",
  "type": "MAINTENANCE_ALERT",
  "priority": "HIGH"
}
```

### 7. Advanced Scheduling System

#### Create Schedule
```http
POST /api/scheduling/schedules
```
**Request Body:**
```json
{
  "name": "Morning Rotation Schedule",
  "description": "Premium slots rotation for morning hours",
  "type": "ROTATION",
  "startTime": "2025-09-08T06:00:00Z",
  "endTime": "2025-09-08T12:00:00Z",
  "isRecurring": true,
  "recurrencePattern": "DAILY"
}
```

#### Get Active Schedules
```http
GET /api/scheduling/schedules/active
```

#### Start Rotation
```http
POST /api/scheduling/rotation/start
```

### 8. Interactive Content System

#### Create Hidden Content
```http
POST /api/interactive/hidden-content
```
**Request Body:**
```json
{
  "slotId": "SLOT-001",
  "contentType": "VIDEO",
  "title": "Exclusive Sponsor Video",
  "description": "Behind the scenes content",
  "content": "https://example.com/video.mp4",
  "isActive": true
}
```

#### Create QR Code
```http
POST /api/interactive/qr-codes
```
**Request Body:**
```json
{
  "slotId": "SLOT-001",
  "data": "https://sponsor.com/special-offer",
  "title": "Special Offer QR",
  "description": "Scan for exclusive discount"
}
```

### 9. System Configuration

#### Get System Config
```http
GET /api/system-config
```

#### Update System Config
```http
PUT /api/system-config/:key
```
**Request Body:**
```json
{
  "value": {
    "seconds": 45
  },
  "description": "Updated rotation speed"
}
```

## 📱 Device Management APIs

### 10. Beamer Device Management

#### Get Beamer Config
```http
GET /api/beamer/config/:deviceId
```

#### Update Beamer Config
```http
PUT /api/beamer/config/:deviceId
```

#### Get Beamer Status
```http
GET /api/beamer/status
```

### 11. iPad Device Management

#### Get iPad Config
```http
GET /api/ipad/config/:deviceId
```

#### Update iPad Location
```http
POST /api/ipad/location
```

#### Get iPad Status
```http
GET /api/ipad/status
```

### 12. Sponsor Management

#### Get All Sponsors
```http
GET /api/sponsors
```

#### Get Sponsor Stats
```http
GET /api/sponsors/:id/stats
```

### 13. Scheduling Blocks

#### Get Active Blocks
```http
GET /api/blocks/active
```

#### Get Block Stats
```http
GET /api/blocks/stats
```

### 14. AR Content Management

#### Get AR Models
```http
GET /api/ar/models
```

#### Get AR Triggers
```http
GET /api/ar/triggers
```

## 📊 Analytics & Monitoring APIs

### 15. Basic Analytics

#### Track Analytics Event
```http
POST /api/analytics/events
```
**Request Body:**
```json
{
  "eventType": "SLOT_VIEW",
  "slotId": "SLOT-001",
  "userId": "USER-001",
  "metadata": {
    "timestamp": "2025-09-08T14:45:58.331Z",
    "source": "mobile_app"
  }
}
```

#### Get Slot Analytics
```http
GET /api/analytics/slots/:slotId
```

#### Get Company Analytics
```http
GET /api/analytics/companies/:companyId
```

### 16. Advanced Analytics

#### Get Analytics Overview
```http
GET /api/advanced-analytics/overview
```

#### Get Performance Metrics
```http
GET /api/advanced-analytics/performance
```

#### Get Engagement Analytics
```http
GET /api/advanced-analytics/engagement
```

#### Get Conversion Tracking
```http
GET /api/advanced-analytics/conversion
```

### 17. Performance Monitoring

#### Get Performance Metrics
```http
GET /api/performance-monitoring/metrics
```

#### Create Performance Metric
```http
POST /api/performance-monitoring/metrics
```
**Request Body:**
```json
{
  "deviceId": "DEV-001",
  "metricType": "CPU_USAGE",
  "value": 75.5,
  "unit": "percent",
  "timestamp": "2025-09-08T14:45:58.331Z"
}
```

#### Get System Health
```http
GET /api/performance-monitoring/health
```

#### Create Performance Alert
```http
POST /api/performance-monitoring/alerts
```
**Request Body:**
```json
{
  "alertType": "THRESHOLD_EXCEEDED",
  "severity": "WARNING",
  "title": "High CPU Usage",
  "message": "CPU usage exceeded 80%",
  "metricType": "CPU_USAGE",
  "threshold": 80,
  "currentValue": 85.5,
  "deviceId": "DEV-001"
}
```

### 18. Advanced Auction System

#### Create Auction Session
```http
POST /api/advanced-auction/sessions
```
**Request Body:**
```json
{
  "name": "Premium Slot Auction",
  "description": "Auction for premium sponsor slots",
  "startTime": "2025-09-08T17:00:00Z",
  "endTime": "2025-09-08T19:00:00Z",
  "reservePrice": 50000,
  "bidIncrement": 5000,
  "autoExtend": true,
  "extendDuration": 300
}
```

#### Get Active Auctions
```http
GET /api/advanced-auction/active
```

#### Get Auction Statistics
```http
GET /api/advanced-auction/statistics
```

### 19. Advanced Visual Effects

#### Get Visual Effects
```http
GET /api/visual-effects/effects
```

#### Create Visual Effect
```http
POST /api/visual-effects/effects
```
**Request Body:**
```json
{
  "name": "Premium Hologram",
  "type": "HOLOGRAM",
  "description": "Advanced holographic display",
  "config": {
    "intensity": 0.8,
    "color": "#00ff00",
    "animation": "pulse"
  },
  "isActive": true
}
```

#### Get Hologram Configurations
```http
GET /api/visual-effects/holograms
```

#### Get Animation Presets
```http
GET /api/visual-effects/animations
```

## ❌ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2025-09-08T14:45:58.331Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Examples

#### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Slot not found",
  "timestamp": "2025-09-08T14:45:58.331Z"
}
```

## 🚦 Rate Limiting

- **General APIs**: 100 requests per minute per IP
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per minute per IP
- **Analytics**: 1000 requests per minute per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1631020800
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in cents (e.g., 150000 = $1,500.00)
- Pagination is available for list endpoints with `page` and `limit` parameters
- Most endpoints support filtering with query parameters
- File uploads are limited to 10MB per file
- JWT tokens expire after 24 hours

## 🔗 Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)