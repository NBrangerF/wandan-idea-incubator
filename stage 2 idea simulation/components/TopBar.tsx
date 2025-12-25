
import React, { useState } from 'react';
import { useReactFlow, getRectOfNodes } from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useStage3Store } from '../store';
import ConfirmModal from './ConfirmModal';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { 
    integrityStatus, 
    thinkingProgress, 
    exportDiagram, 
    isExportMenuOpen, 
    setExportMenuOpen,
    hasStartNode,
    resetSession
  } = useStage3Store();
  
  const { getNodes } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const startNodeExists = hasStartNode();

  const getStatusStyle = () => {
    switch(integrityStatus) {
      case 'critical': return 'bg-red-50 text-red-500 border-red-100';
      case 'warning': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-500 border-emerald-100';
    }
  };

  const downloadImage = async (format: 'png' | 'pdf') => {
    setIsExporting(true);
    setExportMenuOpen(false);
    
    const nodes = getNodes();
    if (nodes.length === 0) {
      setIsExporting(false);
      return;
    }

    // Target the actual inner viewport that contains all nodes
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      setIsExporting(false);
      return;
    }

    try {
      document.body.classList.add('exporting');

      // 1. Calculate the bounding box of ALL nodes
      const nodesRect = getRectOfNodes(nodes);
      const padding = 150; // Extra breathing room around the edges
      
      // 2. Define final image dimensions based on content, not screen
      const imageWidth = nodesRect.width + padding * 2;
      const imageHeight = nodesRect.height + padding * 2;

      // 3. Capture the full canvas
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#F8FAFC', 
        quality: 1,
        pixelRatio: 2, // High DPI export
        cacheBust: true, // Bypass cache for CORS issues
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          // IMPORTANT: Reset the transform to "flatten" the coordinate system
          // and translate to the start of our calculated bounds
          transform: `translate(${-nodesRect.x + padding}px, ${-nodesRect.y + padding}px) scale(1)`,
        },
        filter: (node: HTMLElement) => {
            // Exclude UI clutter
            const exclusionClasses = ['react-flow__controls', 'react-flow__attribution', 'lane-labels'];
            return !exclusionClasses.some(cls => node.classList?.contains && node.classList.contains(cls));
        }
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Stage3_FullMap_${title || 'Export'}.png`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: imageWidth > imageHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [imageWidth, imageHeight]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save(`Stage3_FullMap_${title || 'Export'}.pdf`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('全量导出失败：这通常是由于浏览器安全限制导致的样式访问错误。请刷新页面重试，或确保您正在使用最新版本的浏览器。');
    } finally {
      document.body.classList.remove('exporting');
      setIsExporting(false);
    }
  };

  return (
    <div className="h-16 bg-white/60 backdrop-blur-md border-b border-white flex items-center justify-between px-8 z-30 shadow-sm relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <span className="text-lg">🧪</span>
           </div>
           <div>
              <span className="text-slate-800 font-black tracking-tight text-xl">完蛋！我被好想法包围了！</span>
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stage 3 Simulation</span>
              </div>
           </div>
        </div>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Current Project</span>
            <span className="text-slate-700 text-sm font-bold truncate max-w-[200px]">{title}</span>
          </div>
          
          {/* New Project Button */}
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="ml-2 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all group relative"
            title="开启新项目"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-slate-800 text-white text-[9px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">新建项目</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
         {/* Progress Bar */}
         <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</span>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-white">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                    style={{ width: `${thinkingProgress}%` }}
                ></div>
            </div>
         </div>

         <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${getStatusStyle()}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${integrityStatus === 'stable' ? 'bg-emerald-400' : integrityStatus === 'warning' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${integrityStatus === 'stable' ? 'bg-emerald-500' : integrityStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            </span>
            {integrityStatus}
         </div>
         
         {/* Export Action Hub */}
         <div className="relative">
            <button 
                onClick={() => setExportMenuOpen(!isExportMenuOpen)}
                disabled={isExporting}
                className={`group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all soft-shadow active:scale-95 relative ${isExporting ? 'opacity-50' : ''}`}
            >
                {/* Visual Hint Pulse */}
                {startNodeExists && !isExporting && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white"></span>
                   </span>
                )}

                {isExporting ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>生成中...</span>
                    </>
                ) : (
                    <>
                        <span>导出图谱</span>
                        <svg className={`w-3 h-3 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                )}
            </button>

            {isExportMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-[100] animate-[fadeIn_0.2s_ease-out]">
                    <div className="px-4 py-2 mb-1">
                       <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">导出选项</p>
                    </div>
                    <button 
                        onClick={() => downloadImage('png')}
                        className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                        <span className="text-xl">🖼️</span>
                        <div>
                           <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">导出全量图</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">PNG (2X Resolution)</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => downloadImage('pdf')}
                        className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                        <span className="text-xl">📄</span>
                        <div>
                           <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">导出全量 PDF</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">Dynamic Sizing PDF</p>
                        </div>
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-4"></div>
                    <button 
                        onClick={() => { setExportMenuOpen(false); exportDiagram(); }}
                        className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                        <span className="text-xl">📦</span>
                        <div>
                           <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">导出逻辑 JSON</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">Raw Logic Data</p>
                        </div>
                    </button>
                </div>
            )}
         </div>

         <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90 border border-transparent hover:border-slate-200"
            onClick={() => setExportMenuOpen(!isExportMenuOpen)}
         >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
         </button>
      </div>

      {isExportMenuOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setExportMenuOpen(false)}></div>}
      
      {/* New Project Confirmation Modal */}
      <ConfirmModal
        isOpen={showNewProjectModal}
        title="开启新项目"
        message="确定要开启新项目吗？当前进度将丢失。"
        confirmText="确定开始"
        cancelText="再想想"
        variant="warning"
        onConfirm={() => {
          setShowNewProjectModal(false);
          resetSession();
        }}
        onCancel={() => setShowNewProjectModal(false)}
      />
    </div>
  );
};

export default TopBar;
