-- AlterTable
ALTER TABLE "suggestion_patterns" ADD COLUMN     "averageRatio" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "orderQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "ratio" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "ratioHistory" JSONB;

-- CreateIndex
CREATE INDEX "suggestion_patterns_orderQuantity_ratio_idx" ON "suggestion_patterns"("orderQuantity", "ratio");
