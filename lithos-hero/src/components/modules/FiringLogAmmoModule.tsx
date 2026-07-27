import React, { useState } from 'react';

export const FiringLogAmmoModule: React.FC = () => {
  const [he, setHe] = useState(120);
  const [wp, setWp] = useState(35);
  const [ill, setIll] = useState(15);
  
  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Logistics & Ammo
      </div>
      
      {/* HE Ammo */}
      <div className="bg-black/40 border border-emerald-900/30 rounded p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-emerald-400 font-bold">HE M107 (High Explosive)</span>
          <span className="text-xs font-mono text-emerald-300">{he} / 200</span>
        </div>
        <div className="w-full bg-emerald-950 h-2 rounded overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(he/200)*100}%` }}></div>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setHe(h => Math.max(0, h - 1))} className="flex-1 py-1 text-[10px] bg-emerald-900/40 text-emerald-400 rounded border border-emerald-900 hover:bg-emerald-800/60 font-bold">
            FIRE 1
          </button>
          <button onClick={() => setHe(h => Math.max(0, h - 5))} className="flex-1 py-1 text-[10px] bg-emerald-900/40 text-emerald-400 rounded border border-emerald-900 hover:bg-emerald-800/60 font-bold">
            FIRE 5
          </button>
        </div>
      </div>

      {/* WP Ammo */}
      <div className="bg-black/40 border border-amber-900/30 rounded p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-amber-400 font-bold">WP M110 (White Phosphorus)</span>
          <span className="text-xs font-mono text-amber-300">{wp} / 50</span>
        </div>
        <div className="w-full bg-amber-950 h-2 rounded overflow-hidden">
          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${(wp/50)*100}%` }}></div>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setWp(w => Math.max(0, w - 1))} className="flex-1 py-1 text-[10px] bg-amber-900/40 text-amber-400 rounded border border-amber-900 hover:bg-amber-800/60 font-bold">
            FIRE 1
          </button>
        </div>
      </div>

      {/* ILLUM Ammo */}
      <div className="bg-black/40 border border-yellow-200/20 rounded p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-yellow-200 font-bold">ILLUM M485 (Illumination)</span>
          <span className="text-xs font-mono text-yellow-200">{ill} / 30</span>
        </div>
        <div className="w-full bg-yellow-950 h-2 rounded overflow-hidden">
          <div className="bg-yellow-200 h-full transition-all duration-300" style={{ width: `${(ill/30)*100}%` }}></div>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setIll(i => Math.max(0, i - 1))} className="flex-1 py-1 text-[10px] bg-yellow-900/40 text-yellow-200 rounded border border-yellow-900 hover:bg-yellow-800/60 font-bold">
            FIRE 1
          </button>
        </div>
      </div>
      
    </div>
  );
};
