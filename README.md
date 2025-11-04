InboxGuard – Full-Stack Email Security App

Overview
- Client: React + Vite, Redux, Framer Motion, Tailwind
- Server: Node.js + Express, MongoDB/Mongoose, Firebase Auth, Cloudinary (attachments), optional PhishGuard ML API

Key Features
- Mailboxes: Inbox, Sent, Starred, Archive, Spam, Trash
- Phishing-aware routing: medium/high/critical risk -> Spam; otherwise Inbox
- Spam delete and bulk empty with optimistic UI
- Trash restore (single/bulk) honoring risk on restore
- Smooth route transitions and consistent theming (dark/light)
- Sidebar counts cached to avoid flicker on navigation
- Loaders and click-guards to prevent server overload from rapid clicks

Monorepo Structure
- client/ – React app
- server/ – Express API
- phishguard-ml/ – Optional ML service (FastAPI)

Prerequisites
- Node.js 18+
- Yarn or npm
- MongoDB instance
- Firebase project (Web App) for authentication and FCM

Setup
1) Clone and install
   - npm install in client/ and server/
2) Environment
   - Create client/.env with:
     - VITE_API_BASE_URL=https://your-api.example.com
     - VITE_ML_API_URL=https://inboxguard-production.up.railway.app (ML model URL for phishing detection)
     - VITE_FIREBASE_API_KEY=...
     - VITE_FIREBASE_AUTH_DOMAIN=...
     - VITE_FIREBASE_PROJECT_ID=...
     - VITE_FIREBASE_MESSAGING_SENDER_ID=...
     - VITE_FIREBASE_APP_ID=...
     - VITE_FIREBASE_MEASUREMENT_ID=...
   - Create server/.env with:
     - MONGODB_URI=mongodb+srv://...
     - JWT_SECRET=replace-me
     - CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>
     - ML_API_URL=https://inboxguard-production.up.railway.app/ (production ML model URL)
     - FIREBASE_PROJECT_ID=...
     - FIREBASE_CLIENT_EMAIL=...
     - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
3) Run
   - client: npm run dev
   - server: npm run dev or npm start
   - ml (optional): see phishguard-ml/README.md

Scripts
- client: dev, build, preview, lint
- server: dev (nodemon if configured), start

API Highlights (server)
- GET /emails/emailList?mailbox=inbox|sent|spam|archive|trash|starred
- PATCH /emails/:id/trash – move to trash
- PATCH /emails/trash/bulk – bulk move to trash
- PATCH /emails/:id/restore – restore from trash (risk-aware)
- PATCH /emails/trash/restore/bulk – bulk restore (risk-aware)
- DELETE /emails/:id/delete – permanent delete

Dev Notes
- Route transitions are handled by RouteTransition and applied in client/src/App.jsx
- Common Loader component used across pages
- Buttons guarding repeated clicks use disabled state and labels (e.g., Restoring…, Deleting…)

Security & Privacy
- Email bodies are encrypted at rest; previews are generated server-side
- Firebase Auth is required for all email routes

Recommendations / Next Steps
- Add E2E tests (Playwright) for mailbox flows
- Add optimistic cache invalidation for Sidebar counts via a shared context/store
- Add attachment virus scanning webhook
- Add keyboard shortcuts (j/k nav, e archive, # delete)
- Add i18n support

License
- See phishguard-ml/LICENSE for ML component; rest under your project terms


