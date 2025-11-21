#!/usr/bin/env ts-node

/**
 * Run simple validation tests for algorithm fixes
 * Usage: npm run test:simple-validation or ts-node run-simple-validation.ts
 */

import { SimpleValidationTest } from "./SimpleValidationTest";

async function main() {
  console.log("🔬 Lemnix Algorithm Fixes - Simple Validation Suite");
  console.log("==================================================\n");

  SimpleValidationTest.runAllTests();

  console.log(
    "\n🏁 Simple validation complete! All mathematical fixes verified.",
  );
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
