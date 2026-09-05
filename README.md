# Sikamitra

An AI-powered exam practice platform that helps students prepare for exams by generating personalized mock tests, revision notes, and question banks from their study materials.

## Status

🚧 Currently in development.

## Google Authentication

Google login and signup require OAuth web application credentials. Add these values to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
FRONTEND_URL=http://127.0.0.1:5173
```

In Google Cloud Console, add `http://127.0.0.1:8000/auth/google/callback` as an authorized redirect URI. Enable the Google Identity/OpenID scopes for the OAuth consent screen.