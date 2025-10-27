import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeDraft } from "../redux/slices/draftSlice";
import Sidebar from "../components/Sidebar";
import { useSelector as useReduxSelector } from "react-redux";
import { showEmailLists } from "../apiRequests/showEmailLists";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useReduxSelector(state => state.theme.mode);
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchDrafts = async () => {
      try {
        setIsLoading(true);
        const auth = getAuth();
        await auth.currentUser?.getIdToken(true);
        const list = await showEmailLists("drafts");
        setDrafts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load drafts:", e);
        toast.error("Failed to load drafts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className={`flex min-h-screen h-screen items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#18181b] text-[#f3f4f6]' : 'bg-[#fafbfc] text-[#111]'} font-sans`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-current border-t-transparent" />
          <span className="text-lg font-medium">Loading drafts…</span>
        </div>
      </div>
    );
  }

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
              {drafts.map((draft) => (
                <div
                  key={draft._id}
                  className={`rounded-3xl flex p-4 px-10 cursor-pointer transition-all duration-200 shadow-2xl hover:scale-[1.01] border-2 ${isDark ? 'bg-gradient-to-br from-[#232326]/90 via-[#18181b]/90 to-[#232326]/80 border-[#232326] backdrop-blur-[2px]' : 'bg-white border-[#e5e7eb] '}`}
                  onClick={() => navigate(`/user/u0/compose?draft=${draft._id}`)}
                >
                  <div className={`flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${isDark ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-blue-200 ' : 'bg-blue-300 text-white'} text-xl`}>
                      {draft.to && draft.to[0] ? draft.to[0].user?.email?.[0]?.toUpperCase() || 'D' : 'D'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-base font-semibold ${isDark ? 'text-blue-200' : 'text-black'}`}>{draft.to && draft.to[0] ? draft.to[0].user?.email || '(Draft)' : '(Draft)'}</span>
                      <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'} font-sans`}>{draft.subject || "(No Subject)"}</span>
                      <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{draft.bodyPreview ? draft.bodyPreview.slice(0, 80) : ''}{draft.bodyPreview && draft.bodyPreview.length > 80 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="flex ml-auto flex-col gap-2">
                    <div className="flex flex-col justify-between ml-auto">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(draft.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex ml-auto justify-end mt-auto gap-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={e => {e.stopPropagation(); navigate(`/user/u0/compose?draft=${draft._id}`);}}>Edit</button>
                      <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={e => {e.stopPropagation(); /* TODO: delete draft */}}>Delete</button>
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
