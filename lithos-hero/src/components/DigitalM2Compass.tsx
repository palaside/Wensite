import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalM2CompassProps {
  isVisible: boolean;
  onClose?: () => void;
  onSave?: (mode: 'azimuth' | 'clinometer', value: string) => void;
  customPositionClass?: string;
}

export function DigitalM2Compass({ isVisible, onClose, onSave, customPositionClass }: DigitalM2CompassProps) {
  const [heading, setHeading] = useState(0); // 0-360 true north if possible
  const [beta, setBeta] = useState(0);       // Pitch (-180 to 180)
  const [gamma, setGamma] = useState(0);     // Roll (-90 to 90)
  const [isLocked, setIsLocked] = useState(false);
  const [azimuthUnit, setAzimuthUnit] = useState<'mils' | 'degrees'>('mils');
  const [hasReceivedEvent, setHasReceivedEvent] = useState(false);
  
  const [isTestMode, setIsTestMode] = useState(false);
  const isTestModeRef = React.useRef(isTestMode);
  
  // iOS Permission State
  const [needsPermission, setNeedsPermission] = useState<boolean>(
    typeof (DeviceOrientationEvent as any) !== 'undefined' && 
    typeof (DeviceOrientationEvent as any).requestPermission === 'function'
  );
  
  useEffect(() => {
    isTestModeRef.current = isTestMode;
  }, [isTestMode]);
  
  const isLockedRef = React.useRef(isLocked);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Auto-switch mode based on Pitch (Beta). 
  const isClinometerMode = Math.abs(beta) >= 45;

  const compassRingRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!compassRingRef.current) return;
    const rect = compassRingRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
    let angleDeg = (angleRad * 180) / Math.PI + 90; // offset so 0 is up
    if (angleDeg < 0) angleDeg += 360;
    setHeading(angleDeg);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hasReceivedEvent || isLocked || isTestMode) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!isVisible || needsPermission) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (isLockedRef.current || isTestModeRef.current) return;
      
      // We got orientation data, so mark that the sensor is working
      if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        setHasReceivedEvent(true);
      }

      let h = 0;
      // Use webkitCompassHeading if available (iOS True North), otherwise fallback to alpha
      if ((event as any).webkitCompassHeading !== undefined) {
        h = (event as any).webkitCompassHeading;
      } else {
        h = event.alpha ? 360 - event.alpha : 0; // standard alpha is counter-clockwise
      }
      setHeading(h);
      setBeta(event.beta || 0);
      setGamma(event.gamma || 0);
    };

    const hasAbsolute = 'ondeviceorientationabsolute' in window;
    if (hasAbsolute) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (hasAbsolute) {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      } else {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isVisible, needsPermission]);
  
  const requestIOSPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setNeedsPermission(false);
        } else {
          alert('ต้องอนุญาตเซนเซอร์ก่อนจึงจะใช้งานเข็มทิศได้');
        }
      }
    } catch (error) {
      console.error(error);
      alert('HTTPS required for sensors on this device.');
    }
  };

  // --- Smart Pointer Logic (Azimuth) ---
  const normHeading = ((heading % 360) + 360) % 360;
  // Northbound: 270 to 360 OR 0 to 90
  const isNorthbound = normHeading >= 270 || normHeading <= 90;
  
  // Southbound: needle points south, but reading is reversed (+180)
  const displayHeading = isNorthbound ? normHeading : (normHeading + 180) % 360;
  const needleColor = isNorthbound ? '#EF4444' : '#1A1A1A'; 
  
  const displayMils = Math.round((displayHeading / 360) * 6400) % 6400;
  const displayDegrees = Math.round(displayHeading);
  const displayValue = azimuthUnit === 'mils' ? displayMils : displayDegrees;
  
  const backAzimuth = azimuthUnit === 'mils'
    ? (displayValue < 3200 ? displayValue + 3200 : displayValue - 3200)
    : (displayValue < 180 ? displayValue + 180 : displayValue - 180);

  // Bull's-eye bubble logic (Azimuth mode)
  const maxBubbleMove = 45; // max pixel distance
  // Clamp values so bubble stays inside the circle
  const bubbleX = Math.max(-maxBubbleMove, Math.min(maxBubbleMove, gamma * 2.5));
  const bubbleY = Math.max(-maxBubbleMove, Math.min(maxBubbleMove, beta * 2.5));
  
  // Validation: phone must be flat (within ±3 degrees)
  const isAzimuthValid = Math.abs(beta) < 3 && Math.abs(gamma) < 3;

  // Clinometer logic
  // Typically clinometer is read when phone is upright.
  // So angle of fall is 90 - beta if placing the back of phone.
  // If placing the bottom edge on the stick, beta is the angle.
  const clinometerAngle = Math.round(Math.abs(beta));
  
  // Barrel bubble for clinometer (ensure phone is not tilted left/right)
  const isClinometerValid = Math.abs(gamma) < 4; 
  const barrelBubbleX = Math.max(-40, Math.min(40, gamma * 3));

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className={`
        ${customPositionClass ? customPositionClass + ' pointer-events-auto' : 'fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-6 md:right-6 scale-[0.8] md:scale-90 xl:scale-100 pointer-events-none'}
        ${customPositionClass ? customPositionClass : 'fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-6 md:right-6 scale-[0.8] md:scale-90 xl:scale-100'}
        z-[300] origin-bottom md:origin-top-right
      `}>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-[380px] bg-[#111]/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-orange-500/20 bg-black/60">
            <h2 className="text-orange-400 font-bold text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              DIGITAL M.2 COMPASS
            </h2>
            {onClose && (
              <button onClick={onClose} className="text-gray-500 hover:text-orange-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="p-6 space-y-6 relative">
            
            {/* Mode Indicator & Unit Toggle */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="flex justify-center gap-2">
                  <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${!isClinometerMode ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>Azimuth Mode</div>
                  <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${isClinometerMode ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>Clinometer Mode</div>
                </div>
                {!isClinometerMode && (
                  <div className="flex bg-black rounded-lg border border-gray-800 p-1">
                    <button 
                      onClick={() => setAzimuthUnit('degrees')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${azimuthUnit === 'degrees' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                    >
                      0-360°
                    </button>
                    <button 
                      onClick={() => setAzimuthUnit('mils')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${azimuthUnit === 'mils' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                    >
                      0-6400₥
                    </button>
                  </div>
                )}
              </div>

              {/* AZIMUTH MODE */}
              <AnimatePresence mode="wait">
                
                {needsPermission ? (
                  <motion.div key="permission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-80 bg-black/50 rounded-2xl border border-orange-500/30 p-6 text-center">
                    <div className="text-4xl mb-4 animate-bounce">📱</div>
                    <h3 className="text-orange-400 font-bold mb-2">เชื่อมต่อเซนเซอร์</h3>
                    <p className="text-gray-400 text-xs mb-6">อุปกรณ์ของคุณ (iOS) บังคับให้กดยืนยันก่อนใช้งานเซนเซอร์เข็มทิศ</p>
                    <button 
                      onClick={requestIOSPermission}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all uppercase tracking-wider text-sm w-full"
                    >
                      กดเพื่อเปิดเข็มทิศ
                    </button>
                  </motion.div>
                ) : !isClinometerMode && (
                  <motion.div key="azimuth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
                    
                    {/* Bull's-eye Bubble Level */}
                    <div className="mb-6 relative w-24 h-24 rounded-full border-4 border-gray-700 bg-gray-900 flex items-center justify-center shadow-inner shadow-black">
                      <div className="absolute w-8 h-8 rounded-full border border-orange-500/50"></div>
                      <div className="absolute w-16 h-16 rounded-full border border-white/10"></div>
                      <motion.div 
                        className={`w-6 h-6 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.5),0_0_10px_rgba(255,255,255,0.2)] transition-colors ${isAzimuthValid ? 'bg-emerald-400/90' : 'bg-yellow-400/80'}`}
                        animate={{ x: bubbleX, y: bubbleY }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                      {/* Crosshairs */}
                      <div className="absolute w-full h-[1px] bg-white/20"></div>
                      <div className="absolute h-full w-[1px] bg-white/20"></div>
                    </div>

                    {/* Compass Ring */}
                    <div 
                      ref={compassRingRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className={`relative w-80 h-80 rounded-full flex items-center justify-center shadow-2xl overflow-hidden bg-[#111] touch-none ${!hasReceivedEvent && !isLocked && !isTestMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      {/* Background Image */}
                      <img src="/M.2/m2_compass_model.png" alt="Compass Dial" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                      
                      {/* Patch to hide original needle (points up from center) */}
                      <div className="absolute top-[10%] left-[50%] w-[12px] h-[40%] bg-[#161616] z-10 transform -translate-x-1/2 blur-[2px] pointer-events-none"></div>
                      <div className="absolute top-[14%] left-[50%] w-[30px] h-[30px] bg-[#161616] z-10 transform -translate-x-1/2 rounded-full blur-[3px] pointer-events-none"></div>
                      
                      {/* Rotating Smart Needle */}
                      <motion.div 
                        className="absolute w-[4px] h-[70%] origin-center z-20 flex flex-col pointer-events-none"
                        animate={{ rotate: displayHeading }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      >
                         <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full transition-colors duration-300 pointer-events-none" style={{ backgroundColor: needleColor }}></div>
                         {needleColor === '#1A1A1A' && (
                           <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full border border-gray-700 pointer-events-none"></div>
                         )}
                         <div className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-full bg-white/20 pointer-events-none"></div>
                         <div className="absolute top-1/2 left-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none"></div>
                      </motion.div>
                      
                      {/* Center Display */}
                      <div className="z-10 bg-black/80 backdrop-blur-md rounded-full w-28 h-28 flex flex-col items-center justify-center border border-gray-800 shadow-xl relative pointer-events-none">
                        <div className="text-3xl font-bold font-mono text-orange-400 leading-none">{displayValue}</div>
                        <div className="text-[10px] text-gray-500 tracking-widest mt-1 uppercase">{azimuthUnit}</div>
                        {!isNorthbound && <div className="text-[8px] text-red-500 font-bold mt-1">SOUTHBOUND (+180)</div>}
                      </div>
                    </div>

                    {!hasReceivedEvent && !isTestMode && (
                      <div className="text-[10px] text-gray-400 mt-2 text-center border border-gray-800 bg-black/40 py-1 px-3 rounded-full animate-pulse select-none">
                        🖱️ คลิกค้างแล้วลากหมุนวงกลมเข็มทิศเพื่อปรับทิศทางได้
                      </div>
                    )}

                    {/* Back Azimuth Box */}
                    <div className="w-[85%] mt-5 flex justify-between items-center bg-gray-900/80 border border-orange-500/20 px-4 py-2.5 rounded-xl shadow-lg">
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">มุมสกัดกลับ<br/><span className="text-[8px] text-gray-500">BACK AZIMUTH</span></div>
                      <div className="text-orange-400 font-mono text-xl font-bold">{backAzimuth} <span className="text-sm">{azimuthUnit === 'mils' ? '₥' : '°'}</span></div>
                    </div>

                    {/* Validation Message & Save Button */}
                    <div className="w-full mt-4 flex flex-col gap-3">
                      <div className="text-center min-h-[1.5rem]">
                        {!isAzimuthValid ? (
                          <span className="text-yellow-500/80 text-xs animate-pulse">⚠️ กรุณาวางเครื่องให้ได้ระดับ (ฟองอากาศอยู่ตรงกลาง)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-xs">✅ ได้ระดับพร้อมอ่านค่า</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLocked(!isLocked)}
                          className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all border text-xs
                            ${isLocked 
                              ? 'bg-red-900/50 text-red-400 border-red-500/50 shadow-inner' 
                              : 'bg-black text-gray-400 border-gray-700 hover:bg-gray-900'}`}
                        >
                          {isLocked ? '🔒 UNLOCKED' : '🔓 HOLD'}
                        </button>
                        
                        {onSave && (
                          <button
                            disabled={!isAzimuthValid}
                            onClick={() => onSave('azimuth', displayValue.toString())}
                            className={`flex-[2] py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all text-xs
                              ${isAzimuthValid 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                          >
                            บันทึกค่ามุมทิศข้าศึก
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CLINOMETER MODE */}
                {!needsPermission && isClinometerMode && (
                  <motion.div key="clinometer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center">
                    
                    {/* Barrel Bubble Level */}
                    <div className="mb-6 relative w-48 h-8 rounded-full border-2 border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center">
                      <div className="absolute w-8 h-full border-l border-r border-white/20"></div>
                      <motion.div 
                        className={`w-12 h-6 rounded-full shadow-inner transition-colors ${isClinometerValid ? 'bg-emerald-400/90' : 'bg-blue-400/80'}`}
                        animate={{ x: barrelBubbleX }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </div>

                    {/* Clinometer Arc */}
                    <div className="relative w-64 h-32 bg-black border-4 border-b-0 border-gray-800 rounded-t-full overflow-hidden flex items-end justify-center pt-8">
                      {/* Arc Ticks */}
                      {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
                        <div 
                          key={deg} 
                          className="absolute bottom-0 w-[2px] h-[120px] origin-bottom"
                          style={{ transform: `rotate(${deg - 90}deg)` }}
                        >
                          <div className="w-full h-3 bg-gray-500"></div>
                          <div className="absolute -top-5 -left-2 text-[10px] text-gray-400 font-mono font-bold w-4 text-center" style={{ transform: `rotate(-${deg - 90}deg)` }}>
                            {deg}°
                          </div>
                        </div>
                      ))}
                      
                      {/* Pendulum Indicator */}
                      <motion.div 
                        className="absolute bottom-0 w-[4px] h-[130px] bg-blue-500 origin-bottom shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10"
                        animate={{ rotate: clinometerAngle - 90 }} // Map 0-90 to -90-0 range visually
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      >
                        <div className="absolute top-0 -left-1 w-3 h-3 bg-white rounded-full"></div>
                      </motion.div>
                      
                      {/* Center Hub */}
                      <div className="absolute bottom-[-10px] w-8 h-8 rounded-full bg-gray-700 border-4 border-gray-900 z-20"></div>
                    </div>

                    <div className="w-full mt-6">
                      <div className="text-center mb-3 min-h-[1.5rem]">
                        {!isClinometerValid ? (
                          <span className="text-yellow-500/80 text-xs animate-pulse">⚠️ เครื่องเอียงซ้าย/ขวา กรุณาปรับระดับน้ำให้ตรง</span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-xs">✅ ได้ระดับมุมดิ่ง</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLocked(!isLocked)}
                          className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all border text-xs
                            ${isLocked 
                              ? 'bg-red-900/50 text-red-400 border-red-500/50 shadow-inner' 
                              : 'bg-black text-gray-400 border-gray-700 hover:bg-gray-900'}`}
                        >
                          {isLocked ? '🔒 UNLOCKED' : '🔓 HOLD'}
                        </button>
                        
                        {onSave && (
                          <button
                            disabled={!isClinometerValid}
                            onClick={() => onSave('clinometer', clinometerAngle.toString())}
                            className={`flex-[2] py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all text-xs
                              ${isClinometerValid 
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                          >
                            บันทึกค่ามุมดิ่ง (มุมตก)
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Desktop Test Mode Slider */}
              <div className="w-full mt-2 pt-4 border-t border-gray-800/50 flex flex-col gap-3">
                <button 
                  onClick={() => setIsTestMode(!isTestMode)}
                  className={`py-2 px-3 rounded-lg font-bold uppercase tracking-wider transition-all border text-[10px] w-full text-center
                    ${isTestMode 
                      ? 'bg-orange-900/40 text-orange-400 border-orange-500/50 shadow-inner' 
                      : 'bg-black text-gray-500 border-gray-800 hover:bg-gray-900'}`}
                >
                  {isTestMode ? '💻 ปิดโหมดจำลอง (TURN OFF SIMULATOR)' : '💻 เปิดโหมดจำลองบนคอม (DESKTOP SIMULATOR)'}
                </button>
                
                {isTestMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-3 bg-black/40 p-3 rounded-lg border border-gray-800">
                    <div className="flex gap-3 items-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase w-12">Azimuth</span>
                      <input 
                        type="range" min="0" max="360" 
                        value={heading} 
                        onChange={(e) => setHeading(Number(e.target.value))}
                        className="flex-1 accent-orange-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-ew-resize"
                      />
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase w-12">Pitch</span>
                      <input 
                        type="range" min="-90" max="90" 
                        value={beta} 
                        onChange={(e) => setBeta(Number(e.target.value))}
                        className="flex-1 accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-ew-resize"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
