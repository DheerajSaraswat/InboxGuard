import {
  Bell,
  ChevronDown,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react"

import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MailCards from "../components/MailCards";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../common/firebase";
import { useDispatch, useSelector } from "react-redux";
import { sliceLogout } from "../redux/slices/authSlice";
import { toggleTheme } from "../redux/slices/themeSlice";

export default function Dashboard() {
  // State for selected email
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleLogOut = async(e) => {
      e.preventDefault();
    try{
      console.log("Logging out...");
      await logout();
      dispatch(sliceLogout());
      toast.success("Logged out successfully");
      navigate("/signin");
      console.log("Logged out");
    }catch(error){
      toast.error("Error logging out");
    }
    
  }
  // Tailwind dark mode: add/remove 'dark' class on html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  if(!user) return null;
  
  return (
  <div className={`flex min-h-screen h-screen transition-colors duration-300 ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#fafbfc] text-[#111]'}`} style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
    <Sidebar isDark={isDark}/>
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`border-b p-4 ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bdbdbd]" />
                <input placeholder="Search emails..." className="pl-10 py-2 w-full rounded-lg border bg-white text-[#111]" style={{fontSize:'1rem', fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className={`bg-transparent p-2 rounded-full hover:${isDark ? 'bg-[#232326]' : 'bg-[#f3f4f6]'} ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'}`}>
                <Bell className="w-6 h-6" />
              </button>
              <button className={`bg-transparent p-2 rounded-full hover:${isDark ? 'bg-[#232326]' : 'bg-[#f3f4f6]'} ${isDark ? 'text-yellow-400' : 'text-[#111]'}`} onClick={() => dispatch(toggleTheme())} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#111]" />}
              </button>
              <div className={`relative flex items-center gap-1 px-3 py-2 rounded-lg ${isDark ? 'text-[#f3f4f6] bg-[#232326]' : 'text-[#111] '} cursor-pointer`} tabIndex={0} onClick={() => setShowDropdown(v => !v)} onBlur={() => setShowDropdown(false)}>
                <img src={user?.displayImage} className={`w-8 h-8 ${isDark ? 'text-[#f3f4f6] bg-[#232326]' : 'text-[#111] bg-[#e5e7eb]'} rounded-full p-1`} />
                <ChevronDown className={`w-4 h-4 stroke-[3] ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'}`} />
                {showDropdown && (
                  <div className={`absolute right-0 top-full mt-2 w-56 ${isDark ? 'bg-[#232326] border-[#232326]' : 'bg-white border-[#e5e7eb]'} border rounded-2xl shadow-xl z-10 py-2 font-sans`}>
                    <button className={`flex items-center gap-3 w-full text-left px-5 py-3 hover:${isDark ? 'bg-[#18181b]' : 'bg-[#f3f4f6]'} transition-all duration-150 rounded-xl ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'} font-semibold text-xl`} onClick={() => {/* handle profile */}}>
                      <UserCircle className={`w-8 h-8 ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#e5e7eb] text-[#111]'} rounded-full p-1`} />
                      <span className="font-semibold pl-2 text-xl">Profile</span>
                    </button>
                    <div className={`border-t ${isDark ? 'border-[#18181b]' : 'border-gray-400'} mx-4 my-2`}></div>
                    <button className={`flex items-center gap-3 w-full text-left px-5 py-3 ${isDark ? 'hover:bg-[#18181b]' : 'hover:bg-[#fbe9ea]'} text-[#E50914] transition-all duration-150 rounded-xl font-semibold text-xl`} onMouseDown={handleLogOut}>
                      <LogOut className={`w-8 h-8 text-[#E50914] ${isDark ? 'bg-[#18181b]' : 'bg-[#fbe9ea]'} rounded-full p-1`} />
                      <span className="font-semibold pl-2 text-xl">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  <div className="flex-1 flex border-l border-gray-200 min-h-0">
          {/* Gmail-style: Inbox full width if no email selected, else split view */}
          {!selectedEmail ? (
            <div className={`flex-1 flex flex-col min-h-0 ${isDark ? 'bg-[#18181b]' : 'bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold">Inbox</h2>
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                    <MoreHorizontal className="w-4 h-4 text-[#111]" />
                  </button>
                </div>
              </div>
              <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]' : 'bg-[#F3F6FA]'}`}>
                <MailCards isDark={isDark} setSelectedEmail={setSelectedEmail} />
              </div>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col min-h-0 ${isDark ? 'bg-[#18181b]' : 'bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-400 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]" onClick={()=>setSelectedEmail(null)}>
                    <ChevronDown style={{transform:'rotate(90deg)'}} className="w-6 h-6 font-bold text-black" />
                  </button>
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]" onClick={()=>{/* delete logic here */}}>
                    <Trash2 className="w-6 h-6 font-bold text-black" />
                  </button>
                </div>
                <span className="text-xs text-[#bdbdbd]">{selectedEmail.time}</span>
              </div>
              <div className="flex-1 p-8 flex flex-col gap-4 overflow-y-auto">
                <div className=" text-2xl">{selectedEmail.subject}</div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#e5e7eb] text-[#111]'}`}>{selectedEmail.sender[0].toUpperCase()}</div>
                  <span className="font-semibold">{selectedEmail.sender}</span>
                </div>
                <div className="text-base text-[#bdbdbd]">{selectedEmail.preview}</div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-[#E50914] text-white px-4 py-2 rounded-lg font-semibold">Report</button>
                  <button className="bg-[#e5e7eb] text-[#111] px-4 py-2 rounded-lg font-semibold">Archive</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  </div>
  );
}