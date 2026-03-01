const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Please provide your API key as an argument: node list_models.js YOUR_API_KEY");
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(model => {
                console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("Error response:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
