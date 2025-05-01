/*
  Warnings:

  - You are about to drop the `order_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "data_usage_logs" DROP CONSTRAINT "data_usage_logs_order_no_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "esim_status_logs" DROP CONSTRAINT "esim_status_logs_order_no_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "order_profiles" DROP CONSTRAINT "order_profiles_package_code_fkey";

-- DropForeignKey
ALTER TABLE "order_profiles" DROP CONSTRAINT "order_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_package_code_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "validity_usage_logs" DROP CONSTRAINT "validity_usage_logs_order_no_transaction_id_fkey";

-- DropTable
DROP TABLE "order_profiles";

-- DropTable
DROP TABLE "orders";

-- CreateTable
CREATE TABLE "esim_order_before_payment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_code" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "period_num" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentState" TEXT NOT NULL DEFAULT 'pending',
    "currency" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esim_order_before_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esim_order_after_payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_code" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "esimStatus" TEXT,
    "smdpStatus" TEXT,
    "dataRemaining" INTEGER,
    "dataUsed" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "daysRemaining" INTEGER,
    "qrCode" TEXT,
    "iccid" TEXT,
    "paymentState" TEXT NOT NULL DEFAULT 'pending',
    "paidAmount" DECIMAL(10,2) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "pm_id" TEXT NOT NULL,
    "pm_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esim_order_after_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "esim_order_before_payment_order_id_key" ON "esim_order_before_payment"("order_id");

-- CreateIndex
CREATE INDEX "esim_order_before_payment_user_id_idx" ON "esim_order_before_payment"("user_id");

-- CreateIndex
CREATE INDEX "esim_order_before_payment_package_code_idx" ON "esim_order_before_payment"("package_code");

-- CreateIndex
CREATE INDEX "esim_order_before_payment_order_id_idx" ON "esim_order_before_payment"("order_id");

-- CreateIndex
CREATE INDEX "esim_order_before_payment_status_idx" ON "esim_order_before_payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "esim_order_before_payment_order_id_id_key" ON "esim_order_before_payment"("order_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "esim_order_after_payment_order_id_key" ON "esim_order_after_payment"("order_id");

-- AddForeignKey
ALTER TABLE "esim_order_before_payment" ADD CONSTRAINT "esim_order_before_payment_package_code_fkey" FOREIGN KEY ("package_code") REFERENCES "all_packages"("package_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_order_before_payment" ADD CONSTRAINT "esim_order_before_payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_usage_logs" ADD CONSTRAINT "data_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "esim_order_before_payment"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validity_usage_logs" ADD CONSTRAINT "validity_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "esim_order_before_payment"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_status_logs" ADD CONSTRAINT "esim_status_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "esim_order_before_payment"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_order_after_payment" ADD CONSTRAINT "esim_order_after_payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_order_after_payment" ADD CONSTRAINT "esim_order_after_payment_package_code_fkey" FOREIGN KEY ("package_code") REFERENCES "all_packages"("package_code") ON DELETE RESTRICT ON UPDATE CASCADE;
