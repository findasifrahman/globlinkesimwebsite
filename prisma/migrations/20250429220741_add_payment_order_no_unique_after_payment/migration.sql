/*
  Warnings:

  - A unique constraint covering the columns `[payment_order_no]` on the table `esim_order_after_payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "esim_order_after_payment_payment_order_no_key" ON "esim_order_after_payment"("payment_order_no");
