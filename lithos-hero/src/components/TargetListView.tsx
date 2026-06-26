import React, { useState, useEffect } from 'react';
import targetCsvRaw from '../data/Target.csv?raw';
import { parseTargetCsv } from '../utils/csvParser';
import type { TargetData } from '../utils/csvParser';
import { formatGrid8, parseGrid } from '../utils/artilleryMath';

interface TargetListViewProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTarget?: (target: TargetData) => void;
}

export const TargetListView: React.FC<TargetListViewProps> = ({ isVisible, onClose, onSelectTarget }) => {
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Parse the raw CSV string loaded by Vite
    const parsed = parseTargetCsv(targetCsvRaw);
    setTargets(parsed);
  }, []);

  if (!isVisible) return null;

  const filteredTargets = targets.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.grid.includes(searchTerm) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Target List (บัญชีเป้าหมาย)</h2>
            <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              {targets.length} TARGETS LOADED
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Search by Target ID, Grid, or Description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4">
          {targets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-xl font-medium">Target Database is Empty</p>
              <p className="text-sm">Please populate `src/data/Target.csv` with target data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Target ID</th>
                    <th className="px-6 py-4 font-semibold">Grid Coordinates</th>
                    <th className="px-6 py-4 font-semibold">Altitude (m)</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTargets.map((target, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-bold tracking-wider">{target.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-white tracking-widest">
                          {formatGrid8(parseGrid(target.grid, target.altitude))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-cyan-400 font-mono">{target.altitude}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{target.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            if (onSelectTarget) onSelectTarget(target);
                            onClose();
                          }}
                          className="bg-slate-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTargets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No targets match your search.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
