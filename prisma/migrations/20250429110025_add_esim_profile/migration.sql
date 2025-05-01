-- CreateTable
CREATE TABLE "esim_profiles" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "qrCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esim_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "esim_profiles_orderId_key" ON "esim_profiles"("orderId");

-- AddForeignKey
ALTER TABLE "esim_profiles" ADD CONSTRAINT "esim_profiles_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "esim_order_after_payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
