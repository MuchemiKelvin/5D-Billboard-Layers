# 🎯 BeamerShow Backend - 24-Slot System

A comprehensive TypeScript backend for the 5D Sponsor Wall with AR/AI/Hologram capabilities.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── lib/                    # Core utilities
│   │   └── database.ts         # Database connection & Prisma client
│   ├── middleware/             # Express middleware
│   │   └── upload.ts           # File upload handling
│   ├── models/                 # Data models (JavaScript - legacy)
│   │   ├── Analytics.js
│   │   ├── Block.js
│   │   ├── Slot.js
│   │   └── Sponsor.js
│   ├── routes/                 # API routes (TypeScript)
│   │   ├── analytics.ts        # Analytics tracking
│   │   ├── api.ts              # Main API routes
│   │   ├── ar-content.ts       # AR content management
│   │   ├── auth.ts             # Authentication
│   │   ├── bidding.ts          # Live bidding system
│   │   ├── companies.ts        # Company management
│   │   ├── devices.ts          # Device management
│   │   ├── slots.ts            # Slot management
│   │   └── uploads.ts          # File uploads
│   ├── services/               # Business logic (JavaScript - legacy)
│   │   ├── FirebaseService.js
│   │   └── SlotScheduler.js
│   ├── socket/                 # WebSocket handlers
│   │   └── handlers.ts
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   └── logger.ts
│   ├── seed.ts                 # Database seeding
│   └── server.ts               # Main server file
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                     # Static assets
│   ├── ar-effects/
│   └── hologram-effects/
├── uploads/                    # File uploads directory
├── logs/                       # Application logs
├── dist/                       # Compiled JavaScript (auto-generated)
├── package.json
├── tsconfig.json
├── .env                        # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Prisma database

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed
```

### Development
```bash
# Start development server (TypeScript)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

### API Testing
```bash
# Run comprehensive API tests
powershell -ExecutionPolicy Bypass -File "final-test.ps1"

# Or use the built-in API tester
# Visit: http://localhost:3002/api-tester
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run dev` - Run development server with hot reload
- `npm run seed` - Seed database with sample data
- `npm test` - Run test suite

## 📡 API Endpoints

### Core System
- `GET /health` - Health check
- `GET /api` - API overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Slots
- `GET /api/slots` - List all slots
- `GET /api/slots/:id` - Get slot details
- `PUT /api/slots/:id` - Update slot
- `POST /api/slots/:id/assign` - Assign company to slot

### Bidding
- `GET /api/bidding` - List all bids
- `GET /api/bidding/active` - Get active bids
- `POST /api/bidding` - Place bid
- `PUT /api/bidding/:id` - Update bid

### File Uploads
- `POST /api/uploads/sponsors/:companyId` - Upload sponsor assets
- `POST /api/uploads/ar-content/:slotId` - Upload AR content
- `GET /api/uploads/files` - List uploaded files

### AR Content
- `GET /api/ar-content` - List AR content
- `POST /api/ar-content` - Create AR content
- `PUT /api/ar-content/:id` - Update AR content

### Devices
- `GET /api/devices` - List devices
- `POST /api/devices` - Register device
- `PUT /api/devices/:id` - Update device status

### Analytics
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/analytics/events` - Analytics events
- `POST /api/analytics/track` - Track event

## 🔧 Configuration

### Environment Variables
```env
PORT=3002
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:3000"
```

### Database
The project uses Prisma ORM with SQLite for development. The schema includes:
- Users (authentication)
- Companies (sponsor companies)
- Slots (24-slot grid)
- Bids (bidding system)
- ARContent (AR effects)
- Devices (device management)
- Analytics (tracking)

## 🎨 Features

### Core Features
- ✅ 24-slot grid management
- ✅ Live bidding system
- ✅ Company management
- ✅ File upload system
- ✅ AR content management
- ✅ Device management
- ✅ Analytics tracking
- ✅ WebSocket support
- ✅ Authentication system

### Advanced Features
- ✅ TypeScript throughout
- ✅ Comprehensive API testing
- ✅ Built-in API tester UI
- ✅ File upload with validation
- ✅ Real-time bidding updates
- ✅ Analytics and tracking
- ✅ Device status monitoring

## 📊 API Tester

The project includes a comprehensive API tester accessible at:
```
http://localhost:3002/api-tester
```

Features:
- 10 test categories
- 38+ endpoint tests
- Real-time results
- Smart test data management
- Beautiful web interface

## 🔄 Migration Notes

This project has been restructured from a mixed JavaScript/TypeScript codebase to a clean TypeScript-first architecture:

### What was cleaned up:
- ❌ Removed duplicate .js/.ts files (kept .ts versions)
- ❌ Removed redundant test files
- ❌ Removed outdated documentation
- ❌ Removed unused scripts
- ❌ Cleaned up empty directories

### What was preserved:
- ✅ All TypeScript source files
- ✅ Essential JavaScript models (legacy)
- ✅ Core functionality
- ✅ Database schema
- ✅ Comprehensive test suite

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up file storage (local or cloud)
4. Configure logging

## 📝 License

MIT License - See LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Built with ❤️ for the 5D Sponsor Wall project**