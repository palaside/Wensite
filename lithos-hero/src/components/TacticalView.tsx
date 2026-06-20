import React, { useEffect, useState } from 'react';
import { useReportContext } from '../context/ReportContext';
import './TacticalView.css';

interface TacticalViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TacticalView = ({ isVisible, onClose }: TacticalViewProps) => {
  const { allGuns, section3Data, mainGun } = useReportContext();
  const [firingGun, setFiringGun] = useState<number | null>(null);

  // Sequential firing loop
  useEffect(() => {
    if (!isVisible) return;
    
    // Sequence: 1, 2, 3, 4
    const sequence = [1, 2, 3, 4];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setFiringGun(sequence[currentIndex]);
      
      // Clear firing after 0.5s to reset animation
      setTimeout(() => setFiringGun(null), 500);
      
      currentIndex = (currentIndex + 1) % sequence.length;
    }, 2000); // Fire every 2 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  // Map coordinates
  const getCoordinates = (gunId: number) => {
    const d = section3Data[gunId];
    if (!d) return { x: 0, y: 0 };
    
    const rawX = d.lrText === 'ซ้าย' ? -parseInt(d.lrDist || '0') : parseInt(d.lrDist || '0');
    const rawY = d.frText === 'หลัง' ? -parseInt(d.frDist || '0') : parseInt(d.frDist || '0');
    
    return { x: rawX, y: rawY };
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden bg-black/80 backdrop-blur-md hero-anim hero-fade">
      
      {/* Container simulating a tactical field screen */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[900px] bg-[#1a1f26] border-2 border-[#2b3642] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
          <div>
            <h2 className="text-3xl font-bold text-amber-400 font-sans tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              TACTICAL BATTERY VIEW
            </h2>
            <div className="text-white/70 font-mono mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE FEED
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="pointer-events-auto text-white/50 hover:text-white hover:bg-white/10 p-3 rounded-full transition-colors bg-black/40 backdrop-blur-sm border border-white/10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 3D Scene Container */}
        <div className="tactical-scene-wrapper absolute inset-0 w-full h-full">
          <div className="tactical-ground">
            {/* Grid lines on the ground */}
            <div className="tactical-grid"></div>
            
            {/* Center Command Vehicle */}
            <div className="tactical-entity command-vehicle" style={{ transform: 'translate(-50%, -50%) translate3d(0px, 0px, 0px)' }}>
              <div className="vehicle-body shadow-lg">
                <div className="radar-dish scanning"></div>
                <div className="vehicle-cab"></div>
              </div>
              <div className="entity-label shadow-text">ศก.ร้อย</div>
            </div>

            {/* Guns */}
            {allGuns.map(gun => {
              const coords = getCoordinates(gun);
              
              // Scale: 1 unit = 8px (adjust as needed to fit screen)
              const scale = 12;
              const pxX = coords.x * scale;
              // In HTML/CSS, Y goes down, so we invert Y for Front (positive Y = up screen)
              const pxY = -coords.y * scale; 
              
              const isFiring = firingGun === gun;

              return (
                <div 
                  key={gun}
                  className={`tactical-entity howitzer ${isFiring ? 'firing' : 'idle'}`}
                  style={{ 
                    // Base positioning in the 3D ground plane
                    transform: `translate(-50%, -50%) translate3d(${pxX}px, ${pxY}px, 0px)`,
                    zIndex: 1000 - Math.round(pxY) // Z-index sorting based on Y depth
                  }}
                >
                  {/* The visual gun element */}
                  <div className="gun-model">
                    <div className="gun-base"></div>
                    <div className="gun-barrel-wrapper">
                      <div className="gun-barrel"></div>
                      {isFiring && <div className="muzzle-flash"></div>}
                    </div>
                  </div>
                  
                  {/* Coordinate Label below the gun */}
                  <div className="entity-label shadow-text mt-4">
                    หมู่ {gun} <br/>
                    <span className="text-[10px] text-amber-300">
                      ({coords.x > 0 ? `R${coords.x}` : coords.x < 0 ? `L${Math.abs(coords.x)}` : '0'}, {coords.y > 0 ? `F${coords.y}` : coords.y < 0 ? `B${Math.abs(coords.y)}` : '0'})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
