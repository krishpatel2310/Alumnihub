import ApiError from "../utils/ApiError.js";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const buildPrompt = ({ templateId, answers }) => {
    const {
        fullName,
        targetRole,
        email,
        phone,
        location,
        headline,
        summary,
        education,
        skills,
        projects,
        experience,
        linkedin,
        github
    } = answers;

    return `You are an expert professional resume writer and career coach. Your goal is to create a high-impact, ATS-optimized resume.

Template Style: ${templateId}

Candidate Information:
Full Name: ${fullName}
Target Role: ${targetRole}
Contact: ${email}, ${phone}, ${location}
Headline/Title: ${headline}
Summary/Objective: ${summary}
Education: ${education}
Skills: ${skills}
Projects: ${projects}
Experience: ${experience}
LinkedIn: ${linkedin}
GitHub: ${github}

INSTRUCTIONS:
1. **Summary**: Rewrite the summary to be professional, concise, and tailored to the target role.
2. **Experience**: Rewrite experience bullet points using strong **action verbs** (e.g., spearheaded, optimized, developed). Focus on **achievements and quantifiable results** (e.g., "Increased efficiency by 20%"). Remove passive language.
3. **Projects**: Convert project descriptions into achievement-based bullet points, highlighting the tech stack used.
4. **Skills**: Group and format skills logically (e.g., Languages, Frameworks, Tools).
5. **Formatting**: Ensure the output is strictly structured for the selected template style.
6. **No Fluff**: Keep content concise, professional, and free of buzzwords.

Return ONLY valid JSON in the following format:
{
  "name": "string",
  "headline": "string",
  "summary": "string",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "github": "string (optional)"
  },
  "skills": ["string array"],
  "education": [{"degree": "string", "institution": "string", "year": "string"}],
  "experience": [{"role": "string", "company": "string", "duration": "string", "bullets": ["string array"]}],
  "projects": [{"name": "string", "description": "string", "tech": ["string array"]}]
}

IMPORTANT: Return ONLY the JSON object. Do not include markdown formatting (like \`\`\`json), explanations, or any other text.`;
};

const cleanResponse = (content) => {
    if (!content) return "";
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    }
    return cleaned;
};

const generateWithOpenAI = async (prompt, model) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new ApiError(500, "OPENAI_API_KEY is not set");
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: model || "gpt-4o-mini",
            temperature: 0.3,
            messages: [
                { role: "system", content: "You are a professional resume writer. Always return valid JSON only, no extra text." },
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return cleanResponse(data.choices?.[0]?.message?.content);
};

const generateWithGroq = async (prompt, model) => {
    if (!process.env.GROQ_API_KEY) {
        throw new ApiError(500, "GROQ_API_KEY is not set");
    }
    // Groq API is compatible with OpenAI's API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: model || "llama-3.3-70b-versatile", // Valid Groq model
            temperature: 0.3,
            messages: [
                { role: "system", content: "You are a professional resume writer. Always return valid JSON only, no extra text." },
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return cleanResponse(data.choices?.[0]?.message?.content);
};

const generateWithGemini = async (prompt, model) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "GEMINI_API_KEY is not set");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const m = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });

    const result = await m.generateContent(prompt);
    const response = await result.response;
    return cleanResponse(response.text());
};

export const generateResumeContent = async ({ templateId, answers }) => {
    const prompt = buildPrompt({ templateId, answers });
    const provider = process.env.AI_PROVIDER?.toLowerCase() || "groq"; // Default to Groq if not specified
    const model = process.env.AI_MODEL;

    console.log(`Generating resume using provider: ${provider}`);

    try {
        let content;
        switch (provider) {
            case "openai":
                content = await generateWithOpenAI(prompt, model);
                break;
            case "groq":
                content = await generateWithGroq(prompt, model);
                break;
            case "gemini":
                content = await generateWithGemini(prompt, model);
                break;
            default:
                throw new ApiError(400, `Unsupported AI provider: ${provider}`);
        }

        try {
            return JSON.parse(content);
        } catch (parseError) {
            throw new ApiError(
                500,
                `Failed to parse AI response as JSON (${provider}): ${parseError.message}. Response: ${content?.substring(0, 300)}`
            );
        }

    } catch (error) {
        const errorMessage = error.message || String(error);
        throw new ApiError(502, `AI Generation error (provider: ${provider}): ${errorMessage}`);
    }
};
