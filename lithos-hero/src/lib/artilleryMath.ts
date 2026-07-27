export interface Coordinate {
  lat: number;
  lon: number;
  alt?: number; // in meters
}

export interface CorrectionResult {
  leftRight: number;
  leftRightDir: 'ซ้าย' | 'ขวา' | 'ตรง';
  addDrop: number;
  addDropDir: 'เพิ่ม' | 'ลด' | 'ได้ระยะ';
  deltaH: number;
  upDownDir: 'แก้ขึ้น' | 'แก้ลง' | 'ระดับได้';
}

const EARTH_RADIUS_M = 6371000;
const SPEED_OF_SOUND_M_S = 343; // Speed of sound at 20 degrees Celsius

// Convert degrees to radians
export const toRad = (value: number) => (value * Math.PI) / 180;
// Convert radians to degrees
export const toDeg = (value: number) => (value * 180) / Math.PI;

// Calculate horizontal distance between two points in meters (Haversine)
export const calculateDistance = (p1: Coordinate, p2: Coordinate): number => {
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
};

// Calculate initial bearing (azimuth) from p1 to p2 in degrees (0-360)
export const calculateBearing = (p1: Coordinate, p2: Coordinate): number => {
  const dLon = toRad(p2.lon - p1.lon);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return (toDeg(bearing) + 360) % 360;
};

// Calculate Fire Correction from Observer, Target, and Impact
export const calculateCorrection = (
  observer: Coordinate,
  target: Coordinate,
  impact: Coordinate
): CorrectionResult => {
  const otAzimuth = calculateBearing(observer, target);
  const otDistance = calculateDistance(observer, target);
  const oiAzimuth = calculateBearing(observer, impact);
  const oiDistance = calculateDistance(observer, impact);

  let deltaAzimuthDeg = oiAzimuth - otAzimuth;
  if (deltaAzimuthDeg > 180) deltaAzimuthDeg -= 360;
  if (deltaAzimuthDeg < -180) deltaAzimuthDeg += 360;
  const deltaAzimuthRad = toRad(deltaAzimuthDeg);
  
  const deviation = oiDistance * Math.sin(deltaAzimuthRad);
  const rangeDiff = (oiDistance * Math.cos(deltaAzimuthRad)) - otDistance;

  const absDev = Math.abs(Math.round(deviation));
  const absRange = Math.abs(Math.round(rangeDiff));

  let leftRightDir: 'ซ้าย' | 'ขวา' | 'ตรง' = 'ตรง';
  if (deviation > 5) leftRightDir = 'ซ้าย'; 
  else if (deviation < -5) leftRightDir = 'ขวา'; 

  let addDropDir: 'เพิ่ม' | 'ลด' | 'ได้ระยะ' = 'ได้ระยะ';
  if (rangeDiff > 5) addDropDir = 'ลด'; 
  else if (rangeDiff < -5) addDropDir = 'เพิ่ม'; 

  const tAlt = target.alt || 0;
  const iAlt = impact.alt || 0;
  const deltaH = iAlt - tAlt;
  const absDeltaH = Math.abs(Math.round(deltaH));
  
  let upDownDir: 'แก้ขึ้น' | 'แก้ลง' | 'ระดับได้' = 'ระดับได้';
  if (deltaH > 5) upDownDir = 'แก้ลง';
  else if (deltaH < -5) upDownDir = 'แก้ขึ้น';

  return {
    leftRight: absDev,
    leftRightDir,
    addDrop: absRange,
    addDropDir,
    deltaH: absDeltaH,
    upDownDir
  };
};

// --- FO TACTICAL MODULES ---

// Flash-to-Bang Calculator
export const calculateFlashToBang = (timeSeconds: number): number => {
  return Math.round(timeSeconds * SPEED_OF_SOUND_M_S);
};

// AI Target Lethality Engine
export type TargetType = 'infantry_open' | 'infantry_bunker' | 'armor' | 'soft_vehicles' | 'building';

export interface WeaponRecommendation {
  projectile: string;
  fuze: string;
  volleys: number;
  reason: string;
}

export const getLethalityRecommendation = (targetType: TargetType): WeaponRecommendation => {
  switch (targetType) {
    case 'infantry_open':
      return { projectile: 'HE (ระเบิดแรงสูง)', fuze: 'VT (แตกอากาศ)', volleys: 3, reason: 'เพื่อหวังผลสังหารในวงกว้างบนพื้นที่โล่ง' };
    case 'infantry_bunker':
      return { projectile: 'HE (ระเบิดแรงสูง)', fuze: 'Delay (ถ่วงเวลา)', volleys: 6, reason: 'เพื่อให้กระสุนเจาะทะลุหลุมหรือบังเกอร์ก่อนระเบิด' };
    case 'armor':
      return { projectile: 'DPICM (กระสุนลูกปรายเจาะเกราะ)', fuze: 'Time (ตั้งเวลา)', volleys: 4, reason: 'ทำลายเกราะบางส่วนบนของรถถังหรือยานเกราะ' };
    case 'soft_vehicles':
      return { projectile: 'HE / WP', fuze: 'Quick (กระทบแตก)', volleys: 3, reason: 'ทำลายยานพาหนะล้อตีนตะขาบหรือล้อยาง' };
    case 'building':
      return { projectile: 'HE (ระเบิดแรงสูง)', fuze: 'Delay (ถ่วงเวลา)', volleys: 5, reason: 'ทำลายโครงสร้างอาคารที่มั่น' };
    default:
      return { projectile: '-', fuze: '-', volleys: 0, reason: '-' };
  }
};
