import { lookupTableB, interpolateTableF1, calcMetCorrections } from './src/utils/gunneryComputation.ts';

function runTests() {
  console.log('--- MODULE 1 TEST ---');
  // Charge 4, Range 4000, Height +100
  const compRange = lookupTableB(4, 4000, 100);
  console.log(`Complementary Range (Expected: 30): ${compRange}`);
  
  const adjRange = 4000 + compRange;
  console.log(`Adjusted Range (Expected: 4030): ${adjRange}`);
  
  const elevation = interpolateTableF1(4, adjRange);
  console.log(`Elevation (Expected ~312.9... Note: actual f2 base in FiringTable.ts might be different): ${elevation}`);
  
  console.log('--- MODULE 2 TEST ---');
  // Temp 90F, Charge 4, Range 4000
  const met = calcMetCorrections(90, 4, 4000);
  console.log(`Muzzle Velocity Diff (Expected: 1.9): ${met.mvDiff}`);
  console.log(`Range Correction (Expected: 51.11): ${met.rangeCorrection}`);
}

runTests();
