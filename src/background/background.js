import { GeminiProvider } from '../utils/geminiProvider.js';
import { GroqProvider } from '../utils/groqProvider.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "tailorResume") {
        handleTailoring(request.data).then(sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleTailoring(data) {
    const { resumeText, jobDescription, config } = data;

    try {
        let provider;
        if (config.provider === 'gemini') {
            provider = new GeminiProvider(config.apiKey, config.modelName || 'gemini-2.0-flash-lite');
        } else if (config.provider === 'groq') {
            provider = new GroqProvider(config.apiKey, config.modelName || 'llama-3.3-70b-versatile');
        } else {
            throw new Error("Unsupported AI Provider");
        }

        const [tailoredResume, coverLetter, scoreData] = await Promise.all([
            provider.generateTailoredResume(resumeText, jobDescription),
            provider.generateCoverLetter(resumeText, jobDescription),
            provider.calculateMatchScore(resumeText, jobDescription)
        ]);

        // Save to history
        const historyItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            jobTitle: "Potential Match", // In a real app, we'd extract this too
            score: scoreData.score,
            tailoredResume,
            coverLetter
        };

        const { history = [] } = await chrome.storage.local.get('history');
        history.unshift(historyItem);
        await chrome.storage.local.set({ history });

        return { success: true, tailoredResume, coverLetter, score: scoreData.score };
    } catch (error) {
        console.error("Tailoring error:", error);
        return { success: false, error: error.message };
    }
}
