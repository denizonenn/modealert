/*
  Warnings:

  - Added the required column `source` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trackedUsers" INTEGER NOT NULL,
    "lastChecked" TEXT NOT NULL,
    CONSTRAINT "Event_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("gameId", "id", "lastChecked", "status", "title", "trackedUsers") SELECT "gameId", "id", "lastChecked", "status", "title", "trackedUsers" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_source_idx" ON "Event"("source");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
