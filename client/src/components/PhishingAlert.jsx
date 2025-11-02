import React from "react";
import { Shield, AlertTriangle, X } from "lucide-react";

const PhishingAlert = ({ scanResult, onReview, onSendAnyway }) => {
  const level = String(scanResult?.riskLevel || '').toLowerCase();
  const isHigh = level === 'high' || level === 'critical';
  const isMedium = level === 'medium';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
      <div className={`relative rounded-2xl shadow-2xl max-w-lg w-full p-6 border ${isHigh ? 'bg-white border-red-200' : 'bg-white border-orange-200'} transition-all`}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isHigh ? 'bg-red-50' : 'bg-orange-50'}`}>
            <Shield className={`w-6 h-6 ${isHigh ? 'text-red-600' : 'text-orange-600'}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-semibold mb-1 ${isHigh ? 'text-red-900' : 'text-orange-900'}`}>
              {isHigh ? 'Security Warning' : 'Caution'}
            </h2>
            <p className="text-sm text-gray-600">
              Our security system detected potential risks in this email.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg ${isHigh ? 'bg-red-50 border border-red-100' : 'bg-orange-50 border border-orange-100'}`}>
            <p className={`text-sm leading-relaxed ${isHigh ? 'text-red-800' : 'text-orange-800'}`}>
              This email contains content that may be suspicious. We recommend reviewing it carefully before sending.
              {isHigh && (
                <span className="block mt-2 font-medium">
                  High-risk content detected. Please verify all links and sender information.
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Risk Level:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHigh 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {level.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onReview}
            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors text-sm"
          >
            Review Email
          </button>
          <button
            onClick={onSendAnyway}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors text-sm ${
              isHigh
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Send Anyway
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Protected by InboxGuard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhishingAlert;
