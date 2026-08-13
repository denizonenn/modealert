-- CreateTable
CREATE TABLE "EventChange" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventChange_eventId_idx" ON "EventChange"("eventId");

-- CreateIndex
CREATE INDEX "EventChange_changedAt_idx" ON "EventChange"("changedAt");

-- AddForeignKey
ALTER TABLE "EventChange" ADD CONSTRAINT "EventChange_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
