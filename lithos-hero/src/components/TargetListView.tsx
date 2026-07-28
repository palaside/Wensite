import React, { useState, useEffect } from 'react';
import { getTargets, addTarget, clearAllTargets, removeTarget } from '../utils/targetDatabase';
import type { TargetData } from '../utils/targetDatabase';
import { formatGrid8, parseGrid } from '../utils/artilleryMath';

interface TargetListViewProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTarget?: (target: TargetData) => void;
}

export const TargetListView: React.FC<TargetListViewProps> = ({ isVisible, onClose, onSelectTarget }) => {
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newId, setNewId] = useState('');
  const [newGrid, setNewGrid] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // UI state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadTargets = () => {
    setTargets(getTargets());
  };

  useEffect(() => {
    if (isVisible) {
      loadTargets();
      setShowClearConfirm(false);
      setShowAddForm(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newGrid) return;

    addTarget({
      id: newId.trim().toUpperCase(),
      grid: newGrid.replace(/\s+/g, ''),
      altitude: parseFloat(newAlt) || 0,
      description: newDesc.trim()
    });
    
    // Clear form
    setNewId('');
    setNewGrid('');
    setNewAlt('');
    setNewDesc('');
    setShowAddForm(false);
    
    // Reload
    loadTargets();
  };

  const handleClearAll = () => {
    clearAllTargets();
    setShowClearConfirm(false);
    loadTargets();
  };

  const filteredTargets = targets.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.grid.includes(searchTerm) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">TARGET DATABASE</h2>
          <div className="flex items-center gap-4">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/80 px-3 py-1 rounded border border-red-500/50">
                <span className="text-red-200 text-xs font-semibold">ล้างข้อมูลทั้งหมด?</span>
                <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded transition-colors font-bold uppercase">ยืนยัน</button>
                <button onClick={() => setShowClearConfirm(false)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-2.5 py-1 rounded transition-colors uppercase">ยกเลิก</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="text-red-400 hover:text-red-300 text-xs font-semibold uppercase flex items-center gap-1.5 transition-colors"
                disabled={targets.length === 0}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Clear Database
              </button>
            )}
            <div className="w-px h-5 bg-slate-800"></div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Mockup summary section */}
        <div className="p-8 border-b border-slate-900 bg-slate-950 flex gap-12 items-start justify-between shrink-0">
          <div className="flex gap-16 items-start">
            {/* จำนวน (Count) */}
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold mb-3">จำนวน</span>
              <div className="border border-white rounded px-10 py-3 bg-transparent text-white font-mono text-xl font-bold min-w-[100px] text-center">
                {targets.length}
              </div>
            </div>

            {/* ชื่อเป้าหมาย (Target Names) */}
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold mb-3">ชื่อเป้าหมาย</span>
              <div className="flex flex-col gap-2 min-w-[150px] max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                {targets.map((t, idx) => (
                  <div key={idx} className="border border-white rounded px-6 py-2 bg-transparent text-white font-bold font-mono text-center text-sm">
                    {t.id}
                  </div>
                ))}
                {targets.length === 0 && (
                  <div className="text-slate-600 text-xs italic text-center py-2">ไม่มีข้อมูลเป้าหมาย</div>
                )}
              </div>
            </div>
          </div>

          {/* ADD TARGET Button */}
          <div className="self-start pt-8">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="border border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded transition-all tracking-wider uppercase text-sm bg-transparent"
            >
              ADD TARGET
            </button>
          </div>
        </div>

        {/* Inline Add Target Form */}
        {showAddForm && (
          <div className="p-6 bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top duration-200 shrink-0">
            <form onSubmit={handleAddTarget} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Target ID *</label>
                <input type="text" required value={newId} onChange={e => setNewId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none uppercase font-bold" placeholder="เช่น กข4001" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Grid *</label>
                <input type="text" required value={newGrid} onChange={e => setNewGrid(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none font-mono tracking-widest" placeholder="8 หลัก" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Alt (m)</label>
                <input type="number" value={newAlt} onChange={e => setNewAlt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none" placeholder="0" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Description</label>
                  <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none" placeholder="รายละเอียด..." />
                </div>
                <button type="submit" className="border border-emerald-500 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold py-2 px-4 rounded transition-colors h-[42px] uppercase text-xs bg-transparent">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-950 shrink-0">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-800 rounded pl-9 pr-4 py-2 text-white focus:border-slate-600 outline-none transition-all text-sm placeholder-slate-600"
              placeholder="Search database..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {targets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3">
              <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-lg font-medium">Target Database is Empty</p>
              <p className="text-xs">กดปุ่ม ADD TARGET เพื่อเพิ่มเป้าหมาย</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-800">
                    <th className="px-6 py-3.5 font-bold">TARGET ID</th>
                    <th className="px-6 py-3.5 font-bold">GRID COORDINATES</th>
                    <th className="px-6 py-3.5 font-bold">ALTITUDE (M)</th>
                    <th className="px-6 py-3.5 font-bold">DESCRIPTION</th>
                    <th className="px-6 py-3.5 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredTargets.map((target, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-white font-bold tracking-wider font-mono text-md">{target.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-white tracking-widest text-md">
                          {formatGrid8(parseGrid(target.grid, target.altitude))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-md">{target.altitude}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">{target.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end items-center gap-3">
                        <button 
                          onClick={() => {
                            removeTarget(target.id);
                            loadTargets();
                          }}
                          className="text-slate-600 hover:text-red-400 p-1.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-transparent border-0"
                          title="Delete Target"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (onSelectTarget) onSelectTarget(target);
                            onClose();
                          }}
                          className="border border-white hover:bg-white/10 text-white font-bold py-1.5 px-6 rounded transition-all tracking-wider uppercase text-xs bg-transparent"
                        >
                          SELECT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTargets.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  ไม่มีข้อมูลเป้าหมายที่ค้นหา
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
