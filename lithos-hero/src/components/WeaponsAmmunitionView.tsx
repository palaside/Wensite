import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type WA_Tab = 'fuze' | 'ammo' | 'safety';

interface WeaponsAmmunitionViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialTab?: WA_Tab;
}

export const WeaponsAmmunitionView: React.FC<WeaponsAmmunitionViewProps> = ({ isVisible, onClose, initialTab = 'fuze' }) => {
  const [activeTab, setActiveTab] = useState<WA_Tab>(initialTab);

  useEffect(() => {
    if (isVisible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isVisible, initialTab]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col font-mono text-emerald-500 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-emerald-900/50 bg-black/50 gap-4 sm:gap-0 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onClose}
            className="text-emerald-500 hover:text-emerald-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 className="text-lg sm:text-xl font-bold tracking-widest uppercase text-emerald-300 truncate">Weapons & Ammo</h2>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('fuze')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded border transition-colors ${activeTab === 'fuze' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'border-emerald-900/50 text-emerald-700 hover:border-emerald-700'}`}
          >
            Fuze
          </button>
          <button 
            onClick={() => setActiveTab('ammo')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded border transition-colors ${activeTab === 'ammo' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'border-emerald-900/50 text-emerald-700 hover:border-emerald-700'}`}
          >
            Ammo
          </button>
          <button 
            onClick={() => setActiveTab('safety')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded border transition-colors ${activeTab === 'safety' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'border-emerald-900/50 text-emerald-700 hover:border-emerald-700'}`}
          >
            Safety
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-2 sm:p-4 relative min-h-0 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'fuze' && <FuzeSystemView key="fuze" />}
          {activeTab === 'ammo' && <AmmunitionSystemView key="ammo" />}
          {activeTab === 'safety' && <WeaponSafetyView key="safety" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// -----------------------------------------
// FUZE SYSTEM
// -----------------------------------------
const FuzeSystemView = () => {
  const [fuzeType, setFuzeType] = useState<string>('M564');
  const [timeSetting, setTimeSetting] = useState<string>('');
  const [feedback, setFeedback] = useState<{message: string, type: 'info'|'warning'|'error'|'success'} | null>(null);

  const handleSetTime = () => {
    const time = parseFloat(timeSetting);
    
    // M564 Logic
    if (fuzeType === 'M564') {
      if (isNaN(time)) {
        setFeedback({ message: 'ระบุเวลาเป็นตัวเลข', type: 'error' });
        return;
      }
      if (time >= 93.5 && time <= 95.5) {
         setFeedback({ message: 'ตำแหน่ง SAFE - ล็อคลานนาฬิกาสำเร็จ', type: 'success' });
      } else if (time === 98.0 || time === 90.0) {
         setFeedback({ message: 'ตำแหน่ง SQ (ชนวนไว) - พร้อมทำงานเมื่อกระทบเป้า', type: 'success' });
      } else {
         const seconds = Math.floor(time);
         const decimal = Math.round((time - seconds) * 10);
         setFeedback({ 
           message: `หมุน "ตามเข็มนาฬิกา" (Vernier Scale) \n- ให้ขีด '0' ด้านล่างอยู่ระหว่างเลข ${seconds} กับ ${seconds+1} ด้านบน\n- ให้ขีด '${decimal}' ด้านล่างตรงกับเส้นสเกลด้านบนพอดีเป๊ะ`, 
           type: 'info' 
         });
      }
    }
    // M577 / M582 Logic
    else if (fuzeType === 'M577' || fuzeType === 'M582') {
      if (isNaN(time)) {
        setFeedback({ message: 'ระบุเวลาเป็นตัวเลข', type: 'error' });
        return;
      }
      if (time >= 93.5 && time <= 95.5) {
         setFeedback({ message: 'ตำแหน่ง SAFE - ล็อคลานนาฬิกาสำเร็จ', type: 'success' });
      } else if (time === 98.0) {
         setFeedback({ message: 'ตำแหน่ง PD (Point Detonating) - พร้อมทำงานเมื่อกระทบเป้า', type: 'success' });
      } else {
         setFeedback({ 
           message: `ใช้เครื่องตั้งชนวน! \n1. หมุน "ทวนเข็มนาฬิกา" เคลียร์ค่าไปที่ '000' ก่อนเสมอ\n2. หมุนทวนเข็มนาฬิกาต่อไปที่ ${time} วินาที`, 
           type: 'info' 
         });
      }
    }
    // M138 Logic
    else if (fuzeType === 'M138') {
      if (isNaN(time)) {
        setFeedback({ message: 'ระบุเวลาเป็นตัวเลข', type: 'error' });
        return;
      }
      if (time === 199.5) {
         setFeedback({ message: 'โหมดชนวนไว (SQ) - สมองกลอิเล็กทรอนิกส์พร้อมทำงานเมื่อกระทบ', type: 'success' });
      } else {
         const hundredsTens = Math.floor(time / 10) * 10;
         const units = Math.floor(time) % 10;
         const decimal = (time - Math.floor(time)).toFixed(1).substring(2);
         setFeedback({ 
           message: `วงหน้าปัดแบบอิเล็กทรอนิกส์ 3 วง (หมุนทวนเข็มนาฬิกา):\n- วงที่ 1: ตั้งไปที่ ${hundredsTens} (วงเล็กจะหมุนตาม)\n- วงที่ 2: ตั้งไปที่ ${units} (วงทศนิยมจะหมุนตาม)\n- วงที่ 3: ตั้งทศนิยมไปที่ 0.${decimal}`, 
           type: 'info' 
         });
      }
    }
    // VT Logic
    else if (['M513', 'M514', 'M728', 'M732'].includes(fuzeType)) {
       if (fuzeType === 'M728') {
          setFeedback({ message: 'M728 VT Fuze: สมองกลจะสั่งจุดระเบิดที่ความสูง HOB = 20 เมตร เสมอ\nคำเตือน: ต้องควักดินประจุเพิ่มเติม (Supplementary Charge) ออกก่อนประกอบชนวนเสมอ!', type: 'warning' });
       } else if (fuzeType === 'M732') {
          setFeedback({ message: 'M732 VT Fuze: สมองกลจะสั่งจุดระเบิดที่ความสูง HOB = 8-9 เมตร เสมอ\nคำเตือน: ต้องควักดินประจุเพิ่มเติม (Supplementary Charge) ออกก่อนประกอบชนวนเสมอ!', type: 'warning' });
       } else {
          setFeedback({ message: `${fuzeType} VT Fuze: ตั้งเวลาหน่วงวงจร (Arming Time) เพื่อเปิดเซนเซอร์ (ตั้งได้ 5-100 วินาที)\nระบบคำนวณค่า: ${time} วินาที\nคำเตือน: ต้องควักดินประจุเพิ่มเติม (Supplementary Charge) ออกก่อนประกอบชนวนเสมอ!`, type: 'warning' });
       }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-emerald-400 border-b border-emerald-900/50 pb-2">Fuze Dial Logic Center</h3>
        <p className="text-sm opacity-70 mb-6">ระบบจำลองตรรกะการตั้งมาตราเวลาชนวนและสเกลฟันเฟือง (Vernier / Electronic / VT)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Fuze Model</label>
            <select 
              value={fuzeType} 
              onChange={(e) => {
                setFuzeType(e.target.value);
                setFeedback(null);
              }}
              className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400 outline-none focus:border-emerald-500"
            >
              <option value="M564">M564 (Vernier Scale)</option>
              <option value="M577">M577 (Fuze Setter)</option>
              <option value="M582">M582 (Fuze Setter)</option>
              <option value="M138">M138 (Electronic Time)</option>
              <option value="M513">M513 (VT Proximity)</option>
              <option value="M514">M514 (VT Proximity)</option>
              <option value="M728">M728 (VT Proximity)</option>
              <option value="M732">M732 (VT Proximity)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Time (Seconds)</label>
            <input 
              type="number" 
              step="0.1"
              value={timeSetting}
              onChange={(e) => setTimeSetting(e.target.value)}
              className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400 outline-none focus:border-emerald-500"
              placeholder={['M728', 'M732'].includes(fuzeType) ? 'N/A for this VT' : 'e.g. 15.7'}
              disabled={['M728', 'M732'].includes(fuzeType)}
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleSetTime}
              className="w-full bg-emerald-900/50 hover:bg-emerald-800/50 border border-emerald-500 text-emerald-400 font-bold py-2 rounded transition-colors uppercase tracking-wider"
            >
              Calculate Logic
            </button>
          </div>
        </div>

        {feedback && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-lg border flex flex-col gap-2 ${
            feedback.type === 'error' ? 'bg-red-950/50 border-red-900 text-red-400' :
            feedback.type === 'warning' ? 'bg-orange-950/50 border-orange-900 text-orange-400' :
            feedback.type === 'success' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' :
            'bg-cyan-950/50 border-cyan-900 text-cyan-400'
          }`}>
            <div className="font-bold uppercase tracking-wider border-b border-current/20 pb-1">Dial Instruction</div>
            <div className="whitespace-pre-line text-sm opacity-90 leading-relaxed pt-1">
              {feedback.message}
            </div>
          </motion.div>
        )}
      </div>

      {/* Logic Constants Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-emerald-900/30 rounded bg-black/40 shadow-inner">
           <div className="font-bold text-emerald-500 mb-2 border-b border-emerald-900/50 pb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             Safety Constants
           </div>
           <ul className="text-sm opacity-70 space-y-2 list-disc pl-4 mt-2">
             <li><strong className="text-emerald-400">M564:</strong> SAFE = 93.5 - 95.5s</li>
             <li><strong className="text-emerald-400">M564:</strong> SQ = 98.0s (ล๊อต 1969 = 90s, ล๊อต 1970 = หมุน 1 รอบไปที่ S)</li>
             <li><strong className="text-emerald-400">M577/M582:</strong> SAFE = 93.5 - 95.5s, PD = 98.0s</li>
             <li><strong className="text-emerald-400">M138:</strong> SQ = 199.5s</li>
           </ul>
        </div>
        <div className="p-4 border border-emerald-900/30 rounded bg-black/40 shadow-inner">
           <div className="font-bold text-emerald-500 mb-2 border-b border-emerald-900/50 pb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
             Rotation Rules
           </div>
           <ul className="text-sm opacity-70 space-y-2 list-disc pl-4 mt-2">
             <li><strong className="text-red-400">M564:</strong> Clockwise ONLY. Never counter-clockwise.</li>
             <li><strong className="text-cyan-400">M577/M582/M138:</strong> Counter-clockwise ONLY.</li>
             <li><strong className="text-cyan-400">M577/M582:</strong> Zero to 000 before setting.</li>
           </ul>
        </div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------
// AMMUNITION SYSTEM
// -----------------------------------------
const AmmunitionSystemView = () => {
  const [caliber, setCaliber] = useState<string>('155');
  const [ammoType, setAmmoType] = useState<string>('DPICM_M483A1');
  const [rounds, setRounds] = useState<number>(1);
  const [terrain, setTerrain] = useState<string>('normal');
  const [hobAdjustments, setHobAdjustments] = useState<number[]>([]);
  const [currentHobAdj, setCurrentHobAdj] = useState<string>('');

  const getSubmunitionMultiplier = () => {
     if (caliber === '105' && ammoType.includes('M39')) return 18;
     if (caliber === '105' && ammoType.includes('M444')) return 18;
     if (caliber === '155' && ammoType.includes('M449')) return 60;
     if (caliber === '155' && ammoType.includes('M483A1')) return 88;
     if (caliber === '203' && ammoType.includes('M404')) return 104;
     if (caliber === '203' && ammoType.includes('M509')) return 180;
     return 0;
  };

  const handleAddHob = () => {
     const val = parseInt(currentHobAdj);
     if (isNaN(val) || val <= 0) return;
     if (val > 50) {
       alert("Error: HOB correction cannot exceed 50m per adjustment!");
       return;
     }
     const sum = hobAdjustments.reduce((a,b)=>a+b, 0);
     if (sum + val > 100) {
       alert("Error: Total HOB correction cannot exceed 100m!");
       return;
     }
     setHobAdjustments([...hobAdjustments, val]);
     setCurrentHobAdj('');
  };

  const isDudRisk = ['forest', 'steep', 'swamp', 'snow'].includes(terrain);
  const subCount = getSubmunitionMultiplier();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Payload Calculator */}
      <div className="glass-panel p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-emerald-400 border-b border-emerald-900/50 pb-2">ICM Payload Calculator</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Caliber</label>
            <select value={caliber} onChange={(e) => setCaliber(e.target.value)} className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400">
              <option value="105">105 mm</option>
              <option value="155">155 mm</option>
              <option value="203">203 mm</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Munition</label>
            <select value={ammoType} onChange={(e) => setAmmoType(e.target.value)} className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400">
              {caliber === '105' && <><option value="APICM_M39">APICM M39</option><option value="APICM_M444">APICM M444</option></>}
              {caliber === '155' && <><option value="APICM_M449">APICM M449</option><option value="DPICM_M483A1">DPICM M483A1</option></>}
              {caliber === '203' && <><option value="APICM_M404">APICM M404</option><option value="DPICM_M509">DPICM M509</option></>}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Number of Rounds</label>
            <input type="number" min="1" value={rounds} onChange={(e) => setRounds(parseInt(e.target.value)||1)} className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-wider uppercase text-emerald-500">Terrain Target</label>
            <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400">
              <option value="normal">Normal / Hard Dirt</option>
              <option value="forest">Forest / Jungle</option>
              <option value="steep">Steep Slope (&gt;60%)</option>
              <option value="swamp">Swamp / Mud</option>
              <option value="snow">Heavy Snow</option>
            </select>
          </div>
        </div>

        <div className="bg-black/40 border border-emerald-900/50 p-6 rounded-lg flex items-center justify-between">
           <div>
             <div className="text-sm opacity-70 uppercase tracking-widest mb-1 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               Total Submunition Payload
             </div>
             <div className="text-3xl md:text-5xl font-black text-emerald-400 my-2">{subCount * rounds} <span className="text-lg font-bold text-emerald-600 uppercase">grenades</span></div>
             <div className="text-xs opacity-50 font-bold tracking-wider text-emerald-500">Multiplier: {subCount} per round</div>
           </div>
           
           {isDudRisk && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-orange-950/50 border border-orange-900 text-orange-400 p-4 rounded max-w-xs text-sm shadow-lg shadow-orange-900/20">
               <div className="font-bold uppercase mb-1 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 Environmental Lock
               </div>
               High dud rate risk (2-3% or more) due to soft/slanted terrain preventing bouncing/detonation.
             </motion.div>
           )}
        </div>
      </div>

      {/* Tactical Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl">
           <h4 className="font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
             HOB Adjustment Tracker
           </h4>
           
           <div className="flex gap-2 mb-4 mt-4">
             <input type="number" value={currentHobAdj} onChange={(e) => setCurrentHobAdj(e.target.value)} placeholder="+ Add Correction (m)" className="flex-1 bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-400 text-sm outline-none focus:border-emerald-500" />
             <button onClick={handleAddHob} className="bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-500 px-4 rounded text-sm text-emerald-300 transition-colors uppercase font-bold tracking-wider">Add</button>
           </div>
           
           <div className="space-y-2 mb-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
             {hobAdjustments.length === 0 && <div className="text-xs opacity-50 italic text-center py-2">No adjustments yet</div>}
             {hobAdjustments.map((v, i) => (
               <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex justify-between text-sm bg-black/40 border border-emerald-900/30 p-2 rounded">
                 <span className="opacity-70">Correction #{i+1}</span>
                 <span className="text-emerald-400 font-bold">+{v}m</span>
               </motion.div>
             ))}
           </div>
           
           <div className="flex justify-between font-bold border-t border-emerald-900/50 pt-3">
             <span className="uppercase text-xs tracking-widest text-emerald-500">Total Adjustment</span>
             <span className={hobAdjustments.reduce((a,b)=>a+b, 0) > 80 ? 'text-orange-400' : 'text-emerald-400'}>
               +{hobAdjustments.reduce((a,b)=>a+b, 0)}m / 100m
             </span>
           </div>
           <div className="flex justify-end">
             <button onClick={() => setHobAdjustments([])} className="text-xs text-emerald-600 hover:text-emerald-400 mt-2 underline tracking-wider">Reset Tracker</button>
           </div>
        </div>

        <div className="glass-panel p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl">
           <h4 className="font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             Safety Limits (Hard Locks)
           </h4>
           <ul className="text-sm opacity-80 space-y-4 list-disc pl-4 mt-4">
             <li><strong className="text-red-400 font-bold">Friendly Danger Close:</strong> ICM firing strictly prohibited closer than 600m to friendly troops.</li>
             <li><strong className="text-emerald-400 font-bold">Azimuth Limit:</strong> Do not adjust if azimuth error is &lt; 50m.</li>
             <li><strong className="text-emerald-400 font-bold">Range Limit:</strong> Do not adjust if range error is &lt; 100m (due to wide payload spread).</li>
           </ul>
        </div>
      </div>
    </motion.div>
  );
};

// -----------------------------------------
// WEAPON SAFETY SYSTEM
// -----------------------------------------
const WeaponSafetyView = () => {
  const [tubeState, setTubeState] = useState<'normal' | 'hot'>('normal');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleStartMisfire = () => {
    setTimeLeft(tubeState === 'hot' ? 300 : 60); // 5 mins vs 1 min
    setTimerRunning(true);
  };

  const handleClearMisfire = () => {
    setTimerRunning(false);
    setTimeLeft(0);
  };

  const isEvacuate = tubeState === 'hot' && timeLeft === 0 && timerRunning === false; // timer finished

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-4xl mx-auto h-full relative">
      {/* Evacuation Alert Overlay */}
      <AnimatePresence>
      {isEvacuate && (
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-red-950/95 flex flex-col items-center justify-center p-8 text-center border-4 border-red-500 rounded-2xl shadow-[0_0_100px_rgba(239,68,68,0.5)]">
            <div className="absolute inset-0 bg-[url('/bg-reveal.png')] opacity-20 mix-blend-overlay"></div>
            <svg className="w-32 h-32 text-red-500 mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">Evacuate 50 Meters!</h1>
            <p className="text-2xl text-red-300 mb-12 font-bold tracking-widest uppercase">Cook-off Imminent - Wait for EOD</p>
            <button onClick={handleClearMisfire} className="relative z-10 px-8 py-4 bg-black/80 border-2 border-red-500 text-red-400 hover:text-white font-bold rounded-lg hover:bg-red-900 transition-colors uppercase tracking-widest">
              Acknowledge & Reset
            </button>
         </motion.div>
      )}
      </AnimatePresence>

      {/* Misfire Timer */}
      <div className={`glass-panel p-8 border-2 rounded-xl transition-colors duration-1000 ${timerRunning ? (tubeState === 'hot' ? 'border-red-500 bg-red-950/30' : 'border-orange-500 bg-orange-950/30') : 'border-emerald-900/50 bg-emerald-950/20'}`}>
         <div className="flex justify-between items-start mb-6 border-b border-current/20 pb-4">
           <div>
             <h3 className="text-2xl font-bold mb-1 text-emerald-400">Misfire Protocol Center</h3>
             <p className="text-sm opacity-70">Checkfire / Cook-off timers and safety logic</p>
           </div>
           
           <div className="flex gap-2 bg-black/50 p-1 rounded-lg">
             <button onClick={() => setTubeState('normal')} disabled={timerRunning} className={`px-4 py-2 rounded text-sm font-bold transition-colors uppercase tracking-wider ${tubeState === 'normal' ? 'bg-emerald-900/80 text-emerald-300' : 'text-emerald-700 hover:text-emerald-500'}`}>Cold Tube</button>
             <button onClick={() => setTubeState('hot')} disabled={timerRunning} className={`px-4 py-2 rounded text-sm font-bold transition-colors uppercase tracking-wider ${tubeState === 'hot' ? 'bg-red-900/80 text-red-300' : 'text-emerald-700 hover:text-red-500'}`}>Hot Tube</button>
           </div>
         </div>

         <div className="flex flex-col items-center justify-center py-12">
            <div className={`text-3xl sm:text-4xl md:text-6xl sm:text-5xl md:text-8xl md:text-[10rem] font-black leading-none font-mono tracking-tighter mb-8 drop-shadow-2xl ${timerRunning ? (tubeState === 'hot' ? 'text-red-500 animate-[pulse_1s_ease-in-out_infinite]' : 'text-orange-500 animate-[pulse_2s_ease-in-out_infinite]') : 'text-emerald-900/50'}`}>
              {timerRunning || timeLeft > 0 ? formatTime(timeLeft) : (tubeState === 'hot' ? '5:00' : '1:00')}
            </div>
            
            <div className="text-center mb-12 h-12 flex items-center justify-center">
               {timerRunning && tubeState === 'normal' && <p className="text-orange-400 font-bold uppercase text-xl tracking-widest bg-orange-950/50 px-6 py-2 rounded-full border border-orange-900">Do NOT open breech. Wait for 1 min hangfire check.</p>}
               {timerRunning && tubeState === 'hot' && <p className="text-red-400 font-bold uppercase text-xl tracking-widest bg-red-950/50 px-6 py-2 rounded-full border border-red-900">Attempt to re-fire or extract round immediately!</p>}
               {!timerRunning && <p className="text-emerald-600/50 font-bold uppercase tracking-widest text-xl">System Ready</p>}
            </div>

            <div className="flex gap-6 w-full justify-center">
              {!timerRunning && timeLeft === 0 ? (
                <button onClick={handleStartMisfire} className={`px-4 md:px-10 py-5 font-bold rounded-lg uppercase tracking-widest transition-all text-lg border-2 ${tubeState === 'hot' ? 'bg-red-900/50 hover:bg-red-800 border-red-500 text-red-300' : 'bg-orange-900/50 hover:bg-orange-800 border-orange-500 text-orange-300'}`}>
                  Trigger Misfire
                </button>
              ) : (
                <button onClick={handleClearMisfire} className="px-4 md:px-10 py-5 bg-emerald-900/50 hover:bg-emerald-800/80 border-2 border-emerald-500 text-emerald-300 font-bold rounded-lg uppercase tracking-widest transition-all text-lg">
                  Clear Status / Round Extracted
                </button>
              )}
            </div>
         </div>
      </div>

      {/* Propellant Disposal Checklist */}
      <div className="glass-panel p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl">
         <h4 className="font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2 flex items-center gap-2">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
           Propellant Disposal Rule (การทำลายส่วนบรรจุ)
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
           <div className="flex items-start gap-3 bg-black/40 p-3 rounded border border-emerald-900/30">
             <div className="text-emerald-500 mt-0.5">▪</div>
             <div className="text-sm opacity-80"><strong className="text-emerald-400">10 Meters:</strong> Pit must be at least 10m away from the gun section.</div>
           </div>
           <div className="flex items-start gap-3 bg-black/40 p-3 rounded border border-emerald-900/30">
             <div className="text-emerald-500 mt-0.5">▪</div>
             <div className="text-sm opacity-80"><strong className="text-emerald-400">100 Meters:</strong> Burning site must be at least 100m away from installations/guns.</div>
           </div>
           <div className="flex items-start gap-3 bg-black/40 p-3 rounded border border-emerald-900/30">
             <div className="text-emerald-500 mt-0.5">▪</div>
             <div className="text-sm opacity-80"><strong className="text-emerald-400">1 Foot Max:</strong> Propellant must be laid in a single row, maximum 1 foot wide.</div>
           </div>
           <div className="flex items-start gap-3 bg-black/40 p-3 rounded border border-emerald-900/30">
             <div className="text-emerald-500 mt-0.5">▪</div>
             <div className="text-sm opacity-80"><strong className="text-emerald-400">Upwind:</strong> Ignite from the upwind direction only.</div>
           </div>
         </div>
      </div>
    </motion.div>
  );
};
