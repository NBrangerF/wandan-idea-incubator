
import React from 'react';

interface ScanOverlayProps {
  active: boolean;
}

const ScanOverlay: React.FC<ScanOverlayProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
      {/* Soft Wave Bar */}
      <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px]">
        <div className="h-full w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent absolute left-0 animate-[softscan_2s_easeInOut_infinite]"></div>
      </div>
      
      {/* Soft Corner Brackets */}
      <div className="absolute inset-8 border-[1px] border-white/50 rounded-[4rem] shadow-inner shadow-white/50">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-indigo-400/60 rounded-tl-[4rem]"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-400/60 rounded-tr-[4rem]"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-400/60 rounded-bl-[4rem]"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-indigo-400/60 rounded-br-[4rem]"></div>
      </div>

      <div className="flex flex-col items-center gap-8 animate-pulse">
        <div className="relative">
             <div className="w-32 h-32 rounded-full border-4 border-indigo-200 border-dashed animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center soft-shadow">
                  <span className="text-2xl">✨</span>
                </div>
             </div>
        </div>
        <div className="flex flex-col gap-3 items-center">
            <div className="px-6 py-2 bg-white/80 border-2 border-indigo-100 text-indigo-500 text-xs font-black tracking-widest uppercase rounded-full shadow-sm">
                灵感扫描中...
            </div>
            <div className="px-4 py-1.5 bg-white/60 text-slate-400 text-[10px] font-bold tracking-widest uppercase rounded-full">
                侦测逻辑裂痕
            </div>
        </div>
      </div>

      <style>{`
        @keyframes softscan {
          0% { left: -20%; opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { left: 120%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScanOverlay;
