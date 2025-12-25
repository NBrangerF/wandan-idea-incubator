// stage1/prompts.ts
import type {
  Stage1Mode,
  Vibe,
  Deliverable,
  Audience,
  ScopeLevel,
  WarmupEnergy,
  WarmupHelpStyle,
  WarmupConfidence,
  SupportProfile
} from "./flow";

export type MissionCard = {
  id: string;
  title: string;
  one_liner: string;
  vibe: Vibe;
  deliverable: Deliverable;
  constraint: string;
  suggested_skills: string[];
  micro_try_prompt: {
    type: "choose_one";
    prompt: string;
    options: string[];
  };
};

export type ProjectCharter = {
  mission_name: string;
  project_sentence: string;
  why_now: "curious" | "get_better" | "be_seen" | "solve_problem" | "just_fun";
  audience: Audience;
  deliverable: string;
  constraint: string;
  scope_level: ScopeLevel;
  success_check: string;
  needed_superpower: string[];
  first_small_step: string;
  twist_line?: string;
};

export type Stage1LLMResponse =
  | { kind: "missions"; coach: { text: string }; mission_cards: MissionCard[] }
  | { kind: "charter"; coach: { text: string }; project_charter: ProjectCharter };

export type WarmupProfile = {
  energy: WarmupEnergy;
  help_style: WarmupHelpStyle;
  confidence: WarmupConfidence;
};

export type MicroQuest = never; // Deprecated

export function buildStage1SystemPrompt(): string {
  return `
You are a playful, supportive mentor for middle-school students.
Stage 1 goal: generate an approachable mission idea with maximum autonomy and minimum intimidation.

**IMPORTANT: All user-facing output (titles, descriptions, questions) MUST be in Simplified Chinese (Mainland China style, natural, colloquial).**

Hard rules:
- Do NOT ask for long writing.
- Do NOT require specific names, plots, or complex mechanics.
- Keep each card conceptual and beginner-doable (ZPD).
- No "Project Charter" wording in user-facing text.

Micro-try prompts MUST be choose_one with EXACTLY 3 options (tap-only).
Output MUST be valid JSON only. No markdown.
  `.trim();
}

function schemaMissionsJSON(): string {
  return `
{
  "kind":"missions",
  "coach":{"text":"string (in Chinese)"},
  "mission_cards":[
    {
      "id":"M1",
      "title":"string (in Chinese)",
      "one_liner":"string (in Chinese)",
      "vibe":"cool|fun|calm|achievement",
      "deliverable":"card|story|game_concept|mini_research",
      "constraint":"string (in Chinese)",
      "suggested_skills":["string (in Chinese)"],
      "micro_try_prompt":{
        "type":"choose_one",
        "prompt":"string (in Chinese)",
        "options":["Option A (Chinese)","Option B","Option C"]
      }
    }
  ]
}
  `.trim();
}

function schemaCharterJSON(): string {
  return `
{
  "kind":"charter",
  "coach":{"text":"string (in Chinese)"},
  "project_charter":{
    "mission_name":"string (in Chinese)",
    "project_sentence":"string (in Chinese)",
    "why_now":"curious|get_better|be_seen|solve_problem|just_fun",
    "audience":"self|friends|class|public",
    "deliverable":"string (in Chinese)",
    "constraint":"string (in Chinese)",
    "scope_level":"S|M|L",
    "success_check":"string (in Chinese)",
    "needed_superpower":["string (in Chinese)"],
    "first_small_step":"string (in Chinese)",
    "twist_line":"string (in Chinese)"
  }
}
  `.trim();
}

export function buildGenerateMissionsUserPrompt(args: {
  mode: Stage1Mode;
  cardsPerBatch: number;
  vibe?: Vibe | null;
  deliverable?: Deliverable | null;
  audience?: Audience | null;
  warmup: WarmupProfile;
  supportProfile?: SupportProfile | null;
}): string {
  const { mode, cardsPerBatch, vibe, deliverable, audience, warmup, supportProfile } = args;

  return `
TASK: Generate ${cardsPerBatch} mission cards for a middle-school student.
MODE=${mode}
LANGUAGE=Simplified Chinese

Warm-up / Support Profile:
${JSON.stringify(supportProfile || warmup)}

Context:
- vibe=${vibe ?? "unknown"}
- deliverable=${deliverable ?? "unknown"}
- audience=${audience ?? "unknown"}

Constraints:
- EXACTLY ${cardsPerBatch} cards.
- Beginner-friendly, not intimidating.
- Keep abstract: use placeholders like [Character], [Mystery], [Mechanic].
- ONE simple constraint per card.
- micro_try_prompt: choose_one with EXACTLY 3 options.

Scaffolding Rules based on Support Profile:
- If tier="lite": Use very short sentences. Avoid complex words. Constraints must be "easy wins".
- If effortMode="challenge": Constraints can be bolder/quirkier.
- If helpUI="steps": Ensure the 'coach' text is structured nicely.

${schemaMissionsJSON()}
  `.trim();
}

export function buildFinalizeCharterUserPrompt(args: {
  mode: Stage1Mode;
  chosenMission: MissionCard;
  audience: Audience;
  scope: ScopeLevel;
  warmup: WarmupProfile;
  supportProfile?: SupportProfile | null;
  twistLine?: string | null;
}): string {
  const { mode, chosenMission, audience, scope, warmup, supportProfile, twistLine } = args;

  return `
TASK: Finalize a "Project Card" summary.
MODE=${mode}
LANGUAGE=Simplified Chinese

Support Profile:
${JSON.stringify(supportProfile || warmup)}

Chosen mission:
${JSON.stringify({
  title: chosenMission.title,
  one_liner: chosenMission.one_liner,
  constraint: chosenMission.constraint,
  deliverable: chosenMission.deliverable,
  vibe: chosenMission.vibe
})}

Student:
- audience=${audience}
- scope_level=${scope}
- twist_line=${(twistLine ?? "").slice(0, 80) || "none"}

Rules:
- Minimal and encouraging.
- project_sentence: one line.
- needed_superpower: 1–3.
- first_small_step: under 10 minutes.
- success_check: concrete and simple.
- If tier="lite", keep 'first_small_step' extremely simple (2 minute task).

${schemaCharterJSON()}
  `.trim();
}

// Stub for backward compatibility
export function buildGenerateMicroQuestsUserPrompt(args: { mode: Stage1Mode }): string {
  return "";
}