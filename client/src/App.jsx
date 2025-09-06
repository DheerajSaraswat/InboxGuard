import { createContext, useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import { Routes, Route } from "react-router-dom";
import { lookInSession } from "./common/session";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

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
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />
        </Routes>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;