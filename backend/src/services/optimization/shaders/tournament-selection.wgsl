// Tournament Selection Shader
// Parallel tournament selection (3 individuals compete)
// Each thread selects one winner from 3 random individuals

struct Params {
  populationSize: u32,
  tournamentSize: u32,
  seed: u32,
  _padding: u32,
}

@group(0) @binding(0) var<storage, read> fitnessScores: array<f32>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read_write> selectedIndices: array<u32>;

// LCG Random (matches backend seed: 12345)
fn lcgRandom(state: ptr<function, u32>) -> f32 {
  *state = (*state * 1103515245u + 12345u) & 0x7fffffffu;
  return f32(*state) / f32(0x7fffffff);
}

@compute @workgroup_size(256)
fn tournamentSelect(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.populationSize) { return; }
  
  // Initialize RNG state with seed + thread index
  var rngState = params.seed + idx * 7919u;  // Prime multiplier for diversity
  
  // Tournament: pick 3 random individuals, select best
  var bestIdx = u32(lcgRandom(&rngState) * f32(params.populationSize));
  var bestFitness = fitnessScores[bestIdx];
  
  // Compare with remaining tournament participants
  for (var i = 1u; i < params.tournamentSize; i++) {
    let candidateIdx = u32(lcgRandom(&rngState) * f32(params.populationSize));
    let candidateFitness = fitnessScores[candidateIdx];
    
    if (candidateFitness > bestFitness) {
      bestIdx = candidateIdx;
      bestFitness = candidateFitness;
    }
  }
  
  // Store selected parent index
  selectedIndices[idx] = bestIdx;
}

