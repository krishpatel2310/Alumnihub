import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getResumeDraft, saveResumeDraft, generateResume } from "../controllers/resume.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/draft", getResumeDraft);
router.post("/draft", saveResumeDraft);
router.post("/ai/generate", generateResume);

export default router;
