
import React from 'react';
import { useStage3Store } from '../store';
import { Operation, Mode } from '../types';

const WritebackPanel: React.FC = () => {
  const { lastResponse, applyOps, setMode } = useStage3Store();
  
  const writebackOps = lastResponse?.operations.filter(op => op.op === 'writeback') || [];

  const handleApply = (op: Operation) => {
    // Force writeback and return to BUILD mode
    applyOps([op]);
    setMode(Mode.BUILD);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] max-w-2xl w-full">
      <div className="bg-slate-900/80 backdrop-blur-xl border-t-2 border-amber-500 rounded-2xl p-6 shadow-2xl shadow-slate-950/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 012.49-2.333c.05 0 .1.003.15.008a5.133 5.133 0 014.56 3.61 5.103 5.103 0 01-1.21 4.593c-.427.428-1.01.674-1.638.674h-2.146c-.352 0-.642-.23-.812-.556l-1.01-1.928a.877.877 0 01.15-.98l.635-.635c.226-.226.544-.314.85-.236.435.111.907.167 1.404.167h.542c.113 0 .225-.01.334-.029a1.134 1.134 0 00-.035-2.263 1.134 1.134 0 00-.325.048c-.022.007-.044.017-.065.028a2.64 2.64 0 10-5.138 1.14c.036.315.097.64.184.974l.115.441a1.13 1.13 0 01-.19.923c-.15.222-.4.354-.67.354h-.65a1.13 1.13 0 01-.884-.428l-.75-1a1.13 1.13 0 01.218-1.558l.453-.34a1.13 1.13 0 00.354-.453l.341-.453a1.13 1.13 0 011.558-.218l.8.6a1.13 1.13 0 01.428.884v.65c0 .27-.132.52-.354.67a1.13 1.13 0 01-.923.19l-.441-.115a3.36 3.36 0 00-.974-.184 2.64 2.64 0 10-1.14 5.138c-.011.021-.02.043-.028.065a1.134 1.134 0 00-.048.325 1.134 1.134 0 002.263.035c.02.109.03.22.03.334v.542c0 .497-.056.97-.167 1.404a1.13 1.13 0 00.236.85c.16.226.42.364.7.364h2.146c.628 0 1.211-.246 1.638-.674a5.103 5.103 0 001.21-4.593 5.133 5.133 0 00-4.56-3.61c-.05 0-.1-.003-.15-.008a2.64 2.64 0 01-2.49 2.333c.05 0 .1.003.15.008a5.133 5.133 0 014.56 3.61 5.103 5.103 0 01-1.21 4.593c-.427.428-1.01.674-1.638.674h-2.146c-.352 0-.642-.23-.812-.556l-1.01-1.928a.877.877 0 01.15-.98l.635-.635c.226-.226.544-.314.85-.236.435.111.907.167 1.404.167h.542z" clipRule="evenodd" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Patch Required</h3>
          </div>
          <span className="text-amber-500 font-mono text-xs uppercase tracking-widest">Structural Integrity: Low</span>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          The stress test exposed structural cracks. Choose a writeback action to reinforce the Logic Map before proceeding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {writebackOps.length > 0 ? (
            writebackOps.map((op, idx) => (
              <button
                key={idx}
                onClick={() => handleApply(op)}
                className="group flex flex-col items-start p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition-all text-left"
              >
                <span className="text-[10px] font-bold text-amber-500 uppercase mb-1">{op.action}</span>
                <span className="text-white text-sm font-semibold">{op.payload?.text || 'Strengthen this node'}</span>
              </button>
            ))
          ) : (
            /* Fallback if LLM didn't provide specific writebacks */
            <button
                onClick={() => handleApply({ op: 'writeback', action: 'General Patch', payload: { node_id: 'n1' } })}
                className="group flex flex-col items-start p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition-all text-left"
              >
                <span className="text-[10px] font-bold text-amber-500 uppercase mb-1">REINFORCE_LOAD_BEARING</span>
                <span className="text-white text-sm font-semibold">General structural reinforcement</span>
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritebackPanel;
