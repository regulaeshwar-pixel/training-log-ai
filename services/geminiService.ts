
import { GoogleGenAI } from "@google/genai";
import { DailyEntry } from "../types";

export const getAIInsights = async (history: DailyEntry[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const recentHistory = history.slice(-7).map(e => ({
    date: e.date,
    xp: e.daily_xp,
    workout: e.workout_done,
    fuel: Object.values(e.meals).filter(Boolean).length
  }));

  const prompt = `Act as an elite performance coach for the Obsidian System. Analyze this training log and provide a short, stoic, high-impact insight (max 2 sentences).
  
  Log History: ${JSON.stringify(recentHistory)}
  
  Requirements:
  - Use an analytical, slightly cold, but deeply encouraging tone.
  - Focus on momentum, recovery debt, or friction.
  - If progress is good, acknowledge the infrastructure.
  - If progress is stalled, highlight the cost of negotiation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "External reinforcement offline. Rely on internal discipline.";
  }
};
