import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  STAGE1_PRESETS,
  MISSION_PACKS,
  type Stage1Mode,
  type Vibe,
  type Deliverable,
  type ScopeLevel,
  type WarmupEnergy,
  type WarmupHelpStyle,
  type WarmupConfidence,
  type SupportProfile
} from "./stage1/flow";
import { initialStage1State, stage1Reducer } from "./stage1/reducer";
import {
  buildStage1SystemPrompt,
  buildGenerateMissionsUserPrompt,
  buildFinalizeCharterUserPrompt,
  type MissionCard,
  type WarmupProfile
} from "./stage1/prompts";
import { callStage1AI } from "./services/geminiService";
import { ArrowLeft, LifeBuoy, X, RefreshCw } from 'lucide-react';

// --- Maps for UI translation ---
const VIBE_MAP: Record<Vibe, string> = {
  cool: "酷炫 / 大片感",
  fun: "搞怪 / 脑洞",
  calm: "治愈 / 佛系",
  achievement: "硬核 / 成就感"
};

const DELIVERABLE_MAP: Record<Deliverable, string> = {
  card: "创意卡片",
  story: "微小说",
  game_concept: "游戏策划",
  mini_research: "微调查"
};

const SCOPE_MAP: Record<ScopeLevel, { label: string; desc: string }> = {
  S: { label: "S (小试牛刀)", desc: "1小时搞定，随便玩玩" },
  M: { label: "M (有点东西)", desc: "一个周末，稍微认真点" },
  L: { label: "L (大制作)", desc: "一周左右，要做就做全套" }
};

// Help text templates
const HELP_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  hint: {
    title: "💡 灵感提示",
    body: (
      <div className="text-gray-600 text-lg font-medium">
        试试把你自己最近遇到的一件小事，改编进去？比如“丢失的作业本”或者“食堂的神秘菜谱”。
      </div>
    )
  },
  example: {
    title: "👀 举个栗子",
    body: (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
        <div className="font-bold text-gray-800 mb-1">示例：外星人观察日记</div>
        <div className="text-sm text-gray-600">
          假设你是一个伪装成学生的外星人，记录人类奇怪的行为（比如为什么要早读？）。
        </div>
      </div>
    )
  },
  steps: {
    title: "🪜 拆解步骤",
    body: (
      <ul className="space-y-3 text-left">
        <li className="flex gap-3 items-center text-gray-700 font-medium">
          <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
          先不管好不好，闭眼选一个。
        </li>
        <li className="flex gap-3 items-center text-gray-700 font-medium">
          <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
          问自己：如果主角是我最好的朋友，会怎样？
        </li>
        <li className="flex gap-3 items-center text-gray-700 font-medium">
          <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
          如果不喜欢，随时点“换一批”。
        </li>
      </ul>
    )
  }
};

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full border text-sm transition font-medium",
        selected 
          ? "bg-white shadow-md border-indigo-300 ring-2 ring-indigo-100 text-indigo-700 transform scale-105" 
          : "bg-white/60 border-transparent hover:bg-white hover:border-gray-200 text-gray-600"
      ].join(" ")}
    >
      {label}
    </button>
  );
};

interface BigCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  onClick: () => void;
}

const BigCard: React.FC<BigCardProps> = ({
  title,
  subtitle,
  emoji,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md p-6 hover:bg-white hover:shadow-lg transition-all text-left group hover:-translate-y-1 w-full"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl group-hover:scale-110 transition-transform">{emoji}</div>
        <div>
          <div className="text-lg font-bold text-gray-800">{title}</div>
          <div className="text-gray-600 mt-1 text-sm leading-relaxed">{subtitle}</div>
        </div>
      </div>
    </button>
  );
};

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-2 rounded-full transition-all duration-300",
            i === current ? "w-6 bg-indigo-600" : "w-2 bg-indigo-200"
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function StatusBanner({ profile }: { profile: SupportProfile }) {
  const mapTier = { lite: "轻松档", standard: "标准", boost: "满电" };
  const mapHelp = { hint: "给提示", example: "看例子", steps: "拆解步骤" };
  const mapEffort = { easyWins: "躺平", steady: "稳扎稳打", challenge: "挑战" };

  return (
    <div className="w-full bg-indigo-600/5 border-b border-indigo-100 py-2 px-4 flex justify-center items-center gap-4 text-xs font-bold text-indigo-800 animate-fade-in">
        <span className="flex items-center gap-1">🔋 {mapTier[profile.tier]}</span>
        <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
        <span className="flex items-center gap-1">🆘 {mapHelp[profile.helpUI]}</span>
        <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
        <span className="flex items-center gap-1">🎯 {mapEffort[profile.effortMode]}</span>
    </div>
  );
}

function HelpDrawer({ 
  profile, 
  isOpen, 
  onClose 
}: { 
  profile: SupportProfile; 
  isOpen: boolean; 
  onClose: () => void 
}) {
  if (!isOpen) return null;
  const content = HELP_CONTENT[profile.helpUI];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Drawer */}
      <div className="bg-white w-full max-w-lg rounded-t-[2rem] p-6 pb-10 shadow-2xl transform transition-transform animate-fade-in-up pointer-events-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
            <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-2"></div>
            <h3 className="text-xl font-bold text-indigo-900">{content.title}</h3>
            {content.body}
            <button onClick={onClose} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl mt-4">
                收到 👌
            </button>
        </div>
      </div>
    </div>
  );
}

function MissionCards({
  cards,
  onPick,
  onShuffle,
  shuffleEnabled
}: {
  cards: MissionCard[];
  onPick: (id: string) => void;
  onShuffle: () => void;
  shuffleEnabled: boolean;
}) {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">🎁 任务盲盒</div>
          <div className="text-gray-600 text-sm font-medium">挑一个最顺眼的。</div>
        </div>
        {shuffleEnabled ? (
          <button
            onClick={onShuffle}
            className="px-4 py-2 rounded-2xl border border-indigo-100 bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 hover:shadow-sm transition"
          >
            🔄 换一批
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-md p-6 hover:bg-white hover:shadow-xl hover:border-indigo-200 transition-all text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {VIBE_MAP[c.vibe] || c.vibe}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {DELIVERABLE_MAP[c.deliverable] || c.deliverable}
                    </span>
                </div>
                <div className="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{c.title}</div>
                <div className="text-gray-600 font-medium leading-relaxed mb-4">{c.one_liner}</div>
                <div className="text-gray-500 text-xs bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="font-bold text-gray-400 uppercase mr-1">挑战:</span>
                <span className="font-semibold text-gray-700">{c.constraint}</span>
                </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OutputCard({
  title,
  json,
  onReset,
  onNextStage
}: {
  title: string;
  json: any;
  onReset: () => void;
  onNextStage?: () => void;
}) {
  const charter = json.project_card;
  
  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between">
         <div className="text-xl font-bold text-gray-900">{title}</div>
         <button onClick={onReset} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-bold text-sm text-gray-600 transition">
            ↩️ 重来
         </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden relative">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white text-center">
            <h2 className="text-3xl font-black mb-2 tracking-tight">{charter.mission_name}</h2>
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-bold text-indigo-50">灵感生成完毕</div>
        </div>
        
        <div className="p-8 space-y-8">
             <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">项目使命</div>
                <div className="text-2xl font-black text-indigo-900 leading-snug">"{charter.project_sentence}"</div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">第一步 (10分钟)</label>
                    <div className="font-bold text-gray-800 text-lg">{charter.first_small_step}</div>
                </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">怎么算成功？</label>
                    <div className="font-bold text-gray-800 text-lg">{charter.success_check}</div>
                </div>
            </div>
            
            <div>
                 <label className="text-xs font-bold text-gray-400 uppercase block mb-3">所需超能力</label>
                 <div className="flex flex-wrap gap-2">
                    {charter.needed_superpower.map((p: string) => (
                        <span key={p} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600">⚡ {p}</span>
                    ))}
                 </div>
            </div>

            {charter.twist_line && charter.twist_line !== "none" && (
                <div className="pt-6 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">你的魔改</label>
                    <div className="font-medium text-indigo-600 italic">"{charter.twist_line}"</div>
                </div>
            )}
        </div>
      </div>

      {/* Next Stage Button */}
      {onNextStage && (
        <button
          onClick={onNextStage}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-purple-200 uppercase tracking-widest text-sm active:scale-95 flex items-center justify-center gap-3"
        >
          <span>🚀 进入灵感模拟</span>
          <span className="text-lg">→</span>
        </button>
      )}
    </div>
  );
}

function normalizeMissionCards(cards: MissionCard[], n: number): MissionCard[] {
  const safe3 = ["方案 A", "方案 B", "方案 C"];
  return cards.slice(0, n).map((c, idx) => ({
    ...c,
    id: c.id || `M${idx + 1}`,
    micro_try_prompt: {
      type: "choose_one",
      prompt: c.micro_try_prompt?.prompt || "选一个快速开始",
      options:
        Array.isArray(c.micro_try_prompt?.options) && c.micro_try_prompt.options.length >= 3
          ? c.micro_try_prompt.options.slice(0, 3)
          : safe3
    }
  }));
}

// Props interface for combined app integration
interface AppProps {
  onComplete?: (output: { mission_name: string; project_sentence: string }) => void;
}

export default function App({ onComplete }: AppProps = {}) {
  const [state, dispatch] = useReducer(stage1Reducer, initialStage1State);
  const preset = useMemo(() => (state.mode ? STAGE1_PRESETS[state.mode] : null), [state.mode]);
  
  const [helpOpen, setHelpOpen] = useState(false);

  const missionsInFlight = useRef(false);
  const charterInFlight = useRef(false);

  const chosenMission = useMemo(() => {
    if (!state.chosenMissionId) return null;
    return state.missionCards.find((c) => c.id === state.chosenMissionId) ?? null;
  }, [state.chosenMissionId, state.missionCards]);

  const warmupReady = Boolean(state.warmup.energy && state.warmup.help_style && state.warmup.confidence);

  // Memoize warmup profile to prevent unstable dependency in useEffect
  const warmupProfile: WarmupProfile = useMemo(() => ({
    energy: state.warmup.energy ?? "ok",
    help_style: state.warmup.help_style ?? "steps",
    confidence: state.warmup.confidence ?? "steady"
  }), [state.warmup.energy, state.warmup.help_style, state.warmup.confidence]);

  // Missions fetch
  useEffect(() => {
    let cancelled = false;

    async function runMissions() {
      if (!state.mode) return;
      if (state.step !== "S4_MISSION_LOADING") return;

      if (missionsInFlight.current) return;
      missionsInFlight.current = true;

      const p = STAGE1_PRESETS[state.mode];
      // Use runtime config if available, else fall back to preset
      const cardsNeeded = state.runtimeConfig?.cardsPerBatch ?? p.cardsPerBatch;

      // Only dispatch if we aren't already marked loading (although reducer handles idempotency)
      if (!state.loading) {
         dispatch({ type: "REQUEST_MISSIONS" });
      }

      try {
        const system = buildStage1SystemPrompt();
        const user = buildGenerateMissionsUserPrompt({
          mode: state.mode,
          cardsPerBatch: cardsNeeded,
          vibe: state.vibe,
          deliverable: state.deliverable,
          audience: state.audience,
          warmup: warmupProfile,
          supportProfile: state.supportProfile
        });

        const resp = await callStage1AI({ system, user });
        if (cancelled) return;
        if (resp.kind !== "missions") throw new Error("AI 响应格式错误 (missions)");

        dispatch({ type: "MISSIONS_LOADED", cards: normalizeMissionCards(resp.mission_cards, cardsNeeded) });
      } catch (e: any) {
        if (!cancelled) dispatch({ type: "ERROR", message: e?.message ?? "生成任务失败，请重试" });
      } finally {
        missionsInFlight.current = false;
      }
    }

    runMissions();
    return () => { 
        cancelled = true; 
        // IMPORTANT: Resetting this allows the effect to fire again if the component is re-mounted
        // which happens immediately in React Strict Mode.
        missionsInFlight.current = false; 
    };
  }, [
    state.step, 
    state.mode, 
    state.vibe, 
    state.deliverable, 
    state.audience, 
    state.supportProfile, 
    state.runtimeConfig, 
    warmupProfile, 
    state.loading // Added loading to dependency to respect retry clicks
  ]);

  // Charter finalize
  useEffect(() => {
    let cancelled = false;

    async function runCharter() {
      if (!state.mode) return;
      if (state.step !== "S8_OUTPUT") return;
      if (state.projectCharter) return;
      if (!chosenMission) return;

      if (charterInFlight.current) return;
      charterInFlight.current = true;

      const p = STAGE1_PRESETS[state.mode];
      const scope: ScopeLevel = state.scope ?? p.defaultScopeForKnow;

      dispatch({ type: "REQUEST_CHARTER" });

      try {
        const system = buildStage1SystemPrompt();
        const user = buildFinalizeCharterUserPrompt({
          mode: state.mode,
          chosenMission,
          audience: state.audience,
          scope,
          warmup: warmupProfile,
          supportProfile: state.supportProfile,
          twistLine: state.twistLine
        });

        const resp = await callStage1AI({ system, user });
        if (cancelled) return;
        if (resp.kind !== "charter") throw new Error("AI 响应格式错误 (charter)");

        dispatch({ type: "CHARTER_LOADED", charter: resp.project_charter });
      } catch (e: any) {
        if (!cancelled) dispatch({ type: "ERROR", message: e?.message ?? "生成卡片失败，请重试" });
      } finally {
        charterInFlight.current = false;
      }
    }

    runCharter();
    return () => { 
        cancelled = true; 
        charterInFlight.current = false;
    };
  }, [state.step, state.mode, state.projectCharter, chosenMission, state.scope, state.audience, state.twistLine, state.supportProfile, warmupProfile]);

  // UI shell: brighter, playful
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-50 to-yellow-100 font-sans pb-20">
      {state.supportProfile && state.step !== "S0_WARMUP" && (
         <StatusBanner profile={state.supportProfile} />
      )}

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-3xl">
          <div className="flex items-center gap-4">
             {state.history.length > 0 && (
                <button 
                  onClick={() => dispatch({ type: "BACK" })}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-white text-indigo-900 hover:text-indigo-600 transition shadow-sm backdrop-blur-sm"
                  aria-label="Go back"
                >
                   <ArrowLeft size={24} />
                </button>
             )}
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🧪</span>
                  <div className="text-2xl font-black text-indigo-900 tracking-tight">完蛋！我被好想法包围了！</div>
                </div>
                <StepDots
                  current={
                    state.step === "S0_WARMUP" ? 0 :
                    state.step === "S1_MODE_PICK" ? 1 :
                    state.step === "S5_MISSION_CHOOSE" ? 2 :
                    state.step === "S8_OUTPUT" ? 3 : 2
                  }
                  total={4}
                />
             </div>
          </div>
          <button 
            onClick={() => { if(window.confirm('确定要重置吗？')) dispatch({ type: "RESET" }); }} 
            className="px-4 py-2 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white text-indigo-900 font-bold text-sm transition shadow-sm"
          >
            🔁 重置
          </button>
        </div>

        {state.error ? (
          <div className="w-full max-w-2xl rounded-3xl bg-red-50/90 backdrop-blur border border-red-100 p-6 text-red-700 font-bold animate-fade-in-up shadow-lg">
            出错了: {state.error}
          </div>
        ) : null}

        {/* S0 Warm-up (metacognitive priming only) */}
        {state.step === "S0_WARMUP" ? (
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-lg p-8 space-y-8 animate-fade-in-up shadow-xl">
            <div>
              <div className="text-2xl font-black text-indigo-900">✨ 状态贴纸墙</div>
              <div className="text-gray-600 font-medium">
                选3个贴纸，让我更懂你。
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-indigo-900 uppercase tracking-wide text-xs">🔋 现在的电量</div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["low", "低 (想轻松点)"],
                  ["ok", "一般"],
                  ["high", "满电 (冲冲冲!)"]
                ] as [WarmupEnergy, string][]).map(([v, label]) => (
                  <Chip
                    key={v}
                    label={label}
                    selected={state.warmup.energy === v}
                    onClick={() => dispatch({ type: "SET_WARMUP_ENERGY", value: v })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-indigo-900 uppercase tracking-wide text-xs">🧠 卡壳的时候...</div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["hint", "给个提示"],
                  ["example", "看个例子"],
                  ["steps", "拆解步骤"]
                ] as [WarmupHelpStyle, string][]).map(([v, label]) => (
                  <Chip
                    key={v}
                    label={label}
                    selected={state.warmup.help_style === v}
                    onClick={() => dispatch({ type: "SET_WARMUP_HELP", value: v })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-indigo-900 uppercase tracking-wide text-xs">🏁 今天我想...</div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["easyWins", "躺平 / 简单模式"],
                  ["steady", "稳扎稳打"],
                  ["challenge", "挑战一下"]
                ] as [WarmupConfidence, string][]).map(([v, label]) => (
                  <Chip
                    key={v}
                    label={label}
                    selected={state.warmup.confidence === v}
                    onClick={() => dispatch({ type: "SET_WARMUP_CONFIDENCE", value: v })}
                  />
                ))}
              </div>
            </div>

            <button
              disabled={!warmupReady}
              onClick={() => dispatch({ type: "CONTINUE_AFTER_WARMUP" })}
              className={[
                "w-full py-4 rounded-2xl font-black text-lg transition shadow-lg",
                warmupReady
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              ].join(" ")}
            >
              继续 ➜
            </button>
          </div>
        ) : null}

        {/* S1 Difficulty / Mode */}
        {state.step === "S1_MODE_PICK" ? (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in-up">
            <div className="text-center">
              <div className="text-2xl font-black text-indigo-900">🎚️ 选择难度</div>
              <div className="text-gray-600 font-medium">难度决定了我能帮你多少。</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BigCard
                emoji="🧸"
                title="保姆级引导"
                subtitle="纯点击，不用打字。"
                onClick={() => dispatch({ type: "PICK_MODE", mode: "guided" })}
              />
              <BigCard
                emoji="🧩"
                title="半自助"
                subtitle="主要靠选，稍微动脑。"
                onClick={() => dispatch({ type: "PICK_MODE", mode: "semi" })}
              />
              <BigCard
                emoji="🚀"
                title="老手模式"
                subtitle="极速版，直接生成。"
                onClick={() => dispatch({ type: "PICK_MODE", mode: "know" })}
              />
            </div>
          </div>
        ) : null}

        {/* S2 PACK PICK (LITE MODE ONLY) */}
        {state.step === "S2_PACK_PICK" ? (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in-up">
            <div className="text-center">
              <div className="text-2xl font-black text-indigo-900">🎁 选个任务包</div>
              <div className="text-gray-600 font-medium">看你有点累，我们直接整套带走。</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MISSION_PACKS.map(pack => (
                  <BigCard 
                    key={pack.id}
                    emoji={pack.emoji}
                    title={pack.label}
                    subtitle={pack.desc}
                    onClick={() => dispatch({ type: "PICK_PACK", packId: pack.id })}
                  />
              ))}
            </div>
          </div>
        ) : null}

        {/* vibe */}
        {state.step === "S2_VIBE_PICK" ? (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
            <div className="text-center text-2xl font-black text-indigo-900">🎨 定个基调</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BigCard emoji="😎" title="酷炫" subtitle="大片感 / 史诗级" onClick={() => dispatch({ type: "PICK_VIBE", vibe: "cool" })} />
              <BigCard emoji="😄" title="搞怪" subtitle="脑洞大开 / 有趣" onClick={() => dispatch({ type: "PICK_VIBE", vibe: "fun" })} />
              <BigCard emoji="🍵" title="治愈" subtitle="安静 / 专注" onClick={() => dispatch({ type: "PICK_VIBE", vibe: "calm" })} />
              <BigCard emoji="🏆" title="硬核" subtitle="成就感 / 挑战" onClick={() => dispatch({ type: "PICK_VIBE", vibe: "achievement" })} />
            </div>
          </div>
        ) : null}

        {/* deliverable */}
        {state.step === "S3_DELIVERABLE_PICK" ? (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
            <div className="text-center text-2xl font-black text-indigo-900">📦 最后做成什么？</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BigCard emoji="🪪" title="创意卡片" subtitle="单页设计 / 人物卡" onClick={() => dispatch({ type: "PICK_DELIVERABLE", deliverable: "card" })} />
              <BigCard emoji="📖" title="微小说" subtitle="短篇故事大纲" onClick={() => dispatch({ type: "PICK_DELIVERABLE", deliverable: "story" })} />
              <BigCard emoji="🎮" title="游戏策划" subtitle="核心玩法 (无代码)" onClick={() => dispatch({ type: "PICK_DELIVERABLE", deliverable: "game_concept" })} />
              <BigCard emoji="🔎" title="微调查" subtitle="小实验 / 探究" onClick={() => dispatch({ type: "PICK_DELIVERABLE", deliverable: "mini_research" })} />
            </div>
          </div>
        ) : null}

        {/* missions loading */}
        {state.step === "S4_MISSION_LOADING" ? (
          <div className="w-full max-w-2xl text-center animate-fade-in-up">
            {state.loading ? (
                <div className="rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-md p-10 animate-pulse shadow-xl">
                     <div className="text-3xl font-black text-indigo-300 mb-2">🎁 正在生成任务...</div>
                     <div className="text-gray-500 font-medium">正在混合你的灵感贴纸。</div>
                </div>
            ) : (
                <div className="rounded-[2rem] border border-red-100 bg-red-50/90 backdrop-blur-md p-10 shadow-xl">
                    <div className="text-3xl font-black text-red-400 mb-2">😵 生成失败了</div>
                    <div className="text-red-700 font-medium mb-6">可能是网络开小差了，再试一次？</div>
                    <button 
                        onClick={() => dispatch({ type: "REQUEST_MISSIONS" })}
                        className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 mx-auto transition shadow-lg shadow-red-200"
                    >
                        <RefreshCw size={20} /> 重试
                    </button>
                </div>
            )}
          </div>
        ) : null}

        {/* missions choose */}
        {state.step === "S5_MISSION_CHOOSE" && preset ? (
          <div className="w-full max-w-3xl">
             <MissionCards
                cards={state.missionCards}
                shuffleEnabled={state.runtimeConfig?.showShuffle ?? preset.showShuffle}
                onShuffle={() => {
                dispatch({ type: "SHUFFLE_MISSIONS" });
                dispatch({ type: "REQUEST_MISSIONS" });
                }}
                onPick={(id) => dispatch({ type: "PICK_MISSION", id })}
            />
          </div>
        ) : null}

        {/* twist (optional) */}
        {state.step === "S6_TWIST" && preset ? (
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-md p-8 space-y-6 animate-fade-in-up shadow-xl">
            <div>
              <div className="text-2xl font-black text-indigo-900">✨ 魔改一下 (可选)</div>
              <div className="text-gray-600 font-medium">一句话搞定，不填也行。</div>
            </div>
            <input
              value={state.twistLine}
              onChange={(e) => dispatch({ type: "SET_TWIST_LINE", text: e.target.value })}
              className="w-full rounded-2xl border-2 border-white/50 bg-white/80 p-4 text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
              placeholder="比如：发生在我的学校 / 变成搞笑风 / 加个反转..."
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={() => dispatch({ type: "CONTINUE_AFTER_TWIST" })}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                继续 ➜
              </button>
              <button
                onClick={() => dispatch({ type: "CONTINUE_AFTER_TWIST" })}
                className="px-6 py-4 rounded-2xl border-2 border-white/50 bg-white/40 hover:bg-white text-gray-600 font-bold transition"
              >
                跳过
              </button>
            </div>
          </div>
        ) : null}

        {/* scope */}
        {state.step === "S7_SCOPE_PICK" ? (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in-up">
            <div className="text-center text-2xl font-black text-indigo-900">📏 大概要做多久？</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BigCard emoji="🧃" title={SCOPE_MAP.S.label} subtitle={SCOPE_MAP.S.desc} onClick={() => dispatch({ type: "PICK_SCOPE", scope: "S" })} />
              <BigCard emoji="🍱" title={SCOPE_MAP.M.label} subtitle={SCOPE_MAP.M.desc} onClick={() => dispatch({ type: "PICK_SCOPE", scope: "M" })} />
              <BigCard emoji="🎂" title={SCOPE_MAP.L.label} subtitle={SCOPE_MAP.L.desc} onClick={() => dispatch({ type: "PICK_SCOPE", scope: "L" })} />
            </div>
          </div>
        ) : null}

        {/* output */}
        {state.step === "S8_OUTPUT" && preset ? (
          state.projectCharter ? (
            <OutputCard
              title={preset.terminology.outputName}
              json={{
                stage: 1,
                warmup: warmupProfile,
                mode: state.mode,
                selections: {
                  vibe: state.vibe,
                  deliverable: state.deliverable,
                  scope: state.scope ?? preset.defaultScopeForKnow
                },
                chosenMissionId: state.chosenMissionId,
                twistLine: state.twistLine,
                project_card: state.projectCharter
              }}
              onReset={() => dispatch({ type: "RESET" })}
              onNextStage={onComplete ? () => {
                if (state.projectCharter) {
                  onComplete({
                    mission_name: state.projectCharter.mission_name,
                    project_sentence: state.projectCharter.project_sentence
                  });
                }
              } : undefined}
            />
          ) : (
             <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-md p-10 text-center animate-pulse shadow-xl">
                <div className="text-3xl font-black text-indigo-300 mb-2">✨ 正在生成卡片...</div>
                <div className="text-gray-500 font-medium">正在打包你的灵感项目。</div>
            </div>
          )
        ) : null}
      </div>

      {/* Help Me Floating Button */}
      {state.supportProfile && (state.step === "S5_MISSION_CHOOSE" || state.step === "S6_TWIST") && (
        <>
            <button 
                onClick={() => setHelpOpen(true)}
                className="fixed bottom-6 right-6 bg-white border border-indigo-100 shadow-xl rounded-full px-5 py-3 flex items-center gap-2 text-indigo-700 font-bold hover:scale-105 transition-transform z-40"
            >
                <LifeBuoy size={20} />
                帮我一下
            </button>
            <HelpDrawer 
                profile={state.supportProfile} 
                isOpen={helpOpen} 
                onClose={() => setHelpOpen(false)} 
            />
        </>
      )}

    </div>
  );
}