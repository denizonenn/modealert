-- CreateTable
CREATE TABLE "ProviderHealthCheck" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "healthy" BOOLEAN NOT NULL,
    "latencyMs" INTEGER,
    "error" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderHealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderHealthCheck_providerId_idx" ON "ProviderHealthCheck"("providerId");

-- CreateIndex
CREATE INDEX "ProviderHealthCheck_checkedAt_idx" ON "ProviderHealthCheck"("checkedAt");
