async function listModelsRaw() {
    const API_KEY = "AIzaSyB9RQYngQsh7bOAGkqYty9oqWGJwIuciXU";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    console.log(`Checking models at: ${url.replace(API_KEY, "HIDDEN_KEY")}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response body:", text);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found in response.");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

listModelsRaw();
