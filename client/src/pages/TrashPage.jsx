import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  ArrowLeft,
  Delete,
} from "lucide-react";
// Sidebar is provided by AppLayout
import MailCards from "../components/MailCards";
import { useState as useStateReact } from "react";
import toast from "react-hot-toast";
import { logout } from "../common/firebase";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import { showEmailLists } from "../apiRequests/showEmailLists";
import { getAuth } from "firebase/auth";
import api from "../utils/api";
import { useEmailFetch } from "../hooks/useEmailFetch";
import Loader from "../common/Loader";

export default function TrashPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  // Use the custom hook for email fetching
  const { emails, isLoadingEmails, removeEmail } = useEmailFetch('trash');
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isRestoringBulk, setIsRestoringBulk] = useState(false);

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

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email._id));
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select emails to delete");
      return;
    }

    try {
      if (isDeletingBulk) return;
      setIsDeletingBulk(true);
      // Optimistically remove emails from UI
      selectedEmails.forEach(emailId => removeEmail(emailId));
      setSelectedEmails([]);
      
      // Delete emails permanently one by one in background
      const deletePromises = selectedEmails.map(emailId => 
        api.delete(`/emails/${emailId}/delete`).catch(error => {
          console.error(`Failed to delete email ${emailId}:`, error);
          return { error, emailId };
        })
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => result.error);
      
      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} email(s)`);
      } else {
        toast.success(`${selectedEmails.length} email(s) deleted permanently`);
      }
    } catch (error) {
      console.error("Error deleting emails:", error);
      toast.error("Failed to delete emails");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleRestore = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select emails to restore");
      return;
    }

    try {
      if (isRestoringBulk) return;
      setIsRestoringBulk(true);
      // Optimistically remove from trash UI
      selectedEmails.forEach((emailId) => removeEmail(emailId));
      const ids = [...selectedEmails];
      setSelectedEmails([]);

      // Bulk restore on server
      await api.patch(`/emails/trash/restore/bulk`, { ids });
      toast.success(`${ids.length} email(s) restored`);
    } catch (error) {
      console.error("Error restoring emails:", error);
      toast.error("Failed to restore emails");
    } finally {
      setIsRestoringBulk(false);
    }
  };

  // Per-item restore removed; use bulk actions above

  if (!user) return null;

  if (isLoadingEmails) {
    return (
      <div className={isDark ? "dark" : ""}>
        <Loader text="Loading trash…" />
      </div>
    );
  }

  return (
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className={`border-b p-4 ${
            isDark ? "bg-[#232326]" : "bg-white"
          } border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('/user/u0/dashboard')}
                className={`p-2 rounded-full hover:${
                  isDark ? "bg-[#232326]" : "bg-[#f3f4f6]"
                } ${isDark ? "text-[#f3f4f6]" : "text-[#111]"}`}
                title="Back to Inbox"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#9aa0a6]' : 'text-[#bdbdbd]'}`} />
                <input
                  placeholder="Search trash..."
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
                        console.log("hello");
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
                  <h2 className="text-4xl font-bold">Trash</h2>
                  {filteredEmails.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === filteredEmails.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-500">
                        {selectedEmails.length} of {filteredEmails.length} selected
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedEmails.length > 0 && (
                    <>
                      <button
                        onClick={handleRestore}
                        disabled={isRestoringBulk}
                        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition ${isRestoringBulk ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isRestoringBulk ? 'Restoring…' : 'Restore'}
                      </button>
                    <button
                      onClick={handlePermanentDelete}
                      disabled={isDeletingBulk}
                      className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition ${isDeletingBulk ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Delete className="w-4 h-4" />
                      {isDeletingBulk ? 'Deleting…' : 'Delete Permanently'}
                    </button>
                    </>
                  )}
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                    <MoreHorizontal className="w-4 h-4 text-[#111]" />
                  </button>
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
              {isLoadingEmails ? (
                <div className="p-6 space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`rounded-xl ${isDark ? 'bg-[#232326]' : 'bg-white'} border ${isDark ? 'border-[#2E2E2E]' : 'border-[#e5e7eb]'} p-4 animate-pulse`}>
                      <div className="h-4 w-1/3 bg-gray-300/50 rounded mb-2"></div>
                      <div className="h-3 w-2/3 bg-gray-300/40 rounded mb-1"></div>
                      <div className="h-3 w-1/2 bg-gray-300/30 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Trash2 className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">Trash is empty</h3>
                  <p className="text-gray-400">Deleted emails will appear here</p>
                </div>
              ) : (
                <MailCards
                  isDark={isDark}
                  emails={filteredEmails}
                  setSelectedEmail={(email) => {
                    // For trash, we don't open emails, just select them
                    handleSelectEmail(email._id);
                  }}
                  isTrashMode={true}
                  selectedEmails={selectedEmails}
                  onSelectEmail={handleSelectEmail}
                />
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
