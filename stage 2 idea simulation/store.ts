
import { create } from 'zustand';
import { 
  Level, Mode, LogicMap, StudentProfile, ProjectBrief, 
  LLMResponse, Operation, ProjectNode, ProjectEdge, NodeType 
} from './types';
import { applyOperations } from './reducer';

interface Stage3State {
  level: Level;
  mode: Mode;
  studentProfile: StudentProfile;
  projectBrief: ProjectBrief;
  logicMap: LogicMap;
  integrityStatus: 'stable' | 'warning' | 'critical';
  thinkingProgress: number;
  
  // Runtime UI
  isStarted: boolean;
  isProcessing: boolean;
  scanActive: boolean;
  focusNodeId?: string;
  lastResponse?: LLMResponse;
  history: { role: 'user' | 'assistant', content: string }[];
  writebackCount: number;
  isExportMenuOpen: boolean;

  // Actions
  initSession: (profile: StudentProfile, brief: ProjectBrief) => void;
  resetSession: () => void;
  setMode: (mode: Mode) => void;
  setLevel: (level: Level) => void;
  processStep: (userMsg: string, response: LLMResponse) => void;
  applyOps: (ops: Operation[]) => void;
  setScanActive: (active: boolean) => void;
  setFocusNode: (id?: string) => void;
  setIsProcessing: (loading: boolean) => void;
  setIntegrity: (status: 'stable' | 'warning' | 'critical') => void;
  setExportMenuOpen: (open: boolean) => void;
  exportDiagram: () => void;
  hasStartNode: () => boolean;
}

export const useStage3Store = create<Stage3State>((set, get) => ({
  level: Level.L1,
  mode: Mode.BUILD,
  studentProfile: { grade: '', current_skills: {} },
  projectBrief: { title: '', description: '' },
  logicMap: { nodes: [], edges: [] },
  integrityStatus: 'stable',
  thinkingProgress: 0,
  isStarted: false,
  isProcessing: false,
  scanActive: false,
  history: [],
  writebackCount: 0,
  isExportMenuOpen: false,

  initSession: (profile, brief) => {
    const finalOutcomeNode: ProjectNode = {
      id: 'final_outcome',
      level: Level.L1,
      title: `目标: ${brief.title}`,
      type: NodeType.GOAL,
      done: brief.description,
      acceptance_test: "最终项目成功标准已达成。",
      required_inputs: [],
      outputs: ["项目发布"],
      required_skills: {},
      assumptions: [],
      ui: {
        lane: 'L1',
        rank: 4, 
        order: 0,
        fog: 'none',
        risk: 'low',
        skill_chips: [],
        flags: [],
        badge: 'verified'
      }
    };

    set({
      studentProfile: profile,
      projectBrief: brief,
      logicMap: { nodes: [finalOutcomeNode], edges: [] },
      level: Level.L1,
      mode: Mode.BUILD,
      thinkingProgress: 5,
      history: [],
      writebackCount: 0,
      integrityStatus: 'stable',
      lastResponse: undefined,
      focusNodeId: 'final_outcome',
      isExportMenuOpen: false,
      isStarted: true,
      isProcessing: false
    });
  },

  resetSession: () => {
    set({
      isStarted: false,
      logicMap: { nodes: [], edges: [] },
      history: [],
      thinkingProgress: 0,
      projectBrief: { title: '', description: '' },
      lastResponse: undefined,
      focusNodeId: undefined,
      integrityStatus: 'stable',
      isProcessing: false,
      isExportMenuOpen: false,
      writebackCount: 0
    });
  },

  setMode: (mode) => set({ mode }),
  setLevel: (level) => set({ level }),
  setIntegrity: (status) => set({ integrityStatus: status }),
  setExportMenuOpen: (open) => set({ isExportMenuOpen: open }),

  processStep: (userMsg, response) => set((state) => {
    const isSystem = userMsg.startsWith("System:") || userMsg.startsWith("INIT_SIMULATION:");
    const newHistory = isSystem 
      ? state.history 
      : [...state.history, { role: 'user' as const, content: userMsg }];
    
    const nextHistory = [...newHistory, { role: 'assistant' as const, content: response.say }].slice(-10);
    
    const ops = response.operations || [];
    const updatedMap = applyOperations(state.logicMap, ops);
    const newWritebacks = ops.filter(op => op.op === 'writeback').length;
    
    const scanOp = ops.find(op => op.op === 'request_scan');
    const microNodeId = response.microtask?.context?.node_id;
    const nextFocusNode = scanOp?.payload?.focus_node_id || microNodeId || undefined;

    return {
      logicMap: updatedMap,
      lastResponse: response,
      history: nextHistory,
      mode: response.mode || state.mode,
      integrityStatus: response.integrity || state.integrityStatus,
      writebackCount: state.writebackCount + newWritebacks,
      isProcessing: false,
      focusNodeId: nextFocusNode,
      thinkingProgress: response.progress || state.thinkingProgress
    };
  }),

  applyOps: (ops) => set((state) => ({
    logicMap: applyOperations(state.logicMap, ops || []),
    writebackCount: state.writebackCount + (ops || []).filter(op => op.op === 'writeback').length,
  })),

  setScanActive: (active) => set({ scanActive: active }),
  setFocusNode: (id) => set({ focusNodeId: id }),
  setIsProcessing: (loading) => set({ isProcessing: loading }),

  hasStartNode: () => {
    const state = get();
    return state.logicMap.nodes.some(n => n.title.toUpperCase().startsWith('START ->'));
  },

  exportDiagram: () => {
    const state = get();
    const exportData = {
      project: state.projectBrief,
      progress: state.thinkingProgress,
      map: state.logicMap,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stage3_Diagram_${state.projectBrief.title || 'Export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}));
