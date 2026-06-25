import React, { useState, useEffect, useRef } from 'react';
import { RevealLayer } from './components/RevealLayer';
import { ReportView } from './components/ReportView';
import { M17View } from './components/M17View';

import { DeflectionView } from './components/DeflectionView';
import { LoginView } from './components/LoginView';
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
              <video className="absolute inset-0 z-10 object-cover w-full h-full" autoPlay loop muted playsInline>
                <source src="/มกราคม_Test 654.mp4" type="video/mp4" />
                {/* Fallback for unsupported browsers */}
                Your browser does not support the video tag.
              </video>
            </>
          )}
        </div>

        {/* Reveal Layer (Flashlight) - Show only before login */}
        {!isAuthenticated && (
          <div className={`transition-opacity duration-700 ${currentView !== 'hero' ? 'opacity-0' : 'opacity-100'}`}>
            <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />
          </div>
        )}

        {/* Logo Sphere - Show only after login */}
        {isAuthenticated && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <LogoSphere logos={['/ป..png', '/ผ.png', '/ศ.png']} />
          </div>
        )}

        {/* Heading (Removed to prevent duplication with embedded image text) */}



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
