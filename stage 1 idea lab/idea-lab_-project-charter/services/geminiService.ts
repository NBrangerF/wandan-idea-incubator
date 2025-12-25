import { GoogleGenAI } from "@google/genai";
import { Stage1LLMResponse } from "../stage1/prompts";

const getAI = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};


export const callStage1AI = async (
  payload: { system: string; user: string }
): Promise<Stage1LLMResponse> => {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: payload.user,
      config: {
        systemInstruction: payload.system,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Robust JSON extraction
    // 1. Try removing markdown code blocks
    let cleanedText = text.replace(/```json|```/g, "").trim();
    
    // 2. If it still looks like it has garbage, find the first '{' and last '}'
    const firstOpen = cleanedText.indexOf('{');
    const lastClose = cleanedText.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        cleanedText = cleanedText.substring(firstOpen, lastClose + 1);
    }
    
    // Parse JSON
    const data = JSON.parse(cleanedText);
    return data as Stage1LLMResponse;
  } catch (error) {
    console.error("Error calling Stage 1 AI:", error);
    throw error;
  }
};