# Stage 1 · 灵感实验室（Idea → Mission → Project Card）

Stage 1 的目标：**在不吓到初中生的前提下**，用“轻量对话 + 纯点击”为主的流程，让学生从模糊兴趣出发，生成一个**可开始的小项目方向**（Mission Cards），并最终落到一张**项目卡（Project Card / Charter）**，用于进入后续 Stage。

> 设计原则：最大自主（学生选出来）+ 最小 intimidation（不要求长写作、细节剧情、复杂机制）+ ZPD（新手也能做）。

---

## 1) 用户流程（State Machine）

Stage 1 是一个明确的**状态机**（Reducer 驱动），核心步骤在 `stage1/flow.ts` 定义：

- `S0_WARMUP`：轻量热身（元认知 priming，不做规划）
- `S1_MODE_PICK`：选择模式（难度/引导强度）
- `S2_VIBE_PICK`：选 vibe（可选，取决于 runtime config）
- `S2_PACK_PICK`：Lite 路径专用的“任务包”选择（固定 vibe + deliverable）
- `S3_DELIVERABLE_PICK`：选产出类型（可选）
- `S4_MISSION_LOADING`：生成 Mission Cards（调用 LLM）
- `S5_MISSION_CHOOSE`：学生选一个 Mission
- `S6_TWIST`：可选输入一句“扭转/偏好”（semi/know 才有）
- `S7_SCOPE_PICK`：可选 scope（S/M/L）
- `S8_OUTPUT`：生成最终 Project Card（调用 LLM）

✅ 这些 step 的跳转逻辑集中在：
- `stage1/flow.ts`：`nextAfterMode / nextAfterVibe / nextAfterDeliverable / nextAfterPickMission / nextAfterTwist / nextAfterScope`
- `stage1/reducer.ts`：对应 action 执行跳转（PICK_MODE / PICK_VIBE / PICK_DELIVERABLE / PICK_MISSION / CONTINUE_AFTER_TWIST / PICK_SCOPE）

---

## 2) 三层“引导强度”：Mode + Support Profile + Runtime Config

### 2.1 Mode（学生显式选择）
`Stage1Mode = "guided" | "semi" | "know"`

在 `stage1/flow.ts` 的 `STAGE1_PRESETS`：
- `guided`：最保姆，纯点击为主
- `semi`：半自助，允许 twist 输入
- `know`：极速，跳过 vibe/deliverable 选择，直接生成（cardsPerBatch 也更少）

### 2.2 Support Profile（由 warmup 推导，学生无需懂）
由 `deriveSupportProfile(warmup)` 推导得到：
- `tier: lite | standard | boost`
- `helpUI: hint | example | steps`
- `effortMode: easyWins | steady | challenge`

目的：**对同一套 Stage 1 流程做“自动适配”**（句子更短、更像 easy win、或允许更大胆的约束）。

### 2.3 Runtime Config（最终运行时开关）
`getRuntimeConfig(mode, profile)` 决定是否：
- 跳过 vibe/deliverable（lite 会 skip）
- 是否显示 scope pick / twist input
- 每批 cards 数量（lite 会降到 2）
- 是否进入 mission pack（lite 走 pack pick）

---

## 3) LLM 合约（非常重要：JSON ONLY）

Stage 1 与 LLM 的通信协议在 `stage1/prompts.ts`：

### 3.1 响应类型
`Stage1LLMResponse` 是一个 union：
- `kind: "missions"` → 返回 mission cards
- `kind: "charter"` → 返回 project card（project_charter）

> 强约束：**必须返回纯 JSON**，不能 markdown。调用端也会用 `responseMimeType: "application/json"` 约束。

### 3.2 Mission Cards schema（kind="missions"）
每张卡必须包含：
- `title`：卡片标题（中文）
- `one_liner`：一句话描述
- `constraint`：一个“简单约束”
- `suggested_skills`：建议技能（仅提示，不要求掌握）
- `micro_try_prompt`：必须是 `choose_one` 且 **刚好 3 个选项（tap-only）**

### 3.3 Project Card schema（kind="charter"）
`project_charter` 必须包含：
- `mission_name`
- `project_sentence`
- `why_now`（枚举）
- `audience`
- `deliverable`（中文表述即可）
- `constraint`
- `scope_level`（S/M/L）
- `success_check`
- `needed_superpower`（1–3）
- `first_small_step`（<10min；lite 甚至 2min）

---

## 4) 关键文件说明（你要改 Stage 1 就改这些）

### `stage1/flow.ts`
- Stage1 的“导航规则/预设/适配逻辑”
- 你会最常改：
  - `STAGE1_PRESETS`：不同 mode 的流程开关、cards 数、术语
  - `MISSION_PACKS`：Lite 模式的一键任务包（固定 vibe + deliverable）
  - `deriveSupportProfile` / `getRuntimeConfig`：warmup → 支持力度 → UI/流程开关

### `stage1/reducer.ts`
- Stage1 状态机与 action
- 你会最常改：
  - 新增/删除 step 时，这里要同步
  - “BACK” 回退历史逻辑（history stack）
  - 请求状态：`REQUEST_MISSIONS / MISSIONS_LOADED / REQUEST_CHARTER / CHARTER_LOADED / ERROR`

### `stage1/prompts.ts`
- **最重要**：系统提示词 + 两类 user prompt + JSON schema
- 你会最常改：
  - `buildStage1SystemPrompt()`：Stage 1 角色与硬规则（必须中文、必须 JSON、不要吓人）
  - `buildGenerateMissionsUserPrompt()`：生成卡片时的上下文（vibe/deliverable/supportProfile）
  - `buildFinalizeCharterUserPrompt()`：最终卡片汇总（选中的 mission + scope + twist）

### `services/geminiService.ts`
- Gemini 调用封装：`callStage1AI({system, user})`
- 当前使用：
  - `@google/genai`
  - `model: "gemini-3-flash-preview"`
  - `responseMimeType: "application/json"`
- 内置做了 **robust JSON extraction**（从 text 里截取 `{...}` 再 parse）

### `App.tsx`
- Stage 1 的 UI 与两段核心副作用：
  - 当 `step === "S4_MISSION_LOADING"` → 调 `buildStage1SystemPrompt + buildGenerateMissionsUserPrompt` → `callStage1AI` → `MISSIONS_LOADED`
  - 当 `step === "S8_OUTPUT"` 且无 charter → 调 `buildFinalizeCharterUserPrompt` → `callStage1AI` → `CHARTER_LOADED`

---

## 5) 本地运行（通用说明）

> 具体脚手架（Vite/Next/CRA）以你的仓库为准；这里给“通用 checklist”。

1. 安装依赖  
   - 需要确保安装了 `@google/genai`
2. 配置环境变量  
   - 当前代码读取：`process.env.API_KEY`
3. 启动开发服务  
   - `npm run dev` 或 `npm start`

### 常见坑：`process.env.API_KEY` 在前端拿不到
如果你把代码搬到另一个 IDE/脚手架（尤其是 Vite），前端默认不会注入 `process.env`。你有两种选择：

- **方案 A（推荐，最稳）**：把 Gemini 调用挪到服务端（API route / server function），前端只请求你自己的 `/api/stage1`
- **方案 B（快速原型）**：改为 `import.meta.env.VITE_API_KEY` 并按 Vite 规则放到 `.env`（仅适合 demo，生产不安全）

---

## 6) 安全提示（非常重要）
当前实现如果直接在浏览器调用 Gemini，会把 `API_KEY` 暴露给客户端用户。

如果要上线/开放给学生使用，请务必：
- 把 `callStage1AI` 放到服务端（Cloud Function / API Route）
- 在服务端做限流、审计、内容安全与成本控制

---

## 7) 如何扩展 Stage 1（最常见需求）

- 想增加“更快 / 更慢”的路径：
  - 改 `STAGE1_PRESETS` + `getRuntimeConfig`
- 想让 Lite 更像“抽卡选包”：
  - 改 `MISSION_PACKS`
- 想强化“tap-only，不用打字”：
  - 在 `buildStage1SystemPrompt` 强化 hard rules
  - 在 reducer 里减少需要输入的 step（例如禁用 twist）
- 想把 Mission Cards 的质量做得更稳：
  - 在 `schemaMissionsJSON()` 增加更严格字段说明
  - 在 `normalizeMissionCards()` 做兜底（App.tsx 已有基础兜底）

---

## 8) 快速自测（推荐）
- guided / semi / know 各走一遍
- 检查每次 LLM 返回是否满足：
  - `kind` 正确（missions/charter）
  - `micro_try_prompt.options` 恰好 3 个
  - 文案中文、短、低压力
  - `first_small_step` < 10 分钟（lite 越短越好）
