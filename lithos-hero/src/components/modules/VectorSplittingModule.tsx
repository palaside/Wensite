import React, { useState } from 'react';

export const VectorSplittingModule: React.FC = () => {
  const [targetAz, setTargetAz] = useState('3200');
  const [windDir, setWindDir] = useState('1600');
  const [windSpeed, setWindSpeed] = useState('10');

  const taz = parseFloat(targetAz);
  const wdir = parseFloat(windDir);
  const wspd = parseFloat(windSpeed);

  let cross = 0, rangeWind = 0;
  if (!isNaN(taz) && !isNaN(wdir) && !isNaN(wspd)) {
    // 6400 mils = 2PI
    const radDiff = (wdir - taz) * (Math.PI / 3200);
    cross = wspd * Math.sin(radDiff); // Right is positive
    rangeWind = wspd * Math.cos(radDiff); // Headwind/Tailwind
  }

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Vector Splitting (ชดเชยลม)
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[9px] text-emerald-500/70 uppercase">Tgt Azimuth</label>
          <input type="text" value={targetAz} onChange={e => setTargetAz(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-xs" />
        </div>
        <div>
          <label className="block text-[9px] text-emerald-500/70 uppercase">Wind Dir</label>
          <input type="text" value={windDir} onChange={e => setWindDir(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-xs" />
        </div>
        <div>
          <label className="block text-[9px] text-emerald-500/70 uppercase">Wind Spd</label>
          <input type="text" value={windSpeed} onChange={e => setWindSpeed(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-xs" />
        </div>
      </div>

      <div className="relative w-full h-32 bg-black/40 border border-emerald-900/30 rounded-lg flex items-center justify-center mt-4">
         <div className="z-10 text-center">
            <div className="text-sm font-bold text-emerald-300">
              Crosswind: <span className="font-mono">{Math.abs(cross).toFixed(1)} kts</span> {cross > 0 ? '(Right)' : '(Left)'}
            </div>
            <div className="text-sm font-bold text-cyan-300 mt-2">
              Range: <span className="font-mono">{Math.abs(rangeWind).toFixed(1)} kts</span> {rangeWind > 0 ? '(Tail)' : '(Head)'}
            </div>
         </div>
      </div>
    </div>
  );
};
