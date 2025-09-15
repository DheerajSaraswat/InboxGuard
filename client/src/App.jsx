import { createContext, useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/Authentication/SigninPage";
import SignupPage from "./pages/Authentication/SignupPage";
import { Routes, Route } from "react-router-dom";
import { lookInSession } from "./common/session";
import ForgotPasswordPage from "./pages/Authentication/ForgotPasswordPage";
import Dashboard from "./pages/dashboard";
import { AuthProvider } from "./context/AuthContext.jsx";
import AnimationWrapper from "./common/AnimationWrapper.jsx";
import VerifyEmailPage from "./pages/Authentication/VerifyEmailPage.jsx";


export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [userAuth, setUserAuth] = useState("");
  const [theme, setTheme] = useState(() => (darkTheme() ? "dark" : "light"));
  useEffect(() => {
    const userInSession = lookInSession("user");
    const themeInSession = lookInSession("theme");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
    themeInSession
      ? setTheme(() => {
          document.body.setAttribute("data-theme", themeInSession);
          return themeInSession;
        })
      : document.body.setAttribute("data-theme", theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={
            <AnimationWrapper>
               <SigninPage />
            </AnimationWrapper>
           } />
          <Route path="/signup" element={
            <AnimationWrapper>
            <SignupPage />
            </AnimationWrapper>
            } />
          <Route path="/verify-email" element={
             <VerifyEmailPage />
          } />
          <Route path="/reset-password" element={
            <ForgotPasswordPage />
          } />
          <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;