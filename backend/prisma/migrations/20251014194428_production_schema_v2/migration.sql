/*
  Warnings:

  - The `sections` column on the `cutting_lists` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parameters` column on the `optimization_statistics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `result` column on the `optimizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metadata` column on the `system_metrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `activityData` column on the `user_activities` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,weekNumber]` on the table `cutting_lists` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `parameters` on the `optimizations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "optimizations_algorithm_createdAt_idx";

-- AlterTable
ALTER TABLE "cutting_lists" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "weekNumber" INTEGER,
DROP COLUMN "sections",
ADD COLUMN     "sections" JSONB;

-- AlterTable
ALTER TABLE "optimization_statistics" DROP COLUMN "parameters",
ADD COLUMN     "parameters" JSONB;

-- AlterTable
ALTER TABLE "optimizations" ADD COLUMN     "metadata" JSONB,
DROP COLUMN "parameters",
ADD COLUMN     "parameters" JSONB NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" JSONB;

-- AlterTable
ALTER TABLE "system_metrics" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "user_activities" DROP COLUMN "activityData",
ADD COLUMN     "activityData" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'planner';

-- CreateIndex
CREATE INDEX "cutting_lists_weekNumber_status_idx" ON "cutting_lists"("weekNumber", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cutting_lists_userId_weekNumber_key" ON "cutting_lists"("userId", "weekNumber");

-- CreateIndex
CREATE INDEX "optimization_statistics_algorithm_createdAt_idx" ON "optimization_statistics"("algorithm", "createdAt");

-- CreateIndex
CREATE INDEX "optimizations_algorithm_status_idx" ON "optimizations"("algorithm", "status");

-- CreateIndex
CREATE INDEX "optimizations_createdAt_idx" ON "optimizations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
