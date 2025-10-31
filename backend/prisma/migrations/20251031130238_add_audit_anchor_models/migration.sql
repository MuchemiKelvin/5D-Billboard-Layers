-- CreateTable
CREATE TABLE "audit_anchors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchHash" TEXT NOT NULL,
    "txHash" TEXT,
    "blockNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "anchor_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anchorId" TEXT NOT NULL,
    "escrowLogId" TEXT NOT NULL,
    "proofHash" TEXT NOT NULL,
    CONSTRAINT "anchor_items_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "audit_anchors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "anchor_items_escrowLogId_fkey" FOREIGN KEY ("escrowLogId") REFERENCES "escrow_logs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "anchor_items_anchorId_escrowLogId_key" ON "anchor_items"("anchorId", "escrowLogId");
