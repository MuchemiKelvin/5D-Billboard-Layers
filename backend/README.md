# 🚀 BeamerShow Backend - Cloud-Based 24-Slot System

A powerful backend for the BeamerShow 24-Slot System with AR/AI/Hologram capabilities, built with Node.js, Express, and Firebase.

## ✨ Features

- **🌐 Cloud-Based**: Firebase Firestore + AWS S3 (no local database needed)
- **📱 Multi-Device Support**: Beamer, iPad, Billboard synchronization
- **🎯 24-Slot Management**: Advanced scheduling and rotation system
- **🔮 AR/Hologram Layers**: 3-layer system with real-time effects
- **📡 Real-time Sync**: WebSocket-based device synchronization
- **📊 Analytics**: Comprehensive event tracking and reporting
- **🔐 Authentication**: JWT-based security system
- **📁 File Management**: Cloud storage for assets and content

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase (Choose One)

#### Option A: Interactive Setup (Recommended)
```bash
npm run setup:firebase
```

#### Option B: Manual Setup
1. Copy `env-template.txt` to `.env`
2. Update with your Firebase credentials
3. Get credentials from [Firebase Console](https://console.firebase.google.com/)

### 3. Test Connection
```bash
npm run test:connection
```

### 4. Start Backend
```bash
npm start
```

### 5. Verify Setup
- Health: `http://localhost:5000/health`
- API: `http://localhost:5000/api`

## 🔥 Firebase Setup

1. **Create Project**: [Firebase Console](https://console.firebase.google.com/)
2. **Enable Services**: Firestore Database + Storage
3. **Service Account**: Project Settings → Service Accounts → Generate Key
4. **Download JSON**: Copy values to your `.env` file

## 📱 Multi-Device System

### Supported Devices
- **Beamer**: Projector display with calibration
- **iPad**: Walking billboard with GPS tracking
- **Billboard**: Static display synchronization

### Features
- Real-time device registration
- Health monitoring
- Automatic failover
- Content adaptation
- Performance optimization

## 🎯 API Endpoints

### Core APIs
- `/api/slots` - Slot management
- `/api/sponsors` - Sponsor content
- `/api/blocks` - Time block management
- `/api/ar` - AR content and triggers
- `/api/bidding` - Live bidding system
- `/api/analytics` - Event tracking
- `/api/sync` - Device synchronization

### Device APIs
- `/api/devices` - Device management
- `/api/beamer` - Beamer controls
- `/api/ipad` - iPad configuration

## 🔧 Development

```bash
# Development mode with auto-reload
npm run dev

# Test connection
npm run test:connection

# Run tests
npm test
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── socket/          # WebSocket handlers
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utilities and helpers
│   └── config/          # Configuration files
├── setup-firebase.js    # Firebase setup script
├── test-connection.js   # Connection test script
├── env-template.txt     # Environment template
└── QUICK_SETUP.md       # Setup guide
```

## 🌟 What's New

- ✅ **Cloud-First**: No more MongoDB dependencies
- ✅ **Firebase Integration**: Real-time database and storage
- ✅ **Multi-Device Ready**: Beamer + iPad + Billboard support
- ✅ **Real-time Sync**: WebSocket-based synchronization
- ✅ **Advanced Scheduling**: 24-slot rotation system
- ✅ **AR/Hologram Support**: 3-layer effect system

## 🔗 Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [API Documentation](./API_DOCUMENTATION.md)
- [Quick Setup Guide](./QUICK_SETUP.md)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in `QUICK_SETUP.md`
2. Run `npm run test:connection` to diagnose issues
3. Verify your Firebase credentials and permissions

---

**Built with ❤️ for Kardiverse Technologies Ltd.**
