
import React, { useState, useRef, useEffect } from 'react';
import { useStage3Store } from '../store';
import { Level, Mode } from '../types';
import { stepSimulation } from '../geminiService';

const CoachRail: React.FC = () => {
  const { 
    level, 
    mode, 
    lastResponse, 
    history, 
    isProcessing,
    studentProfile,
    projectBrief,
    logicMap,
    processStep,
    setIsProcessing,
    setExportMenuOpen
  } = useStage3Store();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, lastResponse]);

  const handleNext = async (customMsg?: string, choiceId?: string) => {
    // Intercept export action
    if (choiceId === 'action_export') {
      setExportMenuOpen(true);
      return;
    }

    const msg = customMsg || input || "Next";
    if (isProcessing) return;

    setInput('');
    setIsProcessing(true);

    try {
      const response = await stepSimulation(
        studentProfile,
        projectBrief,
        logicMap,
        level,
        mode,
        msg
      );
      processStep(msg, response);
    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 1. Stepper / Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/50 bg-white/30">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">仿真状态</span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{mode} Mode</span>
         </div>
         <div className="flex gap-3">
            {[Level.L1, Level.L2, Level.L3].map(lvl => (
              <div 
                key={lvl}
                className={`w-3 h-3 rounded-full transition-all duration-700 ${
                  level === lvl 
                    ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-200' 
                    : 'bg-slate-200'
                }`}
              />
            ))}
         </div>
      </div>

      {/* 2. Chat Stream */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide" ref={scrollRef}>
         {/* Ghost History - Very faint bubbles */}
         {history.length > 0 && (
            <div className="space-y-6 opacity-40 grayscale-[0.5]">
               {history.slice(-3).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {msg.content}
                     </div>
                  </div>
               ))}
               <div className="flex justify-center">
                  <div className="w-12 h-px bg-slate-200"></div>
               </div>
            </div>
         )}

         {/* Coach Bubble */}
         <div className="animate-[fadeIn_0.6s_ease-out]">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs shadow-md shadow-indigo-100">🧪</div>
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">思维教练</span>
            </div>
            
            <div className="bg-white rounded-[2rem] rounded-tl-none p-6 shadow-xl shadow-indigo-100/30 border border-white relative">
               <p className="text-slate-700 text-lg font-bold leading-relaxed">
                  {lastResponse?.say || "实验室已准备就绪。告诉我要模拟的项目，我们开始搭骨架！"}
               </p>
            </div>

            {lastResponse?.prompt_user && (
               <div className="mt-8 space-y-6">
                  <p className="text-sm text-slate-400 italic font-bold text-center px-4">“ {lastResponse.prompt_user} ”</p>
                  
                  {/* Choices as Pill Stickers */}
                  <div className="flex flex-wrap gap-3 justify-center">
                     {lastResponse.choices?.map(choice => (
                        <button
                          key={choice.id}
                          onClick={() => handleNext(choice.text, choice.id)}
                          disabled={isProcessing}
                          className={`px-6 py-4 text-sm font-black rounded-3xl border-2 transition-all soft-shadow active:scale-90 ${
                            choice.id === 'action_export' 
                              ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700' 
                              : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {choice.id === 'action_export' && <span>📥</span>}
                            {choice.text}
                          </span>
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* 3. Input Area */}
      <div className="p-8 bg-white/50 border-t border-white/50 backdrop-blur-md">
         <div className="relative mb-6">
            <textarea
              rows={3}
              className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-6 py-5 text-sm text-slate-700 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 resize-none font-medium shadow-inner"
              placeholder="在这里输入你的想法..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleNext())}
              disabled={isProcessing}
            />
         </div>
         <button 
           onClick={() => handleNext()}
           disabled={isProcessing}
           className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-black py-6 rounded-[2rem] transition-all soft-shadow uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 group"
         >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>确认计划</span>
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
         </button>
      </div>
    </div>
  );
};

export default CoachRail;
