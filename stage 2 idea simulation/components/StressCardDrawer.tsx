
import React from 'react';
import { Operation } from '../types';

interface StressCardDrawerProps {
  operations: Operation[];
}

const StressCardDrawer: React.FC<StressCardDrawerProps> = ({ operations }) => {
  const cardOp = operations.find(op => op.op === 'stress_card');
  if (!cardOp) return null;

  const card = cardOp.card_type;
  const payload = cardOp.payload || {};

  return (
    <div className="fixed bottom-10 left-10 z-[80] animate-[slideUp_0.5s_ease-out]">
      <div className="bg-red-600 border-2 border-red-500 rounded-2xl p-1 shadow-2xl shadow-red-900/40 w-64 transform -rotate-1">
        <div className="bg-slate-950 rounded-xl p-5 border border-red-500/30">
          <div className="text-red-500 font-mono text-[10px] mb-2 font-bold tracking-[0.2em]">STRESS_DECK</div>
          <h3 className="text-white text-xl font-black mb-2 uppercase italic">{card}</h3>
          <p className="text-slate-400 text-sm leading-snug mb-4">
            Structural crack detected in the logic map. This part of your project is unstable.
          </p>
          
          <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-3">
             <span className="text-red-400 text-[10px] font-bold uppercase block mb-1">Impact</span>
             <span className="text-red-100 text-xs">A new dependency gap has been exposed. Structure must be patched.</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%) rotate(-5deg); opacity: 0; }
          to { transform: translateY(0) rotate(-1deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StressCardDrawer;
