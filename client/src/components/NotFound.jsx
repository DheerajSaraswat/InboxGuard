import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound({ isDark }) {
  const navigate = useNavigate();
  return (
    <div className={`flex flex-col items-center justify-center py-24 ${isDark ? 'text-[#f3f4f6]' : 'text-[#111]'}`}>
      <div className="text-6xl font-bold mb-4">404</div>
      <div className="text-xl mb-6">Page not found</div>
      <button
        onClick={() => navigate('/user/u0/dashboard')}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Go to Inbox
      </button>
    </div>
  );
}


