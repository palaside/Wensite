import React, { useState, useRef, useEffect } from 'react';
import { Form344_201, Form344_202 } from './MilitaryForms';
import type { StationData, Form201Props, Form202Props } from './MilitaryForms';
import html2pdf from 'html2pdf.js';

interface RawStationInput {
  name: string;
  angle: string;
  vert: string;
  plus?: string;
  minus?: string;
  slopeDist?: string;
  dist: string;
}

export const MilitaryFormsPreview = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  if (!isVisible) return null;

  // === Forms State ===
  const [targetName, setTargetName] = useState('สค. 3');
  const [targetE, setTargetE] = useState('621653.35');
  const [targetN, setTargetN] = useState('1731065.97');

  const [startName, setStartName] = useState('สล. 4');
  const [startE, setStartE] = useState('621675.38');
  const [startN, setStartN] = useState('1730817.79');
  const [startH, setStartH] = useState('47.20');

  const [numStations, setNumStations] = useState(3);
  
  const [stationsInput, setStationsInput] = useState<RawStationInput[]>([
    { name: 'จุด.', angle: '0932.14', vert: '+ 11.28', dist: '128.152' },
    { name: 'จุดก้อย', angle: '1696.78', vert: '+ 11.28', dist: '103.049' },
    { name: 'สล.4', angle: '0851.67', vert: '- 14.72', dist: '171.862' }
  ]);

  const [calculator, setCalculator] = useState('พ.อ. อานนท์');
  const [checker, setChecker] = useState('ร.อ. บาส');
  const [docDate, setDocDate] = useState('12 ก.พ. 64');

  // === App State ===
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // === Calculated Data State ===
  const [calcForm201, setCalcForm201] = useState<Form201Props | null>(null);
  const [allStationsData, setAllStationsData] = useState<StationData[]>([]);
  const [calcForm202Pages, setCalcForm202Pages] = useState<StationData[][]>([]);

  // Ref for PDF target
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // === Helpers ===
  const handleNumStationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = parseInt(e.target.value);
    setNumStations(num);
    setStationsInput(prev => {
      const copy = [...prev];
      if (num > copy.length) {
        for (let i = copy.length; i < num; i++) {
          copy.push({ name: `สถานีที่ ${i+1}`, angle: '', vert: '', dist: '' });
        }
      } else {
        copy.length = num; // truncate
      }
      return copy;
    });
  };

  const updateStationInput = (index: number, field: keyof RawStationInput, value: string) => {
    setStationsInput(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const splitMils = (valStr: string | number): [string, string, string] => {
    let num = typeof valStr === 'string' ? parseFloat(valStr) : valStr;
    if (isNaN(num)) return ['', '', ''];
    let s = num.toFixed(2).padStart(7, '0'); // "0000.00" -> length 7
    let parts = s.split('.');
    let intPart = parts[0];
    let decPart = parts[1];
    
    let hundreds = intPart.substring(0, intPart.length - 2);
    let tens = intPart.substring(intPart.length - 2);
    
    return [hundreds, tens, decPart];
  };

  const splitCoord = (valStr: string | number, includeSign = false): [string, string] | [string, string, string] => {
    let num = typeof valStr === 'string' ? parseFloat(valStr) : valStr;
    if (isNaN(num)) return includeSign ? ['', '', ''] : ['', ''];
    let s = Math.abs(num).toFixed(2);
    let parts = s.split('.');
    let intPart = parts[0];
    let decPart = parts[1];
    let sign = num >= 0 ? '+' : '-';
    
    if (includeSign) return [sign, intPart, decPart];
    return [intPart, decPart];
  };

  // === Calculation Logic (Live Preview) ===
  useEffect(() => {
    const tE = parseFloat(targetE) || 0;
    const tN = parseFloat(targetN) || 0;
    const sE = parseFloat(startE) || 0;
    const sN = parseFloat(startN) || 0;
    const sH = parseFloat(startH) || 0;

    // -- Form 201 --
    let dE = tE - sE;
    let dN = tN - sN;
    
    let rad = Math.atan2(dE, dN);
    if(rad < 0) rad += 2 * Math.PI;
    let deg = rad * 180 / Math.PI;
    let mils = deg / 0.05625;
    let dist = Math.sqrt(dE*dE + dN*dN);

    const f201Data: Form201Props = {
      targetName,
      targetEasting: tE.toFixed(2),
      targetNorthing: tN.toFixed(2),
      startName,
      startEasting: sE.toFixed(2),
      startNorthing: sN.toFixed(2),
      startHeight: sH.toFixed(2),
      deltaEasting: `${dE >= 0 ? '+ ' : '- '}${Math.abs(dE).toFixed(2)}`,
      deltaNorthing: `${dN >= 0 ? '+ ' : '- '}${Math.abs(dN).toFixed(2)}`,
      azimuth: `${mils.toFixed(2)} ₥`,
      distance: `${dist.toFixed(3)} ม.`,
      calculatorName: calculator,
      checkerName: checker,
      date: docDate
    };

    setCalcForm201(f201Data);

    // -- Form 202 --
    const logStations: StationData[] = [];
    let currentE = sE;
    let currentN = sN;
    let currentH = sH;
    let currentAzFwd = mils;
    let previousName = startName;

    for (let i = 0; i < numStations; i++) {
      const st = stationsInput[i];
      const sAngle = parseFloat(st.angle) || 0;
      const sDist = parseFloat(st.dist) || 0;
      
      let sVertVal = parseFloat(st.vert.replace(/[^\d.-]/g, '')) || 0;
      let vDeg = sVertVal * 0.05625;
      let vRad = vDeg * Math.PI / 180;
      
      let rawVert = st.vert.trim();
      let isVertMinus = rawVert.includes('-');
      let vertStr = rawVert.replace(/[^\d.]/g, ''); // Extract just digits and decimal
      let vertPlusStr = isVertMinus || !vertStr ? '' : vertStr;
      let vertMinusStr = isVertMinus && vertStr ? vertStr : '';

      // For the first station, ทิศไป ส.หลัง = the azimuth from Form 201 directly
      // For subsequent stations, ทิศไป ส.หลัง = previous ทิศไป ส.หน้า + 3200
      let azBack: number;
      if (i === 0) {
        azBack = currentAzFwd; // Use Form 201 azimuth as-is
      } else {
        azBack = currentAzFwd + 3200;
        if(azBack >= 6400) azBack -= 6400;
      }
      
      let sum = azBack + sAngle;
      let minus6400 = false;
      let azFwd = sum;
      if(sum >= 6400) {
        minus6400 = true;
        azFwd = sum - 6400;
      }

      let radFwd = (azFwd * 0.05625) * Math.PI / 180;
      let deltaE = sDist * Math.sin(radFwd);
      let deltaN = sDist * Math.cos(radFwd);
      let deltaH = sDist * Math.tan(vRad); 

      let newE = currentE + deltaE;
      let newN = currentN + deltaN;
      let newH = currentH + deltaH;

      let qE = deltaE >= 0 ? 'ตอ.+' : 'ตอ.-';
      let qN = deltaN >= 0 ? 'ตน.+' : 'ตน.-';
      let quadrantStr = `${qE} ${qN}`;

      // Format for the Component Props
      const dESplit = splitCoord(deltaE, true);
      const dNSplit = splitCoord(deltaN, true);
      const dHSplit = splitCoord(deltaH, true);

      logStations.push({
        azBack: splitMils(azBack),
        angle: splitMils(sAngle),
        azSum: splitMils(sum),
        minus6400: minus6400 ? ['64', '00', '00'] : undefined,
        azFwd: splitMils(azFwd),
        plus3200: ['32', '00', '00'],
        vertAngle: st.vert,
        vertPlus: vertPlusStr,
        vertMinus: vertMinusStr,
        slopeDist: st.slopeDist,
        horizDist: sDist.toFixed(3),
        quadrant: quadrantStr,
        stationBack: previousName,
        stationFwd: st.name,
        coordE: splitCoord(currentE) as [string, string],
        coordN: splitCoord(currentN) as [string, string],
        coordH: splitCoord(currentH) as [string, string],
        deltaE: [`ตอ.${dESplit[0]}`, dESplit[1], dESplit[2]] as [string, string, string],
        deltaN: [`ตน.${dNSplit[0]}`, dNSplit[1], dNSplit[2]] as [string, string, string],
        deltaH: [`ตส.${dHSplit[0]}`, dHSplit[1], dHSplit[2]] as [string, string, string],
      });

      currentE = newE;
      currentN = newN;
      currentH = newH;
      currentAzFwd = azFwd;
      previousName = st.name;
    }

    setAllStationsData(logStations);
    
    // For official PDF export chunks
    const chunks: StationData[][] = [];
    for (let i = 0; i < logStations.length; i += 3) {
      chunks.push(logStations.slice(i, i + 3));
    }
    setCalcForm202Pages(chunks);
  }, [targetName, targetE, targetN, startName, startE, startN, startH, numStations, stationsInput, calculator, checker, docDate]);

  const handleExportPDF = () => {
    // ใช้ระบบ Print ของเบราว์เซอร์แทน html2pdf เพื่อความเสถียร 100%
    window.print();
  };

  return (
    <div className="military-forms-preview-container fixed inset-0 z-50 bg-[#1a1a1a] flex justify-center items-center p-0 print:static print:block print:bg-white print:h-auto print:inset-auto">
      <div className="flex flex-col lg:flex-row w-full h-[100dvh] overflow-hidden bg-gray-900 print:bg-white print:h-auto">
        
        {/* Left Column (Input Form) - Hidden during print */}
        <div className="w-full lg:w-1/3 xl:w-2/5 h-full overflow-hidden p-2 sm:p-4 text-white border-r border-gray-700 print:hidden flex flex-col justify-center">
        
        {/* Header & Controls */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm flex flex-col gap-4 text-gray-900 rounded-lg shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-700">ระบบคำนวณงานวงรอบ</h1>
            <button 
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors border border-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <button 
            type="button" 
            disabled={isGeneratingPDF}
            onClick={handleExportPDF}
            className={`w-full font-bold py-3 px-4 rounded-lg shadow-sm flex justify-center items-center gap-2 transition-all ${
              !isGeneratingPDF
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGeneratingPDF ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            )}
            บันทึกเอกสาร (Save PDF)
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* หมวด 1: จุดปลาย */}
          <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-800 mb-3">หมวดที่ 1: จุดปลาย (Target Point)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อจุดปลาย</label>
                <input type="text" className="w-full border p-2 rounded text-base" value={targetName} onChange={e => setTargetName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด ตอ.</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded text-base" value={targetE} onChange={e => setTargetE(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด ตน.</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded text-base" value={targetN} onChange={e => setTargetN(e.target.value)} />
              </div>
            </div>
          </div>

          {/* หมวด 2: จุดเริ่มต้น */}
          <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-800 mb-3">หมวดที่ 2: จุดเริ่มต้น (Start Point)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อจุดเริ่มต้น</label>
                <input type="text" className="w-full border p-2 rounded text-base" value={startName} onChange={e => setStartName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ความสูง (ม.)</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded text-base" value={startH} onChange={e => setStartH(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด ตอ.</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded text-base" value={startE} onChange={e => setStartE(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด ตน.</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded text-base" value={startN} onChange={e => setStartN(e.target.value)} />
              </div>
            </div>
          </div>

          {/* หมวด 3: สถานี */}
          <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-emerald-800">หมวดที่ 3: สถานี</h2>
              <select className="border border-emerald-300 p-1.5 rounded text-sm bg-white" value={numStations} onChange={handleNumStationsChange}>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} สถานี</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              {stationsInput.map((st, i) => (
                <div key={i} className="flex flex-col gap-2 bg-white p-3 border rounded shadow-sm border-l-4 border-l-emerald-500 text-gray-800">
                  <div className="font-bold text-sm text-emerald-700 border-b pb-1">สถานีที่ {i+1}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อสถานี</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={st.name} onChange={e => updateStationInput(i, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">มุมวัด (มิล.)</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="0932.14" value={st.angle} onChange={e => updateStationInput(i, 'angle', e.target.value)} />
                    </div>
                  </div>
                  {/* Pattern based on Form 344-202 middle section */}
                  <div className="mt-1 border-t pt-3 grid grid-cols-1 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">มุมดิ่ง (มิล.)</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" placeholder="+ 11.28" value={st.vert} onChange={e => updateStationInput(i, 'vert', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">+</label>
                        <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={st.plus || ''} onChange={e => updateStationInput(i, 'plus', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">-</label>
                        <input type="text" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={st.minus || ''} onChange={e => updateStationInput(i, 'minus', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">ระยะลาด (เมตร)</label>
                      <input type="number" step="0.001" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={st.slopeDist || ''} onChange={e => updateStationInput(i, 'slopeDist', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">ระยะราบ (เมตร)</label>
                      <input type="number" step="0.001" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" value={st.dist} onChange={e => updateStationInput(i, 'dist', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* หมวดข้อมูลเพิ่มเติม */}
          <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
            <h2 className="text-xl font-bold text-emerald-800 mb-3">ข้อมูลผู้รับผิดชอบ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ผู้คำนวณ</label>
                <input type="text" className="w-full border p-2 rounded text-base" value={calculator} onChange={e => setCalculator(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ผู้ตรวจสอบ</label>
                <input type="text" className="w-full border p-2 rounded text-base" value={checker} onChange={e => setChecker(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">วันที่</label>
                <input type="text" className="w-full border p-2 rounded text-base" value={docDate} onChange={e => setDocDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: One-page Dashboard (UI Display) */}
      <div className="w-full lg:w-2/3 xl:w-3/5 h-full bg-slate-50 flex flex-col border-l border-gray-300 relative print:block print:w-full print:border-none print:bg-white print:h-auto">
        
        {/* Hidden Container for Official PDF Export (ทบ.344) */}
        <div className="hidden print:block">
          <div id="pdfContainer" ref={pdfContainerRef} className="flex flex-col items-center w-[297mm]">
            {calcForm201 && (
              <div 
                className="bg-white relative w-full" 
                style={{ width: '297mm', minHeight: '210mm', padding: '10mm', overflow: 'hidden', pageBreakAfter: 'always' }}
              >
                <Form344_201 {...calcForm201} />
              </div>
            )}
            {calcForm202Pages.map((chunk, idx) => (
              <div 
                key={`page-${idx}`} 
                className="bg-white relative w-full" 
                style={{ width: '297mm', minHeight: '210mm', padding: '10mm', overflow: 'hidden', pageBreakAfter: 'always' }}
              >
                <Form344_202 
                  stations={chunk}
                  calculatorName={calculator}
                  checkerName={checker}
                  date={docDate}
                  sheetNumber={(idx + 1).toString()}
                  totalPages={calcForm202Pages.length.toString()}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visible Official Forms UI (30/70) */}
        <div className="w-full h-full flex flex-col gap-2 p-2 bg-gray-300 print:hidden">
          
          {/* Top Section: Form 344-201 */}
          <div className="flex-none w-full overflow-hidden bg-[#e5e7eb] custom-scrollbar p-4 flex flex-col items-center border-b-4 border-gray-400 max-h-[50%]">
             <div className="bg-white shadow-xl relative" style={{ width: '1320px', height: '720px', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px' }}>
               {calcForm201 && <Form344_201 {...calcForm201} />}
             </div>
          </div>

          {/* Bottom Section: Form 344-202 - Paginated */}
          <div className="flex-1 w-full overflow-hidden bg-[#e5e7eb] custom-scrollbar p-4 flex flex-col gap-6 items-center">
            {calcForm202Pages.map((chunk, idx) => (
              <div key={`ui-page-${idx}`} className="flex-none bg-white shadow-xl relative" style={{ width: '1750px', height: '1160px', paddingTop: '100px', paddingBottom: '60px', paddingLeft: '40px', paddingRight: '40px' }}>
                 <Form344_202 
                    stations={chunk}
                    calculatorName={calculator}
                    checkerName={checker}
                    date={docDate}
                    sheetNumber={(idx + 1).toString()}
                    totalPages={calcForm202Pages.length.toString()}
                 />
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

