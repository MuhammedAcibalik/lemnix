-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutting_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sections" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "cutting_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutting_list_items" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "date" TEXT,
    "color" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderQuantity" INTEGER,
    "cuttingPattern" TEXT,
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuttingListId" TEXT NOT NULL,

    CONSTRAINT "cutting_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimizations" (
    "id" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_lengths" (
    "id" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_lengths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "customerName" TEXT,
    "projectName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutting_list_statistics" (
    "id" TEXT NOT NULL,
    "cuttingListId" TEXT NOT NULL,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalProfiles" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "averageWastePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "optimizationCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "efficiencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cutting_list_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_statistics" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "profileCount" INTEGER NOT NULL DEFAULT 0,
    "totalLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageLength" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "efficiencyRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_usage_statistics" (
    "id" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "measurement" DOUBLE PRECISION NOT NULL,
    "totalUsageCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "averageQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "frequencyRank" INTEGER NOT NULL DEFAULT 0,
    "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_usage_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimization_statistics" (
    "id" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "inputItemCount" INTEGER NOT NULL DEFAULT 0,
    "outputItemCount" INTEGER NOT NULL DEFAULT 0,
    "wasteReductionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageEfficiency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optimization_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "activityData" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cutting_lists_userId_status_idx" ON "cutting_lists"("userId", "status");

-- CreateIndex
CREATE INDEX "cutting_lists_createdAt_idx" ON "cutting_lists"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "cutting_lists_status_updatedAt_idx" ON "cutting_lists"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "cutting_list_items_cuttingListId_idx" ON "cutting_list_items"("cuttingListId");

-- CreateIndex
CREATE INDEX "cutting_list_items_workOrderId_idx" ON "cutting_list_items"("workOrderId");

-- CreateIndex
CREATE INDEX "cutting_list_items_profileType_color_idx" ON "cutting_list_items"("profileType", "color");

-- CreateIndex
CREATE INDEX "cutting_list_items_status_priority_idx" ON "cutting_list_items"("status", "priority");

-- CreateIndex
CREATE INDEX "optimizations_userId_status_idx" ON "optimizations"("userId", "status");

-- CreateIndex
CREATE INDEX "optimizations_algorithm_createdAt_idx" ON "optimizations"("algorithm", "createdAt");

-- CreateIndex
CREATE INDEX "optimizations_status_createdAt_idx" ON "optimizations"("status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "profile_types_name_key" ON "profile_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_workOrderId_key" ON "work_orders"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_usage_statistics_profileType_profileName_measuremen_key" ON "profile_usage_statistics"("profileType", "profileName", "measurement");

-- CreateIndex
CREATE INDEX "system_metrics_metricType_timestamp_idx" ON "system_metrics"("metricType", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_metrics_timestamp_idx" ON "system_metrics"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_activities_activityType_createdAt_idx" ON "user_activities"("activityType", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "user_activities"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "cutting_lists" ADD CONSTRAINT "cutting_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutting_list_items" ADD CONSTRAINT "cutting_list_items_cuttingListId_fkey" FOREIGN KEY ("cuttingListId") REFERENCES "cutting_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutting_list_items" ADD CONSTRAINT "cutting_list_items_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("workOrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimizations" ADD CONSTRAINT "optimizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutting_list_statistics" ADD CONSTRAINT "cutting_list_statistics_cuttingListId_fkey" FOREIGN KEY ("cuttingListId") REFERENCES "cutting_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_statistics" ADD CONSTRAINT "work_order_statistics_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
