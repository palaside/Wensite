import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface MobileSidebarProps {
  activeModeId: string;
  setActiveModeId: (mode: string) => void;
}

const MODES_DATA = [
  { id: 'FO', label: 'Forward Observer' },
  { id: 'FL', label: 'Surveillance' },
  { id: 'HS', label: 'Howitzer Section' },
  { id: 'FD', label: 'Fire Direction' },
  { id: 'WA', label: 'Weapons & Ammunition' }
];

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ activeModeId, setActiveModeId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[9999] p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all"
        title="Toggle Menu"
      >
        {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9997]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl border-r border-emerald-900/50 z-[9998] shadow-[20px_0_40px_rgba(0,0,0,0.8)] flex flex-col pt-24"
          >
            <div className="px-6 pb-4 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white tracking-widest">LITHOS HERO</h2>
              <p className="text-xs text-emerald-400 uppercase tracking-widest mt-1">Select Active Mode</p>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar flex flex-col gap-3">
              {MODES_DATA.map((mode) => {
                const isActive = activeModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setActiveModeId(mode.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border ${
                      isActive 
                        ? 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <img 
                      src={`/${mode.id}.png`} 
                      alt={mode.label} 
                      className="w-12 h-12 object-contain drop-shadow-lg"
                    />
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-bold ${isActive ? 'text-emerald-300' : 'text-gray-300'}`}>
                        {mode.id}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-500'} text-left leading-tight`}>
                        {mode.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-white/5 text-xs text-gray-500 text-center">
              Mobile Navigation Dashboard
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
