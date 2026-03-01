const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Please provide your Groq API key: node list_groq_models.mjs YOUR_GROQ_KEY");
    process.exit(1);
}

async function listGroqModels() {
    const url = 'https://api.groq.com/openai/v1/models';
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        if (data.data) {
            console.log("Available Groq Models:");
            data.data.forEach(model => {
                console.log(`- ${model.id}`);
            });
        } else {
            console.log("Error response:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listGroqModels();
