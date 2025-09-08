# 5D Sponsor Wall - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Process Management](#process-management)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## 🛠️ Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB free space
- **OS**: Windows, macOS, or Linux

### Required Software
```bash
# Node.js and npm
node --version  # Should be 18.x+
npm --version   # Should be 8.x+

# Git (for version control)
git --version

# PM2 (for production process management)
npm install -g pm2
```

## 🚀 Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd 5D/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```env
# Database
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=3002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-development-secret-key-here
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npm run seed
```

### 5. Start Development Server
```bash
# Start with hot reload
npm run dev

# Or start with ts-node directly
npx ts-node src/server.ts
```

### 6. Verify Installation
```bash
# Test API endpoints
curl http://localhost:3002/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-09-08T14:45:58.331Z",
#   "uptime": 3600,
#   "version": "2.0.0"
# }
```

## 🏭 Production Deployment

### 1. Build Application
```bash
# Compile TypeScript to JavaScript
npm run build

# This creates the dist/ directory with compiled code
```

### 2. Production Environment Setup
```bash
# Install production dependencies only
npm ci --production

# Or install all dependencies
npm ci
```

### 3. Production Environment Variables
Create `.env.production`:
```env
# Database (PostgreSQL for production)
DATABASE_URL="postgresql://username:password@localhost:5432/beamershow_db"

# Server Configuration
PORT=3002
NODE_ENV=production

# JWT Configuration (use strong secret)
JWT_SECRET=your-super-secure-production-secret-key-here
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/uploads

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/beamershow/app.log

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 4. Database Migration (Production)
```bash
# Run production migrations
npx prisma migrate deploy

# Generate Prisma client for production
npx prisma generate
```

### 5. Process Management with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'beamershow-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 6. Nginx Configuration (Optional)
```nginx
# /etc/nginx/sites-available/beamershow
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

## ⚙️ Environment Configuration

### Development Environment
```env
NODE_ENV=development
PORT=3002
DATABASE_URL="file:./dev.db"
JWT_SECRET=development-secret
LOG_LEVEL=debug
```

### Staging Environment
```env
NODE_ENV=staging
PORT=3002
DATABASE_URL="postgresql://user:pass@staging-db:5432/beamershow_staging"
JWT_SECRET=staging-secret-key
LOG_LEVEL=info
```

### Production Environment
```env
NODE_ENV=production
PORT=3002
DATABASE_URL="postgresql://user:pass@prod-db:5432/beamershow_prod"
JWT_SECRET=super-secure-production-secret
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com
```

## 🗄️ Database Setup

### SQLite (Development)
```bash
# SQLite is file-based, no additional setup needed
# Database file: ./prisma/dev.db
```

### PostgreSQL (Production)
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE beamershow_db;
CREATE USER beamershow_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE beamershow_db TO beamershow_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://beamershow_user:secure_password@localhost:5432/beamershow_db"
```

### Database Migration
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🔄 Process Management

### PM2 Commands
```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop beamershow-backend

# Restart application
pm2 restart beamershow-backend

# Reload application (zero-downtime)
pm2 reload beamershow-backend

# View logs
pm2 logs beamershow-backend

# Monitor application
pm2 monit

# Save current process list
pm2 save

# Setup startup script
pm2 startup
```

### Systemd Service (Alternative)
```bash
# Create service file
sudo nano /etc/systemd/system/beamershow.service

[Unit]
Description=5D Sponsor Wall Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/beamershow/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3002

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable beamershow
sudo systemctl start beamershow
sudo systemctl status beamershow
```

## 📊 Monitoring & Logging

### Application Logs
```bash
# View application logs
tail -f logs/app.log

# View PM2 logs
pm2 logs beamershow-backend

# View system logs
journalctl -u beamershow -f
```

### Health Monitoring
```bash
# Health check endpoint
curl http://localhost:3002/health

# Performance metrics
curl http://localhost:3002/api/performance-monitoring/health

# System health
curl http://localhost:3002/api/performance-monitoring/metrics
```

### Log Rotation
```bash
# Install logrotate
sudo apt-get install logrotate

# Create logrotate configuration
sudo nano /etc/logrotate.d/beamershow

/var/www/beamershow/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload beamershow-backend
    endscript
}
```

## 🔒 Security Considerations

### Environment Security
```bash
# Secure .env file
chmod 600 .env
chown www-data:www-data .env

# Use strong JWT secrets
JWT_SECRET=$(openssl rand -base64 32)

# Enable HTTPS in production
# Use Let's Encrypt for SSL certificates
```

### Database Security
```sql
-- Create read-only user for analytics
CREATE USER beamershow_readonly WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO beamershow_readonly;

-- Create backup user
CREATE USER beamershow_backup WITH PASSWORD 'backup_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO beamershow_backup;
```

### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3002/tcp  # Application (if direct access)
sudo ufw enable
```

### Rate Limiting
```typescript
// Configured in server.ts
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3002
lsof -i :3002

# Kill process
kill -9 <PID>

# Or use PM2
pm2 delete beamershow-backend
pm2 start ecosystem.config.js
```

#### 2. Database Connection Issues
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset

# Check database file permissions
ls -la prisma/dev.db
```

#### 3. Memory Issues
```bash
# Check memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart beamershow-backend

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
```

#### 4. File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/
chmod 755 uploads/
chown www-data:www-data uploads/
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check Prisma queries
DEBUG=prisma:* npm run dev
```

### Performance Issues
```bash
# Check system resources
htop
df -h
free -m

# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3002/health
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Dependencies updated
- [ ] Security scan completed

### Deployment
- [ ] Build application (`npm run build`)
- [ ] Run database migrations
- [ ] Start application with PM2
- [ ] Verify health check endpoint
- [ ] Test critical API endpoints
- [ ] Monitor logs for errors

### Post-Deployment
- [ ] Performance monitoring active
- [ ] Log rotation configured
- [ ] Backup procedures in place
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Documentation updated

## 🔗 Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Testing Guide](./TESTING_GUIDE.md)
