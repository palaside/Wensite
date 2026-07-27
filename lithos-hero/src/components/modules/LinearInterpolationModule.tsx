import React, { useState } from 'react';

export const LinearInterpolationModule: React.FC = () => {
  const [r1, setR1] = useState('4000');
  const [e1, setE1] = useState('120');
  const [r2, setR2] = useState('4100');
  const [e2, setE2] = useState('125');
  const [tr, setTr] = useState('4050');

  const R1 = parseFloat(r1);
  const E1 = parseFloat(e1);
  const R2 = parseFloat(r2);
  const E2 = parseFloat(e2);
  const TR = parseFloat(tr);
  
  let targetElev = 'N/A';
  if (!isNaN(R1) && !isNaN(E1) && !isNaN(R2) && !isNaN(E2) && !isNaN(TR) && (R2 - R1 !== 0)) {
    const slope = (E2 - E1) / (R2 - R1);
    targetElev = (E1 + slope * (TR - R1)).toFixed(1);
  }

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Linear Interpolation (เทียบบัญญัติไตรยางศ์)
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <label className="block text-[10px] text-emerald-500/70 uppercase">Point 1 (Short)</label>
          <input type="text" value={r1} onChange={e => setR1(e.target.value)} placeholder="Range 1" className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
          <input type="text" value={e1} onChange={e => setE1(e.target.value)} placeholder="Elev 1" className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
        </div>
        <div className="flex-1 space-y-2">
          <label className="block text-[10px] text-emerald-500/70 uppercase">Point 2 (Long)</label>
          <input type="text" value={r2} onChange={e => setR2(e.target.value)} placeholder="Range 2" className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
          <input type="text" value={e2} onChange={e => setE2(e.target.value)} placeholder="Elev 2" className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-emerald-900/30">
        <label className="block text-[10px] text-cyan-500/70 uppercase">Target Range</label>
        <input type="text" value={tr} onChange={e => setTr(e.target.value)} className="w-full bg-cyan-950/30 border border-cyan-900/50 rounded px-2 py-2 text-cyan-400 font-mono text-sm mt-1" />
      </div>

      <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-center">
        <div className="text-[10px] text-gray-500 uppercase">Exact Elevation</div>
        <div className="text-2xl font-mono text-emerald-300">{targetElev}</div>
      </div>
    </div>
  );
};
