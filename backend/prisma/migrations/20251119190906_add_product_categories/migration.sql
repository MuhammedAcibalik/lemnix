-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_mappings" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE INDEX "product_categories_name_idx" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_mappings_productName_key" ON "product_mappings"("productName");

-- CreateIndex
CREATE INDEX "product_mappings_productName_idx" ON "product_mappings"("productName");

-- CreateIndex
CREATE INDEX "product_mappings_categoryId_idx" ON "product_mappings"("categoryId");

-- CreateIndex
CREATE INDEX "profile_stock_lengths_stockLength_idx" ON "profile_stock_lengths"("stockLength");

-- CreateIndex
CREATE INDEX "work_order_profile_mappings_workOrderId_weekNumber_year_idx" ON "work_order_profile_mappings"("workOrderId", "weekNumber", "year");

-- AddForeignKey
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
