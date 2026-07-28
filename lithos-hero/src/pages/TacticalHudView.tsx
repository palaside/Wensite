import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, Target, Shield, Settings, Navigation, X, Sun, Moon, Map as MapIcon, Layers, AlertTriangle, Timer, Zap, Flame } from 'lucide-react';
import { calculateCorrection, calculateDistance, calculateFlashToBang, getLethalityRecommendation } from '../lib/artilleryMath';
import type { Coordinate, CorrectionResult, TargetType, WeaponRecommendation } from '../lib/artilleryMath';
import { MatrixText } from '../components/MatrixText';

interface TacticalHudViewProps {
  isVisible: boolean;
  onClose: () => void;
}

// Custom Leaflet Icons
const createTacticalIcon = (color: string, label: string, glow: boolean = false) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `
    <div class="flex flex-col items-center translate-y-[-100%]">
      <div class="w-8 h-8 rounded-full border-2 border-${color}-500 bg-${color}-500/20 flex items-center justify-center ${glow ? `shadow-[0_0_15px_${color}]` : ''}">
        <div class="w-2 h-2 bg-${color}-500 rounded-full shadow-[0_0_10px_${color}]"></div>
      </div>
      <div class="text-${color}-400 text-[10px] font-bold bg-black/70 px-1 rounded mt-1 border border-${color}-900/50">${label}</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const OP_ICON = createTacticalIcon('blue', 'OP', true);
const TGT_ICON = createTacticalIcon('red', 'TGT', true);
const IMP_ICON = createTacticalIcon('orange', 'IMP');
const FDC_ICON = createTacticalIcon('yellow', 'FDC');
const GUNS_ICON = createTacticalIcon('rose', 'GUNS');

const createHillIcon = (elevation: number) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `
    <div class="flex flex-col items-center translate-y-[-100%]">
      <div class="text-white text-[9px] font-bold bg-green-900/80 px-1.5 py-0.5 rounded border border-green-500/50 whitespace-nowrap shadow-[0_0_10px_rgba(34,197,94,0.3)]">
        ⛰️ สูง ${Math.round(elevation)}
      </div>
      <div class="w-1 h-1 bg-green-500 rounded-full mt-1 shadow-[0_0_5px_rgba(34,197,94,1)]"></div>
    </div>
  `,
  iconSize: [60, 32],
  iconAnchor: [30, 32]
});

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const AutoLocate = ({ setOpAuto }: { setOpAuto: (lat: number, lon: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          map.flyTo([lat, lon], 14, { animate: true, duration: 2 });
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [map]);
  return null;
};

export const TacticalHudView: React.FC<TacticalHudViewProps> = ({ isVisible, onClose }) => {
  const [panelWidth, setPanelWidth] = useState(400); 
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'adjust' | 'convert' | 'saved' | 'settings'>('adjust');
  const [mapBase, setMapBase] = useState<'satellite' | 'terrain'>('satellite');
  const [mapMode, setMapMode] = useState<'day' | 'night'>('night');

  const [observer, setObserver] = useState<Coordinate | null>(null);
  const [target, setTarget] = useState<Coordinate | null>(null);
  const [impact, setImpact] = useState<Coordinate | null>(null);
  const [fdcPos, setFdcPos] = useState<Coordinate | null>(null);
  const [gunsPos, setGunsPos] = useState<Coordinate | null>(null);
  const [correction, setCorrection] = useState<CorrectionResult | null>(null);
  
  const [isDangerClose, setIsDangerClose] = useState(false);
  const [isTrajectoryBlocked, setIsTrajectoryBlocked] = useState(false);

  const [hills, setHills] = useState<{lat: number, lon: number, elevation: number}[]>([]);
  const [isScanningHill, setIsScanningHill] = useState(false);
  const [isFetchingElevation, setIsFetchingElevation] = useState(false);

  // Flash-to-Bang State
  const [flashStartTime, setFlashStartTime] = useState<number | null>(null);
  const [flashDistance, setFlashDistance] = useState<number | null>(null);

  // Lethality Engine State
  const [tgtType, setTgtType] = useState<TargetType | null>(null);

  const [matrixTrigger, setMatrixTrigger] = useState(0);

  // Drag Panel Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      let newWidth = containerRect.right - e.clientX;
      setPanelWidth(Math.max(containerRect.width * 0.20, Math.min(newWidth, containerRect.width * 0.70)));
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMapClick = async (lat: number, lon: number) => {
    if (isScanningHill) {
      setIsFetchingElevation(true);
      try {
        const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
        const data = await res.json();
        setHills(prev => [...prev, { lat, lon, elevation: data.results[0].elevation }]);
      } catch (err) {
        console.error("Failed to fetch elevation", err);
      } finally {
        setIsFetchingElevation(false);
      }
      return;
    }

    // Instant Fire Correction (Switch tab automatically)
    if (activeTab !== 'adjust') setActiveTab('adjust');

    if (!observer) {
      setObserver({ lon, lat, alt: 0 });
    } else if (!target) {
      setTarget({ lon, lat, alt: 0 });
    } else if (!impact) {
      setImpact({ lon, lat, alt: 0 });
    }
  };

  useEffect(() => {
    if (observer && target && impact) setCorrection(calculateCorrection(observer, target, impact));
    else setCorrection(null);

    if (observer && target) {
      setIsDangerClose(calculateDistance(observer, target) < 600);
      
      // Silent Trajectory Check
      const checkCrest = async () => {
        const mLat = (observer.lat + target.lat) / 2;
        const mLon = (observer.lon + target.lon) / 2;
        try {
          const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${mLat},${mLon}`);
          const data = await res.json();
          const elev = data.results[0].elevation;
          // Simple mock logic: if midpoint elevation > 200m relative to OP, it might block low-angle trajectory.
          setIsTrajectoryBlocked(elev > (observer.alt || 0) + 200);
        } catch (e) {
          setIsTrajectoryBlocked(false);
        }
      };
      checkCrest();
    } else {
      setIsDangerClose(false);
      setIsTrajectoryBlocked(false);
    }
  }, [observer, target, impact]);

  useEffect(() => {
    if (observer) {
      if (!fdcPos) setFdcPos({ lat: observer.lat - 0.01, lon: observer.lon - 0.01 });
      if (!gunsPos) setGunsPos({ lat: observer.lat - 0.015, lon: observer.lon - 0.015 });
    } else {
      setFdcPos(null);
      setGunsPos(null);
    }
  }, [observer]);

  // Flash-to-Bang Logic
  const handleFlash = () => setFlashStartTime(Date.now());
  const handleBang = () => {
    if (flashStartTime) {
      const seconds = (Date.now() - flashStartTime) / 1000;
      setFlashDistance(calculateFlashToBang(seconds));
      setFlashStartTime(null);
    }
  };

  if (!isVisible) return null;

  let tileUrl = mapMode === 'night' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : (mapBase === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}');


  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex overflow-hidden font-mono"
      ref={containerRef}
    >
      <AnimatePresence>
        {isDangerClose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[350] pointer-events-none border-[10px] border-red-600/50 bg-red-900/10 mix-blend-screen animate-[pulse_1s_infinite]">
            <div className="absolute top-10 w-full text-center">
              <span className="bg-red-600 text-white font-bold text-4xl px-8 py-2 tracking-[0.2em] rounded-sm shadow-[0_0_50px_rgba(220,38,38,1)]">DANGER CLOSE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-grow h-full bg-[#0a0a0a]">
        <MapContainer center={[13.7563, 100.5018]} zoom={13} zoomControl={false} style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
          <AutoLocate setOpAuto={() => {}} />
          <TileLayer key={tileUrl} url={tileUrl} attribution="&copy; Esri, OpenStreetMap, CARTO" />
          <MapEvents onMapClick={handleMapClick} />

          {observer && target && (
            <Polyline positions={[[observer.lat, observer.lon], [target.lat, target.lon]]} color={isDangerClose ? "#ef4444" : isTrajectoryBlocked ? "#f97316" : "#06b6d4"} weight={2} dashArray="5, 5" />
          )}

          {target && (
            <>
              <Circle center={[target.lat, target.lon]} radius={150} pathOptions={{ color: '#f59e0b', weight: 1, dashArray: '4,4', fillColor: '#f59e0b', fillOpacity: 0.1 }} />
              <Circle center={[target.lat, target.lon]} radius={50} pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.3 }} />
            </>
          )}

          {observer && (
            <Marker 
              position={[observer.lat, observer.lon]} 
              icon={OP_ICON} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setObserver({ lat: position.lat, lon: position.lng, alt: observer.alt });
                }
              }}
            />
          )}
          {target && (
            <Marker 
              position={[target.lat, target.lon]} 
              icon={TGT_ICON} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setTarget({ lat: position.lat, lon: position.lng, alt: target.alt });
                }
              }}
            />
          )}
          {impact && (
            <Marker 
              position={[impact.lat, impact.lon]} 
              icon={IMP_ICON} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setImpact({ lat: position.lat, lon: position.lng, alt: impact.alt });
                }
              }}
            />
          )}
          
          {fdcPos && (
            <Marker 
              position={[fdcPos.lat, fdcPos.lon]} 
              icon={FDC_ICON} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setFdcPos({ lat: position.lat, lon: position.lng });
                }
              }}
            />
          )}
          {gunsPos && (
            <Marker 
              position={[gunsPos.lat, gunsPos.lon]} 
              icon={GUNS_ICON} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setGunsPos({ lat: position.lat, lon: position.lng });
                }
              }}
            />
          )}

          {hills.map((h, i) => <Marker key={i} position={[h.lat, h.lon]} icon={createHillIcon(h.elevation)} />)}
        </MapContainer>

        <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-900/50 rounded-lg p-1 flex">
            <button onClick={() => setMapMode('day')} className={`p-2 rounded ${mapMode === 'day' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500'}`} title="Day"><Sun className="w-5 h-5" /></button>
            <button onClick={() => setMapMode('night')} className={`p-2 rounded ${mapMode === 'night' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500'}`} title="Night"><Moon className="w-5 h-5" /></button>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-cyan-900/50 rounded-lg p-1 flex flex-col">
            <button onClick={() => setMapBase('satellite')} className={`p-2 rounded flex items-center gap-2 text-[10px] font-bold ${mapBase === 'satellite' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500'}`}><Layers className="w-4 h-4" /> SAT</button>
            <button onClick={() => setMapBase('terrain')} className={`p-2 rounded flex items-center gap-2 text-[10px] font-bold ${mapBase === 'terrain' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500'}`}><MapIcon className="w-4 h-4" /> TER</button>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-green-900/50 rounded-lg p-1 flex flex-col mt-2">
            <button onClick={() => setIsScanningHill(!isScanningHill)} className={`p-2 rounded flex flex-col items-center gap-1 text-[9px] font-bold ${isScanningHill ? 'bg-green-900/40 text-green-400 animate-pulse' : 'text-gray-500'}`}>
              <span className="text-lg">⛰️</span> SCAN PEAK
            </button>
            {isFetchingElevation && <div className="text-[8px] text-yellow-400 text-center animate-pulse mt-1 font-bold">SCANNING...</div>}
          </div>
        </div>

        <div className="absolute top-6 left-6 pointer-events-none z-[400] flex flex-col gap-3">
          <div className={`border p-3 rounded-lg backdrop-blur-md shadow-lg transition-colors ${isDangerClose ? 'bg-red-950/60 border-red-500/50' : 'bg-cyan-950/40 border-cyan-500/30'}`}>
            <h2 className={`${isDangerClose ? 'text-red-400' : 'text-cyan-400'} font-bold text-lg tracking-widest flex items-center gap-2 mb-2`}>
              {isDangerClose ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Shield className="w-5 h-5" />}
              {isDangerClose ? 'SYSTEM WARNING' : 'HUD LINK ACTIVE'}
            </h2>
            <div className={`${isDangerClose ? 'text-red-300' : 'text-cyan-200/80'} text-[10px] animate-pulse`}>
              {isDangerClose ? '[DANGER CLOSE - CHECK OP DISTANCE]' : '[LEAFLET SYSTEM ENGAGED]'}
            </div>
          </div>
          
          <AnimatePresence>
            {isTrajectoryBlocked && (
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="border p-3 rounded-lg backdrop-blur-md shadow-lg bg-orange-950/80 border-orange-500/50 flex items-center gap-3">
                 <AlertTriangle className="w-6 h-6 text-orange-400 animate-pulse" />
                 <div>
                   <h2 className="text-orange-400 font-bold text-sm tracking-widest">TRAJECTORY BLOCKED</h2>
                   <div className="text-orange-300/80 text-[10px]">Crest clearance failed. Check elevation.</div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className={`w-1.5 bg-black cursor-col-resize border-x z-[500] ${isDangerClose ? 'border-red-900/50 hover:bg-red-900/80' : 'border-cyan-900/50 hover:bg-cyan-900/80'}`} onMouseDown={() => setIsDragging(true)}>
        <div className={`h-16 w-0.5 rounded-full ${isDangerClose ? 'bg-red-600/50' : 'bg-cyan-600/50'}`}></div>
      </div>

      <div style={{ width: `${panelWidth}px` }} className={`h-full bg-[#050505] border-l flex flex-col relative z-[600] ${isDangerClose ? 'border-red-900/50' : 'border-cyan-900/50'}`}>
        <button onClick={onClose} className="absolute top-3 right-3 z-50 text-gray-500 hover:text-white bg-gray-900/50 p-1.5 rounded-sm border border-gray-800"><X className="w-4 h-4" /></button>

        <div className={`flex bg-[#020202] p-1.5 gap-1 border-b mt-12 px-2 ${isDangerClose ? 'border-red-900/30' : 'border-cyan-900/30'}`}>
          <TabButton active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={<Crosshair className="w-3 h-3" />} label="ปรับยิง" color={isDangerClose ? 'red' : 'cyan'} />
          <TabButton active={activeTab === 'convert'} onClick={() => { setActiveTab('convert'); setMatrixTrigger(v => v + 1); }} icon={<Navigation className="w-3 h-3" />} label="แปลงพิกัด" color={isDangerClose ? 'red' : 'cyan'} />
          <TabButton active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} icon={<Target className="w-3 h-3" />} label="บันทึกจำ" color={isDangerClose ? 'red' : 'cyan'} />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-3 h-3" />} label="ตั้งค่า" color={isDangerClose ? 'red' : 'cyan'} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'adjust' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                
                {/* AI Target Lethality Engine */}
                {target && (
                  <div className="border border-purple-500/50 rounded bg-purple-950/20 p-3 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center gap-2 mb-2 border-b border-purple-500/30 pb-2">
                      <Flame className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-[10px] font-bold tracking-widest uppercase">AI Lethality Engine</span>
                    </div>
                    <select 
                      className="w-full bg-black border border-purple-900/50 text-purple-300 text-xs p-2 rounded outline-none mb-3"
                      value={tgtType || ''}
                      onChange={(e) => setTgtType(e.target.value as TargetType)}
                    >
                      <option value="" disabled>-- ระบุประเภทเป้าหมาย --</option>
                      <option value="infantry_open">ทหารราบในที่โล่ง (Infantry - Open)</option>
                      <option value="infantry_bunker">ทหารราบในที่กำบัง (Infantry - Bunker)</option>
                      <option value="armor">ยานเกราะ/รถถัง (Armor)</option>
                      <option value="soft_vehicles">ขบวนพาหนะ (Soft Vehicles)</option>
                      <option value="building">สิ่งปลูกสร้าง (Building)</option>
                    </select>

                    {tgtType && (
                      <div className="grid grid-cols-3 gap-2 text-center bg-black/50 p-2 rounded border border-purple-900/30">
                         <div>
                           <div className="text-gray-500 text-[9px] mb-1">กระสุน</div>
                           <div className="text-purple-300 font-bold text-xs">{getLethalityRecommendation(tgtType).projectile}</div>
                         </div>
                         <div className="border-x border-purple-900/30">
                           <div className="text-gray-500 text-[9px] mb-1">ชนวน</div>
                           <div className="text-purple-300 font-bold text-xs">{getLethalityRecommendation(tgtType).fuze}</div>
                         </div>
                         <div>
                           <div className="text-gray-500 text-[9px] mb-1">จำนวน</div>
                           <div className="text-purple-300 font-bold text-xs">{getLethalityRecommendation(tgtType).volleys} นัด</div>
                         </div>
                         <div className="col-span-3 mt-2 text-[9px] text-purple-400/70 border-t border-purple-900/30 pt-1 text-left">
                           * {getLethalityRecommendation(tgtType).reason}
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Flash to Bang */}
                <div className="border border-yellow-500/30 rounded bg-yellow-950/10 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3" /> Flash-to-Bang</span>
                    {flashDistance !== null && <span className="text-yellow-400 font-bold text-xs">{flashDistance} เมตร</span>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleFlash}
                      className="flex-1 bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-500/50 text-yellow-400 text-[10px] py-1.5 rounded transition-colors"
                    >
                      เห็นแสง (FLASH)
                    </button>
                    <button 
                      onClick={handleBang}
                      disabled={!flashStartTime}
                      className="flex-1 bg-orange-900/40 hover:bg-orange-800/60 disabled:opacity-50 border border-orange-500/50 text-orange-400 text-[10px] py-1.5 rounded transition-colors"
                    >
                      ได้ยินเสียง (BANG)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-2">
                  <PointCard title="1. ผตน. (Observer)" pt={observer} onClear={() => setObserver(null)} color="blue" />
                  <PointCard title="2. เป้าหมาย (Target)" pt={target} onClear={() => setTarget(null)} color="red" />
                  <PointCard title="3. จุดตก (Impact)" pt={impact} onClear={() => setImpact(null)} color="orange" />
                </div>

                {(!observer || !target || !impact) && (
                  <div className={`mt-2 p-3 border border-dashed rounded text-xs text-center ${isDangerClose ? 'border-red-900/50 bg-red-950/20 text-red-500/70' : 'border-cyan-900/50 bg-cyan-950/20 text-cyan-500/70'}`}>
                    คลิกบนแผนที่เพื่อกำหนดจุด
                  </div>
                )}

                {correction && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mt-2 border rounded overflow-hidden relative ${isDangerClose ? 'border-red-500/50 bg-red-950/20' : 'border-cyan-500/50 bg-cyan-950/20'}`}>
                    <div className="absolute top-0 right-0 p-1 opacity-20"><Crosshair className={`w-16 h-16 ${isDangerClose ? 'text-red-400' : 'text-cyan-400'}`} /></div>
                    <div className={`p-2 text-[10px] font-bold tracking-widest uppercase border-b ${isDangerClose ? 'bg-red-900/50 text-red-300 border-red-500/30' : 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30'}`}>
                      ผลการคำนวณปรับแก้ (Correction)
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 relative z-10">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px]">ทางข้าง (Deviation)</span>
                        <span className={`text-2xl font-bold mt-1 ${isDangerClose ? 'text-red-400' : 'text-cyan-400'}`}>{correction.leftRightDir} {correction.leftRight}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-[10px]">ทางระยะ (Range)</span>
                        <span className={`text-2xl font-bold mt-1 ${isDangerClose ? 'text-red-400' : 'text-cyan-400'}`}>{correction.addDropDir} {correction.addDrop}</span>
                      </div>
                      <div className={`flex flex-col col-span-2 border-t pt-2 mt-2 ${isDangerClose ? 'border-red-900/30' : 'border-cyan-900/30'}`}>
                        <span className="text-gray-500 text-[10px]">ทางสูง (Height)</span>
                        <span className={`text-lg font-bold ${isDangerClose ? 'text-red-500' : 'text-cyan-500'}`}>{correction.upDownDir} {correction.deltaH}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'convert' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="text-green-500 font-bold uppercase tracking-widest text-[11px] mb-2 border-b border-green-900/50 pb-1">Coordinate Converter</div>
                <div className="border border-green-900/50 rounded p-4 bg-green-950/10">
                  <div className="text-green-400/50 text-[10px] mb-1">MGRS INPUT</div>
                  <div className="bg-black border border-green-800/50 p-2 text-green-400 font-mono text-sm"><MatrixText text="47P QS 12345 67890" trigger={matrixTrigger} /></div>
                  <div className="flex justify-center my-3 text-green-700"><Navigation className="w-4 h-4 rotate-180" /></div>
                  <div className="text-green-400/50 text-[10px] mb-1">LAT/LON OUTPUT</div>
                  <div className="bg-black border border-green-800/50 p-2 text-green-400 font-mono text-sm flex justify-between">
                    <span>LAT: <MatrixText text="13.75630" trigger={matrixTrigger} /></span>
                    <span>LON: <MatrixText text="100.50180" trigger={matrixTrigger} /></span>
                  </div>
                </div>
                <button onClick={() => setMatrixTrigger(v => v + 1)} className="bg-green-900/30 border border-green-500/50 text-green-400 text-xs py-2 rounded hover:bg-green-800/50 transition-colors">INITIALIZE CONVERSION SEQUENCE</button>
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <div className="text-purple-500 font-bold uppercase tracking-widest text-[11px] mb-2 border-b border-purple-900/50 pb-1">Saved Missions (History)</div>
                 <div className="border border-purple-900/30 rounded p-3 bg-purple-950/10 text-xs text-purple-300 font-mono">
                  <div className="border-b border-purple-900/30 pb-2 mb-2 flex justify-between"><span>TGT-001</span><span className="text-purple-500">10:45:00</span></div>
                  <div>OP: 13.75, 100.50</div>
                  <div>TGT: 13.76, 100.51</div>
                  <div className="mt-2 text-purple-400 font-bold">ขวา 40, ลด 100</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                 <div className="text-gray-500 text-xs italic">ตั้งค่าระบบ (กำลังอยู่ในระหว่างการพัฒนา)</div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

function TabButton({ active, onClick, icon, label, color = 'cyan' }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color?: 'cyan' | 'red' }) {
  const activeClass = color === 'cyan' ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' : 'bg-red-900/40 text-red-400 border-red-500/50 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]';
  const hoverClass = color === 'cyan' ? 'hover:text-cyan-600' : 'hover:text-red-600';
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-[4px] border transition-all ${active ? `${activeClass}` : `bg-transparent text-gray-600 ${hoverClass} hover:bg-gray-900 border-transparent`}`}>
      {icon}
      <span className="text-[9px] mt-1 font-bold tracking-wider">{label}</span>
    </button>
  );
}

function PointCard({ title, pt, onClear, color }: { title: string, pt: Coordinate | null, onClear: () => void, color: 'blue' | 'red' | 'orange' }) {
  const colorMap = { blue: 'border-blue-900/50 text-blue-400 bg-blue-950/20', red: 'border-red-900/50 text-red-400 bg-red-950/20', orange: 'border-orange-900/50 text-orange-400 bg-orange-950/20' };
  return (
    <div className={`border p-2 rounded ${colorMap[color]} relative flex flex-col`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        {pt && <button onClick={onClear} className="text-gray-500 hover:text-white"><X className="w-3 h-3" /></button>}
      </div>
      {pt ? <div className="grid grid-cols-2 text-[10px] gap-1 font-mono text-gray-300"><div>LAT: {pt.lat.toFixed(5)}</div><div>LON: {pt.lon.toFixed(5)}</div></div> : <div className="text-[10px] text-gray-600 italic">รอการกำหนด...</div>}
    </div>
  );
}
