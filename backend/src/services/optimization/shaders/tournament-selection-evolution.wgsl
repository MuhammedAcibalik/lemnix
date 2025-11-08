// Tournament Selection Shader for GPU Evolution
// Implements tournament selection with size=3 for genetic algorithm
// 
// Features:
// - Deterministic tournament selection using GPU RNG
// - Configurable tournament size (default: 3)
// - Fitness-based selection pressure
// - Parallel execution for entire population
// - Preserves diversity through random selection

struct SelectionParams {
  populationSize: u32,
  individualSize: u32,
  tournamentSize: u32,
  eliteCount: u32,        // Number of elite individuals to preserve
  _padding: u32,
}

@group(0) @binding(0) var<storage, read> fitnessScores: array<f32>;
@group(0) @binding(1) var<storage, read> population: array<u32>;
@group(0) @binding(2) var<storage, read> rngState: array<u32>;
@group(0) @binding(3) var<uniform> params: SelectionParams;
@group(0) @binding(4) var<storage, read_write> selectedParents: array<u32>;
@group(0) @binding(5) var<storage, read_write> newPopulation: array<u32>;
@group(0) @binding(6) var<storage, read_write> randomNumbers: array<f32>;

// LCG constants for RNG
const A: u32 = 1664525u;
const C: u32 = 1013904223u;
const M: u32 = 0x100000000u; // 2^32

/**
 * Linear Congruential Generator
 * Generates next random number in sequence
 */
fn lcg(state: u32) -> u32 {
  return (A * state + C) % M;
}

/**
 * Convert u32 to normalized f32 [0, 1)
 */
fn normalize(state: u32) -> f32 {
  return f32(state) / f32(M);
}

/**
 * Generate random number for given thread
 * Updates RNG state and returns normalized value
 */
fn generateRandom(threadId: u32) -> f32 {
  var state = rngState[threadId];
  state = lcg(state);
  rngState[threadId] = state;
  return normalize(state);
}

/**
 * Tournament selection for a single individual
 * Selects the best individual from a random tournament
 */
fn tournamentSelect(threadId: u32) -> u32 {
  var bestIndex = 0u;
  var bestFitness = -1.0;
  
  // Select tournament participants randomly
  for (var i = 0u; i < params.tournamentSize; i++) {
    let random = generateRandom(threadId);
    let candidateIndex = u32(random * f32(params.populationSize));
    
    // Ensure valid index
    let validIndex = min(candidateIndex, params.populationSize - 1u);
    let fitness = fitnessScores[validIndex];
    
    // Keep track of best individual in tournament
    if (fitness > bestFitness) {
      bestFitness = fitness;
      bestIndex = validIndex;
    }
  }
  
  return bestIndex;
}

/**
 * Copy individual from source to destination
 * Handles bounds checking and array copying
 */
fn copyIndividual(
  sourceIndex: u32,
  destIndex: u32,
  individualSize: u32
) {
  let sourceStart = sourceIndex * individualSize;
  let destStart = destIndex * individualSize;
  
  for (var i = 0u; i < individualSize; i++) {
    if (sourceStart + i < arrayLength(&population) && 
        destStart + i < arrayLength(&newPopulation)) {
      newPopulation[destStart + i] = population[sourceStart + i];
    }
  }
}

/**
 * Find elite individuals (top performers)
 * Returns array of elite indices
 */
fn findEliteIndividuals() -> array<u32, 16> { // Max 16 elite individuals
  var elite: array<u32, 16>;
  var eliteCount = 0u;
  
  // Simple selection: top fitness scores
  // In a real implementation, this would be more sophisticated
  for (var i = 0u; i < params.populationSize && eliteCount < 16u; i++) {
    if (fitnessScores[i] > 0.8) { // Threshold for elite
      elite[eliteCount] = i;
      eliteCount++;
    }
  }
  
  return elite;
}

/**
 * Main tournament selection kernel
 * Each thread selects one parent for the next generation
 */
@compute @workgroup_size(256)
fn tournamentSelection(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // Handle elite individuals first
  if (threadId < params.eliteCount) {
    // Copy elite individuals directly to new population
    // For simplicity, we'll just copy the first N individuals
    // In a real implementation, we'd find the actual best performers
    copyIndividual(threadId, threadId, params.individualSize);
    return;
  }
  
  // Tournament selection for non-elite individuals
  let selectedParent = tournamentSelect(threadId);
  
  // Store selected parent index
  if (threadId < arrayLength(&selectedParents)) {
    selectedParents[threadId] = selectedParent;
  }
  
  // Copy selected individual to new population
  copyIndividual(selectedParent, threadId, params.individualSize);
}

/**
 * Alternative selection methods
 */

/**
 * Roulette wheel selection
 * Probability proportional to fitness
 */
@compute @workgroup_size(256)
fn rouletteWheelSelection(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // Calculate total fitness
  var totalFitness = 0.0;
  for (var i = 0u; i < params.populationSize; i++) {
    totalFitness += max(fitnessScores[i], 0.001); // Avoid zero fitness
  }
  
  // Generate random number
  let random = generateRandom(threadId) * totalFitness;
  
  // Find selected individual
  var cumulativeFitness = 0.0;
  var selectedIndex = 0u;
  
  for (var i = 0u; i < params.populationSize; i++) {
    cumulativeFitness += max(fitnessScores[i], 0.001);
    if (cumulativeFitness >= random) {
      selectedIndex = i;
      break;
    }
  }
  
  // Copy selected individual
  copyIndividual(selectedIndex, threadId, params.individualSize);
}

/**
 * Rank-based selection
 * Selection probability based on rank rather than absolute fitness
 */
@compute @workgroup_size(256)
fn rankBasedSelection(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // For simplicity, we'll use a linear rank selection
  // In practice, you'd need to sort the population by fitness first
  let rank = params.populationSize - threadId; // Higher fitness = higher rank
  let selectionProbability = f32(rank) / f32(params.populationSize * (params.populationSize + 1u) / 2u);
  
  let random = generateRandom(threadId);
  
  if (random < selectionProbability) {
    // Select this individual
    copyIndividual(threadId, threadId, params.individualSize);
  } else {
    // Select a random individual
    let randomIndex = u32(generateRandom(threadId) * f32(params.populationSize));
    copyIndividual(randomIndex, threadId, params.individualSize);
  }
}

/**
 * Stochastic universal sampling (SUS)
 * More efficient than roulette wheel for multiple selections
 */
@compute @workgroup_size(256)
fn stochasticUniversalSampling(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // Calculate total fitness
  var totalFitness = 0.0;
  for (var i = 0u; i < params.populationSize; i++) {
    totalFitness += max(fitnessScores[i], 0.001);
  }
  
  // SUS parameters
  let stepSize = totalFitness / f32(params.populationSize);
  let startOffset = generateRandom(threadId) * stepSize;
  let pointer = startOffset + f32(threadId) * stepSize;
  
  // Find selected individual
  var cumulativeFitness = 0.0;
  var selectedIndex = 0u;
  
  for (var i = 0u; i < params.populationSize; i++) {
    cumulativeFitness += max(fitnessScores[i], 0.001);
    if (cumulativeFitness >= pointer) {
      selectedIndex = i;
      break;
    }
  }
  
  // Copy selected individual
  copyIndividual(selectedIndex, threadId, params.individualSize);
}
