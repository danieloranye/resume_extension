import { AIProvider } from './aiProvider.js';

export class GeminiProvider extends AIProvider {
    constructor(apiKey, modelName = 'gemini-2.0-flash-lite') {
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
You are an expert resume optimization assistant.

Given:
1. The original resume
2. The job description

Your task:
- Re-align the resume to closely match the job description.
- Strengthen alignment between existing skills and job requirements.
- Rephrase bullet points to better reflect relevant competencies.
- Emphasize transferable skills where applicable.
- Improve impact using action verbs and measurable results where logically supported by the original content.
- Incorporate relevant keywords from the job description naturally.
- You may embellish the experiences in the original resume or subtly sprinkle experiences/keywords that match the job description requirements  

IMPORTANT RULES:
- Do NOT fabricate new job roles, employers, dates, certifications, or major experiences.
- Do NOT invent qualifications that are not supported by the original resume.
- You may rephrase, restructure, and clarify existing content for stronger alignment.
- Maintain factual integrity.

ATS REQUIREMENTS:
- Use standard section headings (SUMMARY, SKILLS, EXPERIENCE, EDUCATION).
- No tables, columns, graphics, or special formatting.
- Use clean, plain text formatting.
- Maintain reverse chronological order.
- Avoid overly creative language.

OUTPUT REQUIREMENTS:
- Return the optimized resume only.
- Do not include commentary, explanations, or analysis.
- Do not include markdown formatting.

==============================
Original Resume:
${originalResume}

Job Description:
${jobDescription}
        `;
        return this.#callGemini(prompt);
    }

    async generateCoverLetter(originalResume, jobDescription) {
        const prompt = `
You are a professional career writing assistant.

Given:
1. The candidate’s original resume
2. The job description

Your task:
Generate a tailored, professional cover letter that aligns the candidate’s existing experience and skills with the job requirements.

INSTRUCTIONS:
- Highlight the most relevant qualifications from the resume that match the job description.
- Emphasize measurable impact where supported by the resume.
- Demonstrate understanding of the role’s responsibilities.
- Show enthusiasm for the position and company.
- Maintain factual accuracy. Do NOT fabricate experiences, employers, certifications, or achievements.
- Use transferable skills where direct experience is limited.

STYLE REQUIREMENTS:
- Professional, confident, and concise tone.
- Avoid generic phrases (e.g., “I am writing to apply…” unless used naturally).
- Avoid repeating the resume word-for-word.
- Avoid exaggerated claims.
- Avoid overly casual or overly formal language.

STRUCTURE:
1. Opening paragraph:
   - Express interest in the role
   - Briefly mention strongest relevant qualification

2. Body paragraph(s):
   - Connect 2–3 key job requirements to resume experience
   - Provide evidence of impact

3. Closing paragraph:
   - Reinforce interest
   - Express readiness to contribute
   - Professional sign-off tone

LENGTH:
- 210 words
- 3–4 paragraphs maximum

OUTPUT REQUIREMENTS:
- Return only the final cover letter text.
- Do not include commentary, explanations, or formatting instructions.
- Do not use markdown or special formatting.

==============================
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
