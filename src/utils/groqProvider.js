import { AIProvider } from './aiProvider.js';

export class GroqProvider extends AIProvider {
    constructor(apiKey, modelName = 'llama-3.3-70b-versatile') {
        super();
        this.apiKey = apiKey;
        this.modelName = modelName;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }

    async #callGroq(messages) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: messages,
                temperature: 0.3
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async generateTailoredResume(originalResume, jobDescription) {
        const messages = [
            {
                role: "system",
                content: "You are an expert career coach and ATS specialist. Your goal is to tailor resumes to match job descriptions perfectly while maintaining professional integrity."
            },
            {
                role: "user",
                content: `Tailor this resume to match the job description provided. Ensure the output is ATS-compliant and highlights relevant keywords.

Original Resume:
${originalResume}

Job Description:
${jobDescription}`
            }
        ];
        return this.#callGroq(messages);
    }

    async generateCoverLetter(originalResume, jobDescription) {
        const messages = [
            {
                role: "system",
                content: "You are a professional resume writer. Write persuasive, personalized cover letters."
            },
            {
                role: "user",
                content: `Generate a personalized cover letter for the following resume and job description.
                
Resume:
${originalResume}

Job Description:
${jobDescription}`
            }
        ];
        return this.#callGroq(messages);
    }

    async calculateMatchScore(resumeText, jobDescription) {
        const messages = [
            {
                role: "system",
                content: "You are an ATS parser. Analyze the match between a resume and a job description."
            },
            {
                role: "user",
                content: `Analyze the following resume against the job description. 
                Provide a keyword match score from 0-100 and a brief list of missing keywords.
                Format your response as JSON: {"score": number, "missingKeywords": []}
                
Resume:
${resumeText}

Job Description:
${jobDescription}`
            }
        ];
        const result = await this.#callGroq(messages);
        try {
            // Try to extract JSON if there's surrounding text
            const jsonMatch = result.match(/\{.*\}/s);
            return JSON.parse(jsonMatch ? jsonMatch[0] : result);
        } catch (e) {
            console.error("Score parse error:", e, result);
            return { score: 0, missingKeywords: [], error: "Failed to parse score" };
        }
    }
}
