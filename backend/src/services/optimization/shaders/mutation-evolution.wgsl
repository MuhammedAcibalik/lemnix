// Mutation Shader for GPU Evolution
// Implements swap and inversion mutations for genetic algorithm
// 
// Features:
// - Swap mutation (always applied)
// - Inversion mutation (applied during stagnation)
// - Adaptive mutation rates based on population diversity
// - Deterministic mutation using GPU RNG
// - Parallel execution for entire population

struct MutationParams {
  populationSize: u32,
  individualSize: u32,
  mutationRate: f32,
  inversionRate: f32,        // Rate for inversion mutation
  eliteCount: u32,           // Number of elite individuals to preserve
  stagnationThreshold: f32,  // Fitness improvement threshold for stagnation detection
  _padding: u32,
}

@group(0) @binding(0) var<storage, read> fitnessScores: array<f32>;
@group(0) @binding(1) var<storage, read_write> population: array<u32>;
@group(0) @binding(2) var<storage, read> rngState: array<u32>;
@group(0) @binding(3) var<uniform> params: MutationParams;
@group(0) @binding(4) var<storage, read_write> randomNumbers: array<f32>;

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
 * Swap two elements in array
 */
fn swapElements(
  array: array<u32, 256>,
  index1: u32,
  index2: u32,
  size: u32
) -> array<u32, 256> {
  var result = array;
  
  if (index1 < size && index2 < size) {
    let temp = result[index1];
    result[index1] = result[index2];
    result[index2] = temp;
  }
  
  return result;
}

/**
 * Reverse elements in array between start and end indices
 */
fn reverseArray(
  array: array<u32, 256>,
  start: u32,
  end: u32,
  size: u32
) -> array<u32, 256> {
  var result = array;
  var i = start;
  var j = end;
  
  while (i < j && i < size && j < size) {
    let temp = result[i];
    result[i] = result[j];
    result[j] = temp;
    i++;
    j--;
  }
  
  return result;
}

/**
 * Swap mutation
 * Randomly swaps two elements in the sequence
 */
fn swapMutation(
  individual: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var result = individual;
  
  // Generate two random positions
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let pos1 = u32(random1 * f32(individualSize));
  let pos2 = u32(random2 * f32(individualSize));
  
  // Ensure different positions
  if (pos1 != pos2) {
    result = swapElements(result, pos1, pos2, individualSize);
  }
  
  return result;
}

/**
 * Inversion mutation
 * Reverses a random subsequence
 */
fn inversionMutation(
  individual: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var result = individual;
  
  // Generate two random positions for inversion
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let start = u32(random1 * f32(individualSize));
  let end = u32(random2 * f32(individualSize));
  
  // Ensure start <= end
  let inversionStart = min(start, end);
  let inversionEnd = max(start, end);
  
  // Only invert if there are at least 2 elements
  if (inversionEnd > inversionStart) {
    result = reverseArray(result, inversionStart, inversionEnd, individualSize);
  }
  
  return result;
}

/**
 * Scramble mutation
 * Randomly reorders a subsequence
 */
fn scrambleMutation(
  individual: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var result = individual;
  
  // Generate two random positions for scrambling
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let start = u32(random1 * f32(individualSize));
  let end = u32(random2 * f32(individualSize));
  
  let scrambleStart = min(start, end);
  let scrambleEnd = max(start, end);
  
  // Scramble the subsequence using Fisher-Yates shuffle
  if (scrambleEnd > scrambleStart) {
    for (var i = scrambleStart; i < scrambleEnd; i++) {
      let random = generateRandom(threadId);
      let j = scrambleStart + u32(random * f32(scrambleEnd - scrambleStart));
      
      if (i != j) {
        result = swapElements(result, i, j, individualSize);
      }
    }
  }
  
  return result;
}

/**
 * Insertion mutation
 * Moves an element to a different position
 */
fn insertionMutation(
  individual: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var result = individual;
  
  // Generate source and destination positions
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  
  let sourcePos = u32(random1 * f32(individualSize));
  let destPos = u32(random2 * f32(individualSize));
  
  if (sourcePos != destPos && sourcePos < individualSize && destPos < individualSize) {
    let element = result[sourcePos];
    
    // Shift elements to make room
    if (sourcePos < destPos) {
      for (var i = sourcePos; i < destPos; i++) {
        result[i] = result[i + 1u];
      }
    } else {
      for (var i = sourcePos; i > destPos; i--) {
        result[i] = result[i - 1u];
      }
    }
    
    // Insert element at destination
    result[destPos] = element;
  }
  
  return result;
}

/**
 * Displacement mutation
 * Moves a subsequence to a different position
 */
fn displacementMutation(
  individual: array<u32, 256>,
  individualSize: u32,
  threadId: u32
) -> array<u32, 256> {
  var result = individual;
  
  // Generate subsequence boundaries and destination
  let random1 = generateRandom(threadId);
  let random2 = generateRandom(threadId);
  let random3 = generateRandom(threadId);
  
  let start = u32(random1 * f32(individualSize));
  let end = u32(random2 * f32(individualSize));
  let dest = u32(random3 * f32(individualSize));
  
  let subStart = min(start, end);
  let subEnd = max(start, end);
  
  if (subEnd > subStart && dest < individualSize) {
    // Extract subsequence
    var subsequence: array<u32, 256>;
    var subSize = 0u;
    
    for (var i = subStart; i <= subEnd; i++) {
      subsequence[subSize] = result[i];
      subSize++;
    }
    
    // Shift elements to fill gap
    for (var i = subStart; i < individualSize - subSize; i++) {
      result[i] = result[i + subSize];
    }
    
    // Insert subsequence at destination
    for (var i = 0u; i < subSize; i++) {
      if (dest + i < individualSize) {
        result[dest + i] = subsequence[i];
      }
    }
  }
  
  return result;
}

/**
 * Adaptive mutation rate based on population diversity
 */
fn calculateAdaptiveMutationRate(
  threadId: u32,
  baseRate: f32,
  populationSize: u32
) -> f32 {
  // Simple diversity measure: variance of fitness scores
  // In practice, this would be calculated on CPU and passed as uniform
  // For now, use base rate with some randomness
  let random = generateRandom(threadId);
  return baseRate * (0.5 + random); // Vary between 50% and 150% of base rate
}

/**
 * Main mutation kernel
 * Each thread mutates one individual
 */
@compute @workgroup_size(256)
fn mutate(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  // Skip elite individuals (they are not mutated)
  if (threadId < params.eliteCount) {
    return;
  }
  
  // Extract individual sequence
  let startIdx = threadId * params.individualSize;
  var individual: array<u32, 256>;
  
  for (var i = 0u; i < params.individualSize && i < 256u; i++) {
    individual[i] = population[startIdx + i];
  }
  
  // Calculate adaptive mutation rate
  let adaptiveRate = calculateAdaptiveMutationRate(threadId, params.mutationRate, params.populationSize);
  
  // Apply swap mutation
  let random1 = generateRandom(threadId);
  if (random1 < adaptiveRate) {
    individual = swapMutation(individual, params.individualSize, threadId);
  }
  
  // Apply inversion mutation (higher rate during stagnation)
  let random2 = generateRandom(threadId);
  let inversionRate = params.inversionRate * adaptiveRate;
  if (random2 < inversionRate) {
    individual = inversionMutation(individual, params.individualSize, threadId);
  }
  
  // Apply additional mutations with lower probability
  let random3 = generateRandom(threadId);
  if (random3 < adaptiveRate * 0.1) { // 10% of mutation rate
    individual = scrambleMutation(individual, params.individualSize, threadId);
  }
  
  let random4 = generateRandom(threadId);
  if (random4 < adaptiveRate * 0.05) { // 5% of mutation rate
    individual = insertionMutation(individual, params.individualSize, threadId);
  }
  
  // Store mutated individual back
  for (var i = 0u; i < params.individualSize; i++) {
    if (startIdx + i < arrayLength(&population)) {
      population[startIdx + i] = individual[i];
    }
  }
}

/**
 * Alternative mutation kernel with different strategies
 */
@compute @workgroup_size(256)
fn mutateAdvanced(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let threadId = global_id.x;
  
  if (threadId >= params.populationSize) { return; }
  
  if (threadId < params.eliteCount) {
    return;
  }
  
  let startIdx = threadId * params.individualSize;
  var individual: array<u32, 256>;
  
  for (var i = 0u; i < params.individualSize && i < 256u; i++) {
    individual[i] = population[startIdx + i];
  }
  
  // Choose mutation strategy based on thread ID
  let strategy = threadId % 4u;
  
  switch (strategy) {
    case 0u: {
      // Swap mutation
      let random = generateRandom(threadId);
      if (random < params.mutationRate) {
        individual = swapMutation(individual, params.individualSize, threadId);
      }
    }
    case 1u: {
      // Inversion mutation
      let random = generateRandom(threadId);
      if (random < params.inversionRate) {
        individual = inversionMutation(individual, params.individualSize, threadId);
      }
    }
    case 2u: {
      // Scramble mutation
      let random = generateRandom(threadId);
      if (random < params.mutationRate * 0.5) {
        individual = scrambleMutation(individual, params.individualSize, threadId);
      }
    }
    case 3u: {
      // Displacement mutation
      let random = generateRandom(threadId);
      if (random < params.mutationRate * 0.3) {
        individual = displacementMutation(individual, params.individualSize, threadId);
      }
    }
    default: {
      // Default: swap mutation
      let random = generateRandom(threadId);
      if (random < params.mutationRate) {
        individual = swapMutation(individual, params.individualSize, threadId);
      }
    }
  }
  
  // Store mutated individual
  for (var i = 0u; i < params.individualSize; i++) {
    if (startIdx + i < arrayLength(&population)) {
      population[startIdx + i] = individual[i];
    }
  }
}
