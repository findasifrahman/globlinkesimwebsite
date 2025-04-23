/*
  Warnings:

  - You are about to drop the column `processed` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orderNo` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `payload` on the `WebhookEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "processed",
DROP COLUMN "updatedAt",
ADD COLUMN     "iccid" TEXT,
ADD COLUMN     "orderNo" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT,
DROP COLUMN "payload",
ADD COLUMN     "payload" JSONB NOT NULL;

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "all_packages" (
    "id" SERIAL NOT NULL,
    "package_name" TEXT NOT NULL,
    "package_code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency_code" TEXT NOT NULL,
    "sms_status" BOOLEAN NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "active_type" INTEGER NOT NULL,
    "retail_price" DOUBLE PRECISION NOT NULL,
    "speed" TEXT NOT NULL,
    "multiregion" BOOLEAN NOT NULL DEFAULT false,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "operators" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "all_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "country" TEXT,
    "address" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "order_profiles" (
    "transaction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_code" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "period_num" INTEGER NOT NULL,
    "order_no" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_profiles_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "data_usage_logs" (
    "id" SERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "usage_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validity_usage_logs" (
    "id" SERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "usage_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validity_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esim_status_logs" (
    "id" SERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "status_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "esim_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "all_packages_package_code_key" ON "all_packages"("package_code");

-- CreateIndex
CREATE UNIQUE INDEX "all_packages_slug_key" ON "all_packages"("slug");

-- CreateIndex
CREATE INDEX "all_packages_package_code_idx" ON "all_packages"("package_code");

-- CreateIndex
CREATE INDEX "all_packages_slug_idx" ON "all_packages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "order_profiles_order_no_key" ON "order_profiles"("order_no");

-- CreateIndex
CREATE INDEX "order_profiles_user_id_idx" ON "order_profiles"("user_id");

-- CreateIndex
CREATE INDEX "order_profiles_package_code_idx" ON "order_profiles"("package_code");

-- CreateIndex
CREATE INDEX "order_profiles_order_no_idx" ON "order_profiles"("order_no");

-- CreateIndex
CREATE INDEX "order_profiles_status_idx" ON "order_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "order_profiles_order_no_transaction_id_key" ON "order_profiles"("order_no", "transaction_id");

-- CreateIndex
CREATE INDEX "data_usage_logs_order_no_idx" ON "data_usage_logs"("order_no");

-- CreateIndex
CREATE INDEX "validity_usage_logs_order_no_idx" ON "validity_usage_logs"("order_no");

-- CreateIndex
CREATE INDEX "esim_status_logs_order_no_idx" ON "esim_status_logs"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNo_key" ON "orders"("orderNo");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_profiles" ADD CONSTRAINT "order_profiles_package_code_fkey" FOREIGN KEY ("package_code") REFERENCES "all_packages"("package_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_profiles" ADD CONSTRAINT "order_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_usage_logs" ADD CONSTRAINT "data_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_no", "transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validity_usage_logs" ADD CONSTRAINT "validity_usage_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_no", "transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esim_status_logs" ADD CONSTRAINT "esim_status_logs_order_no_transaction_id_fkey" FOREIGN KEY ("order_no", "transaction_id") REFERENCES "order_profiles"("order_no", "transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_code_fkey" FOREIGN KEY ("package_code") REFERENCES "all_packages"("package_code") ON DELETE RESTRICT ON UPDATE CASCADE;
