import React, { useEffect, useState } from 'react';

interface MapViewProps {
  isVisible: boolean;
  onClose: () => void;
  targetGrid?: string;
}

export const MapView: React.FC<MapViewProps> = ({ isVisible, onClose, targetGrid }) => {
  const [mapUrl, setMapUrl] = useState('https://script.google.com/macros/s/AKfycbyhhanjlUm2jy3Encz5OSVd9Sh7iYqxAfUurfIy1lE4Wdt9XwlrCljM8_jlI6kxB6OH/exec');

  useEffect(() => {
    // If a target grid is provided, append it to the map URL so the map might focus on it
    if (targetGrid) {
      setMapUrl(`https://script.google.com/macros/s/AKfycbyhhanjlUm2jy3Encz5OSVd9Sh7iYqxAfUurfIy1lE4Wdt9XwlrCljM8_jlI6kxB6OH/exec?grid=${targetGrid}`);
    } else {
      setMapUrl('https://script.google.com/macros/s/AKfycbyhhanjlUm2jy3Encz5OSVd9Sh7iYqxAfUurfIy1lE4Wdt9XwlrCljM8_jlI6kxB6OH/exec');
    }
  }, [targetGrid, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-full p-4 md:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Tactical Map Center</h1>
            {targetGrid && (
              <span className="ml-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full font-mono text-sm">
                Target: {targetGrid}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 rounded-full p-2 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <iframe 
            src={mapUrl}
            className="w-full h-full border-0"
            title="Tactical Map"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
