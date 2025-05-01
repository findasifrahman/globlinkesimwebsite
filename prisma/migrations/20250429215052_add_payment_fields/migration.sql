-- AlterTable
ALTER TABLE "esim_order_after_payment" ADD COLUMN     "discount_code" TEXT,
ADD COLUMN     "final_amount_paid" DOUBLE PRECISION,
ADD COLUMN     "payment_order_no" TEXT;

-- AlterTable
ALTER TABLE "esim_order_before_payment" ADD COLUMN     "discount_code" TEXT,
ADD COLUMN     "final_amount_paid" DOUBLE PRECISION,
ADD COLUMN     "payment_order_no" TEXT;
