import React, { useState, useEffect } from 'react';
import { MicroQuest, Calibration } from '../types';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface WarmupActiveProps {
  quest: MicroQuest;
  answer: string;
  onAnswer: (t: string) => void;
  onCalibration: (c: Calibration) => void;
  onFinish: () => void;
}

const WarmupActive: React.FC<WarmupActiveProps> = ({
  quest,
  answer,
  onAnswer,
  onCalibration,
  onFinish
}) => {
  const [picked, setPicked] = useState<string>("");
  const [localCalibration, setLocalCalibration] = useState<Calibration | null>(null);

  useEffect(() => {
    setPicked("");
    setLocalCalibration(null);
  }, [quest.id]);

  const isChoose = quest.type === "choose_one" && quest.options?.length;

  const handleCalibration = (c: Calibration) => {
    setLocalCalibration(c);
    onCalibration(c);
  };

  const hasAnswer = isChoose ? !!picked : !!answer;
  const canContinue = hasAnswer && !!localCalibration;

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="rounded-3xl border-2 border-indigo-100 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{quest.prompt}</h3>

        {isChoose ? (
          <div className="grid grid-cols-1 gap-3">
            {quest.options!.slice(0, 3).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setPicked(opt);
                  onAnswer(opt);
                }}
                className={`
                  p-4 rounded-xl border-2 text-left font-medium transition-all
                  ${picked === opt 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 p-4 min-h-[140px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-lg resize-none"
            placeholder="Type your answer here..."
          />
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
            How was this warm-up?
          </p>
          <div className="flex justify-center gap-3 md:gap-6">
            <button 
                onClick={() => handleCalibration("easier")} 
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 w-24 transition-all ${localCalibration === 'easier' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
            >
                <ThumbsUp size={24} /> <span className="text-xs font-bold">Easier</span>
            </button>
            <button 
                onClick={() => handleCalibration("same")} 
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 w-24 transition-all ${localCalibration === 'same' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
            >
                <Minus size={24} /> <span className="text-xs font-bold">Expected</span>
            </button>
            <button 
                onClick={() => handleCalibration("harder")} 
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 w-24 transition-all ${localCalibration === 'harder' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
            >
                <ThumbsDown size={24} /> <span className="text-xs font-bold">Harder</span>
            </button>
          </div>
        </div>

        <button
          disabled={!canContinue}
          onClick={onFinish}
          className="w-full mt-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WarmupActive;