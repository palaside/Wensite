import React, { useState, useRef } from 'react';
import { useReportContext } from '../context/ReportContext';
import './M17PlottingBoard.css';

interface M17PlottingBoardProps {
  onClose?: () => void;
}

export function M17PlottingBoard({ onClose }: M17PlottingBoardProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { allGuns, section3Data, mainGun, centerAzimuth, centerDistance, azimuth: lofAzimuth } = useReportContext();

  // Generate Ticks and Numbers
  const generateTicks = () => {
    const ticks = [];
    // 6400 mils = 360 degrees. 100 mils = 5.625 degrees. 10 mils = 0.5625 degrees
    for (let i = 0; i < 640; i++) {
      const angle = i * 0.5625; // in degrees
      const isMajor = i % 10 === 0;
      const isMedium = i % 5 === 0 && !isMajor;
      
      const r_outer = 245;
      const r_middle = 230;
      const r_inner = 215;

      ticks.push(
        <g key={`tick-${i}`} transform={`rotate(${angle} 250 250)`}>
          {/* Outer Tick */}
          <line x1="250" y1={250 - r_outer} x2="250" y2={250 - r_outer + (isMajor ? 8 : isMedium ? 5 : 3)} stroke="#111" strokeWidth={isMajor ? 1 : 0.5} />
          
          {/* Middle Tick */}
          <line x1="250" y1={250 - r_middle} x2="250" y2={250 - r_middle + (isMajor ? 8 : isMedium ? 5 : 3)} stroke="#cc0000" strokeWidth={isMajor ? 1 : 0.5} />
          
          {/* Inner Tick */}
          <line x1="250" y1={250 - r_inner} x2="250" y2={250 - r_inner + (isMajor ? 8 : isMedium ? 5 : 3)} stroke="#111" strokeWidth={isMajor ? 1 : 0.5} />

          {isMajor && (
            <>
              {/* Outer Text (0-64 CW) */}
              <text x="250" y={250 - r_outer + 16} textAnchor="middle" className="m17-text-outer">
                {i / 10}
              </text>
              
              {/* Middle Text (0-32 CCW) */}
              <text x="250" y={250 - r_middle + 16} textAnchor="middle" className="m17-text-middle">
                {(64 - (i / 10)) % 32 || 32}
              </text>

              {/* Inner Text (0 center, increases both ways) */}
              <text x="250" y={250 - r_inner + 16} textAnchor="middle" className="m17-text-inner">
                {i / 10 <= 32 ? (i / 10) : (64 - (i / 10))}
              </text>
            </>
          )}
        </g>
      );
    }
    return ticks;
  };

  // Generate grid (Dense red millimeter paper)
  const generateGrid = () => {
    const lines = [];
    const size = 500;
    const step = 5; // Very dense (e.g. 5px per line)
    
    for (let i = 0; i <= size; i += step) {
      const isMajor = i % 50 === 0;
      lines.push(
        <line key={`v-${i}`} x1={i} y1={0} x2={i} y2={size} className={isMajor ? "m17-grid-pattern-major" : "m17-grid-pattern"} />
      );
      lines.push(
        <line key={`h-${i}`} x1={0} y1={i} x2={size} y2={i} className={isMajor ? "m17-grid-pattern-major" : "m17-grid-pattern"} />
      );
    }
    return lines;
  };

  // Generate edge rulers
  const generateRulers = () => {
    const rulers = [];
    // Top Edge (mm)
    for (let i = 0; i < 700; i += 5) {
      const isMajor = i % 50 === 0;
      const isMedium = i % 10 === 0 && !isMajor;
      rulers.push(
        <g key={`top-${i}`}>
          <line x1={i + 50} y1={0} x2={i + 50} y2={isMajor ? 15 : isMedium ? 10 : 5} stroke="#333" strokeWidth="1" />
          {isMajor && i > 0 && <text x={i + 50} y={25} textAnchor="middle" className="m17-ruler-text">{i / 10}</text>}
        </g>
      );
    }
    
    // Right Edge (inches)
    for (let i = 0; i < 500; i += 10) {
      const isMajor = i % 100 === 0;
      const isMedium = i % 50 === 0 && !isMajor;
      rulers.push(
        <g key={`right-${i}`}>
          <line x1={800} y1={i + 50} x2={800 - (isMajor ? 15 : isMedium ? 10 : 5)} y2={i + 50} stroke="#333" strokeWidth="1" />
          {isMajor && i > 0 && <text x={770} y={i + 54} textAnchor="end" className="m17-ruler-text">{i / 100}</text>}
        </g>
      );
    }
    return rulers;
  };

  // Handle Drag Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !discRef.current) return;
    
    const rect = discRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    // Add 90 because atan2 0 is East, but our disc's 0 is North.
    setRotation(angle + 90);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Generate plotted points
  const generatePlottedPoints = () => {
    const points = [];
    
    // Plot Guns (Red dots)
    allGuns.forEach(gun => {
      const d = section3Data[gun];
      if (!d) return;
      
      const rawX = d.lrText === 'ซ้าย' ? -parseInt(d.lrDist) : parseInt(d.lrDist);
      const rawY = d.frText === 'หลัง' ? -parseInt(d.frDist) : parseInt(d.frDist);
      
      const svgX = 250 + rawX;
      const svgY = 250 - rawY; // SVG Y is inverted (up is smaller)
      
      let color = '#ef4444'; // Red
      if (gun === mainGun) color = '#ef4444'; // Keep it red for guns
      
      points.push(
        <g key={`plot-gun-${gun}`}>
          <circle cx={svgX} cy={svgY} r="4" fill={color} stroke="black" strokeWidth="1" />
          <text x={svgX + 6} y={svgY + 4} fontSize="10" fill="black" fontWeight="bold">ป.{gun}</text>
        </g>
      );
    });

    // Plot Aiming Circle (จก.1) (Green dot)
    const cAz = parseInt(centerAzimuth) || 0;
    const cDist = parseInt(centerDistance) || 0;
    const lofAz = parseInt(lofAzimuth) || 0;
    
    // Azimuth from Center to OP is back azimuth of OP to Center
    const backAz = (cAz + 3200) % 6400;
    const relativeAz = backAz - lofAz;
    const relativeAzRads = relativeAz * (Math.PI / 3200);
    
    // Calculate offsets based on Line of Fire (UP is forward)
    const frDistRaw = cDist * Math.cos(relativeAzRads);
    const lrDistRaw = cDist * Math.sin(relativeAzRads);
    
    const svgX = 250 + lrDistRaw;
    const svgY = 250 - frDistRaw;
    
    points.push(
      <g key={`plot-op1`}>
        <circle cx={svgX} cy={svgY} r="4" fill="#10b981" stroke="black" strokeWidth="1" />
        <text x={svgX + 6} y={svgY + 4} fontSize="10" fill="#10b981" fontWeight="bold">จก.1</text>
      </g>
    );

    return points;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <h2 className="text-2xl font-bold text-white tracking-widest">M.17 PLOTTING BOARD</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded">
            ปิด (Close)
          </button>
        )}
      </div>

      <div className="m17-container">
        
        {/* Base Board */}
        <div className="m17-board">
          
          {/* Base SVG for outlines and rulers */}
          <svg width="1000" height="600" className="absolute top-0 left-0 pointer-events-none">
            {generateRulers()}
          </svg>

          {/* Grid Layer */}
          <div className="m17-grid-layer">
            <svg width="500" height="500">
              {generateGrid()}
              {/* Line of Fire */}
              <line x1="250" y1="250" x2="250" y2="0" stroke="#cc0000" strokeWidth="4" />
              <polygon points="245,15 255,15 250,0" fill="#cc0000" />
              
              {/* Plot points on the base grid layer */}
              {generatePlottedPoints()}
            </svg>
          </div>

          {/* Rotating Disc */}
          <div 
            ref={discRef}
            className="m17-rotating-disc"
            style={{ transform: `rotate(${rotation}deg)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <svg width="500" height="500">
              {/* Index Line */}
              <line x1="250" y1="0" x2="250" y2="500" stroke="#111" strokeWidth="1.5" />

              {generateTicks()}
            </svg>
          </div>
          
          {/* Summary Panel on the right */}
          <div className="absolute right-0 top-0 w-[450px] h-[600px] p-6 pr-12 pt-16 flex flex-col gap-6 font-sans">
            {allGuns.map(gun => {
              const d = section3Data[gun];
              if (!d) return null;
              
              // Only show details if distance > 0
              if (parseInt(d.distance) === 0) {
                return (
                  <div key={`summary-${gun}`} className="flex flex-col items-center gap-1 text-[#333]">
                    <div className="text-2xl font-bold tracking-widest">ป.หมู่ {gun}</div>
                    <div className="text-lg tracking-wider">- ศูนย์กลางร้อย -</div>
                  </div>
                );
              }

              return (
                <div key={`summary-${gun}`} className="flex flex-col items-center gap-1 text-[#333]">
                  <div className="text-2xl font-bold tracking-widest">ป.หมู่ {gun}</div>
                  <div className="text-lg tracking-wider flex items-center justify-center gap-4">
                    <span>มุมทิศ <strong className="text-black">{d.azimuth}</strong></span>
                    <span>ระยะ <strong className="text-black">{d.distance}</strong></span>
                    <span>{d.frText} <strong className="text-black">{d.frDist}</strong></span>
                    <span>{d.lrText} <strong className="text-black">{d.lrDist}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>

        <div className="mt-6 text-gray-400 text-sm max-w-2xl text-center">
          <p>จำลองแผ่นกรุย M.17 แบบโต้ตอบได้ 100% สเกลความละเอียด 10 มิลเลียมต่อขีด</p>
          <p className="mt-1">ใช้เมาส์หรือนิ้วลากแผ่นใสตรงกลางเพื่อหมุนหาค่ามุมภาค (แถวนอกสีดำ), มุมทิศของแผ่นเรขายิง (แถวกลางสีแดง) และการคำนวณแบบลอดลัด (แถวในสุดสีดำ)</p>
        </div>
      </div>
    </div>
  );
}
