import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PenSquare,
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Trash2,
  Settings,
  AlertTriangle,
} from "lucide-react";
import logo from "../assets/LightThemeLogo.png";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function Sidebar({ isDark }) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sidebar_open");
      return saved === "true" ? true : false;
    } catch {
      return false;
    }
  });
  const draftCount = useSelector((state) => state.draft.drafts.length);
  const navigate = useNavigate();
  const location = useLocation();
  const [usage, setUsage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sidebar_unread");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [spamCount, setSpamCount] = useState(() => {
    try {
      const saved = sessionStorage.getItem("sidebar_spam");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Helper function to determine if a route is active
  const isActiveRoute = (path) => {
    if (path === "/user/u0" || path === "/user/u0/dashboard") {
      return (
        location.pathname === "/user/u0" ||
        location.pathname === "/user/u0/dashboard"
      );
    }
    return location.pathname === path;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/storage-usage");
        setUsage(res.data);
      } catch {}
    })();
  }, []);

  // Persist sidebar open state across navigations (mobile UX)
  useEffect(() => {
    try {
      sessionStorage.setItem("sidebar_open", open ? "true" : "false");
    } catch {}
  }, [open]);

  // Fetch unread count and spam count periodically
  useEffect(() => {
    let isMounted = true;
    let hasFetched = false;

    const fetchCounts = async () => {
      if (!isMounted) return;

      try {
        const [inboxRes, spamRes] = await Promise.all([
          api.get("/emails/emailList?mailbox=inbox"),
          api
            .get("/emails/emailList?mailbox=spam")
            .catch(() => ({ data: { emails: [] } })),
        ]);
        if (!isMounted) return;

        const inboxEmails = inboxRes.data?.emails || [];
        const unread = inboxEmails.filter(
          (email) => !email.to?.[0]?.readAt
        ).length;
        setUnreadCount(unread);
        try { sessionStorage.setItem("sidebar_unread", String(unread)); } catch {}

        const spamEmails = spamRes.data?.emails || [];
        const spam = spamEmails.filter(
          (e) =>
            e.securityAnalysis?.riskLevel &&
            ["medium", "high", "critical"].includes(
              e.securityAnalysis.riskLevel
            )
        ).length;
        setSpamCount(spam);
        try { sessionStorage.setItem("sidebar_spam", String(spam)); } catch {}
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch counts:", error);
        }
      }
    };

    // Only fetch after initial mount delay to avoid race conditions
    const timeout = setTimeout(() => {
      if (isMounted && !hasFetched) {
        fetchCounts();
        hasFetched = true;
      }
    }, 1000);

    const interval = setInterval(() => {
      if (isMounted) {
        fetchCounts();
      }
    }, 45000); // Check every 45 seconds to avoid quota issues

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#E50914] text-white p-2 rounded-lg shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open sidebar"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {/* Sidebar */}
      <div
        className={`
    fixed md:relative top-0 left-0 z-40
    h-full w-64 min-h-screen flex-shrink-0
    transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${
      isDark
        ? "bg-gradient-to-b from-[#232326] via-[#18181b] to-[#111] shadow-2xl border-r border-[#23232b]/70 backdrop-blur-[2px]"
        : "bg-gray-50 shadow-xl"
    }
  `}
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <div className="p-4">
          <img src={logo} className={`pb-4 ${isDark ? "invert" : ""}`} />
          <Link
            to="/user/u0/compose?compose=new"
            className={`w-full mb-6 gap-2 ${
              isDark
                ? "bg-gradient-to-r from-[#232326] via-[#18181b] to-[#232326] text-[#f3f4f6] border border-[#333] shadow-lg/80"
                : "bg-blue-600 text-white"
            } py-3 px-4 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:scale-[1.03] transition`}
            style={{ fontSize: "1rem", letterSpacing: "0.02em" }}
          >
            <PenSquare className="w-5 h-5 mr-2" /> Compose
          </Link>
          <nav className="flex flex-col gap-4 text-[1rem]">
            <button
              onClick={() => navigate("/user/u0/dashboard")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/user/u0/dashboard")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Inbox className="w-4 h-4" /> Inbox{" "}
              {unreadCount > 0 && (
                <span
                  className={`ml-auto ${
                    isDark ? "bg-red-600 text-white" : "bg-red-500 text-white"
                  } text-xs px-2 py-1 rounded-full font-bold`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/starred")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/starred")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Star className="w-4 h-4" /> Starred
            </button>
            <button
              onClick={() => navigate("/sent")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/sent")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Send className="w-4 h-4" /> Sent
            </button>
            <button
              onClick={() => navigate("/drafts")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/drafts")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <FileText className="w-4 h-4" /> Drafts
              {draftCount > 0 && (
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-full font-bold ${
                    isDark
                      ? "bg-blue-600 text-white"
                      : "bg-[#e5e7eb] text-[#111]"
                  }`}
                >
                  {draftCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/archive")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/archive")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button
              onClick={() => navigate("/user/u0/spam")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/user/u0/spam") || isActiveRoute("/spam")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <AlertTriangle className="w-4 h-4" /> Spam
              {spamCount > 0 && (
                <span
                  className={`ml-auto ${
                    isDark ? "bg-red-600 text-white" : "bg-red-500 text-white"
                  } text-xs px-2 py-1 rounded-full font-bold`}
                >
                  {spamCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/trash")}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isActiveRoute("/trash")
                  ? isDark
                    ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                    : "bg-gray-200 text-[#111] font-semibold"
                  : isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Trash2 className="w-4 h-4" /> Trash
            </button>
          </nav>
          <hr
            className={`my-4 ${isDark ? "border-[#333]" : "border-gray-400"}`}
          />
          <button
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
              isDark
                ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                : "hover:bg-[#f3f4f6] text-[#111]"
            } font-normal transition`}
            onClick={() => navigate("/user/u0/settings")}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          {usage && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Storage: {Math.round((usage.used / usage.limit) * 100)}% (
              {Math.round(usage.used / 1024 / 1024)} MB /{" "}
              {Math.round(usage.limit / 1024 / 1024)} MB)
            </div>
          )}
        </div>
        {/* Sidebar separation */}
      </div>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
