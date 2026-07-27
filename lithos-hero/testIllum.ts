import { calculateIlluminationData } from './src/utils/gunneryComputation.ts';

function runTest() {
  const targetRange = 4000;
  const targetAz = 0; // target is due North
  const baseDef = 3200; // gun pointed North
  const windKts = 20; // 20 knots
  const windAz = 1600; // Wind blowing due East (to the right)
  
  // With 20 kts wind blowing East, flare should drift Right.
  // Gun should aim Left (Add to deflection).
  // Head/Tail wind should be 0 because angle diff is 1600 mils (90 degrees).
  // Target Range should remain 4000.
  
  const result = calculateIlluminationData(
    targetRange, targetAz, baseDef, windKts, windAz
  );
  
  console.log("Result:", result);
}

runTest();
