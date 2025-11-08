// Order Crossover (OX) Shader
// Parallel OX crossover maintaining permutation invariant
// Each thread performs crossover for one offspring

struct Params {
  populationSize: u32,
  individualSize: u32,
  crossoverRate: f32,
  seed: u32,
}

@group(0) @binding(0) var<storage, read> parent1Population: array<u32>;
@group(0) @binding(1) var<storage, read> parent2Population: array<u32>;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var<storage, read_write> offspringPopulation: array<u32>;

// LCG Random
fn lcgRandom(state: ptr<function, u32>) -> f32 {
  *state = (*state * 1103515245u + 12345u) & 0x7fffffffu;
  return f32(*state) / f32(0x7fffffff);
}

@compute @workgroup_size(256)
fn orderCrossover(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.populationSize) { return; }
  
  var rngState = params.seed + idx * 7919u;
  
  // Check crossover probability
  if (lcgRandom(&rngState) > params.crossoverRate) {
    // No crossover - copy parent1 directly
    for (var i = 0u; i < params.individualSize; i++) {
      offspringPopulation[idx * params.individualSize + i] = 
        parent1Population[idx * params.individualSize + i];
    }
    return;
  }
  
  // OX Crossover
  let start = u32(lcgRandom(&rngState) * f32(params.individualSize));
  let end = u32(lcgRandom(&rngState) * f32(params.individualSize));
  
  let segmentStart = min(start, end);
  let segmentEnd = max(start, end);
  
  // Track used genes (bit array for performance)
  // Support up to 1024 items (32 u32s × 32 bits each)
  var used: array<u32, 32>;
  for (var i = 0u; i < 32u; i++) {
    used[i] = 0u;
  }
  
  // Step 1: Copy segment from parent1
  for (var i = segmentStart; i <= segmentEnd; i++) {
    let gene = parent1Population[idx * params.individualSize + i];
    offspringPopulation[idx * params.individualSize + i] = gene;
    
    // Mark as used in bit array
    let bitIdx = gene / 32u;
    let bitOffset = gene % 32u;
    used[bitIdx] |= (1u << bitOffset);
  }
  
  // Step 2: Fill remaining positions from parent2
  var currentPos = (segmentEnd + 1u) % params.individualSize;
  
  for (var i = 0u; i < params.individualSize; i++) {
    let parent2Idx = (segmentEnd + 1u + i) % params.individualSize;
    let gene = parent2Population[idx * params.individualSize + parent2Idx];
    
    // Check if already used
    let bitIdx = gene / 32u;
    let bitOffset = gene % 32u;
    let isUsed = (used[bitIdx] & (1u << bitOffset)) != 0u;
    
    if (!isUsed) {
      offspringPopulation[idx * params.individualSize + currentPos] = gene;
      currentPos = (currentPos + 1u) % params.individualSize;
      
      // Mark as used
      used[bitIdx] |= (1u << bitOffset);
    }
  }
}

