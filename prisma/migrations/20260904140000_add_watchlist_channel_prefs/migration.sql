-- AlterTable
ALTER TABLE "Watchlist" ADD COLUMN "emailEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Watchlist" ADD COLUMN "discordEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GameWatchlist" ADD COLUMN "emailEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GameWatchlist" ADD COLUMN "discordEnabled" BOOLEAN NOT NULL DEFAULT true;
