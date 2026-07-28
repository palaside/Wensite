import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  zIndex: number;
  isOpen: boolean;
  isMinimized: boolean;
  icon?: ReactNode;
}

export interface FDCSettings {
  fdcEasting: string;
  fdcNorthing: string;
  fdcAltitude: string;
  simDir: string;
  ammoType: string;
}

interface FDCContextType {
  userLocation: { lat: number; lng: number };
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  windows: WindowState[];
  openWindow: (id: string, title: string, icon?: ReactNode) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPos: (id: string, x: number, y: number) => void;
  minimizeWindow: (id: string) => void;
  closeAllWindows: () => void;
  
  settings: FDCSettings;
  updateSettings: (newSettings: Partial<FDCSettings>) => void;
}

const defaultContext: FDCContextType = {
  userLocation: { lat: 15.6709, lng: 100.1225 },
  setUserLocation: () => {},
  windows: [],
  openWindow: () => {},
  closeWindow: () => {},
  focusWindow: () => {},
  updateWindowPos: () => {},
  minimizeWindow: () => {},
  closeAllWindows: () => {},
  
  settings: {
    fdcEasting: '45000',
    fdcNorthing: '65000',
    fdcAltitude: '100',
    simDir: '3200',
    ammoType: 'M107'
  },
  updateSettings: () => {},
};

const FDCContext = createContext<FDCContextType>(defaultContext);

export const useFDC = () => useContext(FDCContext);

export const FDCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 15.6709, lng: 100.1225 });
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [settings, setSettings] = useState<FDCSettings>(defaultContext.settings);
  const [maxZ, setMaxZ] = useState(100);

  const openWindow = (id: string, title: string, icon?: ReactNode) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // If exists but closed, re-open it. If minimized, restore it.
        return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZ + 1 } : w);
      }
      // New window
      // offset new window position slightly
      const offset = (prev.length * 20) % 200;
      return [
        ...prev,
        {
          id,
          title,
          icon,
          x: 100 + offset,
          y: 100 + offset,
          zIndex: maxZ + 1,
          isOpen: true,
          isMinimized: false
        }
      ];
    });
    setMaxZ(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    setMaxZ(prev => prev + 1);
  };

  const updateWindowPos = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const closeAllWindows = () => {
    setWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
  };

  const updateSettings = (newSettings: Partial<FDCSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <FDCContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      focusWindow,
      updateWindowPos,
      minimizeWindow,
      closeAllWindows,
      settings,
      updateSettings,
      userLocation,
      setUserLocation
    }}>
      {children}
    </FDCContext.Provider>
  );
};
