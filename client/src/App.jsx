import { createContext, useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/Authentication/SigninPage";
import SignupPage from "./pages/Authentication/SignupPage";
import { Routes, Route } from "react-router-dom";
import { lookInSession } from "./common/session";
import ForgotPasswordPage from "./pages/Authentication/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext.jsx";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [userAuth, setUserAuth] = useState("");
  const [theme, setTheme] = useState(() => (darkTheme() ? "dark" : "light"));
  useEffect(() => {
    const themeInSession = lookInSession("theme");
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
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element=
          {<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;