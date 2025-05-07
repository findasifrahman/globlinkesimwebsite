-- AlterTable
ALTER TABLE "esim_order_after_payment" ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;
