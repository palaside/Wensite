import React, { useState, useEffect } from 'react';
import { useFDC } from '../../context/FDCContext';
import { parseGrid } from '../../utils/artilleryMath';

export const BasicGeometryModule: React.FC = () => {
  const { settings } = useFDC();
  
  // Start point defaults to FDC Battery Center
  const [startGrid, setStartGrid] = useState(`${settings.fdcEasting}${settings.fdcNorthing}`);
  const [endGrid, setEndGrid] = useState('');
  
  const [distance, setDistance] = useState<number | null>(null);
  const [azimuth, setAzimuth] = useState<number | null>(null);

  // Auto-update start grid if FDC settings change and user hasn't heavily modified it
  useEffect(() => {
    if (settings.fdcEasting && settings.fdcNorthing) {
      // Just a helper to format 8-digit grid from E and N if they are 5-digit each (e.g. 45000 -> 4500)
      const e = settings.fdcEasting.substring(0, 4);
      const n = settings.fdcNorthing.substring(0, 4);
      setStartGrid(`${e}${n}`);
    }
  }, [settings.fdcEasting, settings.fdcNorthing]);

  const calculateGeometry = () => {
    const pt1 = parseGrid(startGrid);
    const pt2 = parseGrid(endGrid);

    if (!pt1 || !pt2 || (pt1.x === 0 && pt1.y === 0) || (pt2.x === 0 && pt2.y === 0)) {
      alert("Invalid grid coordinates. Use 8-digit or 10-digit grids.");
      return;
    }

    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate Azimuth in Mils (atan2(x, y) where Y is North)
    let azRads = Math.atan2(dx, dy);
    if (azRads < 0) azRads += 2 * Math.PI;
    const azMils = azRads * (3200 / Math.PI);

    setDistance(dist);
    setAzimuth(azMils);
  };

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Basic Geometry (Grid Computation)
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Start Grid (Point A)</label>
          <input 
            type="text" 
            value={startGrid}
            onChange={(e) => setStartGrid(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
          <div className="text-[9px] text-emerald-500/50 mt-1">Defaults to FDC Battery Center</div>
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">End Grid (Point B)</label>
          <input 
            type="text" 
            value={endGrid}
            onChange={(e) => setEndGrid(e.target.value)}
            placeholder="e.g. 45506550"
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button 
        onClick={calculateGeometry}
        className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 rounded text-emerald-400 font-bold text-sm tracking-wider uppercase transition-colors"
      >
        Compute Geometry
      </button>

      {distance !== null && azimuth !== null && (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Azimuth (mils)</div>
              <div className="text-2xl font-mono text-emerald-300">{Math.round(azimuth)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Distance (meters)</div>
              <div className="text-2xl font-mono text-emerald-300">{Math.round(distance)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
