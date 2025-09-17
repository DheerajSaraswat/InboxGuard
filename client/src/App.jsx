import HomePage from "./pages/HomePage";
import SigninPage from "./pages/Authentication/SigninPage";
import SignupPage from "./pages/Authentication/SignupPage";
import { Routes, Route } from "react-router-dom";
import ForgotPasswordPage from "./pages/Authentication/ForgotPasswordPage";
import Dashboard from "./pages/dashboard";
import AnimationWrapper from "./common/AnimationWrapper.jsx";
import VerifyEmailPage from "./pages/Authentication/VerifyEmailPage.jsx";
import { useSelector } from "react-redux";

function App() {
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  return (
    <div className={isDark ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<HomePage isDark={isDark} />} />
        <Route path="/signin" element={
          <AnimationWrapper>
            <SigninPage isDark={isDark} />
          </AnimationWrapper>
        } />
        <Route path="/signup" element={
          <AnimationWrapper>
            <SignupPage isDark={isDark} />
          </AnimationWrapper>
        } />
        <Route path="/verify-email" element={<VerifyEmailPage isDark={isDark} />} />
        <Route path="/reset-password" element={<ForgotPasswordPage isDark={isDark} />} />
        <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
      </Routes>
    </div>
  );
}

export default App;