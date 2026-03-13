import express from 'express';
import { changeUserPassword,  getAllUser,  getCurrentUser,  getUserById,  updateUserAvatar,  updateUserDetails, getRecommendedMentors, getRecommendedCareerPaths, updateUserRole, getAlumniLocations, getFeaturedAlumni, setFeaturedAlumni } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT, verifyUserOrAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// router.route("/login").post(loginUser)

// router.route("/logout").post(verifyJWT, logoutUser)

router.route("/alluser").get(getAllUser)

router.route("/change-password").post(verifyJWT, changeUserPassword)

router.route("/user").get(verifyUserOrAdmin, getCurrentUser)

// Recommendation endpoints MUST come before dynamic :userId route
router.route("/recommendations/mentors").get(verifyJWT, getRecommendedMentors)
router.route("/recommendations/careers").get(verifyJWT, getRecommendedCareerPaths)

// Alumni features
router.route("/alumni/locations").get(getAlumniLocations)
router.route("/alumni/featured").get(getFeaturedAlumni)
router.route("/alumni/featured/:userId").patch(verifyJWT, setFeaturedAlumni)

router.route("/update-user").patch(verifyJWT, updateUserDetails)

router.route("/update-role").patch(verifyJWT, updateUserRole)

router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/:userId").get( getUserById)

export default router;