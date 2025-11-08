-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_patterns" (
    "id" TEXT NOT NULL,
    "contextKey" TEXT NOT NULL,
    "patternKey" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "measurement" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "averageQuantity" DOUBLE PRECISION NOT NULL,
    "contexts" JSONB NOT NULL,
    "variations" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_caches" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "productName" TEXT,
    "size" TEXT,
    "suggestionCount" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestion_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_tableName_operation_idx" ON "audit_logs"("tableName", "operation");

-- CreateIndex
CREATE INDEX "audit_logs_recordId_idx" ON "audit_logs"("recordId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_patterns_patternKey_key" ON "suggestion_patterns"("patternKey");

-- CreateIndex
CREATE INDEX "suggestion_patterns_contextKey_confidence_idx" ON "suggestion_patterns"("contextKey", "confidence" DESC);

-- CreateIndex
CREATE INDEX "suggestion_patterns_productName_size_idx" ON "suggestion_patterns"("productName", "size");

-- CreateIndex
CREATE INDEX "suggestion_patterns_profile_measurement_idx" ON "suggestion_patterns"("profile", "measurement");

-- CreateIndex
CREATE INDEX "suggestion_patterns_frequency_idx" ON "suggestion_patterns"("frequency" DESC);

-- CreateIndex
CREATE INDEX "suggestion_patterns_lastUsed_idx" ON "suggestion_patterns"("lastUsed" DESC);

-- CreateIndex
CREATE INDEX "suggestion_patterns_contexts_idx" ON "suggestion_patterns" USING GIN ("contexts" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_caches_cacheKey_key" ON "suggestion_caches"("cacheKey");

-- CreateIndex
CREATE INDEX "suggestion_caches_cacheType_expiresAt_idx" ON "suggestion_caches"("cacheType", "expiresAt");

-- CreateIndex
CREATE INDEX "suggestion_caches_expiresAt_idx" ON "suggestion_caches"("expiresAt");

-- CreateIndex
CREATE INDEX "suggestion_metrics_metricType_timestamp_idx" ON "suggestion_metrics"("metricType", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "suggestion_metrics_productName_size_idx" ON "suggestion_metrics"("productName", "size");

-- CreateIndex
CREATE INDEX "cutting_lists_userId_status_createdAt_idx" ON "cutting_lists"("userId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "cutting_lists_status_weekNumber_updatedAt_idx" ON "cutting_lists"("status", "weekNumber", "updatedAt");

-- CreateIndex
CREATE INDEX "cutting_lists_sections_idx" ON "cutting_lists" USING GIN ("sections" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "cutting_lists_metadata_idx" ON "cutting_lists" USING GIN ("metadata" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "optimizations_userId_algorithm_createdAt_idx" ON "optimizations"("userId", "algorithm", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "optimizations_status_algorithm_createdAt_idx" ON "optimizations"("status", "algorithm", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "optimizations_parameters_idx" ON "optimizations" USING GIN ("parameters" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "optimizations_result_idx" ON "optimizations" USING GIN ("result" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "optimizations_metadata_idx" ON "optimizations" USING GIN ("metadata" jsonb_path_ops);
