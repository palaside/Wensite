export interface Point {
  x: number; // Easting
  y: number; // Northing
  alt: number; // Altitude
}

/**
 * Convert Mils to Radians (6400 Mils = 2 * PI Radians)
 */
export function milsToRads(mils: number): number {
  return mils * (Math.PI / 3200);
}

/**
 * Format a Point (X, Y) back into an 8-digit Grid string (e.g. 12345678)
 * Assuming X and Y are in meters.
 * For an 8-digit grid, X and Y are divided by 10 (10-meter precision).
 */
export function formatGrid8(point: Point): string {
  const x = Math.round(point.x / 10).toString().padStart(4, '0').slice(-4);
  const y = Math.round(point.y / 10).toString().padStart(4, '0').slice(-4);
  return `${x}${y}`;
}

/**
 * Parse an 8-digit or 10-digit grid string into X and Y in meters.
 * Example: 12345678 (8-digit) -> X = 12340, Y = 56780
 * Example: 1234567890 (10-digit) -> X = 12345, Y = 67890
 */
export function parseGrid(gridStr: string, alt: number = 0): Point {
  const clean = gridStr.replace(/\s/g, '');
  const len = clean.length;
  
  if (len === 8) {
    const x = parseInt(clean.substring(0, 4), 10) * 10;
    const y = parseInt(clean.substring(4, 8), 10) * 10;
    return { x, y, alt };
  } else if (len === 10) {
    const x = parseInt(clean.substring(0, 5), 10);
    const y = parseInt(clean.substring(5, 10), 10);
    return { x, y, alt };
  }
  
  // Fallback if parsing fails (return 0,0)
  return { x: 0, y: 0, alt };
}

/**
 * Polar Plot Method
 * Calculates a Target Grid from an Observer's Grid, Direction, Distance, and Vertical Interval.
 * 
 * @param observer The observer's location (Point)
 * @param dirMils The direction from observer to target (in Mils)
 * @param distance The horizontal distance to target (in meters)
 * @param vi The vertical interval (height difference in meters)
 * @returns The computed Target Point
 */
export function calculatePolar(
  observer: Point,
  dirMils: number,
  distance: number,
  vi: number
): Point {
  const rads = milsToRads(dirMils);
  
  // In military grid, Y is North (0 mils), X is East (1600 mils)
  // Sin(dir) * dist = X change
  // Cos(dir) * dist = Y change
  const dx = distance * Math.sin(rads);
  const dy = distance * Math.cos(rads);
  
  return {
    x: observer.x + dx,
    y: observer.y + dy,
    alt: observer.alt + vi
  };
}

/**
 * Shift from a Known Point Method
 * Calculates a new Target Grid by shifting from an existing Known Point.
 * 
 * @param knownPoint The Known Point's location (Point)
 * @param otLineMils Observer-Target Line (Direction from Observer to the original Known Point in Mils)
 * @param lateralShift Left/Right shift in meters (Right is positive, Left is negative)
 * @param rangeShift Add/Drop shift in meters (Add is positive, Drop is negative)
 * @param verticalShift Up/Down shift in meters
 * @returns The computed Target Point
 */
export function calculateShift(
  knownPoint: Point,
  otLineMils: number,
  lateralShift: number,
  rangeShift: number,
  verticalShift: number
): Point {
  // Movement along the OT Line
  const rangeRads = milsToRads(otLineMils);
  const rangeDx = rangeShift * Math.sin(rangeRads);
  const rangeDy = rangeShift * Math.cos(rangeRads);
  
  // Movement perpendicular to the OT Line (Right is +1600 mils)
  const lateralRads = milsToRads(otLineMils + 1600);
  const lateralDx = lateralShift * Math.sin(lateralRads);
  const lateralDy = lateralShift * Math.cos(lateralRads);
  
  return {
    x: knownPoint.x + rangeDx + lateralDx,
    y: knownPoint.y + rangeDy + lateralDy,
    alt: knownPoint.alt + verticalShift
  };
}

/**
 * คำนวณความกดอากาศและอุณหภูมิเป็นค่า PPM (Parts Per Million)
 * อ้างอิงสมการจาก รส. 6-40
 */
export function calculatePPM(pressure: number, temp: number): number {
  // X = 278.46 - (0.3872 * P) / (1 + 0.003661 * C)
  const denominator = 1 + (0.003661 * temp);
  const numerator = 0.3872 * pressure;
  const x = 278.46 - (numerator / denominator);
  
  // ปัดเศษตามเงื่อนไขของปืนใหญ่
  return Math.round(x);
}

/**
 * คำนวณระยะราบจากระยะลาด (Slope to Horizontal Distance)
 */
export function calculateHorizontalDistance(slopeDistance: number, elevationAngleMils: number): number {
  const rads = milsToRads(elevationAngleMils);
  return slopeDistance * Math.cos(rads);
}

/**
 * วิธีสกัดตรง (Intersection)
 * หาระยะทางพิกัดเป้าหมาย จากจุดสังเกต 2 จุดที่รู้พิกัดและมุมภาค
 */
export function calculateIntersection(
  pointA: Point, azA_mils: number,
  pointB: Point, azB_mils: number
): Point | null {
  const x1 = pointA.x, y1 = pointA.y;
  const x2 = pointB.x, y2 = pointB.y;
  
  const azA_rads = milsToRads(azA_mils);
  const azB_rads = milsToRads(azB_mils);
  
  // คำนวณความชัน (Slope = dx/dy ในระบบทหารที่แกน Y เป็นเหนือ)
  const tanA = Math.tan(azA_rads);
  const tanB = Math.tan(azB_rads);
  
  if (Math.abs(tanA - tanB) < 0.001) {
    // เส้นขนานกัน หรือมุมเดียวกัน
    return null;
  }
  
  // สมการเส้นตรง: X = tan(az) * (Y - Y1) + X1
  // X = tanA * Y - tanA * Y1 + X1
  // X = tanB * Y - tanB * Y2 + X2
  // tanA * Y - tanA * Y1 + X1 = tanB * Y - tanB * Y2 + X2
  // (tanA - tanB) * Y = tanA * Y1 - tanB * Y2 - X1 + X2
  
  const y = (tanA * y1 - tanB * y2 - x1 + x2) / (tanA - tanB);
  const x = tanA * (y - y1) + x1;
  
  return { x, y, alt: 0 };
}

/**
 * อัตราส่วนความคลาดเคลื่อน (Relative Accuracy)
 */
export function calculateRelativeAccuracy(errorEasting: number, errorNorthing: number, totalDistance: number): string {
  const errorDistance = Math.sqrt(errorEasting * errorEasting + errorNorthing * errorNorthing);
  if (errorDistance === 0) return "1/Infinity";
  const ratio = totalDistance / errorDistance;
  return `1/${Math.round(ratio)}`;
}

/**
 * เลื่อนตาราง (Slide Grid)
 * @param assumedGrid พิกัดสมมติของจุดศูนย์กลาง
 * @param actualGrid พิกัดจริงของจุดศูนย์กลาง
 * @param points รายการจุดที่ต้องการเลื่อน
 * @returns รายการจุดที่เลื่อนแล้ว
 */
export function slideGrid(assumedGrid: Point, actualGrid: Point, points: Point[]): Point[] {
  const dx = actualGrid.x - assumedGrid.x;
  const dy = actualGrid.y - assumedGrid.y;
  const dalt = actualGrid.alt - assumedGrid.alt;
  
  return points.map(p => ({
    x: p.x + dx,
    y: p.y + dy,
    alt: p.alt + dalt
  }));
}

/**
 * สกัดกลับ 2 จุด (Two-Point Resection)
 * เมื่อผู้ตรวจการณ์ทราบพิกัดของจุด A และ B และวัดมุมภาคทิศทางจากตัวเองไปยัง A และ B
 */
export function calculateResection(
  pointA: Point, azToA_mils: number,
  pointB: Point, azToB_mils: number
): Point | null {
  // คำนวณมุมภาคกลับ (Back Azimuth) 
  // ถ้าน้อยกว่า 3200 ให้บวก 3200 ถ้ามากกว่าให้ลบ 3200
  const backAzA = (azToA_mils + 3200) % 6400;
  const backAzB = (azToB_mils + 3200) % 6400;
  
  // สกัดกลับ 2 จุด ก็คือการหาจุดตัด (Intersection) จากมุมภาคกลับนั่นเอง
  return calculateIntersection(pointA, backAzA, pointB, backAzB);
}

/**
 * หมุนตาราง (Swinging the Grid)
 * @param pivot จุดศูนย์กลางการหมุน
 * @param points รายการจุดที่ต้องการหมุน
 * @param deltaMils มุมที่ต้องการหมุน (มิลเลียม) ค่าบวกหมุนตามเข็มนาฬิกา
 */
export function swingGrid(pivot: Point, points: Point[], deltaMils: number): Point[] {
  const rad = milsToRads(deltaMils);
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  
  return points.map(p => {
    const dx = p.x - pivot.x;
    const dy = p.y - pivot.y;
    
    // Rotation for North-up, East-right, Clockwise positive angle
    // X' = x*cos + y*sin
    // Y' = -x*sin + y*cos
    const newX = pivot.x + (dx * cosT) + (dy * sinT);
    const newY = pivot.y - (dx * sinT) + (dy * cosT);
    
    return {
      x: newX,
      y: newY,
      alt: p.alt
    };
  });
}

/**
 * Convert Radians to Mils
 */
export function radsToMils(rads: number): number {
  return rads * (3200 / Math.PI);
}

/**
 * 2. Range Calculation (ระยะยิง)
 * หาระยะยิงด้วยทฤษฎีบทพีทาโกรัส
 */
export function calculateRange(pointA: Point, pointB: Point): number {
  const dE = pointB.x - pointA.x;
  const dN = pointB.y - pointA.y;
  return Math.sqrt(dE * dE + dN * dN);
}

/**
 * 3. Target Azimuth (มุมภาคทิศเหนือ)
 * หามุมภาคทิศเหนือจากจุด A ไป B
 */
export function calculateTargetAzimuth(pointA: Point, pointB: Point): number {
  const dE = pointB.x - pointA.x;
  const dN = pointB.y - pointA.y;
  let rads = Math.atan2(dE, dN);
  if (rads < 0) rads += 2 * Math.PI;
  return radsToMils(rads);
}

/**
 * 4. Deflection (มุมทิศสั่งปืน)
 * คำนวณมุมหันปืนอิงจากทิศจำลอง
 */
export function calculateDeflection(targetAzimuthMils: number, simDirMils: number): number {
  let deflection = 3200 + (targetAzimuthMils - simDirMils);
  // Normalize
  while (deflection >= 6400) deflection -= 6400;
  while (deflection < 0) deflection += 6400;
  return deflection;
}

/**
 * 5. Mock Elevation (มุมกระดกจำลอง)
 */
export function calculateMockElevation(range: number): number {
  return (range * 0.05) + 150;
}

/**
 * 6. Gun Dispersion (กระจายหมู่ปืน)
 * สำหรับปืน 6 กระบอก ยิงแบบ Open Sheaf
 */
export function calculateGunDispersion(range: number, deflection: number, gunIndex: number): { range: number, deflection: number } {
  // สุ่มแบบคงที่ตาม index (เพื่อการสาธิต หรือให้ใช้ seed)
  // ปกติจะกระจายตามรัศมีทำลายล้างของกระสุน (เช่น 20-30 เมตร)
  const rangeOffsets = [0, 15, -10, 20, -20, 5]; // m
  const defOffsets = [0, -3, 3, -5, 5, 2]; // mils

  const rOff = rangeOffsets[gunIndex % rangeOffsets.length];
  const dOff = defOffsets[gunIndex % defOffsets.length];

  return {
    range: range + rOff,
    deflection: deflection + dOff
  };
}

/**
 * 3D Combat: Angle of Site (มุมตั้ง)
 * คำนวณมุมตั้งจากความต่างของความสูงเป้าหมายกับฐานปืน
 */
export function calculateAngleOfSite(gunAlt: number, targetAlt: number, range: number): number {
  if (range === 0) return 0;
  const altDiff = targetAlt - gunAlt;
  const angleRads = Math.atan2(altDiff, range);
  return radsToMils(angleRads);
}

/**
 * MET Message: Wind Vector Splitting (สมการแตกเวกเตอร์ลม)
 * แตกกระแสลมออกเป็น ลมขวาง (Crosswind) และ ลมทางระยะ (Range Wind)
 */
export function splitWindVector(windDirMils: number, windSpeedKnots: number, firingAzimuthMils: number): { crosswind: number, rangeWind: number } {
  const windAngleMils = windDirMils - firingAzimuthMils;
  const windAngleRads = milsToRads(windAngleMils);
  
  // ลมขวาง (พัดจากซ้ายไปขวา หรือขวาไปซ้าย)
  const crosswind = windSpeedKnots * Math.sin(windAngleRads);
  // ลมทางระยะ (ลมทวน หรือ ลมตาม)
  const rangeWind = windSpeedKnots * Math.cos(windAngleRads);
  
  return { crosswind, rangeWind };
}

/**
 * Coriolis Effect: ผลจากการหมุนของโลก (Approximate Mock Formula for demonstration)
 * ขึ้นอยู่กับ Latitude, Range และ Azimuth
 */
export function calculateCoriolisDrift(latitudeDeg: number, range: number, azimuthMils: number): number {
  // สมมติสูตรประมาณการ: Coriolis drift แปรผันตาม Sin(Latitude) และระยะเวลาลอยตัว (แปรผันตามระยะ)
  const latRads = latitudeDeg * (Math.PI / 180);
  const azRads = milsToRads(azimuthMils);
  
  // Factor สมมติ: 0.0001
  const driftMeters = 0.0001 * range * Math.sin(latRads) * Math.cos(azRads);
  return driftMeters;
}
/**
 * หาพิกัดตาราง (Grid Coordinates Computation)
 * ดอ. = Sin(Az) * D, ดน. = Cos(Az) * D
 * @param distance ระยะราบ (เมตร)
 * @param azimuthMils มุมภาคทิศทาง (มิลเลียม)
 */
export function calculateGridDelta(distance: number, azimuthMils: number): { dE: number, dN: number } {
  const rad = milsToRads(azimuthMils);
  return {
    dE: distance * Math.sin(rad),
    dN: distance * Math.cos(rad)
  };
}

/**
 * ความแตกต่างทางสูง (Elevation Difference)
 * ตส. = Tan(V) * D
 * @param horizontalDistance ระยะราบ (เมตร)
 * @param verticalAngleMils มุมดิ่ง (มิลเลียม)
 */
export function calculateElevationDiff(horizontalDistance: number, verticalAngleMils: number): number {
  const rad = milsToRads(verticalAngleMils);
  return horizontalDistance * Math.tan(rad);
}

/**
 * =====================================
 * MODULE 4: TARGET ACQUISITION & REGISTRATION
 * =====================================
 */

/**
 * 18. LARS Rule (Left Add, Right Subtract) สำหรับมุมทิศ
 * @param currentDeflection มุมทิศปัจจุบัน
 * @param direction "LEFT" | "RIGHT"
 * @param milsAmount จำนวนมิลส์ที่ต้องการแก้
 */
export function applyLARS(currentDeflection: number, direction: "LEFT" | "RIGHT", milsAmount: number): number {
  // สำหรับปืนใหญ่ (US Standard) เมื่อหมุนปืนไปทางซ้าย มุมทิศสั่งปืนจะเพิ่มขึ้น
  // เมื่อหมุนปืนไปทางขวา มุมทิศสั่งปืนจะลดลง
  let newDef = currentDeflection;
  if (direction === "LEFT") {
    newDef += milsAmount;
  } else if (direction === "RIGHT") {
    newDef -= milsAmount;
  }
  return Math.round(newDef);
}

/**
 * 19. Mean Point of Impact (MPI) & Registration (หาจุดกระสุนตกรวม)
 * ใช้อัตราส่วนตรีโกณมิติ Law of Sines (a/SinA = b/SinB = c/SinC)
 * ในการหา Correction Factor
 */
export function calculateMPICorrection(
  knownTarget: Point,
  actualMPI: Point,
  gunPosition: Point
): { correctionE: number, correctionN: number, rangeCorrection: number, deflectionCorrectionMils: number } {
  // คำนวณระยะทางจากปืนไปเป้าที่ต้องการ
  const rangeToKnown = calculateRange(gunPosition, knownTarget);
  const azToKnown = calculateTargetAzimuth(gunPosition, knownTarget);
  
  // คำนวณระยะทางจากปืนไปจุดตกจริง
  const rangeToMPI = calculateRange(gunPosition, actualMPI);
  const azToMPI = calculateTargetAzimuth(gunPosition, actualMPI);
  
  // หาความแตกต่าง 
  // ต้องปรับเพื่อชดเชย: ถ้าตกไกลไป ต้องลดระยะ ถ้าตกใกล้ไป ต้องเพิ่มระยะ
  const rangeCorrection = rangeToKnown - rangeToMPI;
  
  // มุมทิศ: ถ้าตกขวา ต้องหันซ้าย (Add)
  let deflectionCorrectionMils = azToKnown - azToMPI;
  if (deflectionCorrectionMils > 3200) deflectionCorrectionMils -= 6400;
  if (deflectionCorrectionMils < -3200) deflectionCorrectionMils += 6400;
  
  return {
    correctionE: knownTarget.x - actualMPI.x,
    correctionN: knownTarget.y - actualMPI.y,
    rangeCorrection,
    deflectionCorrectionMils
  };
}

/**
 * 20. Moving Target Interception (การดักยิงเป้าเคลื่อนที่)
 */
export function calculateMovingTargetInterception(
  targetStartPoint: Point,
  targetSpeedMetersPerSec: number,
  targetDirectionMils: number, // ทิศทางที่เป้าเคลื่อนไป
  estimatedTimeOfFlightSec: number
): Point {
  // ระยะทางที่เป้าหมายจะเคลื่อนที่ไประหว่างกระสุนลอย
  const distanceMoved = targetSpeedMetersPerSec * estimatedTimeOfFlightSec;
  
  // จุดตัดคือพิกัดใหม่
  const rads = milsToRads(targetDirectionMils);
  const dE = distanceMoved * Math.sin(rads);
  const dN = distanceMoved * Math.cos(rads);
  
  return {
    x: targetStartPoint.x + dE,
    y: targetStartPoint.y + dN,
    alt: targetStartPoint.alt
  };
}

/**
 * 21. Precision Registration (การหาพิกัดปืนใหญ่แม่นยำ)
 * คำนวณ Correction Factor จากกระสุนตกจริงเทียบกับหลักฐานที่ยิง
 */
export function calculatePrecisionRegistration(
  actualImpactEasting: number,
  actualImpactNorthing: number,
  firedRangeMeters: number,
  firedAzimuthMils: number,
  gunEasting: number,
  gunNorthing: number
): { kFactorRange: number, kFactorDeflection: number } {
  // คำนวณจุดตกทางทฤษฎี
  const rads = milsToRads(firedAzimuthMils);
  const theoreticalE = gunEasting + (firedRangeMeters * Math.sin(rads));
  const theoreticalN = gunNorthing + (firedRangeMeters * Math.cos(rads));
  
  // หาความแตกต่างในแนวพิกัด
  const diffE = actualImpactEasting - theoreticalE;
  const diffN = actualImpactNorthing - theoreticalN;
  
  // หาค่าคลาดเคลื่อนรวมเป็นเมตร
  const errorDistance = Math.sqrt(diffE * diffE + diffN * diffN);
  
  // K-Factor แบบง่าย: อัตราส่วนความคลาดเคลื่อนต่อ 1000 เมตร
  const kFactorRange = errorDistance / (firedRangeMeters / 1000);
  
  return {
    kFactorRange,
    kFactorDeflection: 0 // Simplification
  };
}

/**
 * 22. Radar Registration
 * เรดาร์จับจุดแตกอากาศ แล้วแจ้งกลับมาเพื่อชดเชย
 */
export function calculateRadarRegistration(
  radarSpottedPoint: Point,
  targetPoint: Point
): { correctionE: number, correctionN: number, correctionAlt: number } {
  return {
    correctionE: targetPoint.x - radarSpottedPoint.x,
    correctionN: targetPoint.y - radarSpottedPoint.y,
    correctionAlt: targetPoint.alt - radarSpottedPoint.alt
  };
}

/**
 * =====================================
 * MODULE 5: GEODETIC & SAFETY COMPUTATIONS
 * =====================================
 */

/**
 * 23. Grid Convergence (การชดเชยมุมเยื้องกริด)
 * เมื่อยิงข้ามโซนกริด ทิศเหนือกริดจะไม่ขนานกัน
 */
export function calculateGridConvergence(
  longitudeDeg: number,
  centralMeridianDeg: number,
  latitudeDeg: number
): number {
  // สมการโดยประมาณ: Convergence = Delta Longitude * Sin(Latitude)
  const deltaLong = longitudeDeg - centralMeridianDeg;
  const latRads = latitudeDeg * (Math.PI / 180);
  const convergenceDeg = deltaLong * Math.sin(latRads);
  
  // แปลงจาก Degree เป็น Mils (1 degree = ~17.777 mils)
  return convergenceDeg * (3200 / 180);
}

/**
 * 24. Crest Clearance (การตรวจสอบระยะพ้นแนวกำบัง)
 * ตรวจสอบว่าวิถีกระสุนพ้นยอดเขาหรือต้นไม้ที่อยู่ระหว่างทางหรือไม่
 */
export function verifyCrestClearance(
  gunAlt: number,
  crestAlt: number,
  distanceToCrest: number,
  firingElevationMils: number
): { isClear: boolean, clearanceMeters: number } {
  // ความสูงของแนวกำบังเทียบกับปืน
  const relativeCrestAlt = crestAlt - gunAlt;
  
  // ความสูงของวิถีกระสุนที่ระยะแนวกำบัง (คิดแบบเส้นตรงหยาบๆ สำหรับความปลอดภัย)
  const rads = milsToRads(firingElevationMils);
  const projectileAltAtCrest = distanceToCrest * Math.tan(rads);
  
  // ระยะพ้นกำบัง
  const clearanceMeters = projectileAltAtCrest - relativeCrestAlt;
  
  // กำหนดว่าต้องพ้นอย่างน้อย 10 เมตร
  return {
    isClear: clearanceMeters >= 10,
    clearanceMeters
  };
}

/**
 * 25. No-Fire Area (NFA) Verification (การตรวจสอบพื้นที่ห้ามยิง)
 * ตรวจสอบว่าพิกัดเป้าหมายตกอยู่ในรัศมีพื้นที่ห้ามยิงหรือไม่
 */
export function isPointInNoFireArea(
  targetPoint: Point,
  nfaCenter: Point,
  nfaRadiusMeters: number
): boolean {
  const dE = targetPoint.x - nfaCenter.x;
  const dN = targetPoint.y - nfaCenter.y;
  const distanceSq = (dE * dE) + (dN * dN);
  const radiusSq = nfaRadiusMeters * nfaRadiusMeters;
  
  return distanceSq <= radiusSq;
}

