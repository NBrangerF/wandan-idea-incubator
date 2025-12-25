import React from 'react';

interface Choice {
  id: string;
  label: string;
  icon?: string;
  desc?: string;
}

interface ChoiceGridProps {
  choices: Choice[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const ChoiceGrid: React.FC<ChoiceGridProps> = ({ choices, onSelect, selectedId }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto animate-fade-in-up delay-100">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          className={`
            relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group
            ${selectedId === choice.id 
              ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]' 
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm hover:-translate-y-1'
            }
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl">{choice.icon}</span>
            {selectedId === choice.id && (
              <span className="h-3 w-3 rounded-full bg-indigo-500 animate-ping" />
            )}
          </div>
          <h3 className={`font-bold text-lg mb-1 ${selectedId === choice.id ? 'text-indigo-700' : 'text-gray-800'}`}>
            {choice.label}
          </h3>
          {choice.desc && (
            <p className="text-sm text-gray-500 font-medium group-hover:text-gray-600">
              {choice.desc}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default ChoiceGrid;
