import ApiError from "../utils/ApiError.js";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VALID_TEMPLATES } from "../config/resume.config.js";

/**
 * Sanitizes user input to prevent prompt injection attacks
 * Removes markdown, code blocks, and suspicious patterns
 */
const sanitizePromptInput = (input, maxLength = 500) => {
    if (!input || typeof input !== 'string') return '';

    // Trim and limit length
    let sanitized = input.trim().slice(0, maxLength);

    // Remove code blocks (```...```)
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '');

    // Remove markdown syntax
    sanitized = sanitized.replace(/[`*_~#\[\](){}|]/g, '');

    // Remove multiple consecutive newlines (keep max 2)
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    // Remove leading/trailing whitespace again
    sanitized = sanitized.trim();

    return sanitized;
};

const buildPrompt = ({ templateId, answers }) => {
    // Validate template before using it
    if (!VALID_TEMPLATES.includes(templateId)) {
        throw new ApiError(400, `Invalid template: ${templateId}`);
    }

    // Sanitize all user inputs to prevent prompt injection
    const safe = {
        fullName: sanitizePromptInput(answers.fullName, 100),
        targetRole: sanitizePromptInput(answers.targetRole, 100),
        email: sanitizePromptInput(answers.email, 254),
        phone: sanitizePromptInput(answers.phone, 20),
        location: sanitizePromptInput(answers.location, 100),
        headline: sanitizePromptInput(answers.headline, 150),
        summary: sanitizePromptInput(answers.summary, 1000),
        education: sanitizePromptInput(answers.education, 2000),
        skills: sanitizePromptInput(answers.skills, 500),
        strengths: sanitizePromptInput(answers.strengths, 1000),
        languages: sanitizePromptInput(answers.languages, 500),
        projects: sanitizePromptInput(answers.projects, 2000),
        experience: sanitizePromptInput(answers.experience, 5000),
        linkedin: sanitizePromptInput(answers.linkedin, 500),
        github: sanitizePromptInput(answers.github, 500)
    };

    return `You are an expert professional resume writer and career coach. Your goal is to create a high-impact, ATS-optimized resume that can score 80+ in standard ATS checks.

Template Style: ${safe.templateId || templateId}

Candidate Information:
Full Name: ${safe.fullName}
Target Role: ${safe.targetRole}
Contact: ${safe.email}, ${safe.phone}, ${safe.location}
Headline/Title: ${safe.headline}
Summary/Objective: ${safe.summary}
Education: ${safe.education}
Skills: ${safe.skills}
Strengths: ${safe.strengths}
Languages: ${safe.languages}
Projects: ${safe.projects}
Experience: ${safe.experience}
LinkedIn: ${safe.linkedin}
GitHub: ${safe.github}

INSTRUCTIONS:
1. **ATS Optimization**: Include target-role-relevant keywords naturally across headline, summary, experience, and skills.
2. **Summary**: Keep summary to 2-4 lines, specific and role-focused. Avoid generic claims.
3. **Experience**: For each role, provide 3-5 bullets using strong action verbs and measurable impact (numbers, %, time saved, revenue, scale, latency, users, etc.).
4. **Projects**: Make each project outcome-focused with clear impact and technologies.
5. **Skills**: Output clean, ATS-friendly skill keywords (no decorative symbols).
6. **Formatting**: Keep plain text style and standard headings only (ATS parsers).
7. **No Fluff**: Do not use first-person pronouns, emojis, tables, or excessive adjectives.

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
    "strengths": [{"title": "string", "detail": "string"}],
    "languages": [{"name": "string", "level": "string"}],
  "education": [{"degree": "string", "school": "string", "year": "string"}],
  "experience": [{"role": "string", "company": "string", "startDate": "string", "endDate": "string", "bullets": ["string array"]}],
  "projects": [{"name": "string", "description": "string", "tech": ["string array"]}]
}

IMPORTANT: Return ONLY the JSON object. Do not include markdown formatting (like \`\`\`json), explanations, or any other text.`;
};

const toString = (value) => (typeof value === "string" ? value.trim() : "");

const toStringArray = (value) => {
    if (Array.isArray(value)) return value.map((item) => toString(item)).filter(Boolean);
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

const parseDuration = (duration) => {
    const text = toString(duration);
    if (!text) return { startDate: "", endDate: "" };
    const parts = text.split(/-|–|to/i).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
        return { startDate: parts[0], endDate: parts[1] };
    }
    return { startDate: text, endDate: "Present" };
};

const normalizeResumeContent = (rawContent, answers = {}) => {
    const contact = rawContent?.contact || {};

    const normalizedStrengths = Array.isArray(rawContent?.strengths)
        ? rawContent.strengths.map((item) => {
            if (typeof item === "string") {
                const [title, ...rest] = item.split("-");
                return { title: toString(title), detail: toString(rest.join("-")) };
            }
            return {
                title: toString(item?.title),
                detail: toString(item?.detail)
            };
        }).filter((item) => item.title || item.detail)
        : [];

    const normalizedLanguages = Array.isArray(rawContent?.languages)
        ? rawContent.languages.map((item) => {
            if (typeof item === "string") {
                const [name, ...rest] = item.split("-");
                return { name: toString(name), level: toString(rest.join("-")) };
            }
            return {
                name: toString(item?.name),
                level: toString(item?.level)
            };
        }).filter((item) => item.name || item.level)
        : [];

    const normalizedEducation = Array.isArray(rawContent?.education)
        ? rawContent.education.map((item) => ({
            school: toString(item?.school || item?.institution),
            degree: toString(item?.degree),
            year: toString(item?.year)
        })).filter((item) => item.school || item.degree || item.year)
        : [];

    const normalizedExperience = Array.isArray(rawContent?.experience)
        ? rawContent.experience.map((item) => {
            const fallbackDates = parseDuration(item?.duration);
            return {
                role: toString(item?.role),
                company: toString(item?.company),
                startDate: toString(item?.startDate) || fallbackDates.startDate,
                endDate: toString(item?.endDate) || fallbackDates.endDate,
                bullets: toStringArray(item?.bullets)
            };
        }).filter((item) => item.role || item.company || item.bullets.length)
        : [];

    const normalizedProjects = Array.isArray(rawContent?.projects)
        ? rawContent.projects.map((item) => ({
            name: toString(item?.name),
            description: toString(item?.description),
            tech: toStringArray(item?.tech)
        })).filter((item) => item.name || item.description || item.tech.length)
        : [];

    return {
        name: toString(rawContent?.name) || toString(answers?.fullName),
        headline: toString(rawContent?.headline) || toString(answers?.targetRole || answers?.headline),
        summary: toString(rawContent?.summary) || toString(answers?.summary),
        contact: {
            email: toString(contact?.email) || toString(answers?.email),
            phone: toString(contact?.phone) || toString(answers?.phone),
            location: toString(contact?.location) || toString(answers?.location),
            linkedin: toString(contact?.linkedin) || toString(answers?.linkedin),
            github: toString(contact?.github) || toString(answers?.github)
        },
        skills: toStringArray(rawContent?.skills?.length ? rawContent.skills : answers?.skills),
        strengths: normalizedStrengths,
        languages: normalizedLanguages,
        education: normalizedEducation,
        experience: normalizedExperience,
        projects: normalizedProjects
    };
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

    // Log generation with provider info (server-side only)
    console.log(`[RESUME] Generation started - Provider: ${provider}, Template: ${templateId}`);

    try {
        // Validate provider has required API key
        const apiKeyVar = `${provider.toUpperCase()}_API_KEY`;
        if (!process.env[apiKeyVar]) {
            throw new ApiError(500, `Missing configuration: ${apiKeyVar} not set`);
        }

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
            const parsed = JSON.parse(content);
            return normalizeResumeContent(parsed, answers);
        } catch (parseError) {
            // Log full error server-side for debugging
            console.error(`[RESUME ERROR] JSON Parse failed for provider: ${provider}`, {
                errorMessage: parseError.message,
                responseLength: content?.length || 0,
                templateId,
                timestamp: new Date().toISOString()
            });

            // Return generic error to client (don't expose response content)
            throw new ApiError(
                500,
                `Resume generation failed: Unable to process AI response. Please try again.`
            );
        }

    } catch (error) {
        // Log detailed error server-side
        if (error instanceof ApiError) {
            throw error;
        }

        console.error(`[RESUME ERROR] Generation failed for provider: ${provider}`, {
            errorMessage: error.message,
            templateId,
            timestamp: new Date().toISOString()
        });

        // Return generic error to client
        throw new ApiError(
            502,
            `Resume generation service temporarily unavailable. Please try again later.`
        );
    }
};
