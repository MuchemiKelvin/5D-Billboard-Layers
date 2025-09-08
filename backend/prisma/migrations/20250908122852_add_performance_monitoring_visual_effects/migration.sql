-- CreateTable
CREATE TABLE "auction_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "actualStartTime" DATETIME,
    "actualEndTime" DATETIME,
    "autoExtend" BOOLEAN NOT NULL DEFAULT false,
    "extendDuration" INTEGER NOT NULL DEFAULT 300,
    "maxExtensions" INTEGER NOT NULL DEFAULT 3,
    "extensions" INTEGER NOT NULL DEFAULT 0,
    "reservePrice" REAL,
    "bidIncrement" REAL NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "auction_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionSessionId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "companyId" TEXT,
    "reservePrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "auction_slots_auctionSessionId_fkey" FOREIGN KEY ("auctionSessionId") REFERENCES "auction_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "auction_slots_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "auction_slots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auction_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionSessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientId" TEXT,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auction_notifications_auctionSessionId_fkey" FOREIGN KEY ("auctionSessionId") REFERENCES "auction_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metricType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT,
    "deviceId" TEXT,
    "slotId" TEXT,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "performance_metrics_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "performance_metrics_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "cpuUsage" REAL,
    "memoryUsage" REAL,
    "diskUsage" REAL,
    "networkLatency" REAL,
    "activeDevices" INTEGER NOT NULL DEFAULT 0,
    "totalDevices" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "lastCheck" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "performance_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metricType" TEXT,
    "threshold" REAL,
    "currentValue" REAL,
    "deviceId" TEXT,
    "slotId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "performance_alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "performance_alerts_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resource_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT,
    "resourceType" TEXT NOT NULL,
    "usage" REAL NOT NULL,
    "capacity" REAL,
    "unit" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resource_usage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visual_effects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hologram_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "effectId" TEXT NOT NULL,
    "slotId" TEXT,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hologram_configs_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "visual_effects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hologram_configs_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "hologram_configs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "animation_presets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "effectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 5000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "animation_presets_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "visual_effects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "slot_visual_effects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "effectId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "slot_visual_effects_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "slot_visual_effects_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "visual_effects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "effect_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "template" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "effect_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "effectId" TEXT NOT NULL,
    "slotId" TEXT,
    "deviceId" TEXT,
    "renderTime" REAL NOT NULL,
    "frameRate" REAL NOT NULL,
    "memoryUsage" REAL NOT NULL,
    "cpuUsage" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "effect_performance_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "visual_effects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "effect_performance_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "effect_performance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bids" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "bidderInfo" JSONB,
    "auctionSessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bids_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bids_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bids_auctionSessionId_fkey" FOREIGN KEY ("auctionSessionId") REFERENCES "auction_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_bids" ("amount", "bidderInfo", "companyId", "createdAt", "id", "slotId", "status", "timestamp", "updatedAt", "userId") SELECT "amount", "bidderInfo", "companyId", "createdAt", "id", "slotId", "status", "timestamp", "updatedAt", "userId" FROM "bids";
DROP TABLE "bids";
ALTER TABLE "new_bids" RENAME TO "bids";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "auction_slots_auctionSessionId_slotId_key" ON "auction_slots"("auctionSessionId", "slotId");

-- CreateIndex
CREATE UNIQUE INDEX "visual_effects_name_key" ON "visual_effects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "slot_visual_effects_slotId_effectId_key" ON "slot_visual_effects"("slotId", "effectId");

-- CreateIndex
CREATE UNIQUE INDEX "effect_templates_name_key" ON "effect_templates"("name");
