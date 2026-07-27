import React from 'react';

export const IndividualGunModule: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-emerald-400 font-bold border-b border-emerald-900/50 pb-2 mb-4">
        Battery Diagram & Corrections
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1,2,3,4,5,6].map(gun => (
          <div key={gun} className="bg-emerald-950/40 border border-emerald-800/50 rounded p-2 text-center hover:bg-emerald-900/60 cursor-pointer">
            <div className="text-[10px] text-emerald-500/70 font-bold">PIECE {gun}</div>
            <div className="text-xs font-mono text-emerald-300 mt-1">DF: 0</div>
            <div className="text-xs font-mono text-emerald-300">EL: +0</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-gray-500 text-center mt-2">Base Piece is Piece 3. Offsets calculated visually.</div>
    </div>
  );
};
