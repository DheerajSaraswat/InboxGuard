import React from "react";

const PhishingAlert = ({ scanResult, onReview, onSendAnyway }) => {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] bg-opacity-95 flex items-center justify-center z-50" style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
      <div className="relative bg-gradient-to-br from-[#18181b] via-[#232326] to-[#0A0A0A] dark:from-[#232326] dark:via-[#18181b] dark:to-[#232326] rounded-3xl shadow-2xl max-w-3xl w-full p-12 border-2 border-[#E50914] backdrop-blur-xl" style={{ boxShadow: "0 0 40px 8px #E50914aa, 0 1.5px 0 0 #E50914 inset", fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
        <div className="flex items-center gap-4 mb-8">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E50914] text-white shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
          </span>
          <h2 className="text-4xl font-extrabold text-[#E50914] tracking-tight drop-shadow-lg">Potential Phishing Detected</h2>
        </div>
        <p className="mb-4 text-xl text-white font-semibold">We found suspicious patterns in your email. Sending it could be risky.</p>
        <div className="mt-2 space-y-2 text-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Risk Level:</span>
            <span className={`px-4 py-2 rounded-xl font-bold text-base shadow-lg ${scanResult.riskLevel === 'high' ? 'bg-[#E50914] text-white' : scanResult.riskLevel === 'medium' ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-800'}`}>{scanResult.riskLevel.toUpperCase()}</span>
          </div>
          <div className="font-semibold mt-4 text-white">Indicators:</div>
          <ul className="list-disc list-inside text-gray-200 max-h-40 overflow-y-auto pl-4">
            {scanResult.indicators.map((ind, i) => (
              <li key={i} className="mb-2 text-lg font-medium">{ind.description}</li>
            ))}
          </ul>
        </div>
        <div className="mt-12 flex justify-end gap-6">
          <button
            onClick={onReview}
            className="px-8 py-3 rounded-xl bg-gray-200 text-gray-900 font-bold shadow-lg hover:bg-gray-300 transition border border-gray-300 text-lg"
          >
            Review
          </button>
          <button
            onClick={onSendAnyway}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-red-700 text-white font-extrabold shadow-xl border-2 border-[#E50914] hover:scale-105 transition text-lg"
          >
            Send Anyway
          </button>
        </div>
        <div className="absolute top-4 right-8 text-xs text-gray-400 font-mono tracking-wide">InboxGuard AI</div>
      </div>
    </div>
  );
};

export default PhishingAlert;
