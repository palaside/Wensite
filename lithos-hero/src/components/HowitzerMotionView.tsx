import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HowitzerMotionViewProps {
  isVisible: boolean;
  onClose: () => void;
}

type MechanismMode = 'BREECH' | 'RECOIL' | 'FIRING' | 'SAFETY';

export const HowitzerMotionView: React.FC<HowitzerMotionViewProps> = ({ isVisible, onClose }) => {
  const [activeMode, setActiveMode] = useState<MechanismMode>('BREECH');
  const [animationStep, setAnimationStep] = useState<number>(0);

  // Auto-play steps based on mode
  useEffect(() => {
    if (!isVisible) return;
    
    setAnimationStep(0); 
    const intervals: Record<MechanismMode, number> = {
      'BREECH': 3,
      'RECOIL': 3,
      'FIRING': 4,
      'SAFETY': 3,
    };
    
    const maxSteps = intervals[activeMode];
    let step = 0;
    
    const timer = setInterval(() => {
      step = (step + 1) % maxSteps;
      setAnimationStep(step);
    }, 3500); // 3.5 seconds per step so users can read the text

    return () => clearInterval(timer);
  }, [activeMode, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col font-mono text-emerald-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-emerald-900/50 bg-black/50 z-20">
        <div>
          <h2 className="text-3xl font-black tracking-widest text-emerald-400 uppercase drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            M101A1 Howitzer
          </h2>
          <p className="text-emerald-500/70 text-sm mt-1 uppercase tracking-widest">
            Instructional Motion Graphics (สื่อการสอนกลไกปืนใหญ่)
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 p-2 rounded transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-emerald-900/30 bg-black/40 p-4 md:p-6 flex flex-col gap-2 md:gap-4 overflow-y-auto z-20 max-h-[30vh] md:max-h-full">
          <div className="text-emerald-400/50 text-xs tracking-widest uppercase mb-1 md:mb-2 border-b border-emerald-900/30 pb-1 md:pb-2">
            Select Mechanism
          </div>
          
          <MenuButton 
            mode="BREECH" 
            activeMode={activeMode} 
            setActiveMode={setActiveMode}
            titleTH="เครื่องปิดท้ายและลำกล้อง"
            titleEN="Breech & Tube Assembly"
          />
          <MenuButton 
            mode="RECOIL" 
            activeMode={activeMode} 
            setActiveMode={setActiveMode}
            titleTH="ระบบเครื่องถอยรั้ง"
            titleEN="Hydro-pneumatic Recoil System"
          />
          <MenuButton 
            mode="FIRING" 
            activeMode={activeMode} 
            setActiveMode={setActiveMode}
            titleTH="ระบบเครื่องลั่นไก"
            titleEN="Firing Mechanism"
          />
          <MenuButton 
            mode="SAFETY" 
            activeMode={activeMode} 
            setActiveMode={setActiveMode}
            titleTH="ระบบนิรภัยกระสุนไม่ลั่น"
            titleEN="Misfire Safety Logic"
          />
        </div>

        {/* Animation Stage */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-zinc-950 p-8">
          
          <div className="relative w-full max-w-4xl h-[60vh] border border-emerald-900/30 rounded-2xl bg-black/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
            <ExplodedImageZoom mode={activeMode} step={animationStep} />
          </div>

          {/* Dynamic Description Box */}
          <div className="mt-8 w-full max-w-4xl p-6 border border-emerald-900/50 bg-emerald-950/20 rounded-xl backdrop-blur-md">
            <DescriptionBox mode={activeMode} step={animationStep} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const MenuButton = ({ mode, activeMode, setActiveMode, titleTH, titleEN }: any) => {
  const isActive = mode === activeMode;
  return (
    <button
      onClick={() => setActiveMode(mode)}
      className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
        isActive ? 'border-emerald-500/80 bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-emerald-900/30 bg-black/50 hover:border-emerald-700/50'
      }`}
    >
      {isActive && (
        <motion.div layoutId="howitzerMenuGlow" className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent pointer-events-none" />
      )}
      <div className={`text-sm font-bold mb-1 ${isActive ? 'text-emerald-300' : 'text-emerald-500'}`}>
        {titleTH}
      </div>
      <div className={`text-xs ${isActive ? 'text-emerald-100' : 'text-emerald-400/60'}`}>
        ({titleEN})
      </div>
    </button>
  );
}

// --- Image Zoom & Highlight Component ---

const ExplodedImageZoom = ({ mode, step }: { mode: MechanismMode, step: number }) => {
  
  // Base transform logic depending on which mode is selected to simulate camera pan/zoom
  // Assume the image is a vertical stack of parts
  const transforms: Record<MechanismMode, { scale: number, y: string | number, highlightY: string, highlightH: string }> = {
    BREECH: { scale: 1.8, y: '30%', highlightY: '15%', highlightH: '30%' },   // Focus on upper portion (Tube/Breech)
    RECOIL: { scale: 1.8, y: '10%', highlightY: '35%', highlightH: '20%' },    // Focus on middle portion (Recoil cylinder)
    FIRING: { scale: 2.2, y: '30%', highlightY: '25%', highlightH: '15%' },    // Deep zoom on Breech for firing
    SAFETY: { scale: 2.5, y: '30%', highlightY: '25%', highlightH: '15%' },    // Deep zoom on Breech for safety
  };

  const currentTransform = transforms[mode];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
      
      {/* The Animated Image Container */}
      <motion.div 
        animate={{ 
          scale: currentTransform.scale,
          y: currentTransform.y
        }}
        transition={{ type: "spring", stiffness: 40, damping: 15 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <img 
          src="/m101a1-exploded.png" 
          alt="M101A1 Exploded View" 
          className="w-full max-h-full object-contain filter drop-shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1200/222222/34d399?text=M101A1+Exploded+View+Missing';
          }}
        />

        {/* Dynamic Highlight Scanline/Glow Box over the specific part */}
        <motion.div 
          className="absolute w-[80%] left-[10%] border-2 border-emerald-500/50 bg-emerald-500/10 rounded-lg shadow-[0_0_30px_rgba(52,211,153,0.3)] pointer-events-none"
          animate={{
            top: currentTransform.highlightY,
            height: currentTransform.highlightH
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          {/* Scanning Laser Line */}
          <motion.div 
            className="w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_#34d399]"
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        {/* Step-specific visual overlays (Motion effects on top of the image) */}
        <AnimatePresence>
          {mode === 'FIRING' && step === 2 && (
             <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [1, 2.5], filter: ['blur(0px)', 'blur(8px)'] }}
              exit={{ opacity: 0 }}
              className="absolute top-[28%] left-[45%] w-16 h-16 bg-yellow-400 rounded-full mix-blend-screen"
             />
          )}
          {mode === 'SAFETY' && step >= 2 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[28%] left-[45%] w-8 h-8 flex items-center justify-center"
            >
              <div className="w-full h-1 bg-red-600 rotate-45 absolute shadow-[0_0_10px_red]" />
              <div className="w-full h-1 bg-red-600 -rotate-45 absolute shadow-[0_0_10px_red]" />
            </motion.div>
          )}
          {mode === 'RECOIL' && step === 1 && (
            <motion.div
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: -20, opacity: 1 }}
              exit={{ x: 0, opacity: 0 }}
              className="absolute top-[40%] left-[30%] text-emerald-300 font-bold text-[8px] uppercase tracking-widest"
            >
              ← Recoiling...
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Vignette Overlay for focus effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none opacity-80" />
      
      {/* Target Reticle overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <div className="w-full md:w-[500px] h-[500px] border border-emerald-500 rounded-full flex items-center justify-center">
          <div className="w-full h-[1px] bg-emerald-500 absolute" />
          <div className="h-full w-[1px] bg-emerald-500 absolute" />
        </div>
      </div>
    </div>
  );
};

// --- Dictionary for Descriptions ---
const DESCRIPTIONS: Record<MechanismMode, { th: string, en: string, steps: string[] }> = {
  BREECH: {
    th: 'เครื่องปิดท้าย และ เกลียวลำกล้อง',
    en: 'Breech Mechanism & Tube Rifling',
    steps: [
      '1. สถานะปกติ: เครื่องปิดท้าย (Breechblock) ปิดสนิท ขัดกลอนแน่น',
      '2. เปิดเครื่องปิดท้าย: เครื่องปิดท้ายเลื่อนตัวลงเพื่อเปิดรังเพลิง เตรียมบรรจุกระสุน (Loading)',
      '3. บรรจุกระสุน: เมื่อบรรจุกระสุนและปิดเครื่องปิดท้าย เกลียวลำกล้อง (Rifling) จะทำหน้าที่บังคับให้หัวกระสุนหมุนทรงตัวในอากาศ (Spin-stabilization) เมื่อทำการยิง'
    ]
  },
  RECOIL: {
    th: 'ระบบเครื่องถอยรั้ง (ระบบไฮโดรนิวเมติก)',
    en: 'Hydro-pneumatic Recoil & Recuperator System',
    steps: [
      '1. สถานะพร้อมยิง (In Battery): ปืนอยู่ในที่ตั้งพร้อมรบ',
      '2. อาการถอยหลัง (Recoil): กระบอกสูบรับอาการถอยหลัง (Recoil Cylinder) ใช้น้ำมันไฮดรอลิกหน่วงความแรงเมื่อปืนลั่น',
      '3. การส่งปืนเข้าที่ (Counter-recoil): กระบอกส่งปืนเข้าที่ (Recuperator Cylinder) ใช้ก๊าซไนโตรเจนที่ถูกบีบอัด ดันลำกล้องกลับเข้าที่เดิมอย่างนุ่มนวล'
    ]
  },
  FIRING: {
    th: 'ระบบเครื่องลั่นไก',
    en: 'Cocking, Firing, and Retracting Mechanism',
    steps: [
      '1. สถานะพัก (Rest): กลไกขัดกลอนอยู่ในสภาวะปกติ',
      '2. การขึ้นนก (Cocking): ดึงกลไกไปด้านหลัง สปริงเข็มแทงชนวนถูกบีบอัดเพื่อสะสมพลังงานจลน์',
      '3. การลั่นไก (Firing): นกสับ (Sear) ปลดล็อก ปล่อยเข็มแทงชนวน (Firing Pin) พุ่งไปกระแทกจานท้ายกระสุน (Primer)',
      '4. การถอนเข็ม (Retracting): สปริงถอนเข็มดึงเข็มแทงชนวนกลับเข้าที่ซ่อนตัวทันที เพื่อป้องกันเข็มหักตอนเปิดเครื่องปิดท้าย'
    ]
  },
  SAFETY: {
    th: 'ระบบลอจิกนิรภัยกระสุนไม่ลั่น',
    en: 'Misfire Safety Logic Mechanism',
    steps: [
      '1. เครื่องปิดท้ายปิดสนิท (Fully Closed): ร่องนิรภัยและสลักตรงกัน เข็มแทงชนวนสามารถพุ่งตัวไปด้านหน้าได้สุดเพื่อตีจานท้าย',
      '2. เครื่องปิดท้ายปิดไม่สนิท (Partially Open): ร่องบังคับเลื่อนผิดตำแหน่ง ทำให้กลไกนิรภัย (Safety Sear) ขยับตัวขึ้นมาขวางทางเดินของเข็มแทงชนวน',
      '3. ป้องกันกระสุนลั่น (Safety Block): หากมีการเผลอลั่นไก กลไกนิรภัยจะสกัดเข็มแทงชนวนไว้ ป้องกันอันตรายจากปลอกกระสุนแตก (Case Rupture) ในรังเพลิง'
    ]
  }
};

const DescriptionBox = ({ mode, step }: { mode: MechanismMode, step: number }) => {
  const data = DESCRIPTIONS[mode];
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xl font-bold text-emerald-300">{data.th} <span className="text-emerald-500/70 text-base font-normal">({data.en})</span></div>
      
      <div className="mt-2 text-emerald-400">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${step}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-start gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 animate-pulse shadow-[0_0_10px_#34d399]" />
            <div className="leading-relaxed text-lg">
              {data.steps[step] || data.steps[data.steps.length - 1]}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
