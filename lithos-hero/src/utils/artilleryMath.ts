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
