// Linear Congruential Generator (LCG) for GPU
// Deterministic random number generation with seed support
// 
// Formula: X(n+1) = (a * X(n) + c) mod m
// Where: a = 1664525, c = 1013904223, m = 2^32
// 
// This provides good statistical properties for genetic algorithms
// and ensures deterministic behavior with same seed

struct RNGParams {
  seed: u32,
  count: u32,
  _padding1: u32,
  _padding2: u32,
}

@group(0) @binding(0) var<uniform> rngParams: RNGParams;
@group(0) @binding(1) var<storage, read_write> rngState: array<u32>;
@group(0) @binding(2) var<storage, read_write> randomNumbers: array<f32>;

// LCG constants
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
 * Generate random numbers for each thread
 * Each thread handles one RNG state
 */
@compute @workgroup_size(256)
fn generateRandom(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  
  if (idx >= rngParams.count) { return; }
  
  // Get current state
  var state = rngState[idx];
  
  // If state is 0, initialize with seed + index
  if (state == 0u) {
    state = rngParams.seed + idx;
  }
  
  // Generate next random number
  state = lcg(state);
  
  // Store updated state
  rngState[idx] = state;
  
  // Store normalized random number
  randomNumbers[idx] = normalize(state);
}

/**
 * Generate multiple random numbers per thread
 * Useful for operations requiring multiple random values
 */
@compute @workgroup_size(64)
fn generateMultiple(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  let count = global_id.y; // Number of random numbers to generate per thread
  
  if (idx >= rngParams.count) { return; }
  
  var state = rngState[idx];
  
  // Generate 'count' random numbers
  for (var i = 0u; i < count; i++) {
    state = lcg(state);
    randomNumbers[idx * count + i] = normalize(state);
  }
  
  // Store final state
  rngState[idx] = state;
}

/**
 * Fisher-Yates shuffle using GPU RNG
 * Shuffles array in-place using random numbers
 */
@compute @workgroup_size(256)
fn fisherYatesShuffle(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  
  if (idx >= rngParams.count) { return; }
  
  // This would be used with a population buffer
  // Implementation depends on specific use case
  // For now, just generate random numbers
  var state = rngState[idx];
  state = lcg(state);
  rngState[idx] = state;
  randomNumbers[idx] = normalize(state);
}
