import React from 'react';
import { X } from 'lucide-react';
import { getEmailById } from '../apiRequests/getEmailById';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function EmailModal({ emailId, isOpen, onClose, isDark }) {
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && emailId) {
      fetchEmail();
    }
  }, [isOpen, emailId]);

  const fetchEmail = async () => {
    try {
      setIsLoading(true);
      const data = await getEmailById(emailId);
      setEmail(data);
    } catch (error) {
      console.error('Error fetching email:', error);
      toast.error('Failed to load email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-[#1A1A1A]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#2E2E2E]' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isLoading ? 'Loading...' : email?.subject || 'Email'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-[#2E2E2E]' : ''}`}
          >
            <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : email ? (
            <div className="p-6 space-y-6">
              {/* From/To Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>From:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {email.from?.email || email.from?.platformMail || 'Unknown'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To:</span>
                  <div className="flex flex-wrap gap-2">
                    {email.to?.map((recipient, index) => (
                      <span key={index} className={`px-3 py-1 rounded-lg ${isDark ? 'bg-[#2E2E2E] text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {recipient.user?.email || recipient.user?.platformMail || 'Unknown'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                    {new Date(email.createdAt).toLocaleString()}
                  </span>
                  {email.securityAnalysis && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      email.securityAnalysis.riskLevel === 'high' || email.securityAnalysis.riskLevel === 'critical'
                        ? 'bg-[#E50914] text-white'
                        : email.securityAnalysis.riskLevel === 'medium'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-gray-300 text-black'
                    }`}>
                      Risk: {String(email.securityAnalysis.riskLevel).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Body */}
              <div 
                className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}
                dangerouslySetInnerHTML={{ __html: email.body || '' }}
              />
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No email content available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-[#2E2E2E]' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isDark 
                ? 'bg-[#2E2E2E] text-white hover:bg-[#333]' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

