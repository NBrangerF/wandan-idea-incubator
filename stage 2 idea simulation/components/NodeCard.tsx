
import React from 'react';
import { Handle, Position } from 'reactflow';
import { ProjectNode, NodeType } from '../types';

interface NodeCardProps {
  data: {
    node: ProjectNode;
    isFocused?: boolean;
    hasGlobalFocus?: boolean;
  };
}

const NodeCard: React.FC<NodeCardProps> = ({ data }) => {
  const { node, isFocused, hasGlobalFocus } = data;
  const isStartNode = node.title.toUpperCase().startsWith('START ->');

  const getHeaderStyles = () => {
    if (isStartNode) return 'from-indigo-600 to-blue-500';
    switch (node.type) {
      case NodeType.GOAL: return 'from-purple-500 to-indigo-500';
      case NodeType.MILESTONE: return 'from-blue-500 to-indigo-500';
      case NodeType.TASK: return 'from-slate-400 to-slate-500';
      case NodeType.INPUT: return 'from-emerald-400 to-teal-500';
      case NodeType.VALIDATION: return 'from-amber-400 to-orange-500';
      case NodeType.SKILL: return 'from-rose-400 to-pink-500';
      default: return 'from-slate-200 to-slate-300';
    }
  };

  const getShadowStyle = () => {
    if (isFocused) return 'shadow-[0_20px_60px_rgba(99,102,241,0.25)] ring-4 ring-indigo-500/20 scale-105 z-50';
    if (isStartNode) return 'shadow-[0_20px_50px_rgba(79,70,229,0.3)] ring-4 ring-indigo-400/30 animate-[pulse_3s_infinite]';
    if (node.ui?.risk === 'high') return 'shadow-[0_20px_50px_rgba(239,68,68,0.15)] ring-2 ring-red-500/20';
    return 'shadow-xl shadow-slate-200/50';
  };

  const getOpacity = () => {
    if (isFocused || isStartNode) return 'opacity-100';
    if (hasGlobalFocus) return 'opacity-30 blur-[0.5px] scale-[0.98]';
    return 'opacity-100';
  };

  return (
    <div className={`relative w-[320px] rounded-[2.5rem] bg-white border border-white overflow-hidden transition-all duration-500 ${getShadowStyle()} ${getOpacity()} sticker-hover`}>
      {/* Start Badge */}
      {isStartNode && (
        <div className="absolute top-4 right-4 z-20">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5 shadow-lg">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">第一步</span>
                <span className="text-xs">🚀</span>
            </div>
        </div>
      )}

      {/* Colored Header Band */}
      <div className={`h-16 bg-gradient-to-r px-8 flex items-center justify-between ${getHeaderStyles()}`}>
         <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-90">
           {isStartNode ? 'Entry Point' : node.type}
         </span>
         <div className="flex gap-1.5">
           {node.ui?.risk === 'high' && <span className="animate-bounce">⚠️</span>}
           {(node.ui?.badge === 'verified' || node.ui?.flags?.includes('verified')) && <span className="text-white drop-shadow-md font-bold">✓</span>}
         </div>
      </div>

      <div className="p-8">
        <div className="drag-handle cursor-move mb-4">
          <h3 className={`font-black text-xl leading-tight tracking-tight ${isStartNode ? 'text-indigo-600' : 'text-slate-800'}`}>
            {node.title}
          </h3>
        </div>

        {/* Done / Outcome Slot - Sticker Style */}
        <div className="mb-8">
           <div className={`rounded-3xl p-5 border-2 relative overflow-hidden text-center transition-colors ${isStartNode ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-indigo-50/50 text-slate-600 border-indigo-100/50'}`}>
              {!isStartNode && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100/30"></div>}
              <span className={`text-[9px] uppercase font-black tracking-widest block mb-2 ${isStartNode ? 'text-indigo-200' : 'text-indigo-400'}`}>
                {isStartNode ? '动作验收 (Check)' : '预期结果 (Done)'}
              </span>
              <p className={`text-sm font-medium leading-relaxed italic ${isStartNode ? 'text-white' : 'text-slate-600'}`}>
                "{node.done || "正在定义中..."}"
              </p>
           </div>
        </div>

        {/* Tags / Pills */}
        <div className="flex flex-wrap gap-2">
           {node.ui?.flags?.includes('skill_deficit') && (
             <div className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center gap-2">
                <span className="text-xs">⚠️</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">能力缺口</span>
             </div>
           )}
           
           {(node.ui?.skill_chips || []).map((chip, i) => (
             <div 
               key={i} 
               className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all ${
                 chip.state === 'deficit' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-500'
               }`}
             >
                <span className="text-xs">{chip.state === 'deficit' ? '⚡' : '✨'}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{chip.skill}</span>
             </div>
           ))}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-white !border-slate-200 shadow-sm" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-white !border-slate-200 shadow-sm" />
    </div>
  );
};

export default NodeCard;
