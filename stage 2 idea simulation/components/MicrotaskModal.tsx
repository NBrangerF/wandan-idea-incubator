
import React, { useState, useMemo } from 'react';
import { Microtask } from '../types';
import { useStage3Store } from '../store';
import { stepSimulation } from '../geminiService';

interface MicrotaskModalProps {
  task: Microtask;
}

const MicrotaskModal: React.FC<MicrotaskModalProps> = ({ task }) => {
  const [input, setInput] = useState('');
  const { 
    studentProfile, 
    projectBrief, 
    logicMap, 
    level, 
    mode, 
    isProcessing,
    processStep,
    setIsProcessing,
    setFocusNode
  } = useStage3Store();

  const handleComplete = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const msg = `Micro-validation Answer: ${input}`;
      const response = await stepSimulation(
        studentProfile,
        projectBrief,
        logicMap,
        level,
        mode,
        msg
      );
      processStep(msg, response);
      setFocusNode(undefined);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const context = task.context;
  const targetNode = useMemo(() => {
    return logicMap.nodes.find(n => n.id === context?.node_id);
  }, [logicMap.nodes, context?.node_id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md">
      <div className="max-w-3xl w-full bg-white border border-white rounded-[3rem] p-12 soft-shadow animate-[fadeIn_0.3s_ease-out] relative overflow-hidden">
        {/* Soft Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                 <span className="text-xl">🛠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">逻辑核查点</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Level_{level} Verification</span>
              </div>
            </div>
            <div className="px-5 py-2 bg-indigo-50 rounded-full text-xs font-black text-indigo-500 uppercase tracking-widest border border-indigo-100">
              {mode} Mode
            </div>
          </div>

          {targetNode && (
            <div className="mb-8 p-6 rounded-[2rem] bg-indigo-50/30 border-2 border-indigo-100/50">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">正在审查: {targetNode.title}</span>
               </div>
               <div className="bg-white/60 p-5 rounded-2xl border border-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">当前定义:</p>
                  <p className="text-base text-slate-600 font-medium italic leading-relaxed">
                    "{targetNode.done || "正在构建中..."}"
                  </p>
               </div>
            </div>
          )}

          {context && (
            <div className="mb-8 grid grid-cols-2 gap-6">
               <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">触发原因</span>
                  <p className="text-sm text-rose-600 font-bold leading-relaxed">{context.trigger_reason}</p>
               </div>
               <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">教练关注点</span>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{context.what_it_checks}</p>
               </div>
            </div>
          )}

          <div className="mb-10 text-center">
            <p className="text-slate-800 text-2xl font-black mb-6 leading-snug">{task.prompt}</p>
            {task.template && (
              <div className="bg-slate-50 border-2 border-indigo-100 p-6 rounded-[2rem] inline-block max-w-lg">
                <span className="text-[10px] text-indigo-500 uppercase font-black block mb-2 tracking-widest">格式参考</span>
                <p className="text-slate-500 italic font-medium">{task.template}</p>
              </div>
            )}
          </div>

          <textarea
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] px-8 py-6 text-slate-700 focus:border-indigo-400 outline-none mb-10 min-h-[160px] transition-all placeholder:text-slate-300 shadow-inner text-lg font-medium leading-relaxed"
            placeholder="在这里输入你的修正或说明..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isProcessing}
          />

          <button 
            onClick={handleComplete}
            disabled={isProcessing || !input.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-black py-7 rounded-[2.5rem] transition-all soft-shadow uppercase tracking-widest text-sm flex items-center justify-center gap-4 active:scale-95"
          >
            {isProcessing ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>应用逻辑修正</span>
                <span className="text-xl">✅</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrotaskModal;
