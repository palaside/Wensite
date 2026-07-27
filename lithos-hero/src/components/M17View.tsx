import React from 'react';
import { useReportContext } from '../context/ReportContext';
import { ReportView } from './ReportView';
import { M17PlottingBoard } from './M17PlottingBoard';
import { MapView } from './MapView';

interface M17ViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export const M17View = ({ isVisible, onClose }: M17ViewProps) => {
  const { allGuns, section3Data, mainGun } = useReportContext();

  if (!isVisible) return null;

  // Grid logic
  const ticks = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];

  const guns = allGuns.map(gun => {
    const d = section3Data[gun];
    return {
      id: gun,
      label: gun === mainGun ? 'ศก.ร้อย' : `ป.หมู่ ${gun}`,
      offset: {
        lr: d?.lrText || 'ขวา',
        lrDist: parseInt(d?.lrDist) || 0,
        fb: d?.frText || 'หน้า',
        fbDist: parseInt(d?.frDist) || 0
      }
    };
  });

  return (
    <div className={`absolute inset-0 z-[110] flex overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#020508] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/bg-dark.png')] bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none" />
      
      {/* Main Split Layout */}
      <div className="relative w-full h-full flex z-10">
        
        {/* Left Side: Report View (50% width) */}
        <div className={`w-[50%] h-full flex flex-col transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'} bg-[#050a0f]/90 backdrop-blur-3xl border-r border-white/10 shadow-2xl`}>
          <ReportView isVisible={true} onClose={() => {}} isEmbedded={true} />
        </div>

        {/* Right Side: M.17 Layouts (50% width) */}
        <div className="w-[50%] h-full flex flex-col relative z-20">
          
          {/* Header Close Button */}
          <div className="absolute top-4 right-4 z-[200]">
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
          </div>

          {/* Top Half: Grid + Summary */}
          <div className="h-[45%] flex border-b border-white/10 p-4 gap-4">
             {/* Top Left: Grid */}
             <div className="w-[50%] h-full bg-[#03060a]/50 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center p-2 pt-8">
                <svg viewBox="-600 -600 1200 1200" className="w-full h-full">
                  {/* Background */}
                  <rect x="-600" y="-600" width="1200" height="1200" fill="transparent" />

                  {/* Grid Lines */}
                  {ticks.map(tick => (
                    <g key={`grid-${tick}`}>
                      <line x1={tick} y1="-500" x2={tick} y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                      <line x1="-500" y1={tick} x2="500" y2={tick} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    </g>
                  ))}

                  {/* X-Axis (Red horizontal line) */}
                  <line x1="-500" y1="0" x2="500" y2="0" stroke="#ef4444" strokeWidth="2" />
                  
                  {/* Y-Axis (White vertical arrow) */}
                  <line x1="0" y1="0" x2="0" y2="-480" stroke="white" strokeWidth="4" />
                  <polygon points="-10,-480 10,-480 0,-520" fill="white" />
                  <text x="20" y="-470" fill="white" fontSize="40" fontFamily="sans-serif" fontWeight="bold" textAnchor="start">
                    ทิศทางยิง
                  </text>

                  {/* Labels */}
                  {ticks.map(tick => (
                    <text key={`xlabel-${tick}`} x={tick} y="550" fill="rgba(255,255,255,0.4)" fontSize="40" fontFamily="sans-serif" textAnchor="middle">
                      {Math.abs(tick / 10)}
                    </text>
                  ))}
                  {ticks.map(tick => {
                    if (tick === 0) return null;
                    return (
                      <g key={`ylabel-${tick}`}>
                        <text x="-540" y={tick + 14} fill="rgba(255,255,255,0.4)" fontSize="40" fontFamily="sans-serif" textAnchor="end">{Math.abs(tick / 10)}</text>
                        <text x="540" y={tick + 14} fill="rgba(255,255,255,0.4)" fontSize="40" fontFamily="sans-serif" textAnchor="start">{Math.abs(tick / 10)}</text>
                      </g>
                    );
                  })}

                  {/* Plotting Guns */}
                  {guns.map(gun => {
                    const rawX = gun.offset.lr === 'ซ้าย' ? -gun.offset.lrDist : gun.offset.lrDist;
                    const rawY = gun.offset.fb === 'หลัง' ? -gun.offset.fbDist : gun.offset.fbDist;
                    const svgX = rawX * 10;
                    const svgY = -rawY * 10;

                    let gunColor = '#10b981';
                    if (gun.id === 1) gunColor = '#ef4444';
                    else if (gun.id === 2) gunColor = 'white'; // Used white for visibility
                    else if (gun.id === 3) gunColor = '#3b82f6';
                    else if (gun.id === 4) gunColor = '#f97316';

                    return (
                      <g key={`gun-${gun.id}`}>
                        <circle cx={svgX} cy={svgY} r="10" fill={gunColor} stroke="white" strokeWidth="2" />
                        <text x={svgX + 24} y={svgY + 12} fill="white" fontSize="40" fontFamily="sans-serif" fontWeight="bold">{gun.label}</text>
                      </g>
                    );
                  })}
                </svg>
             </div>
             
             {/* Top Right: Summary Data List */}
             <div className="w-[50%] h-full bg-[#03060a]/50 rounded-2xl border border-white/5 p-4 flex flex-col pt-12 relative overflow-hidden">
                <div className="flex flex-col gap-1 sm:gap-3 overflow-hidden shrink-0 max-h-full">
                  {allGuns.map((gun) => {
                    const d = section3Data[gun];
                    const isCenter = gun === mainGun;
                    return (
                      <div key={`summary-box-${gun}`} className={`flex items-center justify-between px-6 py-4 bg-[#0a0f1d]/80 backdrop-blur-md border ${isCenter ? 'border-emerald-500/40' : 'border-white/5'} rounded-xl`}>
                         <div className="text-slate-400 text-[14px] font-light whitespace-nowrap">จาก ศก.ร้อย ถึง <span className="text-white font-bold">{isCenter ? 'ศก.ร้อย:' : `ป.หมู่ ${gun}:`}</span></div>
                         
                         <div className="flex items-center gap-3">
                           <span className="text-slate-400 text-[14px] font-light">มุมทิศ</span>
                           <span className="text-emerald-400 font-bold text-sm sm:text-lg md:text-[24px] font-mono w-16 text-center drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{d?.azimuth || '0000'}</span>
                         </div>

                         <div className="flex items-center gap-3">
                           <span className="text-slate-400 text-[14px] font-light">ระยะ</span>
                           <span className="text-emerald-400 font-bold text-sm sm:text-lg md:text-[24px] font-mono w-12 text-center drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{d?.distance || '0'}</span>
                         </div>

                         <div className="flex flex-col items-center justify-center text-slate-500 font-light text-[11px] leading-tight px-2">
                           <span>ระยะลด</span>
                           <span>เหลื่อม</span>
                         </div>

                         <div className="flex items-center gap-2">
                           <span className="text-slate-400 text-[14px] font-light">{d?.frText === '-' ? 'หน้า/หลัง' : d?.frText}</span>
                           <span className="text-emerald-400 font-bold text-sm sm:text-lg md:text-[24px] font-mono w-10 text-center drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{d?.frDist === '0' ? '-' : d?.frDist}</span>
                         </div>

                         <div className="flex items-center gap-2">
                           <span className="text-slate-400 text-[14px] font-light">{d?.lrText === '-' ? 'ซ้าย/ขวา' : d?.lrText}</span>
                           <span className="text-emerald-400 font-bold text-sm sm:text-lg md:text-[24px] font-mono w-10 text-center drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{d?.lrDist === '0' ? '-' : d?.lrDist}</span>
                         </div>
                      </div>
                    );
                  })}
                </div>
                {/* Embedded MapView in the remaining space of the red box */}
                <div className="flex-1 mt-4 relative w-full h-full min-h-[250px] rounded-2xl overflow-hidden shadow-inner shadow-black/50 border border-emerald-500/20 bg-black/50">
                  <MapView isVisible={true} customPositionClass="absolute inset-0 flex flex-col overflow-hidden" />
                </div>
             </div>
          </div>

          {/* Bottom Half: Interactive Board */}
          <div className="h-[55%] relative flex items-center justify-center bg-[#0a0f1d]/40 overflow-hidden backdrop-blur-sm p-4">
             {/* Scaled container to fit the M17 board */}
             <div className="relative flex items-center justify-center w-full h-full">
                <M17PlottingBoard isEmbedded={true} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

