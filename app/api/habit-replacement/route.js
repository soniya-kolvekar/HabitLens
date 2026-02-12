import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const { habit } = await req.json();

        // 1. Collect all potential API keys from the environment
        // Prioritizing GEMINI_API_KEY3 as requested by user
        const potentialKeys = [
            process.env.GEMINI_API_KEY3,
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY2,
            process.env.NEXT_PUBLIC_GEMINI_API_KEY
        ].filter(key => key && key.length > 10);

        console.log(`API: Loading... Found ${potentialKeys.length} potential keys.`);

        // Debug which vars are present (safe logging)
        console.log("API: Env Vars present:", {
            GEMINI_API_KEY3: !!process.env.GEMINI_API_KEY3,
            GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
            GEMINI_API_KEY2: !!process.env.GEMINI_API_KEY2,
        });

        if (potentialKeys.length === 0) {
            console.error("API Error: No valid API Keys found.");
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

        // 2. Prioritize STABLE models (1.5 Flash is most reliable)
        // 2.0-flash caused "Model Not Found" for this specific API Key so we removed it
        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];

        let finalData = null;
        let lastError = null;

        // 3. Robust Double Loop
        for (let k = 0; k < potentialKeys.length; k++) {
            const apiKey = potentialKeys[k];
            const genAI = new GoogleGenerativeAI(apiKey);

            console.log(`API: Trying Key #${k + 1} (...${apiKey.slice(-4)})`);

            for (const modelName of models) {
                try {
                    console.log(`  -> Model ${modelName}...`);

                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { responseMimeType: "application/json" }
                    });

                    const result = await model.generateContent(promptText);
                    const response = await result.response;
                    const text = response.text();

                    if (!text) throw new Error("No text content");

                    // Clean JSON
                    const cleanJson = text.replace(/```json|```/g, "").trim();
                    const firstOpen = cleanJson.indexOf('{');
                    const lastClose = cleanJson.lastIndexOf('}');
                    let jsonString = (firstOpen !== -1 && lastClose !== -1)
                        ? cleanJson.substring(firstOpen, lastClose + 1)
                        : cleanJson;

                    finalData = JSON.parse(jsonString);

                    if (finalData.replacement) {
                        console.log(`API: SUCCESS (Key #${k + 1}, ${modelName})`);
                        break;
                    }

                } catch (e) {
                    console.warn(`  -> Failed: ${e.message}`);
                    lastError = e;
                    if (e.message.includes("429")) await delay(1000);
                }
            }
            if (finalData) break;
        }

        if (!finalData) {
            // Extract the most meaningful error message
            const errorMessage = lastError?.message || "Unknown Error";
            let userFriendlyError = "High Traffic / API Error";

            if (errorMessage.includes("403")) userFriendlyError = "Invalid API Key (Key Revoked)";
            if (errorMessage.includes("429")) userFriendlyError = "Rate Limit Exceeded";
            if (errorMessage.includes("404")) userFriendlyError = "Model Not Found (Check API Access)";

            console.error("API: Valid Failure.", lastError);

            throw new Error(`${userFriendlyError}: ${errorMessage}`);
        }

        return NextResponse.json(finalData);

    } catch (error) {
        console.error("Gemini Critical Error:", error);

        // Return the ACTUAL error to the UI so the user can see it
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
