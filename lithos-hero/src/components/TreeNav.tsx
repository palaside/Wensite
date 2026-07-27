import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Menu, X, Crosshair, Map, Calculator, FileEdit, Target, Zap } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  viewId?: any; // any to avoid strict ViewState import if not exported
  children?: TreeNode[];
}

const TREE_DATA: TreeNode[] = [
  {
    id: 'home',
    label: 'หน้าแรก (Home)',
    viewId: 'hero',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'forms',
    label: 'แบบฟอร์ม (Forms)',
    icon: <FileEdit className="w-4 h-4" />,
    children: [
      { id: 'f-report', label: 'หน้า Report หลัก', viewId: 'report' }
    ]
  },
  {
    id: 'plotting',
    label: 'กระดานและแผนที่ (Plotting)',
    icon: <Map className="w-4 h-4" />,
    children: [
      { id: 'p-m17', label: 'กระดาน M17', viewId: 'm17' },
      { id: 'p-def', label: 'คำนวณมุมหัน', viewId: 'deflection' },
      { id: 'p-cra', label: 'วิเคราะห์หลุมระเบิด', viewId: 'crater' },
      { id: 'p-m2', label: 'เข็มทิศ M2', viewId: 'm2_manual' }
    ]
  },
  {
    id: 'weapons',
    label: 'อาวุธและกระสุน (Weapons)',
    icon: <Crosshair className="w-4 h-4" />,
    children: [
      { id: 'w-fuze', label: 'ชนวน', viewId: 'wa_fuze' },
      { id: 'w-ammo', label: 'กระสุน', viewId: 'wa_ammo' },
      { id: 'w-safe', label: 'ความปลอดภัย', viewId: 'wa_safety' }
    ]
  },
  {
    id: 'calculator',
    label: 'เครื่องคำนวณ (Calculator)',
    icon: <Calculator className="w-4 h-4" />,
    children: [
      { id: 'c-fo', label: 'ตรวจการณ์ (FO)', viewId: 'Grid' }, // Using 'Grid' as default FOCalcType
      { id: 'c-fd', label: 'คำนวณยิง (FD)', viewId: 'Observer' } // Using 'Observer' as default FDCalcType
    ]
  },
  {
    id: 'simulation',
    label: 'จำลองสถานการณ์ (Sim)',
    icon: <Zap className="w-4 h-4" />,
    children: [
      { id: 's-how', label: 'การเคลื่อนที่ปืนใหญ่', viewId: 'howitzer_motion' }
    ]
  }
];

interface TreeNavProps {
  currentView: any;
  setCurrentView: (view: any) => void;
  isAuthenticated: boolean;
}

export const TreeNav: React.FC<TreeNavProps> = ({ currentView, setCurrentView, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    forms: false,
    plotting: true, // Expand plotting by default
    weapons: false,
    calculator: false,
    simulation: false
  });

  // Only show navigation when logged in
  if (!isAuthenticated) return null;

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNodeClick = (node: TreeNode) => {
    if (node.children) {
      toggleNode(node.id);
    } else if (node.viewId) {
      setCurrentView(node.viewId);
      // Optional: Auto close sidebar on mobile after clicking a link
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedNodes[node.id];
      const isActive = currentView === node.viewId;
      const hasChildren = !!node.children && node.children.length > 0;

      return (
        <div key={node.id} className="flex flex-col">
          <div
            className={`flex items-center gap-2 py-2 px-3 mx-2 my-0.5 rounded-md cursor-pointer transition-colors
              ${isActive ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/50' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
            `}
            style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
            onClick={() => handleNodeClick(node)}
          >
            <div className="flex items-center justify-center w-5 h-5 text-gray-400">
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4" /> // spacer
              )}
            </div>
            
            <div className="flex items-center justify-center w-5 h-5">
              {node.icon ? node.icon : (hasChildren ? (isExpanded ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-emerald-400" />) : <FileText className="w-4 h-4 text-cyan-500/70" />)}
            </div>
            
            <span className={`text-sm tracking-wide ${isActive ? 'font-semibold' : ''}`}>
              {node.label}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderTree(node.children!, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <>
      {/* Toggle Button (Fixed on screen) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[9999] p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-white/20 shadow-lg transition-all"
        title="Toggle Navigation Tree"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997] md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Tree Navigation Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 z-[9998] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="pt-20 pb-6 px-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-400" />
                LITHOS HERO
              </h2>
              <p className="text-xs text-cyan-400/80 uppercase tracking-widest mt-1">System Navigation</p>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              {renderTree(TREE_DATA)}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/5 text-xs text-gray-500 text-center">
              Vite Environment Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
