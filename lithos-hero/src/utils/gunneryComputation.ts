import { FiringTable } from '../data/FiringTable';
import { TableB_Data, TableE_Data, TableF2_Data } from '../data/MockTables';
import type { Point } from './artilleryMath';

/**
 * 1. lookupTableB(charge, range, heightDiff)
 * หาระยะเพิ่มเติม (Complementary Range)
 */
export function lookupTableB(charge: number, range: number, heightDiff: number): number {
  // ปัดเศษระยะยิง และ ตส. ให้ใกล้เคียง 100 เมตรที่สุด
  const roundedRange = Math.round(range / 100) * 100;
  const roundedHeight = Math.round(heightDiff / 100) * 100;

  const chargeData = TableB_Data[charge];
  if (!chargeData) return 0; // Fallback

  const rangeData = chargeData[roundedRange];
  if (!rangeData) return 0; // Fallback

  const compRange = rangeData[roundedHeight];
  return compRange || 0;
}

/**
 * 2. interpolateTableF1(charge, range)
 * แปลงระยะยิงให้เป็นมุมสูง (Elevation) ด้วย Linear Interpolation
 */
export function interpolateTableF1(charge: number, range: number): number {
  const table = FiringTable[charge];
  if (!table) return 0;

  const baseRange = Math.floor(range / 100) * 100;
  const nextRange = baseRange + 100;
  const deltaRange = range - baseRange;

  const baseRow = table[baseRange];
  const nextRow = table[nextRange];

  if (!baseRow) return 0;

  const baseElevation = baseRow.f2; // มุมสูงตั้งต้น
  
  // Calculate cFactor (ตัวแก้มุมสูงเมื่อระยะเปลี่ยนไป 100 ม.)
  let cFactor = 0;
  if (nextRow) {
    cFactor = nextRow.f2 - baseRow.f2;
  }

  // เทียบบัญญัติไตรยางศ์หาค่าแก้ของเศษระยะ
  const elevCorrection = (cFactor / 100) * deltaRange;

  // คำนวณมุมสูงสุทธิ
  const exactElevation = baseElevation + elevCorrection;

  // คืนค่ามุมสูง (ทศนิยม 1 ตำแหน่งตามมาตรฐานทหารปืนใหญ่)
  return parseFloat(exactElevation.toFixed(1));
}

/**
 * 3. calcMetCorrections(temp, charge, baseRange)
 * หาระยะตกคลาดเคลื่อน อันเกิดจากอุณหภูมิดินส่งกระสุน
 */
export function calcMetCorrections(tempFahrenheit: number, charge: number, baseRange: number): { mvDiff: number, rangeCorrection: number } {
  // 1. หาตัวแก้ความเร็วต้น (Find MV Diff)
  const chargeDataE = TableE_Data[charge];
  const mvDiff = chargeDataE ? (chargeDataE[tempFahrenheit] || 0) : 0;

  // 2. หาแฟคเตอร์ระยะคลาดเคลื่อน (Range Correction Factor) จากตาราง F2
  // ปัดเศษระยะยิงฐานเป็นร้อยเมตร
  const roundedRange = Math.round(baseRange / 100) * 100;
  const chargeDataF2 = TableF2_Data[charge];
  const rangeFactorPer1ms = chargeDataF2 ? (chargeDataF2[roundedRange] || 0) : 0;

  // 3. คำนวณระยะที่คลาดเคลื่อนไป
  const rangeCorrection = mvDiff * rangeFactorPer1ms;

  return {
    mvDiff: parseFloat(mvDiff.toFixed(2)),
    rangeCorrection: parseFloat(rangeCorrection.toFixed(2))
  };
}

/**
 * 4. calculateIndividualGunData
 * คำนวณหลักฐานปืนแยกกระบอก (Displacement & Muzzle Velocity)
 */
export function calculateIndividualGunData(
  baseRange: number,
  baseDeflection: number,
  m17_longitudinal: { dir: "FRONT" | "REAR" | "CENTER", meters: number },
  m17_lateral: { dir: "LEFT" | "RIGHT" | "CENTER", meters: number },
  gunMVDiff: number,
  unitMVFactor: number
): { gunDeflection: number, finalGunRange: number, lateralMils: number, totalRangeCorrection: number } {
  // A. Lateral Correction (การแก้ทางทิศ)
  let lateralMils = 0;
  if (baseRange > 0 && m17_lateral.dir !== "CENTER") {
    // W = R x m => m = W / R
    lateralMils = m17_lateral.meters / (baseRange / 1000);
  }

  let gunDeflection = baseDeflection;
  // LARS Rule (Left Add, Right Subtract? Wait, prompt says: RIGHT -> หันซ้าย (ซ้าย-เพิ่ม) -> Add, LEFT -> หันขวา (ขวา-ลด) -> Subtract)
  if (m17_lateral.dir === "RIGHT") {
    gunDeflection += lateralMils;
  } else if (m17_lateral.dir === "LEFT") {
    gunDeflection -= lateralMils;
  }

  // B. Longitudinal & MV Correction (การแก้ทางระยะรวม)
  let dispCorrection = 0;
  if (m17_longitudinal.dir === "FRONT") {
    dispCorrection = -m17_longitudinal.meters; // Closer to target
  } else if (m17_longitudinal.dir === "REAR") {
    dispCorrection = m17_longitudinal.meters;  // Farther from target
  }

  // Range error caused by MV difference
  const mvRangeError = gunMVDiff * unitMVFactor;
  // Reverse sign for correction
  const mvCorrection = -mvRangeError;

  const totalRangeCorrection = dispCorrection + mvCorrection;

  // C. Final Range Calculation
  const finalGunRange = baseRange + totalRangeCorrection;

  return {
    gunDeflection: Math.round(gunDeflection),
    finalGunRange: parseFloat(finalGunRange.toFixed(2)),
    lateralMils: parseFloat(lateralMils.toFixed(1)),
    totalRangeCorrection: parseFloat(totalRangeCorrection.toFixed(2))
  };
}

/**
 * 5. calculateIlluminationData
 * คำนวณหลักฐานการยิงกระสุนส่องแสง (ดักลมและ HOB)
 */
export function calculateIlluminationData(
  targetRange: number,
  targetAzimuth: number,
  baseDeflection: number,
  windSpeedKnots: number,
  windAzimuth: number,
  illumFallRate: number = 10,
  standardHOB: number = 750
): { adjustedRange: number, lateralCorrectionMils: number, adjustedDeflection: number, descentTime: number } {
  // Step 1: Time of Descent
  const descentTimeSec = standardHOB / illumFallRate;

  // Step 2: Wind Drift Vectors
  const windSpeedMps = windSpeedKnots * 0.51444;
  const totalWindDriftMeters = windSpeedMps * descentTimeSec;

  // Calculate angle difference and normalize to Radians (6400 mils = 2PI)
  let angleDiffMils = windAzimuth - targetAzimuth;
  const angleDiffRadians = angleDiffMils * (Math.PI * 2 / 6400);

  // Note: Sine gives lateral (crosswind), Cosine gives longitudinal (head/tail wind)
  // Positive Sine means wind is blowing to the RIGHT (if targetAzimuth is 0 and windAzimuth is 1600 mils)
  const lateralDrift = totalWindDriftMeters * Math.sin(angleDiffRadians);
  const rangeDrift = totalWindDriftMeters * Math.cos(angleDiffRadians);

  // Step 3: Apply Military Logic
  // Range Correction: If wind blows toward target (positive rangeDrift), we must shorten the range.
  const adjustedRange = targetRange - rangeDrift;

  // Deflection Correction: W = R x m => m = W / (R/1000)
  let lateralMils = 0;
  if (adjustedRange > 0) {
    lateralMils = lateralDrift / (adjustedRange / 1000);
  }

  // LARS Rule
  // If wind blows RIGHT (lateralDrift > 0), flare moves RIGHT, we must shoot LEFT (Add to deflection)
  let adjustedDeflection = baseDeflection;
  adjustedDeflection += lateralMils; // automatically handles sign: + for right wind, - for left wind

  return {
    adjustedRange: parseFloat(adjustedRange.toFixed(2)),
    lateralCorrectionMils: parseFloat(lateralMils.toFixed(1)),
    adjustedDeflection: Math.round(adjustedDeflection),
    descentTime: parseFloat(descentTimeSec.toFixed(1))
  };
}

/**
 * 6. calculateSweepingSheaf
 * การยิงฉากป้องกันขั้นสุดท้าย (FPF) และการยิงกวาด (Sweeping Fire)
 */
export function calculateSweepingSheaf(
  targetRangeMeters: number,
  centerDeflection: number,
  targetWidthMeters: number,
  projectileType: string = "105_HE",
  numberOfGuns: number = 6
): { isFeasible: boolean, maxWidth: number, sweepAngleMils: number, guns: { gun: number, deflection: number }[] } {
  // Step 1: Constants & Data lookup
  let burstWidth = 30; // Default 105_HE
  if (projectileType === "155_HE") {
    burstWidth = 50;
  } else if (projectileType === "203_HE") {
    burstWidth = 80;
  }

  // Step 2: Check Feasibility
  const maxWidth = burstWidth * numberOfGuns;
  const isFeasible = targetWidthMeters <= maxWidth;

  // Step 3: Calculate Sweeping Angle
  const rangeInThousands = targetRangeMeters / 1000;
  let sweepAngleMils = 0;
  if (rangeInThousands > 0) {
    sweepAngleMils = Math.round(burstWidth / rangeInThousands);
  }

  // Step 4: Distribute Deflections
  // Gun 1, 2, 3 are on the left, Gun 4, 5, 6 are on the right.
  // Assuming a standard battery layout where guns are numbered 1 to 6 from right to left or left to right.
  // Artillery convention usually numbers guns 1-6 right to left (looking down range).
  // If Gun 1 is right-most: Gun 1 points furthest right (Left-Add -> Deflection +).
  // Wait, let's just make it a symmetrical spread around the center.
  // If 6 guns: offsets are -2.5, -1.5, -0.5, +0.5, +1.5, +2.5 times sweepAngleMils
  const guns = [];
  const offsetMultiplier = (numberOfGuns - 1) / 2; // for 6 guns: 2.5

  for (let i = 0; i < numberOfGuns; i++) {
    // Current multiplier: e.g., i=0 -> -2.5, i=1 -> -1.5, etc.
    const mult = i - offsetMultiplier;
    const individualOffset = Math.round(mult * sweepAngleMils);
    
    // We add the offset to the center deflection. 
    // Usually, Left subtracts, Right adds depending on how you arrange.
    // We will just spread them numerically.
    const gunDef = centerDeflection + individualOffset;
    
    guns.push({
      gun: i + 1,
      deflection: gunDef
    });
  }

  return {
    isFeasible,
    maxWidth,
    sweepAngleMils,
    guns
  };
}

/**
 * 7. Smart Charge Selection
 * แนะนำส่วนบรรจุที่เหมาะสมที่สุดสำหรับระยะยิง เพื่อถนอมลำกล้อง
 */
export function calculateOptimalCharge(rangeMeters: number): number {
  // สมมติค่าระยะยิงสูงสุดของแต่ละส่วนบรรจุ (M101 105mm)
  // Chg 1: ~2000m, Chg 2: ~3000m, Chg 3: ~4000m, Chg 4: ~5500m, Chg 5: ~7000m, Chg 6: ~8500m, Chg 7: ~11000m
  if (rangeMeters <= 2000) return 1;
  if (rangeMeters <= 3000) return 2;
  if (rangeMeters <= 4000) return 3;
  if (rangeMeters <= 5500) return 4;
  if (rangeMeters <= 7000) return 5;
  if (rangeMeters <= 8500) return 6;
  return 7; // Default to max charge
}

import TableFData from '../data/TableF.json';

/**
 * 8. Interpolate Table F Data
 * อ่านค่าและเทียบบัญญัติไตรยางศ์จาก TableF.json
 */
export function interpolateTableF(targetRangeMeters: number): any {
  const table = TableFData.firing_table_F;
  if (!table || table.length === 0) return null;

  // หาขอบเขตล่างและบน
  let lowRow = table[0];
  let highRow = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (targetRangeMeters >= table[i].col_01_range_m && targetRangeMeters <= table[i+1].col_01_range_m) {
      lowRow = table[i];
      highRow = table[i+1];
      break;
    }
  }

  // ถ้าระยะอยู่นอกตาราง
  if (targetRangeMeters <= lowRow.col_01_range_m) return lowRow;
  if (targetRangeMeters >= highRow.col_01_range_m) return highRow;

  // เทียบบัญญัติไตรยางศ์
  const ratio = (targetRangeMeters - lowRow.col_01_range_m) / (highRow.col_01_range_m - lowRow.col_01_range_m);

  const lerp = (low: number, high: number) => low + (ratio * (high - low));

  return {
    range: targetRangeMeters,
    standard_trajectory: {
      col_02_elevation_mil: lerp(lowRow.standard_trajectory.col_02_elevation_mil, highRow.standard_trajectory.col_02_elevation_mil),
      col_03_time_fuze_sec: lerp(lowRow.standard_trajectory.col_03_time_fuze_sec, highRow.standard_trajectory.col_03_time_fuze_sec),
      col_04_time_fuze_diff_sec: lerp(lowRow.standard_trajectory.col_04_time_fuze_diff_sec, highRow.standard_trajectory.col_04_time_fuze_diff_sec),
      col_05_range_change_per_mil_m: lerp(lowRow.standard_trajectory.col_05_range_change_per_mil_m, highRow.standard_trajectory.col_05_range_change_per_mil_m),
      col_06_fork_mil: lerp(lowRow.standard_trajectory.col_06_fork_mil, highRow.standard_trajectory.col_06_fork_mil),
      col_07_time_of_flight_sec: lerp(lowRow.standard_trajectory.col_07_time_of_flight_sec, highRow.standard_trajectory.col_07_time_of_flight_sec)
    },
    deflection_corrections: {
      col_08_drift_correction_mil: lerp(lowRow.deflection_corrections.col_08_drift_correction_mil, highRow.deflection_corrections.col_08_drift_correction_mil),
      col_09_crosswind_corr_per_knot_mil: lerp(lowRow.deflection_corrections.col_09_crosswind_corr_per_knot_mil, highRow.deflection_corrections.col_09_crosswind_corr_per_knot_mil)
    },
    range_corrections: {
      muzzle_velocity_1_m_s: {
        col_10_decrease_m: lerp(lowRow.range_corrections.muzzle_velocity_1_m_s.col_10_decrease_m, highRow.range_corrections.muzzle_velocity_1_m_s.col_10_decrease_m),
        col_11_increase_m: lerp(lowRow.range_corrections.muzzle_velocity_1_m_s.col_11_increase_m, highRow.range_corrections.muzzle_velocity_1_m_s.col_11_increase_m)
      },
      range_wind_1_knot: {
        col_12_head_wind_m: lerp(lowRow.range_corrections.range_wind_1_knot.col_12_head_wind_m, highRow.range_corrections.range_wind_1_knot.col_12_head_wind_m),
        col_13_tail_wind_m: lerp(lowRow.range_corrections.range_wind_1_knot.col_13_tail_wind_m, highRow.range_corrections.range_wind_1_knot.col_13_tail_wind_m)
      },
      air_temperature_1_percent: {
        col_14_decrease_m: lerp(lowRow.range_corrections.air_temperature_1_percent.col_14_decrease_m, highRow.range_corrections.air_temperature_1_percent.col_14_decrease_m),
        col_15_increase_m: lerp(lowRow.range_corrections.air_temperature_1_percent.col_15_increase_m, highRow.range_corrections.air_temperature_1_percent.col_15_increase_m)
      },
      air_density_1_percent: {
        col_16_decrease_m: lerp(lowRow.range_corrections.air_density_1_percent.col_16_decrease_m, highRow.range_corrections.air_density_1_percent.col_16_decrease_m),
        col_17_increase_m: lerp(lowRow.range_corrections.air_density_1_percent.col_17_increase_m, highRow.range_corrections.air_density_1_percent.col_17_increase_m)
      },
      projectile_weight_1_square: {
        col_18_decrease_m: lerp(lowRow.range_corrections.projectile_weight_1_square.col_18_decrease_m, highRow.range_corrections.projectile_weight_1_square.col_18_decrease_m),
        col_19_increase_m: lerp(lowRow.range_corrections.projectile_weight_1_square.col_19_increase_m, highRow.range_corrections.projectile_weight_1_square.col_19_increase_m)
      }
    }
  };
}

/**
 * 9. Advanced MET Corrections (การคำนวณแก้ข่าวอากาศขั้นสูง)
 * นำค่าสภาพอากาศมาคูณกับแฟกเตอร์จากตาราง F
 */
export function calcAdvancedMETCorrections(
  tableFData: any, // ผลลัพธ์จาก interpolateTableF
  windSpeedKnots: number,
  windDirMils: number,
  airTempPercent: number, 
  airDensityPercent: number,
  firingAzimuthMils: number
): { lateralCorrectionMils: number, rangeCorrectionMeters: number } {
  if (!tableFData) return { lateralCorrectionMils: 0, rangeCorrectionMeters: 0 };
  
  // 1. Wind Splitting
  const windAngleMils = windDirMils - firingAzimuthMils;
  const windAngleRads = windAngleMils * (Math.PI / 3200);
  
  const crosswind = windSpeedKnots * Math.sin(windAngleRads);
  const rangeWind = windSpeedKnots * Math.cos(windAngleRads);
  
  // 2. Crosswind Deflection Correction
  let lateralCorrectionMils = crosswind * tableFData.deflection_corrections.col_09_crosswind_corr_per_knot_mil;
  
  // 3. Range Corrections
  let rangeCorrectionMeters = 0;
  
  // ลมทางระยะ (Head/Tail)
  if (rangeWind > 0) {
    // ลมต้าน (Head wind) -> กระสุนตกใกล้ขึ้น -> ต้องชดเชยบวก
    rangeCorrectionMeters += Math.abs(rangeWind) * tableFData.range_corrections.range_wind_1_knot.col_12_head_wind_m;
  } else {
    // ลมส่ง (Tail wind)
    rangeCorrectionMeters += Math.abs(rangeWind) * tableFData.range_corrections.range_wind_1_knot.col_13_tail_wind_m;
  }
  
  // อุณหภูมิ
  if (airTempPercent < 0) {
    rangeCorrectionMeters += Math.abs(airTempPercent) * tableFData.range_corrections.air_temperature_1_percent.col_14_decrease_m;
  } else {
    rangeCorrectionMeters += Math.abs(airTempPercent) * tableFData.range_corrections.air_temperature_1_percent.col_15_increase_m;
  }
  
  // ความแน่นอากาศ
  if (airDensityPercent < 0) {
    rangeCorrectionMeters += Math.abs(airDensityPercent) * tableFData.range_corrections.air_density_1_percent.col_16_decrease_m;
  } else {
    rangeCorrectionMeters += Math.abs(airDensityPercent) * tableFData.range_corrections.air_density_1_percent.col_17_increase_m;
  }
  
  return { 
    lateralCorrectionMils: parseFloat(lateralCorrectionMils.toFixed(1)), 
    rangeCorrectionMeters: parseFloat(rangeCorrectionMeters.toFixed(2)) 
  };
}

/**
 * 10. Advanced TGPC (Terrain Gun Position Correction) 
 * แก้เหลื่อมพิกัด X, Y, Z เฉพาะกระบอก
 */
export function calculateAdvancedTGPC(
  baseRangeMeters: number,
  baseDeflectionMils: number,
  gunOffsetEasting: number,
  gunOffsetNorthing: number,
  gunAltitudeDiff: number, // ความสูงปืนเทียบกับ ศก.ร้อย.
  gunMVDiff: number, // ความคลาดเคลื่อนความเร็วต้น (m/s)
  tableFData: any // from interpolateTableF
): { adjustedRange: number, adjustedDeflection: number, adjustedElevation: number } {
  // สมมติฐาน: ปืนอยู่ห่างจาก ศก.ร้อย. ตามแนวพิกัด (X,Y)
  // แต่การคำนวณที่แท้จริงต้องแปลงกลับเป็น Polar (หน้า/หลัง/ซ้าย/ขวา) อิงจากเส้นสมมติ OT Line
  
  // 1. MV Correction (จากคอลัมน์ 10, 11)
  let rangeCorrectionMeters = 0;
  if (tableFData && gunMVDiff !== 0) {
    if (gunMVDiff < 0) {
      rangeCorrectionMeters += Math.abs(gunMVDiff) * tableFData.range_corrections.muzzle_velocity_1_m_s.col_10_decrease_m;
    } else {
      rangeCorrectionMeters += Math.abs(gunMVDiff) * tableFData.range_corrections.muzzle_velocity_1_m_s.col_11_increase_m;
    }
  }

  // 2. Altitude Correction (มุมตั้ง)
  // ต้องปรับมุมตั้งให้ชดเชยความสูงที่ปืนกระบอกนี้ตั้งอยู่
  
  return {
    adjustedRange: baseRangeMeters + rangeCorrectionMeters,
    adjustedDeflection: baseDeflectionMils, // needs trig for actual TGPC displacement
    adjustedElevation: 0 // Mock, usually done after finding new range
  };
}

/**
 * 11. Sheaf Types (รูปแบบตำบลกระสุนตก)
 * - Parallel (หน้ากระดาน)
 * - Converged (รวมตำบล)
 * - Open (กระจายมาตรฐาน)
 */
export function calculateSheafDeflections(
  baseDeflectionMils: number,
  sheafType: "PARALLEL" | "CONVERGED" | "OPEN",
  gunOffsetsLateralMeters: number[], // ระยะห่างซ้ายขวาของแต่ละกระบอกเทียบกับ ศก.ร้อย.
  targetRangeMeters: number
): number[] {
  const rangeInThousands = targetRangeMeters / 1000;
  
  return gunOffsetsLateralMeters.map(offsetMeters => {
    // W = R x m
    const offsetMils = offsetMeters / rangeInThousands;
    
    switch (sheafType) {
      case "CONVERGED":
        // รวมตำบล: สั่งให้ทุกกระบอกหันมาที่จุดเดียว (ศก.ร้อย.)
        // ปืนขวา (offset > 0) ต้องหันซ้าย (+mils), ปืนซ้าย (offset < 0) ต้องหันขวา (-mils)
        return baseDeflectionMils + offsetMils;
        
      case "PARALLEL":
        // หน้ากระดาน: ปืนทุกกระบอกยิงมุมทิศเดียวกันหมด 
        return baseDeflectionMils;
        
      case "OPEN":
      default:
        // กระจาย: อาจจะเอา Converged เป็นฐาน แล้วเพิ่ม offset ตามรัศมีทำลาย
        // หรือให้ยิงขนานกันแต่กางออกไปอีก 
        // สมมติ Open sheaf คือถ่างออก 1.5 เท่า
        return baseDeflectionMils - (offsetMils * 0.5);
    }
  });
}

/**
 * 12. Attacking Large Targets (การโจมตีเป้าหมายขนาดใหญ่)
 * หั่นเป้าหมายขนาดใหญ่เกิน 250m
 */
export function splitLargeTarget(
  targetEasting: number,
  targetNorthing: number,
  widthMeters: number,
  attitudeMils: number
): { platoon1Target: Point, platoon2Target: Point } | null {
  if (widthMeters <= 250) return null; // ไม่ต้องแบ่ง
  
  // แบ่งเป็น 2 เป้าหมาย (ซ้ายและขวา หรือ 1 และ 2 ตามแกน Attitude)
  const halfWidth = widthMeters / 2;
  const quarterWidth = widthMeters / 4;
  
  const rads = attitudeMils * (Math.PI / 3200);
  
  const p1E = targetEasting + quarterWidth * Math.sin(rads);
  const p1N = targetNorthing + quarterWidth * Math.cos(rads);
  
  const p2E = targetEasting - quarterWidth * Math.sin(rads);
  const p2N = targetNorthing - quarterWidth * Math.cos(rads);
  
  return {
    platoon1Target: { x: p1E, y: p1N, alt: 0 },
    platoon2Target: { x: p2E, y: p2N, alt: 0 }
  };
}

/**
 * =====================================
 * MODULE 3: SPECIAL MISSIONS
 * =====================================
 */

/**
 * 13. Time on Target (TOT / ประสานเวลาตก)
 * นับถอยหลังให้กระสุนตกลงเป้าหมายเวลาเดียวกัน
 */
export function calculateTOT(
  targetImpactTime: Date,
  timeOfFlightSeconds: number
): { firingTime: Date, countdownSeconds: number } {
  // คำนวณเวลาที่ต้องยิง (Firing Time) = Impact Time - Time of Flight
  const firingTimeMs = targetImpactTime.getTime() - (timeOfFlightSeconds * 1000);
  const firingTime = new Date(firingTimeMs);
  
  const now = new Date();
  const countdownSeconds = (firingTimeMs - now.getTime()) / 1000;
  
  return {
    firingTime,
    countdownSeconds: countdownSeconds > 0 ? countdownSeconds : 0
  };
}

/**
 * 14. High Angle Fire (ยิงวิถีโค้งสูง)
 * สลับสมการเมื่อยิงมุมใหญ่ (> 800 mils)
 */
export function calculateHighAngleElevation(
  rangeMeters: number,
  maxRangeMeters: number
): number {
  // Mock Logic: ยิ่งยิงไกล มุมกระดกจะยิ่งต่ำลงเข้าใกล้ 800 มิลส์
  // ที่ระยะใกล้สุด มุมจะเข้าใกล้ 1150 มิลส์
  // สมการจำลองเชิงเส้นแบบผกผัน
  const ratio = rangeMeters / maxRangeMeters;
  if (ratio > 1) return 800;
  
  // 1150 คือมุมกระดกสูงสุด, 800 คือมุมที่ได้ระยะไกลสุด
  const elevation = 1150 - (ratio * (1150 - 800));
  return Math.round(elevation);
}

/**
 * 15. Airburst & Time Fuze (ยิงแตกอากาศ)
 * คำนวณตั้งเวลาชนวนจากคอลัมน์ F3 (Time) และ F4 (Diff)
 */
export function calculateTimeFuze(
  tableFData: any, // from interpolateTableF
  targetHOB: number = 20 // สูงกระสุนแตกอากาศที่ต้องการ (เมตร) เช่น 20m สำหรับระเบิดเหนือหัว
): number {
  if (!tableFData) return 0;
  
  const baseTime = tableFData.standard_trajectory.col_03_time_fuze_sec;
  const timeDiffPer10m = tableFData.standard_trajectory.col_04_time_fuze_diff_sec;
  
  // ตารางตั้งชนวนเพื่อแตกผิวพื้น (HOB=0) 
  // ถ้าต้องการแตกสูงขึ้น 20 เมตร ต้อง "ลดเวลาลง" เพื่อให้ระเบิดก่อนตกถึงพื้น
  const correctionMultiplier = targetHOB / 10;
  const timeCorrection = correctionMultiplier * timeDiffPer10m;
  
  const fuzeSetting = baseTime - timeCorrection;
  
  return parseFloat(fuzeSetting.toFixed(1));
}

/**
 * 16. Danger Close & Creeping Fire (อันตรายใกล้ฝ่ายเรา / ยิงคลาน)
 */
export function calculateCreepingFire(
  startRange: number,
  targetRange: number,
  stepMeters: number = 50 // ขยับทีละ 50 เมตร
): number[] {
  const steps = [];
  const direction = startRange < targetRange ? 1 : -1;
  let currentRange = startRange;
  
  // สร้าง Array ของระยะยิงที่จะใช้ยิงคลาน
  while ((direction > 0 && currentRange <= targetRange) || (direction < 0 && currentRange >= targetRange)) {
    steps.push(currentRange);
    currentRange += (stepMeters * direction);
  }
  
  // เอาค่าเป้าหมายจริงใส่เป็นนัดสุดท้ายให้เป๊ะ
  if (steps[steps.length - 1] !== targetRange) {
    steps.push(targetRange);
  }
  
  return steps;
}

/**
 * 17. Final Protective Fire (FPF - ฉากป้องกันขั้นสุดท้าย)
 * เก็บ Priority พิเศษสำหรับยิงด่วน
 */
export function getFPFPriorityPayload(
  fpfTargetPoint: Point,
  fpfDeflection: number,
  fpfElevation: number,
  fpfCharge: number
) {
  // ข้อมูลที่โหลดเก็บไว้ใน RAM เมื่อข้าศึกบุก จะสั่งยิงภายใน 5 วินาที
  return {
    missionType: "FPF",
    priority: "CRITICAL",
    target: fpfTargetPoint,
    commands: {
      charge: fpfCharge,
      deflection: fpfDeflection,
      elevation: fpfElevation,
      fuze: "QUICK"
    },
    executeInstantly: true
  };
}
