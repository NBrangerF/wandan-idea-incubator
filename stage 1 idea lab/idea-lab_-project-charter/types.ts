// Re-export types from stage1 modules for backward compatibility if needed,
// or just direct components to use the new types.
import {
  MissionCard,
  ProjectCharter,
  Stage1LLMResponse,
  MicroQuest
} from './stage1/prompts';
import {
  Stage1Mode,
  Stage1Step,
  Vibe,
  Deliverable,
  ScopeLevel
} from './stage1/flow';
import {
  Stage1State,
  Calibration
} from './stage1/reducer';

export type {
  MissionCard,
  ProjectCharter,
  Stage1LLMResponse,
  MicroQuest,
  Stage1Mode,
  Stage1Step,
  Vibe,
  Deliverable,
  ScopeLevel,
  Stage1State,
  Calibration
};

// Types for components that were previously generic
export interface Choice {
  id: string;
  label: string;
  icon?: string;
  desc?: string;
}

export interface AppState extends Stage1State {}