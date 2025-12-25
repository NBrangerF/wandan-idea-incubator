import React from 'react';
import { MissionCard } from '../types';
import { ArrowRight, Shuffle } from 'lucide-react';

interface MissionCarouselProps {
  missions: MissionCard[];
  onSelect: (id: string) => void;
  onShuffle: () => void;
}

const MissionCarousel: React.FC<MissionCarouselProps> = ({ missions, onSelect, onShuffle }) => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {missions.map((mission, index) => (
          <div 
            key={mission.id}
            className="flex flex-col bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            onClick={() => onSelect(mission.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-6xl font-black text-indigo-900">#{index + 1}</span>
            </div>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                {mission.vibe}
              </span>
              <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">
                {mission.title}
              </h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                {mission.one_liner}
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 mb-4">
                {mission.suggested_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 group-hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2">
                Try This Mission <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button 
          onClick={onShuffle}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-400 hover:text-gray-700 transition-all"
        >
          <Shuffle size={18} /> Shuffle & Generate New
        </button>
      </div>
    </div>
  );
};

export default MissionCarousel;
