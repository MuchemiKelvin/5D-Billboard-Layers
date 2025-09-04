# 🚀 Quick Setup Guide - BeamerShow Cloud Backend

## Option 1: Interactive Setup (Recommended)
```bash
node setup-firebase.js
```
This will guide you through entering your Firebase credentials interactively.

## Option 2: Manual Setup

### Step 1: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

### Step 2: Create .env File
Create a `.env` file in the `backend` folder with:

```env
DATABASE_TYPE=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project.iam.gserviceaccount.com
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

### Step 3: Start the Backend
```bash
npm start
```

### Step 4: Test
- Health check: `http://localhost:5000/health`
- API endpoint: `http://localhost:5000/api`

## 🔧 Troubleshooting

**Firebase Connection Error?**
- Check your `.env` file has all required values
- Verify your Firebase project is active
- Ensure your service account has proper permissions

**Port Already in Use?**
- Change `PORT=5001` in your `.env` file
- Or kill the process using port 5000

## 📱 Multi-Device Features Ready
- ✅ Beamer Display (Projector)
- ✅ iPad Display (Walking Billboards)
- ✅ Device Synchronization
- ✅ Real-time Updates via WebSocket
- ✅ 24-Slot Management System
- ✅ AR/Hologram Layer Support

## 🎯 What's Included
- **Frontend**: React + Framer Motion + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: Firebase Firestore (Cloud)
- **Storage**: Firebase Storage + AWS S3 (Optional)
- **Real-time**: WebSocket synchronization
- **Authentication**: JWT-based system
- **Analytics**: Event tracking and reporting
