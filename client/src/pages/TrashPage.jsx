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
import Sidebar from "../components/Sidebar";
import MailCards from "../components/MailCards";
import { useState as useStateReact } from "react";
import toast from "react-hot-toast";
import { logout } from "../common/firebase";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import { showEmailLists } from "../apiRequests/showEmailLists";
import { getAuth } from "firebase/auth";
import api from "../utils/api";

export default function TrashPage() {
  const [emails, setEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

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

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const auth = getAuth();

    const fetchTrashEmails = async (silent = false) => {
      try {
        if (!silent) setIsLoadingEmails(true);
        // Ensure a fresh token is available; api layer likely reads it
        await auth.currentUser?.getIdToken(true);
        const list = await showEmailLists("trash");
        if (isMounted) setEmails(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        if (isMounted && !silent) toast.error("Failed to load trash");
      } finally {
        if (isMounted && !silent) setIsLoadingEmails(false);
      }
    };

    // Initial load right after login: show loader but suppress error toast
    setIsLoadingEmails(true);
    fetchTrashEmails(true).finally(() => setIsLoadingEmails(false));

    // Also reload when Firebase rotates/refreshed token
    const unsubscribe = auth.onIdTokenChanged((u) => {
      if (u && isMounted) {
        fetchTrashEmails(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [user]);

  const handleProfilePage = (e) => {
    e.preventDefault();
    console.log("hello");
    navigate("/user/u0/profile");
  };

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email._id));
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select emails to delete");
      return;
    }

    try {
      // Delete emails permanently one by one
      for (const emailId of selectedEmails) {
        await api.delete(`/emails/${emailId}/delete`);
      }
      
      toast.success(`${selectedEmails.length} email(s) deleted permanently`);
      setSelectedEmails([]);
      
      // Refresh the trash list
      const list = await showEmailLists("trash");
      setEmails(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error deleting emails:", error);
      toast.error("Failed to delete emails");
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
          <span className="text-lg font-medium">Loading trash…</span>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bdbdbd]" />
                <input
                  placeholder="Search trash..."
                  className="pl-10 py-2 w-full rounded-lg border bg-white text-[#111]"
                  style={{
                    fontSize: "1rem",
                    fontFamily:
                      'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
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
                  {emails.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === emails.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-500">
                        {selectedEmails.length} of {emails.length} selected
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedEmails.length > 0 && (
                    <button
                      onClick={handlePermanentDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <Delete className="w-4 h-4" />
                      Delete Permanently
                    </button>
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
              {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Trash2 className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">Trash is empty</h3>
                  <p className="text-gray-400">Deleted emails will appear here</p>
                </div>
              ) : (
                <MailCards
                  isDark={isDark}
                  emails={emails}
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
    </div>
  );
}
