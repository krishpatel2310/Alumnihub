import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Resume from "../models/resume.model.js";
import { generateResumeContent } from "../services/resumeAi.service.js";

const ensureStudent = (req) => {
    if (!req.user || req.user.role !== "student") {
        throw new ApiError(403, "Only students can access resume builder");
    }
};

const getResumeDraft = asyncHandler(async (req, res) => {
    ensureStudent(req);

    const resume = await Resume.findOne({ user: req.user._id });

    return res
        .status(200)
        .json(new ApiResponse(200, resume, "Resume draft fetched successfully"));
});

const saveResumeDraft = asyncHandler(async (req, res) => {
    ensureStudent(req);

    const { templateId, answers = {}, content = {}, status = "draft" } = req.body;

    if (!templateId) {
        throw new ApiError(400, "templateId is required");
    }

    const resume = await Resume.findOneAndUpdate(
        { user: req.user._id },
        { templateId, answers, content, status },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, resume, "Resume draft saved successfully"));
});

const generateResume = asyncHandler(async (req, res) => {
    ensureStudent(req);

    const { templateId, answers } = req.body;

    if (!templateId) {
        throw new ApiError(400, "templateId is required");
    }

    if (!answers || !answers.fullName || !answers.targetRole) {
        throw new ApiError(400, "fullName and targetRole are required");
    }

    const content = await generateResumeContent({ templateId, answers });

    const resume = await Resume.findOneAndUpdate(
        { user: req.user._id },
        { templateId, answers, content, status: "generated" },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, resume, "Resume generated successfully"));
});

export { getResumeDraft, saveResumeDraft, generateResume };
