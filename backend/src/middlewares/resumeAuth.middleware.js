import ApiError from "../utils/ApiError.js";
import Resume from "../models/resume.model.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Middleware to authorize resume ownership
 * Ensures users can only access/modify their own resumes
 */
export const authorizeResumeOwnership = asyncHandler(async (req, res, next) => {
    const resumeId = req.params.resumeId;

    if (!resumeId) {
        // If no resumeId in params, this is a general endpoint like /draft
        // which is user-specific and already scoped by user context
        return next();
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    // Check if the resume belongs to the authenticated user
    if (resume.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to access this resume");
    }

    // Attach resume to request for use in controller
    req.resume = resume;
    next();
});
