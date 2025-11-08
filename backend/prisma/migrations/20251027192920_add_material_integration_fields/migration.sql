-- AlterTable
ALTER TABLE "cutting_list_items" ADD COLUMN     "materialDescription" TEXT,
ADD COLUMN     "materialNumber" TEXT,
ADD COLUMN     "productionPlanItemId" TEXT;

-- CreateTable
CREATE TABLE "production_plans" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plan_items" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "siparisVeren" TEXT NOT NULL,
    "musteriNo" TEXT NOT NULL,
    "musteriKalemi" TEXT NOT NULL,
    "siparis" TEXT NOT NULL,
    "malzemeNo" TEXT NOT NULL,
    "malzemeKisaMetni" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "planlananBitisTarihi" TIMESTAMP(3) NOT NULL,
    "bolum" TEXT NOT NULL,
    "oncelik" TEXT NOT NULL,
    "linkedCuttingListId" TEXT,

    CONSTRAINT "production_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_profile_mappings" (
    "id" TEXT NOT NULL,
    "malzemeNo" TEXT NOT NULL,
    "malzemeKisaMetni" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_profile_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "production_plans_weekNumber_year_status_idx" ON "production_plans"("weekNumber", "year", "status");

-- CreateIndex
CREATE INDEX "production_plans_uploadedAt_idx" ON "production_plans"("uploadedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "production_plans_weekNumber_year_key" ON "production_plans"("weekNumber", "year");

-- CreateIndex
CREATE INDEX "production_plan_items_planId_idx" ON "production_plan_items"("planId");

-- CreateIndex
CREATE INDEX "production_plan_items_siparis_idx" ON "production_plan_items"("siparis");

-- CreateIndex
CREATE INDEX "production_plan_items_oncelik_planlananBitisTarihi_idx" ON "production_plan_items"("oncelik", "planlananBitisTarihi");

-- CreateIndex
CREATE INDEX "production_plan_items_bolum_oncelik_idx" ON "production_plan_items"("bolum", "oncelik");

-- CreateIndex
CREATE INDEX "production_plan_items_linkedCuttingListId_idx" ON "production_plan_items"("linkedCuttingListId");

-- CreateIndex
CREATE INDEX "material_profile_mappings_malzemeNo_idx" ON "material_profile_mappings"("malzemeNo");

-- CreateIndex
CREATE INDEX "material_profile_mappings_usageCount_lastUsed_idx" ON "material_profile_mappings"("usageCount", "lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "material_profile_mappings_malzemeNo_profileType_length_key" ON "material_profile_mappings"("malzemeNo", "profileType", "length");

-- CreateIndex
CREATE INDEX "cutting_list_items_materialNumber_idx" ON "cutting_list_items"("materialNumber");

-- CreateIndex
CREATE INDEX "cutting_list_items_productionPlanItemId_idx" ON "cutting_list_items"("productionPlanItemId");

-- AddForeignKey
ALTER TABLE "production_plan_items" ADD CONSTRAINT "production_plan_items_linkedCuttingListId_fkey" FOREIGN KEY ("linkedCuttingListId") REFERENCES "cutting_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plan_items" ADD CONSTRAINT "production_plan_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "production_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
