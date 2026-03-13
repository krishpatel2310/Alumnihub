import express from 'express';
import passport from '../config/passport.js';
import { googleAuthCallback, googleAuthFailure } from '../controllers/googleAuth.controller.js';

const router = express.Router();

// Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  googleAuthCallback
);

// Failure route
router.get('/google/failure', googleAuthFailure);

export default router;
