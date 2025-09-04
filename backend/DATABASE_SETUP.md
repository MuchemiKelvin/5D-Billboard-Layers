# Database Setup Guide - BeamerShow 24-Slot System

This guide covers setting up the database for different deployment scenarios: **MongoDB Atlas (AWS)**, **Firebase**, and **Local MongoDB Server**.

## 🗄️ Database Options Overview

### 1. MongoDB Atlas (AWS) - **Recommended for Production**
- **Pros**: Fully managed, automatic scaling, built-in security, global distribution
- **Use Case**: Production deployments, high availability requirements
- **Cost**: Free tier available, then pay-as-you-go

### 2. Firebase - **Good for Real-time Applications**
- **Pros**: Real-time sync, offline support, easy integration with mobile apps
- **Use Case**: Applications requiring real-time data synchronization
- **Cost**: Generous free tier, then pay-as-you-go

### 3. Local MongoDB Server - **Good for Development**
- **Pros**: Full control, no external dependencies, cost-effective
- **Use Case**: Development, testing, internal deployments
- **Cost**: Free (server costs only)

## 🚀 MongoDB Atlas (AWS) Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS) and region
4. Click "Create"

### Step 3: Configure Database Access
1. Go to "Database Access" → "Add New Database User"
2. Create username and password
3. Select "Read and write to any database"
4. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" → "Add IP Address"
2. Add your IP or `0.0.0.0/0` for all IPs
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

### Step 6: Environment Configuration
```env
DATABASE_TYPE=mongodb_atlas
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/beamershow?retryWrites=true&w=majority
```

## 🔥 Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name and enable Google Analytics (optional)
4. Click "Create project"

### Step 2: Enable Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select location closest to your users
4. Click "Done"

### Step 3: Generate Service Account Key
1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. **Keep this file secure!**

### Step 4: Environment Configuration
```env
DATABASE_TYPE=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=from-service-account-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=from-service-account-json
FIREBASE_CLIENT_ID=from-service-account-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=from-service-account-json
```

### Step 5: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

## 🏠 Local MongoDB Server Setup

### Step 1: Install MongoDB
#### Windows
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run installer and follow setup wizard
3. Install MongoDB Compass (GUI) if desired

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Verify Installation
```bash
# Check MongoDB status
mongod --version

# Connect to MongoDB shell
mongosh
```

### Step 3: Create Database
```javascript
// In MongoDB shell
use beamershow
db.createCollection('slots')
db.createCollection('sponsors')
db.createCollection('analytics')
db.createCollection('blocks')
```

### Step 4: Environment Configuration
```env
DATABASE_TYPE=mongodb_local
MONGODB_LOCAL_URI=mongodb://localhost:27017/beamershow
```

## 📁 AWS S3 Setup (for File Storage)

### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Sign up for an account
3. Set up billing and security

### Step 2: Create S3 Bucket
1. Go to S3 service
2. Click "Create bucket"
3. Enter bucket name (e.g., `beamershow-assets`)
4. Choose region
5. Configure options (defaults are fine for development)
6. Click "Create bucket"

### Step 3: Create IAM User
1. Go to IAM service
2. Click "Users" → "Add user"
3. Enter username (e.g., `beamershow-s3-user`)
4. Select "Programmatic access"
5. Attach policy: `AmazonS3FullAccess` (or create custom policy)
6. Click "Create user"
7. **Save Access Key ID and Secret Access Key**

### Step 4: Environment Configuration
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=beamershow-assets
AWS_S3_BUCKET_REGION=us-east-1
```

## 🔧 Complete Environment File

Create a `.env` file in your backend directory with the configuration for your chosen database:

```env
# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

# ========================================
# DATABASE CONFIGURATION
# ========================================
# Choose: mongodb_atlas, mongodb_local, firebase
DATABASE_TYPE=mongodb_atlas

# MongoDB Atlas (AWS) - Uncomment and configure
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/beamershow?retryWrites=true&w=majority

# Local MongoDB - Uncomment and configure
# MONGODB_LOCAL_URI=mongodb://localhost:27017/beamershow

# Firebase - Uncomment and configure
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY_ID=your-private-key-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_CLIENT_ID=your-client-id

# AWS S3 - Uncomment and configure
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=beamershow-assets
# AWS_S3_BUCKET_REGION=us-east-1

# ========================================
# AUTHENTICATION & SECURITY
# ========================================
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h

# ========================================
# FILE UPLOAD CONFIGURATION
# ========================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# LOGGING CONFIGURATION
# ========================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# ========================================
# CORS CONFIGURATION
# ========================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ========================================
# SOCKET.IO CONFIGURATION
# ========================================
SOCKET_CORS_ORIGIN=http://localhost:3000
```

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 3. Verify Database Connection
Check the console output for:
- ✅ Database connection established
- ✅ Server running on port 5000
- ✅ Socket.IO server initialized

## 🔍 Testing Database Connection

### Health Check Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "type": "mongodb_atlas"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test API Endpoints
```bash
# Test slots endpoint
curl http://localhost:5000/api/slots

# Test sponsors endpoint
curl http://localhost:5000/api/sponsors
```

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Check if MongoDB service is running
- Verify connection string format
- Check network access (for Atlas)
- Verify username/password

#### 2. Firebase Connection Failed
- Verify service account JSON is correct
- Check project ID matches
- Ensure Firestore is enabled
- Verify private key format

#### 3. AWS S3 Connection Failed
- Verify access keys are correct
- Check bucket name and region
- Ensure IAM user has proper permissions
- Verify bucket exists

#### 4. Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <process_id> /F
```

## 📊 Database Schema

The system uses the following collections:

### Slots Collection
- `slotNumber`: Slot identifier (1-24)
- `slotType`: Type of slot (main-sponsor, live-bidding, regular)
- `sponsor`: Sponsor information
- `layers`: Layer configuration and content
- `schedule`: Timing and rotation settings

### Sponsors Collection
- `name`: Sponsor name
- `company`: Company information
- `assets`: Logo, video, AR model files
- `performance`: Analytics and metrics

### Analytics Collection
- `eventType`: Type of event (view, scan, AR activation)
- `slotId`: Associated slot
- `deviceType`: Device information
- `performance`: Response times and metrics

### Blocks Collection
- `name`: Block identifier
- `startTime`: Block start time
- `duration`: Block duration (4 hours)
- `slots`: Array of slot IDs in the block

## 🔐 Security Considerations

### Production Deployment
1. **Use strong JWT secrets**
2. **Enable HTTPS**
3. **Configure proper CORS origins**
4. **Use environment-specific configurations**
5. **Enable rate limiting**
6. **Monitor database access**

### Database Security
1. **Use strong passwords**
2. **Limit network access**
3. **Enable authentication**
4. **Regular security updates**
5. **Backup strategies**

## 📈 Performance Optimization

### MongoDB Atlas
- Use appropriate cluster tier
- Enable global distribution
- Monitor query performance
- Use indexes effectively

### Firebase
- Structure data efficiently
- Use offline persistence
- Implement proper security rules
- Monitor usage quotas

### Local MongoDB
- Optimize queries
- Use proper indexes
- Monitor memory usage
- Regular maintenance

## 🆘 Support

If you encounter issues:

1. Check the logs in `./logs` directory
2. Verify environment configuration
3. Test database connection manually
4. Check network connectivity
5. Review MongoDB/Firebase documentation

For additional help, refer to the main README.md file or create an issue in the project repository.
