-- CreateEnum
CREATE TYPE "CuttingListStatus" AS ENUM ('DRAFT', 'READY', 'PROCESSING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "cutting_lists" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "cutting_lists" ALTER COLUMN "status" TYPE "CuttingListStatus" USING ("status"::text::"CuttingListStatus");
ALTER TABLE "cutting_lists" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "cutting_list_items" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "cutting_list_items" ALTER COLUMN "priority" TYPE "ItemPriority" USING ("priority"::text::"ItemPriority");
ALTER TABLE "cutting_list_items" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "cutting_list_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "cutting_list_items" ALTER COLUMN "status" TYPE "CuttingListStatus" USING ("status"::text::"CuttingListStatus");
ALTER TABLE "cutting_list_items" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

