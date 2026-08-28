-- CreateTable
CREATE TABLE "AnonymousFunnelEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousFunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnonymousFunnelEvent_name_createdAt_idx" ON "AnonymousFunnelEvent"("name", "createdAt");
