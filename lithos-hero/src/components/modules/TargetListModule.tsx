import React, { useState } from 'react';

// For phase 1, we will just use a local mock state inside the module
interface TargetEntry {
  id: string;
  gridE: number;
  gridN: number;
  alt: number;
  desc: string;
}

export const TargetListModule: React.FC = () => {
  const [targets, setTargets] = useState<TargetEntry[]>([
    { id: 'TG001', gridE: 48500, gridN: 67200, alt: 150, desc: 'Infantry Platoon' },
    { id: 'TG002', gridE: 49100, gridN: 68500, alt: 200, desc: 'Enemy Command Post' },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2 mb-4">
        <div className="text-emerald-400 font-bold">Target Intelligence DB</div>
        <div className="text-[10px] text-emerald-500/50 font-mono">2 RECORDS FOUND</div>
      </div>

      <div className="bg-black/50 border border-emerald-900/30 rounded overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase bg-emerald-950/40 text-emerald-500/70">
            <tr>
              <th className="px-3 py-2">Target ID</th>
              <th className="px-3 py-2 text-right">Easting</th>
              <th className="px-3 py-2 text-right">Northing</th>
              <th className="px-3 py-2 text-right">Alt (m)</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {targets.map(t => (
              <tr key={t.id} className="border-b border-emerald-900/20 hover:bg-emerald-900/20 transition-colors">
                <td className="px-3 py-2 font-mono text-emerald-400">{t.id}</td>
                <td className="px-3 py-2 font-mono text-emerald-300 text-right">{t.gridE}</td>
                <td className="px-3 py-2 font-mono text-emerald-300 text-right">{t.gridN}</td>
                <td className="px-3 py-2 font-mono text-gray-400 text-right">{t.alt}</td>
                <td className="px-3 py-2 text-gray-300 truncate max-w-[100px]">{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 py-1.5 bg-emerald-900/20 border border-emerald-500/30 rounded text-emerald-400 text-xs hover:bg-emerald-800/40">
          + Add Manual Target
        </button>
        <button className="flex-1 py-1.5 bg-rose-900/20 border border-rose-500/30 rounded text-rose-400 text-xs hover:bg-rose-800/40">
          Clear DB
        </button>
      </div>
    </div>
  );
};
