import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

interface ReportContextType {
  method1: string; setMethod1: (val: string) => void;
  azimuth: string; setAzimuth: (val: string) => void;
  mainGun: number; setMainGun: (val: number) => void;
  isOverlapCenter: boolean; setIsOverlapCenter: (val: boolean) => void;
  centerAzimuth: string; setCenterAzimuth: (val: string) => void;
  centerAngleK: string; setCenterAngleK: (val: string) => void;
  op2Azimuth: string; setOp2Azimuth: (val: string) => void;
  op2AngleK: string; setOp2AngleK: (val: string) => void;
  gunAzimuths: Record<number, string>; setGunAzimuths: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  gunAngleKs: Record<number, string>; setGunAngleKs: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  gunCoverAngles: Record<number, string>; setGunCoverAngles: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  gunCoverDistances: Record<number, string>; setGunCoverDistances: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  
  centerDistance: string;
  gunDistances: Record<number, string>;
  allGuns: number[];
  section3Data: any;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [method1, setMethod1] = useState('1'); 
  const [azimuth, setAzimuth] = useState('0000');
  const [mainGun, setMainGun] = useState<number>(3); 
  const [isOverlapCenter, setIsOverlapCenter] = useState<boolean>(false);

  const [centerAzimuth, setCenterAzimuth] = useState('1764');
  const [centerAngleK, setCenterAngleK] = useState('28');
  
  const [op2Azimuth, setOp2Azimuth] = useState('1952');
  const [op2AngleK, setOp2AngleK] = useState('30');
  
  const [gunAzimuths, setGunAzimuths] = useState<Record<number, string>>({
    1: '1684', 2: '1897', 3: '1764', 4: '2290', 5: '0', 6: '0'
  });
  const [gunAngleKs, setGunAngleKs] = useState<Record<number, string>>({
    1: '20', 2: '20', 3: '28', 4: '38', 5: '20', 6: '20'
  });

  const [gunCoverAngles, setGunCoverAngles] = useState<Record<number, string>>({ 3: '201' });
  const [gunCoverDistances, setGunCoverDistances] = useState<Record<number, string>>({ 3: '200' });

  const centerDistance = useMemo(() => {
    const k = parseFloat(centerAngleK);
    return k ? Math.round(2000 / k).toString() : '0';
  }, [centerAngleK]);

  const totalGunsCurrent = mainGun === 4 ? 6 : 4;
  const allGuns = Array.from({ length: totalGunsCurrent }, (_, i) => i + 1);

  const [gunDistances, setGunDistances] = useState<Record<number, string>>({});

  useEffect(() => {
    const dists: Record<number, string> = {};
    allGuns.forEach(gun => {
      const k = parseFloat(gunAngleKs[gun]);
      dists[gun] = k ? Math.round(2000 / k).toString() : '0';
    });
    setGunDistances(dists);
  }, [gunAngleKs, totalGunsCurrent]); // Reacting to changes in AngleKs or total guns

  useEffect(() => {
    if (isOverlapCenter) {
      setGunAzimuths(prev => ({ ...prev, [mainGun]: centerAzimuth }));
      // The distance is updated via angle K effect or direct set. For overlap, we might not need to force distance if angle K matches, but let's sync it.
    }
  }, [isOverlapCenter, centerAzimuth, centerDistance, mainGun]);

  const section3Data = useMemo(() => {
    const data: any = {};
    const centerAz = parseInt(centerAzimuth) || 0;
    const centerDist = parseInt(centerDistance) || 0;
    const lofAz = parseInt(azimuth) || 0;
    
    allGuns.forEach(gun => {
      const gAz = parseInt(gunAzimuths[gun]) || 0;
      const gDist = parseInt(gunDistances[gun]) || 0;

      if (isOverlapCenter && gun === mainGun) {
        data[gun] = {
          azimuth: centerAzimuth.padStart(4, '0'),
          distance: '0',
          lrText: 'ขวา',
          frText: 'หน้า',
          lrDist: '0',
          frDist: '0'
        };
        return;
      }

      const diffAz = gAz - centerAz;
      let diffAzRads = diffAz * (Math.PI / 3200);

      const x_c = centerDist * Math.sin(0); 
      const y_c = centerDist * Math.cos(0);
      const x_g = gDist * Math.sin(diffAzRads);
      const y_g = gDist * Math.cos(diffAzRads);

      const dx = x_g - x_c;
      const dy = y_g - y_c;

      const distRaw = Math.sqrt(dx*dx + dy*dy);
      
      if (distRaw < 0.1) {
        data[gun] = {
          azimuth: '0000',
          distance: '0',
          lrText: '-',
          frText: '-',
          lrDist: '0',
          frDist: '0'
        };
        return;
      }

      const dist = Math.round(distRaw / 5) * 5;
      
      let newAzRads = Math.atan2(dx, dy);
      if (newAzRads < 0) newAzRads += 2 * Math.PI;
      let forwardAz = Math.round(newAzRads * (3200 / Math.PI) + centerAz) % 6400;
      if (forwardAz < 0) forwardAz += 6400;
      
      let newAz = forwardAz > 3200 ? forwardAz - 3200 : forwardAz;
      const relativeAzMils = forwardAz - lofAz;
      const relativeAzRads = relativeAzMils * (Math.PI / 3200);

      const frDistRaw = dist * Math.cos(relativeAzRads);
      const lrDistRaw = dist * Math.sin(relativeAzRads);
      
      const frDist = Math.round(Math.abs(frDistRaw) / 5) * 5;
      const lrDist = Math.round(Math.abs(lrDistRaw) / 5) * 5;

      const frText = frDistRaw >= 0 ? 'หน้า' : 'หลัง';
      const lrText = lrDistRaw >= 0 ? 'ขวา' : 'ซ้าย';

      data[gun] = { 
        azimuth: newAz.toString().padStart(4, '0'), 
        distance: dist.toString(),
        lrText,
        frText,
        lrDist: lrDist.toString(),
        frDist: frDist.toString()
      };
    });
    return data;
  }, [centerAzimuth, centerDistance, gunAzimuths, gunDistances, allGuns, isOverlapCenter, mainGun, azimuth]);

  return (
    <ReportContext.Provider value={{
      method1, setMethod1, azimuth, setAzimuth, mainGun, setMainGun, isOverlapCenter, setIsOverlapCenter,
      centerAzimuth, setCenterAzimuth, centerAngleK, setCenterAngleK, op2Azimuth, setOp2Azimuth, op2AngleK, setOp2AngleK,
      gunAzimuths, setGunAzimuths, gunAngleKs, setGunAngleKs, gunCoverAngles, setGunCoverAngles, gunCoverDistances, setGunCoverDistances,
      centerDistance, gunDistances, allGuns, section3Data
    }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReportContext must be used within ReportProvider');
  return context;
};
