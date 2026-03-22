import express from 'express';
import { forgotPassword, login, logout, refreshAccessToken, registerUser, resetPassword, verifyOTP } from "../controllers/login.controller.js";
import { verifyUserOrAdmin } from "../middlewares/auth.middleware.js"
import { changeAdminPassword } from '../controllers/admin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route("/register").post(upload.single("degreeFile"), registerUser)

router.route("/login").post(login)

router.route("/logout").post(verifyUserOrAdmin, logout)


router.route("/forgot-password").post(forgotPassword)

router.route("/verify-otp").post(verifyOTP);

router.route("/reset-password").post(resetPassword);

router.route("/refresh-token").post(refreshAccessToken);


export default router