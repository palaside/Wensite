# Final 4 Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง 4 โมดูลสุดท้าย (Linear Interpolation, Vector Splitting, Individual Gun, Firing Log) ให้สมบูรณ์แบบ Standalone Calculator พร้อม UI/UX แบบ Visual-Heavy
**Architecture:** สร้าง React Component แยกสำหรับแต่ละโมดูล นำไปผูกกับ `FDCDesktopManager` ที่สร้างไว้ในเฟสก่อนหน้า โดยใช้ CSS/SVG พื้นฐานในการสร้าง Visual Aids
**Tech Stack:** React, Tailwind CSS, Framer Motion (ที่มีอยู่ในโปรเจกต์แล้ว)

## Global Constraints
- ทุกโมดูลต้องเป็น Standalone (ไม่ดึงค่าแบบอัตโนมัติจากโมดูลอื่น ยกเว้นค่า Default จาก FDCContext)
- ห้ามดัดแปลง `FDCDesktopManager.tsx` ในส่วนที่ไม่เกี่ยวข้องกับการเพิ่ม 4 เคสนี้

---

### Task 1: Linear Interpolation Module
**Files:**
- Create: `src/components/modules/LinearInterpolationModule.tsx`
- Modify: `src/components/FDCDesktopManager.tsx`

**Interfaces:**
- Consumes: none
- Produces: React Component `<LinearInterpolationModule />`

- [ ] **Step 1: Write minimal implementation**
```tsx
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
```

- [ ] **Step 2: Add to Desktop Manager**
Modify `src/components/FDCDesktopManager.tsx` to import `LinearInterpolationModule` and add `case 'linear_interpolation': return <LinearInterpolationModule />;`.

---

### Task 2: Vector Splitting & MET Module
**Files:**
- Create: `src/components/modules/VectorSplittingModule.tsx`
- Modify: `src/components/FDCDesktopManager.tsx`

**Interfaces:**
- Produces: React Component `<VectorSplittingModule />`

- [ ] **Step 1: Write minimal implementation**
```tsx
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

      <div className="relative w-full h-32 bg-black/40 border border-emerald-900/30 rounded-lg overflow-hidden flex items-center justify-center mt-4">
         <div className="absolute inset-0 flex items-center justify-center opacity-20">
           {/* Visual Compass Placeholder */}
           <div className="w-24 h-24 rounded-full border border-emerald-500"></div>
         </div>
         <div className="z-10 text-center">
            <div className="text-xs text-emerald-300">Crosswind: {Math.abs(cross).toFixed(1)} kts {cross > 0 ? '(Right)' : '(Left)'}</div>
            <div className="text-xs text-cyan-300 mt-2">Range: {Math.abs(rangeWind).toFixed(1)} kts {rangeWind > 0 ? '(Tail)' : '(Head)'}</div>
         </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add to Desktop Manager**
Modify `src/components/FDCDesktopManager.tsx` to handle `case 'vector_splitting':`.

---

### Task 3: Individual Gun Corrections
**Files:**
- Create: `src/components/modules/IndividualGunModule.tsx`
- Modify: `src/components/FDCDesktopManager.tsx`

**Interfaces:**
- Produces: React Component `<IndividualGunModule />`

- [ ] **Step 1: Write minimal implementation**
```tsx
import React from 'react';

export const IndividualGunModule: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Battery Diagram & Corrections
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1,2,3,4,5,6].map(gun => (
          <div key={gun} className="bg-emerald-950/40 border border-emerald-800/50 rounded p-2 text-center hover:bg-emerald-900/60 cursor-pointer">
            <div className="text-[10px] text-emerald-500/70 font-bold">PIECE {gun}</div>
            <div className="text-xs font-mono text-emerald-300 mt-1">DF: 0</div>
            <div className="text-xs font-mono text-emerald-300">EL: +0</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-gray-500 text-center mt-2">Base Piece is Piece 3. Offsets calculated visually.</div>
    </div>
  );
};
```

- [ ] **Step 2: Add to Desktop Manager**
Modify `src/components/FDCDesktopManager.tsx` to handle `case 'individual_gun':`.

---

### Task 4: Firing Log & Ammo
**Files:**
- Create: `src/components/modules/FiringLogAmmoModule.tsx`
- Modify: `src/components/FDCDesktopManager.tsx`

**Interfaces:**
- Produces: React Component `<FiringLogAmmoModule />`

- [ ] **Step 1: Write minimal implementation**
```tsx
import React, { useState } from 'react';

export const FiringLogAmmoModule: React.FC = () => {
  const [he, setHe] = useState(120);
  
  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Logistics & Ammo
      </div>
      
      <div className="bg-black/40 border border-emerald-900/30 rounded p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-emerald-400 font-bold">HE M107</span>
          <span className="text-xs font-mono text-emerald-300">{he} / 200</span>
        </div>
        <div className="w-full bg-emerald-950 h-2 rounded overflow-hidden">
          <div className="bg-emerald-500 h-full" style={{ width: `${(he/200)*100}%` }}></div>
        </div>
        <button onClick={() => setHe(h => Math.max(0, h - 1))} className="mt-2 w-full py-1 text-[10px] bg-red-900/40 text-red-400 rounded border border-red-900 hover:bg-red-800/60">
          FIRE 1 ROUND
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add to Desktop Manager**
Modify `src/components/FDCDesktopManager.tsx` to handle `case 'firing_log_ammo':`.
