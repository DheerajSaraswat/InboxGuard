import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// Sidebar is provided by AppLayout
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Moon,
  Sun,
  UserCircle,
  FileText,
  LogOut,
} from "lucide-react";
import { showEmailLists } from "../apiRequests/showEmailLists";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import { deleteDraft } from "../apiRequests/deleteDraft";
import { logout } from "../common/firebase";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";
import Loader from "../common/Loader";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  // Filter drafts based on search query
  const normalize = (s = "") => String(s || "").toLowerCase();
  const filteredDrafts = drafts.filter((draft) => {
    if (!searchQuery) return true;
    const q = normalize(searchQuery);
    const subject = normalize(draft.subject || "");
    const toEmail = draft.to && draft.to[0] ? normalize(draft.to[0].user?.platformMail || draft.to[0].user?.email || "") : "";
    const bodyPreview = normalize(draft.bodyPreview || "");
    return (
      subject.includes(q) ||
      toEmail.includes(q) ||
      bodyPreview.includes(q)
    );
  });

  const fetchDrafts = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const auth = getAuth();
      await auth.currentUser?.getIdToken(false);
      const list = await showEmailLists("drafts");
      setDrafts(Array.isArray(list.emails) ? list.emails : []);
    } catch (e) {
      console.error("Failed to load drafts:", e);
      toast.error("Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteDraft = async (draftId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this draft?")) {
      return;
    }
    try {
      await deleteDraft(draftId);
      toast.success("Draft deleted successfully");
      fetchDrafts(); // Reload drafts
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    }
  };

  if (!user) return null;

  if (isLoading) {
    return <Loader text="Loading drafts…" />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden">
      <div
        className={`border-b p-4 ${isDark ? "bg-[#232326]" : "bg-white"
          } border-gray-200`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#9aa0a6]' : 'text-[#bdbdbd]'}`} />
              <input
                placeholder="Search drafts..."
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
              className={`bg-transparent p-2 rounded-full hover:${isDark ? "bg-[#232326]" : "bg-[#f3f4f6]"
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
              className={`relative flex items-center gap-1 px-3 py-2 rounded-lg ${isDark ? "text-[#f3f4f6] bg-[#232326]" : "text-[#111]"
                } cursor-pointer`}
            >
              <div
                className="flex items-center gap-1"
                onClick={() => setShowDropdown((v) => !v)}
              >
                <img
                  src={user?.displayImage}
                  className={`w-8 h-8 ${isDark
                      ? "text-[#f3f4f6] bg-[#232326]"
                      : "text-[#111] bg-[#e5e7eb]"
                    } rounded-full p-1`}
                />
                <ChevronDown
                  className={`w-4 h-4 stroke-[3] ${isDark ? "text-[#f3f4f6]" : "text-[#111]"
                    }`}
                />
              </div>

              {showDropdown && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 ${isDark
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
                    className={`flex items-center gap-3 w-full text-left px-5 py-3 hover:${isDark ? "bg-[#18181b]" : "bg-[#f3f4f6]"
                      } rounded-xl ${isDark ? "text-[#f3f4f6]" : "text-[#111]"
                      } text-xl font-semibold`}
                  >
                    <UserCircle
                      className={`w-8 h-8 ${isDark
                          ? "bg-[#18181b] text-[#f3f4f6]"
                          : "bg-[#e5e7eb] text-[#111]"
                        } rounded-full p-1`}
                    />
                    <span className="pl-2">Profile</span>
                  </button>

                  <div
                    className={`border-t ${isDark ? "border-[#18181b]" : "border-gray-400"
                      } mx-4 my-2`}
                  />

                  <button
                    className={`flex items-center gap-3 w-full text-left px-5 py-3 ${isDark ? "hover:bg-[#18181b]" : "hover:bg-[#fbe9ea]"
                      } text-[#E50914] transition-all duration-150 rounded-xl font-semibold text-xl`}
                    onMouseDown={handleLogOut}
                  >
                    <LogOut
                      className={`w-8 h-8 text-[#E50914] ${isDark ? "bg-[#18181b]" : "bg-[#fbe9ea]"
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
      <div className="flex-1 flex min-h-0 min-w-0 overflow-x-hidden">
        <div
          className={`flex-1 flex flex-col min-h-0 min-w-0 ${isDark ? "bg-[#18181b]" : "bg-white"
            }`}
        >
          <div
            className={`p-4 border-b ${isDark ? "bg-[#232326]" : "bg-white"
              } border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-blue-500" />
                <h2 className="text-4xl font-bold">Drafts</h2>
              </div>
            </div>
          </div>
          <div
            className={`flex-1 overflow-y-auto min-w-0 ${isDark
                ? "bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]"
                : "bg-[#F3F6FA]"
              } p-8`}
          >
            {filteredDrafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  {searchQuery ? "No drafts found" : "No drafts saved"}
                </h3>
                <p className="text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Drafts you save will appear here"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {filteredDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    className={`rounded-3xl flex p-4 px-10 cursor-pointer transition-all duration-200 shadow-2xl hover:scale-[1.01] border-2 ${isDark
                        ? "bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326] backdrop-blur-[2px]"
                        : "bg-white border-[#e5e7eb]"
                      }`}
                    onClick={() => navigate(`/user/u0/compose?draft=${draft._id}`)}
                  >
                    <div className={`flex items-center gap-4`}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${isDark
                            ? "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-blue-200"
                            : "bg-blue-300 text-white"
                          } text-xl`}
                      >
                        {draft.to && draft.to[0]
                          ? (draft.to[0].user?.platformMail || draft.to[0].user?.email || "D")?.[0]?.toUpperCase()
                          : "D"}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-base font-semibold ${isDark ? "text-blue-200" : "text-black"
                            }`}
                        >
                          {draft.to && draft.to[0]
                            ? draft.to[0].user?.platformMail || draft.to[0].user?.email || "(Draft)"
                            : "(Draft)"}
                        </span>
                        <span
                          className={`font-bold text-xl ${isDark ? "text-white" : "text-black"
                            } font-sans`}
                        >
                          {draft.subject || "(No Subject)"}
                        </span>
                        <span
                          className={`text-base ${isDark ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                          {draft.bodyPreview
                            ? draft.bodyPreview.slice(0, 80)
                            : ""}
                          {draft.bodyPreview && draft.bodyPreview.length > 80
                            ? "..."
                            : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex ml-auto flex-col gap-2">
                      <div className="flex flex-col justify-between ml-auto">
                        <span
                          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                          {new Date(draft.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex ml-auto justify-end mt-auto gap-2">
                        <button
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/u0/compose?draft=${draft._id}`);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                          onClick={(e) => handleDeleteDraft(draft._id, e)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
