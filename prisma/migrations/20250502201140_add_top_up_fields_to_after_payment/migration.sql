-- AlterTable
ALTER TABLE "esim_order_after_payment" ADD COLUMN     "is_top_up" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "top_up_amount" DECIMAL(10,2),
ADD COLUMN     "top_up_date" TIMESTAMP(3),
ADD COLUMN     "top_up_transaction_id" TEXT;

-- CreateIndex
CREATE INDEX "esim_order_after_payment_user_id_idx" ON "esim_order_after_payment"("user_id");

-- CreateIndex
CREATE INDEX "esim_order_after_payment_package_code_idx" ON "esim_order_after_payment"("package_code");

-- CreateIndex
CREATE INDEX "esim_order_after_payment_order_id_idx" ON "esim_order_after_payment"("order_id");

-- CreateIndex
CREATE INDEX "esim_order_after_payment_status_idx" ON "esim_order_after_payment"("status");

-- CreateIndex
CREATE INDEX "esim_order_after_payment_is_top_up_idx" ON "esim_order_after_payment"("is_top_up");
