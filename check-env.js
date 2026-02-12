const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkEnv() {
    console.log("--- DIAGNOSTIC START ---");

    // 1. Manually read .env.local because purely running 'node' might not load it automatically like Next.js does
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = "";
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log("✅ .env.local file found.");
    } catch (e) {
        console.error("❌ .env.local file NOT found at: " + envPath);
        return;
    }

    // 2. Parse for GEMINI_API_KEY3
    const key3Match = envContent.match(/GEMINI_API_KEY3=(AIza[a-zA-Z0-9_\-]+)/);
    const key1Match = envContent.match(/GEMINI_API_KEY=(AIza[a-zA-Z0-9_\-]+)/);

    let activeKey = null;

    if (key3Match) {
        console.log("✅ GEMINI_API_KEY3 found: " + key3Match[1].slice(0, 10) + "...");
        activeKey = key3Match[1];
    } else {
        console.log("❌ GEMINI_API_KEY3 NOT found in .env.local");
    }

    if (key1Match) {
        console.log("ℹ️  GEMINI_API_KEY found: " + key1Match[1].slice(0, 10) + "...");
        if (!activeKey) activeKey = key1Match[1];
    }

    if (!activeKey) {
        console.error("❌ No valid API keys starting with 'AIza' found.");
        return;
    }

    // 3. List available models
    console.log("\nListing available models for this key...");
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const models = data.models || [];

        console.log(`✅ Found ${models.length} accessible models:`);
        models.forEach(m => console.log(` - ${m.name.replace('models/', '')}`));

        if (models.some(m => m.name.includes('gemini-1.5-flash'))) {
            console.log("\n✅ gemini-1.5-flash IS available.");
        } else {
            console.log("\n⚠️ gemini-1.5-flash is NOT in the list.");
        }

    } catch (error) {
        console.error("❌ Model List FAILED:");
        console.error(error.message);
    }
    console.log("--- DIAGNOSTIC END ---");
}

checkEnv();
