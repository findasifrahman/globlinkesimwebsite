-- CreateTable
CREATE TABLE "payment_webhook_states" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "pm_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "payment_webhook_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_webhook_states_order_id_idx" ON "payment_webhook_states"("order_id");

-- CreateIndex
CREATE INDEX "payment_webhook_states_user_id_idx" ON "payment_webhook_states"("user_id");

-- CreateIndex
CREATE INDEX "payment_webhook_states_status_idx" ON "payment_webhook_states"("status");
