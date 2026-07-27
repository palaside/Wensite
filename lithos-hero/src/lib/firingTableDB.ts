export interface Table_F1_BasicData {
  range: number; // ระยะยิง (เมตร)
  elevation: number; // มุมสูง (มิลเลียม) - คอลัมน์ 2
  timeOfFlight: number; // เวลาของกระสุน (วินาที) - คอลัมน์ 6
  drift: number; // การเบี่ยงเบน (มิลเลียม) - คอลัมน์ 7
  elevCorrectionPer100m: number; // ตัวแก้มุมสูงต่อระยะ 100ม. - คอลัมน์ 12
}

export interface Table_F2_Corrections {
  range: number; // ระยะยิง
  muzzleVelocityDecrease: number; // ความเร็วต้นลด 1m/s
  windHeadOrTail: number; // ลมต้าน/ลมส่ง 1 knot
  temperatureIncrease: number; // อุณหภูมิเพิ่ม 1%
  airDensityIncrease: number; // ความหนาแน่นเพิ่ม 1%
  projectileWeightIncrease: number; // นน.กระสุนเพิ่ม 1sq
}

export interface Table_K_FuzeTime {
  range: number;
  fuzeSetting: number; // เวลาชนวนตั้ง (วินาที)
}

export interface FiringTable {
  weapon: string; // "105mm M101A1"
  projectile: string; // "HE M1"
  charge: number; // 1 to 7
  tableF1: Table_F1_BasicData[];
  tableF2: Table_F2_Corrections[];
  tableK?: Table_K_FuzeTime[];
}

/**
 * Linear Interpolation สำหรับการคำนวณหาค่าระหว่างตาราง
 * (การหาค่าเฉลี่ยเปรียบเทียบ)
 */
export function interpolateValue(
  targetRange: number, 
  tableData: Table_F1_BasicData[], 
  field: keyof Omit<Table_F1_BasicData, 'range'>
): number {
  if (!tableData || tableData.length === 0) return 0;
  
  // ถ้าระยะน้อยกว่าหรือเท่ากับค่าน้อยสุดในตาราง
  if (targetRange <= tableData[0].range) {
    return tableData[0][field] as number;
  }
  
  // ถ้าระยะมากกว่าหรือเท่ากับค่ามากสุดในตาราง
  if (targetRange >= tableData[tableData.length - 1].range) {
    return tableData[tableData.length - 1][field] as number;
  }

  // หาช่วง (Min, Max) ที่ครอบ TargetRange อยู่
  for (let i = 0; i < tableData.length - 1; i++) {
    const minRow = tableData[i];
    const maxRow = tableData[i + 1];

    if (targetRange >= minRow.range && targetRange <= maxRow.range) {
      const minRange = minRow.range;
      const maxRange = maxRow.range;
      
      const minVal = minRow[field] as number;
      const maxVal = maxRow[field] as number;

      // ถ้าบังเอิญตกที่ระยะพอดีเป๊ะ
      if (targetRange === minRange) return minVal;
      if (targetRange === maxRange) return maxVal;

      // คำนวณ Interpolation
      // (Target - Min) / (Max - Min) * (ValueMax - ValueMin) + ValueMin
      const ratio = (targetRange - minRange) / (maxRange - minRange);
      const interpolatedValue = (ratio * (maxVal - minVal)) + minVal;
      
      return interpolatedValue;
    }
  }

  return 0;
}

/**
 * Interpolation แบบ Generic (ใช้กับ Table_F2 หรือ Table_K ก็ได้)
 */
export function interpolateGenericValue<T extends { range: number }>(
  targetRange: number,
  tableData: T[],
  field: keyof Omit<T, 'range'>
): number {
  if (!tableData || tableData.length === 0) return 0;
  
  if (targetRange <= tableData[0].range) return tableData[0][field] as number;
  if (targetRange >= tableData[tableData.length - 1].range) return tableData[tableData.length - 1][field] as number;

  for (let i = 0; i < tableData.length - 1; i++) {
    const minRow = tableData[i];
    const maxRow = tableData[i + 1];

    if (targetRange >= minRow.range && targetRange <= maxRow.range) {
      const minVal = minRow[field] as number;
      const maxVal = maxRow[field] as number;
      
      const ratio = (targetRange - minRow.range) / (maxRow.range - minRow.range);
      return (ratio * (maxVal - minVal)) + minVal;
    }
  }
  return 0;
}
