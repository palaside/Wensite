import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type FOCalcType = 'flash_to_bang' | 'mil_formula' | 'sine_rule' | 'ot_factor' | 'lateral_shift' | 'range_bracketing' | 'height_of_burst' | 'moving_target' | 'smoke_screen' | null;

interface FOCalculatorViewProps {
  type: FOCalcType;
  onClose: () => void;
}

const getSineFactor = (mils: number) => {
  let m = Math.abs(mils % 3200);
  if (m > 1600) m = 3200 - m;
  if (m < 50) return 0;
  if (m < 150) return 0.1;
  if (m < 250) return 0.2;
  if (m < 350) return 0.3;
  if (m < 450) return 0.4;
  if (m < 550) return 0.5;
  if (m < 650) return 0.6;
  if (m < 750) return 0.7;
  if (m <= 1050) return 0.8;
  if (m <= 1250) return 0.9;
  return 1.0;
};
const getCosFactor = (mils: number) => getSineFactor(1600 - mils);

export function FOCalculatorView({ type, onClose }: FOCalculatorViewProps) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  // States for Bracketing
  const [bracketJump, setBracketJump] = useState<number>(0);
  const [initialJumpSize, setInitialJumpSize] = useState<number>(400);
  const [lastSpot, setLastSpot] = useState<'over' | 'short' | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // States for HOB
  const [hobState, setHobState] = useState<'start' | 'adjusting'>('start');

  // Reset state when tool changes
  useEffect(() => {
    setInput1('');
    setInput2('');
    setInput3('');
    setBracketJump(0);
    setInitialJumpSize(400);
    setLastSpot(null);
    setHistory([]);
    setHobState('start');
  }, [type]);

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'flash_to_bang':
        const time = parseFloat(input1) || 0;
        const distanceFB = time * 350;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. Flash-to-Bang (แสง-เสียง)</h2>
            <p className="text-sm text-gray-300">ระยะทาง = เวลา x 350 เมตร</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">เวลาที่จับได้ (วินาที)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 5" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะทาง (Distance)</div>
              <div className="text-3xl font-bold text-emerald-400">{distanceFB.toFixed(0)} <span className="text-lg">เมตร</span></div>
            </div>
          </div>
        );
      
      case 'mil_formula':
        const W = parseFloat(input1) || 0;
        const m_mil = parseFloat(input2) || 0;
        const distanceMil = m_mil > 0 ? (W / m_mil) * 1000 : 0;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">2. Mil Formula (สูตรมิล)</h2>
            <p className="text-sm text-gray-300">W = R x m (หา R: ระยะทาง)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความกว้างเป้าหมาย (W) - เมตร</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 10" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมที่อ่านได้ (m) - มิลเลียม</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 5" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะทาง (Range)</div>
              <div className="text-3xl font-bold text-emerald-400">{distanceMil.toFixed(0)} <span className="text-lg">เมตร</span></div>
            </div>
          </div>
        );

      case 'sine_rule':
        const r_sine = parseFloat(input1) || 0;
        const angle_mils = parseFloat(input2) || 0;
        const sinF = getSineFactor(angle_mils);
        const cosF = getCosFactor(angle_mils);
        const lateral = sinF * r_sine;
        const range = cosF * r_sine;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">3. กฎของไซน์ (Sine Rule)</h2>
            <p className="text-sm text-gray-300">การย้าย = แฟคเตอร์มุม x ระยะทาง</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะทาง (R) - เมตร</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 1000" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุม (mils)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">ย้ายทางข้าง (Sine: {sinF})</div>
                <div className="text-2xl font-bold text-emerald-400">{lateral.toFixed(0)} <span className="text-sm">ม.</span></div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">ย้ายทางระยะ (Cosine: {cosF})</div>
                <div className="text-2xl font-bold text-emerald-400">{range.toFixed(0)} <span className="text-sm">ม.</span></div>
              </div>
            </div>
          </div>
        );

      case 'ot_factor':
        const distanceOT = parseFloat(input1) || 0;
        let roundedOT = 0;
        if (distanceOT > 0) {
          if (distanceOT < 1000) {
            roundedOT = parseFloat((distanceOT / 1000).toFixed(1));
          } else {
            let nearestThousand = Math.round(distanceOT / 1000);
            if (Math.abs(distanceOT % 1000) === 500) {
              nearestThousand = Math.floor(distanceOT / 1000);
              if (nearestThousand % 2 !== 0) nearestThousand += 1;
            }
            roundedOT = nearestThousand;
          }
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">4. OT Factor (แฟคเตอร์ ตม.)</h2>
            <p className="text-sm text-gray-300">ระยะ &lt; 1000 ให้มีทศนิยม | ระยะ &ge; 1000 ปัดเป็นจำนวนเต็มพัน (เศษ 500 ปัดหาเลขคู่)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะทาง ผตน.-เป้าหมาย (เมตร)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 2500" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50 flex justify-between items-center px-8">
              <div>
                <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะหารพัน</div>
                <div className="text-xl font-bold text-emerald-400/50">{(distanceOT / 1000).toFixed(2)}</div>
              </div>
              <div className="text-xl text-emerald-800">→</div>
              <div>
                <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">OT Factor</div>
                <div className="text-4xl font-bold text-emerald-400">{roundedOT}</div>
              </div>
            </div>
          </div>
        );

      case 'lateral_shift':
        const ot_val = parseFloat(input1) || 0;
        const dev_mils = parseFloat(input2) || 0;
        const rawShift = ot_val * dev_mils;
        const roundedShift = Math.round(rawShift / 10) * 10;
        const isSmall = roundedShift <= 20 && roundedShift > 0;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">5. การแก้ทางข้าง (Lateral Shift)</h2>
            <p className="text-sm text-gray-300">ระยะแก้ทางทิศ = แฟคเตอร์ ตม. x ผลตรวจทางทิศ (ปัดเศษเต็ม 10 เมตร)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">OT Factor</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 2" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ผลการตรวจทางทิศ (mils)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 30" />
            </div>
            <div className={`bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border ${isSmall ? 'border-yellow-600' : 'border-emerald-800/50'}`}>
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">สั่งแก้ขวา/ซ้าย</div>
              <div className="text-3xl font-bold text-emerald-400">{roundedShift} <span className="text-lg">เมตร</span></div>
              {isSmall && (
                <div className="mt-2 text-yellow-500 text-sm font-bold bg-yellow-900/20 py-1 rounded">⚠️ จำนวนเล็กน้อย ไม่ต้องแก้ (ยกเว้นยิงหาผล)</div>
              )}
            </div>
          </div>
        );

      case 'range_bracketing':
        const handleSpot = (spot: 'over' | 'short') => {
          if (bracketJump === 0) {
            setBracketJump(initialJumpSize);
            setLastSpot(spot);
            setHistory([`นัดแรกตก ${spot === 'over' ? 'หน้า' : 'หลัง'} -> สั่งแก้ทางระยะ ${spot === 'over' ? 'ลด' : 'เพิ่ม'} ${initialJumpSize}`]);
          } else {
            if (spot !== lastSpot) {
              const newJump = bracketJump / 2;
              setBracketJump(newJump);
              setLastSpot(spot);
              if (newJump <= 50) {
                setHistory(h => [...h, `ตก ${spot === 'over' ? 'หน้า' : 'หลัง'} (คร่อมเป้า) -> เพิ่ม/ลด 50 ยิงหาผล`]);
              } else {
                setHistory(h => [...h, `ตก ${spot === 'over' ? 'หน้า' : 'หลัง'} (คร่อมเป้า) -> หั่นครึ่ง สั่งแก้ ${spot === 'over' ? 'ลด' : 'เพิ่ม'} ${newJump}`]);
              }
            } else {
              setHistory(h => [...h, `ตก ${spot === 'over' ? 'หน้า' : 'หลัง'} (ฝั่งเดิม) -> สั่งแก้ ${spot === 'over' ? 'ลด' : 'เพิ่ม'} ${bracketJump}`]);
            }
          }
        };
        const resetBracket = () => { setBracketJump(0); setLastSpot(null); setHistory([]); };
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">6. การปรับแก้ทางระยะ (Bracketing)</h2>
            <p className="text-sm text-gray-300">ผ่าห้วงควบ (400 &rarr; 200 &rarr; 100 &rarr; 50)</p>
            
            {bracketJump === 0 ? (
              <div className="bg-black/40 p-4 rounded-lg border border-emerald-900/50">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">ตั้งค่าระยะกระโดดนัดแรก</label>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setInitialJumpSize(400)} className={`flex-1 py-2 rounded border ${initialJumpSize === 400 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-transparent border-emerald-900/50 text-gray-400 hover:border-emerald-700'}`}>400 เมตร (มาตรฐาน)</button>
                  <button onClick={() => setInitialJumpSize(200)} className={`flex-1 py-2 rounded border ${initialJumpSize === 200 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-transparent border-emerald-900/50 text-gray-400 hover:border-emerald-700'}`}>200 เมตร (เป้าใกล้)</button>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button disabled={bracketJump > 0 && bracketJump <= 50} onClick={() => handleSpot('over')} className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 rounded p-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">
                🎯 เป้าตกหน้า (Over)
              </button>
              <button disabled={bracketJump > 0 && bracketJump <= 50} onClick={() => handleSpot('short')} className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50 rounded p-3 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">
                🎯 เป้าตกหลัง (Short)
              </button>
            </div>

            {history.length > 0 && (
              <div className="mt-4 bg-emerald-950/20 border border-emerald-900/30 rounded p-3 text-sm font-mono text-emerald-300 max-h-40 overflow-y-auto">
                {history.map((log, i) => (
                  <div key={i} className="mb-1 pb-1 border-b border-emerald-900/20 last:border-0 opacity-80 last:opacity-100 last:font-bold">{log}</div>
                ))}
              </div>
            )}
            
            {bracketJump > 0 && (
              <button onClick={resetBracket} className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded py-2 text-sm transition">
                เริ่มคำนวณเป้าหมายใหม่ (Reset)
              </button>
            )}
          </div>
        );

      case 'height_of_burst':
        const handleHobInit = (type: 'graze' | 'mixed') => {
          setHistory([`นัดแรกเป็น ${type === 'graze' ? 'กระทบแตก' : 'คละ'} -> สั่งแก้ สูงขึ้น ${type === 'graze' ? 40 : 20}`]);
          setHobState('adjusting');
        };
        const handleHobAdjust = (val: number) => {
          setHistory(h => [...h, `ปรับแก้ ${val > 0 ? 'สูงขึ้น' : 'ต่ำลง'} ${Math.abs(val)} เมตร`]);
        };
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">7. การแก้สูงกระสุนแตก (Height of Burst)</h2>
            <p className="text-sm text-gray-300">กระสุนชนวนเวลา: นัดแรกกระทบแตกแก้ 40, คละแก้ 20</p>
            
            {hobState === 'start' ? (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => handleHobInit('graze')} className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 border border-amber-800/50 rounded p-3 font-bold">
                  💥 กระทบแตก (Graze)
                </button>
                <button onClick={() => handleHobInit('mixed')} className="bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 border border-orange-800/50 rounded p-3 font-bold">
                  🎇 คละ (Mixed)
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 text-center">ปรับแก้ในนัดต่อไป (ทีละ 5 เมตร)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleHobAdjust(5)} className="bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-800/50 rounded py-2">สูงขึ้น 5 (Up 5)</button>
                  <button onClick={() => handleHobAdjust(-5)} className="bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 border border-emerald-800/50 rounded py-2">ต่ำลง 5 (Down 5)</button>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-4 bg-emerald-950/20 border border-emerald-900/30 rounded p-3 text-sm font-mono text-emerald-300 max-h-40 overflow-y-auto">
                {history.map((log, i) => (
                  <div key={i} className="mb-1 pb-1 border-b border-emerald-900/20 last:border-0 opacity-80 last:opacity-100 last:font-bold">{log}</div>
                ))}
              </div>
            )}
            
            {hobState === 'adjusting' && (
              <button onClick={() => { setHobState('start'); setHistory([]); }} className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded py-2 text-sm transition">
                เริ่มเป้าหมายใหม่ (Reset)
              </button>
            )}
          </div>
        );

      case 'moving_target':
        const speed = parseFloat(input1) || 0;
        const tof = parseFloat(input2) || 0;
        const timeIntercept = tof + 10;
        const distanceMoved = speed * timeIntercept;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">8. เป้าหมายเคลื่อนที่ (Moving Target)</h2>
            <p className="text-sm text-gray-300">ระยะเคลื่อนที่ = ความเร็ว x (เวลาของกระสุน + เวลาส่งข่าว 10s)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความเร็วเป้าหมาย (เมตร/วินาที)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 15" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">เวลาของกระสุน ToF (วินาที)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 25" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะดักยิงเป้าหมาย (เคลื่อนที่ไป)</div>
              <div className="text-3xl font-bold text-emerald-400">{distanceMoved.toFixed(0)} <span className="text-lg">เมตร</span></div>
              <div className="text-xs text-emerald-500/50 mt-1">เวลาในการคำนวณทั้งหมด {timeIntercept.toFixed(1)} วินาที</div>
            </div>
          </div>
        );

      case 'smoke_screen':
        const length = parseFloat(input1) || 0;
        const factor = parseFloat(input2) || 1.5;
        const guns = Math.ceil((factor * length) / 100);
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">9. การยิงฉากควัน (Smoke Screen)</h2>
            <p className="text-sm text-gray-300">จำนวนปืน = (แฟคเตอร์ x ความยาว) / 100</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความยาวฉากควันที่ต้องการ (เมตร)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 400" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ทิศทางลม (Wind Direction)</label>
              <select value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500">
                <option value="1.5">ลมขวาง (Crosswind) - แฟคเตอร์ 1.5</option>
                <option value="1.75">ลมเฉียง (Quartering) - แฟคเตอร์ 1.75</option>
                <option value="2.0">ลมต้าน/ส่ง (Head/Tail) - แฟคเตอร์ 2.0</option>
              </select>
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">จำนวนปืนที่ต้องใช้ (กระบอก)</div>
              <div className="text-4xl font-bold text-emerald-400">{guns} <span className="text-lg">กระบอก</span></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0a110f] border border-emerald-900/50 rounded-xl shadow-2xl shadow-emerald-900/20 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-emerald-900/50 bg-gradient-to-r from-emerald-900/20 to-transparent">
            <h2 className="text-emerald-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tactical Calculator
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-emerald-400 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
