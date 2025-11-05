import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RouteTransition from "./RouteTransition";

export default function AppLayout({ isDark }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      // Don't trigger shortcuts when user is typing in input fields
      const activeElement = document.activeElement;
      const isInputField = 
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable ||
        activeElement?.getAttribute("contenteditable") === "true";
      
      if (isInputField) return;
      
      // Basic keyboard shortcuts with Shift for navigation
      if (!e.shiftKey) return;
      const key = e.key?.toLowerCase();
      if (key === "i") navigate("/user/u0/dashboard");
      if (key === "s") navigate("/user/u0/spam");
      if (key === "a") navigate("/archive");
      if (key === "t") navigate("/trash");
      if (key === "r") navigate("/starred");
      if (key === "e") navigate("/sent");
      if (key === "d") navigate("/drafts");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, location.pathname]);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className={`flex min-h-screen h-screen ${isDark ? "bg-[#18181b] text-[#f3f4f6]" : "bg-[#fafbfc] text-[#111]"}`}>
        <Sidebar isDark={isDark} />
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </div>
      </div>
    </div>
  );
}


