import React from "react";
import { ChevronDown, Trash2 } from "lucide-react";

export default function MailDetail({ email, isDark, onBack, onDelete }) {
  if (!email) return null;
  return (
    <div className={`flex-1 flex flex-col min-h-0 ${isDark ? 'bg-[#18181b]' : 'bg-white'}`} style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
      <div className={`p-6 border-b ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-400 flex items-center justify-between rounded-t-3xl shadow-lg`}>
        <div className="flex items-center gap-4">
          <button className="bg-transparent p-2 rounded-full hover:bg-[#f3f4f6] transition" onClick={onBack}>
            <ChevronDown style={{transform:'rotate(90deg)'}} className={`w-7 h-7 font-bold ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'}`} />
          </button>
          <button className="bg-transparent p-2 rounded-full hover:bg-[#fbe9ea] transition" onClick={onDelete}>
            <Trash2 className={`w-7 h-7 font-bold ${isDark ? 'text-[#E50914]' : 'text-[#E50914]'}`} />
          </button>
        </div>
        <span className="text-xs text-[#bdbdbd] font-mono tracking-wide">{new Date(email.createdAt).toLocaleString()}</span>
      </div>
      <div className="flex-1 p-10 flex flex-col gap-6 overflow-y-auto rounded-b-3xl shadow-xl" style={{background: isDark ? 'linear-gradient(135deg, #18181b 0%, #232326 100%)' : 'linear-gradient(135deg, #fafbfc 0%, #e5e7eb 100%)'}}>
        <div className="text-3xl font-extrabold text-[#E50914] drop-shadow-lg mb-2">{email.subject}</div>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${isDark ? 'bg-[#232326] text-[#f3f4f6]' : 'bg-blue-200 text-[#111]'}`}>{(email.from?.email || "?")[0].toUpperCase()}</div>
          <span className="font-semibold text-lg">{email.from?.email}</span>
        </div>
        <div className="text-lg text-black font-sans mb-6">{email.body}</div>
        <div className="flex gap-4 mt-4">
          <button className="bg-[#E50914] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#b0060f] transition">Report</button>
          <button className="bg-[#e5e7eb] text-[#111] px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#d1d5db] transition">Archive</button>
        </div>
      </div>
    </div>
  );
}
