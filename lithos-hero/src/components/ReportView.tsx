import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Crosshair, Map, Navigation, Target, Shield, Clock } from 'lucide-react';
import { FiringTable } from '../data/FiringTable';
import { useReportContext } from '../context/ReportContext';

const Sec2Card = ({ topLabel, bottomLabel, inputs }: any) => (
  <div className="flex items-center justify-between bg-[#0a0f1d] rounded-2xl p-3 sm:p-4 border border-white/5 shadow-lg w-full">
    <div className="flex flex-col items-center justify-center min-w-[70px] mr-2">
      <span className="text-white text-[40px] font-medium tracking-wide">{topLabel}</span>
      <div className="w-full h-[1px] bg-white/20 my-2"></div>
      <span className="text-white text-[40px] font-medium tracking-wide">{bottomLabel}</span>
    </div>
    <div className="flex gap-2 sm:gap-3 flex-1 justify-end pr-1">
      {inputs.map((inp: any, idx: number) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <span className="text-slate-200 text-[40px]">{inp.label}</span>
          {inp.isText ? (
            <div className={`py-1 text-center text-emerald-400 text-[40px] font-mono font-bold ${inp.widthClass || 'w-64'}`}>
              {inp.value !== undefined ? inp.value : inp.defaultValue}
            </div>
          ) : (
            <input
              type="number"
              value={inp.value !== undefined ? inp.value : inp.defaultValue}
              onChange={inp.onChange}
              readOnly={inp.readOnly}
              className={`bg-[#060913] border border-white/5 rounded-lg py-1 text-center text-emerald-400 text-[40px] font-mono focus:outline-none focus:border-emerald-500/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${inp.widthClass || 'w-64'} ${inp.readOnly ? 'opacity-70 pointer-events-none' : ''}`}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

interface ReportViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ isVisible, onClose }) => {
  const {
    method1, setMethod1, azimuth, setAzimuth, mainGun, setMainGun, isOverlapCenter, setIsOverlapCenter,
    centerAzimuth, setCenterAzimuth, centerAngleK, setCenterAngleK, op2Azimuth, setOp2Azimuth, op2AngleK, setOp2AngleK,
    gunAzimuths, setGunAzimuths, gunAngleKs, setGunAngleKs, gunCoverAngles, setGunCoverAngles, gunCoverDistances, setGunCoverDistances,
    centerDistance, gunDistances, allGuns, section3Data
  } = useReportContext();

  const numInputStyle = "bg-slate-900/50 border border-white/10 text-emerald-400 rounded-lg px-3 py-1 outline-none focus:border-emerald-500 font-mono w-48 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors";
  const numInputSmallStyle = "bg-slate-900/50 border border-white/10 text-emerald-400 rounded px-2 py-1 outline-none focus:border-emerald-500 font-mono w-40 text-center text-[40px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const handleGunAzimuthChange = (gun: number, value: string) => setGunAzimuths(prev => ({ ...prev, [gun]: value }));
  const handleGunAngleKChange = (gun: number, value: string) => setGunAngleKs(prev => ({ ...prev, [gun]: value }));
  const handleCoverAngleChange = (gun: number, value: string) => setGunCoverAngles(prev => ({ ...prev, [gun]: value }));
  const handleCoverDistanceChange = (gun: number, value: string) => setGunCoverDistances(prev => ({ ...prev, [gun]: value }));

  // Derived state for จำลองทิศต่อ
  let simMethod = 'OL';
  if (method1 === '2' || method1 === '3') { simMethod = 'เข็มทิศ'; } 
  else if (method1 === '4' || method1 === '5') { simMethod = '-'; }

  // Compute maximum cover angle and its distance
  const maxCoverData = useMemo(() => {
    let maxAngle = -Infinity;
    let maxGun = 1;
    
    allGuns.forEach(gun => {
      const angle = parseFloat(gunCoverAngles[gun]) || 0;
      if (angle > maxAngle) {
        maxAngle = angle;
        maxGun = gun;
      }
    });

    return {
      angle: maxAngle === -Infinity ? 0 : maxAngle,
      distance: parseFloat(gunCoverDistances[maxGun]) || 100
    };
  }, [gunCoverAngles, gunCoverDistances, allGuns]);

  // Compute Minimum QE for Section 4 (PD/Time) and Section 5 (VT)
  const minQEData = useMemo(() => {
    const dist = maxCoverData.distance; // meters
    const distKm = dist / 1000;
    const coverAngle = maxCoverData.angle; // mils
    
    const C = 5; 
    const safetyMarginRaw = C / distKm; 
    let safetyMarginMils = Math.ceil(safetyMarginRaw);
    if (safetyMarginRaw === Math.ceil(safetyMarginRaw)) {
      safetyMarginMils += 1;
    } else {
      safetyMarginMils += 1;
    }
    
    const sumAngle = coverAngle + safetyMarginMils;

    const pdData: Record<number, number[]> = {};
    const vtData: Record<number, number> = {};

    [1, 3, 4, 5, 6, 7].forEach(charge => {
      let g12Factor = 0.006;
      let f2 = 0;
      let f7 = 0;
      const roundedDist = Math.round(dist / 100) * 100;
      if (FiringTable[charge] && FiringTable[charge][roundedDist]) {
        g12Factor = FiringTable[charge][roundedDist].g12;
        f2 = FiringTable[charge][roundedDist].f2;
        f7 = FiringTable[charge][roundedDist].f7;
      }
      
      const row1 = coverAngle; 
      const row2 = safetyMarginMils; 
      
      const computedRaw = sumAngle * g12Factor;
      const row3 = Math.ceil(computedRaw); 
      
      const row4 = Math.ceil(f2); 
      const row5 = Math.ceil(2 * f7); 

      const computedTotal = row1 + row2 + row3 + row4 + row5;

      pdData[charge] = [row1, row2, row3, row4, row5, computedTotal]; 
      vtData[charge] = computedTotal; 
    });

    return { pd: pdData, vt: vtData, sumAngle: sumAngle };
  }, [maxCoverData]);

  // Common styles

  const numInputTinyStyle = "bg-slate-900/50 border border-white/10 text-emerald-400 rounded px-1 py-0.5 outline-none focus:border-emerald-500 font-mono text-[40px] w-48 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors";

  return (
    <div className={`absolute inset-0 z-[110] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 pointer-events-auto backdrop-blur-md bg-slate-900/40' : 'opacity-0 pointer-events-none'}`}>
      <div className={`relative w-[100vw] h-[100vh] max-w-none rounded-none overflow-hidden flex flex-col shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-700/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex-none px-8 py-3 border-b border-white/10 flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute top-4 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 className="text-emerald-400 text-[50px] sm:text-[60px] font-bold tracking-tight mb-2 drop-shadow-md">แบบรายงาน รอง ผบ.ร้อย ป.</h2>
          <p className="text-slate-300 text-[40px] font-medium">การคำนวณมุมยิงต่ำสุด (Calculation of the minimum shot angle)</p>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 overflow-y-auto px-0 py-4 sm:py-5 custom-scrollbar">
          <div className="space-y-4">

            {/* Section 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-[40px]">๑.</span>
                  <h4 className="text-[40px] font-bold text-white">กองร้อยตั้ง ป. ตรงทิศ วิธี</h4>
                </div>
                <div className="flex items-center gap-3">
                  <select value={method1} onChange={(e) => setMethod1(e.target.value)} className="bg-slate-900 border border-emerald-500/30 text-white rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 font-mono text-[40px]">
                    <option value="1">กองร้อยด้วยวิธีมุมตรงทิศ</option>
                    <option value="2">กองร้อยด้วยวิธีเข็มทิศ</option>
                    <option value="3">เข็มทิศ M2</option>
                    <option value="4">ที่หมายเล็งไกล</option>
                    <option value="5">หมายแนวลำกล้องปืน</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col items-center justify-center text-center gap-1"><span className="text-slate-400 text-[40px]">จำลองทิศต่อ</span><span className="text-emerald-500 font-mono font-bold text-[40px]">{simMethod}</span></div>
                <div className="flex flex-col items-center justify-center text-center gap-1"><span className="text-slate-400 text-[40px]">มุมทิศ</span><input type="number" value={azimuth} onChange={(e) => setAzimuth(e.target.value)} className={numInputStyle} placeholder="0000" /></div>
                <div className="flex flex-col items-center justify-center text-center gap-1"><span className="text-slate-400 text-[40px]">ที่ตั้งยิงกว้าง</span><span className="text-emerald-500 font-mono font-bold text-[40px]">130</span></div>
                <div className="flex flex-col items-center justify-center text-center gap-1"><span className="text-slate-400 text-[40px]">ลึก</span><span className="text-emerald-500 font-mono font-bold text-[40px]">13</span></div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-[40px]">๒.</span>
                  <h4 className="text-[40px] font-bold text-white">หลักฐานจากจุดตั้งกล้องถึงหมู่ ป. และ ศก.ร้อย</h4>
                </div>

                <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-[40px] pl-2">ป.หมู่หลัก</span>
                    <select value={mainGun} onChange={(e) => { setMainGun(Number(e.target.value)); setIsOverlapCenter(false); }} className="bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 font-mono font-bold">
                      <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                    </select>
                  </div>
                  <div className="w-px h-6 bg-white/10"></div>
                  <div className="flex items-center bg-slate-900/50 rounded-lg p-1 border border-white/5">
                    <button onClick={() => setIsOverlapCenter(true)} className={`px-4 py-1.5 rounded-md text-[40px] font-medium transition-all ${isOverlapCenter ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>ทับ ศก.ร้อย</button>
                    <button onClick={() => setIsOverlapCenter(false)} className={`px-4 py-1.5 rounded-md text-[40px] font-medium transition-all ${!isOverlapCenter ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>คลาด ศก.ร้อย</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {/* 1. ศก.ร้อย */}
                <Sec2Card 
                  topLabel="จก.1" 
                  bottomLabel="ศก.ร้อย"
                  inputs={[
                    { label: 'มุมทิศ', value: centerAzimuth, onChange: (e: any) => setCenterAzimuth(e.target.value), widthClass: 'w-48' },
                    { label: 'มุม ก.', value: centerAngleK, onChange: (e: any) => setCenterAngleK(e.target.value), widthClass: 'w-64' },
                    { label: 'ระยะ', value: centerDistance, isText: true, widthClass: 'w-40' }
                  ]}
                />

                {/* 2. จก.2 */}
                <Sec2Card 
                  topLabel="จก.1" 
                  bottomLabel="จก.2"
                  inputs={[
                    { label: 'มุมทิศ', value: op2Azimuth, onChange: (e: any) => setOp2Azimuth(e.target.value), widthClass: 'w-48' },
                    { label: 'มุม ก.', value: op2AngleK, onChange: (e: any) => setOp2AngleK(e.target.value), widthClass: 'w-64' },
                    { label: 'ระยะ', defaultValue: 68, isText: true, widthClass: 'w-40' }
                  ]}
                />

                {/* 3. ป.หมู่หลัก (แทนที่ตำแหน่ง ป.หมู่ 1 เดิม) */}
                <Sec2Card 
                  topLabel="จก.1" 
                  bottomLabel="ป.หมู่หลัก"
                  inputs={[
                    { label: 'มุมทิศ', value: gunAzimuths[mainGun] || '', onChange: (e: any) => handleGunAzimuthChange(mainGun, e.target.value), readOnly: isOverlapCenter, widthClass: 'w-48' },
                    { label: 'มุม ก.', value: gunAngleKs[mainGun] || '', onChange: (e: any) => handleGunAngleKChange(mainGun, e.target.value), widthClass: 'w-64' },
                    { label: 'ระยะ', value: gunDistances[mainGun] || '', isText: true, widthClass: 'w-40' }
                  ]}
                />

                {/* 4,5,6. ป.หมู่อื่นๆ ที่เหลือ */}
                {allGuns.filter(gun => gun !== mainGun).map(gun => (
                  <Sec2Card 
                    key={`gun-${gun}`}
                    topLabel="จก.1" 
                    bottomLabel={`ป.หมู่ ${gun}`}
                    inputs={[
                      { label: 'มุมทิศ', value: gunAzimuths[gun] || '', onChange: (e: any) => handleGunAzimuthChange(gun, e.target.value), readOnly: isOverlapCenter, widthClass: 'w-48' },
                      { label: 'มุม ก.', value: gunAngleKs[gun] || '', onChange: (e: any) => handleGunAngleKChange(gun, e.target.value), widthClass: 'w-64' },
                      { label: 'ระยะ', value: gunDistances[gun] || '', isText: true, widthClass: 'w-40' }
                    ]}
                  />
                ))}
              </div>

              {/* Section 2.1: มุมพื้นที่ยอดกำบัง */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-emerald-400 font-bold text-[40px]">๒.๑</span>
                  <h4 className="text-[40px] font-bold text-white">มุมพื้นที่ยอดกำบัง</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {allGuns.map(gun => (
                    <div key={`cover-${gun}`} className="flex items-stretch gap-3 bg-black/40 border border-white/10 p-2 rounded-lg hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center justify-center border-r border-white/10 pr-4">
                        <span className="text-white font-medium whitespace-nowrap">หมู่ {gun}</span>
                      </div>
                      <div className="flex flex-col gap-3 justify-center w-full py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-[11px] uppercase tracking-wider">มุมพื้นที่ยอดกำบัง</span>
                          <input type="number" className={numInputSmallStyle} placeholder="0" value={gunCoverAngles[gun] || ''} onChange={(e) => handleCoverAngleChange(gun, e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-[11px] uppercase tracking-wider">ระยะ</span>
                          <input type="number" className={numInputSmallStyle} value={gunCoverDistances[gun] !== undefined ? gunCoverDistances[gun] : '100'} step="100" onChange={(e) => handleCoverDistanceChange(gun, e.target.value)} onBlur={(e) => { const val = parseInt(e.target.value); if (!isNaN(val) && val > 0) { const rounded = (Math.round(val / 100) * 100).toString(); handleCoverDistanceChange(gun, rounded); e.target.value = rounded; } }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-emerald-400 font-bold text-[40px]">๓.</span>
                <h4 className="text-[40px] font-bold text-white">หลักฐานจาก ศก.ร้อย (ปล.) ถึง ป.</h4>
              </div>
              <div className="space-y-1.5">
                {allGuns.map((gun) => (
                  <div key={`sec3-${gun}`} className={`grid grid-cols-[140px_1fr_1fr] items-center gap-3 bg-black/30 border p-2 rounded-lg text-[40px] transition-colors ${gun === mainGun ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-white/5'}`}>
                    <span className="text-slate-300 font-medium whitespace-nowrap">จาก ศก.ร้อย ถึง ป.หมู่ {gun}:</span>
                    
                    {/* มุมทิศ & ระยะ */}
                    <div className="flex items-center justify-center gap-6 border-r border-white/5 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">มุมทิศ</span> 
                        <span className={`font-mono text-[50px] w-64 text-center ${isOverlapCenter && gun === mainGun ? 'text-emerald-500 font-bold' : 'text-emerald-400'}`}>
                          {section3Data[gun]?.azimuth || '0000'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">ระยะ</span> 
                        <span className="text-emerald-400 font-mono text-[50px] w-48 text-center">
                          {section3Data[gun]?.distance || '0'}
                        </span>
                      </div>
                    </div>

                    {/* ระยะลดเหลื่อม */}
                    <div className="flex items-center justify-center gap-4 pl-2">
                      <span className="text-slate-400 font-medium whitespace-nowrap">ระยะลดเหลื่อม</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium w-8 text-center">{section3Data[gun]?.frText}</span>
                        <span className="text-emerald-400 font-mono text-[50px] w-48 text-center">
                          {section3Data[gun]?.frDist || '0'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium w-6 text-center">{section3Data[gun]?.lrText}</span>
                        <span className="text-emerald-400 font-mono text-[50px] w-48 text-center">
                          {section3Data[gun]?.lrDist || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4 & 5 Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
              {/* Section 4 */}
              <div className="bg-white/5 border-y border-r border-white/10 p-0 overflow-x-auto w-full">
                <div className="flex items-center gap-3 mb-3 px-4 pt-4">
                  <span className="text-emerald-400 font-bold text-[40px]">๔.</span>
                  <h4 className="text-[40px] font-bold text-white whitespace-nowrap">หลักฐานการคำนวณมุมยิงต่ำสุดชนวนไวและเวลา</h4>
                </div>
                <table className="w-full text-center text-[40px] border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="font-normal py-2 w-48">พท.ยอดกำบัง</th>
                      <th className="font-normal py-2 border-l border-white/10 w-48">ระยะ</th>
                      <th className="font-normal py-2 border-l border-white/10 w-64">มุม</th>
                      <th className="font-normal py-2 w-64">บจ.1</th>
                      <th className="font-normal py-2 w-64">บจ.3</th>
                      <th className="font-normal py-2 w-64">บจ.4</th>
                      <th className="font-normal py-2 w-64">บจ.5</th>
                      <th className="font-normal py-2 w-64">บจ.6</th>
                      <th className="font-normal py-2 w-64">บจ.7</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-mono text-[40px]">
                    {[1, 2, 3, 4, 5, 'รวม'].map((row, idx) => (
                      <tr key={idx} className={row === 'รวม' ? "border-t border-white/10" : ""}>
                        {idx === 0 ? (
                          <>
                            <td rowSpan={5} className="py-1 border-white/10 text-[40px] font-bold text-emerald-400">{maxCoverData.angle}</td>
                            <td rowSpan={5} className="py-1 border-l border-white/10 text-[40px] font-bold text-emerald-400">{maxCoverData.distance}</td>
                            <td className="py-1 border-l border-white/10">{row}</td>
                          </>
                        ) : (row === 'รวม' ? (
                          <td colSpan={3} className="text-right pr-5 py-2 text-emerald-500 font-sans border-r-0 border-white/10">รวม</td>
                        ) : (
                          <td className="py-1 border-l border-white/10">{row}</td>
                        ))}
                        
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[1]?.[idx] || 0}</td>
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[3]?.[idx] || 0}</td>
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[4]?.[idx] || 0}</td>
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[5]?.[idx] || 0}</td>
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[6]?.[idx] || 0}</td>
                        <td className={`py-1 ${row === 'รวม' ? 'text-emerald-400 font-bold text-[50px]' : ''}`}>{minQEData.pd[7]?.[idx] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 5 */}
              <div className="bg-white/5 border-y border-l border-white/10 p-0 overflow-x-auto w-full">
                <div className="flex items-center gap-3 mb-3 px-4 pt-4">
                  <span className="text-emerald-400 font-bold text-[40px]">๕.</span>
                  <h4 className="text-[40px] font-bold text-white whitespace-nowrap">หลักฐานการคำนวณมุมยิงต่ำสุดชนวนวิถี</h4>
                </div>
                <table className="w-full text-center text-[40px] border-collapse min-w-[400px]">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="font-normal py-2 w-64"></th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.1</th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.3</th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.4</th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.5</th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.6</th>
                      <th className="font-normal py-2 w-64 text-[40px]">บจ.7</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-mono text-[40px]">
                    <tr>
                      <td className="text-right pr-5 py-2 text-emerald-500 font-sans">รวม</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[1] || 0}</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[3] || 0}</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[4] || 0}</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[5] || 0}</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[6] || 0}</td>
                      <td className="py-2 text-emerald-400 font-bold text-[50px]">{minQEData.vt[7] || 0}</td>
                    </tr>
                    <tr>
                      <td className="text-right pr-5 py-1 text-slate-400 font-sans">เวลาแล่น</td>
                      <td className="py-1">1</td><td className="py-1">0</td><td className="py-1">0</td><td className="py-1">0</td><td className="py-1">0</td><td className="py-1">0</td>
                    </tr>
                    <tr>
                      <td className="text-right pr-5 py-1 text-slate-400 font-sans text-[14px]">เวลาปลอดภัยน้อยสุด</td>
                      <td className="py-1 text-emerald-400 font-bold text-[40px]">7</td><td className="py-1 text-emerald-400 font-bold text-[40px]">6</td><td className="py-1 text-emerald-400 font-bold text-[40px]">6</td><td className="py-1 text-emerald-400 font-bold text-[40px]">6</td><td className="py-1 text-emerald-400 font-bold text-[40px]">6</td><td className="py-1 text-emerald-400 font-bold text-[40px]">6</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
