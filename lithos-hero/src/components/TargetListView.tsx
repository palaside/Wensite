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

  // Confirmation state for clearing
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadTargets = () => {
    setTargets(getTargets());
  };

  useEffect(() => {
    if (isVisible) {
      loadTargets();
      setShowClearConfirm(false);
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
      
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Target Database</h2>
          </div>
          <div className="flex items-center gap-4">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded-lg border border-red-500/50">
                <span className="text-red-200 text-sm font-semibold">ยืนยันการลบ?</span>
                <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded transition-colors font-bold uppercase tracking-wider">ล้างข้อมูลทั้งหมด</button>
                <button onClick={() => setShowClearConfirm(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded transition-colors uppercase tracking-wider">ยกเลิก</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-4 py-1.5 rounded-lg border border-transparent hover:border-red-500/30 transition-all text-sm font-semibold tracking-wider uppercase flex items-center gap-2"
                disabled={targets.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                ล้างข้อมูล
              </button>
            )}
            <div className="w-px h-6 bg-slate-700"></div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Mockup summary section */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex gap-12 items-start">
            {/* จำนวน (Count) */}
            <div className="flex flex-col items-center">
              <span className="text-white text-md font-bold mb-2">จำนวน</span>
              <div className="border border-white rounded px-8 py-2.5 bg-black/40 text-white font-mono text-xl font-bold min-w-[90px] text-center">
                {targets.length}
              </div>
            </div>

            {/* ชื่อเป้าหมาย (Target Names) */}
            <div className="flex flex-col">
              <span className="text-white text-md font-bold mb-2 text-center md:text-left">ชื่อเป้าหมาย</span>
              <div className="flex flex-wrap gap-3 max-w-xl">
                {targets.map((t, idx) => (
                  <div key={idx} className="border border-white rounded px-5 py-2 bg-black/20 text-white font-bold font-mono text-sm">
                    {t.id}
                  </div>
                ))}
                {targets.length === 0 && (
                  <span className="text-slate-600 text-xs italic">ไม่มีข้อมูลเป้าหมาย</span>
                )}
              </div>
            </div>
          </div>

          {/* ADD TARGET Button */}
          <div className="self-end md:self-center">
            <button 
              onClick={() => setShowAddForm(true)}
              className="border border-white hover:border-emerald-500 hover:text-emerald-400 text-white font-bold py-2.5 px-8 rounded transition-all tracking-wider uppercase bg-transparent text-sm"
            >
              ADD TARGET
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Search database..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-hidden p-2 sm:p-6 bg-slate-900 flex flex-col justify-center">
          {targets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-xl font-medium">Target Database is Empty</p>
              <p className="text-sm">Use the form above to add targets manually.</p>
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
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTargets.map((target, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-bold tracking-wider text-lg">{target.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-white tracking-widest text-lg">
                          {formatGrid8(parseGrid(target.grid, target.altitude))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-cyan-400 font-mono text-lg">{target.altitude}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{target.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            removeTarget(target.id);
                            loadTargets();
                          }}
                          className="bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Target"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (onSelectTarget) onSelectTarget(target);
                            onClose();
                          }}
                          className="border border-white hover:border-emerald-500 text-white hover:text-emerald-400 font-semibold py-1.5 px-6 rounded transition-colors tracking-wider uppercase text-sm bg-transparent"
                        >
                          SELECT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTargets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  ไม่มีข้อมูลเป้าหมายที่ค้นหา
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Add Target Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">เพิ่มข้อมูลเป้าหมาย (Add Target)</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={(e) => { handleAddTarget(e); setShowAddForm(false); }} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">ชื่อเป้าหมาย (Target ID) *</label>
                <input type="text" required value={newId} onChange={e => setNewId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none uppercase font-bold" placeholder="เช่น กข4001" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">พิกัดกริด (Grid) *</label>
                <input type="text" required value={newGrid} onChange={e => setNewGrid(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none font-mono tracking-widest" placeholder="8 หลัก (เช่น 12345678)" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">ความสูง (Altitude - เมตร)</label>
                <input type="number" value={newAlt} onChange={e => setNewAlt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">รายละเอียด (Description)</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" placeholder="รายละเอียดอื่นๆ..." />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors tracking-wider uppercase text-sm mt-2">
                บันทึกเป้าหมาย
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
