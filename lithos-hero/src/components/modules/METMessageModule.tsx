import React, { useState } from 'react';

export const METMessageModule: React.FC = () => {
  const [lineNumber, setLineNumber] = useState('00');
  const [windDir, setWindDir] = useState('3200');
  const [windSpeed, setWindSpeed] = useState('10');
  const [temp, setTemp] = useState('25');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2 mb-4">
        <div className="text-emerald-400 font-bold">Standard MET Message</div>
        <div className="text-[10px] text-emerald-500/50 font-mono">STATION: TH-1</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Line Number</label>
          <select 
            value={lineNumber}
            onChange={(e) => setLineNumber(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500 appearance-none text-center"
          >
            <option value="00">Line 00 (Surface)</option>
            <option value="01">Line 01 (200m)</option>
            <option value="02">Line 02 (500m)</option>
            <option value="03">Line 03 (1000m)</option>
            <option value="04">Line 04 (1500m)</option>
            <option value="05">Line 05 (2000m)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Wind Dir (mils)</label>
          <input 
            type="text" 
            value={windDir}
            onChange={(e) => setWindDir(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Wind Speed (knots)</label>
          <input 
            type="text" 
            value={windSpeed}
            onChange={(e) => setWindSpeed(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Air Temp (°C)</label>
          <input 
            type="text" 
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button className="w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 rounded text-emerald-400 font-bold text-sm tracking-wider uppercase transition-colors">
        Save MET Line
      </button>

      <div className="mt-4 p-3 bg-black/40 border border-emerald-900/30 rounded-lg text-left">
        <div className="text-xs text-emerald-500 font-mono mb-1">{'>'} ENGINE STATUS: READY</div>
        <div className="text-xs text-gray-400">Data will be used in Advanced Ballistics Vector Splitting.</div>
      </div>
    </div>
  );
};
