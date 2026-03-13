import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { resumeGenerationRateLimit, resumeSaveRateLimit } from "../middlewares/resumeRateLimit.middleware.js";
import { getResumeDraft, saveResumeDraft, generateResume } from "../controllers/resume.controller.js";

const router = express.Router();

// All resume routes require authentication
router.use(verifyJWT);

// Get draft resume
router.get("/draft", getResumeDraft);

// Save draft resume (with rate limiting for saves)
router.post("/draft", resumeSaveRateLimit, saveResumeDraft);

// Generate resume with AI (with strict rate limiting)
router.post("/ai/generate", resumeGenerationRateLimit, generateResume);

export default router;
