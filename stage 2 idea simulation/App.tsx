
import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import LogicCanvas from './components/LogicCanvas';
import TopBar from './components/TopBar';
import CoachRail from './components/CoachRail';
import ScanOverlay from './components/ScanOverlay';
import MicrotaskModal from './components/MicrotaskModal';
import StressCardDrawer from './components/StressCardDrawer';
import WritebackPanel from './components/WritebackPanel';
import { useStage3Store } from './store';
import { Mode, Level } from './types';
import { stepSimulation } from './geminiService';

// Props interface for combined app integration
interface AppContentProps {
  initialBrief?: { title: string; description: string };
  onBack?: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ initialBrief, onBack }) => {
  const { 
    mode, 
    initSession, 
    lastResponse,
    scanActive,
    setIsProcessing,
    processStep,
    isProcessing,
    setScanActive,
    isStarted
  } = useStage3Store();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Use initialBrief values if provided, otherwise use defaults
  const [title, setTitle] = useState(initialBrief?.title || '我的推理小说');
  const [description, setDescription] = useState(initialBrief?.description || '一个关于高中图书馆失窃案的硬核推理故事。');


  // React to store's isStarted state
  useEffect(() => {
    if (!isStarted) {
      setErrorMessage(null);
      // Reset local form to initialBrief values if provided, otherwise defaults
      setTitle(initialBrief?.title || '我的推理小说');
      setDescription(initialBrief?.description || '一个关于高中图书馆失窃案的硬核推理故事。');
    }
  }, [isStarted, initialBrief]);

  useEffect(() => {
    if (lastResponse) {
      setScanActive(true);
      const timer = setTimeout(() => {
        setScanActive(false);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [lastResponse, setScanActive]);

  const handleStart = async () => {
    if (!title.trim() || !description.trim()) {
      alert("请填写项目名称和目标描述。");
      return;
    }

    const profile = { grade: '八年级', current_skills: { '情节构思': 2, '线索布置': 1, '因果推理': 2 } };
    const brief = { title, description };
    
    setErrorMessage(null);
    initSession(profile, brief); 
    
    setIsProcessing(true);
    try {
      const initialMap = useStage3Store.getState().logicMap;
      const response = await stepSimulation(
        profile,
        brief,
        initialMap,
        Level.L1,
        Mode.BUILD,
        `INIT_SIMULATION: 我的项目是：${title}。最终目标的完成标准是：${description}。请基于逆向溯源原则开始引导我。核心要求：现在请仅针对这个终点节点，推导出一个最直接的前置依赖节点。请不要生成超过 1 个新节点，我们步步为营。`
      );
      processStep(`INIT_SIMULATION: ${title}`, response);
    } catch (error: any) {
      console.error("Simulation Error:", error);
      setErrorMessage(error.message || "通信故障");
      setIsProcessing(false);
    }
  };

  // If session not started or crashed, show the Landing/Setup UI
  if (!isStarted || errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-xl w-full bg-white/90 backdrop-blur-xl border border-white rounded-[2.5rem] p-12 shadow-2xl animate-[float_4s_easeInOut_infinite]">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <span className="text-2xl">🧪</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 text-center tracking-tight">灵感模拟器</h1>
          <p className="text-slate-400 mb-12 text-center font-medium italic">Stage 2 思维压力测试</p>
          
          {/* Back button when coming from Stage 1 */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition"
            >
              <span>←</span>
              <span>返回灵感实验室</span>
            </button>
          )}
          
          {/* Show that data came from Stage 1 */}
          {initialBrief && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-center">
              <p className="text-green-600 text-xs font-bold uppercase mb-1">✨ 灵感已导入</p>
              <p className="text-green-700 text-sm">来自 Stage 1 的项目已预填入</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
               <p className="text-red-500 text-xs font-bold uppercase mb-1">系统离线</p>
               <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
               <button onClick={() => setErrorMessage(null)} className="text-[10px] font-black text-red-500 underline uppercase tracking-widest">重试</button>
            </div>
          )}

          <div className="space-y-8">
            <div className="relative group">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-widest">✨ 项目叫什么？</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 focus:bg-white rounded-2xl px-6 py-4 text-slate-700 outline-none transition-all text-lg font-semibold" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>
            <div className="relative group">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-widest">🎯 终点在哪？(Done 状态)</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 focus:bg-white rounded-2xl px-6 py-4 text-slate-700 outline-none transition-all resize-none text-lg leading-relaxed" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
            <button 
                onClick={handleStart} 
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black py-6 rounded-[2rem] transition-all soft-shadow uppercase tracking-widest text-sm active:scale-95 flex items-center justify-center gap-3"
            >
                <span>{isProcessing ? '启动中...' : '开启灵感模拟'}</span>
                <span className="text-xl">🚀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Simulation UI
  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden font-sans bg-slate-50">
      <TopBar title={title} />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden">
          <LogicCanvas />
          <ScanOverlay active={scanActive} />
        </div>
        <div className="w-[380px] border-l border-white/50 flex flex-col z-20 shadow-2xl relative bg-white/40 backdrop-blur-md">
          <CoachRail />
        </div>
      </div>
      {lastResponse?.microtask && <MicrotaskModal task={lastResponse.microtask} />}
      {lastResponse?.operations?.some(op => op.op === 'stress_card') && <StressCardDrawer operations={lastResponse.operations} />}
      {mode === Mode.PATCH && <WritebackPanel />}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-[200] flex items-center justify-center">
           <div className="flex flex-col items-center gap-6 bg-white p-12 rounded-[3rem] shadow-2xl border border-white">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="text-sm text-indigo-600 font-bold uppercase tracking-[0.3em] animate-pulse">正在推演逻辑...</span>
           </div>
        </div>
      )}
    </div>
  );
};

// Final component wrap with ReactFlowProvider and export
// Props interface for standalone usage
interface AppProps {
  initialBrief?: { title: string; description: string };
  onBack?: () => void;
}

const App: React.FC<AppProps> = ({ initialBrief, onBack }) => (
  <ReactFlowProvider>
    <AppContent initialBrief={initialBrief} onBack={onBack} />
  </ReactFlowProvider>
);

// Export AppContent for combined app usage (ReactFlowProvider managed externally)
export { AppContent };
export default App;
