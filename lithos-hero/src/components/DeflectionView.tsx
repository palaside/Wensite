import React, { useState } from 'react';
import { Target, Mountain, Triangle, Compass, ChevronRight, Activity } from 'lucide-react';
import './DeflectionView.css';

interface DeflectionViewProps {
  isVisible: boolean;
  onClose: () => void;
}

const BG_IMAGE_1 = '/bg-dark.png'; // Assuming the user overwrites this or we use the main background

// --- Sub-components for Calculators ---

const InputRow = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5">
    <span className="text-slate-300 font-medium mb-2 sm:mb-0 text-[40px]">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#04060a]/80 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-emerald-500/50 font-mono text-emerald-400 text-right w-full sm:w-64 shadow-inner text-[40px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
    />
  </div>
);

// --- Main View ---

export const DeflectionView: React.FC<DeflectionViewProps> = ({ isVisible, onClose }) => {
  const [activeCalc, setActiveCalc] = useState<number>(1);
  const [calcCount, setCalcCount] = useState(0);
  const [isFiring, setIsFiring] = useState(false);

  // States for Calc 1
  const [c1Speed, setC1Speed] = useState('30');
  const [c1Range, setC1Range] = useState('1000');
  const [c1Tof, setC1Tof] = useState('3.5');
  const [c1Result, setC1Result] = useState<number | null>(null);

  // States for Calc 2
  const [c2Base, setC2Base] = useState('50');
  const [c2Apex, setC2Apex] = useState('125');
  const [c2Result, setC2Result] = useState<{raw: number, rounded: number} | null>(null);

  // States for Calc 3
  const [c3W, setC3W] = useState('2');
  const [c3Angle, setC3Angle] = useState('10');
  const [c3Result, setC3Result] = useState<number | null>(null);

  // States for Calc 4
  const [c4MAz, setC4MAz] = useState('3200');
  const [c4Dec, setC4Dec] = useState('0');
  const [c4Result, setC4Result] = useState<string | null>(null);

  // Firing Effect Trigger
  const handleCalculate = (callback: () => void) => {
    callback();
    const newCount = calcCount + 1;
    setCalcCount(newCount);
    
    // Fire every 3rd calculation
    if (newCount % 3 === 0) {
      setIsFiring(true);
      setTimeout(() => setIsFiring(false), 2000); // Reset firing after 2s
    }
  };

  const doCalc1 = () => {
    const s = parseFloat(c1Speed) || 0;
    const r = parseFloat(c1Range) || 1;
    const t = parseFloat(c1Tof) || 0;
    const dist = (s / 3.6) * t;
    setC1Result(Math.round(dist / (r / 1000)));
  };

  const doCalc2 = () => {
    const b = parseFloat(c2Base) || 0;
    const a = parseFloat(c2Apex) || 1;
    const raw = b / (a / 1000);
    setC2Result({ raw, rounded: Math.round(raw / 100) * 100 });
  };

  const doCalc3 = () => {
    const w = parseFloat(c3W) || 0;
    const a = parseFloat(c3Angle) || 1;
    setC3Result(Math.round((w / a) * 1000));
  };

  const doCalc4 = () => {
    const m = parseFloat(c4MAz) || 0;
    const d = parseFloat(c4Dec) || 0;
    let trueAz = (m + d) % 6400;
    if (trueAz < 0) trueAz += 6400;
    setC4Result(trueAz.toString().padStart(4, '0'));
  };

  const calculators = [
    {
      id: 1, icon: Target, title: "การคำนวณมุมดัก", sub: "(เป้าหมายเคลื่อนที่)"
    },
    {
      id: 2, icon: Mountain, title: "การคำนวณระยะกำบัง", sub: "(Piece-to-Crest Range)"
    },
    {
      id: 3, icon: Triangle, title: "ฐานสามเหลี่ยมคงที่", sub: "(Subtense)"
    },
    {
      id: 4, icon: Compass, title: "มุมภาคที่ถูกต้อง", sub: "และมุมเยื้องกล้อง"
    }
  ];

  return (
    <div className={`deflection-container absolute inset-0 z-[110] flex overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Animated Background Image Container (Morph Effect) */}
      <div 
        className={`absolute w-[120%] h-[120%] -top-[10%] -left-[10%] transition-transform duration-[3s] ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'scale-100 translate-x-[15%] translate-y-[8%]' : 'scale-125 translate-x-[-5%] translate-y-[-10%]'}`}
      >
        <div 
          className={`w-full h-full def-bg-image ${isFiring ? 'bg-fire-shake' : ''}`}
          style={{ 
            backgroundImage: `url('${BG_IMAGE_1}')`,
            backgroundPosition: 'center 70%', 
            backgroundSize: 'cover'
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />
      <div className={`absolute inset-0 mix-blend-overlay pointer-events-none ${isFiring ? 'env-blast-light' : 'bg-emerald-900/10'}`} />

      {/* --- Muzzle Flash & Smoke Overlay (Positioned at top-left barrel tip) --- */}
      {isFiring && (
        <div className="muzzle-overlay absolute top-[35%] left-[45%] pointer-events-none z-0">
          <div className="img-flash-core"></div>
          <div className="img-smoke img-smoke-1"></div>
          <div className="img-smoke img-smoke-2"></div>
          <div className="img-smoke img-smoke-3"></div>
        </div>
      )}
      {/* ------------------------------------ */}

      {/* Main Split Layout */}
      <div className="relative w-full h-full flex z-10">
        
        {/* Left Side: Active Glass Panel (40% width, snapped to left edge) */}
        <div className={`w-[40%] h-full flex flex-col transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
          <div className="bg-[#050a0f]/80 backdrop-blur-3xl border-r border-white/10 shadow-2xl h-full flex flex-col overflow-hidden relative">
            
            {/* Header / Brand */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-white text-[40px] font-bold tracking-widest">TACTICAL<span className="font-light">CALC</span></h1>
              </div>
              <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Active Calculator Content */}
            <div className="flex-1 overflow-y-auto def-scrollbar p-8">
              
              {activeCalc === 1 && (
                <div className="animate-[fade-in_0.5s_ease-out]">
                  <div className="mb-10">
                    <Target className="w-48 h-12 text-rose-500 mb-4" />
                    <h2 className="text-[50px] font-bold text-white mb-2 leading-tight">การคำนวณมุมดัก</h2>
                    <p className="text-slate-400 text-[36px]">ยิงเล็งตรงเป้าหมายเคลื่อนที่ (Lead Angle)</p>
                  </div>
                  
                  <div className="space-y-2 mb-10">
                    <InputRow label="ความเร็วเป้าหมาย (กม./ชม.)" value={c1Speed} onChange={setC1Speed} />
                    <InputRow label="ระยะยิง (เมตร)" value={c1Range} onChange={setC1Range} />
                    <InputRow label="เวลาแล่นของกระสุน (วินาที)" value={c1Tof} onChange={setC1Tof} />
                  </div>

                  <button onClick={() => handleCalculate(doCalc1)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors tracking-widest mb-8 text-[40px]">
                    ประมวลผล (CALCULATE)
                  </button>

                  {c1Result !== null && (
                    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6 text-center animate-[fade-in_0.5s_ease-out]">
                      <div className="text-slate-400 text-[40px] tracking-widest mb-2 uppercase">ผลลัพธ์มุมดัก (Lead Angle)</div>
                      <div className="text-[70px] font-mono font-bold text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                        {c1Result} มิล
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeCalc === 2 && (
                <div className="animate-[fade-in_0.5s_ease-out]">
                  <div className="mb-10">
                    <Mountain className="w-48 h-12 text-blue-500 mb-4" />
                    <h2 className="text-[50px] font-bold text-white mb-2 leading-tight">ระยะกำบัง</h2>
                    <p className="text-slate-400 text-[36px]">Piece-to-Crest Range</p>
                  </div>
                  
                  <div className="space-y-2 mb-10">
                    <InputRow label="ระยะฐานระหว่างหมู่ปืน (เมตร)" value={c2Base} onChange={setC2Base} />
                    <InputRow label="มุมยอด (Apex Angle) มิลเลียม" value={c2Apex} onChange={setC2Apex} />
                  </div>

                  <button onClick={() => handleCalculate(doCalc2)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors tracking-widest mb-8 text-[40px]">
                    ประมวลผล (CALCULATE)
                  </button>

                  {c2Result !== null && (
                    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6 text-center animate-[fade-in_0.5s_ease-out]">
                      <div className="text-slate-400 text-[40px] tracking-widest mb-2 uppercase">ระยะกำบังตั้ง ป.</div>
                      <div className="text-[70px] font-mono font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                        {c2Result.rounded} ม.
                      </div>
                      <div className="text-slate-500 font-mono mt-2">(ค่าดิบ {c2Result.raw.toFixed(1)} ม.)</div>
                    </div>
                  )}
                </div>
              )}

              {activeCalc === 3 && (
                <div className="animate-[fade-in_0.5s_ease-out]">
                  <div className="mb-10">
                    <Triangle className="w-48 h-12 text-amber-500 mb-4" />
                    <h2 className="text-[50px] font-bold text-white mb-2 leading-tight">ฐานสามเหลี่ยมคงที่</h2>
                    <p className="text-slate-400 text-[36px]">หาระยะวิธีฐานสามเหลี่ยมคงที่ (Subtense)</p>
                  </div>
                  
                  <div className="space-y-2 mb-10">
                    <InputRow label="ความกว้างฐานสมมติ (W) เมตร" value={c3W} onChange={setC3W} />
                    <InputRow label="มุมที่อ่านได้ (มิลเลียม)" value={c3Angle} onChange={setC3Angle} />
                  </div>

                  <button onClick={() => handleCalculate(doCalc3)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors tracking-widest mb-8 text-[40px]">
                    ประมวลผล (CALCULATE)
                  </button>

                  {c3Result !== null && (
                    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6 text-center animate-[fade-in_0.5s_ease-out]">
                      <div className="text-slate-400 text-[40px] tracking-widest mb-2 uppercase">ระยะทางที่คำนวณได้</div>
                      <div className="text-[70px] font-mono font-bold text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                        {c3Result} ม.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeCalc === 4 && (
                <div className="animate-[fade-in_0.5s_ease-out]">
                  <div className="mb-10">
                    <Compass className="w-48 h-12 text-purple-500 mb-4" />
                    <h2 className="text-[50px] font-bold text-white mb-2 leading-tight">มุมภาคที่ถูกต้อง</h2>
                    <p className="text-slate-400 text-[36px]">และมุมเยื้องกล้อง (True Azimuth)</p>
                  </div>
                  
                  <div className="space-y-2 mb-10">
                    <InputRow label="มุมทิศอ่านได้ (Measured Azimuth)" value={c4MAz} onChange={setC4MAz} />
                    <InputRow label="มุมเยื้อง / แม่เหล็ก (Declination)" value={c4Dec} onChange={setC4Dec} />
                  </div>

                  <button onClick={() => handleCalculate(doCalc4)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors tracking-widest mb-8 text-[40px]">
                    ประมวลผล (CALCULATE)
                  </button>

                  {c4Result !== null && (
                    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6 text-center animate-[fade-in_0.5s_ease-out]">
                      <div className="text-slate-400 text-[40px] tracking-widest mb-2 uppercase">มุมภาคที่ถูกต้อง</div>
                      <div className="text-[70px] font-mono font-bold text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                        {c4Result} มิล
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Side: Bottom Feature Cards (60% width, row of 4) */}
        <div className="absolute bottom-0 right-0 w-[60%] flex flex-col justify-end px-8 pt-8 pb-0 z-20 pointer-events-none">
          
          <div className="flex justify-between items-end mb-6 pointer-events-auto px-2">
            <h3 className="text-white/50 text-[40px] font-medium tracking-widest uppercase drop-shadow-md">Select Tool</h3>
            
            {/* Status Indicator */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-white/40 text-[40px] font-mono drop-shadow-md">SYSTEM READY</div>
              <div className="flex items-center gap-2 text-emerald-500 text-[40px] font-mono bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <span className={`w-2 h-2 rounded-full ${isFiring ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></span>
                {isFiring ? 'FIRING SEQUENCE INITIATED' : `STANDBY (CALC ${calcCount})`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 w-full pointer-events-auto">
            {calculators.map((calc) => {
              const isActive = activeCalc === calc.id;
              const Icon = calc.icon;
              return (
                <button 
                  key={calc.id}
                  onClick={() => setActiveCalc(calc.id)}
                  className={`def-card-transition flex flex-col items-center justify-center text-center p-6 rounded-t-3xl rounded-b-none border-t border-l border-r border-b-0 ${isActive ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-105 origin-bottom' : 'bg-black/60 border-white/10 hover:bg-white/10 backdrop-blur-md origin-bottom'}`}
                >
                  <div className={`p-4 rounded-xl mb-3 ${isActive ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    <Icon className={`w-10 h-10 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-[40px] font-bold drop-shadow-md mb-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>{calc.title}</div>
                  <div className="text-[40px] text-slate-400 leading-snug">{calc.sub}</div>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
