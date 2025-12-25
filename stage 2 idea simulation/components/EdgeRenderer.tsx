
import React from 'react';
import { getBezierPath, EdgeProps, EdgeLabelRenderer } from 'reactflow';
import { RelationType } from '../types';

const EdgeRenderer: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.5
  });

  const isBroken = data?.state === 'broken';
  const isFocused = data?.isFocused;
  const hasGlobalFocus = data?.hasGlobalFocus;
  const relationType = data?.relation_type as RelationType;

  // 1. Line Visuals
  // Base visibility: If global focus exists, non-focused edges fade but stay legible.
  let opacity = 0.6;
  if (hasGlobalFocus) {
    opacity = isFocused ? 1 : 0.15; 
  } else if (isBroken) {
    opacity = 1;
  }

  // Tactical Colors for the lines
  const getStrokeColor = () => {
    if (isBroken) return '#ef4444'; // red-500
    if (isFocused) return '#4f46e5'; // indigo-600
    return '#64748b'; // slate-500 (Higher contrast than before)
  };

  const strokeWidth = isBroken ? 4 : (isFocused ? 4 : 2.5);

  // 2. Semantic Label Coloring
  const getLabelStyles = () => {
    if (isBroken) return 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-200';
    
    switch (relationType) {
      case RelationType.PREREQ:
      case RelationType.BLOCKS:
        return isFocused 
          ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200' 
          : 'bg-indigo-100 text-indigo-700 border-indigo-200';
      
      case RelationType.INPUT_TO:
        return isFocused 
          ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-200' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-100';

      case RelationType.VALIDATES:
      case RelationType.MITIGATES:
        return isFocused 
          ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200' 
          : 'bg-amber-50 text-amber-700 border-amber-200';

      case RelationType.DEFINES:
      case RelationType.SPLITS_INTO:
        return isFocused 
          ? 'bg-purple-600 text-white border-purple-700 shadow-purple-200' 
          : 'bg-purple-50 text-purple-700 border-purple-100';

      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <>
      {/* Background Glow for focused/critical paths */}
      {(isFocused || isBroken) && (
        <path
          d={edgePath}
          fill="none"
          stroke={isBroken ? '#fee2e2' : '#e0e7ff'}
          strokeWidth={strokeWidth + 8}
          strokeOpacity={0.4}
          className="transition-all duration-500"
        />
      )}

      {/* Main Path */}
      <path
        id={id}
        style={{
          ...style,
          stroke: getStrokeColor(),
          strokeWidth: strokeWidth,
          opacity: opacity,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`react-flow__edge-path ${isFocused ? 'animate-edge-flow' : ''} ${isBroken ? 'animate-pulse' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Permanent Relation Pill */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            // Labels are semi-transparent when idle, full when focused
            opacity: isFocused ? 1 : (hasGlobalFocus ? 0.2 : 0.6),
            transition: 'all 0.4s ease',
            zIndex: isFocused ? 50 : 10
          }}
          className="group"
        >
          <div className={`
            px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-help whitespace-nowrap
            ${getLabelStyles()}
            ${isFocused ? 'scale-110 shadow-xl' : 'scale-90 hover:scale-100 hover:opacity-100'}
          `}>
            <span className="flex items-center gap-1.5">
               {isBroken && <span>🚨</span>}
               {data?.label || relationType}
            </span>
          </div>
          
          {/* Enhanced Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-56 bg-white border border-slate-200 p-4 rounded-[1.5rem] shadow-2xl z-[100] animate-[fadeIn_0.2s_ease-out]">
             <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isBroken ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{relationType}</p>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
               {data?.tooltip || "逻辑推导连接点：描述两个思维节点间的因果关系。"}
             </p>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default EdgeRenderer;
