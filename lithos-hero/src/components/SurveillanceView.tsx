import React, { useState, useEffect } from 'react';
import { parseGrid, formatGrid8, calculatePolar, calculateShift } from '../utils/artilleryMath';
import type { Point } from '../utils/artilleryMath';

type SurveillanceMethod = 'grid' | 'polar' | 'shift' | null;

interface SurveillanceViewProps {
  method: SurveillanceMethod;
  onClose: () => void;
}

export const SurveillanceView: React.FC<SurveillanceViewProps> = ({ method, onClose }) => {
  // Common states
  const [targetGrid, setTargetGrid] = useState<Point | null>(null);

  // Polar states
  const [obsGrid, setObsGrid] = useState('');
  const [obsAlt, setObsAlt] = useState('');
  const [direction, setDirection] = useState('');
  const [distance, setDistance] = useState('');
  const [vi, setVi] = useState('');

  // Shift states
  const [knownGrid, setKnownGrid] = useState('');
  const [knownAlt, setKnownAlt] = useState('');
  const [otLine, setOtLine] = useState('');
  const [lateralShift, setLateralShift] = useState('');
  const [rangeShift, setRangeShift] = useState('');
  const [verticalShift, setVerticalShift] = useState('');
  
  // Grid Method states
  const [inputGrid, setInputGrid] = useState('');
  const [inputAlt, setInputAlt] = useState('');

  // Auto-calculate logic
  useEffect(() => {
    if (method === 'polar') {
      const obs = parseGrid(obsGrid, parseFloat(obsAlt) || 0);
      const dir = parseFloat(direction) || 0;
      const dist = parseFloat(distance) || 0;
      const vert = parseFloat(vi) || 0;
      
      if (obsGrid.length >= 8 && dir > 0 && dist > 0) {
        const target = calculatePolar(obs, dir, dist, vert);
        setTargetGrid(target);
      } else {
        setTargetGrid(null);
      }
    } else if (method === 'shift') {
      const known = parseGrid(knownGrid, parseFloat(knownAlt) || 0);
      const ot = parseFloat(otLine) || 0;
      const lat = parseFloat(lateralShift) || 0;
      const rng = parseFloat(rangeShift) || 0;
      const vert = parseFloat(verticalShift) || 0;
      
      if (knownGrid.length >= 8 && ot > 0) {
        const target = calculateShift(known, ot, lat, rng, vert);
        setTargetGrid(target);
      } else {
        setTargetGrid(null);
      }
    } else if (method === 'grid') {
      if (inputGrid.length >= 8) {
        setTargetGrid(parseGrid(inputGrid, parseFloat(inputAlt) || 0));
      } else {
        setTargetGrid(null);
      }
    }
  }, [method, obsGrid, obsAlt, direction, distance, vi, knownGrid, knownAlt, otLine, lateralShift, rangeShift, verticalShift, inputGrid, inputAlt]);

  if (!method) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-slate-900/90 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {method === 'grid' && 'Grid Method (วิธีพิกัดกริด)'}
            {method === 'polar' && 'Polar Plot Method (วิธีโพลาร์)'}
            {method === 'shift' && 'Shift from Known Point (ย้ายจากจุดที่ทราบ)'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Input Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-emerald-400 font-semibold uppercase tracking-wider text-sm border-b border-emerald-900 pb-2">Inputs</h3>
              
              {method === 'polar' && (
                <>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Observer Grid (8 or 10 digits)</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="e.g. 12345678" value={obsGrid} onChange={e => setObsGrid(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Observer Altitude (m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="0" value={obsAlt} onChange={e => setObsAlt(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Direction (Mils)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="0-6400" value={direction} onChange={e => setDirection(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Distance (m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="Meters" value={distance} onChange={e => setDistance(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Vertical Interval (VI) (m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="+/- Meters" value={vi} onChange={e => setVi(e.target.value)} />
                  </div>
                </>
              )}

              {method === 'shift' && (
                <>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Known Point Grid</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="e.g. 12345678" value={knownGrid} onChange={e => setKnownGrid(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Known Point Altitude (m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="0" value={knownAlt} onChange={e => setKnownAlt(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">OT Line (Direction Mils)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="0-6400" value={otLine} onChange={e => setOtLine(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-slate-300 text-sm mb-1">Lateral Shift (L/R m)</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="-Left / +Right" value={lateralShift} onChange={e => setLateralShift(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="block text-slate-300 text-sm mb-1">Range Shift (Add/Drop m)</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="-Drop / +Add" value={rangeShift} onChange={e => setRangeShift(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Vertical Shift (U/D m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="-Down / +Up" value={verticalShift} onChange={e => setVerticalShift(e.target.value)} />
                  </div>
                </>
              )}

              {method === 'grid' && (
                <>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Target Grid (8 or 10 digits)</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="e.g. 12345678" value={inputGrid} onChange={e => setInputGrid(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="block text-slate-300 text-sm mb-1">Target Altitude (m)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none" placeholder="0" value={inputAlt} onChange={e => setInputAlt(e.target.value)} />
                  </div>
                </>
              )}

            </div>

            {/* Results Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-cyan-400 font-semibold uppercase tracking-wider text-sm border-b border-cyan-900 pb-2">Target Result</h3>
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-inner flex flex-col items-center justify-center min-h-[300px]">
                {targetGrid ? (
                  <div className="text-center animate-in zoom-in duration-300">
                    <div className="text-slate-400 text-sm mb-2">Calculated Target Grid</div>
                    <div className="text-5xl font-mono text-emerald-400 font-bold tracking-widest drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                      {formatGrid8(targetGrid)}
                    </div>
                    <div className="mt-4 text-slate-300 text-lg">
                      Altitude: <span className="text-cyan-400 font-mono font-bold">{Math.round(targetGrid.alt)} m</span>
                    </div>
                    <div className="mt-8">
                      <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest">
                        Request Fire
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    <p>Enter required data to compute target</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
