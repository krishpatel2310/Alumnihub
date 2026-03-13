# Google OAuth Login Setup Guide

This guide will help you set up Google OAuth authentication for the AlumniHub application.

## Prerequisites

- A Google Account
- Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in application name: "AlumniHub"
   - Add your email as support email
   - Add authorized domains if needed
   - Save and continue

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "AlumniHub Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for frontend)
     - `http://localhost:5001` (for backend)
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback`
   - Click **Create**

7. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Backend Environment

1. Open `backend/.env`
2. Update the following variables with your credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

## Step 3: Configure Frontend Environment

1. Open `frontend/.env`
2. Update the Google Client ID:

```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

## Step 4: Restart the Application

Stop the current servers and restart them:

```bash
# Backend
cd backend
npm start

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## How It Works

### Backend Flow:

1. User clicks "Continue with Google" button
2. Frontend redirects to: `http://localhost:5001/api/auth/google`
3. Backend redirects to Google's OAuth consent screen
4. User authorizes the application
5. Google redirects back to: `http://localhost:5001/api/auth/google/callback`
6. Backend processes the authentication:
   - Creates new user if doesn't exist
   - Links Google account to existing user with same email
   - Generates JWT tokens
7. Backend redirects to frontend with tokens

### Frontend Flow:

1. User is redirected to: `http://localhost:5173/auth/google/success?token=...&user=...`
2. GoogleAuthSuccess component extracts tokens and user data
3. Stores tokens in localStorage
4. Updates AuthContext
5. Redirects to dashboard or admin panel based on role

## Database Changes

The User model has been updated with a new field:

- `googleId`: Stores the unique Google account ID for OAuth users
- Password is now optional for Google OAuth users (auto-generated)
- Google users are auto-verified

## Security Features

- Sessions are disabled (stateless JWT authentication)
- Tokens are httpOnly cookies (production)
- CORS configured for allowed origins
- Secure cookies in production mode
- Password hashing for all users

## Testing the Integration

1. Navigate to `http://localhost:5173/auth/login`
2. Click the "Continue with Google" button
3. Sign in with your Google account
4. Grant permissions
5. You should be redirected to the dashboard

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Ensure the callback URL in Google Console exactly matches `http://localhost:5001/api/auth/google/callback`

2. **"Access blocked: This app's request is invalid"**
   - Complete the OAuth consent screen configuration
   - Add your email as a test user in Google Console

3. **Authentication fails silently**
   - Check backend console for errors
   - Verify environment variables are set correctly
   - Ensure MongoDB is running

4. **CORS errors**
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check that frontend is running on port 5173

## Production Deployment

For production deployment, update:

1. **Backend `.env`:**
   ```env
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

2. **Frontend `.env`:**
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```

3. **Google Console:**
   - Add production URLs to authorized origins and redirect URIs
   - Verify OAuth consent screen settings

## Files Modified

### Backend:
- `src/config/passport.js` - Passport Google OAuth strategy
- `src/models/user.model.js` - Added googleId field
- `src/routes/googleAuth.routes.js` - Google auth routes
- `src/controllers/googleAuth.controller.js` - Google auth logic
- `src/app.js` - Added passport middleware and routes
- `.env` - Added Google OAuth credentials

### Frontend:
- `src/pages/auth/Login.tsx` - Added Google login button
- `src/pages/auth/GoogleAuthSuccess.tsx` - Success handler
- `src/App.tsx` - Added Google success route
- `.env` - Added API URL and Google Client ID

## Support

If you encounter any issues, please check:
- Backend console logs
- Frontend browser console
- Network tab in browser DevTools
- MongoDB connection status
