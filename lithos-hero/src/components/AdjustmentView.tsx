import React, { useState, useEffect, useRef } from 'react';

interface AdjustmentViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialOtFactor?: number;
  targetId?: string;
}

export const AdjustmentView: React.FC<AdjustmentViewProps> = ({ isVisible, onClose, initialOtFactor = 0, targetId = 'TARGET-01' }) => {
  // Lateral Shift
  const [otFactor, setOtFactor] = useState<number>(initialOtFactor);
  const [lateralShift, setLateralShift] = useState<number>(0);

  // Range Bracketing
  const [rangeShift, setRangeShift] = useState<number>(0);
  const [lastRangeOp, setLastRangeOp] = useState<{ amount: number; direction: 'ADD' | 'DROP' } | null>(null);
  const [suggestedBracket, setSuggestedBracket] = useState<number | null>(null);

  // Height of Burst
  const [heightShift, setHeightShift] = useState<number>(0);

  // Command Actions
  const [isFfeHolding, setIsFfeHolding] = useState(false);
  const [ffeProgress, setFfeProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize OT Factor when prop changes
  useEffect(() => {
    if (initialOtFactor > 0) setOtFactor(initialOtFactor);
  }, [initialOtFactor]);

  // Smart Predictive Logic for Range Bracketing
  const handleRangeShift = (direction: 'ADD' | 'DROP', amount: number) => {
    const shift = direction === 'ADD' ? amount : -amount;
    setRangeShift(prev => prev + shift);
    setLastRangeOp({ direction, amount });
    
    // Suggest the next bracket (half of current)
    if (amount === 400) setSuggestedBracket(200);
    else if (amount === 200) setSuggestedBracket(100);
    else if (amount === 100) setSuggestedBracket(50);
    else setSuggestedBracket(null);
  };

  const handleLateralShift = (direction: 'LEFT' | 'RIGHT', amount: number) => {
    const shift = direction === 'RIGHT' ? amount : -amount;
    setLateralShift(prev => prev + shift);
  };

  const handleHeightShift = (direction: 'UP' | 'DOWN', amount: number) => {
    const shift = direction === 'UP' ? amount : -amount;
    setHeightShift(prev => prev + shift);
  };

  // Hold-to-confirm FFE logic
  const isBracketed = suggestedBracket === 50 || suggestedBracket === null && lastRangeOp?.amount === 50;
  
  const startHoldFfe = () => {
    if (isBracketed) {
      // If fully bracketed to 50m, no hold required, or maybe just 0.5s.
      triggerFfe();
      return;
    }
    
    setIsFfeHolding(true);
    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += 5; // 5% every 100ms = 2 seconds total
      setFfeProgress(progress);
      if (progress >= 100) {
        clearInterval(progressTimerRef.current!);
        triggerFfe();
      }
    }, 100);
  };

  const cancelHoldFfe = () => {
    setIsFfeHolding(false);
    setFfeProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  const triggerFfe = () => {
    cancelHoldFfe();
    alert('FIRE FOR EFFECT SENT!');
  };

  const endMission = () => {
    setLateralShift(0);
    setRangeShift(0);
    setHeightShift(0);
    setLastRangeOp(null);
    setSuggestedBracket(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Adjustment of Fire</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-emerald-400 font-mono">Target: {targetId}</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400 font-mono">
                OT Factor: {otFactor > 0 ? otFactor : <span className="text-red-400">Not Set</span>}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Control Panel */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Lateral & Height */}
          <div className="flex flex-col gap-6">
            
            {/* Lateral Shift */}
            <div className={`p-4 rounded-xl border ${otFactor > 0 ? 'border-slate-700 bg-slate-800/50' : 'border-red-900/50 bg-red-900/10 opacity-70'}`}>
              <h3 className="text-emerald-400 font-semibold mb-4 uppercase tracking-widest text-sm flex justify-between items-center">
                <span>Lateral Shift (ทางข้าง)</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">
                  {lateralShift === 0 ? '0' : lateralShift > 0 ? `R ${lateralShift}` : `L ${Math.abs(lateralShift)}`}
                </span>
              </h3>
              
              <div className="flex gap-2 mb-3">
                <button 
                  disabled={otFactor === 0}
                  onClick={() => handleLateralShift('LEFT', 10)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  LEFT
                </button>
                <button 
                  disabled={otFactor === 0}
                  onClick={() => handleLateralShift('RIGHT', 10)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  RIGHT
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              
              <div className="flex gap-2">
                {[10, 20, 50].map(val => (
                  <button key={`lat-${val}`} disabled={otFactor === 0} className="flex-1 bg-slate-800 hover:bg-slate-600 border border-slate-600 disabled:opacity-50 text-slate-300 py-2 rounded-lg font-mono text-sm">
                    {val} m
                  </button>
                ))}
              </div>
              {otFactor === 0 && <div className="text-red-400 text-xs mt-2 text-center">Disabled: OT Factor not set</div>}
            </div>

            {/* Height of Burst */}
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
              <h3 className="text-cyan-400 font-semibold mb-4 uppercase tracking-widest text-sm flex justify-between items-center">
                <span>Height of Burst (ความสูง)</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">
                  {heightShift === 0 ? '0' : heightShift > 0 ? `UP ${heightShift}` : `DN ${Math.abs(heightShift)}`}
                </span>
              </h3>
              
              <div className="flex gap-2 mb-3">
                <button onClick={() => handleHeightShift('UP', 5)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> UP
                </button>
                <button onClick={() => handleHeightShift('DOWN', 5)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-1">
                  DOWN <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>
              <div className="flex gap-2">
                {[5, 10, 15].map(val => (
                  <button key={`hob-${val}`} className="flex-1 bg-slate-800 hover:bg-slate-600 border border-slate-600 text-slate-300 py-1 rounded-lg font-mono text-sm">
                    {val} m
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Range & Commands */}
          <div className="flex flex-col gap-6">
            
            {/* Range Bracketing */}
            <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-900/10 flex-1 flex flex-col">
              <h3 className="text-amber-400 font-semibold mb-4 uppercase tracking-widest text-sm flex justify-between items-center">
                <span>Range Bracketing (ทางระยะ)</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded border border-amber-500/30">
                  {rangeShift === 0 ? '0' : rangeShift > 0 ? `ADD ${rangeShift}` : `DROP ${Math.abs(rangeShift)}`}
                </span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => handleRangeShift('ADD', suggestedBracket || 400)}
                  className="bg-amber-700/80 hover:bg-amber-600 text-white font-bold py-4 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                  <span>ADD (เพิ่ม)</span>
                </button>
                <button 
                  onClick={() => handleRangeShift('DROP', suggestedBracket || 400)}
                  className="bg-amber-700/80 hover:bg-amber-600 text-white font-bold py-4 rounded-lg flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <span>DROP (ลด)</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-auto">
                {[400, 200, 100, 50].map(val => {
                  const isSuggested = suggestedBracket === val;
                  return (
                    <button 
                      key={`rng-${val}`}
                      onClick={() => {
                        // Quick add/drop logic based on last operation
                        const dir = lastRangeOp?.direction === 'ADD' ? 'DROP' : 'ADD'; // Typically bracket goes opposite
                        handleRangeShift(dir, val);
                      }}
                      className={`py-2 rounded-lg font-mono text-sm font-bold border transition-all duration-300
                        ${isSuggested 
                          ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse scale-105' 
                          : 'bg-slate-800 text-amber-500/70 border-amber-900/50 hover:bg-amber-900/30 hover:text-amber-400'
                        }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commands */}
            <div className="flex flex-col gap-3 mt-auto pt-2">
              <div className="relative">
                <button 
                  onMouseDown={startHoldFfe}
                  onMouseUp={cancelHoldFfe}
                  onMouseLeave={cancelHoldFfe}
                  onTouchStart={startHoldFfe}
                  onTouchEnd={cancelHoldFfe}
                  className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 z-10 relative overflow-hidden
                    ${isBracketed ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-slate-800 border-2 border-red-900/50 text-red-500'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Fire For Effect
                </button>
                
                {/* Hold Progress Bar */}
                {!isBracketed && isFfeHolding && (
                  <div className="absolute inset-0 bg-red-600/20 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="absolute left-0 top-0 bottom-0 bg-red-600/50 transition-all duration-100 ease-linear rounded-xl" style={{ width: `${ffeProgress}%` }}></div>
                    <span className="z-20 text-white text-xs bg-black/50 px-2 py-1 rounded">HOLD TO CONFIRM</span>
                  </div>
                )}
              </div>

              <button 
                onClick={endMission}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl tracking-widest uppercase transition-colors"
              >
                End of Mission
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
