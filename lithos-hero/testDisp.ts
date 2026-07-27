import { calculateIndividualGunData } from './src/utils/gunneryComputation.ts';
import { TableF2_Data } from './src/data/MockTables.ts';

function runTest() {
  const baseRange = 4000;
  const baseDef = 3200;
  const m17Long = { dir: "FRONT" as const, meters: 50 };
  const m17Lat = { dir: "RIGHT" as const, meters: 230 };
  const mvDiff = -1.5;
  const charge = 4;
  
  const mvFactor = TableF2_Data[charge][baseRange];
  console.log("MV Factor at 4000m Charge 4:", mvFactor);
  
  const result = calculateIndividualGunData(
    baseRange, baseDef, m17Long, m17Lat, mvDiff, mvFactor
  );
  
  console.log("Result:", result);
}

runTest();
