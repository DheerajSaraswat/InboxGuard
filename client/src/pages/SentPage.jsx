import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MoreHorizontal, Search, User, LogOut, Moon, Sun, UserCircle, Send } from "lucide-react";
import Sidebar from "../components/Sidebar";
import MailCards from "../components/MailCards";
import toast from "react-hot-toast";
import { logout } from "../common/firebase";
import { useDispatch } from "react-redux";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import { useEmailFetch } from "../hooks/useEmailFetch";
import EmailModal from "../components/EmailModal";

export default function SentPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  // Use the custom hook for email fetching
  const { emails, isLoadingEmails, updateEmail } = useEmailFetch('sent');

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

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
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
          <span className="text-lg font-medium">Loading sent emails…</span>
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
            isDark ? "bg-[#232326]" : "bg-white"
          } border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#9aa0a6]' : 'text-[#bdbdbd]'}`} />
                <input
                  placeholder="Search sent emails..."
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
                  isDark ? "bg-[#232326]" : "bg-[#f3f4f6]"
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
        <div className="flex-1 flex border-l border-gray-200 min-h-0">
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              isDark ? "bg-[#18181b]" : "bg-white"
            }`}
          >
            <div
              className={`p-4 border-b ${
                isDark ? "bg-[#232326]" : "bg-white"
              } border-gray-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Send className="w-8 h-8 text-green-500" />
                  <h2 className="text-4xl font-bold">Sent</h2>
                </div>
                <button
                  className={`bg-transparent p-2 rounded-full transition-colors ${
                    isDark ? "hover:bg-[#18181b]" : "hover:bg-[#f3f4f6]"
                  }`}
                >
                  <MoreHorizontal
                    className={`w-4 h-4 ${isDark ? "text-[#bdbdbd]" : "text-[#111]"}`}
                  />
                </button>
              </div>
            </div>
            <div
              className={`flex-1 overflow-y-auto ${
                isDark
                  ? "bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]"
                  : "bg-[#F3F6FA]"
              }`}
            >
              {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Send className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No sent emails yet</h3>
                  <p className="text-gray-400">Emails you send will appear here</p>
                </div>
              ) : (
                <MailCards
                  isDark={isDark}
                  emails={emails}
                  setSelectedEmail={handleEmailClick}
                  onEmailUpdate={updateEmail}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showModal && selectedEmail && (
        <EmailModal
          emailId={selectedEmail._id}
          isOpen={showModal}
          onClose={handleCloseModal}
          isDark={isDark}
        />
      )}
    </div>
  );
}

