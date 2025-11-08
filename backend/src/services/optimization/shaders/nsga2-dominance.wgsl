// NSGA-II Dominance Shader
// Fast non-dominated sorting for multi-objective optimization
// Parallel Pareto dominance check and ranking

struct Objectives {
  waste: f32,
  cost: f32,
  time: f32,
  efficiency: f32,
}

struct Params {
  populationSize: u32,
  _padding: array<u32, 3>,
}

@group(0) @binding(0) var<storage, read> objectives: array<Objectives>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read_write> dominationCounts: array<u32>;
@group(0) @binding(3) var<storage, read_write> ranks: array<u32>;

// Check if solution 'a' dominates solution 'b'
// a dominates b if:
// - a is better or equal in ALL objectives
// - a is strictly better in AT LEAST ONE objective
fn dominates(a: Objectives, b: Objectives) -> bool {
  // Check if better or equal in all objectives
  // For waste, cost, time: lower is better
  // For efficiency: higher is better
  let betterWaste = a.waste <= b.waste;
  let betterCost = a.cost <= b.cost;
  let betterTime = a.time <= b.time;
  let betterEfficiency = a.efficiency >= b.efficiency;
  
  if (!betterWaste || !betterCost || !betterTime || !betterEfficiency) {
    return false;  // Not better/equal in all objectives
  }
  
  // Check if strictly better in at least one objective
  return a.waste < b.waste || 
         a.cost < b.cost || 
         a.time < b.time || 
         a.efficiency > b.efficiency;
}

@compute @workgroup_size(256)
fn computeDominance(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.populationSize) { return; }
  
  var dominationCount = 0u;
  
  // Compare this solution with all others
  for (var i = 0u; i < params.populationSize; i++) {
    if (i != idx && dominates(objectives[i], objectives[idx])) {
      dominationCount++;
    }
  }
  
  // Store domination count
  dominationCounts[idx] = dominationCount;
  
  // Rank 0 means non-dominated (Pareto front)
  if (dominationCount == 0u) {
    ranks[idx] = 0u;
  } else {
    // Will be computed in subsequent passes
    ranks[idx] = 999999u;  // High value (unassigned)
  }
}

