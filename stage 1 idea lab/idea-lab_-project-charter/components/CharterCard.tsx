import React from 'react';
import { ProjectCharter } from '../types';
import { Download, Edit2, Share2, Award } from 'lucide-react';

interface CharterCardProps {
  charter: ProjectCharter;
}

const CharterCard: React.FC<CharterCardProps> = ({ charter }) => {
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(charter, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "project_charter.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-indigo-100 overflow-hidden relative">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-4">
                <Award size={16} /> OFFICIAL CHARTER
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-2">{charter.mission_name}</h2>
            <p className="text-indigo-100 font-medium">Stage 1 Complete</p>
        </div>

        <div className="p-8 space-y-8">
            {/* The Big Sentence */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Project Mission</h3>
                <p className="text-xl md:text-2xl font-bold text-indigo-900 leading-relaxed">
                    "{charter.project_sentence}"
                </p>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">First Small Step (10 mins)</label>
                    <p className="font-semibold text-gray-800">{charter.first_small_step}</p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Success Check</label>
                    <p className="font-semibold text-gray-800">{charter.success_check}</p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Scope Level</label>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${charter.scope_level === 'S' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>S</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${charter.scope_level === 'M' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>M</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${charter.scope_level === 'L' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>L</span>
                    </div>
                </div>
                <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-400 uppercase">Why Now</label>
                     <p className="font-semibold text-gray-800 capitalize">{charter.why_now.replace('_', ' ')}</p>
                </div>
            </div>

             {/* Superpowers */}
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Needed Superpowers</label>
                <div className="flex flex-wrap gap-2">
                    {charter.needed_superpower.map((power) => (
                        <span key={power} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                            ⚡ {power}
                        </span>
                    ))}
                </div>
             </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 flex gap-4 justify-between items-center border-t border-gray-100">
            <button className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center gap-2 transition-colors">
                <Edit2 size={16} /> Edit
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={downloadJSON}
                    className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <Download size={16} /> Save JSON
                </button>
                <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                    <Share2 size={16} /> Share
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CharterCard;
