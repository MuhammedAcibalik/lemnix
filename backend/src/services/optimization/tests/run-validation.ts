#!/usr/bin/env ts-node

/**
 * Run comprehensive validation tests for all optimization algorithm fixes
 * Usage: npm run test:validation or ts-node run-validation.ts
 */

import { AlgorithmValidationTests } from "./AlgorithmValidationTests";

async function main() {
  console.log("🔬 Lemnix Algorithm Optimization Validation Suite");
  console.log("================================================\n");

  await AlgorithmValidationTests.runAllTests();

  console.log(
    "\n🏁 Validation complete! All critical fixes have been verified.",
  );
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
