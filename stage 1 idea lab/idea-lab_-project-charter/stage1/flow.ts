// stage1/flow.ts
export type Stage1Mode = "guided" | "semi" | "know";

export type Vibe = "cool" | "fun" | "calm" | "achievement";
export type Deliverable = "card" | "story" | "game_concept" | "mini_research";
export type Audience = "self" | "friends" | "class" | "public";
export type ScopeLevel = "S" | "M" | "L";

export type WarmupEnergy = "low" | "ok" | "high";
export type WarmupHelpStyle = "hint" | "example" | "steps";
export type WarmupConfidence = "easyWins" | "steady" | "challenge";

export type Stage1Step =
  | "S0_WARMUP"
  | "S1_MODE_PICK"          // difficulty after warm-up
  | "S2_VIBE_PICK"
  | "S2_PACK_PICK"          // NEW: Lite path specific
  | "S3_DELIVERABLE_PICK"
  | "S4_MISSION_LOADING"
  | "S5_MISSION_CHOOSE"
  | "S6_TWIST"              // input post-mission: semi/know
  | "S7_SCOPE_PICK"
  | "S8_OUTPUT";

// --- Support Profile Types ---
export type SupportTier = "lite" | "standard" | "boost";
export type HelpUI = "hint" | "example" | "steps";
export type EffortMode = "easyWins" | "steady" | "challenge";

export type SupportProfile = {
  tier: SupportTier;
  helpUI: HelpUI;
  effortMode: EffortMode;
};

export type RuntimeConfig = {
  cardsPerBatch: number;
  skipVibeDeliverable: boolean;
  showScopePick: boolean;
  showTwistInput: boolean;
  showShuffle: boolean;
  missionPackMode: boolean;
};

export type MissionPack = {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  fixedVibe: Vibe;
  fixedDeliverable: Deliverable;
};

export const MISSION_PACKS: MissionPack[] = [
  { id: "pack_fun", label: "快乐源泉", desc: "好玩就行，做个卡片", emoji: "🤪", fixedVibe: "fun", fixedDeliverable: "card" },
  { id: "pack_cool", label: "高冷大神", desc: "写个酷酷的故事大纲", emoji: "😎", fixedVibe: "cool", fixedDeliverable: "story" },
  { id: "pack_safe", label: "稳稳幸福", desc: "简单做个小调查", emoji: "🍵", fixedVibe: "calm", fixedDeliverable: "mini_research" }
];

export function deriveSupportProfile(warmup: {
  energy: WarmupEnergy | null;
  help_style: WarmupHelpStyle | null;
  confidence: WarmupConfidence | null;
}): SupportProfile {
  // Defaults if null
  const energy = warmup.energy ?? "ok";
  const help = warmup.help_style ?? "steps";
  const conf = warmup.confidence ?? "steady";

  let tier: SupportTier = "standard";
  if (energy === "low") tier = "lite";
  if (energy === "high") tier = "boost";

  return {
    tier,
    helpUI: help, // Direct map: hint/example/steps
    effortMode: conf // Direct map: easyWins/steady/challenge
  };
}

export function getRuntimeConfig(mode: Stage1Mode, profile: SupportProfile): RuntimeConfig {
  const isLite = profile.tier === "lite";
  
  // Base config from preset
  const p = STAGE1_PRESETS[mode];

  return {
    cardsPerBatch: isLite ? 2 : p.cardsPerBatch,
    skipVibeDeliverable: isLite,
    showScopePick: isLite ? false : p.requireScopePick,
    showTwistInput: isLite ? false : p.allowTwistInput,
    showShuffle: true, 
    missionPackMode: isLite
  };
}

// --- End Support Profile ---

export type Stage1Preset = {
  id: Stage1Mode;
  label: string;
  subtitle: string;

  requireVibePick: boolean;
  requireDeliverablePick: boolean;

  allowTwistInput: boolean;

  cardsPerBatch: 2 | 3;
  requireScopePick: boolean;
  defaultScopeForKnow: ScopeLevel;

  showShuffle: boolean;

  terminology: {
    outputName: string;
  };
};

export const STAGE1_PRESETS: Record<Stage1Mode, Stage1Preset> = {
  guided: {
    id: "guided",
    label: "保姆级引导",
    subtitle: "纯点击，不用打字",
    requireVibePick: true,
    requireDeliverablePick: true,
    allowTwistInput: false,
    cardsPerBatch: 3,
    requireScopePick: true,
    defaultScopeForKnow: "S",
    showShuffle: true,
    terminology: { outputName: "任务卡片" }
  },
  semi: {
    id: "semi",
    label: "半自助模式",
    subtitle: "主要靠选，稍微动点脑",
    requireVibePick: true,
    requireDeliverablePick: true,
    allowTwistInput: true,
    cardsPerBatch: 3,
    requireScopePick: true,
    defaultScopeForKnow: "S",
    showShuffle: true,
    terminology: { outputName: "项目卡片" }
  },
  know: {
    id: "know",
    label: "老手模式",
    subtitle: "极速版，直接生成",
    requireVibePick: false,
    requireDeliverablePick: false,
    allowTwistInput: true,
    cardsPerBatch: 2,
    requireScopePick: false,
    defaultScopeForKnow: "S",
    showShuffle: true,
    terminology: { outputName: "项目立项书" }
  }
};

export function nextAfterMode(mode: Stage1Mode): Stage1Step {
  const p = STAGE1_PRESETS[mode];
  if (p.requireVibePick) return "S2_VIBE_PICK";
  if (p.requireDeliverablePick) return "S3_DELIVERABLE_PICK";
  return "S4_MISSION_LOADING";
}

export function nextAfterVibe(mode: Stage1Mode): Stage1Step {
  const p = STAGE1_PRESETS[mode];
  if (p.requireDeliverablePick) return "S3_DELIVERABLE_PICK";
  return "S4_MISSION_LOADING";
}

export function nextAfterDeliverable(_: Stage1Mode): Stage1Step {
  return "S4_MISSION_LOADING";
}

export function nextAfterMissionChoose(mode: Stage1Mode): Stage1Step {
  const p = STAGE1_PRESETS[mode];
  if (p.allowTwistInput) return "S6_TWIST";
  if (p.requireScopePick) return "S7_SCOPE_PICK";
  return "S8_OUTPUT";
}

export function nextAfterTwist(mode: Stage1Mode): Stage1Step {
  const p = STAGE1_PRESETS[mode];
  if (p.requireScopePick) return "S7_SCOPE_PICK";
  return "S8_OUTPUT";
}

export function nextAfterScope(_: Stage1Mode): Stage1Step {
  return "S8_OUTPUT";
}