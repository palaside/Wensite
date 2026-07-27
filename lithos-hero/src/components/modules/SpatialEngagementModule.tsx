import React, { useState } from 'react';

export const SpatialEngagementModule: React.FC = () => {
  const [width, setWidth] = useState('500');
  const [depth, setDepth] = useState('200');
  const [radius, setRadius] = useState('50'); // รัศมีระเบิด (Burst width/depth)

  const w = parseFloat(width);
  const d = parseFloat(depth);
  const r = parseFloat(radius);

  let sweeps = 0;
  let zones = 0;

  if (!isNaN(w) && !isNaN(d) && !isNaN(r) && r > 0) {
    // จำนวนมุมทิศ = ความกว้างเป้าหมาย / ความกว้างตำบลระเบิด
    sweeps = Math.ceil(w / r);
    // จำนวนมุมยิง = ความลึกเป้าหมาย / ความลึกตำบลระเบิด
    zones = Math.ceil(d / r);
  }

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Spatial Engagement (การยิงพื้นที่ขนาดใหญ่)
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[10px] text-emerald-500/70 uppercase">Target Width (เมตร)</label>
          <input type="text" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] text-emerald-500/70 uppercase">Target Depth (เมตร)</label>
          <input type="text" value={depth} onChange={e => setDepth(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] text-emerald-500/70 uppercase">Burst Width/Depth (รัศมีทำลาย/เมตร)</label>
        <input type="text" value={radius} onChange={e => setRadius(e.target.value)} className="w-full bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 font-mono text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-center">
        <div>
          <div className="text-[10px] text-cyan-500 uppercase">Sweeping (กวาดข้าง)</div>
          <div className="text-xl font-mono text-cyan-300 mt-1">{sweeps} <span className="text-xs">มุมทิศ</span></div>
        </div>
        <div>
          <div className="text-[10px] text-cyan-500 uppercase">Zone Fire (สาดลึก)</div>
          <div className="text-xl font-mono text-cyan-300 mt-1">{zones} <span className="text-xs">มุมยิง</span></div>
        </div>
      </div>
      
      {sweeps > 0 && zones > 0 && (
        <div className="text-[10px] text-emerald-500/70 mt-2 p-2 bg-black/40 rounded border border-emerald-900/50">
          คำสั่งยิง: "ยิงเป็นเขต {zones} ระดับ, กวาดทางข้าง {sweeps} นัด"
        </div>
      )}
    </div>
  );
};
