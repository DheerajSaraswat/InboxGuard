import {
  ChevronDown,
  Search,
  Trash2,
  User,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react";

import React, { useEffect } from "react";
// Sidebar is provided by AppLayout
import MailCards from "../components/MailCards";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../common/firebase";
import { useDispatch, useSelector } from "react-redux";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import MailDetail from "../components/MailDetail";
import Loader from "../common/Loader";
import { getEmailById } from "../apiRequests/getEmailById";
import { moveEmailToTrash } from "../apiRequests/moveToTrash";
import { useEmailFetch } from "../hooks/useEmailFetch";
import { getAuth } from "firebase/auth";

export default function Dashboard() {
  // State for selected email
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  // Use the custom hook for email fetching
  const { emails, isLoadingEmails, updateEmail, removeEmail } =
    useEmailFetch("inbox");
  const [searchQuery, setSearchQuery] = useState("");

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
      await logout();
      dispatch(sliceLogout());
      toast.success("Logged out successfully");
      navigate("/signin");
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

  const handleDeleteEmail = async (email) => {
    try {
      await moveEmailToTrash(email._id);
      toast.success("Email moved to trash");
      setSelectedEmail(null);
      // Use the hook's removeEmail function for optimistic updates
      removeEmail(email._id);
    } catch (error) {
      console.error("Error moving email to trash:", error);
      toast.error("Failed to move email to trash");
    }
  };

  if (!user) return null;

  if (isLoadingEmails) {
    return <Loader text="Loading your inbox…" />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden">
      <div
        className={`border-b p-2 sm:p-4 ${
          isDark ? "bg-[#232326]" : "bg-white"
        } border-gray-200`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? "text-[#9aa0a6]" : "text-[#bdbdbd]"
                }`}
              />
              <input
                placeholder="Search sent emails..."
                className={`pl-10 py-2 w-full rounded-lg border ${
                  isDark
                    ? "bg-[#303134] border-[#5f6368] text-[#e8eaed] placeholder-[#9aa0a6]"
                    : "bg-white border-gray-300 text-[#111] placeholder-gray-400"
                }`}
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
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className={`bg-transparent p-2 rounded-full transition-colors active:scale-95 ${
                isDark ? "hover:bg-[#232326] text-yellow-400" : "hover:bg-[#f3f4f6] text-[#111]"
              }`}
              onClick={() => dispatch(toggleTheme())}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-[#111]" />
              )}
            </button>
            <div
              className={`relative flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors ${
                isDark ? "text-[#f3f4f6] bg-[#232326] hover:bg-[#2E2E2E]" : "text-[#111] hover:bg-gray-50"
              } cursor-pointer active:scale-95`}
            >
              <div
                className="flex items-center gap-1"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <img
                  src={user?.displayImage}
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    isDark
                      ? "text-[#f3f4f6] bg-[#232326]"
                      : "text-[#111] bg-[#e5e7eb]"
                  } rounded-full p-0.5 sm:p-1`}
                  alt="User avatar"
                />
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 stroke-[3] hidden sm:block ${
                    isDark ? "text-[#f3f4f6]" : "text-[#111]"
                  }`}
                />
              </div>

              {showDropdown && (
                <>
                  {/* Mobile overlay */}
                  <div 
                    className="fixed inset-0 z-[5] md:hidden"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 sm:w-64 ${
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-x-hidden">
        {/* Gmail-style: Split view - Email list on left, detail on right when selected */}
        <div
          className={`flex flex-col min-h-0 min-w-0 transition-all duration-300 ${
            selectedEmail ? "hidden lg:flex lg:w-1/3 xl:w-2/5" : "flex-1"
          } ${isDark ? "bg-[#18181b]" : "bg-white"} border-r border-gray-200`}
        >
          <div
            className={`p-3 sm:p-4 border-b ${
              isDark ? "bg-[#232326]" : "bg-white"
            } border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <h2 className={`${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'} text-2xl sm:text-3xl lg:text-4xl font-bold`}>Inbox</h2>
            </div>
          </div>
          <div
            className={`flex-1 overflow-y-auto ${
              isDark
                ? "bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]"
                : "bg-[#F3F6FA]"
            }`}
          >
            <MailCards
              isDark={isDark}
              emails={filteredEmails}
              setSelectedEmail={(email) => {
                (async () => {
                  try {
                    // optimistically mark read in UI
                    updateEmail(email._id, {
                      to: [
                        {
                          ...(email.to?.[0] || {}),
                          readAt: new Date().toISOString(),
                        },
                      ],
                    });
                    const full = await getEmailById(email._id);
                    setSelectedEmail(full);
                  } catch {}
                })();
              }}
              onEmailUpdate={updateEmail}
            />
            {filteredEmails.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <span className="text-xl font-semibold text-gray-500 mb-2">
                  No results
                </span>
                <p className="text-gray-400">Try a different subject or name</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail Panel - Desktop */}
        {selectedEmail && (
          <div className="hidden lg:flex flex-1 min-h-0">
            <MailDetail
              email={selectedEmail}
              isDark={isDark}
              onBack={() => setSelectedEmail(null)}
              onDelete={() => handleDeleteEmail(selectedEmail)}
            />
          </div>
        )}
        {/* Mobile: Show email detail as full screen when selected */}
        {selectedEmail && (
          <div
            className={`lg:hidden fixed inset-0 z-50 ${
              isDark ? "bg-[#18181b]" : "bg-white"
            }`}
          >
            <MailDetail
              email={selectedEmail}
              isDark={isDark}
              onBack={() => setSelectedEmail(null)}
              onDelete={() => handleDeleteEmail(selectedEmail)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
