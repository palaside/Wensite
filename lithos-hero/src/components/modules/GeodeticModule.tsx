import React, { useState } from 'react';

export const GeodeticModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convergence' | 'displacement'>('convergence');

  // --- Convergence State ---
  const [tgtNorth, setTgtNorth] = useState('1225000');
  const [gunNorth, setGunNorth] = useState('1220000');
  const [zoneDir, setZoneDir] = useState<'W2E'|'E2W'>('W2E');

  // --- Displacement State ---
  const [gun1E, setGun1E] = useState('610812');
  const [gun1N, setGun1N] = useState('1220400');
  const [gun2E, setGun2E] = useState('609661');
  const [gun2N, setGun2N] = useState('1220450');

  return (
    <div className="space-y-4">
      <div className="text-amber-400 font-bold border-b border-amber-900/50 pb-2 flex justify-between items-center">
        <span>Geodetic (พิกัดโลกข้ามโซน)</span>
        <div className="flex gap-1 text-[10px]">
          <button onClick={() => setActiveTab('convergence')} className={`px-2 py-1 rounded ${activeTab === 'convergence' ? 'bg-amber-700 text-white' : 'bg-amber-900/40 text-amber-500'}`}>Convergence</button>
          <button onClick={() => setActiveTab('displacement')} className={`px-2 py-1 rounded ${activeTab === 'displacement' ? 'bg-amber-700 text-white' : 'bg-amber-900/40 text-amber-500'}`}>Displacement</button>
        </div>
      </div>

      {activeTab === 'convergence' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">การเปลี่ยนพิกัดข้ามเขตตาราง UTM (Army Ephemeris)</div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] text-amber-500">Tgt Northing</label><input type="text" value={tgtNorth} onChange={e=>setTgtNorth(e.target.value)} className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
            <div><label className="text-[9px] text-amber-500">Gun Northing</label><input type="text" value={gunNorth} onChange={e=>setGunNorth(e.target.value)} className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
            <div className="col-span-2">
              <label className="text-[9px] text-amber-500">Cross Zone Direction</label>
              <select value={zoneDir} onChange={e=>setZoneDir(e.target.value as 'W2E'|'E2W')} className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm">
                <option value="W2E">ตะวันตก ไป ตะวันออก (+)</option>
                <option value="E2W">ตะวันออก ไป ตะวันตก (-)</option>
              </select>
            </div>
          </div>
          
          <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded text-center mt-2">
            {(!isNaN(parseFloat(tgtNorth)) && !isNaN(parseFloat(gunNorth))) ? (
              <>
                <div className="text-[10px] text-amber-500 uppercase">Average Northing (N_avg)</div>
                <div className="text-lg text-amber-200 font-mono">
                  {((parseFloat(tgtNorth) + parseFloat(gunNorth)) / 2).toFixed(1)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">นำ N_avg ไปเปิดตาราง Army Ephemeris</div>
                <div className="text-[10px] text-gray-500">เครื่องหมายแก้ทิศทาง: <strong className="text-amber-400">{zoneDir === 'W2E' ? 'บวก (+)' : 'ลบ (-)'}</strong></div>
              </>
            ) : <span className="text-gray-500 text-sm">Waiting...</span>}
          </div>
        </div>
      )}

      {activeTab === 'displacement' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">การลดเหลื่อมของปืน (หาศูนย์กลางหมวด)</div>
          
          <div className="grid grid-cols-2 gap-2 p-2 bg-black/30 border border-amber-900/30 rounded">
            <div className="col-span-2 text-[10px] text-amber-500/70 font-bold">Gun Piece 1 (ขวา)</div>
            <div><input type="text" value={gun1E} onChange={e=>setGun1E(e.target.value)} placeholder="Easting" className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
            <div><input type="text" value={gun1N} onChange={e=>setGun1N(e.target.value)} placeholder="Northing" className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 p-2 bg-black/30 border border-amber-900/30 rounded">
            <div className="col-span-2 text-[10px] text-amber-500/70 font-bold">Gun Piece 2 (ซ้าย)</div>
            <div><input type="text" value={gun2E} onChange={e=>setGun2E(e.target.value)} placeholder="Easting" className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
            <div><input type="text" value={gun2N} onChange={e=>setGun2N(e.target.value)} placeholder="Northing" className="w-full bg-black/50 border border-amber-900/50 rounded px-2 py-1 text-amber-400 text-sm"/></div>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded text-center">
             <div className="text-[10px] text-amber-500 uppercase mb-2">Platoon Center (ศก.หมวด)</div>
             <div className="flex justify-around">
               <div>
                  <span className="text-[9px] text-gray-500 block">EASTING</span>
                  <span className="font-mono text-amber-300">
                    {((parseFloat(gun1E) + parseFloat(gun2E)) / 2).toFixed(1)}
                  </span>
               </div>
               <div>
                  <span className="text-[9px] text-gray-500 block">NORTHING</span>
                  <span className="font-mono text-amber-300">
                    {((parseFloat(gun1N) + parseFloat(gun2N)) / 2).toFixed(1)}
                  </span>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
