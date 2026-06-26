import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalM2CompassProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (mode: 'azimuth' | 'clinometer', value: string) => void;
}

export function DigitalM2Compass({ isVisible, onClose, onSave }: DigitalM2CompassProps) {
  const [heading, setHeading] = useState(0); // 0-360 true north if possible
  const [beta, setBeta] = useState(0);       // Pitch (-180 to 180)
  const [gamma, setGamma] = useState(0);     // Roll (-90 to 90)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

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

  // Calculations
  const currentMils = Math.round((heading / 360) * 6400) % 6400;
  
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-[#111] border border-orange-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-orange-500/20 bg-black/50">
            <h2 className="text-orange-400 font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              DIGITAL M.2 COMPASS
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-orange-400"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
              
              {/* Mode Indicator */}
              <div className="flex justify-center gap-2 mb-4">
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${!isClinometerMode ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>Azimuth Mode</div>
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${isClinometerMode ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>Clinometer Mode</div>
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
                    <div className="relative w-64 h-64 rounded-full border-8 border-gray-800 bg-black flex items-center justify-center shadow-2xl">
                      {/* Fixed indicator line (pointing up) */}
                      <div className="absolute top-0 w-[2px] h-4 bg-orange-500 z-20"></div>
                      
                      <motion.div 
                        className="absolute w-full h-full rounded-full"
                        style={{ backgroundImage: "radial-gradient(circle, #1a1a1a 40%, #000 70%)" }}
                        animate={{ rotate: -heading }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                      >
                        {/* Custom Mils Ticks */}
                        {[...Array(16)].map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute top-0 left-1/2 -ml-[1px] w-[2px] h-full origin-center"
                            style={{ transform: `rotate(${i * (360 / 16)}deg)` }}
                          >
                            <div className={`w-[2px] ${i % 4 === 0 ? 'h-4 bg-orange-500' : 'h-2 bg-gray-500'}`}></div>
                            {i % 4 === 0 && (
                              <div className="absolute -left-3 top-5 text-[10px] text-gray-400 font-mono font-bold w-6 text-center" style={{ transform: `rotate(-${i * (360 / 16)}deg)` }}>
                                {i * 400}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                      
                      {/* Center Display */}
                      <div className="z-10 bg-black/80 backdrop-blur-md rounded-full w-28 h-28 flex flex-col items-center justify-center border border-gray-800 shadow-xl">
                        <div className="text-3xl font-bold font-mono text-orange-400 leading-none">{currentMils}</div>
                        <div className="text-[10px] text-gray-500 tracking-widest mt-1">MILS</div>
                      </div>
                    </div>

                    {/* Validation Message & Save Button */}
                    <div className="w-full mt-8">
                      <div className="text-center mb-4 min-h-[2rem]">
                        {!isAzimuthValid ? (
                          <span className="text-yellow-500/80 text-sm animate-pulse">⚠️ กรุณาวางเครื่องให้ได้ระดับ (ฟองอากาศอยู่ตรงกลาง)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-sm">✅ ได้ระดับพร้อมบันทึกค่ามุมทิศ</span>
                        )}
                      </div>
                      <button
                        disabled={!isAzimuthValid}
                        onClick={() => onSave('azimuth', currentMils.toString())}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all
                          ${isAzimuthValid 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        บันทึกค่ามุมทิศข้าศึก
                      </button>
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

                    <div className="mt-8 text-center w-full">
                      <div className="text-4xl font-bold font-mono text-blue-400 mb-1">{clinometerAngle}°</div>
                      <div className="text-xs text-gray-500 tracking-widest uppercase mb-6">Vertical Angle</div>

                      <div className="text-center mb-4 min-h-[2rem]">
                        {!isClinometerValid ? (
                          <span className="text-yellow-500/80 text-sm animate-pulse">⚠️ รักษาตัวเครื่องไม่ให้ตะแคงซ้าย/ขวา</span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-sm">✅ ได้ระดับพร้อมบันทึกมุมตก</span>
                        )}
                      </div>
                      
                      <button
                        disabled={!isClinometerValid}
                        onClick={() => onSave('clinometer', clinometerAngle.toString())}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all
                          ${isClinometerValid 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        บันทึกค่ามุมดิ่ง (มุมตก)
                      </button>
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
