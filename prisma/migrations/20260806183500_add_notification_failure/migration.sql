-- CreateTable
CREATE TABLE "NotificationFailure" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationFailure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationFailure_userId_idx" ON "NotificationFailure"("userId");

-- CreateIndex
CREATE INDEX "NotificationFailure_createdAt_idx" ON "NotificationFailure"("createdAt");
