import HomePage from "./pages/HomePage.jsx";
import SigninPage from "./pages/Authentication/SigninPage.jsx";
import SignupPage from "./pages/Authentication/SignupPage.jsx";
import { Routes, Route } from "react-router-dom";
import DraftsPage from "./pages/DraftsPage.jsx";
import ForgotPasswordPage from "./pages/Authentication/ForgotPasswordPage.jsx";
import Dashboard from "./pages/dashboard.jsx";
import EmailViewer from "./components/EmailViewer.jsx";
import AnimationWrapper from "./common/AnimationWrapper.jsx";
import VerifyEmailPage from "./pages/Authentication/VerifyEmailPage.jsx";
import Compose from "./pages/Compose.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import TrashPage from "./pages/TrashPage.jsx";
import StarredPage from "./pages/StarredPage.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";
import SentPage from "./pages/SentPage.jsx";
import SpamPage from "./pages/SpamPage.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { onMessageListener, requestForToken } from "./common/firebase.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

function App() {
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";
  const [authInitialized, setAuthInitialized] = useState(false);
  const auth = getAuth();
  useEffect(() => {
    // 1. Listen for the initial auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Auth state is settled and user is logged in
        // NOW it's safe to call the token update function
        requestForToken();
        // Set flag to allow other authenticated components to render
        setAuthInitialized(true);
      } else {
        // User is logged out, but the state is settled
        setAuthInitialized(true);
      }
    });

    // 2. Set up foreground message listener (can run immediately)
    onMessageListener()
      .then((payload) => {
        // 1. Extract data
        const emailId = payload.data.emailId;
        const title = payload.notification.title;
        const body = payload.notification.body;

        // 2. Display the in-app alert (using a library like react-hot-toast)
        toast.success(`${title}: ${body}`, {
          // Add action to make it clickable
          onClick: () => {
            // Navigate to the specific email when the toast is clicked
            window.location.href = `/email/${emailId}`;
          },
          // Keep the toast visible longer for important notifications
          duration: 8000,
        });
      })
      .catch((err) => console.error(err));

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [])
  

  return (
    <div className={isDark ? "dark" : ""}>
      <Routes>
        <Route path="/" element={<HomePage isDark={isDark} />} />
        <Route
          path="/signin"
          element={
            <AnimationWrapper>
              <SigninPage isDark={isDark} />
            </AnimationWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <AnimationWrapper>
              <SignupPage isDark={isDark} />
            </AnimationWrapper>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage isDark={isDark} />}
        />
        <Route
          path="/reset-password"
          element={<ForgotPasswordPage isDark={isDark} />}
        />
        <Route path="/user/u0" element={<Dashboard isDark={isDark} />}/>
        <Route path="/user/u0/dashboard" element={<Dashboard isDark={isDark} />}/>
        <Route path="/user/u0/compose" element={<Compose isDark={isDark}/>} />
        <Route path="/user/u0/email/:id" element={<EmailViewer isDark={isDark} />} />
        <Route path="/user/u0/profile" element={<ProfilePage isDark={isDark} />} />
        <Route path="/user/u0/settings" element={<SettingsPage isDark={isDark} />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/sent" element={<SentPage isDark={isDark} />} />
        <Route path="/starred" element={<StarredPage isDark={isDark} />} />
        <Route path="/archive" element={<ArchivePage isDark={isDark} />} />
        <Route path="/spam" element={<SpamPage isDark={isDark} />} />
        <Route path="/trash" element={<TrashPage isDark={isDark} />} />
      </Routes>
    </div>
  );
}

export default App;
