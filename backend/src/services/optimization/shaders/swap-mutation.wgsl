// Swap Mutation Shader
// Parallel swap mutation operator
// Each thread mutates one individual by swapping two random positions

struct Params {
  populationSize: u32,
  individualSize: u32,
  mutationRate: f32,
  seed: u32,
}

@group(0) @binding(0) var<storage, read_write> population: array<u32>;
@group(0) @binding(1) var<uniform> params: Params;

// LCG Random
fn lcgRandom(state: ptr<function, u32>) -> f32 {
  *state = (*state * 1103515245u + 12345u) & 0x7fffffffu;
  return f32(*state) / f32(0x7fffffff);
}

@compute @workgroup_size(256)
fn swapMutate(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.populationSize) { return; }
  
  var rngState = params.seed + idx * 7919u;
  
  // Check mutation probability
  if (lcgRandom(&rngState) > params.mutationRate) {
    return;  // Skip mutation
  }
  
  // Select two random positions to swap
  let pos1 = u32(lcgRandom(&rngState) * f32(params.individualSize));
  let pos2 = u32(lcgRandom(&rngState) * f32(params.individualSize));
  
  // Perform swap if positions are different
  if (pos1 != pos2) {
    let startIdx = idx * params.individualSize;
    let temp = population[startIdx + pos1];
    population[startIdx + pos1] = population[startIdx + pos2];
    population[startIdx + pos2] = temp;
  }
}

