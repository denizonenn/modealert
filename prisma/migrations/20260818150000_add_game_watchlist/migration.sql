-- CreateTable
CREATE TABLE "GameWatchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameWatchlist_userId_gameId_key" ON "GameWatchlist"("userId", "gameId");

-- CreateIndex
CREATE INDEX "GameWatchlist_gameId_idx" ON "GameWatchlist"("gameId");

-- AddForeignKey
ALTER TABLE "GameWatchlist" ADD CONSTRAINT "GameWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameWatchlist" ADD CONSTRAINT "GameWatchlist_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
