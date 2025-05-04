-- CreateTable
CREATE TABLE "PackageSyncJob" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPackages" INTEGER NOT NULL,
    "processedPackages" INTEGER NOT NULL DEFAULT 0,
    "packages" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageSyncJob_pkey" PRIMARY KEY ("id")
);
