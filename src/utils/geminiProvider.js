import { AIProvider } from './aiProvider.js';

export class GeminiProvider extends AIProvider {
    constructor(apiKey, modelName = 'gemini-2.0-flash') {
        super();
        this.apiKey = apiKey;
        this.modelName = modelName;
        // Use v1beta for better model coverage, fall back to v1 if needed
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    }

    async #callGemini(prompt) {
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API Error: ${error.error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async generateTailoredResume(originalResume, jobDescription) {
        const prompt = `
            You are an expert career coach and ATS specialist. 
            Tailor the following resume to match the job description provided. 
            Ensure the output is ATS-compliant, highlights relevant keywords, and remains professional.
            
            Original Resume:
            ${originalResume}
            
            Job Description:
            ${jobDescription}
        `;
        return this.#callGemini(prompt);
    }

    async generateCoverLetter(originalResume, jobDescription) {
        const prompt = `
            Generate a personalized cover letter for the following resume and job description.
            The tone should be professional and enthusiastic.
            
            Resume:
            ${originalResume}
            
            Job Description:
            ${jobDescription}
        `;
        return this.#callGemini(prompt);
    }

    async calculateMatchScore(resumeText, jobDescription) {
        const prompt = `
            Analyze the following resume against the job description. 
            Provide a keyword match score from 0-100 and a brief list of missing keywords.
            Format your response as JSON: {"score": number, "missingKeywords": []}
            
            Resume:
            ${resumeText}
            
            Job Description:
            ${jobDescription}
        `;
        const result = await this.#callGemini(prompt);
        try {
            return JSON.parse(result.match(/\{.*\}/s)[0]);
        } catch (e) {
            return { score: 0, missingKeywords: [], error: "Failed to parse score" };
        }
    }
}
