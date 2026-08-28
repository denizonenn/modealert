-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardedAt" TIMESTAMP(3);

-- Backfill: every account that already exists as of this migration is
-- treated as already onboarded, so existing users keep going straight
-- to /dashboard after sign-in. Only accounts created after this point
-- start with onboardedAt = NULL and get routed through /onboarding.
UPDATE "User" SET "onboardedAt" = CURRENT_TIMESTAMP WHERE "onboardedAt" IS NULL;
