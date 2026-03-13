import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { extractPublicId, uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getEmbeddingForText } from '../services/embedding.service.js';
import { rankBySimilarity } from '../services/similarity.service.js';
import { careerPaths } from '../config/career-paths.js';

// Build a descriptive text representation of a user's profile for embeddings
const buildUserProfileText = (user) => {
  const parts = [];

  if (user.role === "student") {
    parts.push("Student profile");
  } else if (user.role === "alumni") {
    parts.push("Alumni profile");
  }

  if (user.course) {
    parts.push(`Course: ${user.course}`);
  }

  if (user.graduationYear) {
    parts.push(`Graduation year: ${user.graduationYear}`);
  }

  if (user.currentPosition) {
    parts.push(`Current position: ${user.currentPosition}`);
  }

  if (user.company) {
    parts.push(`Company: ${user.company}`);
  }

  if (Array.isArray(user.skills) && user.skills.length > 0) {
    parts.push(`Skills: ${user.skills.join(", ")}`);
  }

  if (Array.isArray(user.interests) && user.interests.length > 0) {
    parts.push(`Interests: ${user.interests.join(", ")}`);
  }

  if (user.location) {
    parts.push(`Location: ${user.location}`);
  }

  if (user.bio) {
    parts.push(`Bio: ${user.bio}`);
  }

  return parts.join(". ");
};

const changeUserPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password -refreshToken');
    return res
        .status(200)
        .json(new ApiResponse(200, users, "All Users Fetched Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // Support both user and admin requests
    const currentUser = req.user || req.admin;
    const user = await User.findById(currentUser._id).select('-password -refreshToken');
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current User Fetched Successfully"))
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {

    const {
      name,
      email,
      graduationYear,
      course,
      currentPosition,
      company,
      location,
      phone,
      bio,
      linkedin,
      github,
      skills,
      interests,
    } = req.body;

    const parseStringArray = (value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return undefined;
    };

    const updates = {
      name,
      email,
      currentPosition,
      company,
      location,
      phone,
      bio,
      linkedin,
      github,
    };

    if (graduationYear) {
      updates.graduationYear = graduationYear;
    }
    if (course) {
      updates.course = course;
    }

    const parsedSkills = parseStringArray(skills);
    if (parsedSkills) {
      updates.skills = parsedSkills;
    }

    const parsedInterests = parseStringArray(interests);
    if (parsedInterests) {
      updates.interests = parsedInterests;
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updates },
        { new: true }
    ).select('-password -refreshToken');
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Details Updated Successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select('-password');

    const oldAvatarPublicId = extractPublicId(req.user?.avatar);

    if (!oldAvatarPublicId) {
        throw new ApiError(500, 'Failed to extract public ID from avatar URL');
    }

    await deleteFromCloudinary(oldAvatarPublicId);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"))

})

const deleteUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Delete avatar from cloudinary if exists
    if (user.avatar) {
        const avatarPublicId = extractPublicId(user.avatar);
        if (avatarPublicId) {
            await deleteFromCloudinary(avatarPublicId);
        }
    }

    await User.findByIdAndDelete(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Recommend alumni mentors for the current user using embeddings when available,
// with a simple rule-based fallback if embeddings are not configured.
const getRecommendedMentors = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;

  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized");
  }

  const currentUser = await User.findById(currentUserId).select(
    "-password -refreshToken"
  );

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  // Try to compute an embedding for the current user's profile
  const studentProfileText = buildUserProfileText(currentUser);
  const studentEmbedding = await getEmbeddingForText(studentProfileText);

  // Fetch alumni as potential mentors (keep filters simple to avoid empty results)
  const alumni = await User.find({
    role: "alumni",
  }).select(
    "name email currentPosition company skills interests graduationYear course location avatar bio +profileEmbedding"
  );

  if (!alumni || alumni.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No alumni mentors available yet"));
  }

  const normalize = (value) =>
    (value || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "");

  // If we do not have embeddings configured, fall back to a simple rule-based ranking
  if (!studentEmbedding) {
    const studentSkills = new Set(currentUser.skills || []);
    const studentCourse = normalize(currentUser.course);
    const studentLocation = normalize(currentUser.location);

    const scored = alumni.map((alum) => {
      let score = 0;

      // Shared course / department (normalize spaces/case)
      const alumCourse = normalize(alum.course);
      if (
        studentCourse &&
        alumCourse &&
        (alumCourse === studentCourse ||
          alumCourse.includes(studentCourse) ||
          studentCourse.includes(alumCourse))
      ) {
        score += 3;
      }

      // Shared location
      const alumLocation = normalize(alum.location);
      if (studentLocation && alumLocation && alumLocation === studentLocation) {
        score += 1;
      }

      // Overlapping skills
      if (Array.isArray(alum.skills) && alum.skills.length > 0) {
        const overlap = alum.skills.filter((s) => studentSkills.has(s));
        score += overlap.length * 2;
      }

      return {
        user: alum,
        score,
      };
    });

    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => ({
        mentor: item.user,
        score: item.score,
        reason: "Rule-based match (course/location/skills overlap)",
      }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sorted,
          "Mentor recommendations generated using rule-based matching (embeddings not configured)"
        )
      );
  }

  // Embedding-based ranking path
  const candidateVectors = [];

  for (const alum of alumni) {
    let vector = alum.profileEmbedding;

    if (!vector) {
      const text = buildUserProfileText(alum);
      vector = await getEmbeddingForText(text);

      // Cache on the user document if we got a valid vector
      if (vector && Array.isArray(vector)) {
        alum.profileEmbedding = vector;
        // Save without triggering password hashing etc.
        await alum.save({ validateBeforeSave: false });
      }
    }

    if (vector && Array.isArray(vector)) {
      candidateVectors.push({
        id: alum._id.toString(),
        vector,
        user: alum,
      });
    }
  }

  if (candidateVectors.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          [],
          "No mentors with valid embeddings available yet"
        )
      );
  }

  const ranked = rankBySimilarity(studentEmbedding, candidateVectors);

  const topMentors = ranked.slice(0, 10).map((item) => ({
    mentor: item.user,
    score: item.score,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        topMentors,
        "Mentor recommendations generated successfully"
      )
    );
});

// Recommend career paths for the current user (typically a student).
// Uses embeddings when available, with a rule-based skills overlap fallback.
const getRecommendedCareerPaths = asyncHandler(async (req, res) => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(currentUserId).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const profileText = buildUserProfileText(user);
    const userEmbedding = await getEmbeddingForText(profileText);

    // If embeddings are not configured, fall back to rule-based ranking on skills.
    if (!userEmbedding) {
      const userSkills = new Set(user.skills || []);

      const scored = careerPaths.map((path) => {
        const overlap = (path.recommendedSkills || []).filter((skill) =>
          userSkills.has(skill)
        );

        // Simple score: number of overlapping skills
        const score = overlap.length;

        return {
          name: path.name,
          key: path.key,
          description: path.description,
          recommendedSkills: path.recommendedSkills,
          roadmap: path.roadmap,
          score,
          matchedSkills: overlap,
          reason: "Rule-based match based on overlapping skills",
        };
      });

      const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 5);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            sorted,
            "Career path recommendations generated using rule-based matching (embeddings not configured)"
          )
        );
    }

    // Embedding-based ranking
    // Lazily compute and cache embeddings for each career path description.
    const candidates = [];

    for (const path of careerPaths) {
      let vec = path.embedding;

      if (!vec) {
        const text = `${path.name}. ${path.description}. Recommended skills: ${(
          path.recommendedSkills || []
        ).join(", ")}`;

        vec = await getEmbeddingForText(text);

        // Cache in memory for future requests
        if (vec && Array.isArray(vec)) {
          // eslint-disable-next-line no-param-reassign
          path.embedding = vec;
        }
      }

      if (vec && Array.isArray(vec)) {
        candidates.push({
          id: path.key,
          vector: vec,
          path,
        });
      }
    }

    if (candidates.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            [],
            "No career paths with valid embeddings available yet"
          )
        );
    }

    const ranked = rankBySimilarity(userEmbedding, candidates);

    const topPaths = ranked.slice(0, 5).map((item) => ({
      name: item.path.name,
      key: item.path.key,
      description: item.path.description,
      recommendedSkills: item.path.recommendedSkills,
      roadmap: item.path.roadmap,
      score: item.score,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          topPaths,
          "Career path recommendations generated successfully"
        )
      );
  } catch (error) {
    console.error("Career recommendation error:", error);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          [],
          "Unable to generate career recommendations at the moment"
        )
      );
  }
});

const updateUserRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role || !['student', 'alumni'].includes(role)) {
      throw new ApiError(400, 'Invalid role. Must be either "student" or "alumni"');
    }

    // Get user from JWT token
    const userId = req.user._id;

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetPasswordOTP -resetPasswordExpires -profileEmbedding');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          `Role updated to ${role} successfully`
        )
      );
  } catch (error) {
    console.error('Update role error:', error);
    throw new ApiError(500, error.message || 'Failed to update role');
  }
});

// Get alumni locations for world map
const getAlumniLocations = asyncHandler(async (req, res) => {
  try {
    const alumni = await User.find({
      role: 'alumni',
      $or: [
        { 'coordinates.latitude': { $ne: null } },
        { city: { $ne: null } },
        { location: { $ne: null } }
      ]
    }).select('name avatar city country location coordinates currentPosition company graduationYear');

    const locations = alumni.map(user => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      city: user.city || user.location?.split(',')[0]?.trim(),
      country: user.country || user.location?.split(',').pop()?.trim(),
      coordinates: user.coordinates,
      currentPosition: user.currentPosition,
      company: user.company,
      graduationYear: user.graduationYear
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, locations, "Alumni locations fetched successfully"));
  } catch (error) {
    console.error('Get alumni locations error:', error);
    throw new ApiError(500, error.message || 'Failed to fetch alumni locations');
  }
});

// Get featured/spotlight alumni
const getFeaturedAlumni = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    
    // Get manually featured alumni (those with isFeatured = true and valid featuredUntil date)
    let featuredAlumni = await User.find({
      role: 'alumni',
      isFeatured: true,
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gt: now } }
      ]
    })
      .select('name avatar bio currentPosition company graduationYear achievements linkedin github location')
      .limit(3)
      .sort({ featuredUntil: -1 });

    // If we don't have 3 featured alumni, fill with random notable alumni
    if (featuredAlumni.length < 3) {
      const notableAlumni = await User.find({
        role: 'alumni',
        _id: { $nin: featuredAlumni.map(a => a._id) },
        $or: [
          { achievements: { $exists: true, $ne: [] } },
          { currentPosition: { $ne: null } },
          { company: { $ne: null } }
        ]
      })
        .select('name avatar bio currentPosition company graduationYear achievements linkedin github location')
        .sort({ graduationYear: 1 }) // Older alumni first
        .limit(3 - featuredAlumni.length);

      featuredAlumni = [...featuredAlumni, ...notableAlumni];
    }

    return res
      .status(200)
      .json(new ApiResponse(200, featuredAlumni, "Featured alumni fetched successfully"));
  } catch (error) {
    console.error('Get featured alumni error:', error);
    throw new ApiError(500, error.message || 'Failed to fetch featured alumni');
  }
});

// Update user to be featured (admin function)
const setFeaturedAlumni = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { isFeatured, duration } = req.body; // duration in days

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== 'alumni') {
      throw new ApiError(400, "Only alumni can be featured");
    }

    user.isFeatured = isFeatured;
    
    if (isFeatured && duration) {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + parseInt(duration));
      user.featuredUntil = featuredUntil;
    } else if (!isFeatured) {
      user.featuredUntil = null;
    }

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, `User ${isFeatured ? 'featured' : 'unfeatured'} successfully`));
  } catch (error) {
    console.error('Set featured alumni error:', error);
    throw new ApiError(500, error.message || 'Failed to update featured status');
  }
});

export {

    changeUserPassword,
    getCurrentUser,
    getUserById,
    updateUserDetails,
    updateUserAvatar,
    getAllUser,
  deleteUser,
  getRecommendedMentors,
  getRecommendedCareerPaths,
  updateUserRole,
  getAlumniLocations,
  getFeaturedAlumni,
  setFeaturedAlumni
};

