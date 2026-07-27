import React, { useState } from 'react';

export const RegistrationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mpi' | 'airburst' | 'radar'>('mpi');

  // --- MPI State ---
  const [distK, setDistK] = useState('1000'); // ระยะฐาน
  const [angleT2, setAngleT2] = useState('800'); // มุมที่ ต2
  const [angleA, setAngleA] = useState('1600'); // มุมยอด A

  // --- Airburst State ---
  const [timeTarget, setTimeTarget] = useState('18.2');
  const [timeActual, setTimeActual] = useState('18.5');

  // --- Radar State ---
  const [radarE, setRadarE] = useState('610500');
  const [radarN, setRadarN] = useState('1220400');
  const [chartE, setChartE] = useState('610480');
  const [chartN, setChartN] = useState('1220390');

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 flex justify-between items-center">
        <span>Registration (ยิงหาหลักฐานตาบอด)</span>
        <div className="flex gap-1 text-[10px]">
          <button onClick={() => setActiveTab('mpi')} className={`px-2 py-1 rounded ${activeTab === 'mpi' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/40 text-emerald-500'}`}>MPI</button>
          <button onClick={() => setActiveTab('airburst')} className={`px-2 py-1 rounded ${activeTab === 'airburst' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/40 text-emerald-500'}`}>Airburst</button>
          <button onClick={() => setActiveTab('radar')} className={`px-2 py-1 rounded ${activeTab === 'radar' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/40 text-emerald-500'}`}>Radar</button>
        </div>
      </div>

      {activeTab === 'mpi' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">จุดปานกลางมณฑล (Law of Sines)</div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] text-emerald-500">Base Dist (K)</label><input type="text" value={distK} onChange={e=>setDistK(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div><label className="text-[9px] text-emerald-500">Angle at T2</label><input type="text" value={angleT2} onChange={e=>setAngleT2(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div className="col-span-2"><label className="text-[9px] text-emerald-500">Apex Angle (A)</label><input type="text" value={angleA} onChange={e=>setAngleA(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-center">
            {(!isNaN(parseFloat(distK)) && !isNaN(parseFloat(angleT2)) && !isNaN(parseFloat(angleA))) ? (
              <>
                <div className="text-[10px] text-emerald-500 uppercase">Computed Distance (D)</div>
                <div className="text-xl text-emerald-300 font-mono mt-1">
                  {/* Law of Sines (simplified representation) */}
                  {((parseFloat(distK) * Math.sin(parseFloat(angleT2)*Math.PI/3200)) / Math.sin(parseFloat(angleA)*Math.PI/3200)).toFixed(1)} m
                </div>
              </>
            ) : <span className="text-gray-500 text-sm">Waiting for input...</span>}
          </div>
        </div>
      )}

      {activeTab === 'airburst' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">ตัวแก้เวลาชนวน (Time Fuze Correction)</div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] text-emerald-500">Target Time (s)</label><input type="text" value={timeTarget} onChange={e=>setTimeTarget(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div><label className="text-[9px] text-emerald-500">Actual Time (s)</label><input type="text" value={timeActual} onChange={e=>setTimeActual(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-center">
            <div className="text-[10px] text-emerald-500 uppercase">Fuze Correction</div>
            <div className="text-xl text-yellow-300 font-mono mt-1">
               {(parseFloat(timeTarget) - parseFloat(timeActual)).toFixed(2)} sec
            </div>
          </div>
        </div>
      )}

      {activeTab === 'radar' && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-[10px] text-gray-400">ผลต่างพิกัดเรดาร์ (Radar vs Chart)</div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] text-cyan-500">Radar Easting</label><input type="text" value={radarE} onChange={e=>setRadarE(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div><label className="text-[9px] text-cyan-500">Radar Northing</label><input type="text" value={radarN} onChange={e=>setRadarN(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div><label className="text-[9px] text-emerald-500">Chart Easting</label><input type="text" value={chartE} onChange={e=>setChartE(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
            <div><label className="text-[9px] text-emerald-500">Chart Northing</label><input type="text" value={chartN} onChange={e=>setChartN(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 text-sm"/></div>
          </div>
          <div className="p-3 bg-black/40 border border-cyan-900/50 rounded text-center">
             <div className="text-[10px] text-cyan-500 uppercase mb-2">Correction Vector (ΔE, ΔN)</div>
             <div className="flex justify-around">
               <div>
                  <span className="text-[9px] text-gray-500 block">EASTING</span>
                  <span className="font-mono text-cyan-300">{parseFloat(radarE) - parseFloat(chartE)}</span>
               </div>
               <div>
                  <span className="text-[9px] text-gray-500 block">NORTHING</span>
                  <span className="font-mono text-cyan-300">{parseFloat(radarN) - parseFloat(chartN)}</span>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
