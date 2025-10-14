import React, {useState} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PenSquare,
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  Shield,
  Trash2,
  Settings,
} from "lucide-react";
import logo from "../assets/LightThemeLogo.png";
import { Link } from "react-router-dom";



export default function Sidebar({ isDark }) {
  const [open, setOpen] = useState(false);
  const draftCount = useSelector(state => state.draft.drafts.length);
  const navigate = useNavigate();

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
          fixed md:static top-0 left-0 z-40
          h-full w-64 min-h-screen
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
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? "bg-[#232326] text-[#f3f4f6] font-bold shadow-inner border-l-4 border-[#E50914]"
                  : "bg-gray-200 text-[#111] font-semibold"
              } hover:scale-[1.03] transition`}
            >
              <Inbox className="w-4 h-4" /> Inbox{" "}
              <span
                className={`ml-auto ${
                  isDark
                    ? "bg-[#18181b] text-[#f3f4f6]"
                    : "bg-[#e5e7eb] text-[#111]"
                } text-xs px-2 py-1 rounded-full`}
              ></span>
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } font-normal transition`}
            >
              <Star className="w-4 h-4" /> Starred
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Send className="w-4 h-4" /> Sent
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
              onClick={() => navigate('/drafts')}
            >
              <FileText className="w-4 h-4" /> Drafts
              <span className="ml-auto bg-[#e5e7eb] text-xs px-2 py-1 rounded-full text-[#111]">{draftCount}</span>
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? "hover:bg-[#232326]/80 text-[#f3f4f6]"
                  : "hover:bg-[#f3f4f6] text-[#111]"
              } transition`}
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
                  ? " font-bold hover:bg-[#18181b] "
                  : "text-[#E50914] hover:bg-[#f3f4f6] font-semibold"
              } transition`}
            >
              <Shield className="w-4 h-4" /> Spam{" "}
              <span className="ml-auto bg-[#E50914] text-white text-xs px-2 py-1 rounded-full"></span>
            </button>
            <button
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${
                isDark
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
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
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
