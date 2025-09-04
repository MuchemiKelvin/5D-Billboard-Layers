const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Firebase Setup for BeamerShow Backend\n');
console.log('This script will help you create your .env file with Firebase credentials.\n');

const questions = [
  {
    name: 'FIREBASE_PROJECT_ID',
    question: 'Enter your Firebase Project ID: ',
    required: true
  },
  {
    name: 'FIREBASE_PRIVATE_KEY_ID',
    question: 'Enter your Firebase Private Key ID: ',
    required: true
  },
  {
    name: 'FIREBASE_PRIVATE_KEY',
    question: 'Enter your Firebase Private Key (paste the entire key): ',
    required: true
  },
  {
    name: 'FIREBASE_CLIENT_EMAIL',
    question: 'Enter your Firebase Client Email: ',
    required: true
  },
  {
    name: 'FIREBASE_CLIENT_ID',
    question: 'Enter your Firebase Client ID: ',
    required: true
  },
  {
    name: 'FIREBASE_CLIENT_X509_CERT_URL',
    question: 'Enter your Firebase Client X509 Cert URL: ',
    required: true
  },
  {
    name: 'JWT_SECRET',
    question: 'Enter a JWT secret key (or press Enter for auto-generated): ',
    required: false
  }
];

const answers = {};

async function askQuestion(questionObj) {
  return new Promise((resolve) => {
    rl.question(questionObj.question, (answer) => {
      if (questionObj.required && !answer.trim()) {
        console.log('❌ This field is required. Please try again.');
        askQuestion(questionObj).then(resolve);
      } else {
        answers[questionObj.name] = answer.trim();
        resolve();
      }
    });
  });
}

async function setupFirebase() {
  try {
    // Ask all questions
    for (const question of questions) {
      await askQuestion(question);
    }

    // Generate JWT secret if not provided
    if (!answers.JWT_SECRET) {
      answers.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
      console.log('✅ Auto-generated JWT secret key');
    }

    // Create .env content
    const envContent = `# Database Configuration
DATABASE_TYPE=firebase

# Firebase Configuration
FIREBASE_PROJECT_ID=${answers.FIREBASE_PROJECT_ID}
FIREBASE_PRIVATE_KEY_ID=${answers.FIREBASE_PRIVATE_KEY_ID}
FIREBASE_PRIVATE_KEY=${answers.FIREBASE_PRIVATE_KEY}
FIREBASE_CLIENT_EMAIL=${answers.FIREBASE_CLIENT_EMAIL}
FIREBASE_CLIENT_ID=${answers.FIREBASE_CLIENT_ID}
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=${answers.FIREBASE_CLIENT_X509_CERT_URL}

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=${answers.JWT_SECRET}

# Optional: AWS S3 Configuration (for file storage)
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=beamershow-assets
`;

    // Write .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ .env file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify your Firebase credentials are correct');
    console.log('2. Run: npm start');
    console.log('3. Test: http://localhost:5000/health');
    
    console.log('\n🔗 Firebase Console: https://console.firebase.google.com/');
    console.log('📚 Documentation: https://firebase.google.com/docs/admin/setup');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Start setup
setupFirebase();
