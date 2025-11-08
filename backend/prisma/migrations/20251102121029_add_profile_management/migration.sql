-- CreateTable
CREATE TABLE "profile_definitions" (
    "id" TEXT NOT NULL,
    "profileCode" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_stock_lengths" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "stockLength" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_stock_lengths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_profile_mappings" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_profile_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_definitions_isActive_idx" ON "profile_definitions"("isActive");

-- CreateIndex
CREATE INDEX "profile_definitions_profileCode_isActive_idx" ON "profile_definitions"("profileCode", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "profile_definitions_profileCode_key" ON "profile_definitions"("profileCode");

-- CreateIndex
CREATE INDEX "profile_stock_lengths_profileId_isDefault_idx" ON "profile_stock_lengths"("profileId", "isDefault");

-- CreateIndex
CREATE INDEX "profile_stock_lengths_profileId_priority_idx" ON "profile_stock_lengths"("profileId", "priority");

-- CreateIndex
CREATE INDEX "work_order_profile_mappings_weekNumber_year_idx" ON "work_order_profile_mappings"("weekNumber", "year");

-- CreateIndex
CREATE INDEX "work_order_profile_mappings_profileType_idx" ON "work_order_profile_mappings"("profileType");

-- CreateIndex
CREATE INDEX "work_order_profile_mappings_workOrderId_idx" ON "work_order_profile_mappings"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_profile_mappings_profileId_weekNumber_year_idx" ON "work_order_profile_mappings"("profileId", "weekNumber", "year");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_profile_mappings_workOrderId_profileType_weekNum_key" ON "work_order_profile_mappings"("workOrderId", "profileType", "weekNumber", "year");

-- AddForeignKey
ALTER TABLE "profile_stock_lengths" ADD CONSTRAINT "profile_stock_lengths_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_profile_mappings" ADD CONSTRAINT "work_order_profile_mappings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
