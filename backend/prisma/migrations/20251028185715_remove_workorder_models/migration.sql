/*
  Warnings:

  - You are about to drop the `work_order_statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cutting_list_items" DROP CONSTRAINT "cutting_list_items_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "work_order_statistics" DROP CONSTRAINT "work_order_statistics_workOrderId_fkey";

-- AlterTable
ALTER TABLE "production_plan_items" ADD COLUMN     "encryptedAd" TEXT,
ADD COLUMN     "encryptedMalzemeKisaMetni" TEXT,
ADD COLUMN     "encryptedMalzemeNo" TEXT,
ADD COLUMN     "encryptedMusteriKalemi" TEXT,
ADD COLUMN     "encryptedMusteriNo" TEXT,
ADD COLUMN     "encryptedSiparis" TEXT,
ADD COLUMN     "encryptedSiparisVeren" TEXT;

-- DropTable
DROP TABLE "work_order_statistics";

-- DropTable
DROP TABLE "work_orders";
