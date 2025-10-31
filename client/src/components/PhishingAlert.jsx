import React from "react";

const PhishingAlert = ({ scanResult, onReview, onSendAnyway }) => {
  const level = String(scanResult?.riskLevel || '').toLowerCase();
  const isHigh = level === 'high' || level === 'critical';
  const isMedium = level === 'medium';
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
      <div className={`relative rounded-3xl shadow-2xl max-w-2xl w-full p-8 border ${isHigh ? 'bg-[#1b0f10] border-red-500' : 'bg-[#13161b] border-yellow-400'} backdrop-blur-xl`}>
        <div className="flex items-center gap-4 mb-8">
          <span className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${isHigh ? 'bg-red-600' : 'bg-yellow-400'} text-white shadow-2xl`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
          </span>
          <h2 className={`text-2xl font-extrabold tracking-tight drop-shadow-lg ${isHigh ? 'text-red-400' : 'text-yellow-300'}`}>{isHigh ? 'High Risk Detected' : 'Potential Risk Detected'}</h2>
        </div>
        <p className="mb-4 text-base text-gray-200">We found suspicious patterns in your email. Review the details below before sending.</p>
        <div className="mt-2 space-y-2 text-lg">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Risk Level:</span>
            <span className={`px-3 py-1 rounded-lg font-bold text-sm shadow ${isHigh ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'}`}>{level.toUpperCase()}</span>
          </div>
          <div className="font-semibold mt-4 text-white">Indicators:</div>
          <ul className="list-disc list-inside text-gray-200 max-h-48 overflow-y-auto pl-4 pr-2">
            {scanResult.indicators.map((ind, i) => (
              <li key={i} className="mb-2 text-lg font-medium">{ind.description}</li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onReview}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-900 font-semibold shadow hover:bg-gray-300 transition border border-gray-300 text-sm"
          >
            Review
          </button>
          <button
            onClick={onSendAnyway}
            className={`px-6 py-2 rounded-lg text-white font-semibold shadow border ${isHigh ? 'bg-red-600 hover:bg-red-700 border-red-500' : 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400'} text-sm`}
          >
            Send Anyway
          </button>
        </div>
        <div className="absolute top-4 right-6 text-xs text-gray-400 font-mono tracking-wide">InboxGuard AI</div>
      </div>
    </div>
  );
};

export default PhishingAlert;
