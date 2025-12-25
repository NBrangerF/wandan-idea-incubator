# 完蛋！我被好想法包围了！

> **一站式灵感孵化器** — 从模糊想法到可执行逻辑地图

这是一个整合了 **Stage 1 灵感孵化** 和 **Stage 2 灵感模拟** 的统一应用。

---

## 🎯 产品概述

```
用户灵感 → Stage 1 (灵感孵化) → Stage 2 (逻辑推演) → 可执行计划
```

### Stage 1: 灵感孵化

帮助用户从零开始生成创意项目想法：

- 状态热身（能量/帮助偏好/挑战意愿）
- 难度模式选择
- 风格/交付物选择
- AI 生成任务盲盒
- 最终输出：`ProjectCharter`（项目卡片）

### Stage 2: 灵感模拟

将模糊想法转化为逻辑依赖图：

- 逆向 Backcasting 逻辑推演
- 节点/边可视化 (ReactFlow)
- AI 辅助逐步构建逻辑地图
- 导出 PNG/PDF/JSON

---

## 🏗️ 技术架构

```
final wandan/
├── combined/                    # 统一入口 (本项目)
│   ├── App.tsx                  # CombinedApp - 状态机管理 Stage 切换
│   ├── index.html               # 包含所有样式资源
│   ├── index.tsx                # React 入口
│   ├── vite.config.ts           # Vite 配置 + 路径别名
│   └── package.json             # 统一依赖管理
│
├── stage 1 idea lab/            # Stage 1 原始代码
│   └── idea-lab_-project-charter/
│       ├── App.tsx              # 添加 onComplete 回调
│       ├── stage1/              # 核心逻辑
│       │   ├── flow.ts          # 状态机定义
│       │   ├── prompts.ts       # AI 提示词
│       │   └── reducer.ts       # 状态管理
│       └── services/
│           └── geminiService.ts # Gemini API 调用
│
├── stage 2 idea simulation/     # Stage 2 原始代码
│   ├── App.tsx                  # 添加 initialBrief + onBack props
│   ├── prompts.ts               # AI 提示词 (未修改)
│   ├── store.ts                 # Zustand 状态管理
│   ├── components/
│   │   ├── LogicCanvas.tsx      # ReactFlow 画布
│   │   ├── TopBar.tsx           # 顶部栏 + 新建项目
│   │   ├── ConfirmModal.tsx     # 自定义确认对话框
│   │   └── ...
│   └── geminiService.ts         # Gemini API 调用
│
└── node_modules -> combined/node_modules  # 符号链接
```

---

## 🔗 Stage 集成方案

### 核心数据流

```typescript
// Stage 1 输出
interface Stage1Output {
  mission_name: string; // → Stage 2 title
  project_sentence: string; // → Stage 2 description
}

// Stage 2 输入
interface Stage2InitialBrief {
  title: string;
  description: string;
}
```

### 修改点

| 文件               | 修改内容                                        |
| ------------------ | ----------------------------------------------- |
| `stage1/App.tsx`   | 添加可选 `onComplete` prop + "进入灵感模拟"按钮 |
| `stage2/App.tsx`   | 添加可选 `initialBrief` + `onBack` props        |
| `combined/App.tsx` | 状态机管理 `currentStage` 切换                  |

### 设计原则

- ✅ **Stage 2 的 `prompts.ts` 未修改** — 保持 AI 逻辑独立
- ✅ **两个应用仍可独立运行** — props 都是可选的
- ✅ **最小侵入性** — 仅在 UI 层添加桥接逻辑

---

## 🛠️ 技术栈

| 技术                      | 用途               |
| ------------------------- | ------------------ |
| **React 18**              | UI 框架            |
| **Vite 6**                | 构建工具           |
| **TypeScript**            | 类型安全           |
| **Zustand**               | 状态管理 (Stage 2) |
| **ReactFlow**             | 节点图可视化       |
| **TailwindCSS**           | 样式 (CDN)         |
| **Gemini API**            | AI 对话            |
| **html-to-image / jsPDF** | 导出功能           |

---

## 🚀 快速开始

### 环境准备

```bash
cd combined
npm install
```

### 配置 API Key

编辑 `.env.local`:

```env
VITE_API_KEY=你的_Gemini_API_Key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

---

## 📁 关键文件说明

### combined/App.tsx

统一入口，管理 Stage 切换状态：

```typescript
const CombinedApp = () => {
  const [currentStage, setCurrentStage] = useState<1 | 2>(1);
  const [stage1Output, setStage1Output] = useState(null);

  // Stage 1 完成 → 切换到 Stage 2
  const handleStage1Complete = (output) => {
    setStage1Output(output);
    setCurrentStage(2);
  };

  // 渲染对应 Stage
  if (currentStage === 1) {
    return <Stage1App onComplete={handleStage1Complete} />;
  }
  return <Stage2AppContent initialBrief={...} onBack={...} />;
};
```

### components/ConfirmModal.tsx

自定义确认对话框，解决原生 `confirm()` 被 React 重渲染打断的问题：

```typescript
<ConfirmModal
  isOpen={showModal}
  title="开启新项目"
  message="确定要开启新项目吗？当前进度将丢失。"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  variant="warning"
/>
```

---

## 🔧 常见问题

### 问：样式丢失/字体不正确？

确保 `combined/index.html` 包含：

- TailwindCSS CDN
- Google Fonts (Quicksand, Noto Sans SC)
- ReactFlow stylesheet

### 问：依赖无法解析？

项目使用符号链接共享 `node_modules`：

```bash
cd "final wandan"
ln -sfn combined/node_modules node_modules
```

### 问："新建项目"对话框闪退？

已通过 `ConfirmModal` 自定义组件修复。

---

## 📄 开源协议

MIT
