import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type FOCalcType = 'flash_to_bang' | 'mil_formula' | 'sine_rule' | 'ot_factor' | 'lateral_shift' | 'range_bracketing' | 'height_of_burst' | 'moving_target' | 'smoke_screen' | null;

interface FOCalculatorViewProps {
  type: FOCalcType;
  onClose: () => void;
}

export function FOCalculatorView({ type, onClose }: FOCalculatorViewProps) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'flash_to_bang':
        const time = parseFloat(input1) || 0;
        const distanceFB = time * 350;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. Flash-to-Bang (แสง-เสียง)</h2>
            <p className="text-sm text-gray-300">ระยะทาง = เวลา x 350 เมตร</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">เวลาที่จับได้ (วินาที)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 5" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะทาง (Distance)</div>
              <div className="text-3xl font-bold text-emerald-400">{distanceFB.toFixed(0)} <span className="text-lg">เมตร</span></div>
            </div>
          </div>
        );
      
      case 'mil_formula':
        const W = parseFloat(input1) || 0;
        const m = parseFloat(input2) || 0;
        const distanceMil = m > 0 ? (W / m) * 1000 : 0;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">2. Mil Formula (สูตรมิล)</h2>
            <p className="text-sm text-gray-300">W = R x m (หา R: ระยะทาง)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความกว้างเป้าหมาย (W) - เมตร</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 10" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมที่อ่านได้ (m) - มิลเลียม</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 5" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะทาง (Range)</div>
              <div className="text-3xl font-bold text-emerald-400">{distanceMil.toFixed(0)} <span className="text-lg">เมตร</span></div>
            </div>
          </div>
        );

      case 'ot_factor':
        const distanceOT = parseFloat(input1) || 0;
        let ot = distanceOT / 1000;
        // ปัดเศษตามหลักการ ปืนใหญ่: ถ้าลงท้ายด้วย 0.5 เป๊ะ ให้ปัดไปหาเลขคู่
        let roundedOT = Math.round(ot);
        if (Math.abs(ot % 1) === 0.5) {
            roundedOT = Math.floor(ot);
            if (roundedOT % 2 !== 0) {
                roundedOT += 1;
            }
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">5. OT Factor (แฟคเตอร์ ตม.)</h2>
            <p className="text-sm text-gray-300">OT = ระยะทาง / 1000 (ปัดเศษหาเลขคู่)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะทาง ผตน.-เป้าหมาย (เมตร)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 2500" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50 flex justify-between items-center px-8">
              <div>
                <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">OT ดิบ</div>
                <div className="text-xl font-bold text-emerald-400/50">{ot.toFixed(2)}</div>
              </div>
              <div className="text-xl text-emerald-800">→</div>
              <div>
                <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">OT ที่ใช้คำนวณ</div>
                <div className="text-4xl font-bold text-emerald-400">{roundedOT}</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-emerald-400">อยู่ระหว่างการพัฒนา</h2>
            <p className="text-gray-400 text-center max-w-xs">เครื่องมือส่วนนี้กำลังอยู่ในขั้นตอนการเชื่อมต่อสมการทางคณิตศาสตร์ครับ</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0a110f] border border-emerald-900/50 rounded-xl shadow-2xl shadow-emerald-900/20 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-emerald-900/50 bg-gradient-to-r from-emerald-900/20 to-transparent">
            <h2 className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tactical Calculator
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-emerald-400 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
