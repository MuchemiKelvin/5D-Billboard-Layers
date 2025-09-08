-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "companyId" TEXT,
    "slotId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "files_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "files_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sync_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "data" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "compression" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "sync_sessions_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sync_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "syncId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "data" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    CONSTRAINT "sync_events_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "sync_sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "device_states" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "lastSync" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "checksum" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "device_states_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "recurrence" JSONB,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "slots" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_blocks_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hidden_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockRequirement" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hidden_content_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hidden_content_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "userId" TEXT,
    "interactionType" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hidden_content_interactions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "hidden_content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "hidden_content_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScanTime" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "qr_codes_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qr_code_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCodeId" TEXT NOT NULL,
    "userId" TEXT,
    "deviceInfo" JSONB,
    "location" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qr_code_scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qr_code_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nfc_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "lastInteractionTime" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "nfc_tags_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nfc_taps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nfcTagId" TEXT NOT NULL,
    "userId" TEXT,
    "deviceInfo" JSONB,
    "location" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nfc_taps_nfcTagId_fkey" FOREIGN KEY ("nfcTagId") REFERENCES "nfc_tags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nfc_taps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_system_config" ("createdAt", "description", "id", "isActive", "key", "updatedAt", "value") SELECT "createdAt", "description", "id", "isActive", "key", "updatedAt", "value" FROM "system_config";
DROP TABLE "system_config";
ALTER TABLE "new_system_config" RENAME TO "system_config";
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "sync_sessions_syncId_key" ON "sync_sessions"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "device_states_deviceId_key" ON "device_states"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_uniqueId_key" ON "qr_codes"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "nfc_tags_tagId_key" ON "nfc_tags"("tagId");
