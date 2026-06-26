import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RevealLayer } from './components/RevealLayer';
import { ReportView } from './components/ReportView';
import { M17View } from './components/M17View';

import { DeflectionView } from './components/DeflectionView';
import { LoginView } from './components/LoginView';
import { SurveillanceView } from './components/SurveillanceView';
import { MapView } from './components/MapView';
import { AdjustmentView } from './components/AdjustmentView';
import { TargetListView } from './components/TargetListView';
import type { TargetData } from './utils/targetDatabase';
import { ReportProvider } from './context/ReportContext';
import LogoSphere from './components/LogoSphere';
import { FOCalculatorView } from './components/FOCalculatorView';
import type { FOCalcType } from './components/FOCalculatorView';
import { CraterAnalysisView } from './components/CraterAnalysisView';

const BG_IMAGE_1 = '/BG.png';
const BG_IMAGE_2 = '/bg-reveal.png';

type ViewState = 'hero' | 'report' | 'm17' | 'deflection' | 'crater' | FOCalcType;

function App() {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [currentView, setCurrentView] = useState<ViewState>('hero');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTargetList, setShowTargetList] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentOtFactor, setAdjustmentOtFactor] = useState(0);
  const [mapTargetGrid, setMapTargetGrid] = useState<string | undefined>(undefined);
  const [activeModeId, setActiveModeId] = useState('HS');
  const [surveillanceMethod, setSurveillanceMethod] = useState<'grid' | 'polar' | 'shift' | null>(null);
  const [selectedKnownTarget, setSelectedKnownTarget] = useState<TargetData | undefined>(undefined);
  
  // Fixed positions for the right panel: FO (Top), FL/SL, HS, FD
  const ALL_MODES = ['FO', 'FL', 'HS', 'FD'];
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouse.current.x === -999) {
          smooth.current = { x: e.clientX, y: e.clientY };
      }
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const updateCursor = () => {
      if (currentView === 'hero' && mouse.current.x !== -999) {
        smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
        smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(updateCursor);
    };

    rafRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentView]);

  return (
    <ReportProvider>
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation (fixed, over hero) */}
      <nav className={`fixed top-0 left-0 right-0 z-[120] flex items-center justify-between p-4 sm:p-5 transition-opacity duration-500 ${currentView !== 'hero' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView('hero')}
        >
          <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
          </svg>
          <span className="text-white text-2xl font-playfair italic">M17</span>
        </div>

        {isAuthenticated && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
            <button 
              onClick={() => setShowTargetList(true)}
              className="bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-700/50 text-emerald-400 font-bold py-2 px-6 rounded-lg uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              Target List
            </button>
            <button 
              onClick={() => {
                setMapTargetGrid(undefined);
                setShowMap(true);
              }}
              className="bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-700/50 text-cyan-400 font-bold py-2 px-6 rounded-lg uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              Map
            </button>
          </div>
        )}

        <div 
          onClick={() => !isAuthenticated && setShowLogin(true)}
          className={`hidden md:block ${isAuthenticated ? 'bg-slate-700/80' : 'bg-emerald-600/90 hover:bg-emerald-500'} text-white text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer transition-colors`}
        >
          {isAuthenticated ? 'Commander' : 'Login'}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
        
        {/* Base Image Container */}
        <div className="absolute inset-0 z-10 bg-black">
          {/* Conditional Background: Image before login, Video after login */}
          {!isAuthenticated ? (
            <>
              {/* Main Background Image */}
              <div 
                className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url('${BG_IMAGE_1}')` }}
              ></div>
              {/* Lightning Overlay */}
              <div className="absolute inset-0 bg-white mix-blend-overlay opacity-0 animate-[lightning_10s_infinite] pointer-events-none"></div>
            </>
          ) : (
            <>
              {/* Video Background */}
              <video className="absolute inset-0 z-0 object-cover w-full h-full opacity-30" autoPlay loop muted playsInline>
                <source src="/hero-video.mp4" type="video/mp4" />
                {/* Fallback for unsupported browsers */}
                Your browser does not support the video tag.
              </video>
              {/* Dark Gradient Overlay for completely black theme with subtle glow */}
              <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none"></div>
            </>
          )}
        </div>

        {/* Reveal Layer (Flashlight) - Show only before login */}
        {!isAuthenticated && (
          <div className={`transition-opacity duration-700 ${currentView !== 'hero' ? 'opacity-0' : 'opacity-100'}`}>
            <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />
          </div>
        )}

        {/* Authenticated Dashboard Layout */}
        {isAuthenticated && currentView === 'hero' && (
          <div className="absolute inset-0 z-20 flex items-center justify-between px-16 pt-24 pb-8">
            
            {/* Left Panel: Mode Title and Actions */}
            <div className="flex flex-col justify-center gap-16 w-1/3 hero-anim hero-fade h-full pl-12 z-30">
              <h1 className="text-white font-bold leading-[0.9] tracking-tight drop-shadow-2xl">
                {activeModeId === 'HS' && (
                  <><div className="text-[12rem] mb-6">Howitzer</div><div className="text-[10rem] text-gray-300">Section</div></>
                )}
                {activeModeId === 'FO' && (
                  <><div className="text-[12rem] mb-6">Forward</div><div className="text-[10rem] text-gray-300">Observer</div></>
                )}
                {activeModeId === 'FD' && (
                  <><div className="text-[12rem] mb-6">Fire</div><div className="text-[10rem] text-gray-300">Direction</div></>
                )}
                {activeModeId === 'FL' && (
                  <><div className="text-[12rem] mb-6">Surveillance</div></>
                )}
              </h1>
              
              <div className="flex flex-col gap-6 mt-4">
                {activeModeId === 'HS' && (
                  <>
                    <button onClick={() => setCurrentView('report')} className="glass-card-btn">
                      Report
                    </button>
                    <button onClick={() => setCurrentView('m17')} className="glass-card-btn">
                      M.17
                    </button>
                    <button onClick={() => setCurrentView('deflection')} className="glass-card-btn">
                      Deflection
                    </button>
                    <button onClick={() => setCurrentView('crater')} className="glass-card-btn border-orange-500/50 hover:bg-orange-900/30">
                      Crater Analysis
                    </button>
                  </>
                )}
                {activeModeId === 'FL' && (
                  <>
                    <button onClick={() => setSurveillanceMethod('grid')} className="glass-card-btn">
                      Grid Method
                    </button>
                    <button onClick={() => setSurveillanceMethod('polar')} className="glass-card-btn">
                      Polar Plot Method
                    </button>
                    <button onClick={() => setSurveillanceMethod('shift')} className="glass-card-btn">
                      Shift from Known Point
                    </button>
                  </>
                )}
                {activeModeId === 'FO' && (
                  <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar pb-10">
                    {/* กล่องที่ 1: การหาพิกัดและระยะ */}
                    <div className="col-span-2 text-emerald-400 font-bold text-xs tracking-widest uppercase mt-2 mb-1 border-b border-emerald-900/50 pb-1">1. Target Acquisition (หาพิกัดและระยะ)</div>
                    <button onClick={() => setCurrentView('flash_to_bang')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">1. Flash-to-Bang</span>
                      แสง-เสียง
                    </button>
                    <button onClick={() => setCurrentView('mil_formula')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">2. Mil Formula</span>
                      สูตรมิล
                    </button>
                    <button onClick={() => setCurrentView('sine_rule')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">3. Sine Rule</span>
                      กฎของไซน์
                    </button>

                    {/* กล่องที่ 2: ระบบการย้ายจุด */}
                    <div className="col-span-2 text-emerald-400 font-bold text-xs tracking-widest uppercase mt-4 mb-1 border-b border-emerald-900/50 pb-1">2. Shift Method (การย้ายจุด)</div>
                    <button onClick={() => setSurveillanceMethod('shift')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">4. Shift from Known Point</span>
                      ย้ายจุดอ้างอิง
                    </button>
                    <button onClick={() => setCurrentView('ot_factor')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">5. OT Factor</span>
                      แฟคเตอร์ ตม.
                    </button>
                    <button onClick={() => setCurrentView('lateral_shift')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">6. Lateral Shift</span>
                      แก้ทางข้าง
                    </button>

                    {/* กล่องที่ 3: การปรับการยิง */}
                    <div className="col-span-2 text-emerald-400 font-bold text-xs tracking-widest uppercase mt-4 mb-1 border-b border-emerald-900/50 pb-1">3. Adjustment (ปรับการยิง)</div>
                    <button onClick={() => setCurrentView('range_bracketing')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">7. Range Bracketing</span>
                      แก้ทางระยะ
                    </button>
                    <button onClick={() => setCurrentView('height_of_burst')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">8. Height of Burst</span>
                      แก้สูงแตก
                    </button>

                    {/* กล่องที่ 4: ภารกิจพิเศษ */}
                    <div className="col-span-2 text-emerald-400 font-bold text-xs tracking-widest uppercase mt-4 mb-1 border-b border-emerald-900/50 pb-1">4. Special Missions (ภารกิจพิเศษ)</div>
                    <button onClick={() => setCurrentView('moving_target')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">9. Moving Target Lead</span>
                      เป้าหมายเคลื่อนที่
                    </button>
                    <button onClick={() => setCurrentView('smoke_screen')} className="glass-card-btn !py-2 !text-base">
                      <span className="block text-[10px] text-emerald-500 mb-0.5 tracking-wider uppercase">10. Smoke Screen</span>
                      ฉากควัน
                    </button>
                  </div>
                )}
                {activeModeId !== 'HS' && activeModeId !== 'FL' && activeModeId !== 'FO' && (
                  <div className="text-white/60 italic text-2xl mt-4">
                    ...
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel: Logo Sphere */}
            <div className="w-1/3 flex justify-center items-center translate-x-[12rem] z-10">
              <LogoSphere activeLogo={`/${activeModeId}.png`} />
            </div>

            {/* Right Panel: Inactive Modes Selection */}
            <div className="flex flex-col gap-12 w-1/3 items-end justify-start pt-16 pr-16 z-30">
              {ALL_MODES.map((mode) => {
                  if (mode === activeModeId) {
                    // Render an empty gap placeholder for the active mode to reserve its fixed position
                    return <div key={`empty-${mode}`} className="h-[22rem] w-[22rem]" />;
                  }

                  return (
                    <div 
                      key={mode}
                      className="mode-logo-inactive cursor-pointer relative"
                      onClick={() => setActiveModeId(mode)}
                    >
                      <motion.img 
                        layoutId={`/${mode}.png`}
                        src={`/${mode}.png`} 
                        alt={mode} 
                        className="w-[22rem] h-[22rem] object-contain drop-shadow-2xl opacity-80 hover:opacity-100"
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                      />
                    </div>
                  );
              })}
            </div>

          </div>
        )}

        {/* The Report View Layer */}
        <ReportView 
          isVisible={currentView === 'report'} 
          onClose={() => setCurrentView('hero')} 
        />

        <M17View 
          isVisible={currentView === 'm17'} 
          onClose={() => setCurrentView('hero')} 
        />



        <DeflectionView 
          isVisible={currentView === 'deflection'} 
          onClose={() => setCurrentView('hero')} 
        />

        <SurveillanceView 
          method={surveillanceMethod}
          onClose={() => setSurveillanceMethod(null)}
          onOpenMap={(grid) => {
            setMapTargetGrid(grid);
            setShowMap(true);
          }}
          onRequestFire={(distance) => {
            // Calculate OT factor from distance if provided
            if (distance) {
              setAdjustmentOtFactor(Math.round(distance / 1000));
            }
            setShowAdjustment(true);
          }}
          initialKnownTarget={selectedKnownTarget}
          onRequestTargetList={() => setShowTargetList(true)}
        />

        <TargetListView 
          isVisible={showTargetList} 
          onClose={() => setShowTargetList(false)} 
          onSelectTarget={(target) => {
            setSelectedKnownTarget(target);
            setSurveillanceMethod('shift'); // Switch to shift method when target is selected
          }}
        />

        <AdjustmentView
          isVisible={showAdjustment}
          onClose={() => setShowAdjustment(false)}
          initialOtFactor={adjustmentOtFactor}
        />

        <MapView 
          isVisible={showMap}
          onClose={() => setShowMap(false)}
          targetGrid={mapTargetGrid}
        />

        <LoginView  
          isVisible={showLogin} 
          onClose={() => setShowLogin(false)} 
          onLogin={() => setIsAuthenticated(true)} 
        />

        <CraterAnalysisView 
          isVisible={currentView === 'crater'}
          onClose={() => setCurrentView('hero')}
        />

        <FOCalculatorView 
          type={['flash_to_bang', 'mil_formula', 'sine_rule', 'ot_factor', 'lateral_shift', 'range_bracketing', 'height_of_burst', 'moving_target', 'smoke_screen'].includes(currentView as string) ? (currentView as FOCalcType) : null}
          onClose={() => setCurrentView('hero')}
        />

      </section>

    </div>
    </ReportProvider>
  );
}

export default App;
