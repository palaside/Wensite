import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CraterAnalysisViewProps {
  isVisible: boolean;
  onClose: () => void;
}

type EvidenceType = 'artillery' | 'mortar' | 'rocket' | null;

export function CraterAnalysisView({ isVisible, onClose }: CraterAnalysisViewProps) {
  const [angle1, setAngle1] = useState<string>('');
  const [angle2, setAngle2] = useState<string>('');
  const [angle3, setAngle3] = useState<string>('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(null);
  
  // Artillery state
  const [artilleryNat, setArtilleryNat] = useState<'us' | 'soviet' | null>(null);
  const [artilleryCal, setArtilleryCal] = useState<'105' | '155' | null>(null);
  
  // Mortar state
  const [mortarFins, setMortarFins] = useState<'60' | '81' | '82' | '120' | null>(null);
  
  // Rocket state
  const [rocketHoles, setRocketHoles] = useState<'107' | '122' | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Weapon Resolution Logic
  let weaponName = 'ไม่ทราบชนิด';
  let weaponNationality = 'ไม่ทราบสัญชาติ';
  let isWeaponIdentified = false;

  if (evidenceType === 'artillery' && artilleryNat && artilleryCal) {
    isWeaponIdentified = true;
    weaponNationality = artilleryNat === 'us' ? 'สหรัฐอเมริกา' : 'โซเวียต';
    weaponName = `ปืนใหญ่ (ปค.) ขนาด ${artilleryCal} มม.`;
  } else if (evidenceType === 'mortar' && mortarFins) {
    isWeaponIdentified = true;
    if (mortarFins === '60') { weaponName = 'เครื่องยิงลูกระเบิด (ค.) 60 มม.'; weaponNationality = 'สหรัฐอเมริกา'; }
    if (mortarFins === '81') { weaponName = 'เครื่องยิงลูกระเบิด (ค.) 81 มม.'; weaponNationality = 'สหรัฐอเมริกา'; }
    if (mortarFins === '82') { weaponName = 'เครื่องยิงลูกระเบิด (ค.) 82 มม.'; weaponNationality = 'โซเวียต'; }
    if (mortarFins === '120') { weaponName = 'เครื่องยิงลูกระเบิด (ค.) 120 มม.'; weaponNationality = 'โซเวียต'; }
  } else if (evidenceType === 'rocket' && rocketHoles) {
    isWeaponIdentified = true;
    if (rocketHoles === '107') { weaponName = 'จรวด 107 มม.'; weaponNationality = 'จีน'; }
    if (rocketHoles === '122') { weaponName = 'จรวด 122 มม.'; weaponNationality = 'โซเวียต'; }
  }

  // Angle Analysis Logic
  let angleStatus = null;
  let isValidAngle = false;
  if (angle1 && angle2 && angle3) {
    if (angle3 === '90' && angle1 === angle2) {
      isValidAngle = true;
      angleStatus = { type: 'success', text: `ถูกต้อง! ตามหลักเรขาคณิต มุมลูกดิ่ง (1) = มุมกระสุนตก (2) ระบบยืนยันมุมกระสุนตก = ${angle2} องศา` };
    } else if (angle3 !== '90') {
      angleStatus = { type: 'error', text: 'คำเตือน: มุมที่ 3 ต้องเป็นมุมฉาก (90 องศา) เสมอ' };
    } else if (angle1 !== angle2) {
      angleStatus = { type: 'error', text: 'คำเตือน: มุมที่ 1 ต้องมีค่าเท่ากับมุมที่ 2 (มุมแย้ง/มุมสมนัย)' };
    }
  }

  const handleSendReport = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
        // Reset states
        setAngle1('');
        setAngle2('');
        setAngle3('');
        setEvidenceType(null);
        setArtilleryNat(null);
        setArtilleryCal(null);
        setMortarFins(null);
        setRocketHoles(null);
      }, 2000);
    }, 1500);
  };

  const isFormComplete = isValidAngle && isWeaponIdentified;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a110f] border border-orange-500/30 rounded-xl shadow-2xl shadow-orange-900/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-orange-500/30 bg-gradient-to-r from-orange-900/40 to-transparent shrink-0">
              <div>
                <h2 className="text-orange-400 font-bold text-2xl tracking-wider flex items-center gap-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  CRATER ANALYSIS MODULE
                </h2>
                <p className="text-orange-500/60 text-sm mt-1 uppercase tracking-widest">ระบบวิเคราะห์หลุมระเบิด - Howitzer Section</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-orange-400 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Part 1: Angle of Fall with Image Overlay */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  วิเคราะห์มุมกระสุนตกจากหลุมระเบิด
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Image with overlays */}
                  <div className="relative rounded-lg overflow-hidden border border-orange-500/30 group">
                    <img src="/Bomb Analysis.png" alt="Crater Analysis" className="w-full h-auto" />
                    
                    {/* Overlays for angles */}
                    <div className="absolute top-[25%] right-[24%] bg-black/70 px-2 py-1 rounded text-orange-400 font-bold font-mono text-sm border border-orange-500/50 backdrop-blur-sm">
                      {angle1 ? `${angle1}°` : 'มุม 1'}
                    </div>
                    <div className="absolute bottom-[35%] left-[55%] bg-black/70 px-2 py-1 rounded text-emerald-400 font-bold font-mono text-sm border border-emerald-500/50 backdrop-blur-sm">
                      {angle2 ? `${angle2}°` : 'มุม 2'}
                    </div>
                    <div className="absolute bottom-[37%] right-[32%] bg-black/70 px-2 py-1 rounded text-blue-400 font-bold font-mono text-sm border border-blue-500/50 backdrop-blur-sm">
                      {angle3 ? `${angle3}°` : 'มุม 3'}
                    </div>
                  </div>
                  
                  {/* Inputs and Analysis */}
                  <div className="space-y-4">
                    <div className="bg-orange-950/20 p-4 rounded-lg border border-orange-500/20 text-sm text-gray-300">
                      <p className="mb-2 text-orange-400 font-semibold">ป้อนค่ามุมที่วัดได้:</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-orange-400/80 mb-1">มุม 1 (ลูกดิ่ง)</label>
                          <input type="number" value={angle1} onChange={e => setAngle1(e.target.value)} className="w-full bg-black/60 border border-orange-500/50 rounded p-2 text-center text-orange-400 focus:outline-none focus:border-orange-400 font-mono" placeholder="องศา" />
                        </div>
                        <div>
                          <label className="block text-xs text-emerald-400/80 mb-1">มุม 2 (มุมตก)</label>
                          <input type="number" value={angle2} onChange={e => setAngle2(e.target.value)} className="w-full bg-black/60 border border-emerald-500/50 rounded p-2 text-center text-emerald-400 focus:outline-none focus:border-emerald-400 font-mono" placeholder="องศา" />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-400/80 mb-1">มุม 3 (มุมฉาก)</label>
                          <input type="number" value={angle3} onChange={e => setAngle3(e.target.value)} className="w-full bg-black/60 border border-blue-500/50 rounded p-2 text-center text-blue-400 focus:outline-none focus:border-blue-400 font-mono" placeholder="องศา" />
                        </div>
                      </div>
                    </div>

                    {/* Auto Analysis Result */}
                    <AnimatePresence>
                      {angleStatus && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border ${angleStatus.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}
                        >
                          <div className="font-semibold">{angleStatus.type === 'success' ? '✅ วิเคราะห์สำเร็จ' : '⚠️ ข้อผิดพลาดทางเรขาคณิต'}</div>
                          <div className="text-sm mt-1">{angleStatus.text}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Part 2: Weapon Identification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  คัดกรองชนิดอาวุธข้าศึก (Weapon Identification)
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 uppercase tracking-wider mb-3">ชิ้นส่วนหลักที่พบในบริเวณหลุมระเบิด</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button 
                        onClick={() => setEvidenceType('artillery')}
                        className={`p-4 rounded-lg border text-left transition-all ${evidenceType === 'artillery' ? 'bg-orange-600/20 border-orange-500 text-orange-300' : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                      >
                        <div className="font-bold mb-1">ปลอกรัดท้าย / ร่องเกลียว</div>
                        <div className="text-xs opacity-70">(กระสุนปืนใหญ่)</div>
                      </button>
                      <button 
                        onClick={() => setEvidenceType('mortar')}
                        className={`p-4 rounded-lg border text-left transition-all ${evidenceType === 'mortar' ? 'bg-orange-600/20 border-orange-500 text-orange-300' : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                      >
                        <div className="font-bold mb-1">ครีบหางนำทิศ</div>
                        <div className="text-xs opacity-70">(กระสุนเครื่องยิงลูกระเบิด)</div>
                      </button>
                      <button 
                        onClick={() => setEvidenceType('rocket')}
                        className={`p-4 rounded-lg border text-left transition-all ${evidenceType === 'rocket' ? 'bg-orange-600/20 border-orange-500 text-orange-300' : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                      >
                        <div className="font-bold mb-1">ปลายท่อดินขับ</div>
                        <div className="text-xs opacity-70">(จรวด)</div>
                      </button>
                    </div>
                  </div>

                  {/* Sub-options based on evidence */}
                  <AnimatePresence mode="wait">
                    {evidenceType === 'artillery' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 bg-orange-950/10 p-4 rounded-lg border border-orange-900/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">ลักษณะรอยบาก (สัญชาติ)</label>
                            <div className="flex gap-2">
                              <button onClick={() => setArtilleryNat('us')} className={`flex-1 p-2 rounded border text-sm ${artilleryNat === 'us' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>รอยบากแนวนอน</button>
                              <button onClick={() => setArtilleryNat('soviet')} className={`flex-1 p-2 rounded border text-sm ${artilleryNat === 'soviet' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>รอยบากแนวดิ่ง</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">จำนวนร่องเกลียวใส่หัวชนวน (ขนาดลำกล้อง)</label>
                            <div className="flex gap-2">
                              <button onClick={() => setArtilleryCal('105')} className={`flex-1 p-2 rounded border text-sm ${artilleryCal === '105' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>16 เกลียว</button>
                              <button onClick={() => setArtilleryCal('155')} className={`flex-1 p-2 rounded border text-sm ${artilleryCal === '155' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>14 เกลียว</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {evidenceType === 'mortar' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-orange-950/10 p-4 rounded-lg border border-orange-900/30">
                         <label className="block text-xs text-gray-400 mb-2">จำนวนครีบหางที่นับได้</label>
                         <div className="grid grid-cols-4 gap-2">
                            {['60', '81', '82', '120'].map(fins => (
                               <button 
                                 key={fins}
                                 onClick={() => setMortarFins(fins as any)} 
                                 className={`p-2 rounded border text-sm ${mortarFins === fins ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}
                               >
                                 {fins === '60' ? '8 ครีบ' : fins === '81' ? '6 ครีบ' : fins === '82' ? '10 ครีบ' : '12 ครีบ'}
                               </button>
                            ))}
                         </div>
                      </motion.div>
                    )}

                    {evidenceType === 'rocket' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-orange-950/10 p-4 rounded-lg border border-orange-900/30">
                         <label className="block text-xs text-gray-400 mb-2">ลักษณะและจำนวนรูที่ปลายท่อดินขับ</label>
                         <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setRocketHoles('107')} className={`p-3 rounded border text-sm ${rocketHoles === '107' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>6 รู (ลักษณะเอียง)</button>
                            <button onClick={() => setRocketHoles('122')} className={`p-3 rounded border text-sm ${rocketHoles === '122' ? 'bg-orange-500 text-white border-orange-400' : 'bg-black border-gray-700 text-gray-400'}`}>7 รู (ลักษณะตรง)</button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Footer & Final Report Output */}
            <div className="p-6 bg-black/80 border-t border-orange-500/30">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                
                {/* Result Summary */}
                <div className="flex-1">
                  <div className="text-xs text-orange-500/70 uppercase tracking-widest mb-1">สรุปแบบรายงาน (Crater Analysis Report)</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-mono ${angle2 ? 'text-white' : 'text-gray-600'}`}>
                      มุมตก: <span className="font-bold text-orange-400">{angle2 || '?'}°</span>
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div className={`text-lg ${isWeaponIdentified ? 'text-white' : 'text-gray-600'}`}>
                      อาวุธ: <span className="font-bold text-orange-400">{weaponName}</span> 
                      {isWeaponIdentified && <span className="text-sm text-gray-400 ml-2">({weaponNationality})</span>}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleSendReport}
                  disabled={!isFormComplete || isSending || isSent}
                  className={`
                    px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all flex items-center gap-2
                    ${isSent ? 'bg-emerald-600 text-white' : 
                      isSending ? 'bg-orange-600/50 text-white/50 cursor-wait' :
                      isFormComplete ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/50' : 
                      'bg-gray-800 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  {isSent ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ส่งรายงานสำเร็จ
                    </>
                  ) : isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังส่งข้อมูลให้ ศอย...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      ส่งรายงานไป ศอย.
                    </>
                  )}
                </button>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
