import React from 'react';
import { useFDC } from '../../context/FDCContext';

export const SystemSetupModule: React.FC = () => {
  const { settings, updateSettings } = useFDC();

  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        FDC Grid & Battery Center
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Easting (Grid E)</label>
          <input 
            type="text" 
            value={settings.fdcEasting}
            onChange={(e) => updateSettings({ fdcEasting: e.target.value })}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Northing (Grid N)</label>
          <input 
            type="text" 
            value={settings.fdcNorthing}
            onChange={(e) => updateSettings({ fdcNorthing: e.target.value })}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Altitude (m)</label>
          <input 
            type="text" 
            value={settings.fdcAltitude}
            onChange={(e) => updateSettings({ fdcAltitude: e.target.value })}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Base Azimuth (mils)</label>
          <input 
            type="text" 
            value={settings.simDir}
            onChange={(e) => updateSettings({ simDir: e.target.value })}
            className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4 mt-6">
        Battery Configuration
      </div>
      
      <div>
        <label className="block text-[10px] text-emerald-500/70 uppercase tracking-wider mb-1">Ammunition Preset</label>
        <select 
          value={settings.ammoType}
          onChange={(e) => updateSettings({ ammoType: e.target.value })}
          className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500 appearance-none"
        >
          <option value="M107">HE M107 (Charge 1-7)</option>
          <option value="M549">HERA M549A1</option>
          <option value="M485">Illumination M485</option>
          <option value="M110">WP M110</option>
        </select>
      </div>

      <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-center justify-between">
        <div className="text-xs text-emerald-500/70">Status</div>
        <div className="text-xs text-emerald-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          SYNCED TO GLOBALS
        </div>
      </div>
    </div>
  );
};
