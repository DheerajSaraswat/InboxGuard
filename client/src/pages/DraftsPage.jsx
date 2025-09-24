import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeDraft } from "../redux/slices/draftSlice";
import Sidebar from "../components/Sidebar";
import { useSelector as useReduxSelector } from "react-redux";

export default function DraftsPage() {
  const drafts = useSelector(state => state.draft.drafts);
  const theme = useReduxSelector(state => state.theme.mode);
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const [selectedDraft, setSelectedDraft] = useState(null);

  return (
    <div className={`flex min-h-screen h-screen transition-colors duration-300 ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#fafbfc] text-[#111]'} font-sans`}>
      <Sidebar isDark={isDark} />
      <div className="flex-1 flex flex-col min-h-0">
        <div className={`border-b px-2 sm:px-4 py-2 sm:py-4 ${isDark ? 'bg-[#232326]' : 'bg-white'} border-gray-200 sticky top-0 z-20`}>
          <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
        </div>
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-gradient-to-b from-[#18181b] via-[#232326] to-[#18181b]' : 'bg-[#F3F6FA]'} p-8`}>
          {drafts.length === 0 ? (
            <div className="text-gray-500">No drafts saved.</div>
          ) : (
            <div className="flex flex-col gap-8">
              {drafts.map((draft, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl flex p-4 px-10 cursor-pointer transition-all duration-200 shadow-2xl hover:scale-[1.01] border-2 ${isDark ? 'bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326] backdrop-blur-[2px]' : 'bg-white border-[#e5e7eb] '}`}
                  onClick={() => setSelectedDraft(idx)}
                >
                  <div className={`flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${isDark ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-blue-200 ' : 'bg-blue-300 text-white'} text-xl`}>
                      {draft.recipients && draft.recipients[0] ? draft.recipients[0][0].toUpperCase() : 'D'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-base font-semibold ${isDark ? 'text-blue-200' : 'text-black'}`}>{draft.recipients && draft.recipients[0] ? draft.recipients[0] : '(Draft)'}</span>
                      <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'} font-sans`}>{draft.subject || "(No Subject)"}</span>
                      <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{draft.content.slice(0, 80)}{draft.content.length > 80 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="flex ml-auto flex-col gap-2">
                    <div className="flex flex-col justify-between ml-auto">
                      {/* You can add draft status or tags here */}
                    </div>
                    <div className="flex ml-auto justify-end mt-auto gap-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={e => {e.stopPropagation(); /* TODO: open in compose */}}>Edit</button>
                      <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={e => {e.stopPropagation(); dispatch(removeDraft(idx));}}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
