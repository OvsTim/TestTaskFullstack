-- CreateTable
CREATE TABLE "WorkEntry" (
    "id" TEXT NOT NULL,
    "completedAt" DATE NOT NULL,
    "workName" TEXT NOT NULL,
    "volume" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "performer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkEntry_completedAt_idx" ON "WorkEntry"("completedAt");
