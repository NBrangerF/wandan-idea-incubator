// stage1/reducer.ts
import type {
  Stage1Mode,
  Stage1Step,
  Vibe,
  Deliverable,
  Audience,
  ScopeLevel,
  WarmupEnergy,
  WarmupHelpStyle,
  WarmupConfidence,
  SupportProfile,
  RuntimeConfig
} from "./flow";
import {
  STAGE1_PRESETS,
  deriveSupportProfile,
  getRuntimeConfig,
  MISSION_PACKS,
  nextAfterMode,
  nextAfterVibe,
  nextAfterDeliverable,
  nextAfterMissionChoose,
  nextAfterTwist,
  nextAfterScope
} from "./flow";
import type { MissionCard, ProjectCharter } from "./prompts";

export type Calibration = "easier" | "same" | "harder";

export type Stage1State = {
  step: Stage1Step;
  history: Stage1Step[];

  // warm-up (metacognitive priming, not planning)
  warmup: {
    energy: WarmupEnergy | null;
    help_style: WarmupHelpStyle | null;
    confidence: WarmupConfidence | null;
  };

  // NEW: Profile & Config derived from warmup
  supportProfile: SupportProfile | null;
  runtimeConfig: RuntimeConfig | null;

  mode: Stage1Mode | null;

  vibe: Vibe | null;
  deliverable: Deliverable | null;
  audience: Audience;

  missionCards: MissionCard[];
  chosenMissionId: string | null;

  twistLine: string;

  scope: ScopeLevel | null;
  projectCharter: ProjectCharter | null;

  loading: boolean;
  error: string | null;
};

export type Stage1Action =
  | { type: "RESET" }
  | { type: "BACK" }

  // warm-up
  | { type: "SET_WARMUP_ENERGY"; value: WarmupEnergy }
  | { type: "SET_WARMUP_HELP"; value: WarmupHelpStyle }
  | { type: "SET_WARMUP_CONFIDENCE"; value: WarmupConfidence }
  | { type: "CONTINUE_AFTER_WARMUP" }

  // mode after warm-up
  | { type: "PICK_MODE"; mode: Stage1Mode }

  // picks
  | { type: "PICK_VIBE"; vibe: Vibe }
  | { type: "PICK_DELIVERABLE"; deliverable: Deliverable }
  | { type: "PICK_PACK"; packId: string } // NEW

  // missions
  | { type: "REQUEST_MISSIONS" }
  | { type: "MISSIONS_LOADED"; cards: MissionCard[] }
  | { type: "SHUFFLE_MISSIONS" }
  | { type: "PICK_MISSION"; id: string }

  // twist
  | { type: "SET_TWIST_LINE"; text: string }
  | { type: "CONTINUE_AFTER_TWIST" }

  // scope
  | { type: "PICK_SCOPE"; scope: ScopeLevel }

  // charter
  | { type: "REQUEST_CHARTER" }
  | { type: "CHARTER_LOADED"; charter: ProjectCharter }

  | { type: "ERROR"; message: string };

export const initialStage1State: Stage1State = {
  step: "S0_WARMUP",
  history: [],
  warmup: { energy: null, help_style: null, confidence: null },
  supportProfile: null,
  runtimeConfig: null,
  mode: null,

  vibe: null,
  deliverable: null,
  audience: "self",

  missionCards: [],
  chosenMissionId: null,

  twistLine: "",

  scope: null,
  projectCharter: null,

  loading: false,
  error: null
};

// Helper to update history
function withHistory(state: Stage1State, nextStep: Stage1Step): Stage1State {
  if (state.step === nextStep) return state;
  return {
    ...state,
    history: [...state.history, state.step],
    step: nextStep
  };
}

export function stage1Reducer(state: Stage1State, action: Stage1Action): Stage1State {
  switch (action.type) {
    case "RESET":
      return { ...initialStage1State };

    case "BACK": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        step: prev,
        history: state.history.slice(0, -1),
        loading: false, // Reset loading to allow re-triggering effects
        error: null
      };
    }

    // warm-up
    case "SET_WARMUP_ENERGY":
      return { ...state, warmup: { ...state.warmup, energy: action.value } };

    case "SET_WARMUP_HELP":
      return { ...state, warmup: { ...state.warmup, help_style: action.value } };

    case "SET_WARMUP_CONFIDENCE":
      return { ...state, warmup: { ...state.warmup, confidence: action.value } };

    case "CONTINUE_AFTER_WARMUP": {
      // Calculate profile early so we can display it or use it immediately
      const profile = deriveSupportProfile(state.warmup);
      return {
        ...withHistory(state, "S1_MODE_PICK"),
        supportProfile: profile
        // runtimeConfig depends on mode, so we calculate it in PICK_MODE
      };
    }

    // mode pick (after warm-up)
    case "PICK_MODE": {
      if (!state.supportProfile) return state; // Should not happen
      const config = getRuntimeConfig(action.mode, state.supportProfile);
      
      let next: Stage1Step;
      if (config.skipVibeDeliverable) {
        next = "S2_PACK_PICK";
      } else {
        next = nextAfterMode(action.mode);
      }

      return withHistory({
        ...state,
        mode: action.mode,
        runtimeConfig: config
      }, next);
    }

    case "PICK_VIBE":
      if (!state.mode) return state;
      return withHistory({ ...state, vibe: action.vibe }, nextAfterVibe(state.mode));

    case "PICK_DELIVERABLE":
      if (!state.mode) return state;
      return withHistory({ ...state, deliverable: action.deliverable }, nextAfterDeliverable(state.mode));

    case "PICK_PACK": {
      const pack = MISSION_PACKS.find(p => p.id === action.packId);
      if (!pack) return state;
      return {
         ...withHistory(state, "S4_MISSION_LOADING"),
         vibe: pack.fixedVibe,
         deliverable: pack.fixedDeliverable,
         scope: "S", // Auto set scope for packs
         loading: true,
         error: null
      };
    }

    case "REQUEST_MISSIONS":
      // If we are shuffling (already at S5), don't push S5 to history.
      // We want Back to go to the step BEFORE S5 (e.g. S3).
      if (state.step === "S5_MISSION_CHOOSE") {
         return { ...state, step: "S4_MISSION_LOADING", loading: true, error: null };
      }
      return { ...withHistory(state, "S4_MISSION_LOADING"), loading: true, error: null };

    case "MISSIONS_LOADED":
      // Don't push loading step (S4) to history.
      // We update the step directly so history remains pointing to the selection step (e.g. S3).
      return { 
        ...state, 
        step: "S5_MISSION_CHOOSE",
        loading: false, 
        missionCards: action.cards, 
        chosenMissionId: null 
      };

    case "SHUFFLE_MISSIONS":
      return { ...state, error: null };

    case "PICK_MISSION": {
      if (!state.mode || !state.runtimeConfig) return state;
      // Use runtime config for next step
      let next: Stage1Step = "S8_OUTPUT";
      if (state.runtimeConfig.showTwistInput) next = "S6_TWIST";
      else if (state.runtimeConfig.showScopePick) next = "S7_SCOPE_PICK";
      
      const p = STAGE1_PRESETS[state.mode];

      return withHistory({
        ...state,
        chosenMissionId: action.id,
        twistLine: "",
        scope: state.runtimeConfig.showScopePick ? state.scope : (state.scope ?? p.defaultScopeForKnow),
      }, next);
    }

    case "SET_TWIST_LINE":
      return { ...state, twistLine: action.text.slice(0, 80) };

    case "CONTINUE_AFTER_TWIST":
      if (!state.mode || !state.runtimeConfig) return state;
      // Check runtime config for next step
      let nextStep: Stage1Step = "S8_OUTPUT";
      if (state.runtimeConfig.showScopePick) nextStep = "S7_SCOPE_PICK";
      
      return withHistory(state, nextStep);

    case "PICK_SCOPE":
      return withHistory({ ...state, scope: action.scope }, nextAfterScope(state.mode ?? "guided"));

    case "REQUEST_CHARTER":
      return { ...state, loading: true, error: null };

    case "CHARTER_LOADED":
      // S8 is the output. Usually we get here from S6, S7 or S5. 
      // The step transition logic is handled by 'nextAfter...' functions used in PICK_... actions.
      // So here we just ensure we are at S8 and data is loaded.
      return { 
          ...withHistory(state, "S8_OUTPUT"), 
          loading: false, 
          projectCharter: action.charter 
      };

    case "ERROR":
      return { ...state, loading: false, error: action.message };

    default:
      return state;
  }
}