-- CreateTable
CREATE TABLE "escrow_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txUid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mpesaRef" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "requestMeta" JSONB,
    "responseMeta" JSONB,
    "auditProofHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "escrow_logs_txUid_key" ON "escrow_logs"("txUid");
