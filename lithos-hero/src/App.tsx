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
import { FDCalculatorView } from './components/FDCalculatorView';
import type { FDCalcType } from './components/FDCalculatorView';
import { CraterAnalysisView } from './components/CraterAnalysisView';
import { DigitalM2Compass } from './components/DigitalM2Compass';
import { M17PlottingBoard } from './components/M17PlottingBoard';
import { MilitaryFormsPreview } from './components/MilitaryFormsPreview';
import { TacticalHudView } from './pages/TacticalHudView';
import { MobileSidebar } from './components/MobileSidebar';

import { WeaponsAmmunitionView } from './components/WeaponsAmmunitionView';
import { M2ManualView } from './components/M2ManualView';
import { HowitzerMotionView } from './components/HowitzerMotionView';
import { useFDC } from './context/FDCContext';
import { FDCDesktopManager } from './components/FDCDesktopManager';

const BG_IMAGE_1 = '/BG.png';
const BG_IMAGE_2 = '/bg-reveal.png';

type ViewState = 'hero' | 'report' | 'm17' | 'deflection' | 'crater' | 'wa_fuze' | 'wa_ammo' | 'wa_safety' | 'm2_manual' | 'howitzer_motion' | FOCalcType | FDCalcType | 'tactical_hud';

function App() {
  const { openWindow } = useFDC();
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [currentView, setCurrentView] = useState<ViewState>('hero');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showCompass, setShowCompass] = useState(false);
  const [showTargetList, setShowTargetList] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentOtFactor, setAdjustmentOtFactor] = useState(0);
  const [mapTargetGrid, setMapTargetGrid] = useState<string | undefined>(undefined);
  const [activeModeId, setActiveModeId] = useState('HS');
  const [surveillanceMethod, setSurveillanceMethod] = useState<'grid' | 'polar' | 'shift' | null>(null);
  const [selectedKnownTarget, setSelectedKnownTarget] = useState<TargetData | undefined>(undefined);
  
  // Fixed positions for the right panel: FO (Top), FL/SL, HS, FD
  const ALL_MODES = ['FO', 'FL', 'HS', 'FD', 'WA'];
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
    <div className="min-h-screen bg-black print:bg-white print:min-h-0 tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navigation (fixed, over hero) */}
      <nav className={`fixed top-0 left-0 right-0 z-[120] flex items-center justify-between p-4 sm:p-5 transition-opacity duration-500 ${currentView !== 'hero' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView('hero')}
        >
          {/* M17 Logo removed per user request */}
        </div>

        {isAuthenticated && (
          <div className="flex flex-row absolute right-4 top-4 md:static md:left-1/2 md:top-auto md:-translate-x-1/2 items-center gap-2 mt-0 md:mt-0 z-[130]">
            <button 
              onClick={() => setShowTargetList(true)}
              className="bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-700/50 text-emerald-400 font-bold py-1.5 px-3 md:py-2 md:px-6 rounded-lg uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 text-xs md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              <span className="hidden sm:inline">Target List</span>
            </button>
            <button 
              onClick={() => {
                setMapTargetGrid(undefined);
                setShowMap(true);
              }}
              className="bg-cyan-900/50 hover:bg-cyan-800/80 border border-cyan-700/50 text-cyan-400 font-bold py-1.5 px-3 md:py-2 md:px-6 rounded-lg uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 text-xs md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              <span className="hidden sm:inline">Map</span>
            </button>
            <button 
              onClick={() => setShowCompass(!showCompass)}
              className="bg-amber-900/50 hover:bg-amber-800/80 border border-amber-700/50 text-amber-400 font-bold py-1.5 px-3 md:py-2 md:px-6 rounded-lg uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 text-xs md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              <span className="hidden sm:inline">M.2</span>
            </button>
          </div>
        )}

        {/* Login/Commander button removed from top nav */}
      </nav>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden h-[100dvh] bg-black print:bg-white print:h-auto print:overflow-visible">
        
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
              {/* Video Background removed to clear unwanted text */}
              {/* Dark Gradient Overlay for completely black theme with subtle glow */}
              <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none"></div>
            </>
          )}
        </div>

        {/* Reveal Layer (Flashlight) - Show only before login */}
        {!isAuthenticated && (
          <>
            <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-700 ${currentView !== 'hero' ? 'opacity-0' : 'opacity-100'}`}>
              <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />
            </div>
            
            {/* Login Button & Footer Developer Text */}
            <div className={`fixed bottom-4 sm:bottom-8 md:bottom-10 left-0 right-0 z-[999999] flex flex-col items-center justify-end transition-opacity duration-700 ${currentView !== 'hero' || showLogin ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Login container clicked!');
                  setShowLogin(true);
                }}
                style={{ pointerEvents: 'auto' }}
                className="mb-4 sm:mb-6 md:mb-8 relative cursor-pointer group transform transition-all duration-300 hover:scale-[1.03] active:scale-95 rounded-full flex items-center justify-center w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px]"
              >
                {/* 3D Convex Glass Effect Behind the Image */}
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Glass border clicked!');
                    setShowLogin(true);
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-black/10 border border-white/40 shadow-[inset_0_2px_6px_rgba(255,255,255,0.5),_0_8px_16px_rgba(0,0,0,0.6)] backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-opacity -translate-x-1 sm:-translate-x-1.5 -translate-y-0.5 cursor-pointer"
                ></div>

                <img 
                  src="/Login.png" 
                  alt="Login" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Image clicked!');
                    setShowLogin(true);
                  }}
                  className="relative z-10 w-[98%] h-[98%] object-contain drop-shadow-lg block cursor-pointer" 
                />
              </button>
              
              <div className="text-center text-white font-semibold tracking-wide leading-relaxed pt-3 pb-2 px-4 sm:px-6 md:px-8 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_1px_3px_rgba(255,255,255,0.1)] w-auto max-w-[90%] md:max-w-[80%]">
                <p className="text-cyan-400 mb-1 sm:mb-2 font-bold text-[10px] sm:text-xs md:text-sm tracking-widest uppercase opacity-90">Developed by</p>
                <p className="drop-shadow-lg text-[13px] sm:text-[15px] md:text-[17px] mb-1 leading-tight sm:leading-normal">Sergeant Major 1st Class (Special) Nuttachai Luxsavong</p>
                <p className="text-gray-300 drop-shadow-md text-[10px] sm:text-xs md:text-sm leading-tight sm:leading-normal">Firing Section Sergeant, Firing Battery Command Post</p>
                <p className="text-gray-300 drop-shadow-md text-[10px] sm:text-xs md:text-sm leading-tight sm:leading-normal">4th Field Artillery Battalion, 4th Field Artillery Regiment.</p>
              </div>
            </div>
          </>
        )}

        {/* Authenticated Dashboard Layout */}
        {isAuthenticated && currentView === 'hero' && (
          <MobileSidebar activeModeId={activeModeId} setActiveModeId={setActiveModeId} />
        )}
        
        {isAuthenticated && currentView === 'hero' && (
          <div className="absolute inset-0 z-20 flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between px-6 sm:px-8 md:px-16 pt-24 md:pt-24 pb-8 overflow-hidden">

            {/* Left Panel: Mode Title and Actions */}
            <div className="flex flex-col justify-start lg:justify-center gap-2 lg:gap-8 w-full lg:w-[60%] hero-anim hero-fade h-full pl-0 md:pl-12 z-30 pb-2 lg:pb-0 pt-4 lg:pt-0">
              <div className="text-white font-bold tracking-tight drop-shadow-2xl mt-0 flex flex-row items-center justify-between lg:justify-start gap-4 w-full sm:w-auto pr-4 sm:pr-0">
                <div className="flex flex-col">
                  {activeModeId === 'HS' && (
                    <><div className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl mb-0 lg:mb-2 leading-[0.9]">Howitzer</div><div className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl text-gray-300 leading-[0.9]">Section</div></>
                  )}
                  {activeModeId === 'FO' && (
                    <><div className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl mb-0 lg:mb-2 leading-[0.9]">Forward</div><div className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl text-gray-300 leading-[0.9]">Observer</div></>
                  )}
                  {activeModeId === 'FD' && (
                    <><div className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl mb-0 lg:mb-2 leading-[0.9]">Fire</div><div className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl text-gray-300 leading-[0.9]">Direction</div></>
                  )}
                  {activeModeId === 'FL' && (
                    <><div className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl mb-0 lg:mb-2 tracking-tight leading-[0.9]">Surveillance</div></>
                  )}
                  {activeModeId === 'WA' && (
                    <><div className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl mb-0 lg:mb-2 tracking-tight leading-[0.85]">Weapons &</div><div className="text-xl sm:text-3xl lg:text-5xl xl:text-6xl text-gray-300 leading-[0.9]">Ammunition</div></>
                  )}
                </div>
                <img src={`/${activeModeId}.png`} alt={activeModeId} className="w-14 h-14 sm:w-20 sm:h-20 lg:hidden object-contain drop-shadow-lg shrink-0 ml-auto" onError={(e) => { e.currentTarget.style.display='none'; }} />
              </div>
              
              <div className="flex flex-col gap-2 mt-1 w-full max-w-[500px] flex-1 overflow-hidden">
                {activeModeId === 'HS' && (
                  <>
                    <button onClick={() => setCurrentView('report')} className="glass-card-btn">
                      Report
                    </button>
                    <button onClick={() => setCurrentView('m17')} className="glass-card-btn border-blue-500/50 hover:bg-blue-900/30">
                      M.17 (Plotting Dashboard)
                    </button>
                    <button onClick={() => setCurrentView('deflection')} className="glass-card-btn">
                      Deflection
                    </button>
                    <button onClick={() => setCurrentView('crater')} className="glass-card-btn border-orange-500/50 hover:bg-orange-900/30">
                      Crater Analysis
                    </button>
                  </>
                )}
                {activeModeId === 'FO' && (
                  <div className="grid grid-cols-2 gap-1.5 overflow-hidden">
                    {/* กล่องที่ 1: Call for Fire (วิธีขอรับการยิง) */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">1. Target Location (วิธีกำหนดพิกัด)</div>
                    <button onClick={() => setSurveillanceMethod('grid')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">1. Grid</span>
                      พิกัดกริด
                    </button>
                    <button onClick={() => setSurveillanceMethod('polar')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">2. Polar</span>
                      โพลาร์
                    </button>
                    <button onClick={() => setSurveillanceMethod('shift')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">3. Shift</span>
                      ย้ายจุดอ้างอิง
                    </button>

                    {/* กล่องที่ 2: Calculation Tools (เครื่องมือคำนวณ) */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">2. Acquisition Tools</div>
                    <button onClick={() => setCurrentView('flash_to_bang')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">4. Flash-to-Bang</span>
                      แสง-เสียง
                    </button>
                    <button onClick={() => setCurrentView('mil_formula')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">5. Mil Formula</span>
                      สูตรมิล
                    </button>
                    <button onClick={() => setCurrentView('sine_rule')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">6. Sine Rule</span>
                      กฎของไซน์
                    </button>

                    {/* กล่องที่ 3: Shift / Adjustments */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">3. Shift & Adjustment</div>
                    <button onClick={() => setCurrentView('ot_factor')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">7. OT Factor</span>
                      แฟคเตอร์ ตม.
                    </button>
                    <button onClick={() => setCurrentView('lateral_shift')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Lateral Shift</span>
                      แก้ทางข้าง
                    </button>
                    <button onClick={() => setCurrentView('range_bracketing')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Range Bracketing</span>
                      แก้ทางระยะ
                    </button>
                    <button onClick={() => setCurrentView('height_of_burst')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Height of Burst</span>
                      แก้สูงแตก
                    </button>
                    <button onClick={() => setCurrentView('moving_target')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Moving Target</span>
                      เป้าหมายเคลื่อนที่
                    </button>
                    <button onClick={() => setCurrentView('smoke_screen')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Smoke Screen</span>
                      ฉากควัน
                    </button>

                    {/* Tactical System (NEW) */}
                    <div className="col-span-2 text-cyan-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-cyan-900/50 pb-0.5">5. Tactical System</div>
                    <button onClick={() => setCurrentView('tactical_hud')} className="glass-card-btn !py-1 !text-sm col-span-2 bg-cyan-950/40 border-cyan-500/50 hover:bg-cyan-900/60">
                      <span className="block text-[9px] text-cyan-400 tracking-wider uppercase">Next-Gen Tactical HUD</span>
                      แผนที่ยุทธวิธี
                    </button>
                  </div>
                )}
                {activeModeId === 'FD' && (
                  <div className="grid grid-cols-2 gap-x-1 sm:gap-x-1.5 gap-y-0.5 sm:gap-y-1.5 overflow-hidden">
                    
                    {/* Category 1: UI & Core */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-0.5 sm:mt-0 mb-0 border-b border-emerald-900/50 pb-0.5">1. UI & Core</div>
                    <button onClick={() => openWindow('window_manager', 'Desktop Window Manager')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Window Manager</span>
                      จัดการหน้าต่าง
                    </button>
                    <button onClick={() => openWindow('system_setup', 'System Setup')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">System Setup</span>
                      ค่าฐานยิง
                    </button>

                    {/* Category 2: Target Intelligence */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-1 sm:mt-2 mb-0 border-b border-emerald-900/50 pb-0.5">2. Target Intelligence</div>
                    <button onClick={() => openWindow('fo_processing', 'FO Processing')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">FO Processing</span>
                      รับคำขอยิง
                    </button>
                    <button onClick={() => openWindow('target_list_db', 'Target List DB')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Target List DB</span>
                      บัญชีเป้าหมาย
                    </button>

                    {/* Category 3: MET & Firing Tables */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-1 sm:mt-2 mb-0 border-b border-emerald-900/50 pb-0.5">3. Met & Firing Tables</div>
                    <button onClick={() => openWindow('firing_table_integration', 'Real Firing Table Integration')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Firing Table</span>
                      คัมภีร์ตารางยิง
                    </button>
                    <button onClick={() => openWindow('met_message_entry', 'MET Message Entry')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">MET Message</span>
                      ข่าวอากาศ
                    </button>

                    {/* Category 4: Advanced Ballistics */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-1 sm:mt-2 mb-0 border-b border-emerald-900/50 pb-0.5">4. Advanced Ballistics</div>
                    <button onClick={() => openWindow('basic_geometry', 'Basic Geometry')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Basic Geometry</span>
                      พิกัดภูมิศาสตร์
                    </button>
                    <button onClick={() => openWindow('linear_interpolation', 'Linear Interpolation')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Linear Interp.</span>
                      บัญญัติไตรยางศ์
                    </button>
                    <button onClick={() => openWindow('vector_splitting', 'Vector Splitting & MET')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Vector Splitting</span>
                      แตกเวกเตอร์ลม
                    </button>
                    <button onClick={() => openWindow('individual_gun', 'Individual Gun Corrections')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Gun Corrections</span>
                      ตัวแก้ปืน 6 กระบอก
                    </button>

                    {/* Category 5: Logistics */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-1 sm:mt-2 mb-0 border-b border-emerald-900/50 pb-0.5">5. Logistics</div>
                    <button onClick={() => openWindow('firing_log_ammo', 'Firing Log & Ammo Tracking')} className="glass-card-btn !py-1 !text-sm col-span-2">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Firing Log & Ammo</span>
                      บันทึกการยิงและคลังแสง
                    </button>

                    {/* Category 6: Master-Level */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[8.5px] sm:text-[10px] tracking-widest uppercase mt-1 sm:mt-2 mb-0 border-b border-cyan-900/50 pb-0.5">6. Master-Level FDC</div>
                    <button onClick={() => openWindow('spatial_engagement', 'Spatial Engagement')} className="glass-card-btn !py-1 !text-sm border-cyan-500/50 hover:bg-cyan-900/30">
                      <span className="block text-[9px] text-cyan-400 tracking-wider uppercase">Spatial Engagement</span>
                      ยิงพื้นที่ใหญ่
                    </button>
                    <button onClick={() => openWindow('registration_radar', 'Registration & Radar')} className="glass-card-btn !py-1 !text-sm border-cyan-500/50 hover:bg-cyan-900/30">
                      <span className="block text-[9px] text-cyan-400 tracking-wider uppercase">Registration</span>
                      ยิงหาหลักฐานตาบอด
                    </button>
                    <button onClick={() => openWindow('tactical_overrides', 'Tactical Overrides')} className="glass-card-btn !py-1 !text-sm border-cyan-500/50 hover:bg-cyan-900/30">
                      <span className="block text-[9px] text-cyan-400 tracking-wider uppercase">Tactical Overrides</span>
                      ยุทธวิธีฉุกเฉิน
                    </button>
                    <button onClick={() => openWindow('geodetic_convergence', 'Geodetic & Convergence')} className="glass-card-btn !py-1 !text-sm border-cyan-500/50 hover:bg-cyan-900/30">
                      <span className="block text-[9px] text-cyan-400 tracking-wider uppercase">Geodetic</span>
                      พิกัดโลกข้ามโซน
                    </button>
                  </div>
                )}
                {activeModeId === 'FL' && (
                  <div className="grid grid-cols-2 gap-1.5 overflow-hidden">
                    {/* หมวด 1 */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0 mb-0 border-b border-emerald-900/50 pb-0.5">1. Basic Surveying</div>
                    <button onClick={() => setCurrentView('slope_horizontal')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Slope→Horizontal</span>
                      ระยะลาด→ระยะราบ
                    </button>
                    <button onClick={() => setCurrentView('grid_computation')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Grid Coordinates</span>
                      หาพิกัดตาราง
                    </button>
                    <button onClick={() => setCurrentView('elevation_diff')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Elevation Diff.</span>
                      ความแตกต่างทางสูง
                    </button>
                    <button onClick={() => setCurrentView('azimuth')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Azimuth</span>
                      มุมภาคทิศทาง
                    </button>
                    <button onClick={() => setCurrentView('m2_manual')} className="glass-card-btn !py-1 !text-sm bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-800/40">
                      <span className="block text-[9px] text-emerald-300 tracking-wider uppercase">M2 Manual</span>
                      คู่มือกล้องเล็ง M2
                    </button>
                    <button onClick={() => setCurrentView('forms')} className="glass-card-btn !py-1 !text-sm border-fuchsia-500/50 hover:bg-fuchsia-900/30">
                      <span className="block text-[9px] text-fuchsia-400 tracking-wider uppercase">Forms ทบ.344</span>
                      แบบฟอร์ม (วงรอบ)
                    </button>

                    {/* หมวด 2 */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">2. Intersection & Resection</div>
                    <button onClick={() => setCurrentView('intersection')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Intersection</span>
                      สกัดตรง
                    </button>
                    <button onClick={() => setCurrentView('resection')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Resection</span>
                      สกัดกลับ
                    </button>

                    {/* หมวด 3 */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">3. Correction & Grid</div>
                    <button onClick={() => setCurrentView('survey_ppm')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Atm. PPM</span>
                      ค่าแก้บรรยากาศ
                    </button>
                    <button onClick={() => setCurrentView('relative_accuracy')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Accuracy</span>
                      ความถูกต้อง
                    </button>
                    <button onClick={() => setCurrentView('slide_grid')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Slide Grid</span>
                      เลื่อนตาราง
                    </button>
                    <button onClick={() => setCurrentView('swing_grid')} className="glass-card-btn !py-1 !text-sm">
                      <span className="block text-[9px] text-emerald-500 tracking-wider uppercase">Swing Grid</span>
                      หมุนตาราง
                    </button>

                    {/* หมวด 5 */}
                    <div className="col-span-2 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mt-0.5 mb-0 border-b border-emerald-900/50 pb-0.5">4. Gunnery</div>
                    <button onClick={() => setCurrentView('gunnery_computation')} className="glass-card-btn !py-1 !text-sm col-span-2 bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-800/40">
                      <span className="block text-[9px] text-emerald-300 tracking-wider uppercase">Firing Table Interpolation</span>
                      Gunnery Computation
                    </button>
                  </div>
                )}
                {activeModeId === 'WA' && (
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="col-span-2 text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 border-b border-emerald-900/50 pb-1">Tactical Constraints & Safety</div>
                    
                    <button onClick={() => setCurrentView('wa_fuze')} className="glass-card-btn !py-3 !text-base bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-800/40">
                      <span className="block text-[10px] text-emerald-300 mb-0.5 tracking-wider uppercase">Tab 1: Fuze Logic Center</span>
                      ระบบคำนวณและตั้งมาตราเวลาชนวน
                    </button>
                    
                    <button onClick={() => setCurrentView('wa_ammo')} className="glass-card-btn !py-3 !text-base bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-800/40">
                      <span className="block text-[10px] text-emerald-300 mb-0.5 tracking-wider uppercase">Tab 2: ICM & Adjustment Logic</span>
                      ระบบคำนวณลูกระเบิดย่อยและข้อจำกัดยุทธวิธี
                    </button>

                    <button onClick={() => setCurrentView('wa_safety')} className="glass-card-btn !py-3 !text-base bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-800/40">
                      <span className="block text-[10px] text-emerald-300 mb-0.5 tracking-wider uppercase">Tab 3: Misfire & Safety</span>
                      ระบบเตือนภัยกระสุนไม่ลั่นและทำลายส่วนบรรจุ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel: Logo Sphere */}
            <div className="flex lg:flex w-full lg:w-1/3 justify-center items-center lg:translate-x-[12rem] z-10 mt-16 lg:mt-0 mb-32 lg:mb-0">
              <div className="scale-[0.35] sm:scale-[0.45] lg:scale-100">
                <LogoSphere activeLogo={`/${activeModeId}.png`} />
              </div>
            </div>

            {/* Right Panel: Modes Selection (Hidden on Mobile/Tablet) */}
            <div className="hidden lg:flex lg:flex-col gap-6 w-1/3 relative items-end justify-start pt-16 pr-16 z-30 h-screen overflow-y-auto custom-scrollbar pb-32 bg-transparent px-0 shadow-none">
              {ALL_MODES.map((mode) => {
                  if (mode === activeModeId) {
                    return (
                      <React.Fragment key={`active-wrapper-${mode}`}>
                        {/* Desktop empty placeholder */}
                        <div className="h-[16rem] w-[16rem] shrink-0" />
                      </React.Fragment>
                    );
                  }

                  return (
                    <div 
                      key={mode}
                      className="mode-logo-inactive cursor-pointer relative shrink-0"
                      onClick={() => setActiveModeId(mode)}
                    >
                      <motion.img 
                        layoutId={`/${mode}.png`}
                        src={`/${mode}.png`} 
                        alt={mode} 
                        className="w-[4.5rem] h-[4.5rem] sm:w-[5.5rem] sm:h-[5.5rem] md:w-[16rem] md:h-[16rem] object-contain drop-shadow-2xl opacity-60 hover:opacity-100 transition-opacity"
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
          isVisible={isAuthenticated && (currentView === 'm17' || currentView === 'crater')}
          forceExpanded={showMap}
          onCloseExpanded={() => setShowMap(false)}
          targetGrid={mapTargetGrid}
        />

        <WeaponsAmmunitionView
          isVisible={['wa_fuze', 'wa_ammo', 'wa_safety'].includes(currentView as string)}
          onClose={() => setCurrentView('hero')}
          initialTab={currentView === 'wa_fuze' ? 'fuze' : currentView === 'wa_ammo' ? 'ammo' : 'safety'}
        />

        <M2ManualView
          isVisible={currentView === 'm2_manual'}
          onClose={() => setCurrentView('hero')}
        />

        <HowitzerMotionView
          isVisible={currentView === 'howitzer_motion'}
          onClose={() => setCurrentView('hero')}
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

        <FDCalculatorView 
          type={['slope_horizontal', 'grid_computation', 'elevation_diff', 'azimuth', 'survey_ppm', 'intersection', 'resection', 'relative_accuracy', 'slide_grid', 'swing_grid', 'gunnery_computation', 'gunnery_met', 'gunnery_disp', 'gunnery_special', 'gunnery_fpf', 'gunnery_advanced', 'window_manager', 'system_setup', 'fo_processing', 'target_list_db', 'firing_table_integration', 'met_message_entry', 'basic_geometry', 'linear_interpolation', 'vector_splitting', 'individual_gun', 'firing_log_ammo'].includes(currentView as string) ? (currentView as FDCalcType) : null}
          onClose={() => setCurrentView('hero')}
        />

        <MilitaryFormsPreview 
          isVisible={currentView === 'forms'}
          onClose={() => setCurrentView('hero')}
        />

        <TacticalHudView 
          isVisible={currentView === 'tactical_hud'}
          onClose={() => setCurrentView('hero')}
        />

        {/* Global Compass HUD visible when authenticated, only on m17, crater or toggled by M.2 button */}
        <DigitalM2Compass 
          isVisible={isAuthenticated && (currentView === 'm17' || currentView === 'crater' || showCompass)} 
        />
        <FDCDesktopManager />
      </section>

    </div>
    </ReportProvider>
  );
}

export default App;
