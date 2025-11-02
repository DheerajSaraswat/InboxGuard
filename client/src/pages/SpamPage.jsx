import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  MoreHorizontal,
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  AlertTriangle,
  Trash2,
  Shield,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { logout } from "../common/firebase";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import { getAuth } from "firebase/auth";
import { useEmailFetch } from "../hooks/useEmailFetch";
import { getEmailById } from "../apiRequests/getEmailById";
import MailDetail from "../components/MailDetail";
import api from "../utils/api";

export default function SpamPage({ isDark: isDarkProp }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = typeof isDarkProp === 'boolean' ? isDarkProp : theme === "dark";

  // Use the custom hook for email fetching with spam mailbox
  const { emails, isLoadingEmails, updateEmail, removeEmail } = useEmailFetch('spam');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);

  const normalize = (s = "") => String(s || "").toLowerCase();
  const matchesQuery = (email) => {
    if (!searchQuery) return true;
    const q = normalize(searchQuery);
    const subject = normalize(email.subject);
    const fromUser = email.from || {};
    const toUser = (email.to && email.to[0] && email.to[0].user) || {};
    const fromUsername = normalize(fromUser.username);
    const fromFullname = normalize(fromUser.fullname);
    const toUsername = normalize(toUser.username);
    const toFullname = normalize(toUser.fullname);
    return (
      subject.includes(q) ||
      fromUsername.includes(q) ||
      fromFullname.includes(q) ||
      toUsername.includes(q) ||
      toFullname.includes(q)
    );
  };
  const filteredEmails = emails.filter(matchesQuery);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      console.log("Logging out...");
      await logout();
      dispatch(sliceLogout());
      toast.success("Logged out successfully");
      navigate("/signin");
      console.log("Logged out");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // Tailwind dark mode: add/remove 'dark' class on html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const handleEmptySpam = async () => {
    try {
      // Move all spam emails to trash
      for (const email of emails) {
        await api.put(`/emails/${email._id}/move-to-trash`);
      }
      toast.success("Spam folder emptied");
      // Refresh emails list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to empty spam");
    }
  };

  const getThreatLevelBadge = (level) => {
    const levelStr = String(level || '').toLowerCase();
    if (levelStr === 'high' || levelStr === 'critical') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
          High Threat
        </span>
      );
    } else if (levelStr === 'medium') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
          Medium Threat
        </span>
      );
    } else if (levelStr === 'low') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black">
          Low Threat
        </span>
      );
    }
    return null;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  if (!user) return null;

  if (isLoadingEmails) {
    return (
      <div
        className={`flex min-h-screen h-screen items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-[#18181b] text-[#f3f4f6]" : "bg-[#fafbfc] text-[#111]"
        }`}
        style={{
          fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-current border-t-transparent" />
          <span className="text-lg font-medium">Loading spam folder…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen h-screen transition-colors duration-300 ${
        isDark ? "bg-[#18181b] text-[#f3f4f6]" : "bg-[#fafbfc] text-[#111]"
      }`}
      style={{
        fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <Sidebar isDark={isDark} />
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className={`border-b p-4 ${
            isDark ? "bg-[#232326] border-[#3c4043]" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#9aa0a6]' : 'text-[#bdbdbd]'}`} />
                <input
                  placeholder="Search spam emails..."
                  className={`pl-10 py-2 w-full rounded-lg border ${isDark ? 'bg-[#303134] border-[#5f6368] text-[#e8eaed] placeholder-[#9aa0a6]' : 'bg-white border-gray-300 text-[#111] placeholder-gray-400'}`}
                  style={{
                    fontSize: "1rem",
                    fontFamily:
                      'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className={`bg-transparent p-2 rounded-full hover:${
                  isDark ? "bg-[#303134]" : "bg-[#f3f4f6]"
                } ${isDark ? "text-yellow-400" : "text-[#111]"}`}
                onClick={() => dispatch(toggleTheme())}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-[#111]" />
                )}
              </button>
              <div
                className={`relative flex items-center gap-1 px-3 py-2 rounded-lg ${
                  isDark ? "text-[#f3f4f6] bg-[#232326]" : "text-[#111]"
                } cursor-pointer`}
              >
                <div
                  className="flex items-center gap-1"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <img
                    src={user?.displayImage}
                    className={`w-8 h-8 ${
                      isDark
                        ? "text-[#f3f4f6] bg-[#232326]"
                        : "text-[#111] bg-[#e5e7eb]"
                    } rounded-full p-1`}
                  />
                  <ChevronDown
                    className={`w-4 h-4 stroke-[3] ${
                      isDark ? "text-[#f3f4f6]" : "text-[#111]"
                    }`}
                  />
                </div>

                {showDropdown && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 ${
                      isDark
                        ? "bg-[#232326] border-[#232326]"
                        : "bg-white border-[#e5e7eb]"
                    } border rounded-2xl shadow-xl z-10 py-2 font-sans`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/user/u0/profile");
                        setShowDropdown(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-5 py-3 hover:${
                        isDark ? "bg-[#18181b]" : "bg-[#f3f4f6]"
                      } rounded-xl ${
                        isDark ? "text-[#f3f4f6]" : "text-[#111]"
                      } text-xl font-semibold`}
                    >
                      <UserCircle
                        className={`w-8 h-8 ${
                          isDark
                            ? "bg-[#18181b] text-[#f3f4f6]"
                            : "bg-[#e5e7eb] text-[#111]"
                        } rounded-full p-1`}
                      />
                      <span className="pl-2">Profile</span>
                    </button>

                    <div
                      className={`border-t ${
                        isDark ? "border-[#18181b]" : "border-gray-400"
                      } mx-4 my-2`}
                    />

                    <button
                      className={`flex items-center gap-3 w-full text-left px-5 py-3 ${
                        isDark ? "hover:bg-[#18181b]" : "hover:bg-[#fbe9ea]"
                      } text-[#E50914] transition-all duration-150 rounded-xl font-semibold text-xl`}
                      onMouseDown={handleLogOut}
                    >
                      <LogOut
                        className={`w-8 h-8 text-[#E50914] ${
                          isDark ? "bg-[#18181b]" : "bg-[#fbe9ea]"
                        } rounded-full p-1`}
                      />
                      <span className="pl-2">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex min-h-0">
          {/* Gmail-style: Split view - Email list on left, detail on right when selected */}
          <div
            className={`flex flex-col min-h-0 transition-all duration-300 ${
              selectedEmail ? "w-1/3 lg:w-2/5" : "flex-1"
            } ${
              isDark ? "bg-[#18181b] border-[#3c4043]" : "bg-white border-gray-200"
            } border-r`}
          >
            <div
              className={`p-4 border-b ${
                isDark ? "bg-[#232326] border-[#3c4043]" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-[#E50914]" />
                  <h2 className="text-4xl font-bold">Spam</h2>
                </div>
                <div className="flex items-center gap-2">
                  {filteredEmails.length > 0 && (
                    <button
                      onClick={handleEmptySpam}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isDark
                          ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600"
                          : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Empty Spam
                    </button>
                  )}
                  <button className={`bg-transparent p-2 rounded-full transition-colors ${
                    isDark ? "hover:bg-[#303134]" : "hover:bg-[#f3f4f6]"
                  }`}>
                    <MoreHorizontal className={`w-4 h-4 ${isDark ? "text-[#e8eaed]" : "text-[#111]"}`} />
                  </button>
                </div>
              </div>
              
              {/* Protection Message */}
              <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                isDark ? "bg-[#1a1a1d] border border-[#3c4043]" : "bg-blue-50 border border-blue-200"
              }`}>
                <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? "text-[#8ab4f8]" : "text-blue-600"}`} />
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-[#e8eaed]" : "text-blue-900"}`}>
                    InboxGuard Protection Active
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-[#9aa0a6]" : "text-blue-700"}`}>
                    These emails have been identified as potential threats and automatically filtered.
                  </p>
                </div>
              </div>
            </div>
            <div
              className={`flex-1 overflow-y-auto ${
                isDark
                  ? "bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]"
                  : "bg-[#F3F6FA]"
              }`}
            >
              {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No spam emails
                  </h3>
                  <p className={isDark ? "text-gray-500" : "text-gray-400"}>
                    Your spam folder is clean
                  </p>
                </div>
              ) : (
                <div className={`flex flex-col gap-4 py-6 px-4 ${isDark ? 'bg-transparent' : 'bg-[#F3F6FA]'}`}>
                  {filteredEmails.map((email) => (
                    <div
                      key={email._id}
                      className={`rounded-xl flex p-4 cursor-pointer transition-all duration-200 shadow-lg hover:scale-[1.01] border-2 ${
                        isDark
                          ? "bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326]"
                          : "bg-white border-[#e5e7eb]"
                      }`}
                      onClick={() => {
                        (async () => {
                          try {
                            const full = await getEmailById(email._id);
                            setSelectedEmail(full);
                          } catch {}
                        })();
                      }}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <AlertTriangle className={`w-5 h-5 mt-1 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold mb-1 ${isDark ? "text-[#e8eaed]" : "text-gray-900"}`}>
                            {email.from?.platformMail || email.from?.email || "Unknown"}
                          </div>
                          <div className={`text-base mb-2 ${isDark ? "text-[#9aa0a6]" : "text-gray-600"}`}>
                            {email.subject || "(No Subject)"}
                          </div>
                          <div className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {email.bodyPreview || ""}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {getThreatLevelBadge(email.securityAnalysis?.riskLevel)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {formatTimeAgo(email.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email Detail Panel */}
          {selectedEmail && (
            <MailDetail
              email={selectedEmail}
              isDark={isDark}
              onBack={() => setSelectedEmail(null)}
              onDelete={() => {
                // Move to trash
                api.put(`/emails/${selectedEmail._id}/move-to-trash`)
                  .then(() => {
                    toast.success("Moved to trash");
                    setSelectedEmail(null);
                    removeEmail(selectedEmail._id);
                  })
                  .catch(() => toast.error("Failed to move to trash"));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

