import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { activity } = await req.json();

    const potentialKeys = [
      process.env.GEMINI_API_KEY3,
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    ].filter(key => key && key.length > 10);



    if (potentialKeys.length === 0) {
      throw new Error("No API Keys found in .env.local");
    }

    const prompt = `
      Analyze the health risk of: "${activity}".
      Return ONLY valid JSON in this format:
      {
        "riskLevel": "Low" or "Medium" or "High",
        "shortTerm": ["Immediate impact 1", "Immediate impact 2"],
        "longTerm": ["Long term consequence 1", "Long term consequence 2"],
        "healthScore": 0-100 (integer)
      }
    `;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
    let finalData = null;
    let lastError = null;

    for (let k = 0; k < potentialKeys.length; k++) {
      const apiKey = potentialKeys[k];
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          if (!text) throw new Error("No text response");

          const cleanJson = text.replace(/```json|```/g, "").trim();

          try {
            finalData = JSON.parse(cleanJson);
          } catch (e) {
            continue;
          }

          if (finalData.riskLevel) {
            break;
          }
        } catch (e) {
          lastError = e;
          if (e.message.includes("429")) await delay(1000);
        }
      }
      if (finalData) break;
    }

    if (!finalData) {
      throw lastError || new Error("All models provided by keys failed");
    }

    return NextResponse.json(finalData);

  } catch (error) {
    let errorMsg = "AI Service Unavailable";
    const msg = error.message.toLowerCase();

    if (msg.includes("403") || msg.includes("leaked") || msg.includes("permission")) {
      errorMsg = "Invalid API Key (Key Revoked/Leaked)";
    } else if (msg.includes("429") || msg.includes("quota")) {
      errorMsg = "Rate Limit Exceeded";
    } else if (msg.includes("not found")) {
      errorMsg = "Model Not Found (Key lacks access)";
    } else if (msg.includes("no api keys")) {
      errorMsg = "Missing API Key in .env.local";
    } else {
      errorMsg = error.message.replace("GoogleGenerativeAI Error:", "").slice(0, 50);
    }

    return NextResponse.json({
      riskLevel: "Error",
      shortTerm: [`Error: ${errorMsg}`],
      longTerm: ["Check Server Logs"],
      healthScore: 0
    });
  }
}