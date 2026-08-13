-- AlterTable
ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "lemonSqueezyCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "lemonSqueezySubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionRenewsAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_lemonSqueezySubscriptionId_key" ON "User"("lemonSqueezySubscriptionId");
