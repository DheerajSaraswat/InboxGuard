import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Reply,
  Forward,
  Star,
} from "lucide-react";

export default function MailDetail({ email, onBack, onDelete, isDark }) {
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const navigate = useNavigate();
  console.log(email);
  if (!email) return null;

  const handleReply = () => {
    const originalSubject = email.subject || '';
    const replySubject = originalSubject.startsWith('Re: ') ? originalSubject : `Re: ${originalSubject}`;
    const recipientEmail = email.from?.email || '';
    
    // Create reply content with quoted original message
    const replyContent = `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="color: #666; font-size: 12px; margin-bottom: 10px;">
        On ${new Date(email.createdAt).toLocaleString()}, ${email.from?.email} wrote:
      </p>
      <blockquote style="margin: 0; padding-left: 15px; border-left: 3px solid #e0e0e0; color: #666;">
        ${email.body}
      </blockquote>
    </div>`;
    
    navigate(`/user/u0/compose?reply=true&to=${encodeURIComponent(recipientEmail)}&subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyContent)}&emailId=${email._id}`);
  };

  const handleForward = () => {
    const originalSubject = email.subject || '';
    const forwardSubject = originalSubject.startsWith('Fwd: ') ? originalSubject : `Fwd: ${originalSubject}`;
    
    // Create forward content with original message
    const forwardContent = `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="color: #666; font-size: 12px; margin-bottom: 10px;">
        ---------- Forwarded message ---------<br/>
        From: ${email.from?.email || 'Unknown'}<br/>
        Date: ${new Date(email.createdAt).toLocaleString()}<br/>
        Subject: ${email.subject || 'No Subject'}<br/>
        To: ${email.to?.map(t => t.user?.email || t.email).join(', ') || 'Unknown'}
      </p>
      <div style="margin-top: 10px;">
        ${email.body}
      </div>
    </div>`;
    
    navigate(`/user/u0/compose?forward=true&subject=${encodeURIComponent(forwardSubject)}&body=${encodeURIComponent(forwardContent)}&emailId=${email._id}`);
  };

  return (
    <div
      className={`flex-1 flex flex-col min-h-0 overflow-hidden ${
        isDark ? "bg-[#18181b]" : "bg-white"
      } border-l border-gray-200`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          isDark ? "border-[#2E2E2E]" : "border-gray-200"
        } p-4`}
      >
          {(() => {
            const level = String(email?.securityAnalysis?.riskLevel || '').toLowerCase();
            if (!level || level === 'low' || level === 'minimal' || level === 'safe') return null;
            return (
              <div className={`mb-2 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                level === 'high' || level === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'
              }`}>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z' /></svg>
                {`Security Risk: ${level.toUpperCase()}`}
              </div>
            );
          })()}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReply}
                className={`p-2 rounded-md transition ${
                  isDark ? "hover:bg-[#232326]" : "hover:bg-gray-100"
                }`}
                title="Reply"
              >
                <Reply className={`w-4 h-4 ${isDark ? "text-[#f3f4f6]" : "text-[#111]"}`} />
              </button>
              <button
                onClick={handleForward}
                className={`p-2 rounded-md transition ${
                  isDark ? "hover:bg-[#232326]" : "hover:bg-gray-100"
                }`}
                title="Forward"
              >
                <Forward className={`w-4 h-4 ${isDark ? "text-[#f3f4f6]" : "text-[#111]"}`} />
              </button>
              <button
                className={`p-2 rounded-md transition ${
                  isDark ? "hover:bg-[#232326]" : "hover:bg-gray-100"
                }`}
              >
                <Star
                  className={
                    email.isStarred
                      ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                      : `w-4 h-4 ${isDark ? "text-[#f3f4f6]" : "text-[#111]"}`
                  }
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className={`p-2 rounded-md transition ${
                  isDark
                    ? "hover:bg-red-900/20 text-red-400"
                    : "hover:bg-red-50 text-red-600"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onBack}
                className={`p-1.5 rounded-md transition ${
                  isDark ? "hover:bg-[#232326]" : "hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Subject */}
        <h1
          className={`text-xl font-semibold mb-3 ${
            isDark ? "text-[#f3f4f6]" : "text-[#111]"
          }`}
        >
          {email.subject}
        </h1>

        {/* Sender Info */}
        <div className="flex items-center gap-3">
          <img
            src={email.from?.displayImage}
            alt={email.from?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div
              className={`font-medium text-sm ${
                isDark ? "text-[#f3f4f6]" : "text-[#111]"
              }`}
            >
              {email.from?.email}
            </div>
            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {new Date(email.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className={`prose prose-sm max-w-none leading-relaxed text-sm ${
            isDark ? "text-[#f3f4f6]" : "text-[#111]"
          }`}
          dangerouslySetInnerHTML={{ __html: email.body }}
        />

        {/* Attachments */}
        {Array.isArray(email.attachments) && email.attachments.length > 0 && (
          <div
            className={`mt-6 border-t pt-4 ${
              isDark ? "border-[#2E2E2E]" : "border-gray-200"
            }`}
          >
            <div
              className={`text-sm font-semibold mb-3 ${
                isDark ? "text-[#f3f4f6]" : "text-[#111]"
              }`}
            >
              Attachments ({email.attachments.length})
            </div>
              <div className="grid grid-cols-1 gap-3">
                {email.attachments.map((att, idx) => {
                  const url = att.cloudinaryUrl || att.url;
                  const type = String(att.mimeType || '').toLowerCase();
                  const isImage = type.startsWith('image/');
                  const isVideo = type.startsWith('video/');
                  const name = att.fileName || att.originalName || `file-${idx+1}`;
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3 flex items-center gap-3 ${
                        isDark
                          ? "border-[#2E2E2E] bg-[#232326]"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {isImage ? (
                        <button onClick={() => setPreviewAttachment({ ...att, url })} className="shrink-0">
                          <img src={url} alt={name} className="w-16 h-16 object-cover rounded" crossOrigin="anonymous" />
                        </button>
                      ) : isVideo ? (
                        <button onClick={() => setPreviewAttachment({ ...att, url })} className="shrink-0">
                          <video className="w-24 h-16 rounded" src={url} crossOrigin="anonymous" />
                        </button>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded flex items-center justify-center text-xs font-semibold ${
                            isDark
                              ? "bg-[#232326] text-[#f3f4f6]"
                              : "bg-gray-200 text-[#111]"
                          }`}
                        >
                          FILE
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium truncate ${
                            isDark ? "text-[#f3f4f6]" : "text-[#111]"
                          }`}
                        >
                          {name}
                        </div>
                        {att.fileSize || att.originalSize ? (
                          <div
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {Math.round(
                              ((att.fileSize || att.originalSize) / 1024) || 0
                            )}{" "}
                            KB
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {(isImage || isVideo) && (
                          <button
                            onClick={() =>
                              setPreviewAttachment({ ...att, url })
                            }
                            className={`text-xs px-3 py-1.5 rounded transition ${
                              isDark
                                ? "bg-[#18181b] hover:bg-[#232326] text-[#f3f4f6] border-[#2E2E2E]"
                                : "bg-gray-100 hover:bg-gray-200 text-[#111] border-gray-300"
                            } border`}
                          >
                            Preview
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const apiUrl = `/emails/${email._id}/attachments/${idx}/download`;
                              const res = await fetch(
                                (
                                  window.__API_BASE__ ||
                                  import.meta.env.VITE_API_BASE_URL ||
                                  ""
                                ).replace(/\/$/, "") + apiUrl,
                                {
                                  credentials: "include",
                                }
                              );
                              if (!res.ok) throw new Error("download failed");
                              const blob = await res.blob();
                              const a = document.createElement("a");
                              const objectUrl = URL.createObjectURL(blob);
                              a.href = objectUrl;
                              a.download = name;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(objectUrl);
                            } catch (e) {}
                          }}
                          className="text-xs px-3 py-1.5 rounded bg-[#E50914] text-white hover:bg-[#c40812] transition border border-[#E50914]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      {/* Attachment preview modal */}
      {previewAttachment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div
            className={`relative rounded-xl shadow-2xl p-2 max-w-[90vw] max-h-[85vh] ${
              isDark ? "bg-[#18181b]" : "bg-white"
            }`}
          >
              <button
                onClick={() => setPreviewAttachment(null)}
                className="absolute -top-10 right-0 text-white text-sm px-3 py-1 rounded bg-black/50"
              >
                Close
              </button>
              {String(previewAttachment.mimeType || '').toLowerCase().startsWith('image/') ? (
                <img src={previewAttachment.cloudinaryUrl || previewAttachment.url} alt={previewAttachment.fileName || previewAttachment.originalName}
                     className="max-w-[85vw] max-h-[80vh] object-contain" crossOrigin="anonymous" />
              ) : String(previewAttachment.mimeType || '').toLowerCase().startsWith('video/') ? (
                <video src={previewAttachment.cloudinaryUrl || previewAttachment.url} controls className="max-w-[85vw] max-h-[80vh]" crossOrigin="anonymous" />
              ) : (
                <div className="p-4 text-sm">Preview not available. Use Download instead.</div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

