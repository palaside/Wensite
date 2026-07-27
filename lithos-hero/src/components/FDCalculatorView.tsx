import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePPM, calculateIntersection, parseGrid, formatGrid8, calculateRelativeAccuracy, calculateResection, slideGrid, swingGrid, calculateHorizontalDistance, calculateGridDelta, calculateElevationDiff } from '../utils/artilleryMath';
import { FiringTable } from '../data/FiringTable';
import type { FiringTableEntry } from '../data/FiringTable';
import { interpolateValue } from '../lib/firingTableDB';
import { calcMetCorrections, calculateIndividualGunData, calculateIlluminationData, calculateSweepingSheaf } from '../utils/gunneryComputation';
import { TableF2_Data } from '../data/MockTables';

export type FDCalcType = string | null;

const renderNextGenPlaceholder = (title: string, description: string, iconPath: React.ReactNode) => (
  <div className="animate-fade-in text-center p-8 bg-[#0a0f12]/90 border border-emerald-900/50 rounded-xl shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] backdrop-blur-sm">
    <div className="bg-emerald-950/40 p-4 rounded-full inline-flex justify-center items-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
      {iconPath}
    </div>
    <h3 className="text-emerald-400 text-xl font-bold mb-2 tracking-wide uppercase">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{description}</p>
    
    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-emerald-500/70 bg-black/40 py-2 px-4 rounded-lg border border-emerald-900/50">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
      MODULE STANDBY (READY)
    </div>
  </div>
);

interface FDCalculatorViewProps {
  type: FDCalcType;
  onClose: () => void;
}

export function FDCalculatorView({ type, onClose }: FDCalculatorViewProps) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');
  const [input5, setInput5] = useState('');
  const [input6, setInput6] = useState('');
  const [input7, setInput7] = useState('');
  const [input8, setInput8] = useState('');

  // States for Gunnery Computation
  const [targetRange, setTargetRange] = useState('');
  const [selectedCharge, setSelectedCharge] = useState('1');

  useEffect(() => {
    setInput1('');
    setInput2('');
    setInput3('');
    setInput4('');
    setTargetRange('');
  }, [type]);

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'slope_horizontal':
        const slopeDist = parseFloat(input1) || 0;
        const vertAngleMils = parseFloat(input2) || 0;
        const horizDist = slopeDist > 0 ? calculateHorizontalDistance(slopeDist, vertAngleMils) : 0;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. แปลงระยะลาดเป็นระยะราบ</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะลาดที่วัดได้ (เมตร)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 1000" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมดิ่ง (มิลเลียม)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น +50 หรือ -30" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ระยะราบ (Horizontal Distance)</div>
              <div className="text-3xl font-bold text-emerald-400">{horizDist > 0 ? horizDist.toFixed(2) : '0.00'} <span className="text-sm">ม.</span></div>
            </div>
          </div>
        );

      case 'grid_computation':
        const refGrid = parseGrid(input1);
        const gridDist = parseFloat(input2) || 0;
        const gridAz = parseFloat(input3) || 0;
        let newGrid = null;
        if (input1.length >= 8 && gridDist > 0) {
          const delta = calculateGridDelta(gridDist, gridAz);
          newGrid = { x: refGrid.x + delta.dE, y: refGrid.y + delta.dN, alt: refGrid.alt };
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. หาพิกัดตาราง (Grid Computation)</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">พิกัดจุดตั้งกล้อง/จุดอ้างอิง</label>
              <input type="text" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 12345678" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะราบ (ม.)</label>
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 500" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมภาคทิศทาง (Mils)</label>
                <input type="number" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 1600" />
              </div>
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">พิกัดเป้าหมาย</div>
              {newGrid ? (
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{formatGrid8(newGrid)}</div>
              ) : (
                <div className="text-slate-500">กรุณากรอกข้อมูลพิกัดและระยะ</div>
              )}
            </div>
          </div>
        );

      case 'elevation_diff':
        const hDist = parseFloat(input1) || 0;
        const vAngle = parseFloat(input2) || 0;
        const elevDiff = hDist > 0 ? calculateElevationDiff(hDist, vAngle) : 0;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. ความแตกต่างทางสูง</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะราบ (เมตร)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 1000" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมดิ่ง (มิลเลียม)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น +50 หรือ -30" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">ความสูงที่ต่างกัน (ตส.)</div>
              <div className="text-3xl font-bold text-emerald-400">{(elevDiff > 0 ? '+' : '')}{elevDiff.toFixed(2)} <span className="text-sm">ม.</span></div>
            </div>
          </div>
        );

      case 'azimuth':
        const inputAz = parseFloat(input1) || 0;
        const backAz = (inputAz + 3200) % 6400;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. มุมภาคทิศทาง (Azimuth)</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมภาคทิศทางเดิม (Mils)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 1500" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">มุมภาคกลับ (Back Azimuth)</div>
              <div className="text-3xl font-bold text-emerald-400">{backAz.toFixed(0)} <span className="text-sm">mils</span></div>
            </div>
          </div>
        );

      case 'survey_ppm':
        const pressure = parseFloat(input1) || 750;
        const temp = parseFloat(input2) || 15;
        const ppm = calculatePPM(pressure, temp);
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">1. การคำนวณ PPM (งานสำรวจ)</h2>
            <p className="text-sm text-gray-300">หาค่าแก้ไขความกดอากาศและอุณหภูมิ (Parts Per Million)</p>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความกดอากาศ (มม.ปรอท)</label>
              <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 792" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">อุณหภูมิ (°C)</label>
              <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 20" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">PPM (ค่าแก้)</div>
              <div className="text-3xl font-bold text-emerald-400">{ppm.toFixed(2)}</div>
            </div>
          </div>
        );

      case 'intersection':
        const gridA = parseGrid(input1);
        const azA = parseFloat(input2) || 0;
        const gridB = parseGrid(input3);
        const azB = parseFloat(input4) || 0;
        let intersectionPoint = null;
        if (input1.length >= 8 && input3.length >= 8 && input2 && input4) {
          intersectionPoint = calculateIntersection(gridA, azA, gridB, azB);
        }

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">2. วิธีสกัดตรง (Intersection)</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-500">จุดตรวจการณ์ ก.</div>
                <input type="text" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="พิกัดกริด (เช่น 12345678)" />
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="มุมภาค (mils)" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-500">จุดตรวจการณ์ ข.</div>
                <input type="text" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="พิกัดกริด (เช่น 12345678)" />
                <input type="number" value={input4} onChange={e => setInput4(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="มุมภาค (mils)" />
              </div>
            </div>
            
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">พิกัดเป้าหมาย (Intersection)</div>
              {intersectionPoint ? (
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{formatGrid8(intersectionPoint)}</div>
              ) : (
                <div className="text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วน</div>
              )}
            </div>
          </div>
        );

      case 'resection':
        const resGridA = parseGrid(input1);
        const resAzA = parseFloat(input2) || 0;
        const resGridB = parseGrid(input3);
        const resAzB = parseFloat(input4) || 0;
        let resectionPoint = null;
        if (input1.length >= 8 && input3.length >= 8 && input2 && input4) {
          resectionPoint = calculateResection(resGridA, resAzA, resGridB, resAzB);
        }

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">2. วิธีสกัดกลับ (Resection)</h2>
            <p className="text-sm text-gray-300">หาที่อยู่ตัวเองจากมุมภาคทิศทางที่เล็งไปยังจุด A และ B</p>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-500">จุดอ้างอิง A</div>
                <input type="text" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="พิกัดกริด A" />
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="มุมภาคเล็งไป A" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-500">จุดอ้างอิง B</div>
                <input type="text" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="พิกัดกริด B" />
                <input type="number" value={input4} onChange={e => setInput4(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 text-sm focus:outline-none" placeholder="มุมภาคเล็งไป B" />
              </div>
            </div>
            
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">พิกัดที่อยู่ปัจจุบัน</div>
              {resectionPoint ? (
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{formatGrid8(resectionPoint)}</div>
              ) : (
                <div className="text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วน</div>
              )}
            </div>
          </div>
        );

      case 'relative_accuracy':
        const errE = parseFloat(input1) || 0;
        const errN = parseFloat(input2) || 0;
        const totDist = parseFloat(input3) || 0;
        const accuracy = calculateRelativeAccuracy(errE, errN, totDist);
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">3. ความคลาดเคลื่อน (Relative Accuracy)</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Error Easting (ม.)</label>
                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 1" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Error Northing (ม.)</label>
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 2" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะทางรวม (เมตร)</label>
              <input type="number" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 5000" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">อัตราส่วนความคลาดเคลื่อน</div>
              <div className="text-3xl font-bold text-emerald-400">{accuracy}</div>
            </div>
          </div>
        );

      case 'slide_grid':
        const slideAssumed = parseGrid(input1);
        const slideActual = parseGrid(input2);
        const slideTarget = parseGrid(input3);
        let slidedPoint = null;
        if (input1.length >= 8 && input2.length >= 8 && input3.length >= 8) {
          slidedPoint = slideGrid(slideAssumed, slideActual, [slideTarget])[0];
        }

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">4. เลื่อนตาราง (Sliding the Grid)</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">พิกัดศูนย์กลาง (สมมติ)</label>
              <input type="text" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 11112222" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">พิกัดศูนย์กลาง (ความจริงจากหน่วยเหนือ)</label>
              <input type="text" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 11113333" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">เป้าหมายที่ต้องการเลื่อน</label>
              <input type="text" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เป้าหมาย (พิกัดเดิม)" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">พิกัดเป้าหมาย (ใหม่)</div>
              {slidedPoint ? (
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{formatGrid8(slidedPoint)}</div>
              ) : (
                <div className="text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วน</div>
              )}
            </div>
          </div>
        );

      case 'swing_grid':
        const pivotGrid = parseGrid(input1);
        const swingTarget = parseGrid(input2);
        const deltaMils = parseFloat(input3) || 0;
        let swungPoint = null;
        if (input1.length >= 8 && input2.length >= 8 && input3) {
          swungPoint = swingGrid(pivotGrid, [swingTarget], deltaMils)[0];
        }

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">4. หมุนตาราง (Swinging the Grid)</h2>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">พิกัดจุดศูนย์กลางการหมุน</label>
              <input type="text" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 11112222" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">เป้าหมายที่ต้องการหมุน</label>
              <input type="text" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="พิกัดเป้าหมายเดิม" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมหมุนแก้ (Mils)</label>
              <input type="number" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none" placeholder="เช่น 20 (บวกตามเข็ม, ลบทวนเข็ม)" />
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-lg text-center mt-4 border border-emerald-800/50">
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest mb-1">พิกัดเป้าหมาย (หลังหมุน)</div>
              {swungPoint ? (
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{formatGrid8(swungPoint)}</div>
              ) : (
                <div className="text-slate-500">กรุณากรอกข้อมูลให้ครบถ้วน</div>
              )}
            </div>
          </div>
        );

      case 'gunnery_computation':
        const range = parseFloat(targetRange);
        const chargeNum = parseInt(selectedCharge);
        let elevation = 0;
        let tof = 0;

        if (range > 0 && FiringTable[chargeNum]) {
          // Convert current FiringTable structure to an array of objects to use with interpolateValue
          const tableData = Object.values(FiringTable[chargeNum]).sort((a, b) => a.distance - b.distance);
          // Convert FiringTableEntry to match Table_F1_BasicData format for the interpolator
          const adaptedTableData = tableData.map(t => ({
            range: t.distance,
            elevation: t.f2,
            timeOfFlight: t.f7,
            drift: t.g12,
            elevCorrectionPer100m: 0 // Mock field, since it's not in the current DB
          }));
          
          elevation = interpolateValue(range, adaptedTableData, 'elevation');
          tof = interpolateValue(range, adaptedTableData, 'timeOfFlight');
        }

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">5. Gunnery Computation (ตารางยิง 105mm)</h2>
            <p className="text-sm text-gray-300">หาค่ามุมสูงและเวลาชนวนด้วยวิธี Interpolation</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะยิง (เมตร)</label>
                <input type="number" value={targetRange} onChange={e => setTargetRange(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 4030" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ส่วนบรรจุ (Charge)</label>
                <select value={selectedCharge} onChange={e => setSelectedCharge(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500">
                  <option value="1">Charge 1</option>
                  <option value="2">Charge 2</option>
                  <option value="3">Charge 3</option>
                  <option value="4">Charge 4</option>
                  <option value="5">Charge 5</option>
                  <option value="6">Charge 6</option>
                  <option value="7">Charge 7</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">มุมสูง (Elevation)</div>
                <div className="text-3xl font-bold text-emerald-400">{elevation > 0 ? elevation.toFixed(1) : '-'} <span className="text-sm text-emerald-500">mils</span></div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">เวลาชนวน (ToF)</div>
                <div className="text-3xl font-bold text-cyan-400">{tof > 0 ? tof.toFixed(1) : '-'} <span className="text-sm text-cyan-500">sec</span></div>
              </div>
            </div>
            
            {elevation > 0 && (
               <div className="text-xs text-center text-gray-500 mt-2 italic border-t border-gray-800 pt-2">
                 * Interpolation calculated dynamically from exact Firing Tables data.
               </div>
            )}
          </div>
        );

      case 'gunnery_met':
        const r = parseFloat(targetRange) || 4000;
        const c = parseInt(selectedCharge) || 4;
        const t = parseFloat(input1) || 90; // Temperature

        const met = calcMetCorrections(t, c, r);

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">Met Corrections (แก้สภาพไม่มาตรฐาน)</h2>
            <p className="text-sm text-gray-300">คำนวณตัวแก้อุณหภูมิและความเร็วต้น</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">อุณหภูมิดินส่งกระสุน (°F)</label>
                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 90" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะยิง (เมตร)</label>
                <input type="number" value={targetRange} onChange={e => setTargetRange(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500" placeholder="เช่น 4000" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ส่วนบรรจุ</label>
                <select value={selectedCharge} onChange={e => setSelectedCharge(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:outline-none focus:border-emerald-500">
                  {[1,2,3,4,5,6,7].map(num => (
                    <option key={num} value={num}>Charge {num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">MV Diff (m/s)</div>
                <div className="text-3xl font-bold text-emerald-400">{met.mvDiff > 0 ? '+' : ''}{met.mvDiff}</div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Range Correction (m)</div>
                <div className="text-3xl font-bold text-cyan-400">{met.rangeCorrection > 0 ? '+' : ''}{met.rangeCorrection}</div>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-2 italic border-t border-gray-800 pt-2">
              * Calculated dynamically from full mock Table E & F2 data.
            </div>
          </div>
        );

      case 'gunnery_disp':
        const r_disp = parseFloat(targetRange) || 4000;
        const c_disp = parseInt(selectedCharge) || 4;
        
        const roundedRangeDisp = Math.round(r_disp / 100) * 100;
        const mvFactor = (TableF2_Data[c_disp] && TableF2_Data[c_disp][roundedRangeDisp]) ? TableF2_Data[c_disp][roundedRangeDisp] : 0;

        const baseDef = parseFloat(input1) || 3200;
        const mvDiff = parseFloat(input2) || 0;
        
        const longDir = (input3 || 'CENTER') as "FRONT" | "REAR" | "CENTER";
        const longMeters = parseFloat(input4) || 0;

        const latDir = (input5 || 'CENTER') as "LEFT" | "RIGHT" | "CENTER";
        const latMeters = parseFloat(input6) || 0;

        const dispData = calculateIndividualGunData(
          r_disp, baseDef, 
          { dir: longDir, meters: longMeters },
          { dir: latDir, meters: latMeters },
          mvDiff, mvFactor
        );

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">Displacement (แก้ลดเหลื่อมปืน)</h2>
            <p className="text-sm text-gray-300">รวมค่าจากแผ่นกรุย M17 และค่า ตร. ประจำปืน</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะยิงเป้าหมาย (ม.)</label>
                <input type="number" value={targetRange} onChange={e => setTargetRange(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300" placeholder="เช่น 4000" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ส่วนบรรจุ</label>
                <select value={selectedCharge} onChange={e => setSelectedCharge(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300">
                  {[1,2,3,4,5,6,7].map(num => <option key={num} value={num}>Charge {num}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมทิศหลัก (Mils)</label>
                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300" placeholder="เช่น 3200" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความเร็วต้นเพี้ยน (ตร.)</label>
                <input type="number" step="0.1" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300" placeholder="เช่น -1.5" />
              </div>
            </div>

            <div className="border border-emerald-900/40 p-3 rounded-lg bg-black/20">
              <div className="text-sm text-emerald-500 font-bold mb-2">ข้อมูลจากแผ่นกรุย M17</div>
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ทางลึก</label>
                  <select value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 mb-2">
                    <option value="CENTER">-- เลือก --</option>
                    <option value="FRONT">หน้า (FRONT)</option>
                    <option value="REAR">หลัง (REAR)</option>
                  </select>
                  <input type="number" value={input4} onChange={e => setInput4(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300" placeholder="ระยะทางลึก (ม.)" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ทางข้าง</label>
                  <select value={input5} onChange={e => setInput5(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 mb-2">
                    <option value="CENTER">-- เลือก --</option>
                    <option value="LEFT">ซ้าย (LEFT)</option>
                    <option value="RIGHT">ขวา (RIGHT)</option>
                  </select>
                  <input type="number" value={input6} onChange={e => setInput6(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300" placeholder="ระยะทางข้าง (ม.)" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Final Deflection (มุมทิศสุทธิ)</div>
                <div className="text-3xl font-bold text-emerald-400">{dispData.gunDeflection} <span className="text-sm">mils</span></div>
                <div className="text-[10px] text-gray-400 mt-1">Shifted {dispData.lateralMils} mils</div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Final Range (ระยะยิงสุทธิ)</div>
                <div className="text-3xl font-bold text-cyan-400">{dispData.finalGunRange} <span className="text-sm">m</span></div>
                <div className="text-[10px] text-gray-400 mt-1">Corr: {dispData.totalRangeCorrection > 0 ? '+' : ''}{dispData.totalRangeCorrection}m (F2 Factor: {mvFactor})</div>
              </div>
            </div>
            
          </div>
        );

      case 'gunnery_special':
        const r_ill = parseFloat(targetRange) || 4000;
        const az_ill = parseFloat(input1) || 3200;
        const def_ill = parseFloat(input2) || 3200;
        const windKts = parseFloat(input3) || 0;
        const windAz = parseFloat(input4) || 0;

        const illData = calculateIlluminationData(r_ill, az_ill, def_ill, windKts, windAz);

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">Illumination (กระสุนส่องแสง)</h2>
            <p className="text-sm text-gray-300">คำนวณดักทางลม (Wind Drift) เพื่อรักษา HOB</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะยิง (เมตร)</label>
                <input type="number" value={targetRange} onChange={e => setTargetRange(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 4000" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมภาคเป้าหมาย (Mils)</label>
                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 3200" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมทิศหลัก (Mils)</label>
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 3200" />
              </div>
            </div>

            <div className="border border-emerald-900/40 p-3 rounded-lg bg-black/20">
              <div className="text-sm text-emerald-500 font-bold mb-2">ข้อมูลลม (Meteorological Data)</div>
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความเร็วลม (Knots)</label>
                  <input type="number" value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 15" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ทิศลมพัดไป (Mils)</label>
                  <input type="number" value={input4} onChange={e => setInput4(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 1600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Adjusted Deflection</div>
                <div className="text-3xl font-bold text-emerald-400">{illData.adjustedDeflection} <span className="text-sm">mils</span></div>
                <div className="text-[10px] text-gray-400 mt-1">Drift {illData.lateralCorrectionMils > 0 ? '+' : ''}{illData.lateralCorrectionMils} mils</div>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-lg text-center border border-emerald-800/50">
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Adjusted Range</div>
                <div className="text-3xl font-bold text-cyan-400">{illData.adjustedRange} <span className="text-sm">m</span></div>
                <div className="text-[10px] text-gray-400 mt-1">Descent Time {illData.descentTime}s</div>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-2 italic border-t border-gray-800 pt-2">
              * Assuming M314A3 flare with 10 m/s fall rate and 750m Standard HOB.
            </div>
          </div>
        );

      case 'gunnery_fpf':
        const r_fpf = parseFloat(targetRange) || 5000;
        const def_fpf = parseInt(input1) || 3200;
        const width_fpf = parseFloat(input2) || 150;
        const proj_fpf = input3 || '105_HE';

        const fpfData = calculateSweepingSheaf(r_fpf, def_fpf, width_fpf, proj_fpf, 6);

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">Sweeping / FPF (ฉากยิงป้องกัน)</h2>
            <p className="text-sm text-gray-300">หารแบ่งมุมกวาดปืน (Sweeping Deflection) ให้ครอบคลุมเป้าหมาย</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ระยะยิง (เมตร)</label>
                <input type="number" value={targetRange} onChange={e => setTargetRange(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 5000" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ความกว้างเป้าหมาย (ม.)</label>
                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 150" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">มุมทิศศูนย์กลาง (Mils)</label>
                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none" placeholder="เช่น 3200" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">ชนิดกระสุน</label>
                <select value={input3} onChange={e => setInput3(e.target.value)} className="w-full bg-black/40 border border-emerald-900/30 rounded p-2 text-emerald-300 focus:border-emerald-500 focus:outline-none">
                  <option value="105_HE">105mm HE (30m)</option>
                  <option value="155_HE">155mm HE (50m)</option>
                  <option value="203_HE">203mm HE (80m)</option>
                </select>
              </div>
            </div>

            {!fpfData.isFeasible && (
              <div className="bg-red-900/40 border border-red-500/50 p-3 rounded-lg flex items-start gap-3 mt-4">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <h4 className="text-red-400 font-bold text-sm">Warning: Target Too Wide</h4>
                  <p className="text-red-300/80 text-xs mt-1">ความกว้างเป้าหมาย ({width_fpf}ม.) เกินขีดความสามารถของกรวยปกติ 1 กองร้อย (สูงสุด {fpfData.maxWidth}ม.)</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <div className="text-sm text-emerald-500 font-bold">การกระจายมุมทิศ (6 กระบอก)</div>
                <div className="text-xs text-emerald-500/70">มุมกวาด: <span className="text-emerald-300 font-mono">{fpfData.sweepAngleMils}</span> mils</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {fpfData.guns.map(g => (
                  <div key={g.gun} className="bg-emerald-950/40 p-2 rounded border border-emerald-800/50 text-center">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Gun {g.gun}</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">{g.deflection}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'window_manager':
        return renderNextGenPlaceholder('Desktop Window Manager', 'ระบบจัดการหน้าต่างอิสระจำลองโปรแกรมปฏิบัติการทางทหาร รองรับ Multi-tasking (Draggable & Resizable)', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
      case 'system_setup':
        return renderNextGenPlaceholder('System Setup', 'ระบบกำหนดค่าฐานยิง (FDC E-Grid, N-Grid), ทิศจำลองกองร้อย', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
      case 'fo_processing':
        return renderNextGenPlaceholder('FO Processing', 'รับคำขอขอยิงจาก ผตน. และคำนวณแปลงพิกัดอัตโนมัติ (Grid/Polar)', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
      case 'target_list_db':
        return renderNextGenPlaceholder('Target List DB', 'บันทึกและจัดการพิกัดเป้าหมายทั้งหมดลงในฐานข้อมูล SQLite', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>);
      case 'firing_table_integration':
        return renderNextGenPlaceholder('Real Firing Table Integration', 'ระบบเชื่อมต่อคัมภีร์ตารางยิงจริง M101', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
      case 'met_message_entry':
        return renderNextGenPlaceholder('MET Message Entry', 'หน้าต่างรับข้อมูลสภาพอากาศ (ลม, อุณหภูมิ, ความกดอากาศ)', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15h1m2 0h1m2 0h1m2 0h1m2 0h1m2 0h1M5 19h1m2 0h1m2 0h1m2 0h1m2 0h1M7 11h10a4 4 0 100-8 3 3 0 00-5.659-1.5A3 3 0 007 11z" /></svg>);
      case 'basic_geometry':
        return renderNextGenPlaceholder('Basic Geometry Calculation', 'ระบบคำนวณพิกัดภูมิศาสตร์ (ระยะยิงราบและมุมทิศพื้นฐาน)', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>);
      case 'linear_interpolation':
        return renderNextGenPlaceholder('Linear Interpolation Engine', 'ระบบเทียบบัญญัติไตรยางศ์ทศนิยม หาค่าขอบบน-ขอบล่าง', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
      case 'vector_splitting':
        return renderNextGenPlaceholder('Vector Splitting & MET', 'ระบบแตกเวกเตอร์ลมและชดเชยวิถีกระสุนอัตโนมัติ', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
      case 'individual_gun':
        return renderNextGenPlaceholder('Individual Gun Corrections', 'ระบบตัวแก้ปืนแยก 6 กระบอก ตามความเร็วต้น (VE)', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
      case 'firing_log_ammo':
        return renderNextGenPlaceholder('Firing Log & Ammo Tracking', 'ระบบบันทึกประวัติการยิงและคลังแสง', <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>);

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
              FDC Computer System
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
          <div className="p-3 sm:p-6 flex-1 overflow-hidden min-h-0 h-full flex flex-col justify-center">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
