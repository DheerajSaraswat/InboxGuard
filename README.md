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
     - VITE_API_BASE_URL
     - VITE_ML_API_URL
     - VITE_FIREBASE_API_KEY
     - VITE_FIREBASE_AUTH_DOMAIN
     - VITE_FIREBASE_PROJECT_ID
     - VITE_FIREBASE_MESSAGING_SENDER_ID
     - VITE_FIREBASE_APP_ID
     - VITE_FIREBASE_MEASUREMENT_ID
   - Create server/.env with:
     - MONGODB_URI
     - JWT_SECRET
     - CLOUDINARY_URL
     - ML_API_URL
     - FIREBASE_PROJECT_ID
     - FIREBASE_CLIENT_EMAIL
     - FIREBASE_PRIVATE_KEY
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



