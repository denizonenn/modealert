-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "seriesKey" TEXT;

-- CreateIndex
CREATE INDEX "Event_seriesKey_idx" ON "Event"("seriesKey");
