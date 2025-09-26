import React from "react";

const PhishingAlert = ({ scanResult, onReview, onSendAnyway }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
          ⚠️ Potential Phishing Detected
        </h2>

        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          We found suspicious patterns in your email. Sending it could be risky.
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-semibold">Risk Level:</span>{" "}
            <span
              className={
                scanResult.riskLevel === "high"
                  ? "text-red-600"
                  : scanResult.riskLevel === "medium"
                  ? "text-yellow-600"
                  : "text-gray-600"
              }
            >
              {scanResult.riskLevel.toUpperCase()}
            </span>
          </p>
          <p className="font-semibold">Indicators:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
            {scanResult.indicators.map((ind, i) => (
              <li key={i}>{ind.description}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onReview}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Review
          </button>
          <button
            onClick={onSendAnyway}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Send Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhishingAlert;
