# 🚀 Quick Start: Google Login Setup

## ✅ What's Been Implemented

Google OAuth login has been **fully integrated** into your AlumniHub application! Here's what's ready:

### Backend Changes:
- ✅ Google OAuth strategy configured (`src/config/passport.js`)
- ✅ Google auth routes created (`src/routes/googleAuth.routes.js`)
- ✅ Google auth controller implemented (`src/controllers/googleAuth.controller.js`)
- ✅ User model updated with `googleId` field
- ✅ Passport.js integrated into Express app
- ✅ Required packages installed: `passport`, `passport-google-oauth20`

### Frontend Changes:
- ✅ "Continue with Google" button added to login page
- ✅ Google OAuth success handler page created
- ✅ Routing configured for OAuth callback
- ✅ Required package installed: `@react-oauth/google`

## 🔧 Required: Get Google OAuth Credentials

**You must complete this step to enable Google login:**

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select existing project
3. Name it "AlumniHub" and click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type → Click "Create"
3. Fill in the required fields:
   - App name: `AlumniHub`
   - User support email: Your email
   - Developer contact email: Your email
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Add test users (your Gmail address) → Click "Save and Continue"
7. Click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: AlumniHub Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `http://localhost:5001`
   - **Authorized redirect URIs**:
     - `http://localhost:5001/api/auth/google/callback`
5. Click **Create**
6. **COPY** the Client ID and Client Secret (you'll need these!)

### Step 5: Update Environment Variables

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=paste-your-client-id-here
```

### Step 6: Restart the Servers

```bash
# Stop existing servers (Ctrl+C in both terminals)

# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎯 How to Test

1. Open browser: `http://localhost:5173/auth/login`
2. Click **"Continue with Google"** button
3. Select your Google account
4. Grant permissions
5. You'll be logged in and redirected to the dashboard! 🎉

## 🔍 How It Works

```
User clicks "Continue with Google"
    ↓
Frontend redirects to → Backend: /api/auth/google
    ↓
Backend redirects to → Google OAuth consent screen
    ↓
User authorizes → Google redirects back to Backend
    ↓
Backend: /api/auth/google/callback
    ↓
    → Checks if user exists by Google ID
    → If not, checks by email
    → Creates new user or links Google account
    → Generates JWT tokens
    ↓
Backend redirects to → Frontend: /auth/google/success?token=...&user=...
    ↓
Frontend stores tokens and user data
    ↓
Redirects to Dashboard ✓
```

## 🗄️ Database Changes

New field added to User model:
```javascript
googleId: {
  type: String,
  unique: true,
  sparse: true,
  default: null
}
```

- Users can link their Google account to existing email-based accounts
- Google users get auto-verified (`isVerified: true`)
- Password is optional for Google OAuth users

## 🔐 Security Features

- ✅ Stateless JWT authentication
- ✅ HttpOnly cookies in production
- ✅ CORS configured
- ✅ Secure cookies when `NODE_ENV=production`
- ✅ Password auto-generated for Google-only users
- ✅ Sessions disabled (using Passport without sessions)

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Ensure the redirect URI in Google Console exactly matches:
```
http://localhost:5001/api/auth/google/callback
```

### Error: "OAuth2Strategy requires a clientID option"
**Solution**: You haven't added your Google credentials to `.env` file yet. Follow Step 5 above.

### Error: "Access blocked: This app's request is invalid"
**Solution**: 
1. Complete OAuth consent screen setup
2. Add your email as a test user
3. Make sure app is in "Testing" mode (not published)

### Google login button doesn't appear
**Solution**: Clear browser cache and refresh, or check browser console for errors.

## 📦 Packages Installed

**Backend:**
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth 2.0 strategy
- `express-session` - Session middleware (for Passport)

**Frontend:**
- `@react-oauth/google` - Google OAuth React components

## 📁 Files Modified/Created

### Backend:
```
src/
├── config/
│   └── passport.js              [NEW] Google OAuth strategy
├── controllers/
│   └── googleAuth.controller.js [NEW] Google auth handlers
├── routes/
│   └── googleAuth.routes.js     [NEW] Google auth routes
├── models/
│   └── user.model.js            [MODIFIED] Added googleId field
└── app.js                       [MODIFIED] Added passport middleware
```

### Frontend:
```
src/
├── pages/
│   └── auth/
│       ├── Login.tsx                    [MODIFIED] Added Google button
│       └── GoogleAuthSuccess.tsx        [NEW] OAuth success handler
└── App.tsx                              [MODIFIED] Added route
```

## 🌐 Production Deployment

When deploying to production:

1. **Update backend `.env`:**
```env
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

2. **Update frontend `.env`:**
```env
VITE_API_URL=https://your-api-domain.com
```

3. **Update Google Console:**
   - Add production URLs to authorized origins
   - Add production callback URL to redirect URIs
   - Publish the OAuth consent screen

## ✨ Features

- 🔐 Secure Google OAuth 2.0 authentication
- 👤 Auto-create user accounts from Google profile
- 🔗 Link Google accounts to existing email accounts
- ✅ Auto-verify Google users
- 🎨 Beautiful UI with Google branding
- 📱 Mobile-responsive design
- ⚡ Fast token-based authentication

## 📞 Need Help?

Check the detailed guide: `GOOGLE_AUTH_SETUP.md`

---

**Status**: ✅ Implementation Complete - Awaiting Google OAuth Credentials
