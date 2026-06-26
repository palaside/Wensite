export interface TargetData {
  id: string;
  grid: string;
  altitude: number;
  description: string;
}

export function parseTargetCsv(csvText: string): TargetData[] {
  if (!csvText || csvText.trim() === '') return [];

  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return []; // No data lines

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find indices based on common header names
  const idIndex = headers.findIndex(h => h.includes('id') || h.includes('name') || h.includes('target') || h.includes('เป้าหมาย') || h.includes('จุด'));
  const gridIndex = headers.findIndex(h => h.includes('grid') || h.includes('พิกัด') || h.includes('กริด'));
  const altIndex = headers.findIndex(h => h.includes('alt') || h.includes('สูง'));
  const descIndex = headers.findIndex(h => h.includes('desc') || h.includes('ราย') || h.includes('ลักษณะ'));

  const targets: TargetData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length === 0) continue;

    // Fallback logic if headers weren't found perfectly
    // Assume Col 0 = ID, Col 1 = Grid, Col 2 = Alt, Col 3 = Desc if indexes are missing
    const tId = idIndex >= 0 ? row[idIndex] : row[0] || `Target-${i}`;
    const tGrid = gridIndex >= 0 ? row[gridIndex] : row[1] || '';
    const tAltStr = altIndex >= 0 ? row[altIndex] : row[2] || '0';
    const tDesc = descIndex >= 0 ? row[descIndex] : row[3] || '';

    // Only add if it looks like it has a grid
    if (tGrid && /\d{4}/.test(tGrid)) {
      targets.push({
        id: tId,
        grid: tGrid.replace(/\s+/g, ''), // remove spaces from grid
        altitude: parseFloat(tAltStr) || 0,
        description: tDesc
      });
    }
  }

  return targets;
}
