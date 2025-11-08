// Fitness Evaluation Shader for Cutting Optimization
// Parallel First Fit Decreasing (FFD) bin packing on GPU
// Each thread evaluates one individual's fitness

struct Item {
  length: f32,
  quantity: u32,
  profileType: u32,
  _padding: u32,
}

struct Params {
  populationSize: u32,
  individualSize: u32,
  stockLength: f32,
  wasteWeight: f32,
  costWeight: f32,
  efficiencyWeight: f32,
  timeWeight: f32,
}

@group(0) @binding(0) var<storage, read> population: array<u32>;  // Sequence indices
@group(0) @binding(1) var<storage, read> items: array<Item>;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var<storage, read_write> fitnessScores: array<f32>;

@compute @workgroup_size(256)
fn evaluateFitness(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.populationSize) { return; }
  
  // FFD bin packing for this individual
  let startIdx = idx * params.individualSize;
  var totalWaste = 0.0;
  var stocksUsed = 0u;
  
  var currentStock = params.stockLength;
  
  // Process each item in sequence
  for (var i = 0u; i < params.individualSize; i++) {
    let itemIdx = population[startIdx + i];
    let itemLength = items[itemIdx].length;
    
    if (itemLength <= currentStock) {
      // Fit in current stock
      currentStock -= itemLength;
    } else {
      // Start new stock
      totalWaste += currentStock;
      stocksUsed++;
      currentStock = params.stockLength - itemLength;
    }
  }
  
  // Final waste
  totalWaste += currentStock;
  stocksUsed++;
  
  // Calculate normalized scores
  let totalStockLength = f32(stocksUsed) * params.stockLength;
  
  // Waste score (lower waste = higher score)
  let wasteScore = 1.0 - (totalWaste / totalStockLength);
  
  // Efficiency score (same as waste in this case)
  let efficiency = 1.0 - (totalWaste / totalStockLength);
  
  // Cost score (fewer stocks = higher score)
  let costScore = 1.0 - (f32(stocksUsed) / f32(params.individualSize));
  
  // Time score (proportional to stocks used)
  let timeScore = 1.0 - (f32(stocksUsed) / f32(params.individualSize * 2u));
  
  // Weighted fitness
  fitnessScores[idx] = 
    params.wasteWeight * wasteScore +
    params.costWeight * costScore +
    params.efficiencyWeight * efficiency +
    params.timeWeight * timeScore;
}

