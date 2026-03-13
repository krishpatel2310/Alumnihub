import { RESUME_FIELD_LIMITS, VALID_TEMPLATES } from "../config/resume.config.js";
import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes resume answer inputs
 * Prevents prompt injection and ensures data integrity
 */
export const validateAnswers = (answers) => {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
        throw new ApiError(400, "answers must be an object");
    }

    // Validate required fields
    const requiredFields = ['fullName', 'targetRole'];
    for (const field of requiredFields) {
        if (!answers[field] || typeof answers[field] !== 'string' || !answers[field].trim()) {
            throw new ApiError(400, `${field} must be a non-empty string`);
        }
    }

    // Validate fullName
    const fullNameLength = answers.fullName.trim().length;
    if (fullNameLength < RESUME_FIELD_LIMITS.NAME_MIN || fullNameLength > RESUME_FIELD_LIMITS.NAME_MAX) {
        throw new ApiError(
            400,
            `Full name must be between ${RESUME_FIELD_LIMITS.NAME_MIN} and ${RESUME_FIELD_LIMITS.NAME_MAX} characters`
        );
    }

    // Validate targetRole
    if (answers.targetRole.trim().length > RESUME_FIELD_LIMITS.ROLE_MAX) {
        throw new ApiError(400, `Target role must not exceed ${RESUME_FIELD_LIMITS.ROLE_MAX} characters`);
    }

    // Validate optional string fields
    const optionalStringFields = ['email', 'phone', 'location', 'headline', 'summary', 'education', 'experience', 'projects', 'linkedin', 'github'];
    for (const field of optionalStringFields) {
        if (answers[field] && typeof answers[field] !== 'string') {
            throw new ApiError(400, `${field} must be a string`);
        }
        if (answers[field] && answers[field].length > RESUME_FIELD_LIMITS.EXPERIENCE_MAX) {
            throw new ApiError(400, `${field} exceeds maximum length`);
        }
    }

    // Validate skills array
    if (answers.skills && typeof answers.skills === 'string') {
        if (answers.skills.length > RESUME_FIELD_LIMITS.SKILL_MAX * 10) {
            throw new ApiError(400, "Skills input is too long");
        }
    }

    // Don't allow suspicious patterns that could indicate injection attempts
    const suspiciousPatternsRegex = /```|eval|exec|system|shell|bash|script|javascript|import|require/i;
    const fieldsToCheck = ['fullName', 'targetRole', 'summary', 'experience'];
    for (const field of fieldsToCheck) {
        if (answers[field] && suspiciousPatternsRegex.test(answers[field])) {
            throw new ApiError(400, `${field} contains invalid characters or patterns`);
        }
    }
};

/**
 * Validates profile URLs format and structure
 */
export const validateProfileUrls = (answers) => {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/;
    const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-_.]+\/?$/;
    const urlRegex = /^https?:\/\/.+/;

    if (answers.linkedin && answers.linkedin.trim()) {
        const linkedinUrl = answers.linkedin.trim();
        if (linkedinUrl.length > RESUME_FIELD_LIMITS.URL_MAX) {
            throw new ApiError(400, "LinkedIn URL exceeds maximum length");
        }
        if (!linkedinRegex.test(linkedinUrl)) {
            throw new ApiError(400, "Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username");
        }
    }

    if (answers.github && answers.github.trim()) {
        const githubUrl = answers.github.trim();
        if (githubUrl.length > RESUME_FIELD_LIMITS.URL_MAX) {
            throw new ApiError(400, "GitHub URL exceeds maximum length");
        }
        if (!githubRegex.test(githubUrl)) {
            throw new ApiError(400, "Invalid GitHub URL format. Expected: https://github.com/username");
        }
    }
};

/**
 * Validates template ID
 */
export const validateTemplateId = (templateId) => {
    if (!templateId || typeof templateId !== 'string') {
        throw new ApiError(400, "templateId is required and must be a string");
    }

    if (!VALID_TEMPLATES.includes(templateId)) {
        throw new ApiError(
            400,
            `Invalid template. Must be one of: ${VALID_TEMPLATES.join(', ')}`
        );
    }
};

/**
 * Validates entire request body for resume generation
 */
export const validateGenerateResumeRequest = (req) => {
    const { templateId, answers } = req.body;

    validateTemplateId(templateId);
    validateAnswers(answers);
    validateProfileUrls(answers);
};
