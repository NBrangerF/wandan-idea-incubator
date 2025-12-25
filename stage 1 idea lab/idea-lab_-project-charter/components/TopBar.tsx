import React from 'react';
import { RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';

interface TopBarProps {
  onReset: () => void;
  onBack?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onReset, onBack }) => {
  return (
    <div className="w-full h-16 bg-white border-b-2 border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Idea Lab 🧪</h1>
          <p className="text-xs text-gray-400 font-medium hidden sm:block">Pick → Try → Calibrate → Choose</p>
        </div>
      </div>
      <div className="flex gap-2 sm:gap-4">
        <button 
          onClick={onReset}
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
          title="Restart"
        >
          <RefreshCw size={20} />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;