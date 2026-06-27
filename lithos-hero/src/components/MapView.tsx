import React, { useEffect, useState } from 'react';

interface MapViewProps {
  isVisible: boolean;
  onClose?: () => void;
  targetGrid?: string;
  forceExpanded?: boolean;
  onCloseExpanded?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ isVisible, onClose, targetGrid, forceExpanded, onCloseExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Sync prop to local state
  useEffect(() => {
    if (forceExpanded) setIsExpanded(true);
  }, [forceExpanded]);

  const [mapUrl, setMapUrl] = useState('https://script.google.com/macros/s/AKfycbyhhanjlUm2jy3Encz5OSVd9Sh7iYqxAfUurfIy1lE4Wdt9XwlrCljM8_jlI6kxB6OH/exec');

  // Fetch location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const baseUrl = 'https://script.google.com/macros/s/AKfycbyhhanjlUm2jy3Encz5OSVd9Sh7iYqxAfUurfIy1lE4Wdt9XwlrCljM8_jlI6kxB6OH/exec';
    const params = new URLSearchParams();
    
    if (targetGrid) params.append('grid', targetGrid);
    if (userLocation) {
      params.append('lat', userLocation.lat.toString());
      params.append('lng', userLocation.lng.toString());
    }
    
    const queryString = params.toString();
    setMapUrl(queryString ? `${baseUrl}?${queryString}` : baseUrl);
  }, [targetGrid, isVisible, userLocation]);

  if (!isVisible && !isExpanded) return null; // Only hide if neither visible nor expanded (expanded overrides visibility for modal)

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      if (onCloseExpanded) onCloseExpanded();
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className={`fixed z-[350] pointer-events-auto transition-all duration-300 ease-in-out flex flex-col overflow-hidden
      ${isExpanded 
        ? 'inset-0 bg-black/80 backdrop-blur-sm p-4 md:p-8 rounded-none' 
        : 'bottom-6 left-6 w-[380px] h-[320px] bg-[#111]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
      }
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
        </h2>
        
        <div className="flex items-center gap-2">
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

      {/* Map Container */}
      <div className={`flex-1 bg-slate-900 overflow-hidden ${isExpanded ? 'border-2 border-slate-700 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]' : ''}`}>
        <iframe 
          src={mapUrl}
          className="w-full h-full border-0"
          title="Tactical Map"
          allowFullScreen
        />
      </div>
    </div>
  );
};
