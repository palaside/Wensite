import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api';

interface MapViewProps {
  isVisible: boolean;
  onClose?: () => void;
  targetGrid?: string;
  forceExpanded?: boolean;
  onCloseExpanded?: () => void;
  customPositionClass?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB-a8ffhTAeWtdeDCkGCADMKOlZ-519sZU';

const containerStyle = {
  width: '100%',
  height: '100%'
};

export const MapView: React.FC<MapViewProps> = ({ isVisible, onClose, targetGrid, forceExpanded, onCloseExpanded, customPositionClass }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: 15.6709, lng: 100.1225 });
  const [isStreetView, setIsStreetView] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const [pov, setPov] = useState({ heading: 0, pitch: 0 });
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const pegmanSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 24 36">
      <path d="M12,12 C14.2,12 16,13.8 16,16 L16,24 L14,24 L14,34 L10,34 L10,24 L8,24 L8,16 C8,13.8 9.8,12 12,12 Z" fill="#FBBF24" stroke="#92400E" stroke-width="1.5" />
      <circle cx="12" cy="6.5" r="4.5" fill="#FBBF24" stroke="#92400E" stroke-width="1.5" />
      <ellipse cx="12" cy="34" rx="8" ry="2" fill="rgba(0,0,0,0.3)" />
    </svg>
  `);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });
  
  // Sync prop to local state
  useEffect(() => {
    if (forceExpanded) setIsExpanded(true);
  }, [forceExpanded]);

  // Fetch location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setManualLat(pos.coords.latitude.toString());
          setManualLng(pos.coords.longitude.toString());
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  if (!isVisible && !isExpanded) return null; // Only hide if neither visible nor expanded (expanded overrides visibility for modal)

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      if (onCloseExpanded) onCloseExpanded();
    } else {
      setIsExpanded(true);
    }
  };

  const handleSaveManualLocation = () => {
    if (manualLat && manualLng) {
      setUserLocation({ lat: parseFloat(manualLat), lng: parseFloat(manualLng) });
      setShowManualInput(false);
    }
  };

  const handlePovChanged = () => {
    if (panoramaRef.current) {
      const newPov = panoramaRef.current.getPov();
      setPov({ heading: newPov.heading, pitch: newPov.pitch });
    }
  };

  const onLoadPanorama = (pano: google.maps.StreetViewPanorama) => {
    panoramaRef.current = pano;
  };

  const onLoadMap = (map: google.maps.Map) => {
    const panorama = map.getStreetView();
    if (panorama) {
      window.google.maps.event.addListener(panorama, 'pov_changed', () => {
        const newPov = panorama.getPov();
        setPov({ heading: newPov.heading, pitch: newPov.pitch });
      });
    }
  };

  return (
    <div className={`
      ${isExpanded 
        ? 'fixed z-[1000] inset-0 p-4 md:p-8 rounded-none bg-black/80 flex flex-col overflow-hidden' 
        : (customPositionClass || 'fixed z-[350] bottom-6 left-6 w-[380px] h-[320px] rounded-2xl flex flex-col overflow-hidden bg-[#111]/95 backdrop-blur-xl border border-emerald-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)]')
      }
      pointer-events-auto transition-all duration-300 ease-in-out
      ${!isVisible && !isExpanded ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}
    `}>
      {/* Header */}
      <div className={`flex justify-between items-center border-b border-emerald-500/20 bg-black/60
        ${isExpanded ? 'p-4 mb-4 rounded-xl' : 'p-3'}
      `}>
        <h2 className="text-emerald-400 font-bold flex items-center gap-2">
          <svg className={isExpanded ? 'w-6 h-6' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className={isExpanded ? 'text-xl tracking-widest' : 'text-sm'}>
            {isExpanded ? 'TACTICAL MAP CENTER' : 'MINI-MAP'}
          </span>
          {targetGrid && (
            <span className="ml-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full font-mono text-xs">
              {targetGrid}
            </span>
          )}
          
          {isStreetView && (
             <span className="ml-2 bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded font-mono text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                AZIMUTH: {Math.round(pov.heading)}° / {Math.round((pov.heading / 360) * 6400)} mils
             </span>
          )}
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsStreetView(!isStreetView)}
            className={`transition-colors p-1 rounded px-2 text-xs font-bold ${isStreetView ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-700/50 text-gray-300 hover:text-white'}`}
            title="สลับโหมด Street View / แผนที่ปกติ"
          >
            {isStreetView ? 'STREET VIEW' : 'MAP VIEW'}
          </button>
          
          <button 
            onClick={() => setShowManualInput(!showManualInput)}
            className={`transition-colors p-1 rounded ${showManualInput ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}
            title="ตั้งค่าพิกัดแบบ Manual (เมื่อ GPS ไม่มีสัญญาณ)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button 
            onClick={handleToggleExpand}
            className="text-gray-500 hover:text-emerald-400 transition-colors p-1"
            title={isExpanded ? "Collapse to Mini-Map" : "Expand Map"}
          >
            {isExpanded ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            )}
          </button>
          
          {onClose && !isExpanded && (
            <button onClick={onClose} className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          {isExpanded && onCloseExpanded && (
            <button onClick={() => { setIsExpanded(false); onCloseExpanded(); }} className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Manual Input Overlay */}
      {showManualInput && (
        <div className="bg-black/90 border-b border-emerald-500/30 p-3 space-y-2 text-sm z-10">
          <div className="text-emerald-400 text-xs mb-2">กำหนดพิกัดเอง (Manual Location)</div>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Latitude" 
              value={manualLat} 
              onChange={e => setManualLat(e.target.value)} 
              className="w-full md:w-1/2 bg-slate-900 border border-emerald-500/30 rounded p-1 text-emerald-300 focus:outline-none"
            />
            <input 
              type="number" 
              placeholder="Longitude" 
              value={manualLng} 
              onChange={e => setManualLng(e.target.value)} 
              className="w-full md:w-1/2 bg-slate-900 border border-emerald-500/30 rounded p-1 text-emerald-300 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowManualInput(false)} className="px-3 py-1 text-gray-400 hover:text-white">ยกเลิก</button>
            <button onClick={handleSaveManualLocation} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded">บันทึกพิกัด</button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className={`flex-1 bg-slate-900 overflow-hidden relative ${isExpanded ? 'border-2 border-slate-700 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]' : ''}`}>
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center text-emerald-500 font-mono">
            INITIALIZING TACTICAL MAP...
          </div>
        ) : (
          isStreetView ? (
             <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={17}
             >
                <StreetViewPanorama 
                  onLoad={onLoadPanorama}
                  onPovChanged={handlePovChanged}
                  options={{
                    position: userLocation,
                    visible: true,
                    enableCloseButton: false,
                    addressControl: false,
                    linksControl: true,
                    panControl: true
                  }}
                />
             </GoogleMap>
          ) : (
             <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={17}
                onLoad={onLoadMap}
                onClick={(e) => {
                  if (e.latLng) {
                    setUserLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
                options={{
                  mapTypeId: 'roadmap',
                  streetViewControl: true, // Show pegman
                  mapTypeControl: true,    // Allow changing to satellite
                  fullscreenControl: false,
                  streetViewControlOptions: {
                    position: 9 // BOTTOM_RIGHT
                  }
                }}
             >
                <Marker 
                  position={userLocation} 
                  icon={{
                    url: pegmanSvg,
                    anchor: window.google ? new window.google.maps.Point(16, 48) : undefined
                  }}
                />
             </GoogleMap>
          )
        )}
      </div>
    </div>
  );
};
