/*
  Warnings:

  - You are about to drop the `ProcessingQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ProcessingQueue";

-- CreateTable
CREATE TABLE "processing_queue" (
    "id" TEXT NOT NULL,
    "order_no" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processing_queue_order_no_idx" ON "processing_queue"("order_no");
