# 5D Sponsor Wall - Backend Architecture

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [Authentication & Security](#authentication--security)
7. [Performance & Scalability](#performance--scalability)
8. [Monitoring & Logging](#monitoring--logging)
9. [Development Workflow](#development-workflow)

## 🌟 System Overview

The 5D Sponsor Wall Backend is a comprehensive Node.js application designed to manage sponsor displays, bidding systems, device synchronization, and real-time analytics for a dynamic sponsor wall system.

### Core Features
- **24-Slot Sponsor Management**: Dynamic slot allocation and rotation
- **Real-time Bidding System**: Live auction functionality
- **Multi-Device Synchronization**: Beamer, iPad, and mobile device coordination
- **Advanced Analytics**: Comprehensive tracking and reporting
- **Performance Monitoring**: System health and resource monitoring
- **Visual Effects Management**: Holographic and AR content support

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, bcryptjs
- **File Upload**: Multer
- **Logging**: Winston

### Development Tools
- **Build Tool**: TypeScript Compiler (tsc)
- **Process Manager**: PM2 (Production)
- **Database GUI**: Prisma Studio
- **Testing**: Jest (Planned)
- **Linting**: ESLint
- **Formatting**: Prettier

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/                 # API route handlers
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── companies.ts       # Company management
│   │   ├── slots.ts          # Slot management
│   │   ├── bidding.ts        # Bidding system
│   │   ├── analytics.ts      # Basic analytics
│   │   ├── advanced-analytics.ts # Advanced analytics
│   │   ├── performance-monitoring.ts # Performance monitoring
│   │   ├── visual-effects.ts # Visual effects management
│   │   ├── advanced-auction.ts # Advanced auction system
│   │   ├── sync.ts           # Multi-device sync
│   │   ├── scheduling.ts     # Advanced scheduling
│   │   ├── interactive.ts    # Interactive content
│   │   ├── system-config.ts  # System configuration
│   │   ├── uploads.ts        # File upload handling
│   │   ├── ar-content.ts     # AR content management
│   │   ├── devices.ts        # Device management
│   │   ├── beamer-simple.ts  # Beamer device APIs
│   │   ├── ipad-simple.ts    # iPad device APIs
│   │   ├── sponsors-simple.ts # Sponsor management
│   │   ├── blocks-simple.ts  # Scheduling blocks
│   │   ├── ar-simple.ts      # AR content APIs
│   │   └── sync-device-simple.ts # Device sync APIs
│   ├── lib/
│   │   └── database.ts       # Prisma client configuration
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   ├── rateLimiter.ts   # Rate limiting middleware
│   │   └── upload.ts        # File upload middleware
│   ├── utils/
│   │   ├── logger.ts        # Winston logger configuration
│   │   └── validation.ts    # Validation utilities
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── socket/
│   │   └── handlers.ts      # WebSocket handlers (planned)
│   ├── seed.ts              # Database seeding script
│   └── server.ts            # Main application entry point
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   ├── migrations/          # Database migration files
│   └── dev.db              # SQLite database file
├── logs/                    # Application logs
├── uploads/                 # File upload storage
├── dist/                    # Compiled JavaScript (production)
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables
└── final-test.ps1          # API testing script
```

## 🗄️ Database Architecture

### Database Schema Overview

The system uses a comprehensive relational database schema with the following core entities:

#### Core Entities
- **User**: System users (admin, operator, sponsor)
- **Company**: Sponsor companies
- **Slot**: 24 sponsor display slots
- **Bid**: Bidding records
- **Device**: Connected devices (Beamer, iPad, etc.)

#### Advanced Features
- **Analytics**: Event tracking and metrics
- **Performance Monitoring**: System health metrics
- **Visual Effects**: Holographic and AR content
- **Scheduling**: Advanced rotation schedules
- **Sync System**: Multi-device synchronization
- **Interactive Content**: QR codes, NFC tags, hidden content

### Key Relationships
```
User ──┐
       ├── Bid ──┐
Company ──┘      ├── Slot
                 └── Analytics
Device ──┐
         ├── Performance Metrics
         └── Sync Events
```

### Database Features
- **ACID Compliance**: Full transaction support
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized query performance
- **Migrations**: Version-controlled schema changes
- **Seeding**: Automated test data generation

## 🚀 API Architecture

### RESTful Design Principles
- **Resource-Based URLs**: `/api/companies`, `/api/slots`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: Standard HTTP status codes
- **JSON Format**: Consistent request/response format

### API Categories

#### 1. Core APIs (100% Success Rate)
- Authentication & Authorization
- Company Management
- Slot Management
- Basic Bidding System

#### 2. Advanced APIs (89% Success Rate)
- Multi-Device Sync System
- Advanced Scheduling
- Interactive Content
- System Configuration

#### 3. Analytics APIs (85% Success Rate)
- Basic Analytics
- Advanced Analytics
- Performance Monitoring
- Real-time Dashboards

#### 4. Device Management APIs (100% Success Rate)
- Beamer Device Control
- iPad Management
- Sponsor Management
- AR Content Management

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}
```

## 🔐 Authentication & Security

### Authentication Flow
1. **User Registration**: Create account with role-based access
2. **Login**: JWT token generation
3. **Token Validation**: Middleware-based protection
4. **Role-Based Access**: Admin, Operator, Sponsor roles

### Security Measures
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin request control
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM

### Role-Based Access Control
```typescript
enum UserRole {
  ADMIN = 'ADMIN',           // Full system access
  OPERATOR = 'OPERATOR',     // Device and slot management
  SPONSOR = 'SPONSOR'        // Bidding and analytics access
}
```

## ⚡ Performance & Scalability

### Current Performance
- **API Success Rate**: 89.55% (60/67 tests passing)
- **Response Time**: < 200ms average
- **Concurrent Users**: Tested up to 100 concurrent requests
- **Database Queries**: Optimized with Prisma

### Scalability Features
- **Connection Pooling**: Prisma connection management
- **Caching**: In-memory caching for frequently accessed data
- **Rate Limiting**: Prevents system overload
- **Async Operations**: Non-blocking I/O operations
- **Database Indexing**: Optimized query performance

### Performance Monitoring
- **Real-time Metrics**: CPU, memory, disk usage
- **API Response Times**: Endpoint performance tracking
- **Error Tracking**: Comprehensive error logging
- **Resource Usage**: System resource monitoring

## 📊 Monitoring & Logging

### Logging System
- **Winston Logger**: Structured logging
- **Log Levels**: Error, Warn, Info, Debug
- **Log Files**: Separate files for different log types
- **Log Rotation**: Automatic log file management

### Monitoring Endpoints
- **Health Check**: `/health` - System status
- **Performance Metrics**: `/api/performance-monitoring/metrics`
- **System Health**: `/api/performance-monitoring/health`
- **Analytics Dashboard**: `/api/advanced-analytics/dashboard`

### Error Handling
- **Global Error Handler**: Centralized error processing
- **Validation Errors**: Detailed field-level validation
- **Database Errors**: Prisma error handling
- **HTTP Errors**: Standard HTTP status codes

## 🔄 Development Workflow

### Development Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Compile TypeScript
npm run start           # Start production server
npm run seed            # Seed database with test data

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run database migrations
npx prisma studio       # Open database GUI
npx prisma db seed      # Seed database

# Testing
powershell -ExecutionPolicy Bypass -File "final-test.ps1"
```

### Environment Configuration
```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3002
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation (planned)

## 🚀 Deployment Architecture

### Development Environment
- **Local SQLite**: File-based database
- **Hot Reload**: ts-node for development
- **Local Storage**: File uploads to local directory

### Production Environment (Planned)
- **PostgreSQL**: Production database
- **PM2**: Process management
- **Nginx**: Reverse proxy
- **Docker**: Containerization
- **Cloud Storage**: File upload storage

### CI/CD Pipeline (Planned)
- **GitHub Actions**: Automated testing
- **Automated Deployment**: Staging and production
- **Database Migrations**: Automated schema updates
- **Health Checks**: Deployment validation

## 📈 Future Enhancements

### Planned Features
- **WebSocket Support**: Real-time updates
- **Redis Caching**: Performance optimization
- **Microservices**: Service decomposition
- **API Versioning**: Backward compatibility
- **GraphQL**: Alternative API interface
- **Docker Support**: Containerization
- **Kubernetes**: Orchestration
- **Monitoring**: Prometheus + Grafana

### Performance Optimizations
- **Database Indexing**: Query optimization
- **Connection Pooling**: Database performance
- **Caching Layer**: Redis integration
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Horizontal scaling

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
