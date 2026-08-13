-- CreateIndex
CREATE INDEX "Event_gameId_idx" ON "Event"("gameId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Watchlist_eventId_idx" ON "Watchlist"("eventId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
