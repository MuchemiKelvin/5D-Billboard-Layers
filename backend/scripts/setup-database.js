#!/usr/bin/env node

/**
 * Database Setup Script for BeamerShow 24-Slot System
 * This script helps you quickly configure your database
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 BeamerShow Database Setup Wizard');
console.log('=====================================\n');

async function setupDatabase() {
  try {
    // Choose database type
    console.log('Choose your database option:');
    console.log('1. MongoDB Atlas (AWS) - Recommended for production');
    console.log('2. Firebase - Good for real-time applications');
    console.log('3. Local MongoDB Server - Good for development');
    console.log('4. Skip setup (manual configuration)\n');

    const dbChoice = await question('Enter your choice (1-4): ');

    let envConfig = '';

    switch (dbChoice) {
      case '1':
        envConfig = await setupMongoDBAtlas();
        break;
      case '2':
        envConfig = await setupFirebase();
        break;
      case '3':
        envConfig = await setupLocalMongoDB();
        break;
      case '4':
        console.log('\n✅ Setup skipped. Please configure your database manually.');
        console.log('See DATABASE_SETUP.md for detailed instructions.');
        rl.close();
        return;
      default:
        console.log('\n❌ Invalid choice. Please run the script again.');
        rl.close();
        return;
    }

    // Create .env file
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envPath)) {
      const overwrite = await question('\n⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n✅ Setup cancelled. Your existing .env file was preserved.');
        rl.close();
        return;
      }
    }

    // Add common configuration
    envConfig += getCommonConfig();

    fs.writeFileSync(envPath, envConfig);
    console.log('\n✅ .env file created successfully!');
    console.log('📝 Please review and modify the configuration as needed.');
    console.log('🚀 You can now start the backend with: npm run dev');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

async function setupMongoDBAtlas() {
  console.log('\n🗄️  MongoDB Atlas Setup');
  console.log('=======================\n');
  
  const uri = await question('Enter your MongoDB Atlas connection string: ');
  
  return `# MongoDB Atlas Configuration
DATABASE_TYPE=mongodb_atlas
MONGODB_ATLAS_URI=${uri}

`;
}

async function setupFirebase() {
  console.log('\n🔥 Firebase Setup');
  console.log('==================\n');
  
  const projectId = await question('Enter your Firebase Project ID: ');
  const privateKeyId = await question('Enter your Private Key ID: ');
  const privateKey = await question('Enter your Private Key (full key): ');
  const clientEmail = await question('Enter your Client Email: ');
  const clientId = await question('Enter your Client ID: ');
  const clientX509CertUrl = await question('Enter your Client X509 Cert URL: ');
  
  return `# Firebase Configuration
DATABASE_TYPE=firebase
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_PRIVATE_KEY_ID=${privateKeyId}
FIREBASE_PRIVATE_KEY="${privateKey.replace(/\\n/g, '\\n')}"
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_CLIENT_ID=${clientId}
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=${clientX509CertUrl}

`;
}

async function setupLocalMongoDB() {
  console.log('\n🏠 Local MongoDB Setup');
  console.log('======================\n');
  
  const uri = await question('Enter your local MongoDB URI (default: mongodb://localhost:27017/beamershow): ');
  const finalUri = uri || 'mongodb://localhost:27017/beamershow';
  
  return `# Local MongoDB Configuration
DATABASE_TYPE=mongodb_local
MONGODB_LOCAL_URI=${finalUri}

`;
}

function getCommonConfig() {
  return `# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

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

# ========================================
# AWS S3 CONFIGURATION (Optional)
# ========================================
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=beamershow-assets
# AWS_S3_BUCKET_REGION=us-east-1
`;
}

// Run the setup
setupDatabase();
