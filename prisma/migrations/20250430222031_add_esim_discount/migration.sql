-- CreateTable
CREATE TABLE "esim_discounts" (
    "id" TEXT NOT NULL,
    "referer_id" TEXT NOT NULL,
    "referer_name" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,
    "discount_percentage" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expire_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esim_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "esim_discounts_referer_name_key" ON "esim_discounts"("referer_name");

-- CreateIndex
CREATE UNIQUE INDEX "esim_discounts_discountCode_key" ON "esim_discounts"("discountCode");

-- CreateIndex
CREATE INDEX "esim_discounts_referer_id_idx" ON "esim_discounts"("referer_id");

-- CreateIndex
CREATE INDEX "esim_discounts_discountCode_idx" ON "esim_discounts"("discountCode");

-- AddForeignKey
ALTER TABLE "esim_order_before_payment" ADD CONSTRAINT "esim_order_before_payment_discount_code_fkey" FOREIGN KEY ("discount_code") REFERENCES "esim_discounts"("discountCode") ON DELETE SET NULL ON UPDATE CASCADE;
