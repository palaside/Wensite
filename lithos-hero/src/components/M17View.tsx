import React from 'react';
import { useReportContext } from '../context/ReportContext';

interface M17ViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export const M17View = ({ isVisible, onClose }: M17ViewProps) => {
  const { allGuns, section3Data, isOverlapCenter, mainGun } = useReportContext();

  if (!isVisible) return null;

  // Grid logic
  // Unit grid size = 10, drawn every 10 units from -50 to 50
  // So viewBox is from -600 to 600, with scaling 10px per unit.
  const ticks = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];

  // Gun data points
  // X: Right positive, Left negative
  // Y: Front positive, Back negative
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black/80 backdrop-blur-md hero-anim hero-fade">
      <div className="relative w-[95vw] h-[95vh] bg-[#020508] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Background Image at Bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[55%] bg-cover bg-bottom opacity-60 mix-blend-screen pointer-events-none"
          style={{ 
            backgroundImage: `url('/Gemini_Generated_Image_ykvp8iykvp8iykvp.png')`, 
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)', 
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)' 
          }}
        />

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="relative pt-6 pb-4 px-6 text-center border-b border-white/5 flex-none bg-[#020508]/80 backdrop-blur-sm">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className="text-[60px] font-bold text-emerald-400 font-sans tracking-wide">แผ่นกรุย แบบ M.17</h2>
            <h3 className="text-[40px] font-medium text-white/70 font-sans mt-2 tracking-wider">
              (M17 Fire Direction Plotting Board)
            </h3>
          </div>

          {/* Main Content (Scrollable) */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center gap-6 def-scrollbar">
          
          {/* Grid Area */}
          <div className="relative w-full max-h-[65vh] aspect-square rounded-none flex items-center justify-center mx-auto">
            <svg viewBox="-600 -600 1200 1200" className="w-full h-full">
              {/* Background */}
              <rect x="-600" y="-600" width="1200" height="1200" fill="transparent" />

              {/* Grid Lines */}
              {ticks.map(tick => (
                <g key={`grid-${tick}`}>
                  {/* Vertical lines */}
                  <line 
                    x1={tick} y1="-500" 
                    x2={tick} y2="500" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="2" 
                  />
                  {/* Horizontal lines */}
                  <line 
                    x1="-500" y1={tick} 
                    x2="500" y2={tick} 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="2" 
                  />
                </g>
              ))}

              {/* X-Axis (Red horizontal line) */}
              <line x1="-500" y1="0" x2="500" y2="0" stroke="#ef4444" strokeWidth="2" />
              
              {/* Y-Axis (White vertical arrow) */}
              <line x1="0" y1="0" x2="0" y2="-480" stroke="white" strokeWidth="4" />
              <polygon points="-10,-480 10,-480 0,-520" fill="white" />
              <text 
                x="20" 
                y="-470" 
                fill="white" 
                fontSize="40" 
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="start"
              >
                ทิศทางยิง
              </text>
              

              {/* Labels - X Axis (bottom) */}
              {ticks.map(tick => (
                <text 
                  key={`xlabel-${tick}`}
                  x={tick} 
                  y="550" 
                  fill="rgba(255,255,255,0.4)" 
                  fontSize="40" 
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {Math.abs(tick / 10)}
                </text>
              ))}

              {/* Labels - Y Axis (left & right) */}
              {ticks.map(tick => {
                if (tick === 0) return null; // skip 0 for Y to prevent overlap
                return (
                  <g key={`ylabel-${tick}`}>
                    <text 
                      x="-540" 
                      y={tick + 14} 
                      fill="rgba(255,255,255,0.4)" 
                      fontSize="40" 
                      fontFamily="sans-serif"
                      textAnchor="end"
                    >
                      {Math.abs(tick / 10)}
                    </text>
                    <text 
                      x="540" 
                      y={tick + 14} 
                      fill="rgba(255,255,255,0.4)" 
                      fontSize="40" 
                      fontFamily="sans-serif"
                      textAnchor="start"
                    >
                      {Math.abs(tick / 10)}
                    </text>
                  </g>
                );
              })}

              {/* Plotting Guns */}
              {guns.map(gun => {
                // Calculate X: Right is positive, Left is negative
                const rawX = gun.offset.lr === 'ซ้าย' ? -gun.offset.lrDist : gun.offset.lrDist;
                // Calculate Y: Front is positive, Back is negative
                const rawY = gun.offset.fb === 'หลัง' ? -gun.offset.fbDist : gun.offset.fbDist;
                
                // SVG coordinates (1 unit = 10px, SVG Y is inverted)
                const svgX = rawX * 10;
                const svgY = -rawY * 10;

                // Color mapping
                let gunColor = '#10b981';
                if (gun.id === 1) gunColor = '#ef4444'; // Red
                else if (gun.id === 2) gunColor = 'black'; // Black
                else if (gun.id === 3) gunColor = '#3b82f6'; // Blue
                else if (gun.id === 4) gunColor = '#f97316'; // Orange

                return (
                  <g key={`gun-${gun.id}`}>
                    <circle 
                      cx={svgX} 
                      cy={svgY} 
                      r="10" 
                      fill={gunColor} 
                      stroke="white" 
                      strokeWidth="2" 
                    />
                    <text 
                      x={svgX + 24} 
                      y={svgY + 12} 
                      fill="white" 
                      fontSize="40" 
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {gun.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Data List (Floating Cards) */}
          <div className="w-full max-w-[1200px] flex flex-col gap-6 font-mono text-[40px] pb-10">
            {allGuns.map((gun) => {
              const d = section3Data[gun];
              const isCenter = gun === mainGun;
              return (
                <div 
                  key={`m17-data-${gun}`} 
                  className={`flex flex-col xl:flex-row items-center justify-between px-8 py-6 bg-[#03060a]/50 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] border ${isCenter ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/5'} hover:-translate-y-1 transition-transform duration-300`}
                >
                  <div className="text-white/60 w-[400px]">จาก ศก.ร้อย ถึง {isCenter ? 'ศก.ร้อย' : `ป.หมู่`} <span className="text-white font-bold">{isCenter ? '' : gun + ':'}</span></div>
                  <div className="flex items-center gap-6 w-[400px]">
                    <span className="text-white/40">มุมทิศ</span>
                    <span className="text-emerald-400 font-bold w-24">{d?.azimuth || '0000'}</span>
                    <span className="text-white/40 ml-4">ระยะ</span>
                    <span className="text-emerald-400 font-bold w-16">{d?.distance || '0'}</span>
                  </div>
                  <div className="hidden xl:block w-[2px] h-10 bg-white/10"></div>
                  <div className="flex items-center gap-6 w-[500px] justify-end">
                    <span className="text-white/40">ระยะลดเหลื่อม</span>
                    <span className="text-white/40 ml-4 w-16 text-center">{d?.frText || 'หน้า'}</span>
                    <span className="text-emerald-400 font-bold w-16">{d?.frDist || '0'}</span>
                    <span className="text-white/40 ml-4 w-16 text-center">{d?.lrText || 'ขวา'}</span>
                    <span className="text-emerald-400 font-bold w-16">{d?.lrDist || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
