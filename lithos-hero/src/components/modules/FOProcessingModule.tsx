import React, { useState } from 'react';
import { useFDC } from '../../context/FDCContext';
import { parseGrid, calculateGridDelta } from '../../utils/artilleryMath';

export const FOProcessingModule: React.FC = () => {
  const { settings } = useFDC();
  const [obsGrid, setObsGrid] = useState('');
  const [direction, setDirection] = useState('');
  const [distance, setDistance] = useState('');
  const [targetE, setTargetE] = useState<number | null>(null);
  const [targetN, setTargetN] = useState<number | null>(null);

  const calculateTarget = () => {
    const parsedObs = parseGrid(obsGrid);
    if (!parsedObs) {
      alert("Invalid Observer Grid");
      return;
    }
    const dirMils = parseFloat(direction);
    const distMeters = parseFloat(distance);
    if (isNaN(dirMils) || isNaN(distMeters)) return;

    // Convert mils to radians
    const dirRads = dirMils * (Math.PI / 3200);
    
    // Calculate deltas
    const dE = distMeters * Math.sin(dirRads);
    const dN = distMeters * Math.cos(dirRads);

    const tE = parsedObs.easting + dE;
    const tN = parsedObs.northing + dN;

    setTargetE(Math.round(tE));
    setTargetN(Math.round(tN));
  };

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Call For Fire (Polar)
      </div>

      <div>
        <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Observer Grid (6 or 8 digits)</label>
        <input 
          type="text" 
          value={obsGrid}
          onChange={(e) => setObsGrid(e.target.value)}
          placeholder="e.g. 450650"
          className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Direction (mils)</label>
          <input 
            type="text" 
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="0 - 6400"
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Distance (meters)</label>
          <input 
            type="text" 
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button 
        onClick={calculateTarget}
        className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 rounded text-emerald-400 font-bold text-sm tracking-wider uppercase transition-colors"
      >
        Calculate Target Grid
      </button>

      {targetE !== null && targetN !== null && (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
          <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-2 border-b border-emerald-900/50 pb-1">Target Coordinates</div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[10px] text-gray-500">TARGET EASTING</div>
              <div className="text-xl font-mono text-emerald-300">{targetE}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500">TARGET NORTHING</div>
              <div className="text-xl font-mono text-emerald-300">{targetN}</div>
            </div>
          </div>
          
          <button className="mt-4 w-full py-1.5 bg-cyan-900/40 border border-cyan-500/50 rounded text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-800/60">
            Save to Target List DB
          </button>
        </div>
      )}
    </div>
  );
};
