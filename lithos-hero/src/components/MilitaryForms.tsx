import React from 'react';

// Type definition for Form 201 Props
export interface Form201Props {
  targetName: string;
  targetEasting: string;
  targetNorthing: string;
  startName: string;
  startEasting: string;
  startNorthing: string;
  startHeight: string;
  deltaEasting: string;
  deltaNorthing: string;
  azimuth: string;
  distance: string;
  calculatorName: string;
  checkerName: string;
  date: string;
}

export const Form344_201: React.FC<Form201Props> = (props) => {
  return (
    <div className="w-full bg-white text-black p-4 font-sans print:p-0 overflow-x-auto" style={{ minHeight: '100%' }}>
      {/* Document Number */}
      <div className="text-right font-bold text-3xl mb-4 pr-12">
        ทบ.344-201
      </div>

      <div className="relative">
        <table className="military-table w-full border-collapse border border-black text-[18px]" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th colSpan={5} className="border border-black py-2 text-pink-600 font-bold text-lg uppercase tracking-wider">
                แบบคำนวณหามุมภาคและระยะ จากพิกัดของ จุด 2 จุด
              </th>
            </tr>
            <tr>
              <th colSpan={2} className="border border-black w-[40%]"></th>
              <th className="border border-black py-1 w-[30%] text-red-600 font-bold">พิกัดตะวันออก</th>
              <th className="border border-black py-1 w-[30%] text-blue-600 font-bold">พิกัดเหนือ</th>
              <th className="border border-black py-1 w-[20%] text-emerald-700 font-bold">ความสูง</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr>
              <td className="border border-black py-2 px-2 text-center w-8">1</td>
              <td className="border border-black py-2 px-4 font-bold text-blue-700 whitespace-nowrap">
                จุดปลาย <span className="inline-block border-b-[1.5px] border-dotted border-current w-32 text-center transform translate-y-[2px]">{props.targetName}</span>
              </td>
              <td className="border border-black py-2 px-4 text-center">{props.targetEasting}</td>
              <td className="border border-black py-2 px-4 text-center">{props.targetNorthing}</td>
              <td className="border border-black py-2 px-4 text-center"></td>
            </tr>
            {/* Row 2 */}
            <tr>
              <td className="border border-black py-2 px-2 text-center">2</td>
              <td className="border border-black py-2 px-4 font-bold text-red-600 whitespace-nowrap relative">
                จุดเริ่มต้น <span className="inline-block border-b-[1.5px] border-dotted border-current w-32 text-center transform translate-y-[2px]">{props.startName}</span>
              </td>
              <td className="border border-black py-2 px-4 text-center">{props.startEasting}</td>
              <td className="border border-black py-2 px-4 text-center">{props.startNorthing}</td>
              <td className="border border-black py-2 px-4 text-center font-bold">
                <span>{props.startHeight}</span>
                <span className="ml-1 font-normal">ม.</span>
              </td>
            </tr>
            {/* Row 3 */}
            <tr>
              <td className="border border-black py-2 px-2 text-center">3</td>
              <td className="border border-black py-2 px-4 text-center font-bold">① - ②</td>
              <td className="border border-black py-2 px-4">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-red-600">ตอ. &plusmn;</span>
                  <span>{props.deltaEasting}</span>
                </div>
              </td>
              <td className="border border-black py-2 px-4">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-blue-700">ตน. &plusmn;</span>
                  <span>{props.deltaNorthing}</span>
                </div>
              </td>
              <td className="border border-black py-2 px-4"></td>
            </tr>
            {/* Row 4 */}
            <tr>
              <td className="border border-black py-2 px-2 text-center">4</td>
              <td colSpan={4} className="border border-black py-2 px-4">
                <span className="font-bold text-pink-600">มุมภาคจากจุดเริ่มต้นไปจุดปลาย =</span>
                <span className="font-bold text-lg ml-12">{props.azimuth}</span>
              </td>
            </tr>
            {/* Row 5 */}
            <tr>
              <td className="border border-black py-2 px-2 text-center">5</td>
              <td colSpan={4} className="border border-black py-2 px-4">
                <span className="font-bold text-blue-700">ระยะ จาก จุดเริ่มต้น ไปจุดปลาย =</span>
                <span className="font-bold text-lg ml-12">{props.distance}</span>
              </td>
            </tr>
            {/* Row 6: Instruction */}
            <tr>
              <td colSpan={5} className="border border-black py-2 px-4">
                <div className="flex flex-col gap-1 font-bold text-red-600">
                  <div>การคำนวณ (ใช้ CASIO fx-991MS) : <span className="underline">Pol</span>(ตน.,ตอ.) = ระยะ ALPHA F = มุมภาค (องศา)</div>
                  <div className="flex gap-4">
                    <span>หมายเหตุ</span>
                    <div className="flex flex-col gap-1">
                      <span>1) ถ้ามุมภาค มีเครื่องหมาย เป็น - ให้ + 360 (องศา) ก่อน</span>
                      <span>2) การแปลง องศา เป็น มิลเลียม = องศา &divide; 0.05625</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            {/* Signatures */}
            <tr>
              <td colSpan={5} className="border-0 py-6 px-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-center">
                    <div className="flex items-end">
                      <span className="mr-2">ผู้คำนวณ</span>
                      <div className="border-b border-black w-40 text-center pb-0.5">
                        {props.calculatorName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-end">
                      <span className="mr-2">ผู้ตรวจสอบ</span>
                      <div className="border-b border-black w-40 text-center pb-0.5">
                        {props.checkerName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-end">
                      <span className="mr-2">ว./ด./ป.</span>
                      <div className="border-b border-black w-40 text-center pb-0.5">
                        {props.date}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// FORM 344-202 (Traverse Survey)
// ==========================================
export interface StationData {
  azBack: [string, string, string]; // [HH, TT, DD]
  angle: [string, string, string];
  azSum: [string, string, string];
  minus6400?: [string, string, string];
  azFwd: [string, string, string];
  plus3200: [string, string, string];
  vertAngle: string; // e.g. "+ 11.28"
  vertPlus?: string;
  vertMinus?: string;
  slopeDist?: string;
  horizDist: string;
  quadrant: string; // e.g. "ตอ.+ ตน.+"
  stationBack: string;
  stationFwd: string;
  coordE: [string, string]; // [Int, Dec]
  coordN: [string, string];
  coordH: [string, string];
  deltaE: [string, string, string]; // [Sign, Int, Dec] e.g. ["ตอ.+", "94", "26"]
  deltaN: [string, string, string];
  deltaH: [string, string, string];
}

export interface Form202Props {
  stations: StationData[];
  calculatorName: string;
  checkerName: string;
  date: string;
  sheetNumber: string;
  totalPages: string;
}

export const Form344_202: React.FC<Form202Props> = (props) => {
  return (
    <div className="w-full h-full flex flex-col bg-white text-black p-2 md:p-4 font-sans print:p-0 overflow-x-auto" style={{}}>
      <div className="flex-none text-right font-bold text-3xl mb-4 pr-12 w-full">
        ทบ.344-202
      </div>

      <div className="relative w-full flex-1">
        <table className="military-table w-full h-full border-collapse border border-black text-center text-[18px] leading-tight" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>

          <thead>
            {/* Header Row 1 */}
            <tr>
              <th colSpan={4} rowSpan={2} className="border border-black py-1 text-red-600 font-bold">มุมภาค</th>
              <th colSpan={4} rowSpan={2} className="border border-black py-1 text-fuchsia-600 font-bold">แบบคำนวณพิกัดและความสูง จาก มุมภาค, ระยะ และ มุมดิ่ง</th>
              <th colSpan={3} className="border border-black py-1 text-blue-700 font-bold">พิกัดฉาก</th>
            </tr>
            {/* Header Row 2 */}
            <tr>
              <th className="border border-black py-2 text-blue-700">พิกัดตะวันออก</th>
              <th className="border border-black py-2 text-blue-700">พิกัดเหนือ</th>
              <th className="border border-black py-2 text-blue-700">ความสูง</th>
            </tr>
          </thead>
          <tbody>
            {props.stations.map((st, i) => {
              // Cell renderers for the coordinates to keep JSX clean
              const renderCoordCell = (label: string, intVal: string, decVal: string) => (
                <td className="border border-black py-0.5 text-left pl-2 pr-2 whitespace-nowrap overflow-hidden">
                  <div className="flex justify-between w-full"><span>{label}</span><span className="font-bold">{intVal}{decVal ? `.${decVal}` : ''}</span></div>
                </td>
              );

              const eSign = st.deltaE[0].includes('-') ? '-' : '+';
              const nSign = st.deltaN[0].includes('-') ? '-' : '+';

              const renderSignedCoordCell = (label: string, value: [string, string, string]) => {
                const sign = value[0].includes('-') ? '-' : '+';
                return (
                  <td className="border border-black py-0.5 text-left pl-2 pr-2 whitespace-nowrap overflow-hidden">
                    <div className="flex justify-between w-full"><span>{label}</span><span className="font-bold">{`${sign} ${value[1]}${value[2] ? `.${value[2]}` : ''}`}</span></div>
                  </td>
                );
              };

              return (
                <React.Fragment key={i}>
                  {/* Row 1 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1 whitespace-nowrap">ภต. ไป ส.หลัง</td>
                    <td className="border border-black py-0.5">{st.azBack[0]}</td>
                    <td className="border border-black py-0.5">{st.azBack[1]}</td>
                    <td className="border border-black py-0.5">{st.azBack[2]}</td>
                    
                    {/* Middle Section C1 */}
                    {i === 0 && (
                      <td rowSpan={2} className="border border-black py-0.5 text-center relative">
                        <div className="absolute top-1 left-1 text-[12px]">มุมดิ่ง (มิล.)</div>
                        <div className="flex justify-center items-center h-full text-[18px] font-bold pt-2">
                          {st.vertAngle}
                        </div>
                      </td>
                    )}
                    
                    {/* Middle Section C2 (Empty Row 1) */}
                    {i === 0 && (
                      <td colSpan={2} className="border border-black py-0.5"></td>
                    )}
                    
                    {/* Right Section Station */}
                    <td className="border border-black py-0.5 text-center font-bold px-1">{`สถานี ${st.stationBack}`}</td>
                    
                    {/* Right Section Coords */}
                    {renderCoordCell('อ.', st.coordE[0], st.coordE[1])}
                    {renderCoordCell('น.', st.coordN[0], st.coordN[1])}
                    {renderCoordCell('ส.', st.coordH[0], st.coordH[1])}
                  </tr>

                  {/* Row 2 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1 whitespace-nowrap">+ มุมที่วัดได้</td>
                    <td className="border border-black py-0.5">{st.angle[0]}</td>
                    <td className="border border-black py-0.5">{st.angle[1]}</td>
                    <td className="border border-black py-0.5">{st.angle[2]}</td>
                    
                    {/* Middle Section C1 */}
                    {i > 0 && (
                      <td rowSpan={2} className="border border-black py-0.5 text-center relative">
                        <div className="absolute top-1 left-1 text-[12px]">มุมดิ่ง (มิล.)</div>
                        <div className="flex justify-center items-center h-full text-[18px] font-bold pt-2">
                          {st.vertAngle}
                        </div>
                      </td>
                    )}

                    {/* Middle Section C2 (Quadrant Top Half) */}
                    <td rowSpan={3} className="border border-black p-0 w-[50px] text-center align-middle relative">
                       <div className="flex flex-col relative w-full h-full items-center justify-center p-1">
                          <span className="leading-tight">ตอ. -</span>
                          <span className="leading-tight">ตน. +</span>
                          {/* Red Circle - Highlight top left quadrant */}
                          {eSign === '-' && nSign === '+' && <div className="absolute inset-[2px] border-[1.5px] border-red-600 rounded-[50%] z-0 pointer-events-none"></div>}
                       </div>
                    </td>
                    <td rowSpan={3} className="border border-black p-0 w-[50px] text-center align-middle relative">
                       <div className="flex flex-col relative w-full h-full items-center justify-center p-1">
                          <span className="leading-tight">ตอ. +</span>
                          <span className="leading-tight">ตน. +</span>
                          {/* Red Circle - Highlight top right quadrant */}
                          {eSign === '+' && nSign === '+' && <div className="absolute inset-[2px] border-[1.5px] border-red-600 rounded-[50%] z-0 pointer-events-none"></div>}
                       </div>
                    </td>

                    {/* Right Section Station (Rowspan 5) */}
                    <td rowSpan={5} className="border border-black py-0.5"></td>
                    
                    {/* Right Section Deltas */}
                    {renderSignedCoordCell('ตอ.', st.deltaE)}
                    {renderSignedCoordCell('ตน.', st.deltaN)}
                    {renderSignedCoordCell('ตส.', st.deltaH)}
                  </tr>

                  {/* Row 3 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1">ผลบวก</td>
                    <td className="border border-black py-0.5">{st.azSum[0]}</td>
                    <td className="border border-black py-0.5">{st.azSum[1]}</td>
                    <td className="border border-black py-0.5">{st.azSum[2]}</td>
                    
                    {/* Middle Section C1 (ระยะลาด) */}
                    {i === 0 && (
                      <td rowSpan={2} className="border border-black py-0.5 text-left px-1 whitespace-nowrap relative">
                         <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <line x1="0" y1="100" x2="100" y2="0" stroke="red" strokeWidth="1.5" />
                         </svg>
                         <span className="absolute top-1 left-1 text-[12px]">ระยะลาด (เมตร)</span>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="mt-4 font-bold">{st.slopeDist || ''}</span>
                         </div>
                      </td>
                    )}
                    
                    {/* Right Section Scratchpad (Rowspan 4) */}
                    <td rowSpan={4} className="border border-black"></td>
                    <td rowSpan={4} className="border border-black"></td>
                    <td rowSpan={4} className="border border-black"></td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1">- 6400</td>
                    <td className="border border-black py-0.5">{st.minus6400?.[0] || ''}</td>
                    <td className="border border-black py-0.5 relative">
                      {!st.minus6400 && <div className="absolute top-1/2 left-[-100%] right-[-100%] h-[1.5px] bg-black z-10"></div>}
                      {st.minus6400?.[1] || ''}
                    </td>
                    <td className="border border-black py-0.5">{st.minus6400?.[2] || ''}</td>
                    
                    {/* Middle Section C1 (ระยะลาด) */}
                    {i > 0 && (
                      <td rowSpan={2} className="border border-black py-0.5 text-left px-1 whitespace-nowrap relative">
                         <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <line x1="0" y1="100" x2="100" y2="0" stroke="red" strokeWidth="1.5" />
                         </svg>
                         <span className="absolute top-1 left-1 text-[12px]">ระยะลาด (เมตร)</span>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="mt-4 font-bold">{st.slopeDist || ''}</span>
                         </div>
                      </td>
                    )}
                  </tr>

                  {/* Row 5 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1 whitespace-nowrap text-red-600">
                      ภต. ไป ส.หน้า
                    </td>
                    <td className="border border-black py-0.5 font-bold text-red-600 relative">
                       <div className="absolute top-[2px] bottom-[2px] left-[2px] border-[1.5px] border-red-600 rounded-full z-10 pointer-events-none" style={{ width: 'calc(300% - 4px)' }}></div>
                       <span className="relative z-20">{st.azFwd[0]}</span>
                    </td>
                    <td className="border border-black py-0.5 font-bold text-red-600 relative">
                       <span className="relative z-20">{st.azFwd[1]}</span>
                    </td>
                    <td className="border border-black py-0.5 font-bold text-red-600 relative">
                       <span className="relative z-20">{st.azFwd[2]}</span>
                    </td>
                    
                    {/* Middle Section C1 (ระยะราบ) Rowspan 3 */}
                    {i === 0 && (
                      <td rowSpan={3} className="border border-black py-0.5 text-left px-1 whitespace-nowrap relative">
                         <span className="absolute top-1 left-1 text-[12px]">ระยะราบ (เมตร)</span>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="mt-8 font-bold">{st.horizDist}</span>
                         </div>
                      </td>
                    )}

                    {/* Middle Section C2 (Quadrant Bottom Half) */}
                    <td rowSpan={3} className="border border-black p-0 w-[50px] text-center align-middle relative">
                       <div className="flex flex-col relative w-full h-full items-center justify-center p-1">
                          <span className="leading-tight">ตอ. -</span>
                          <span className="leading-tight">ตน. -</span>
                          {/* Red Circle - Highlight bottom left quadrant */}
                          {eSign === '-' && nSign === '-' && <div className="absolute inset-[2px] border-[1.5px] border-red-600 rounded-[50%] z-0 pointer-events-none"></div>}
                       </div>
                    </td>
                    <td rowSpan={3} className="border border-black p-0 w-[50px] text-center align-middle relative">
                       <div className="flex flex-col relative w-full h-full items-center justify-center p-1">
                          <span className="leading-tight">ตอ. +</span>
                          <span className="leading-tight">ตน. -</span>
                          {/* Red Circle - Highlight bottom right quadrant */}
                          {eSign === '+' && nSign === '-' && <div className="absolute inset-[2px] border-[1.5px] border-red-600 rounded-[50%] z-0 pointer-events-none"></div>}
                       </div>
                    </td>
                  </tr>

                  {/* Row 6 */}
                  <tr className="military-outline military-outline-row">
                    <td className="border border-black py-0.5 text-left px-1">
                      <div className="inline-block px-1 py-[1px] leading-none">
                        {parseInt(st.azFwd[0]) < 32 ? '+ 3200' : '- 3200'}
                      </div>
                    </td>
                    <td className="border border-black py-0.5">{st.plus3200?.[0] || '32'}</td>
                    <td className="border border-black py-0.5">{st.plus3200?.[1] || '00'}</td>
                    <td className="border border-black py-0.5">{st.plus3200?.[2] || '00'}</td>
                    
                    {/* Middle Section C1 (ระยะราบ) */}
                    {i > 0 && (
                      <td rowSpan={2} className="border border-black py-0.5 text-left px-1 whitespace-nowrap relative">
                         <span className="absolute top-1 left-1 text-[12px]">ระยะราบ (เมตร)</span>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-bold text-lg">{st.horizDist}</span>
                         </div>
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Row 7 (Only for the very last station) */}
            <tr className="military-outline military-outline-row">
              <td className="border border-black py-0.5 text-left px-1 whitespace-nowrap">ภต. ไป ส.หลัง</td>
              <td className="border border-black py-0.5">
                {(parseInt(props.stations[props.stations.length - 1].azFwd[0]) < 32 ? parseInt(props.stations[props.stations.length - 1].azFwd[0]) + 32 : parseInt(props.stations[props.stations.length - 1].azFwd[0]) - 32).toString().padStart(2, '0')}
              </td>
              <td className="border border-black py-0.5">{props.stations[props.stations.length - 1].azFwd[1]}</td>
              <td className="border border-black py-0.5">{props.stations[props.stations.length - 1].azFwd[2]}</td>
              
              <td className="border border-black py-0.5 text-center font-bold px-1">{`สถานี ${props.stations[props.stations.length - 1].stationFwd}`}</td>
              
              <td className="border border-black py-0.5 text-left pl-2 pr-2 whitespace-nowrap overflow-hidden">
                <div className="flex justify-between w-full">
                  <span>อ.</span>
                  <span className="font-bold">
                    {props.stations[props.stations.length - 1]?.coordE[0] || ''}{props.stations[props.stations.length - 1]?.coordE[1] ? `.${props.stations[props.stations.length - 1]?.coordE[1]}` : ''}
                  </span>
                </div>
              </td>
              <td className="border border-black py-0.5 text-left pl-2 pr-2 whitespace-nowrap overflow-hidden">
                <div className="flex justify-between w-full">
                  <span>น.</span>
                  <span className="font-bold">
                    {props.stations[props.stations.length - 1]?.coordN[0] || ''}{props.stations[props.stations.length - 1]?.coordN[1] ? `.${props.stations[props.stations.length - 1]?.coordN[1]}` : ''}
                  </span>
                </div>
              </td>
              <td className="border border-black py-0.5 text-left pl-2 pr-2 whitespace-nowrap overflow-hidden">
                <div className="flex justify-between w-full">
                  <span>ส.</span>
                  <span className="font-bold">
                    {props.stations[props.stations.length - 1]?.coordH[0] || ''}{props.stations[props.stations.length - 1]?.coordH[1] ? `.${props.stations[props.stations.length - 1]?.coordH[1]}` : ''}
                  </span>
                </div>
              </td>
            </tr>
            
            {/* Signatures */}
            <tr>
              <td colSpan={16} className="border-0 py-2 px-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-center">
                    <div className="flex items-end">
                      <span className="mr-2 text-base">ผู้คำนวณ</span>
                      <div className="border-b border-black w-40 text-center pb-0.5">
                        {props.calculatorName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-end">
                      <span className="mr-2 text-base">ผู้ตรวจสอบ</span>
                      <div className="border-b border-black w-40 text-center pb-0.5">
                        {props.checkerName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-end text-base">
                      <span className="mr-2">ว./ด./ป.</span>
                      <div className="border-b border-black w-24 text-center pb-0.5">
                        {props.date}
                      </div>
                      <span className="ml-2">แผ่นที่ <span className="border-b border-black inline-block w-8 text-center">{props.sheetNumber}</span> ใน <span className="border-b border-black inline-block w-8 text-center">{props.totalPages}</span> แผ่น</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
