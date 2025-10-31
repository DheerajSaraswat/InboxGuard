import React from "react";
import { Star, Archive } from "lucide-react";
import { toggleStarred } from "../apiRequests/toggleStarred";
import { toggleArchive } from "../apiRequests/toggleArchive";
import toast from "react-hot-toast";

export default function MailCards({ isDark, emails = [], setSelectedEmail, isTrashMode = false, selectedEmails = [], onSelectEmail, onEmailUpdate }) {
  
  const handleStarClick = async (e, email) => {
    e.stopPropagation();
    try {
      const result = await toggleStarred(email._id);
      if (onEmailUpdate) {
        onEmailUpdate(email._id, { starred: result.starred });
      }
      toast.success(result.starred ? "Email starred" : "Email unstarred");
    } catch (error) {
      toast.error("Failed to update starred status");
    }
  };

  const handleArchiveClick = async (e, email) => {
    e.stopPropagation();
    try {
      const result = await toggleArchive(email._id);
      if (onEmailUpdate) {
        onEmailUpdate(email._id, { archived: result.archived });
      }
      toast.success(result.archived ? "Email archived" : "Email unarchived");
    } catch (error) {
      toast.error("Failed to update archive status");
    }
  };

  return (
    <div className={`flex flex-col gap-8 py-8 px-8 ${isDark ? 'bg-transparent' : 'bg-[#F3F6FA]'}`}>
      {emails.map(email => (
        <div
          key={email._id}
          className={`rounded-3xl flex p-4 px-10 cursor-pointer transition-all duration-200 shadow-2xl hover:scale-[1.01] border-2 ${isDark ? 'bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326]' : 'bg-white border-[#e5e7eb] '} ${selectedEmails.includes(email._id) ? 'ring-2 ring-blue-500' : ''}`}
        
          onClick={() => isTrashMode ? onSelectEmail(email._id) : setSelectedEmail(email)}
        >
          <div className={`flex items-center gap-4`}>
            {isTrashMode && (
              <input
                type="checkbox"
                checked={selectedEmails.includes(email._id)}
                onChange={() => onSelectEmail(email._id)}
                className="w-4 h-4"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${isDark ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-blue-200 ' : 'bg-blue-300 text-white'} text-xl`}>
              {(email.from?.email || "?")[0].toUpperCase()}
              {isDark && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full " />}
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-base font-semibold ${isDark ? 'text-blue-200' : 'text-black'}`}>{email.from?.platformMail}</span>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'} font-sans`}>{email.subject}</span>
              <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`} style={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px'}}>{email.bodyPreview || ''}</span>
            </div>
          </div>
          <div className=" flex ml-auto flex-col gap-2">
            <div className="flex flex-col justify-between ml-auto">
              {/* Action buttons */}
              {!isTrashMode && (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={(e) => handleStarClick(e, email)}
                    className={`p-2 rounded-full transition-colors ${
                      email.starred 
                        ? 'text-yellow-500 bg-yellow-50' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                    title={email.starred ? "Unstar" : "Star"}
                  >
                    <Star size={16} fill={email.starred ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={(e) => handleArchiveClick(e, email)}
                    className={`p-2 rounded-full transition-colors ${
                      email.archived 
                        ? 'text-blue-500 bg-blue-50' 
                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                    title={email.archived ? "Unarchive" : "Archive"}
                  >
                    <Archive size={16} />
                  </button>
                </div>
              )}
              {/* Unread indicator */}
              {(!email.to?.[0]?.readAt) && (
                <span className="ml-auto bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">New</span>
              )}
              {(() => {
                const level = String(email.securityAnalysis?.riskLevel || '').toLowerCase();
                if (!level || level === 'low' || level === 'minimal' || level === 'safe') return null;
                return (
                <span className={`px-4 py-2 w-40 rounded-lg text-sm font-bold flex items-center gap-2 mb-3 shadow-lg ${
                  level === 'high' || level === 'critical'
                    ? 'bg-[#E50914] text-white'
                    : level === 'medium'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-200 text-black'
                }`}>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z' /></svg>
                  {`Risk: ${String(level).toUpperCase()}`}
                </span>
                );
              })()}
            </div>
            <div className="flex ml-auto justify-end mt-auto">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(email.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
