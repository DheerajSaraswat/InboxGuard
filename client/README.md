## InboxGuard Client

### Environment

Create a `.env` file with your Firebase, API, and Cloudinary environment variables.

```bash
VITE_API_BASE_URL=https://inboxguard-1mqh.onrender.com/api
VITE_ML_API_URL=https://inboxguard-production.up.railway.app
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTHDOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECTID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGINGID=...
VITE_FIREBASE_APPID=...
VITE_FIREBASE_MEASUREMENTID=...
VITE_FIREBASE_VAPIDKEY=...
# Cloudinary unsigned upload
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UNSIGNED_PRESET=your_unsigned_preset
```

### Google Sign-In Deployment Setup

For Google sign-in to work on your deployed domain (e.g., inboxguard.live):

1. **Firebase Console Configuration:**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your deployed domain: `inboxguard.live` (and `www.inboxguard.live` if using www)
   - Local domains are already included: `localhost`, `localhost:5173`, etc.

2. **Environment Variables:**
   - Ensure `VITE_FIREBASE_AUTHDOMAIN` is set correctly (usually `your-project.firebaseapp.com`)
   - Set all Firebase environment variables in your deployment platform (Vercel, Netlify, etc.)

3. **Verify Configuration:**
   - After deployment, test Google sign-in
   - Check browser console for any authorization errors
   - If you see "unauthorized-domain" error, verify the domain is added in Firebase Console
