
import { GoogleGenAI, Type } from "@google/genai";
import { LLMResponse, StudentProfile, ProjectBrief, LogicMap, Level, Mode } from "./types";
import { STAGE3_SYSTEM_PROMPT, STAGE3_FEWSHOTS } from "./prompts";

export async function stepSimulation(
  profile: StudentProfile,
  brief: ProjectBrief,
  logicMap: LogicMap,
  level: Level,
  mode: Mode,
  message: string
): Promise<LLMResponse> {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your environment.");
  }


  const ai = new GoogleGenAI({ apiKey });
  
  const prunedMap = {
    nodes: logicMap.nodes.map(n => ({ 
      id: n.id, 
      title: n.title, 
      type: n.type, 
      lane: n.ui.lane, 
      rank: n.ui.rank,
      done: n.done
    })),
    edges: logicMap.edges.map(e => ({ 
      id: e.id, 
      from: e.from, 
      to: e.to,
      relation_type: e.relation_type,
      label: e.label
    }))
  };

  const contents = [
    ...STAGE3_FEWSHOTS.map(shot => ({
      role: shot.role === 'user' ? 'user' : 'model',
      parts: [{ text: shot.content }]
    })),
    {
      role: 'user',
      parts: [{
        text: `
          PROFILE: ${JSON.stringify(profile)}
          BRIEF: ${JSON.stringify(brief)}
          MAP: ${JSON.stringify(prunedMap)}
          LEVEL: ${level}
          MODE: ${mode}
          USER: "${message}"
        `
      }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: STAGE3_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        maxOutputTokens: 15000,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text || "";
    if (!text) throw new Error("Empty response from model");

    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        say: parsed.say || "正在分析逻辑...",
        mode: parsed.mode || mode,
        integrity: parsed.integrity || 'stable',
        operations: Array.isArray(parsed.operations) ? parsed.operations : [],
        prompt_user: parsed.prompt_user || "",
        choices: Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [],
        microtask: parsed.microtask,
        progress: typeof parsed.progress === 'number' ? parsed.progress : undefined
      };
    } catch (parseError) {
      console.error("Parse Error:", parseError, "Raw:", text);
      throw new Error("无法解析思维引擎的反馈，请重试。");
    }
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(err.message || "通信故障，请检查网络连接。");
  }
}
