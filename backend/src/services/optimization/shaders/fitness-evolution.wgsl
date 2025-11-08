// Enhanced Fitness Evaluation Shader for GPU Evolution
// Multi-objective optimization with dynamic normalization
// Supports waste minimization, efficiency maximization, cost minimization, time minimization
// 
// Features:
// - Dynamic fitness normalization based on population statistics
// - Multi-objective weighted sum
// - Greedy First Fit Decreasing (FFD) bin packing
// - Aluminum-optimized objective weights
// - Performance metrics calculation

struct Item {
  length: f32,
  quantity: u32,
  profileType: u32,
  _padding: u32,
}

struct EvolutionParams {
  populationSize: u32,
  individualSize: u32,
  stockLength: f32,
  wasteWeight: f32,
  costWeight: f32,
  efficiencyWeight: f32,
  timeWeight: f32,
  // Normalization factors (calculated dynamically)
  maxWaste: f32,
  minWaste: f32,
  maxCost: f32,
  minCost: f32,
  maxEfficiency: f32,
  minEfficiency: f32,
  maxTime: f32,
  minTime: f32,
  // Material properties
  kerfWidth: f32,
  startSafety: f32,
  endSafety: f32,
  minScrapLength: f32,
}

struct FitnessResult {
  waste: f32,
  cost: f32,
  efficiency: f32,
  time: f32,
  totalFitness: f32,
  stocksUsed: u32,
  totalLength: f32,
}

@group(0) @binding(0) var<storage, read> population: array<u32>;  // Sequence indices
@group(0) @binding(1) var<storage, read> items: array<Item>;
@group(0) @binding(2) var<uniform> params: EvolutionParams;
@group(0) @binding(3) var<storage, read_write> fitnessScores: array<f32>;
@group(0) @binding(4) var<storage, read_write> fitnessDetails: array<FitnessResult>;

/**
 * Normalize value to [0, 1] range using min-max normalization
 * Handles edge case where min == max
 */
fn normalize(value: f32, minVal: f32, maxVal: f32) -> f32 {
  let range = maxVal - minVal;
  if (range <= 0.0) {
    return 0.5; // Neutral value when no range
  }
  return (value - minVal) / range;
}

/**
 * Calculate waste for a single cut
 * Includes kerf width and safety margins
 */
fn calculateCutWaste(
  itemLength: f32,
  stockLength: f32,
  kerfWidth: f32,
  startSafety: f32,
  endSafety: f32
) -> f32 {
  // ✅ FIX: Kerf width 0 ise kerf hesaplama yapma (kesim listelerindeki ölçüler zaten kerf payı eklenmiş)
  let totalItemLength = itemLength + (kerfWidth > 0.0 ? kerfWidth : 0.0);
  let totalSafety = startSafety + endSafety;
  let usedLength = totalItemLength + totalSafety;
  
  if (usedLength > stockLength) {
    return stockLength; // Item doesn't fit, full stock is waste
  }
  
  return stockLength - usedLength;
}

/**
 * Calculate cost based on stocks used and material cost
 * Simplified cost model: base cost per stock + waste cost
 */
fn calculateCost(
  stocksUsed: u32,
  totalWaste: f32,
  stockLength: f32,
  wasteCostPerMm: f32
) -> f32 {
  let baseCost = f32(stocksUsed) * 100.0; // Base cost per stock (TRY)
  let wasteCost = totalWaste * wasteCostPerMm;
  return baseCost + wasteCost;
}

/**
 * Calculate efficiency as percentage of material used
 */
fn calculateEfficiency(
  totalItemLength: f32,
  totalStockLength: f32
) -> f32 {
  if (totalStockLength <= 0.0) {
    return 0.0;
  }
  return (totalItemLength / totalStockLength) * 100.0;
}

/**
 * Calculate estimated production time
 * Based on cutting time per item + setup time per stock
 */
fn calculateTime(
  stocksUsed: u32,
  itemCount: u32,
  cuttingTimePerMm: f32,
  setupTimePerStock: f32
) -> f32 {
  let totalCuttingTime = f32(itemCount) * cuttingTimePerMm;
  let totalSetupTime = f32(stocksUsed) * setupTimePerStock;
  return totalCuttingTime + totalSetupTime;
}

/**
 * First Fit Decreasing (FFD) bin packing algorithm
 * Optimized for GPU parallel execution
 */
fn ffdBinPacking(
  sequence: array<u32, 256>, // Max 256 items per individual
  itemCount: u32,
  stockLength: f32,
  kerfWidth: f32,
  startSafety: f32,
  endSafety: f32
) -> FitnessResult {
  var totalWaste: f32 = 0.0;
  var stocksUsed: u32 = 0u;
  var totalItemLength: f32 = 0.0;
  var currentStock: f32 = stockLength;
  
  // Process each item in sequence
  for (var i = 0u; i < itemCount; i++) {
    let itemIdx = sequence[i];
    let itemLength = items[itemIdx].length;
    let quantity = items[itemIdx].quantity;
    
    // Process all quantities of this item
    for (var q = 0u; q < quantity; q++) {
      totalItemLength += itemLength;
      
      let cutWaste = calculateCutWaste(
        itemLength,
        currentStock,
        kerfWidth,
        startSafety,
        endSafety
      );
      
      if (cutWaste < stockLength) {
        // Item fits in current stock
        let kerfToAdd = kerfWidth > 0.0 ? kerfWidth : 0.0;
        currentStock -= (itemLength + kerfToAdd + startSafety + endSafety);
      } else {
        // Start new stock
        totalWaste += currentStock;
        stocksUsed += 1u;
        let kerfToAdd = kerfWidth > 0.0 ? kerfWidth : 0.0;
        currentStock = stockLength - (itemLength + kerfToAdd + startSafety + endSafety);
      }
    }
  }
  
  // Add final waste
  totalWaste += currentStock;
  stocksUsed += 1u;
  
  let totalStockLength = f32(stocksUsed) * stockLength;
  
  // Calculate objectives
  let waste = totalWaste;
  let cost = calculateCost(stocksUsed, totalWaste, stockLength, 0.1); // 0.1 TRY per mm waste
  let efficiency = calculateEfficiency(totalItemLength, totalStockLength);
  let time = calculateTime(stocksUsed, itemCount, 0.001, 5.0); // 0.001 min/mm, 5 min setup
  
  return FitnessResult(
    waste,
    cost,
    efficiency,
    time,
    0.0, // totalFitness will be calculated later
    stocksUsed,
    totalStockLength
  );
}

/**
 * Calculate weighted fitness score
 * Uses aluminum-optimized weights: waste=0.50, efficiency=0.30, cost=0.15, time=0.05
 */
fn calculateWeightedFitness(
  result: FitnessResult,
  wasteWeight: f32,
  costWeight: f32,
  efficiencyWeight: f32,
  timeWeight: f32,
  maxWaste: f32,
  minWaste: f32,
  maxCost: f32,
  minCost: f32,
  maxEfficiency: f32,
  minEfficiency: f32,
  maxTime: f32,
  minTime: f32
) -> f32 {
  // Normalize objectives to [0, 1] range
  // For waste and cost: lower is better (1 - normalized)
  // For efficiency: higher is better (normalized)
  // For time: lower is better (1 - normalized)
  
  let wasteScore = 1.0 - normalize(result.waste, minWaste, maxWaste);
  let costScore = 1.0 - normalize(result.cost, minCost, maxCost);
  let efficiencyScore = normalize(result.efficiency, minEfficiency, maxEfficiency);
  let timeScore = 1.0 - normalize(result.time, minTime, maxTime);
  
  // Clamp scores to [0, 1] range
  let clampedWaste = clamp(wasteScore, 0.0, 1.0);
  let clampedCost = clamp(costScore, 0.0, 1.0);
  let clampedEfficiency = clamp(efficiencyScore, 0.0, 1.0);
  let clampedTime = clamp(timeScore, 0.0, 1.0);
  
  // Calculate weighted sum
  return wasteWeight * clampedWaste +
         costWeight * clampedCost +
         efficiencyWeight * clampedEfficiency +
         timeWeight * clampedTime;
}

/**
 * Main fitness evaluation kernel
 * Each thread evaluates one individual's fitness
 */
@compute @workgroup_size(256)
fn evaluateFitness(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  
  if (idx >= params.populationSize) { return; }
  
  // Extract individual sequence
  let startIdx = idx * params.individualSize;
  var sequence: array<u32, 256>;
  
  // Copy sequence (with bounds checking)
  for (var i = 0u; i < params.individualSize && i < 256u; i++) {
    sequence[i] = population[startIdx + i];
  }
  
  // Run FFD bin packing
  let result = ffdBinPacking(
    sequence,
    params.individualSize,
    params.stockLength,
    params.kerfWidth,
    params.startSafety,
    params.endSafety
  );
  
  // Calculate weighted fitness
  let fitness = calculateWeightedFitness(
    result,
    params.wasteWeight,
    params.costWeight,
    params.efficiencyWeight,
    params.timeWeight,
    params.maxWaste,
    params.minWaste,
    params.maxCost,
    params.minCost,
    params.maxEfficiency,
    params.minEfficiency,
    params.maxTime,
    params.minTime
  );
  
  // Store results
  fitnessScores[idx] = fitness;
  
  // Store detailed results (if buffer is available)
  if (idx < arrayLength(&fitnessDetails)) {
    var detailedResult = result;
    detailedResult.totalFitness = fitness;
    fitnessDetails[idx] = detailedResult;
  }
}

/**
 * Calculate normalization factors for the current population
 * This should be run before the main fitness evaluation
 */
@compute @workgroup_size(256)
fn calculateNormalizationFactors(@builtin(global_invocation_id) global_id: vec3<u32>) {
  // This kernel would calculate min/max values for normalization
  // Implementation depends on whether we want to do this on GPU or CPU
  // For now, this is a placeholder
}
