import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useFDC } from '../context/FDCContext';
import type { WindowState } from '../context/FDCContext';

interface DraggableWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({ window: win, children }) => {
  const { closeWindow, focusWindow, updateWindowPos, minimizeWindow } = useFDC();
  const dragControls = useDragControls();
  
  const [isMobile, setIsMobile] = useState(globalThis.window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(globalThis.window.innerWidth < 768);
    globalThis.window.addEventListener('resize', handleResize);
    return () => globalThis.window.removeEventListener('resize', handleResize);
  }, []);

  if (!win.isOpen) return null;

  return (
    <motion.div
      drag={!isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ x: isMobile ? 0 : win.x, y: isMobile ? 0 : win.y, opacity: 0, scale: 0.9 }}
      animate={{ 
        x: isMobile ? 0 : win.x, 
        y: isMobile ? 0 : win.y, 
        opacity: win.isMinimized ? 0 : 1,
        scale: win.isMinimized ? 0.8 : 1,
        zIndex: isMobile ? 9999 : win.zIndex 
      }}
      onDragEnd={(e, info) => {
        if (!isMobile) updateWindowPos(win.id, win.x + info.offset.x, win.y + info.offset.y);
      }}
      onMouseDown={() => focusWindow(win.id)}
      style={isMobile ? { pointerEvents: win.isMinimized ? 'none' : 'auto' } : {
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: win.isMinimized ? 'none' : 'auto'
      }}
      className={`bg-[#0a0f12]/95 border border-emerald-500/30 backdrop-blur-md overflow-hidden flex flex-col ${isMobile ? 'fixed inset-0 w-full h-[100dvh] rounded-none' : 'absolute min-w-[400px] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(16,185,129,0.1)]'}`}
    >
      {/* Title Bar - Drag Handle */}
      <div 
        className={`h-10 bg-gradient-to-b from-emerald-900/40 to-transparent border-b border-emerald-900/50 flex items-center justify-between px-3 select-none ${isMobile ? '' : 'cursor-move'}`}
        onPointerDown={(e) => {
          if (!isMobile) dragControls.start(e);
        }}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          {win.icon && <div className="text-emerald-400 w-4 h-4">{win.icon}</div>}
          <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">{win.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Minimize button */}
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimizeWindow(win.id)}
            className="w-8 h-8 md:w-5 md:h-5 flex items-center justify-center text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/50 rounded transition-colors"
          >
            <svg className="w-4 h-4 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>
          </button>
          {/* Close button */}
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
            className="w-8 h-8 md:w-5 md:h-5 flex items-center justify-center text-red-500 hover:text-red-300 hover:bg-red-900/50 rounded transition-colors"
          >
            <svg className="w-4 h-4 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 flex-1 overflow-auto custom-scrollbar text-emerald-50 ${isMobile ? 'h-full max-h-none pb-24' : 'max-h-[70vh]'}`}>
        {children}
      </div>
    </motion.div>
  );
};
