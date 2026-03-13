import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/user.model.js';

const generateUserAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, 'Error generating User Token');
  }
};

const googleAuthCallback = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, 'Google authentication failed');
    }

    // Check if this is a new user (just created)
    const isNewUser = user.createdAt && new Date().getTime() - new Date(user.createdAt).getTime() < 5000;

    // Generate tokens
    const { accessToken, refreshToken } = await generateUserAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    // Get user data without sensitive fields
    const loggedInUser = await User.findById(user._id).select(
      '-password -refreshToken -resetPasswordOTP -resetPasswordExpires -profileEmbedding'
    );

    // Redirect to frontend with tokens
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Set cookies and redirect
    res
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .redirect(`${frontendURL}/auth/google/success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(loggedInUser))}&isNewUser=${isNewUser}`);
  } catch (error) {
    console.error('Google Auth Callback Error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=authentication_failed`);
  }
});

const googleAuthFailure = asyncHandler(async (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendURL}/login?error=google_auth_failed`);
});

export { googleAuthCallback, googleAuthFailure };
