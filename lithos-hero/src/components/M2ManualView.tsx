import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface M2ManualViewProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  description?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

interface ManualPart {
  id: number;
  title: string;
  imagePath: string;
  hotspots: Hotspot[];
}

const MANUAL_PARTS: ManualPart[] = [
  {
    id: 1,
    title: 'ส่วนประกอบหลัก (Main Assembly)',
    imagePath: '/m2-part1.jpg',
    hotspots: [
      { id: '1-1', x: 65, y: 15, label: 'กล้องเล็ง', description: 'Telescope', direction: 'right' },
      { id: '1-2', x: 75, y: 45, label: 'ตัวกล้อง', description: 'Main Body', direction: 'right' },
      { id: '1-3', x: 45, y: 75, label: 'ห้องเกลียว', description: 'Worm Gear Housing', direction: 'left' },
      { id: '1-4', x: 30, y: 85, label: 'จานฐาน', description: 'Base Plate', direction: 'left' },
    ],
  },
  {
    id: 2,
    title: 'ชุดเล็งและมุมดิ่ง (Telescope & Vertical Knob)',
    imagePath: '/m2-part2.jpg',
    hotspots: [
      { id: '2-1', x: 28, y: 22, label: 'ควงมุมทางดิ่ง', description: 'Vertical Angle Knob', direction: 'left' },
      { id: '2-2', x: 48, y: 52, label: 'แท่งแก้วสะท้อนแสง', description: 'Reflecting Prism', direction: 'top' },
      { id: '2-3', x: 55, y: 82, label: 'หลอดระดับกล้องเล็ง', description: 'Telescope Level Vial', direction: 'right' },
    ],
  },
  {
    id: 3,
    title: 'มาตรามุมทางดิ่ง (Vertical Scales)',
    imagePath: '/m2-part3.jpg',
    hotspots: [
      { id: '3-1', x: 50, y: 45, label: 'มาตรามุมทางดิ่งส่วนย่อย', description: '0-100 มิล (ขีดละ 1 มิล)', direction: 'top' },
      { id: '3-2', x: 48, y: 65, label: 'มาตรามุมทางดิ่งส่วนใหญ่', description: '-400 ถึง +1200 มิล (ขีดละ 100)', direction: 'right' },
      { id: '3-3', x: 25, y: 75, label: 'เลนส์กล้องเล็ง', description: 'กำลังขยาย 4 เท่า / โฟกัสคงที่', direction: 'left' },
    ],
  },
  {
    id: 4,
    title: 'ชุดเข็มทิศและหลอดระดับ (Compass & Levels)',
    imagePath: '/m2-part4.jpg',
    hotspots: [
      { id: '4-1', x: 35, y: 53, label: 'เข็มทิศ', description: 'Compass', direction: 'left' },
      { id: '4-2', x: 20, y: 63, label: 'ใบห้ามเข็มทิศ', description: 'Compass Lock', direction: 'left' },
      { id: '4-3', x: 50, y: 82, label: 'ควงจานทิศล่าง', description: 'Lower Azimuth Knob', direction: 'bottom' },
      { id: '4-4', x: 55, y: 56, label: 'หลอดระดับทางยาว', description: 'Tubular Level', direction: 'top' },
      { id: '4-5', x: 68, y: 52, label: 'หลอดระดับวงกลม', description: 'Circular Level', direction: 'right' },
    ],
  },
  {
    id: 5,
    title: 'เรือนเข็มทิศ (Compass Housing)',
    imagePath: '/m2-part5.jpg',
    hotspots: [
      { id: '5-1', x: 40, y: 50, label: 'เรือนเข็มทิศ', description: 'Compass Housing', direction: 'right' },
      { id: '5-2', x: 40, y: 92, label: 'ช่องมองเข็มทิศ', description: 'Compass Viewing Window', direction: 'right' },
    ],
  },
];

export const M2ManualView: React.FC<M2ManualViewProps> = ({ isVisible, onClose }) => {
  const [activePart, setActivePart] = useState<number>(1);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  if (!isVisible) return null;

  const currentPart = MANUAL_PARTS.find(p => p.id === activePart) || MANUAL_PARTS[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col font-mono text-emerald-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-emerald-900/50 bg-black/50 z-20">
        <div>
          <h2 className="text-3xl font-black tracking-widest text-emerald-400 uppercase drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            M2 Aiming Circle
          </h2>
          <p className="text-emerald-500/70 text-sm mt-1 uppercase tracking-widest">Interactive Technical Manual (คู่มือโครงสร้างกล้องเล็ง)</p>
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

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-emerald-900/30 bg-black/40 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto z-20 max-h-[30vh] md:max-h-full">
          <div className="text-emerald-400/50 text-xs tracking-widest uppercase mb-2 md:mb-4 border-b border-emerald-900/30 pb-2">
            Select Assembly Part
          </div>
          
          {MANUAL_PARTS.map(part => (
            <button
              key={part.id}
              onClick={() => {
                setActivePart(part.id);
                setHoveredHotspot(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                activePart === part.id 
                  ? 'border-emerald-500/80 bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                  : 'border-emerald-900/30 bg-black/50 hover:border-emerald-700/50'
              }`}
            >
              {activePart === part.id && (
                <motion.div 
                  layoutId="activePartGlow"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent pointer-events-none"
                />
              )}
              <div className={`text-xs font-bold mb-1 ${activePart === part.id ? 'text-emerald-300' : 'text-emerald-600'}`}>
                PART {part.id}
              </div>
              <div className={`text-sm ${activePart === part.id ? 'text-emerald-100' : 'text-emerald-400/70'}`}>
                {part.title}
              </div>
            </button>
          ))}

          <div className="mt-auto pt-6 border-t border-emerald-900/30">
            <div className="bg-emerald-950/40 border border-emerald-900/50 rounded p-4 text-xs text-emerald-400/80">
              <strong>คำแนะนำ:</strong> นำเมาส์ไปชี้ที่จุดเรืองแสงบนภาพ (Hotspot) เพื่อดูชื่อชิ้นส่วนและรายละเอียด
            </div>
          </div>
        </div>

        {/* Right Area - Interactive Image Viewer */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-950 p-8">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPart.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full max-w-5xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-emerald-900/30 bg-black"
            >
              
              <img 
                src={currentPart.imagePath} 
                alt={currentPart.title}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  // If image is missing, show a fallback message inline
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'absolute inset-0 flex flex-col items-center justify-center text-emerald-900/50 font-bold text-xl border-2 border-emerald-900/50 border-dashed m-4 rounded-xl';
                    fallback.innerHTML = `<div>Missing Image: ${currentPart.imagePath}</div><div class="text-sm font-normal mt-2">Please upload to /public</div>`;
                    // only append if not already there to prevent infinite loop
                    if (!parent.querySelector('.border-dashed')) {
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />

              {/* Hotspots Container - we make it absolute to match the image dimensions roughly */}
              {/* Note: since object-contain centers the image, the percentages apply to the container box. 
                  If the image doesn't fill the box, the dots might be slightly off. 
                  In a real app with exact aspect ratios, this is precise. We assume 4:3 images here. */}
              <div className="absolute inset-0">
                {currentPart.hotspots.map((spot) => (
                  <div 
                    key={spot.id}
                    className="absolute z-30"
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onMouseEnter={() => setHoveredHotspot(spot.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                  >
                    {/* The pulsing dot */}
                    <div className="relative -ml-3 -mt-3 w-6 h-6 group cursor-pointer">
                      <motion.div 
                        className="absolute inset-0 bg-emerald-400 rounded-full opacity-50"
                        animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <div className="absolute inset-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    </div>

                    {/* The Label Line and Box */}
                    <AnimatePresence>
                      {hoveredHotspot === spot.id && (
                        <motion.div
                          initial={{ opacity: 0, 
                            x: spot.direction === 'left' ? 20 : spot.direction === 'right' ? -20 : 0,
                            y: spot.direction === 'top' ? 20 : spot.direction === 'bottom' ? -20 : 0
                          }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`absolute flex flex-col pointer-events-none whitespace-nowrap z-50
                            ${spot.direction === 'left' ? 'right-full mr-4 top-1/2 -translate-y-1/2 items-end' : ''}
                            ${spot.direction === 'right' ? 'left-full ml-4 top-1/2 -translate-y-1/2 items-start' : ''}
                            ${spot.direction === 'top' ? 'bottom-full mb-4 left-1/2 -translate-x-1/2 items-center' : ''}
                            ${spot.direction === 'bottom' ? 'top-full mt-4 left-1/2 -translate-x-1/2 items-center' : ''}
                            ${!spot.direction ? 'left-full ml-4 top-1/2 -translate-y-1/2 items-start' : ''}
                          `}
                        >
                          {/* Connecting Line */}
                          <div className={`absolute bg-emerald-500/50 
                            ${spot.direction === 'left' ? 'h-[1px] w-4 top-1/2 -right-4' : ''}
                            ${spot.direction === 'right' ? 'h-[1px] w-4 top-1/2 -left-4' : ''}
                            ${spot.direction === 'top' ? 'w-[1px] h-4 left-1/2 -bottom-4' : ''}
                            ${spot.direction === 'bottom' ? 'w-[1px] h-4 left-1/2 -top-4' : ''}
                          `} />
                          
                          <div className="bg-black/95 border border-emerald-500/50 p-4 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md min-w-[150px]">
                            <div className="font-bold text-emerald-300 text-xl">{spot.label}</div>
                            {spot.description && (
                              <div className="text-emerald-400/80 text-sm mt-1">{spot.description}</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
