import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const { habit } = await req.json();
        const potentialKeys = [
            process.env.GEMINI_API_KEY3,
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY2,
            process.env.NEXT_PUBLIC_GEMINI_API_KEY
        ].filter(key => key && key.length > 10);

        console.log(`API: Loading... Found ${potentialKeys.length} potential keys.`);



        if (potentialKeys.length === 0) {
            return NextResponse.json(
                {
                    replacement: "Configuration Error: No API Keys found in .env.local",
                    plan: ["Check .env.local", "Restart Server", "Add GEMINI_API_KEY"],
                    microSteps: ["Missing Key", "No Env Var", "Server Restart Needed"]
                },
                { status: 200 }
            );
        }

        if (!habit) {
            return NextResponse.json(
                { error: "Habit is required" },
                { status: 400 }
            );
        }

        const promptText = `
      You are a habit replacement expert.
      For the negative habit: "${habit}", suggest:
      1. An easy replacement habit.
      2. A gradual improvement plan (3 distinct steps).
      3. 3 daily micro-steps to get started.

      Return ONLY valid JSON in this format:
      {
        "replacement": "Short description of replacement habit DO NOT USE MARKDOWN",
        "plan": ["Step 1 description", "Step 2 description", "Step 3 description"],
        "microSteps": ["Micro-step 1", "Micro-step 2", "Micro-step 3"]
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

                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { responseMimeType: "application/json" }
                    });

                    const result = await model.generateContent(promptText);
                    const response = await result.response;
                    const text = response.text();

                    if (!text) throw new Error("No text content");


                    const cleanJson = text.replace(/```json|```/g, "").trim();
                    const firstOpen = cleanJson.indexOf('{');
                    const lastClose = cleanJson.lastIndexOf('}');
                    let jsonString = (firstOpen !== -1 && lastClose !== -1)
                        ? cleanJson.substring(firstOpen, lastClose + 1)
                        : cleanJson;

                    finalData = JSON.parse(jsonString);

                    if (finalData.replacement) {
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
            const errorMessage = lastError?.message || "Unknown Error";
            let userFriendlyError = "High Traffic / API Error";

            if (errorMessage.includes("403")) userFriendlyError = "Invalid API Key (Key Revoked)";
            if (errorMessage.includes("429")) userFriendlyError = "Rate Limit Exceeded";
            if (errorMessage.includes("404")) userFriendlyError = "Model Not Found (Check API Access)";

            throw new Error(`${userFriendlyError}: ${errorMessage}`);
        }

        return NextResponse.json(finalData);

    } catch (error) {
        const cleanMsg = error.message.replace("GoogleGenerativeAI Error:", "").slice(0, 100);

        return NextResponse.json(
            {
                replacement: `AI Error: ${cleanMsg}`,
                plan: ["Check Console Logs", "Verify API Key", "Restart Server"],
                microSteps: ["Error 1", "Error 2", "Error 3"]
            },
            { status: 200 }
        );
    }
}
