import { calculateSweepingSheaf } from './src/utils/gunneryComputation.ts';

function runTest() {
  const targetRange = 5000;
  const centerDeflection = 3200;
  const targetWidth = 150;
  const projType = "105_HE"; // Burst width 30
  
  // Sweep angle = 30 / (5000 / 1000) = 30 / 5 = 6 mils
  // 6 guns, offsets from center (-2.5 to +2.5):
  // -2.5 * 6 = -15 -> Gun 1: 3185
  // -1.5 * 6 = -9  -> Gun 2: 3191
  // -0.5 * 6 = -3  -> Gun 3: 3197
  // +0.5 * 6 = +3  -> Gun 4: 3203
  // +1.5 * 6 = +9  -> Gun 5: 3209
  // +2.5 * 6 = +15 -> Gun 6: 3215
  
  const result = calculateSweepingSheaf(
    targetRange, centerDeflection, targetWidth, projType, 6
  );
  
  console.log("Result:", JSON.stringify(result, null, 2));
}

runTest();
