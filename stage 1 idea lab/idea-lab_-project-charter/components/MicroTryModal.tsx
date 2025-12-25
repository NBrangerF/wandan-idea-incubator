import React, { useState } from 'react';
import { MissionCard, Calibration } from '../types';
import { Check, X, Clock, ThumbsUp, ThumbsDown, Minus, ArrowLeft } from 'lucide-react';

interface MicroTryModalProps {
  mission: MissionCard;
  onSubmit: (result: string, calibration: Calibration) => void;
  onClose: () => void;
  initialResult?: string;
  initialCalibration?: Calibration;
}

const MicroTryModal: React.FC<MicroTryModalProps> = ({ 
  mission, 
  onSubmit, 
  onClose,
  initialResult = '',
  initialCalibration = null
}) => {
  // If we have initial values (e.g. coming back from next step), start at calibrate step if complete, otherwise try step
  const [step, setStep] = useState<'try' | 'calibrate'>(
    initialResult && !initialCalibration ? 'try' : (initialResult ? 'calibrate' : 'try')
  );
  
  const [result, setResult] = useState(initialResult);
  const [calibration, setCalibration] = useState<Calibration | null>(initialCalibration);

  const handleSubmitTry = () => {
    if (!result) return;
    setStep('calibrate');
  };

  const handleFinalSubmit = () => {
    if (!calibration || !result) return;
    onSubmit(result, calibration);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white shrink-0 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">
              <Clock size={16} /> Micro-Try: 30 Seconds
            </div>
            <h3 className="text-2xl font-bold pr-8">{mission.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors p-1 rounded-full hover:bg-indigo-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {step === 'try' ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-lg font-medium text-gray-700 mb-4 leading-relaxed">
                  {mission.micro_try_prompt.prompt}
                </p>
                
                {mission.micro_try_prompt.type === 'choose_one' && mission.micro_try_prompt.options && (
                  <div className="space-y-3">
                    {mission.micro_try_prompt.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setResult(opt)}
                        className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all
                          ${result === opt 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(mission.micro_try_prompt.type === 'fill_blank' || mission.micro_try_prompt.type === 'two_sentence') && (
                  <textarea
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none min-h-[120px] text-lg"
                    placeholder="Type your quick idea here..."
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
              
              <button
                disabled={!result}
                onClick={handleSubmitTry}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
              >
                Next: Calibrate
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center py-4 animate-fade-in">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">How did that feel?</h4>
                <p className="text-gray-500">Be honest! This helps us size your project.</p>
              </div>

              <div className="flex justify-center gap-4">
                {[
                  { id: 'easier', label: 'Easier', icon: <ThumbsUp />, color: 'bg-green-100 text-green-700 border-green-200' },
                  { id: 'same', label: 'Expected', icon: <Minus />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                  { id: 'harder', label: 'Harder', icon: <ThumbsDown />, color: 'bg-red-100 text-red-700 border-red-200' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCalibration(opt.id as Calibration)}
                    className={`
                      flex flex-col items-center gap-3 p-4 rounded-2xl border-2 w-28 transition-all
                      ${calibration === opt.id 
                        ? `border-current ring-2 ring-offset-2 ${opt.color}` 
                        : 'border-gray-100 text-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`p-3 rounded-full ${calibration === opt.id ? 'bg-white/50' : 'bg-gray-100'}`}>
                      {opt.icon}
                    </div>
                    <span className="font-bold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <button
                    disabled={!calibration}
                    onClick={handleFinalSubmit}
                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                >
                    Complete Stage 1
                </button>
                <button 
                    onClick={() => setStep('try')}
                    className="text-gray-400 hover:text-gray-600 text-sm font-semibold flex items-center justify-center gap-1 w-full py-2"
                >
                    <ArrowLeft size={16} /> Back to Try
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroTryModal;