# 5D Sponsor Wall - Database Schema Documentation

## 📋 Table of Contents
1. [Schema Overview](#schema-overview)
2. [Core Entities](#core-entities)
3. [Advanced Features](#advanced-features)
4. [Relationships](#relationships)
5. [Enums](#enums)
6. [Indexes](#indexes)
7. [Sample Data](#sample-data)

## 🌟 Schema Overview

The 5D Sponsor Wall database uses a comprehensive relational schema built with Prisma ORM. The schema supports sponsor management, bidding systems, device synchronization, analytics, and advanced features.

**Database**: SQLite (Development) / PostgreSQL (Production)
**ORM**: Prisma
**Total Models**: 25+ entities
**Relationships**: Complex many-to-many and one-to-many relationships

## 🏗️ Core Entities

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  role      UserRole @default(SPONSOR)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bids                    Bid[]
  analytics               Analytics[]
  hiddenContentInteractions HiddenContentInteraction[]
  qrCodeScans            QRCodeScan[]
  nfcTaps                NFCTap[]
}
```

### Company Model
```prisma
model Company {
  id           String  @id @default(cuid())
  name         String
  description  String?
  logo         String?
  website      String?
  contactEmail String?
  contactPhone String?
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  slots        Slot[]
  bids         Bid[]
  analytics    Analytics[]
  auctionSlots AuctionSlot[]
  hologramConfigs HologramConfig[]
}
```

### Slot Model
```prisma
model Slot {
  id              String   @id @default(cuid())
  slotNumber      Int      @unique
  slotType        SlotType @default(STANDARD)
  position        Json     // { row: number, col: number }
  currentSponsor  String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  company         Company? @relation(fields: [currentSponsor], references: [id])
  bids            Bid[]
  analytics       Analytics[]
  hiddenContent   HiddenContent[]
  qrCodes         QRCode[]
  nfcTags         NFCTag[]
  auctionSlots    AuctionSlot[]
  performanceMetrics PerformanceMetric[]
  performanceAlerts PerformanceAlert[]
  hologramConfigs HologramConfig[]
  slotVisualEffect SlotVisualEffect[]
  effectPerformance EffectPerformance[]
}
```

### Bid Model
```prisma
model Bid {
  id          String   @id @default(cuid())
  slotId      String
  companyId   String
  userId      String
  amount      Int      // Amount in cents
  status      BidStatus @default(ACTIVE)
  bidderInfo  Json     // Contact information
  auctionSessionId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  slot           Slot           @relation(fields: [slotId], references: [id])
  company        Company        @relation(fields: [companyId], references: [id])
  user           User           @relation(fields: [userId], references: [id])
  auctionSession AuctionSession? @relation(fields: [auctionSessionId], references: [id])
}
```

## 🚀 Advanced Features

### Device Management
```prisma
model Device {
  id         String       @id @default(cuid())
  deviceId   String       @unique
  deviceType DeviceType
  name       String
  status     DeviceStatus @default(ONLINE)
  location   Json?        // GPS coordinates and address
  config     Json?        // Device-specific configuration
  lastSeen   DateTime     @default(now())
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  // Relations
  syncSessions        SyncSession[]
  deviceState         DeviceState?
  performanceMetrics  PerformanceMetric[]
  performanceAlerts   PerformanceAlert[]
  resourceUsage       ResourceUsage[]
  effectPerformance   EffectPerformance[]
}
```

### Analytics System
```prisma
model Analytics {
  id        String        @id @default(cuid())
  eventType AnalyticsType
  slotId    String?
  companyId String?
  userId    String?
  metadata  Json?         // Additional event data
  sessionId String?       // User session tracking
  deviceInfo Json?        // Device information
  timestamp DateTime      @default(now())

  // Relations
  slot    Slot?    @relation(fields: [slotId], references: [id])
  company Company? @relation(fields: [companyId], references: [id])
  user    User?    @relation(fields: [userId], references: [id])
}
```

### Performance Monitoring
```prisma
model PerformanceMetric {
  id          String               @id @default(cuid())
  deviceId    String?
  slotId      String?
  metricType  PerformanceMetricType
  value       Float
  unit        String?
  metadata    Json?                // Additional metric data
  timestamp   DateTime             @default(now())
  createdAt   DateTime             @default(now())

  // Relations
  device Device? @relation(fields: [deviceId], references: [id])
  slot   Slot?   @relation(fields: [slotId], references: [id])
}

model SystemHealth {
  id              String      @id @default(cuid())
  status          HealthStatus @default(HEALTHY)
  overallScore    Int         // 0-100 health score
  cpuUsage        Float
  memoryUsage     Float
  diskUsage       Float
  networkLatency  Float
  activeDevices   Int
  totalDevices    Int
  errorCount      Int         @default(0)
  warningCount    Int         @default(0)
  lastCheck       DateTime    @default(now())
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### Visual Effects System
```prisma
model VisualEffect {
  id          String           @id @default(cuid())
  name        String
  type        VisualEffectType
  description String?
  config      Json?            // Effect configuration
  isActive    Boolean          @default(true)
  isDefault   Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relations
  hologramConfigs    HologramConfig[]
  animationPresets   AnimationPreset[]
  slotEffects        SlotVisualEffect[]
  effectPerformance  EffectPerformance[]
}

model HologramConfig {
  id          String   @id @default(cuid())
  slotId      String?
  companyId   String?
  effectId    String
  config      Json     // Hologram-specific settings
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  slot    Slot?         @relation(fields: [slotId], references: [id])
  company Company?      @relation(fields: [companyId], references: [id])
  effect  VisualEffect  @relation(fields: [effectId], references: [id])
}
```

### Multi-Device Sync System
```prisma
model SyncSession {
  id          String     @id @default(cuid())
  deviceId    String
  sessionId   String     @unique
  status      SyncStatus @default(ACTIVE)
  priority    SyncPriority @default(NORMAL)
  lastSync    DateTime   @default(now())
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  device      Device     @relation(fields: [deviceId], references: [id])
  events      SyncEvent[]
}

model DeviceState {
  id        String   @id @default(cuid())
  deviceId  String   @unique
  state     Json     // Device state data
  lastSync  DateTime @default(now())
  version   Int      @default(1)
  checksum  String   // State integrity check
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  device Device @relation(fields: [deviceId], references: [id])
}
```

### Advanced Scheduling System
```prisma
model Schedule {
  id                String        @id @default(cuid())
  name              String
  description       String?
  type              ScheduleType
  startTime         DateTime
  endTime           DateTime
  isRecurring       Boolean       @default(false)
  recurrencePattern String?       // CRON expression
  isActive          Boolean       @default(true)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  blocks ScheduleBlock[]
}

model ScheduleBlock {
  id         String         @id @default(cuid())
  scheduleId String
  slotId     String
  startTime  DateTime
  endTime    DateTime
  isActive   Boolean        @default(true)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  // Relations
  schedule Schedule @relation(fields: [scheduleId], references: [id])
}
```

### Interactive Content System
```prisma
model HiddenContent {
  id          String      @id @default(cuid())
  slotId      String
  contentType ContentType
  title       String
  description String?
  content     String      // URL or content data
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  slot         Slot                      @relation(fields: [slotId], references: [id])
  interactions HiddenContentInteraction[]
}

model QRCode {
  id          String   @id @default(cuid())
  slotId      String
  data        String   // QR code data
  title       String?
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  slot  Slot        @relation(fields: [slotId], references: [id])
  scans QRCodeScan[]
}

model NFCTag {
  id          String   @id @default(cuid())
  slotId      String
  tagId       String   @unique
  data        String   // NFC tag data
  title       String?
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  slot Slot    @relation(fields: [slotId], references: [id])
  taps NFCTap[]
}
```

### Advanced Auction System
```prisma
model AuctionSession {
  id              String        @id @default(cuid())
  name            String
  description     String?
  startTime       DateTime
  endTime         DateTime
  actualStartTime DateTime?
  actualEndTime   DateTime?
  autoExtend      Boolean       @default(false)
  extendDuration  Int?          // Seconds
  maxExtensions   Int?          @default(3)
  extensions      Int           @default(0)
  reservePrice    Int           // In cents
  bidIncrement    Int           // In cents
  status          AuctionStatus @default(SCHEDULED)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  slots        AuctionSlot[]
  bids         Bid[]
  notifications AuctionNotification[]
}

model AuctionSlot {
  id        String            @id @default(cuid())
  sessionId String
  slotId    String
  companyId String
  status    AuctionSlotStatus @default(AVAILABLE)
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  // Relations
  session AuctionSession @relation(fields: [sessionId], references: [id])
  slot    Slot           @relation(fields: [slotId], references: [id])
  company Company        @relation(fields: [companyId], references: [id])
}
```

## 🔗 Relationships

### Key Relationships Diagram
```
User ──┐
       ├── Bid ──┐
Company ──┘      ├── Slot ──┐
                 └── Analytics ──┘
Device ──┐
         ├── Performance Metrics
         └── Sync Events
```

### One-to-Many Relationships
- **User** → **Bids** (1:many)
- **Company** → **Slots** (1:many)
- **Company** → **Bids** (1:many)
- **Slot** → **Bids** (1:many)
- **Slot** → **Analytics** (1:many)
- **Device** → **Performance Metrics** (1:many)
- **Schedule** → **Schedule Blocks** (1:many)

### Many-to-Many Relationships
- **Slots** ↔ **Companies** (through bids and current sponsorship)
- **Users** ↔ **Slots** (through bids and analytics)
- **Devices** ↔ **Slots** (through performance metrics)

## 📊 Enums

### User & Authentication
```prisma
enum UserRole {
  ADMIN
  OPERATOR
  SPONSOR
}
```

### Slot Management
```prisma
enum SlotType {
  STANDARD
  PREMIUM
  VIP
}

enum BidStatus {
  ACTIVE
  OUTBID
  WON
  WITHDRAWN
}
```

### Device Management
```prisma
enum DeviceType {
  BEAMER
  IPAD
  BILLBOARD
  MOBILE
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  MAINTENANCE
  ERROR
}
```

### Analytics
```prisma
enum AnalyticsType {
  QR_SCAN
  NFC_TAP
  CONTENT_VIEW
  CONTENT_LIKE
  BID_PLACEMENT
  AUCTION_VIEW
  SLOT_VIEW
  HOVER_INTERACTION
  CLICK_INTERACTION
}
```

### Performance Monitoring
```prisma
enum PerformanceMetricType {
  CPU_USAGE
  MEMORY_USAGE
  DISK_USAGE
  NETWORK_LATENCY
  RESPONSE_TIME
  ERROR_RATE
}

enum HealthStatus {
  HEALTHY
  WARNING
  CRITICAL
  OFFLINE
}
```

### Visual Effects
```prisma
enum VisualEffectType {
  HOLOGRAM
  ANIMATION
  PARTICLE
  LIGHTING
  SOUND
}

enum EffectCategory {
  SPONSOR_DISPLAY
  BACKGROUND
  TRANSITION
  INTERACTION
}
```

### Sync System
```prisma
enum SyncStatus {
  ACTIVE
  PAUSED
  COMPLETED
  FAILED
}

enum SyncPriority {
  LOW
  NORMAL
  HIGH
  CRITICAL
}

enum SyncEventType {
  CONNECT
  DISCONNECT
  SYNC_START
  SYNC_COMPLETE
  SYNC_ERROR
  STATE_UPDATE
  CONFLICT_DETECTED
  CONFLICT_RESOLVED
}
```

### Scheduling
```prisma
enum ScheduleType {
  ROTATION
  MAINTENANCE
  SPECIAL_EVENT
  CUSTOM
}

enum ScheduleStatus {
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}
```

### Interactive Content
```prisma
enum ContentType {
  IMAGE
  VIDEO
  AUDIO
  TEXT
  LINK
  AR_MODEL
}

enum InteractionType {
  VIEW
  CLICK
  SCAN
  TAP
  HOVER
  LIKE
}
```

### Auction System
```prisma
enum AuctionStatus {
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum AuctionSlotStatus {
  AVAILABLE
  RESERVED
  SOLD
  WITHDRAWN
}

enum AuctionNotificationType {
  BID_PLACED
  BID_OUTBID
  AUCTION_STARTED
  AUCTION_ENDING
  AUCTION_ENDED
}

enum NotificationRecipientType {
  ALL_USERS
  BIDDERS_ONLY
  WINNERS_ONLY
  SPECIFIC_USER
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

## 📈 Indexes

### Primary Indexes
- All models have `id` as primary key with `@id @default(cuid())`
- Unique constraints on `username`, `email`, `deviceId`, `slotNumber`

### Performance Indexes
```prisma
// Analytics performance
@@index([eventType, timestamp])
@@index([slotId, timestamp])
@@index([companyId, timestamp])

// Bidding performance
@@index([slotId, status])
@@index([companyId, createdAt])
@@index([userId, status])

// Performance monitoring
@@index([deviceId, timestamp])
@@index([metricType, timestamp])

// Sync system
@@index([deviceId, status])
@@index([sessionId, lastSync])
```

## 🎯 Sample Data

### Seeded Data Structure
The database is seeded with:

#### Companies (5)
- TechCorp Solutions
- InnovateLabs Kenya
- Digital Dynamics
- Future Systems Ltd
- Creative Media Group

#### Users (4)
- Admin user (ADMIN role)
- Operator user (OPERATOR role)
- Sponsor users (SPONSOR role)

#### Slots (24)
- 24 slots with different types (STANDARD, PREMIUM, VIP)
- Grid positions (4 rows × 6 columns)
- Some slots occupied by companies

#### Devices (3)
- BEAMER-001 (Main Projector Display)
- IPAD-001 (Control Tablet)
- BILLBOARD-001 (Digital Billboard)

#### System Configuration (6)
- Rotation speed settings
- Auto-rotation configuration
- Maintenance mode settings
- Timezone configuration

## 🔧 Database Operations

### Common Queries
```typescript
// Get all active slots with company info
const slots = await prisma.slot.findMany({
  where: { isActive: true },
  include: { company: true }
});

// Get bids for a specific slot
const bids = await prisma.bid.findMany({
  where: { slotId: 'SLOT-001' },
  include: { company: true, user: true },
  orderBy: { amount: 'desc' }
});

// Get analytics for a company
const analytics = await prisma.analytics.findMany({
  where: { 
    companyId: 'COMP-001',
    timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }
});
```

### Migration Commands
```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## 🔗 Related Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
