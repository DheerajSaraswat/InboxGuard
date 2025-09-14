import {
  Archive,
  Bell,
  ChevronDown,
  FileText,
  Inbox,
  MoreHorizontal,
  PenSquare,
  Search,
  Send,
  Settings,
  Shield,
  Star,
  Trash2,
  User,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react"

import React from "react";
import logo from "../assets/LightThemeLogo.png"
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout } from "../common/firebase";

export default function Dashboard() {
  // State for selected email
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';
  const {user} = useAuth();
  const navigate = useNavigate();

  console.log(user);

  const handleLogOut = async(e) => {
      e.preventDefault();
    try{
      console.log("Logging out...");
      await logout();
      toast.success("Logged out successfully");
      navigate("/signin");
      console.log("Logged out");
    }catch(error){
      toast.error("Error logging out");
    }
    
  }

  // Tailwind dark mode: add/remove 'dark' class on html element
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return (
  <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#fafbfc] text-[#111]'}`} style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
            {/* Sidebar */}
        <div className={`w-64  ${isDark ? 'bg-[#232326]' : 'bg-gray-50'}`}>
        <div className="p-4">
          <img src={logo} className={`pb-4 ${isDark ? 'invert' : ''}`} />
          <button className={`w-full mb-6 gap-2 ${isDark ? 'bg-[#232326] text-[#f3f4f6]' : 'bg-blue-600 text-white'} py-3 px-4 rounded-lg font-semibold flex items-center justify-center shadow`} style={{fontSize:'1rem', letterSpacing:'0.02em'}}>
            <PenSquare className="w-5 h-5 mr-2" /> Compose
          </button>
          <nav className="flex flex-col gap-3 text-[1rem]">
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'bg-[#232326] text-[#f3f4f6]' : 'bg-gray-200 text-[#111]'} font-semibold`}>
              <Inbox className="w-4 h-4" /> Inbox <span className={`ml-auto ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#e5e7eb] text-[#111]'} text-xs px-2 py-1 rounded-full`}></span>
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:${isDark ? 'bg-[#232326]' : 'bg-[#f3f4f6]'} ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'} font-normal`}>
              <Star className="w-4 h-4" /> Starred
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'hover:bg-[#232326] text-[#f3f4f6]' : 'hover:bg-[#f3f4f6] text-[#111]'}`}> 
              <Send className="w-4 h-4" /> Sent
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'hover:bg-[#232326] text-[#f3f4f6]' : 'hover:bg-[#f3f4f6] text-[#111]'}`}> 
              <FileText className="w-4 h-4" /> Drafts <span className="ml-auto bg-[#e5e7eb] text-xs px-2 py-1 rounded-full text-[#111]"></span>
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'hover:bg-[#232326] text-[#f3f4f6]' : 'hover:bg-[#f3f4f6] text-[#111]'}`}> 
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'text-[#E50914] hover:bg-[#232326]' : 'text-[#E50914] hover:bg-[#f3f4f6]'} font-semibold`}> 
              <Shield className="w-4 h-4" /> Spam <span className="ml-auto bg-[#E50914] text-white text-xs px-2 py-1 rounded-full"></span>
            </button>
            <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg ${isDark ? 'hover:bg-[#232326] text-[#f3f4f6]' : 'hover:bg-[#f3f4f6] text-[#111]'}`}> 
              <Trash2 className="w-4 h-4" /> Trash
            </button>
          </nav>
          <hr className={`my-4 ${isDark ? 'border-[#232326]' : 'border-gray-400'}`} />
          <button className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:${isDark ? 'bg-[#232326]' : 'bg-[#f3f4f6]'} ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'} font-normal`}>
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
              <button className={`bg-transparent p-2 rounded-full hover:${isDark ? 'bg-[#232326]' : 'bg-[#f3f4f6]'} ${isDark ? 'text-yellow-400' : 'text-[#111]'}`} onClick={()=>setTheme(isDark?'light':'dark')} title={isDark?'Switch to light mode':'Switch to dark mode'}>
                {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#111]" />}
              </button>
              <div className={`relative flex items-center gap-1 px-3 py-2 rounded-lg ${isDark ? 'text-[#f3f4f6] bg-[#232326]' : 'text-[#111] '} cursor-pointer`} tabIndex={0} onClick={() => setShowDropdown(v => !v)} onBlur={() => setShowDropdown(false)}>
                <img src={user.photoURL} className={`w-8 h-8 ${isDark ? 'text-[#f3f4f6] bg-[#232326]' : 'text-[#111] bg-[#e5e7eb]'} rounded-full p-1`} />
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
        <div className="flex-1 flex border-l  border-gray-200">
          {/* Gmail-style: Inbox full width if no email selected, else split view */}
          {!selectedEmail ? (
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#18181b]' : 'bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-bold">Inbox</h2>
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                    <MoreHorizontal className="w-4 h-4 text-[#111]" />
                  </button>
                </div>
              </div>
              <div className={`overflow-y-auto h-[calc(100vh-8rem)] ${isDark ? 'bg-[#18181b]' : 'bg-[#fafbfc]'}`}>
                {/* Example Email Items as cards */}
                <div className="flex flex-col gap-8 py-8 px-8 bg-[#F3F6FA]">
                {[{
                  id: 1,
                  sender: 'security@inboxguard.com',
                  subject: 'Suspicious login attempt detected',
                  time: 'Today, 2:34 PM',
                  preview: 'We detected to suspicious login attempt from an unknown device.',
                  important: true,
                }, {
                  id: 2,
                  sender: 'noreply@github.com',
                  subject: 'Welcome to InboxGuard!',
                  time: 'Yesterday',
                  preview: 'Thank with o signing supp...',
                  important: false,
                }].map(email => (
                  <div key={email.id} className="bg-white rounded-3xl shadow-xl flex p-4 px-10 cursor-pointer transition hover:shadow-2xl"  onClick={() => setSelectedEmail(email)}>
                    
                   

                    <div className="flex items-center gap-4 ">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold bg-blue-300 text-white text-xl">{email.sender[0].toUpperCase()}</div>
                      
                      <div className="flex flex-col gap-1">
                        
                        <span className="text-base font-semibold text-black">{email.sender}</span>
                        <span className="font-bold text-xl text-black">{email.subject}</span>
                        <span className="text-base text-gray-500">
                          {email.preview}
                        </span>
                      </div>
                    </div>
                    <div className=" flex ml-auto flex-col gap-2">
                      <div className="flex flex-col justify-between ml-auto">
                       {email.important && (
                      <span className="bg-[#E50914] text-white px-4 py-2 w-40 rounded-lg text-sm font-bold flex items-center gap-2 mb-3">
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z' /></svg>
                        Security Alert
                      </span>
                    )}

                    </div>

                    
                          <div className="flex ml-auto justify-end  mt-auto">
                          <span className="text-sm text-gray-500">{email.time}</span>
                          </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#18181b]' : 'bg-white'}`}>
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
              <div className="p-8 flex flex-col gap-4">
                <h2 className="font-bold text-2xl">{selectedEmail.subject}</h2>
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