import React, { useState } from 'react';

export const TacticalOverridesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lars' | 'highangle' | 'fpf'>('lars');

  // --- LARS State ---
  const [baseAz, setBaseAz] = useState('3200');
  const [shift, setShift] = useState('50');
  const [dir, setDir] = useState<'L'|'R'>('R');

  // --- High Angle State ---
  const [elev, setElev] = useState('1100'); // มุมสูง
  const [site, setSite] = useState('14'); // มุมพื้นที่ (มิล)
  const [factor, setFactor] = useState('-4.6'); // แฟกเตอร์มุมพื้นที่ยิง (ติดลบ)

  return (
    <div className="space-y-4">
      <div className="text-red-400 font-bold border-b border-red-900/50 pb-2 flex justify-between items-center">
        <span>Tactical Overrides (ฉุกเฉิน)</span>
        <div className="flex gap-1 text-[10px]">
          <button onClick={() => setActiveTab('lars')} className={`px-2 py-1 rounded ${activeTab === 'lars' ? 'bg-red-900 text-red-200 border border-red-500' : 'bg-black/50 text-red-500 border border-red-900/30'}`}>LARS</button>
          <button onClick={() => setActiveTab('highangle')} className={`px-2 py-1 rounded ${activeTab === 'highangle' ? 'bg-red-900 text-red-200 border border-red-500' : 'bg-black/50 text-red-500 border border-red-900/30'}`}>High Angle</button>
          <button onClick={() => setActiveTab('fpf')} className={`px-2 py-1 rounded ${activeTab === 'fpf' ? 'bg-red-900 text-red-200 border border-red-500' : 'bg-black/50 text-red-500 border border-red-900/30'}`}>FPF</button>
        </div>
      </div>

      {activeTab === 'lars' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">กฎซ้าย-เพิ่ม, ขวา-ลด (Left-Add, Right-Subtract)</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[9px] text-red-400">Base Azimuth (มุมทิศเดิม)</label>
              <input type="text" value={baseAz} onChange={e=>setBaseAz(e.target.value)} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm"/>
            </div>
            <div>
              <label className="text-[9px] text-red-400">Direction</label>
              <select value={dir} onChange={e=>setDir(e.target.value as 'L'|'R')} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm">
                <option value="L">LEFT (+)</option>
                <option value="R">RIGHT (-)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-red-400">Shift (mils)</label>
              <input type="text" value={shift} onChange={e=>setShift(e.target.value)} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm"/>
            </div>
          </div>
          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-center">
            <div className="text-[10px] text-red-500 uppercase">New Azimuth</div>
            <div className="text-xl text-red-300 font-mono mt-1">
               {dir === 'L' ? parseFloat(baseAz) + parseFloat(shift) : parseFloat(baseAz) - parseFloat(shift)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'highangle' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">การยิงมุมใหญ่ (&gt;45 องศา) แฟกเตอร์ติดลบ</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><label className="text-[9px] text-red-400">Elevation (มุมสูงจากตาราง)</label><input type="text" value={elev} onChange={e=>setElev(e.target.value)} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm"/></div>
            <div><label className="text-[9px] text-red-400">Site Angle (mils)</label><input type="text" value={site} onChange={e=>setSite(e.target.value)} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm"/></div>
            <div><label className="text-[9px] text-red-400">Site Factor (-)</label><input type="text" value={factor} onChange={e=>setFactor(e.target.value)} className="w-full bg-black/50 border border-red-900/50 rounded px-2 py-1 text-red-300 text-sm"/></div>
          </div>
          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-center">
            <div className="text-[10px] text-red-500 uppercase">Quadrant Elevation (มุมยิง)</div>
            <div className="text-xl text-red-300 font-mono mt-1">
               {/* QE = EL + (Site * Factor) */}
               {Math.round(parseFloat(elev) + (parseFloat(site) * parseFloat(factor)))}
               <div className="text-[9px] text-gray-500 block mt-1">(มุมพื้นที่ยิง: {parseFloat(site) * parseFloat(factor)})</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fpf' && (
        <div className="space-y-3 animate-fade-in text-center py-4">
           <div className="w-12 h-12 bg-red-600 rounded-full animate-pulse mx-auto flex items-center justify-center border-4 border-red-900">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
           </div>
           <div className="text-red-400 font-bold tracking-widest uppercase mt-4">Final Protective Fire</div>
           <div className="text-[10px] text-gray-400 mt-2">
             ข้อมูลฉากป้องกันขั้นสุดท้ายถูกบันทึก (Saved State) ในหน่วยความจำหลักแล้ว เมื่อกดปุ่ม FIRE FPF ระบบจะบังคับปืนทุกกระบอกหันเข้าพิกัดนี้ทันที
           </div>
           <button className="mt-4 w-full py-2 bg-red-900 text-white font-bold tracking-widest text-sm rounded hover:bg-red-800 border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
             AUTHORIZE FPF
           </button>
        </div>
      )}
    </div>
  );
};
