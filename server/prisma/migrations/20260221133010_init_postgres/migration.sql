-- CreateTable
CREATE TABLE "IntelligenceUnit" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cpu" TEXT,
    "gpu" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "metadata" TEXT,
    "condition" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "avgPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER NOT NULL,
    "dealThreshold" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofUrl" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelligenceUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" INTEGER,
    "intelligenceUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'subscriber',
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiry" TIMESTAMP(3),
    "provider" TEXT NOT NULL DEFAULT 'email',
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ProductLink" ADD CONSTRAINT "ProductLink_intelligenceUnitId_fkey" FOREIGN KEY ("intelligenceUnitId") REFERENCES "IntelligenceUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
