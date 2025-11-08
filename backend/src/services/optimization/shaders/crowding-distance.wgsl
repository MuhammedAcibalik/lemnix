// Crowding Distance Shader for NSGA-II
// Calculates diversity metric for solutions in same Pareto front
// Maintains diversity in population

struct Params {
  frontSize: u32,
  _padding: array<u32, 3>,
}

struct ObjectiveRanges {
  wasteMin: f32,
  wasteMax: f32,
  costMin: f32,
  costMax: f32,
  timeMin: f32,
  timeMax: f32,
  efficiencyMin: f32,
  efficiencyMax: f32,
}

@group(0) @binding(0) var<storage, read> sortedIndices: array<u32>;  // Sorted by objective
@group(0) @binding(1) var<storage, read> wasteValues: array<f32>;
@group(0) @binding(2) var<storage, read> costValues: array<f32>;
@group(0) @binding(3) var<storage, read> timeValues: array<f32>;
@group(0) @binding(4) var<storage, read> efficiencyValues: array<f32>;
@group(0) @binding(5) var<uniform> params: Params;
@group(0) @binding(6) var<uniform> ranges: ObjectiveRanges;
@group(0) @binding(7) var<storage, read_write> crowdingDistances: array<f32>;

@compute @workgroup_size(256)
fn computeCrowdingDistance(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  if (idx >= params.frontSize) { return; }
  
  // Boundary solutions get infinity distance (highest priority)
  if (idx == 0u || idx == params.frontSize - 1u) {
    crowdingDistances[idx] = 1e10;  // Infinity proxy
    return;
  }
  
  var distance = 0.0;
  
  // Calculate crowding distance as sum of distances in each objective
  
  // Waste objective
  let wasteRange = ranges.wasteMax - ranges.wasteMin;
  if (wasteRange > 1e-6) {
    let prevWaste = wasteValues[sortedIndices[idx - 1u]];
    let nextWaste = wasteValues[sortedIndices[idx + 1u]];
    distance += (nextWaste - prevWaste) / wasteRange;
  }
  
  // Cost objective
  let costRange = ranges.costMax - ranges.costMin;
  if (costRange > 1e-6) {
    let prevCost = costValues[sortedIndices[idx - 1u]];
    let nextCost = costValues[sortedIndices[idx + 1u]];
    distance += (nextCost - prevCost) / costRange;
  }
  
  // Time objective
  let timeRange = ranges.timeMax - ranges.timeMin;
  if (timeRange > 1e-6) {
    let prevTime = timeValues[sortedIndices[idx - 1u]];
    let nextTime = timeValues[sortedIndices[idx + 1u]];
    distance += (nextTime - prevTime) / timeRange;
  }
  
  // Efficiency objective
  let efficiencyRange = ranges.efficiencyMax - ranges.efficiencyMin;
  if (efficiencyRange > 1e-6) {
    let prevEfficiency = efficiencyValues[sortedIndices[idx - 1u]];
    let nextEfficiency = efficiencyValues[sortedIndices[idx + 1u]];
    distance += (nextEfficiency - prevEfficiency) / efficiencyRange;
  }
  
  crowdingDistances[idx] = distance;
}

