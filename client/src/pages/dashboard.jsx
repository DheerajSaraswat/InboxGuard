import {Archive,Bell,ChevronDown,
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
} from "lucide-react"

import logo from "../assets/LightThemeLogo.png"

export default function Dashboard() {

  
  return (
  <div className="flex h-screen bg-[#fafbfc] font-sans" style={{fontFamily: 'Segoe UI, Arial, sans-serif'}}>
      {/* Sidebar */}
  <div className="w-64 border-r bg-white" style={{borderColor: '#e5e7eb'}}>
        <div className="p-4">
          <img src={logo} className="pb-4"/>
          <button className="w-full mb-4 gap-2 bg-[#111] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center shadow" style={{fontSize:'1rem', letterSpacing:'0.02em'}}>
            <PenSquare className="w-4 h-4 mr-2" /> Compose
          </button>
          <nav className="space-y-1 text-[1rem]">
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-[#f3f4f6] font-semibold text-[#111]" style={{fontWeight:'500'}}>
              <Inbox className="w-4 h-4" /> Inbox <span className="ml-auto bg-[#e5e7eb] text-xs px-2 py-1 rounded-full text-[#111]">12</span>
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
              <Star className="w-4 h-4" /> Starred
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
              <Send className="w-4 h-4" /> Sent
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
              <FileText className="w-4 h-4" /> Drafts <span className="ml-auto bg-[#e5e7eb] text-xs px-2 py-1 rounded-full text-[#111]">3</span>
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
              <Archive className="w-4 h-4" /> Archive
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-[#E50914] hover:bg-[#f3f4f6] font-semibold">
              <Shield className="w-4 h-4" /> Spam <span className="ml-auto bg-[#E50914] text-white text-xs px-2 py-1 rounded-full">5</span>
            </button>
            <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
              <Trash2 className="w-4 h-4" /> Trash
            </button>
          </nav>
          <hr className="my-4 border-[#e5e7eb]" />
          <button className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f3f4f6] text-[#111]">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
  <div className="border-b p-4 bg-white" style={{borderColor: '#e5e7eb'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bdbdbd]" />
                <input placeholder="Search emails..." className="pl-10 py-2 w-full rounded-lg border bg-white text-[#111]" style={{fontSize:'1rem', fontFamily:'Segoe UI, Arial, sans-serif'}} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                <Bell className="w-4 h-4 text-[#111]" />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#111] cursor-pointer hover:bg-[#f3f4f6]">
                <User className="w-5 h-5 text-[#111]" />
                <span className="hidden md:inline" style={{fontWeight:'500'}}>john@company.com</span>
                <ChevronDown className="w-4 h-4 text-[#111]" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-80 border-r bg-white" style={{borderColor: '#e5e7eb'}}>
            <div className="p-4 border-b" style={{borderColor: '#e5e7eb'}}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Inbox</h2>
                <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                  <MoreHorizontal className="w-4 h-4 text-[#111]" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-8rem)] divide-y" style={{background:'#fafbfc'}}>
              {/* Email Item 1 */}
              
              {/* Add more email items as needed */}
            </div>
          </div>
          {/* Email Content */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 bg-white" style={{borderColor: '#e5e7eb'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e5e7eb] flex items-center justify-center font-bold text-[#111]" style={{fontSize:'1.1rem'}}>SA</div>
                  <div>
                    <h3 className="font-semibold text-[1.1rem] text-[#111]">Suspicious login attempt detected</h3>
                    <p className="text-sm text-[#bdbdbd]">from security@inboxguard.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#E50914] text-white px-3 py-1 rounded-full text-xs">Security Alert</span>
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                    <Star className="w-4 h-4 text-[#111]" />
                  </button>
                  <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6]">
                    <MoreHorizontal className="w-4 h-4 text-[#111]" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-[#bdbdbd]">Today at 2:34 PM</div>
            </div>
          
          </div>
        </div>
      </div>
  </div>
  );
}