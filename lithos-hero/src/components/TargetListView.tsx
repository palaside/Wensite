import React, { useState, useEffect } from 'react';
import { getTargets, addTarget, clearAllTargets, removeTarget, saveTargets } from '../utils/targetDatabase';
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
  
  // Form States (matching the beautiful UI style in the attached image)
  const [targetCount, setTargetCount] = useState('3');
  const [newGrid, setNewGrid] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Confirmation state for clearing
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  // Generates next RTA ID suffix e.g. กข4001, กข4002...
  const generateNextTargetId = (existingTargets: TargetData[]) => {
    let maxNum = 4000;
    existingTargets.forEach(t => {
      const match = t.id.match(/กข(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    return `กข${maxNum + 1}`;
  };

  const handleAddTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(targetCount) || 1;
    const gridVal = newGrid.replace(/\s+/g, '') || '00000000';
    const altVal = parseFloat(newAlt) || 0;
    const descVal = newDesc.trim() || '-';

    let currentTargets = [...targets];
    for (let i = 0; i < count; i++) {
      const nextId = generateNextTargetId(currentTargets);
      const newTarget: TargetData = {
        id: nextId,
        grid: gridVal,
        altitude: altVal,
        description: descVal
      };
      addTarget(newTarget);
      currentTargets.push(newTarget);
    }

    // Reset count and form inputs
    setNewGrid('');
    setNewAlt('');
    setNewDesc('');
    
    loadTargets();
  };

  // Real-time update functions
  const handleUpdateTargetId = (oldId: string, newId: string) => {
    const updated = targets.map(t => {
      if (t.id === oldId) {
        return { ...t, id: newId };
      }
      return t;
    });
    saveTargets(updated);
    setTargets(updated);
  };

  const handleUpdateTargetGrid = (id: string, newGrid: string) => {
    const updated = targets.map(t => {
      if (t.id === id) {
        return { ...t, grid: newGrid.replace(/\s+/g, '') };
      }
      return t;
    });
    saveTargets(updated);
    setTargets(updated);
  };

  const handleUpdateTargetAlt = (id: string, newAlt: number) => {
    const updated = targets.map(t => {
      if (t.id === id) {
        return { ...t, altitude: newAlt };
      }
      return t;
    });
    saveTargets(updated);
    setTargets(updated);
  };

  const handleUpdateTargetDesc = (id: string, newDesc: string) => {
    const updated = targets.map(t => {
      if (t.id === id) {
        return { ...t, description: newDesc };
      }
      return t;
    });
    saveTargets(updated);
    setTargets(updated);
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
      
      <div className="bg-[#0b1329] border border-slate-800 w-full max-w-5xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111c3a] border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Target Database</h2>
            <span className="bg-[#064e3b]/50 text-emerald-400 border border-[#065f46] px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              {targets.length} TARGETS
            </span>
          </div>
          <div className="flex items-center gap-4">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/80 px-3 py-1  border border-red-500/30 rounded-lg">
                <span className="text-red-200 text-xs font-semibold">ยืนยันการลบ?</span>
                <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-500 text-white text-xs px-2.5 py-1 rounded transition-colors font-bold uppercase">ยืนยัน</button>
                <button onClick={() => setShowClearConfirm(false)} className="bg-slate-850 hover:bg-slate-700 text-white text-xs px-2.5 py-1 rounded transition-colors uppercase">ยกเลิก</button>
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
            <div className="w-px h-5 bg-[#1e293b]"></div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Input Form (styled exactly like the attached image) */}
        <div className="p-6 border-b border-[#1e293b] bg-[#0d1630]">
          <form onSubmit={handleAddTargets} className="flex gap-4 items-end">
            <div className="w-28 shrink-0">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">จำนวน *</label>
              <input 
                type="number" 
                required 
                min="1" 
                max="30"
                value={targetCount} 
                onChange={e => setTargetCount(e.target.value)} 
                className="w-full bg-[#060c18] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none uppercase font-bold text-center" 
                placeholder="เช่น 3" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">GRID *</label>
              <input 
                type="text" 
                required 
                value={newGrid} 
                onChange={e => setNewGrid(e.target.value)} 
                className="w-full bg-[#060c18] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none font-mono tracking-wider" 
                placeholder="8 digits" 
              />
            </div>
            <div className="w-32">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">ALT (M)</label>
              <input 
                type="number" 
                value={newAlt} 
                onChange={e => setNewAlt(e.target.value)} 
                className="w-full bg-[#060c18] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" 
                placeholder="0" 
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">DESCRIPTION</label>
              <input 
                type="text" 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
                className="w-full bg-[#060c18] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" 
                placeholder="Target description..." 
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2.5 px-6 rounded-lg transition-colors h-[42px] tracking-wider uppercase whitespace-nowrap text-sm"
            >
              ADD TARGET
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-[#1e293b] bg-[#090f23]">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              className="w-full bg-[#060c18] border border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-all text-sm placeholder-slate-600"
              placeholder="Search database..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090f23]">
          {targets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-lg font-medium">Target Database is Empty</p>
              <p className="text-xs">ระบุจำนวนข้อมูลในฟอร์มด้านบน แล้วกดปุ่ม ADD TARGET เพื่อเพิ่มข้อมูลเป้าหมาย</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#1e293b]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111c3a] text-slate-400 text-[11px] uppercase tracking-widest border-b border-[#1e293b]">
                    <th className="px-6 py-3.5 font-bold">TARGET ID</th>
                    <th className="px-6 py-3.5 font-bold">GRID COORDINATES</th>
                    <th className="px-6 py-3.5 font-bold">ALTITUDE (M)</th>
                    <th className="px-6 py-3.5 font-bold">DESCRIPTION</th>
                    <th className="px-6 py-3.5 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {filteredTargets.map((target, idx) => (
                    <tr key={idx} className="hover:bg-[#111c3a]/30 transition-colors group">
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={target.id}
                          onChange={e => handleUpdateTargetId(target.id, e.target.value)}
                          className="bg-[#060c18] text-white font-bold font-mono text-center border border-[#1e293b] rounded-lg px-3 py-1.5 w-[120px] focus:border-emerald-500 outline-none"
                          title="คลิกเพื่อแก้ไขชื่อเป้าหมาย"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={target.grid}
                          onChange={e => handleUpdateTargetGrid(target.id, e.target.value)}
                          className="bg-[#060c18] font-mono text-white tracking-widest border border-[#1e293b] rounded-lg px-3 py-1.5 w-[150px] focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          value={target.altitude}
                          onChange={e => handleUpdateTargetAlt(target.id, parseFloat(e.target.value) || 0)}
                          className="bg-[#060c18] font-mono text-white border border-[#1e293b] rounded-lg px-3 py-1.5 w-[100px] focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={target.description}
                          onChange={e => handleUpdateTargetDesc(target.id, e.target.value)}
                          className="bg-[#060c18] text-slate-300 border border-[#1e293b] rounded-lg px-3 py-1.5 w-full focus:border-emerald-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-3 text-right flex justify-end items-center gap-3">
                        <button 
                          onClick={() => {
                            removeTarget(target.id);
                            loadTargets();
                          }}
                          className="text-slate-500 hover:text-red-400 p-1.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-transparent border-0"
                          title="Delete Target"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (onSelectTarget) onSelectTarget(target);
                            onClose();
                          }}
                          className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 px-6 rounded-lg transition-colors text-xs tracking-wider uppercase"
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
