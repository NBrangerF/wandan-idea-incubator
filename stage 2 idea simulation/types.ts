
export enum Level {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3'
}

export enum Mode {
  BUILD = 'BUILD',
  TEST = 'TEST',
  PATCH = 'PATCH'
}

export enum NodeType {
  GOAL = 'goal',
  MILESTONE = 'milestone',
  TASK = 'task',
  INPUT = 'input',
  VALIDATION = 'validation',
  SUPPORT = 'support',
  SKILL = 'skill'
}

export enum EdgeStrength {
  STRONG = 'strong',
  WEAK = 'weak'
}

export enum RelationType {
  PREREQ = 'PREREQ',
  INPUT_TO = 'INPUT_TO',
  DEFINES = 'DEFINES',
  VALIDATES = 'VALIDATES',
  MITIGATES = 'MITIGATES',
  SPLITS_INTO = 'SPLITS_INTO',
  OPTIONAL_FOR = 'OPTIONAL_FOR',
  BLOCKS = 'BLOCKS'
}

export interface Assumption {
  id: string;
  text: string;
  validated_by?: string;
}

export interface SkillChip {
  skill: string;
  required: number;
  current: number;
  state: 'ok' | 'edge' | 'deficit';
}

export interface NodeUI {
  fog: 'none' | 'low' | 'high';
  risk: 'low' | 'med' | 'high';
  flags: string[];
  skill_chips: SkillChip[];
  badge?: 'none' | 'verified';
  rank: number; 
  lane: 'L1' | 'L2' | 'L3';
  order: number;
}

export interface EdgeUI {
  state: 'normal' | 'broken';
}

export interface ProjectNode {
  id: string;
  level: Level;
  title: string;
  type: NodeType;
  done: string;
  acceptance_test: string;
  required_inputs: string[];
  outputs: string[];
  required_skills: Record<string, number>;
  assumptions: Assumption[];
  ui: NodeUI;
}

export interface ProjectEdge {
  id: string;
  from: string;
  to: string;
  strength: EdgeStrength;
  rationale: string;
  relation_type: RelationType;
  label: string;
  tooltip: string;
  ui: EdgeUI;
}

export interface LogicMap {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

export interface Microtask {
  type: 'hard' | 'soft';
  prompt: string;
  template?: string;
  context?: {
    node_id: string;
    trigger_reason: string;
    what_it_checks: string;
    related_edges?: string[];
  };
}

export interface Choice {
  id: string;
  text: string;
}

export interface Operation {
  op: 'upsert_node' | 'upsert_edge' | 'set_node_ui' | 'set_edge_ui' | 'stress_card' | 'writeback' | 'request_scan' | 'clear_temp_ui' | 'set_integrity';
  node?: ProjectNode;
  edge?: ProjectEdge;
  id?: string;
  ui?: any;
  card_type?: string;
  action?: string;
  payload?: any;
  status?: 'stable' | 'warning' | 'critical';
}

export interface LLMResponse {
  say: string;
  mode: Mode;
  operations: Operation[];
  prompt_user: string;
  choices?: Choice[];
  microtask?: Microtask;
  integrity?: 'stable' | 'warning' | 'critical';
  progress?: number;
}

export interface StudentProfile {
  grade: string;
  current_skills: Record<string, number>;
}

export interface ProjectBrief {
  title: string;
  description: string;
}
