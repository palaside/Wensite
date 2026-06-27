import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalM2CompassProps {
  isVisible: boolean;
  onClose?: () => void;
  onSave?: (mode: 'azimuth' | 'clinometer', value: string) => void;
}

export function DigitalM2Compass({ isVisible, onClose, onSave }: DigitalM2CompassProps) {
  const [heading, setHeading] = useState(0); // 0-360 true north if possible
  const [beta, setBeta] = useState(0);       // Pitch (-180 to 180)
  const [gamma, setGamma] = useState(0);     // Roll (-90 to 90)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const [isLocked, setIsLocked] = useState(false);
  const [azimuthUnit, setAzimuthUnit] = useState<'mils' | 'degrees'>('mils');
  
  const isLockedRef = React.useRef(isLocked);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Auto-switch mode based on Pitch (Beta). 
  // Beta close to 0 = flat (Azimuth mode).
  // Beta > 45 = upright (Clinometer mode).
  const isClinometerMode = Math.abs(beta) >= 45;

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
          alert('ต้องอนุญาตให้เข้าถึงเซนเซอร์เพื่อใช้งานเข็มทิศดิจิทัล (Device Orientation Permission Denied)');
        }
      } catch (error) {
        console.error(error);
        setPermissionGranted(false);
      }
    } else {
      // Non-iOS 13+ devices or devices that don't require explicit permission
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!isVisible || !permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (isLockedRef.current) return;
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

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isVisible, permissionGranted]);

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
      <div className="fixed bottom-6 right-6 z-[300] origin-bottom-right scale-[0.8] xl:scale-90 pointer-events-none">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-[380px] bg-[#111]/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto"
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

          {!permissionGranted ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-orange-900/20 rounded-full flex items-center justify-center mx-auto border border-orange-500/30">
                <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-2">เปิดใช้งานเซนเซอร์</h3>
                <p className="text-gray-400 text-sm">แอปพลิเคชันจำเป็นต้องเข้าถึง Gyroscope และ Magnetometer เพื่อจำลองการทำงานของเข็มทิศ M.2 อย่างแม่นยำ</p>
              </div>
              <button onClick={requestAccess} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-lg shadow-orange-900/50">
                อนุญาต (Request Access)
              </button>
            </div>
          ) : (
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
                {!isClinometerMode && (
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
                    <div className="relative w-80 h-80 rounded-full flex items-center justify-center shadow-2xl overflow-hidden bg-[#111]">
                      {/* Background Image */}
                      <img src="/M.2/m2_compass_model.png" alt="Compass Dial" className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* Patch to hide original needle (points up from center) */}
                      <div className="absolute top-[10%] left-[50%] w-[12px] h-[40%] bg-[#161616] z-10 transform -translate-x-1/2 blur-[2px]"></div>
                      <div className="absolute top-[14%] left-[50%] w-[30px] h-[30px] bg-[#161616] z-10 transform -translate-x-1/2 rounded-full blur-[3px]"></div>
                      
                      {/* Rotating Smart Needle */}
                      <motion.div 
                        className="absolute w-[4px] h-[70%] origin-center z-20"
                        animate={{ rotate: displayHeading }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      >
                         <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full transition-colors duration-300" style={{ backgroundColor: needleColor }}></div>
                         {needleColor === '#1A1A1A' && (
                           <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full border border-gray-700"></div>
                         )}
                         <div className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-full bg-white/20"></div>
                         <div className="absolute top-1/2 left-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-white shadow-md"></div>
                      </motion.div>
                      
                      {/* Center Display */}
                      <div className="z-10 bg-black/80 backdrop-blur-md rounded-full w-28 h-28 flex flex-col items-center justify-center border border-gray-800 shadow-xl">
                        <div className="text-3xl font-bold font-mono text-orange-400 leading-none">{displayValue}</div>
                        <div className="text-[10px] text-gray-500 tracking-widest mt-1 uppercase">{azimuthUnit}</div>
                        {!isNorthbound && <div className="text-[8px] text-red-500 font-bold mt-1">SOUTHBOUND (+180)</div>}
                      </div>
                    </div>

                    {/* Validation Message & Save Button */}
                    <div className="w-full mt-6 flex flex-col gap-3">
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
                {isClinometerMode && (
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
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
