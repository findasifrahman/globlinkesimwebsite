/*
  Warnings:

  - A unique constraint covering the columns `[order_no,type]` on the table `processing_queue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "processing_queue_order_no_type_key" ON "processing_queue"("order_no", "type");
