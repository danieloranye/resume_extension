import { GeminiProvider } from '../src/utils/geminiProvider.js';

async function testGeminiProvider() {
    const provider = new GeminiProvider("MOCK_KEY");

    // Test prompt generation by checking the private method or just the call
    console.log("Testing GeminiProvider logic...");

    const resume = "Software Engineer with 5 years of experience in React and Node.js.";
    const jd = "Exante360 is looking for a developer with Microsoft 365 and SharePoint experience.";

    try {
        // We'll mock the fetch globally for this test
        global.fetch = async (url, options) => {
            console.log("Intercepted Fetch URL:", url);
            const body = JSON.parse(options.body);
            console.log("Prompt Snippet:", body.contents[0].parts[0].text.substring(0, 100));

            return {
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: {
                            parts: [{ text: "Tailored Resume: ... Match Score: 85%" }]
                        }
                    }]
                })
            };
        };

        const result = await provider.generateTailoredResume(resume, jd);
        console.log("Success: Provider returned tailored resume.");

        // Test Score Extraction
        global.fetch = async () => ({
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: '{"score": 92, "missingKeywords": ["SharePoint"]}' }]
                    }
                }]
            })
        });

        const score = await provider.calculateMatchScore(resume, jd);
        console.log("Success: Parsed score:", score.score);

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testGeminiProvider();
