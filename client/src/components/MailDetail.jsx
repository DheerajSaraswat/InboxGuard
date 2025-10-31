import React, { useCallback, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getLocalPrivateKey, rsaDecryptBase64, importAesKeyFromRaw } from "../utils/crypto";
import {
  ChevronDown,
  Trash2,
  ArrowLeft,
  Reply,
  Forward,
  Star,
} from "lucide-react";

export default function MailDetail({ email, onBack, onDelete }) {
  const [isClosing, setIsClosing] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  console.log(email);
  if (!email) return null;

  // Handle close with slide-out animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onBack();
      setIsClosing(false);
    }, 300); // matches CSS animation duration
  };

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50">
      {/* Click outside to close */}
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-transparent"
        aria-label="close overlay"
      ></button>

      {/* Mail container - Gmail style from bottom right */}
      <div
        className={`fixed bottom-4 right-4 w-[400px] h-[600px] sm:w-[450px] sm:h-[650px] md:w-[500px] md:h-[700px] bg-card shadow-2xl border border-border flex flex-col rounded-2xl 
        transform transition-all duration-300 ease-out overflow-hidden
        ${isClosing ? "animate-slideOutToBottom" : "animate-slideInFromBottom"}`}
        style={{ maxHeight: "calc(100vh - 2rem)", maxWidth: "calc(100vw - 2rem)" }}
      >
        {/* Header */}
        <div className="border-b border-border p-3">
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
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Reply className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Forward className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Star
                  className={
                    email.isStarred
                      ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                      : "w-4 h-4"
                  }
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-muted transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject */}
          <h1 className="text-lg font-semibold mb-2 truncate">{email.subject}</h1>

          {/* Sender Info */}
          <div className="flex items-center gap-2">
            <img
              src={email.from?.displayImage}
              alt={email.from?.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{email.from?.email}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(email.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className="prose prose-sm max-w-none text-foreground leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          {/* Attachments */}
          {Array.isArray(email.attachments) && email.attachments.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <div className="text-xs font-semibold mb-2">Attachments ({email.attachments.length})</div>
              <div className="grid grid-cols-1 gap-3">
                {email.attachments.map((att, idx) => {
                  const url = att.cloudinaryUrl || att.url;
                  const type = String(att.mimeType || '').toLowerCase();
                  const isImage = type.startsWith('image/');
                  const isVideo = type.startsWith('video/');
                  const name = att.fileName || att.originalName || `file-${idx+1}`;
                  return (
                    <div key={idx} className="border rounded-lg p-2 flex items-center gap-3">
                      {isImage ? (
                        <button onClick={() => setPreviewAttachment({ ...att, url })} className="shrink-0">
                          <img src={url} alt={name} className="w-16 h-16 object-cover rounded" crossOrigin="anonymous" />
                        </button>
                      ) : isVideo ? (
                        <button onClick={() => setPreviewAttachment({ ...att, url })} className="shrink-0">
                          <video className="w-24 h-16 rounded" src={url} crossOrigin="anonymous" />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-semibold">FILE</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{name}</div>
                        {att.fileSize || att.originalSize ? (
                          <div className="text-[10px] text-muted-foreground">{Math.round(((att.fileSize||att.originalSize)/1024) || 0)} KB</div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {(isImage || isVideo) && (
                          <button onClick={() => setPreviewAttachment({ ...att, url })} className="text-xs px-2 py-1 rounded bg-muted border">Preview</button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const apiUrl = `/emails/${email._id}/attachments/${idx}/download`;
                              const res = await fetch((window.__API_BASE__ || import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "") + apiUrl, {
                                credentials: 'include'
                              });
                              if (!res.ok) throw new Error('download failed');
                              const blob = await res.blob();
                              const a = document.createElement('a');
                              const objectUrl = URL.createObjectURL(blob);
                              a.href = objectUrl;
                              a.download = name;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(objectUrl);
                            } catch (e) {}
                          }}
                          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground border"
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
            <div className="relative bg-background rounded-xl shadow-2xl p-2 max-w-[90vw] max-h-[85vh]">
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
    </div>
  );
}

