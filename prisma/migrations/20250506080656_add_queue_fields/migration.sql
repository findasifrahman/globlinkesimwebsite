-- AlterTable
ALTER TABLE "processing_queue" ADD COLUMN     "errorDetails" JSONB,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "nextAttempt" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "processing_queue_status_nextAttempt_idx" ON "processing_queue"("status", "nextAttempt");

-- AddForeignKey
ALTER TABLE "processing_queue" ADD CONSTRAINT "processing_queue_order_no_fkey" FOREIGN KEY ("order_no") REFERENCES "esim_order_after_payment"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;
