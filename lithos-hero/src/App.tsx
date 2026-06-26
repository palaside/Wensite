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
import { ReportProvider } from './context/ReportContext';
import LogoSphere from './components/LogoSphere';

const BG_IMAGE_1 = '/BG.png';
const BG_IMAGE_2 = '/bg-reveal.png';

type ViewState = 'hero' | 'report' | 'm17' | 'deflection';

function App() {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [currentView, setCurrentView] = useState<ViewState>('hero');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentOtFactor, setAdjustmentOtFactor] = useState(0);
  const [mapTargetGrid, setMapTargetGrid] = useState<string | undefined>(undefined);
  const [activeModeId, setActiveModeId] = useState('HS');
  const [surveillanceMethod, setSurveillanceMethod] = useState<'grid' | 'polar' | 'shift' | null>(null);
  
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

        {isAuthenticated ? null : (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
            <button 
              onClick={() => setCurrentView('report')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Report
            </button>
            <button 
              onClick={() => setCurrentView('m17')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              M.17
            </button>
            <button 
              onClick={() => setCurrentView('deflection')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              Deflection
            </button>
            <div className="w-px h-5 bg-white/20 mx-1"></div>
            <button 
              onClick={() => {
                setMapTargetGrid(undefined);
                setShowMap(true);
              }}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
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
                    {/* Hiding Deflection to match mockup closely which only has Report and M.17 */}
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
                {activeModeId !== 'HS' && activeModeId !== 'FL' && (
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

      </section>

    </div>
    </ReportProvider>
  );
}

export default App;
