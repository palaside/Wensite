import React, { useState } from 'react';
import { FiringTable } from '../../data/FiringTable';
import { interpolateValue } from '../../lib/firingTableDB';

export const FiringTableModule: React.FC = () => {
  const [rangeInput, setRangeInput] = useState('');
  const [charge, setCharge] = useState('7');
  const [result, setResult] = useState<any>(null);

  const handleQuery = () => {
    const range = parseInt(rangeInput);
    if (isNaN(range)) return;

    // We will just use interpolateValue to get elevation for now
    const elevation = interpolateValue(range, 'elevation', FiringTable, charge);
    const tof = interpolateValue(range, 'timeOfFlight', FiringTable, charge);

    setResult({
      elevation: elevation !== null ? elevation.toFixed(1) : 'OOR',
      tof: tof !== null ? tof.toFixed(1) : 'OOR',
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        M101A1 Firing Table (Mock DB)
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Range (meters)</label>
          <input 
            type="text" 
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
            placeholder="e.g. 4500"
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="w-24">
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Charge</label>
          <select 
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500 appearance-none text-center"
          >
            {[1,2,3,4,5,6,7].map(c => <option key={c} value={String(c)}>Chg {c}</option>)}
          </select>
        </div>
      </div>

      <button 
        onClick={handleQuery}
        className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 rounded text-emerald-400 font-bold text-sm tracking-wider uppercase transition-colors"
      >
        Lookup TFT
      </button>

      {result && (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Elevation (mils)</div>
              <div className="text-2xl font-mono text-emerald-300">{result.elevation}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Time of Flight (s)</div>
              <div className="text-2xl font-mono text-emerald-300">{result.tof}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
