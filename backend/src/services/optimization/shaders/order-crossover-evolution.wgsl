// Order Crossover (OX) Shader for GPU Evolution
// Implements Order Crossover with recovery for genetic algorithm
// 
// Features:
// - Order-preserving crossover for permutation problems
// - Lost item recovery mechanism
// - Deterministic crossover using GPU RNG
// - Parallel execution for entire population
// - Maintains genetic diversity

struct CrossoverParams {
  populationSize: u32,
  individualSize: u32,
  crossoverRate: f32,
  eliteCount: u32,        // Number of elite individuals to preserve
  _padding: u32,
}

@group(0) @binding(0) var<storage, read> population: array<u32>;
@group(0) @binding(1) var<storage, read> selectedParents: array<u32>;
@group(0) @binding(2) var<storage, read> rngState: array<u32>;
@group(0) @binding(3) var<uniform> params: CrossoverParams;
@group(0) @binding(4) var<storage, read_write> offspring: array<u32>;
@group(0) @binding(5) var<storage, read_write> randomNumbers: array<f32>;

// LCG constants for RNG
const A: u32 = 1664525u;
const C: u32 = 1013904223u;
const M: u32 = 0x100000000u; // 2^32

/**
 * Linear Congruential Generator
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
 */
fn generateRandom(threadId: u32) -> f32 {
  var state = rngState[threadId];
  state = lcg(state);
  rngState[threadId] = state;
  return normalize(state);
}

/**
 * Check if value exists in array
 */
fn contains(array: array<u32, 256>, value: u32, size: u32) -> bool {
  for (var i = 0u; i < size; i++) {
    if (array[i] == value) {
      return true;
    }
  }
  return false;
}

/**
 * Find index of value in array
 */
fn findIndex(array: array<u32, 256>, value: u32, size: u32) -> u32 {
  for (var i = 0u; i < size; i++) {
    if (array[i] == value) {
      return i;
    }
  }
  return 0xFFFFFFFFu; // Not found
}

/**
 * Copy individual from population to destination
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
        destStart + i < arrayLength(&offspring)) {
      offspring[destStart + i] = population[sourceStart + i];
    }
  }
}

/**
 * Order Crossover (OX) implementation
 * Creates offspring by preserving order from both parents
 */
fn orderCrossover(
  parent1: array<u32, 256>,
  parent2: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var child: array<u32, 256>;
  var used: array<bool, 256>;
  
  // Initialize arrays
  for (var i = 0u; i < individualSize; i++) {
    child[i] = 0u;
    used[i] = false;
  }
  
  // Generate crossover points
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let start = u32(random1 * f32(individualSize));
  let end = u32(random2 * f32(individualSize));
  
  // Ensure start <= end
  let crossoverStart = min(start, end);
  let crossoverEnd = max(start, end);
  
  // Copy segment from parent1 to child
  for (var i = crossoverStart; i <= crossoverEnd; i++) {
    child[i] = parent1[i];
    used[parent1[i]] = true;
  }
  
  // Fill remaining positions from parent2 (preserving order)
  var childPos = 0u;
  var parent2Pos = 0u;
  
  while (childPos < individualSize && parent2Pos < individualSize) {
    // Skip positions already filled
    if (childPos >= crossoverStart && childPos <= crossoverEnd) {
      childPos++;
      continue;
    }
    
    // Find next unused element from parent2
    while (parent2Pos < individualSize && used[parent2[parent2Pos]]) {
      parent2Pos++;
    }
    
    if (parent2Pos < individualSize) {
      child[childPos] = parent2[parent2Pos];
      used[parent2[parent2Pos]] = true;
      parent2Pos++;
    }
    
    childPos++;
  }
  
  // Recovery mechanism: fill any remaining empty positions
  for (var i = 0u; i < individualSize; i++) {
    if (child[i] == 0u) {
      // Find first unused element
      for (var j = 0u; j < individualSize; j++) {
        if (!used[j]) {
          child[i] = j;
          used[j] = true;
          break;
        }
      }
    }
  }
  
  return child;
}

/**
 * Alternative crossover methods
 */

/**
 * Partially Mapped Crossover (PMX)
 * Another order-preserving crossover method
 */
fn partiallyMappedCrossover(
  parent1: array<u32, 256>,
  parent2: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var child: array<u32, 256>;
  var mapping: array<u32, 256>;
  
  // Initialize
  for (var i = 0u; i < individualSize; i++) {
    child[i] = 0u;
    mapping[i] = 0xFFFFFFFFu; // Invalid value
  }
  
  // Generate crossover points
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let start = u32(random1 * f32(individualSize));
  let end = u32(random2 * f32(individualSize));
  
  let crossoverStart = min(start, end);
  let crossoverEnd = max(start, end);
  
  // Copy segment from parent1
  for (var i = crossoverStart; i <= crossoverEnd; i++) {
    child[i] = parent1[i];
    mapping[parent1[i]] = parent2[i];
  }
  
  // Fill remaining positions using mapping
  for (var i = 0u; i < individualSize; i++) {
    if (i < crossoverStart || i > crossoverEnd) {
      var value = parent2[i];
      
      // Apply mapping until we find a value not in the segment
      while (mapping[value] != 0xFFFFFFFFu) {
        value = mapping[value];
      }
      
      child[i] = value;
    }
  }
  
  return child;
}

/**
 * Cycle Crossover (CX)
 * Preserves absolute positions from both parents
 */
fn cycleCrossover(
  parent1: array<u32, 256>,
  parent2: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var child: array<u32, 256>;
  var visited: array<bool, 256>;
  
  // Initialize
  for (var i = 0u; i < individualSize; i++) {
    child[i] = 0u;
    visited[i] = false;
  }
  
  var pos = 0u;
  var cycle = 0u;
  
  // Find cycles
  while (pos < individualSize) {
    if (!visited[pos]) {
      var currentPos = pos;
      var useParent1 = (cycle % 2u) == 0u;
      
      // Follow the cycle
      while (!visited[currentPos]) {
        visited[currentPos] = true;
        
        if (useParent1) {
          child[currentPos] = parent1[currentPos];
        } else {
          child[currentPos] = parent2[currentPos];
        }
        
        // Find next position in cycle
        var nextValue = useParent1 ? parent1[currentPos] : parent2[currentPos];
        currentPos = findIndex(parent1, nextValue, individualSize);
        
        if (currentPos == 0xFFFFFFFFu) {
          currentPos = findIndex(parent2, nextValue, individualSize);
        }
      }
      
      cycle++;
    }
    
    pos++;
  }
  
  return child;
}

/**
 * Main crossover kernel
 * Each thread creates one offspring from two parents
 */
@compute @workgroup_size(256)
fn orderCrossoverKernel(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // Skip elite individuals (they are copied directly)
  if (threadId < params.eliteCount) {
    copyIndividual(threadId, threadId, params.individualSize);
    return;
  }
  
  // Check if crossover should be performed
  let random = generateRandom(threadId);
  if (random > params.crossoverRate) {
    // No crossover, copy parent directly
    let parentIndex = selectedParents[threadId];
    copyIndividual(parentIndex, threadId, params.individualSize);
    return;
  }
  
  // Get parent indices
  let parent1Index = selectedParents[threadId];
  let parent2Index = selectedParents[(threadId + 1u) % params.populationSize];
  
  // Extract parent sequences
  var parent1: array<u32, 256>;
  var parent2: array<u32, 256>;
  
  let parent1Start = parent1Index * params.individualSize;
  let parent2Start = parent2Index * params.individualSize;
  
  for (var i = 0u; i < params.individualSize && i < 256u; i++) {
    parent1[i] = population[parent1Start + i];
    parent2[i] = population[parent2Start + i];
  }
  
  // Perform crossover
  let child = orderCrossover(parent1, parent2, params.individualSize, threadId);
  
  // Store offspring
  let offspringStart = threadId * params.individualSize;
  for (var i = 0u; i < params.individualSize; i++) {
    if (offspringStart + i < arrayLength(&offspring)) {
      offspring[offspringStart + i] = child[i];
    }
  }
}

/**
 * Alternative crossover kernel using PMX
 */
@compute @workgroup_size(256)
fn pmxCrossoverKernel(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  if (threadId < params.eliteCount) {
    copyIndividual(threadId, threadId, params.individualSize);
    return;
  }
  
  let random = generateRandom(threadId);
  if (random > params.crossoverRate) {
    let parentIndex = selectedParents[threadId];
    copyIndividual(parentIndex, threadId, params.individualSize);
    return;
  }
  
  let parent1Index = selectedParents[threadId];
  let parent2Index = selectedParents[(threadId + 1u) % params.populationSize];
  
  var parent1: array<u32, 256>;
  var parent2: array<u32, 256>;
  
  let parent1Start = parent1Index * params.individualSize;
  let parent2Start = parent2Index * params.individualSize;
  
  for (var i = 0u; i < params.individualSize && i < 256u; i++) {
    parent1[i] = population[parent1Start + i];
    parent2[i] = population[parent2Start + i];
  }
  
  let child = partiallyMappedCrossover(parent1, parent2, params.individualSize, threadId);
  
  let offspringStart = threadId * params.individualSize;
  for (var i = 0u; i < params.individualSize; i++) {
    if (offspringStart + i < arrayLength(&offspring)) {
      offspring[offspringStart + i] = child[i];
    }
  }
}
