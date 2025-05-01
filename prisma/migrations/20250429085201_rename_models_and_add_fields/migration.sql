/*
  Warnings:

  - The primary key for the `order_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `order_no` on the `order_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `orderNo` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `order_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,id]` on the table `order_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `order_profiles` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `order_profiles` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `order_id` to the `order_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidAmount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pm_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pm_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "data_usage_logs" DROP CONSTRAINT "data_usage_logs_order_no_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "esim_status_logs" DROP CONSTRAINT "esim_status_logs_order_no_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "validity_usage_logs" DROP CONSTRAINT "validity_usage_logs_order_no_transaction_id_fkey";

-- DropIndex
DROP INDEX "order_profiles_order_no_idx";

-- DropIndex
DROP INDEX "order_profiles_order_no_key";

-- DropIndex
DROP INDEX "order_profiles_order_no_transaction_id_key";

-- DropIndex
DROP INDEX "orders_orderNo_key";

-- AlterTable
ALTER TABLE "order_profiles" DROP CONSTRAINT "order_profiles_pkey",
DROP COLUMN "order_no",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "order_id" TEXT NOT NULL,
ADD COLUMN     "paymentState" TEXT NOT NULL DEFAULT 'pending',
ADD CONSTRAINT "order_profiles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "orderNo",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "order_id" TEXT NOT NULL,
ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "paymentState" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "pm_id" TEXT NOT NULL,
ADD COLUMN     "pm_name" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_profiles_order_id_key" ON "order_profiles"("order_id");

-- CreateIndex
CREATE INDEX "order_profiles_order_id_idx" ON "order_profiles"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_profiles_order_id_id_key" ON "order_profiles"("order_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_id_key" ON "orders"("order_id");

-- AddForeignKey
ALTER TABLE "data_usage_logs" ADD CONSTRAINT "data_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validity_usage_logs" ADD CONSTRAINT "validity_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_status_logs" ADD CONSTRAINT "esim_status_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
